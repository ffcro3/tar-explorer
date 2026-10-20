"""Cria e usa um indice de um .tar.gz do Drive, sem baixar o arquivo nem altera-lo.

Uma unica passada em streaming gera um .zip pequeno com:
  - members.json.gz : tabela [caminho, tamanho, e_pasta, offset_dos_dados] de cada membro do tar
  - index.gzidx     : checkpoints do gzip (rapidgzip), que permitem pular para o meio do arquivo
  - meta.json       : resumo (nome, tamanho, quantidade de membros)
O .zip e salvo em --index-dir (local de sua escolha) e enviado ao Drive, na mesma pasta do
.tar.gz, como "<nome>.tgzindex.zip". O .tar.gz original nunca e modificado.

Uso (a interface web faz tudo isso; o CLI e opcional):
  python tgz_index.py build <ID_OU_URL> [--index-dir D:\\indices] [--no-upload] [--spacing-mb 32]
  python tgz_index.py bench <ID_OU_URL>      # mede a melhor velocidade de download
  python tgz_index.py info  <ID_OU_URL> [--index-dir D:\\indices]
"""
import argparse
import datetime
import gzip
import io
import json
import os
import posixpath
import re
import sys
import tarfile
import threading
import time
import zipfile

import rapidgzip  # 64-bit (indexed_gzip falha no Windows com arquivos >= 2 GiB)

from gdrive_targz_stream import API, DriveStream, get_session, parse_file_id

SUFFIX = ".tgzindex.zip"
DEFAULT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
UPLOAD = "https://www.googleapis.com/upload/drive/v3/files"
BENCH_GRID = [(c, a) for c in (8, 16, 32) for a in (2, 4, 8, 12, 16)]


def index_dir(custom=None):
    """Pasta local dos indices: argumento > variavel TGZ_INDEX_DIR > ./cache."""
    return os.path.abspath(custom or os.environ.get("TGZ_INDEX_DIR") or DEFAULT_DIR)


def local_path(fid, custom=None):
    return os.path.join(index_dir(custom), f"{fid}{SUFFIX}")


def fmt(n):
    for u in ("B", "KB", "MB", "GB", "TB"):
        if n < 1024 or u == "TB":
            return f"{n:.1f} {u}"
        n /= 1024


def natural_key(name):
    """Ordem natural: nota_2 vem antes de nota_17."""
    return [(0, int(t), "") if t.isdigit() else (1, 0, t) for t in re.split(r"(\d+)", name.lower()) if t]


def norm_path(name):
    """Normaliza o caminho de um membro do tar. Preserva pontos de arquivos ocultos (.config)."""
    p = posixpath.normpath(name.replace("\\", "/"))
    if p in (".", "/"):
        return ""
    while p.startswith("./"):
        p = p[2:]
    return p.lstrip("/")


# ---------------------------------------------------------------- construir
class Cancelled(Exception):
    pass


