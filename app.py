"""Gerenciador web de .tar.gz do Google Drive (streaming, sem baixar o arquivo, sem alterar o Drive).

  python app.py [--service-account chave.json] [--port 5000] [--index-dir D:\\indices]

Tudo e feito pela interface: escolher o arquivo, criar o indice, navegar nas pastas,
visualizar/baixar arquivos, medir a velocidade e ajustar as configuracoes.
"""
import argparse
import json
import mimetypes
import os
import subprocess
import sys
import threading
import time
import uuid

from urllib.parse import quote

from flask import Flask, Response, abort, jsonify, request, send_from_directory

import gdrive_targz_stream as gts
import tgz_index
from gdrive_targz_stream import API, get_session, parse_file_id

HERE = os.path.dirname(os.path.abspath(__file__))
SETTINGS_FILE = os.path.join(HERE, "settings.json")
DEFAULTS = {"index_dir": "", "spacing_mb": 32, "upload": True,
            "chunk_mb": gts.CHUNK >> 20, "ahead": gts.AHEAD, "preview_kb": 512}

app = Flask(__name__, static_folder=os.path.join(HERE, "static"), static_url_path="/static")
state = {"session": None, "settings": dict(DEFAULTS)}
indexes = {}  # file_id -> Index | None (memo)
jobs = {}     # file_id -> trabalho de indexacao
bench = {"state": "none"}
downloads = {}  # token -> progresso de um download em andamento


# ------------------------------------------------------------ configuracoes
def apply_settings():
    s = state["settings"]
    gts.CHUNK, gts.AHEAD = int(s["chunk_mb"]) << 20, int(s["ahead"])


def load_settings():
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, encoding="utf-8") as f:
                state["settings"].update(json.load(f))
        except (OSError, ValueError):
            pass
    apply_settings()


def save_settings():
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(state["settings"], f, indent=2)


def idx_dir():
    return tgz_index.index_dir(state["settings"]["index_dir"] or None)


def check_writable(path):
    os.makedirs(path, exist_ok=True)
    probe = os.path.join(path, ".write_test")
    open(probe, "w").close()
    os.remove(probe)


@app.get("/api/settings")
def api_settings_get():
    return jsonify({**state["settings"], "index_dir_effective": idx_dir()})


@app.post("/api/settings")
def api_settings_set():
    new = request.json or {}
    clean = {}
    try:
        for k, kind, lo, hi in (("spacing_mb", int, 1, 512), ("chunk_mb", int, 1, 128),
                                ("ahead", int, 1, 32), ("preview_kb", int, 16, 8192)):
            if k in new:
                clean[k] = min(max(kind(new[k]), lo), hi)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid numeric values.", "code": "invalid_numbers"}), 400
    if "upload" in new:
        clean["upload"] = bool(new["upload"])
    if "index_dir" in new:
        d = (new["index_dir"] or "").strip()
        if d:
            try:
                check_writable(d)
            except OSError as e:
                return jsonify({"error": f"Cannot write to '{d}'", "code": "dir_not_writable", "params": {"dir": d, "reason": str(e.strerror or e)}}), 400
        if d != state["settings"]["index_dir"]:
            indexes.clear()
        clean["index_dir"] = d
    state["settings"].update(clean)
    apply_settings()
    save_settings()
    return api_settings_get()


# ------------------------------------------------------------ conta / Drive
@app.get("/api/me")
def api_me():
    r = state["session"].get("https://www.googleapis.com/drive/v3/about",
                             params={"fields": "user(displayName,emailAddress,photoLink),storageQuota"})
    r.raise_for_status()
    return jsonify(r.json())


@app.get("/api/drive")
def api_drive():
    """.tar.gz/.tgz do Drive, mais recentes primeiro, com a situacao do indice de cada um."""
    term = request.args.get("q", "").replace("\\", "\\\\").replace("'", "\\'")
    q = "trashed=false and (name contains '.tar.gz' or name contains '.tgz') and not name contains '.tgzindex.zip'"
    if term:
        q += f" and name contains '{term}'"
    r = state["session"].get(API, params={
        "q": q, "pageSize": 100, "orderBy": "modifiedTime desc",
        "fields": "files(id,name,size,modifiedTime)",
        "supportsAllDrives": "true", "includeItemsFromAllDrives": "true"})
    r.raise_for_status()
    files = [f for f in r.json().get("files", []) if not f["name"].endswith(".tgzindex.zip")]  # nunca lista os proprios indices
    for f in files:
        f["indexed"] = os.path.exists(tgz_index.local_path(f["id"], state["settings"]["index_dir"] or None))
        j = jobs.get(f["id"])
        f["job"] = j["state"] if j else None
        f["progress"] = (j["got"] / j["size"]) if j and j.get("size") else 0
    return jsonify(files)