def build(session, fid, dest_dir=None, spacing_mb=32, upload=True, log=print,
          progress=None, cancel=None):
    raw = DriveStream(session, fid)
    igz = rapidgzip.RapidgzipFile(raw, parallelization=1, chunk_size=spacing_mb << 20)
    members, done = [], threading.Event()
    t0 = time.time()

    def reporter():
        while not done.wait(2):
            if cancel is not None and cancel.is_set():
                raw.close()  # derruba a leitura em andamento
                return
            got, el = raw.bytes_fetched, time.time() - t0
            rate = got / max(el, 1)
            eta = (raw.size - got) / rate if rate else 0
            if progress:
                progress({"got": got, "size": raw.size, "rate": rate, "eta": eta, "members": len(members)})
            else:
                log(f"{100 * got / raw.size:5.1f}%  {fmt(got)}/{fmt(raw.size)}  {fmt(rate)}/s  "
                    f"faltam ~{eta / 60:.0f} min  {len(members)} membros")

    threading.Thread(target=reporter, daemon=True).start()
    try:
        with tarfile.open(fileobj=igz, mode="r|") as tar:  # tar puro sobre o gzip indexado
            for m in tar:
                members.append([m.name, m.size, int(m.isdir()), m.offset_data])
                if cancel is not None and cancel.is_set():
                    raise Cancelled()
        while igz.read(64 << 20):  # le o rabo do arquivo (padding apos o fim do tar) p/ o indice ficar completo
            if cancel is not None and cancel.is_set():
                raise Cancelled()
        idx = io.BytesIO()
        igz.export_index(idx)
    except Exception:
        if cancel is not None and cancel.is_set():
            raise Cancelled()
        raise
    finally:
        done.set()
        try:
            igz.close()
        finally:
            raw.close()

    meta = {"id": fid, "name": raw.name, "gz_size": raw.size, "chunk": spacing_mb << 20,
            "members": members}
    summary = {"id": fid, "name": raw.name, "gz_size": raw.size, "count": len(members),
               "created": datetime.datetime.now().isoformat(timespec="seconds")}
    zbuf = io.BytesIO()
    with zipfile.ZipFile(zbuf, "w", zipfile.ZIP_STORED) as z:
        z.writestr("meta.json", json.dumps(summary))
        z.writestr("members.json.gz", gzip.compress(json.dumps(meta, separators=(",", ":")).encode(), 6))
        z.writestr("index.gzidx", idx.getvalue())
    data = zbuf.getvalue()

    path = local_path(fid, dest_dir)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path + ".tmp", "wb") as f:
        f.write(data)
    os.replace(path + ".tmp", path)
    log(f"Indice salvo: {path} ({fmt(len(data))}, {len(members)} membros)")

    if upload:
        try:
            up = upload_to_drive(session, raw.name + SUFFIX, raw.parents, data)
            log(f"Enviado ao Drive: {up['name']} na mesma pasta do original")
        except Exception as e:  # o indice local ja esta salvo; so avisa
            log(f"AVISO: falhou o upload ao Drive ({e}). O indice local continua valido.")
    return path


def upload_to_drive(session, name, parents, data):
    """Upload resumivel de um arquivo NOVO (nao toca no .tar.gz). Exige o escopo drive.file."""
    meta = {"name": name, "parents": parents} if parents else {"name": name}
    r = session.post(f"{UPLOAD}?uploadType=resumable&supportsAllDrives=true", json=meta)
    r.raise_for_status()
    url, step, total = r.headers["Location"], 8 << 20, len(data)
    for start in range(0, max(total, 1), step):
        part = data[start:start + step]
        end = start + len(part) - 1
        h = {"Content-Range": f"bytes {start}-{end}/{total}" if total else "bytes */0"}
        r = session.put(url, data=part, headers=h)
        if r.status_code not in (200, 201, 308):
            r.raise_for_status()
    return r.json()


# ---------------------------------------------------------------- usar
def find_remote_index(session, name):
    q = f"name='{(name + SUFFIX).replace(chr(39), chr(92) + chr(39))}' and trashed=false"
    r = session.get(API, params={"q": q, "orderBy": "modifiedTime desc", "pageSize": 1,
                                 "fields": "files(id)", "supportsAllDrives": "true",
                                 "includeItemsFromAllDrives": "true"})
    r.raise_for_status()
    files = r.json().get("files", [])
    return files[0]["id"] if files else None


def load_index_bytes(session, fid, custom_dir=None):
    """Devolve os bytes do .zip do indice (local primeiro; senao busca no Drive), ou None."""
    path = local_path(fid, custom_dir)
    if os.path.exists(path):
        with open(path, "rb") as f:
            return f.read()
    name = session.get(f"{API}/{fid}", params={"fields": "name", "supportsAllDrives": "true"}).json()["name"]
    iid = find_remote_index(session, name)
    if not iid:
        return None
    r = session.get(f"{API}/{iid}", params={"alt": "media", "supportsAllDrives": "true"})
    r.raise_for_status()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(r.content)
    return r.content


def list_local(custom_dir=None):
    """Indices na pasta local: [{id,name,gz_size,count,created,file_size}]."""
    d = index_dir(custom_dir)
    out = []
    if not os.path.isdir(d):
        return out
    for fn in sorted(os.listdir(d)):
        if not fn.endswith(SUFFIX):
            continue
        p = os.path.join(d, fn)
        row = {"id": fn[:-len(SUFFIX)], "name": None, "gz_size": None, "count": None,
               "created": datetime.datetime.fromtimestamp(os.path.getmtime(p)).isoformat(timespec="seconds"),
               "file_size": os.path.getsize(p), "path": p}
        try:
            with zipfile.ZipFile(p) as z:
                if "meta.json" in z.namelist():
                    row.update(json.loads(z.read("meta.json")))
        except Exception:
            pass
        out.append(row)
    return out


class Index:
    """Indice carregado: arvore por pasta, busca e leitura de trechos sem percorrer o arquivo todo."""

    def __init__(self, session, fid, zdata):
        self.session, self.fid = session, fid
        with zipfile.ZipFile(io.BytesIO(zdata)) as z:
            meta = json.loads(gzip.decompress(z.read("members.json.gz")))
            self.gzidx = z.read("index.gzidx")
        self.members = meta.pop("members")
        self.meta = meta
        self._lower = None
        self._build_tree()

    def _build_tree(self):
        self.kids = {"": {}}     # pasta -> {nome: [e_pasta, tamanho, indice_do_membro]}
        self.agg = {"": [0, 0]}  # pasta -> [tamanho_total, qtd_arquivos]
        anc = {"": [""]}         # pasta -> ela mesma + ancestrais
        kids, agg = self.kids, self.agg

        def ensure(d):
            if d in kids:
                return
            parent, _, name = d.rpartition("/")
            ensure(parent)
            kids[parent][name] = [1, 0, -1]
            kids[d], agg[d], anc[d] = {}, [0, 0], anc[parent] + [d]

        for i, m in enumerate(self.members):
            p = norm_path(m[0])
            if not p:
                continue
            if m[2]:
                ensure(p)
                continue
            parent, _, name = p.rpartition("/")
            ensure(parent)
            kids[parent][name] = [0, m[1], i]
            for a in anc[parent]:
                agg[a][0] += m[1]
                agg[a][1] += 1

    def stats(self):
        return {"files": self.agg[""][1], "size": self.agg[""][0], "gz_size": self.meta["gz_size"]}

    def tree(self, path="", offset=0, limit=2000):
        """Conteudo de uma pasta: pastas primeiro, depois arquivos, ordenados por nome."""
        path = norm_path(path)
        kids = self.kids.get(path)
        if kids is None:
            return None
        rows = []
        for name, (isdir, size, idx) in kids.items():
            full = f"{path}/{name}" if path else name
            if isdir:
                size, count = self.agg[full]
                rows.append({"name": name, "path": full, "dir": True, "size": size, "count": count})
            else:
                rows.append({"name": name, "path": full, "dir": False, "size": size})
        rows.sort(key=lambda r: (not r["dir"], natural_key(r["name"])))
        tot = self.agg[path]
        return {"path": path, "total": len(rows), "size": tot[0], "count": tot[1],
                "items": rows[offset:offset + limit]}

    def search(self, q, limit=300):
        q = q.lower().strip()
        if self._lower is None:
            self._lower = [norm_path(m[0]).lower() for m in self.members]
        out = []
        for i, lp in enumerate(self._lower):
            if lp and q in lp:
                m = self.members[i]
                out.append({"name": posixpath.basename(norm_path(m[0])), "path": norm_path(m[0]),
                            "dir": bool(m[2]), "size": m[1]})
                if len(out) >= limit:
                    break
        return out

    def lookup(self, path):
        path = norm_path(path)
        parent, _, name = path.rpartition("/")
        e = self.kids.get(parent, {}).get(name)
        return self.members[e[2]] if e and not e[0] else None

    def open_reader(self):
        raw = DriveStream(self.session, self.fid, chunk=4 << 20, ahead=2)  # leituras pontuais: blocos menores
        igz = rapidgzip.RapidgzipFile(raw, parallelization=1)
        igz.import_index(io.BytesIO(self.gzidx))
        return raw, igz

    def read_chunks(self, path, limit=None, chunk=1 << 20):
        """Gera o conteudo de um membro (ate `limit` bytes) baixando so o necessario."""
        m = self.lookup(path)
        if m is None:
            return None, None
        size = m[1] if limit is None else min(m[1], limit)
        raw, igz = self.open_reader()

        def gen():
            try:
                igz.seek(m[3])
                left = size
                while left > 0:
                    b = igz.read(min(chunk, left))
                    if not b:
                        break
                    left -= len(b)
                    yield b
            finally:
                igz.close()
                raw.close()
        return m, gen()