def file_meta(fid):
    r = state["session"].get(f"{API}/{fid}", params={"fields": "id,name,size,modifiedTime", "supportsAllDrives": "true"})
    if r.status_code == 404:
        abort(404)
    r.raise_for_status()
    m = r.json()
    m["size"] = int(m.get("size", 0))
    return m


def get_index(fid, refresh=False):
    """Indice (local ou no Drive) do .tar.gz, ou None. Resultado memorizado."""
    if refresh:
        indexes.pop(fid, None)
    if fid not in indexes:
        z = tgz_index.load_index_bytes(state["session"], fid, state["settings"]["index_dir"] or None)
        indexes[fid] = tgz_index.Index(state["session"], fid, z) if z else None
    return indexes[fid]


def need_index(fid):
    ix = get_index(fid)
    if not ix:
        abort(Response(json.dumps({"noindex": True, "file": file_meta(fid), "job": public(jobs.get(fid))}),
                       status=409, mimetype="application/json"))
    return ix


# ------------------------------------------------------------ downloads
def disposition(name):
    """Content-Disposition seguro para nomes com acento (RFC 5987)."""
    ascii_name = name.encode("ascii", "ignore").decode().replace('"', "").strip() or "download"
    return "attachment; filename=\"%s\"; filename*=UTF-8''%s" % (ascii_name, quote(name))


def track(token, name, total, kind):
    """Registra um download para a interface mostrar em Tarefas (preparando, baixando, concluido)."""
    now = time.time()
    for k in [k for k, v in downloads.items() if v["state"] not in ("preparing", "sending") and now - v["started"] > 3600]:
        del downloads[k]
    token = token if token and len(token) <= 40 else uuid.uuid4().hex[:12]
    d = {"id": token, "kind": kind, "name": name, "total": total, "sent": 0, "state": "preparing", "started": now,
         "error": None, "files": 1 if kind == "file" else 0, "rate": 0, "eta": 0, "cancel": threading.Event()}
    downloads[token] = d
    return d


def tracked(gen, d):
    last_t, last_n = time.time(), 0
    try:
        for chunk in gen:
            if d["cancel"].is_set():
                d["state"] = "interrupted"
                return
            d["sent"] += len(chunk)
            d["state"] = "sending"
            now = time.time()
            if now - last_t >= 1:
                inst = (d["sent"] - last_n) / (now - last_t)
                d["rate"] = inst if not d["rate"] else 0.6 * d["rate"] + 0.4 * inst
                d["eta"] = max(0, d["total"] - d["sent"]) / d["rate"] if d["rate"] else 0
                last_t, last_n = now, d["sent"]
            yield chunk
        d["state"], d["rate"], d["eta"] = "done", 0, 0
    except GeneratorExit:
        d["state"] = "interrupted"  # o navegador cancelou
        raise
    except Exception as e:
        d["state"], d["error"] = "error", f"{type(e).__name__}: {e}"
        raise
    finally:
        d["finished"] = time.time()
        if d["state"] != "sending":
            d["rate"] = 0
        gen.close()


def public_dl(d):
    return {k: v for k, v in d.items() if k != "cancel"}


@app.get("/api/downloads")
def api_downloads():
    return jsonify(sorted((public_dl(d) for d in downloads.values()), key=lambda x: -x["started"]))


@app.post("/api/downloads/cancel")
def api_downloads_cancel():
    d = downloads.get((request.json or {}).get("id", ""))
    if d:
        d["cancel"].set()
    return jsonify({"ok": True})


@app.post("/api/downloads/clear")
def api_downloads_clear():
    for k in [k for k, v in downloads.items() if v["state"] not in ("preparing", "sending")]:
        del downloads[k]
    return jsonify({"ok": True})


@app.get("/api/folder")
def api_folder():
    """Baixa uma pasta inteira como .zip gerado em streaming (nada e gravado em disco)."""
    fid, path = parse_file_id(request.args["file"]), tgz_index.norm_path(request.args.get("path", ""))
    ix = need_index(fid)
    if path not in ix.agg:
        abort(404)
    base, members = tgz_index.folder_members(ix, path)
    d = track(request.args.get("t"), base + ".zip", ix.agg[path][0], "zip")
    d["files"] = len(members)
    return Response(tracked(tgz_index.iter_zip(ix, path), d), mimetype="application/zip",
                    headers={"Content-Disposition": disposition(base + ".zip")})


# ------------------------------------------------------------ navegacao
@app.get("/api/tree")
def api_tree():
    fid = parse_file_id(request.args["file"])
    ix = need_index(fid)
    out = ix.tree(request.args.get("path", ""), int(request.args.get("offset", 0)))
    if out is None:
        abort(404)
    out["file"] = {"id": fid, "name": ix.meta["name"], **ix.stats()}
    return jsonify(out)


@app.get("/api/search")
def api_search():
    ix = need_index(parse_file_id(request.args["file"]))
    q = request.args.get("q", "")
    return jsonify({"q": q, "items": ix.search(q) if len(q.strip()) >= 2 else []})


@app.get("/api/file")
def api_file():
    fid, path = parse_file_id(request.args["file"]), request.args["path"]
    download = request.args.get("download") == "1"
    ix = need_index(fid)
    limit = int(state["settings"]["preview_kb"]) << 10
    m, gen = ix.read_chunks(path, None if download else limit)
    if not m:
        abort(404)
    name = os.path.basename(path)
    if request.args.get("inline") == "1":  # imagem exibida na previa (nao conta como download)
        mime = mimetypes.guess_type(name)[0] or "application/octet-stream"
        if not mime.startswith("image/"):
            abort(415)
        if m[1] > (64 << 20):
            abort(413)
        return Response(gen, mimetype=mime, headers={"Content-Length": str(m[1]), "Cache-Control": "private, max-age=3600",
                                                     "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox"})
    if download:
        d = track(request.args.get("t"), name, m[1], "file")
        headers = {"Content-Disposition": disposition(name), "Content-Length": str(m[1])}
        return Response(tracked(gen, d), mimetype="application/octet-stream", headers=headers)
    data = b"".join(gen)
    if b"\0" in data[:8192]:
        return jsonify({"binary": True, "size": m[1]})
    return jsonify({"binary": False, "size": m[1], "truncated": m[1] > limit,
                    "text": data.decode("utf-8", errors="replace")})


# ------------------------------------------------------------ indexacao
def public(job):
    return {k: v for k, v in job.items() if k not in ("cancel", "proc")} if job else None


def run_job(fid, job, dest, spacing, upload):
    """Indexa em um PROCESSO separado: se a lib nativa falhar ou o usuario cancelar,
    so o subprocesso morre e o servidor web continua de pe."""
    st = state["settings"]
    cmd = [sys.executable, os.path.join(HERE, "tgz_index.py"), "worker", fid, "--spacing-mb", str(spacing)]
    if dest:
        cmd += ["--index-dir", dest]
    if not upload:
        cmd.append("--no-upload")
    if state.get("sa"):
        cmd += ["--service-account", state["sa"]]
    env = {**os.environ, "TGZ_CHUNK_MB": str(st["chunk_mb"]), "TGZ_AHEAD": str(st["ahead"]), "PYTHONIOENCODING": "utf-8"}
    tail, finished = [], False
    try:
        proc = subprocess.Popen(cmd, cwd=HERE, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                text=True, encoding="utf-8", errors="replace")
        job["proc"] = proc
        if job["cancel"].is_set():  # cancelou antes do processo nascer
            proc.kill()
        for line in proc.stdout:
            line = line.strip()
            try:
                ev = json.loads(line)
            except ValueError:
                if line:
                    tail.append(line)
                continue
            if "progress" in ev:
                job.update(ev["progress"])
            elif "log" in ev:
                job["log"].append(ev["log"])
            elif ev.get("done"):
                finished = True
            elif "error" in ev:
                job["error"] = ev["error"]
        code = proc.wait()
        if job["cancel"].is_set():
            job["state"] = "cancelled"
        elif finished and code == 0:
            indexes.pop(fid, None)
            job["state"] = "done"
        else:
            job["state"] = "error"
            if not job["error"]:
                job["error_code"] = "worker_exit"
                job["error_params"] = {"code": code, "tail": " ".join(tail[-3:])[:400]}
                job["error"] = "Indexing process ended unexpectedly (code %s)." % code
    except Exception as e:
        job["state"], job["error"] = "error", f"{type(e).__name__}: {e}"
    job["finished"] = time.time()