# ---------------------------------------------------------------- benchmark
def run_bench(session, fid, mb=64, on_row=None, stop=None):
    """Mede a vazao de download (bloco x paralelismo) e a de descompressao. So RAM."""
    import zlib
    size = DriveStream(session, fid).size
    rows = []
    for k, (chunk_mb, ahead) in enumerate(BENCH_GRID):
        if stop is not None and stop.is_set():
            break
        s = DriveStream(session, fid, chunk=chunk_mb << 20, ahead=ahead)
        s.seek(min(k * (1 << 30), max(size - (mb << 20), 0)))  # offsets diferentes a cada teste
        t, got = time.time(), 0
        while got < mb << 20:
            b = s.read(8 << 20)
            if not b:
                break
            got += len(b)
        s.close()
        row = {"chunk_mb": chunk_mb, "ahead": ahead, "rate": got / max(time.time() - t, 1e-6)}
        rows.append(row)
        if on_row:
            on_row(row, k + 1, len(BENCH_GRID))
    dec = None
    if rows and not (stop is not None and stop.is_set()):
        s = DriveStream(session, fid, chunk=16 << 20, ahead=4)
        data = s.read(64 << 20)
        s.close()
        t = time.time()
        dec = len(zlib.decompressobj(31).decompress(data)) / max(time.time() - t, 1e-6)
    best = max(rows, key=lambda r: r["rate"]) if rows else None
    return {"rows": rows, "best": best, "decomp": dec}


def worker(session, fid, dest, spacing_mb, upload):
    """Roda a indexacao emitindo uma linha JSON por evento (usado pelo app web em processo separado)."""
    def emit(o):
        print(json.dumps(o), flush=True)
    try:
        build(session, fid, dest, spacing_mb, upload, log=lambda m: emit({"log": m}),
              progress=lambda d: emit({"progress": d}))
        emit({"done": True})
    except Exception as e:
        emit({"error": f"{type(e).__name__}: {e}"})
        sys.exit(1)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    ap.add_argument("cmd", choices=["build", "info", "bench", "worker"])
    ap.add_argument("file", help="ID ou URL do .tar.gz no Drive")
    ap.add_argument("--index-dir", help="pasta local onde salvar o indice (ex.: D:\\indices)")
    ap.add_argument("--no-upload", action="store_true", help="nao enviar o indice ao Drive")
    ap.add_argument("--spacing-mb", type=int, default=32, help="distancia entre checkpoints (MB comprimidos)")
    ap.add_argument("--service-account", metavar="JSON")
    ap.add_argument("--client-secret", default="credentials.json")
    a = ap.parse_args()
    session = get_session(a.service_account, a.client_secret)
    fid = parse_file_id(a.file)
    if a.cmd == "bench":
        res = run_bench(session, fid, 96, lambda r, i, n: print(
            f"  [{i}/{n}] bloco {r['chunk_mb']:>2} MB x {r['ahead']:>2} paralelos: {fmt(r['rate'])}/s"))
        if res["decomp"]:
            print(f"Descompressao (1 nucleo): {fmt(res['decomp'])}/s")
        b = res["best"]
        print(f"Melhor: {fmt(b['rate'])}/s com bloco {b['chunk_mb']} MB x {b['ahead']} paralelos")
    elif a.cmd == "worker":
        worker(session, fid, a.index_dir, a.spacing_mb, not a.no_upload)
    elif a.cmd == "build":
        build(session, fid, a.index_dir, a.spacing_mb, not a.no_upload)
    else:
        z = load_index_bytes(session, fid, a.index_dir)
        if not z:
            sys.exit("Nenhum indice encontrado (local ou no Drive).")
        ix = Index(session, fid, z)
        print(f"{ix.meta['name']}: {len(ix.members)} membros, indice zip {fmt(len(z))}")


if __name__ == "__main__":
    main()