@app.post("/api/index/start")
def api_index_start():
    b = request.json
    fid = parse_file_id(b["file"].strip())
    if jobs.get(fid, {}).get("state") == "running":
        return jsonify(public(jobs[fid]))
    s = state["settings"]
    meta = file_meta(fid)
    try:
        check_writable(idx_dir())  # falha cedo, antes de gastar horas lendo o arquivo
    except OSError as e:
        return jsonify({"error": f"Cannot write to '{idx_dir()}'", "code": "dir_not_writable", "params": {"dir": idx_dir(), "reason": str(e.strerror or e)}}), 400
    job = {"id": fid, "name": meta["name"], "state": "running", "got": 0, "size": meta["size"], "rate": 0,
           "eta": 0, "members": 0, "log": [], "error": None, "dir": idx_dir(), "started": time.time(),
           "upload": bool(b.get("upload", s["upload"])), "cancel": threading.Event()}
    jobs[fid] = job
    threading.Thread(target=run_job, daemon=True, args=(
        fid, job, s["index_dir"] or None, int(b.get("spacing_mb") or s["spacing_mb"]), job["upload"])).start()
    return jsonify(public(job))


@app.get("/api/jobs")
def api_jobs():
    return jsonify(sorted((public(j) for j in jobs.values()), key=lambda j: -j["started"]))


@app.post("/api/index/cancel")
def api_index_cancel():
    job = jobs.get(parse_file_id(request.json["file"]))
    if job:
        job["cancel"].set()
        proc = job.get("proc")
        if proc and proc.poll() is None:
            proc.kill()  # encerra so o subprocesso de indexacao; o servidor segue de pe
    return jsonify({"ok": True})


@app.post("/api/jobs/clear")
def api_jobs_clear():
    for k in [k for k, j in jobs.items() if j["state"] != "running"]:
        del jobs[k]
    return jsonify({"ok": True})


# ------------------------------------------------------------ indices locais
@app.get("/api/indexes")
def api_indexes():
    return jsonify({"dir": idx_dir(), "items": tgz_index.list_local(state["settings"]["index_dir"] or None)})


@app.delete("/api/indexes/<fid>")
def api_indexes_delete(fid):
    p = tgz_index.local_path(parse_file_id(fid), state["settings"]["index_dir"] or None)
    if os.path.exists(p):
        os.remove(p)
    indexes.pop(fid, None)
    return jsonify({"ok": True})


@app.post("/api/open-folder")
def api_open_folder():
    d = idx_dir()
    if hasattr(os, "startfile") and os.path.isdir(d):  # so no Windows; abre no Explorer
        os.startfile(d)
    return jsonify({"dir": d})


# ------------------------------------------------------------ benchmark
def run_bench_job(fid, mb):
    def on_row(row, i, n):
        bench["rows"].append(row)
        bench["done"], bench["total"] = i, n
    try:
        res = tgz_index.run_bench(state["session"], fid, mb, on_row, bench["cancel"])
        bench.update(res, state="cancelled" if bench["cancel"].is_set() else "done")
    except Exception as e:
        bench.update(state="error", error=f"{type(e).__name__}: {e}")


@app.post("/api/bench/start")
def api_bench_start():
    if bench.get("state") == "running":
        return api_bench_status()
    fid = parse_file_id(request.json["file"].strip())
    meta = file_meta(fid)
    bench.clear()
    bench.update(state="running", rows=[], done=0, total=len(tgz_index.BENCH_GRID), best=None, decomp=None,
                 error=None, file=meta["name"], cancel=threading.Event())
    threading.Thread(target=run_bench_job, daemon=True, args=(fid, int(request.json.get("mb", 64)))).start()
    return api_bench_status()


@app.get("/api/bench/status")
def api_bench_status():
    return jsonify({k: v for k, v in bench.items() if k != "cancel"})


@app.post("/api/bench/cancel")
def api_bench_cancel():
    if bench.get("cancel"):
        bench["cancel"].set()
    return jsonify({"ok": True})


# ------------------------------------------------------------ pagina
@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--service-account", metavar="JSON")
    ap.add_argument("--client-secret", default="credentials.json")
    ap.add_argument("--port", type=int, default=5000)
    ap.add_argument("--host", help="endereco de escuta (padrao 127.0.0.1; 0.0.0.0 abre para a rede). Tambem lido de settings.json ou TGZ_HOST")
    ap.add_argument("--index-dir", help="pasta local dos indices (sobrescreve a configuracao salva)")
    a = ap.parse_args()
    load_settings()
    if a.index_dir:
        state["settings"]["index_dir"] = a.index_dir
    state["sa"] = a.service_account
    state["session"] = get_session(a.service_account, a.client_secret)  # autentica antes de subir
    host = a.host or os.environ.get("TGZ_HOST") or state["settings"].get("host") or "127.0.0.1"
    if host not in ("127.0.0.1", "localhost", "::1"):
        print(f"AVISO: escutando em {host}:{a.port}. O app nao tem login e usa o seu acesso ao Drive: qualquer pessoa na rede alcanca seus arquivos.")
    app.run(host=host, port=a.port, threaded=True)
