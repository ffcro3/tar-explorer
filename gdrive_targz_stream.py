"""Lista e extrai arquivos de um .tar.gz no Google Drive sem baixar o arquivo inteiro.

Como funciona:
  - DriveStream e um "arquivo" somente-leitura que busca bytes sob demanda na API do
    Drive (HTTP Range) e os mantem apenas na RAM (um buffer de poucos MB).
  - tarfile abre esse stream em modo "r|gz" (streaming sequencial). Nada vai para o disco,
    exceto o membro que voce pedir para extrair.

Limitacao inerente ao gzip: nao existe acesso aleatorio. Para chegar a um arquivo no meio do
.tar.gz, os bytes anteriores precisam ser lidos (trafegam pela rede e sao descartados).
`--list` le o arquivo todo pela rede; `--extract` para assim que acha o membro.

Uso:
  python gdrive_targz_stream.py FILE_ID --list
  python gdrive_targz_stream.py FILE_ID --extract pasta/arquivo.txt --out saida/
  python gdrive_targz_stream.py FILE_ID --cat pasta/arquivo.txt | head
  (FILE_ID tambem pode ser a URL de compartilhamento do Drive.)
"""
import argparse
import io
import os
import re
import sys
import tarfile
import time
from concurrent.futures import ThreadPoolExecutor

from requests.adapters import HTTPAdapter
from google.auth.transport.requests import AuthorizedSession, Request
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# readonly: le o .tar.gz | drive.file: cria/le SO os arquivos criados por este app (o indice)
SCOPES = ["https://www.googleapis.com/auth/drive.readonly",
          "https://www.googleapis.com/auth/drive.file"]
API = "https://www.googleapis.com/drive/v3/files"
# Ajustaveis por variavel de ambiente (use `python tgz_index.py bench <ID>` para achar o melhor valor)
CHUNK = int(os.environ.get("TGZ_CHUNK_MB", 16)) * 1024 * 1024  # tamanho de cada requisicao Range
AHEAD = int(os.environ.get("TGZ_AHEAD", 6))  # blocos baixados em paralelo (RAM ~ CHUNK x AHEAD)


def get_session(service_account_file=None, client_secret="credentials.json", token="token.json"):
    """Autentica e devolve uma sessao HTTP autorizada."""
    if service_account_file:
        # Conta de servico: o arquivo precisa ser compartilhado com o e-mail da conta.
        creds = service_account.Credentials.from_service_account_file(
            service_account_file, scopes=SCOPES)
    else:
        # OAuth "app para computador": abre o navegador na 1a vez, depois reutiliza token.json.
        creds = None
        if os.path.exists(token):
            creds = Credentials.from_authorized_user_file(token, SCOPES)
        if creds and not creds.has_scopes(SCOPES):
            creds = None  # token antigo sem o escopo de upload: reautoriza
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(client_secret, SCOPES)
                creds = flow.run_local_server(port=0)
            with open(token, "w") as f:
                f.write(creds.to_json())
    sess = AuthorizedSession(creds)
    adapter = HTTPAdapter(pool_connections=32, pool_maxsize=32)  # padrao (10) limita o paralelismo
    sess.mount("https://", adapter)
    return sess


def parse_file_id(value):
    """Aceita um ID puro ou uma URL do Drive."""
    m = re.search(r"/d/([\w-]+)|[?&]id=([\w-]+)", value)
    return (m.group(1) or m.group(2)) if m else value


class DriveStream(io.RawIOBase):
    """Leitor sequencial de um arquivo do Drive via HTTP Range, com read-ahead paralelo."""

    def __init__(self, session, file_id, chunk=None, ahead=None):
        chunk, ahead = chunk or CHUNK, ahead or AHEAD  # le os valores atuais (ajustaveis em runtime)
        self.session, self.file_id, self.chunk, self.ahead = session, file_id, chunk, ahead
        r = session.get(f"{API}/{file_id}",
                        params={"fields": "name,size,parents", "supportsAllDrives": "true"})
        r.raise_for_status()
        meta = r.json()
        self.name, self.size = meta["name"], int(meta["size"])
        self.parents = meta.get("parents", [])
        self.nchunks = -(-self.size // chunk)
        self.pool = ThreadPoolExecutor(ahead)
        self.futs, self.next, self.cur, self.off, self.skip, self.pos = {}, 0, b"", 0, 0, 0
        self.bytes_fetched = 0

    def readable(self):
        return True

    def _fetch(self, i):
        start = i * self.chunk
        end = min(start + self.chunk, self.size) - 1
        for attempt in range(6):  # retry simples para 429/5xx
            r = self.session.get(
                f"{API}/{self.file_id}",
                params={"alt": "media", "supportsAllDrives": "true"},
                headers={"Range": f"bytes={start}-{end}"})
            if r.status_code in (429, 500, 502, 503, 504):
                time.sleep(2 ** attempt)
                continue
            r.raise_for_status()
            return r.content
        r.raise_for_status()

    def readinto(self, b):
        if self.off >= len(self.cur):
            if self.next >= self.nchunks:
                return 0
            for j in range(self.next, min(self.next + self.ahead, self.nchunks)):
                if j not in self.futs:
                    self.futs[j] = self.pool.submit(self._fetch, j)
            self.cur = self.futs.pop(self.next).result()
            self.next += 1
            self.off, self.skip = self.skip, 0
            self.bytes_fetched += len(self.cur)
        n = min(len(b), len(self.cur) - self.off)
        b[:n] = self.cur[self.off:self.off + n]
        self.off += n
        self.pos += n
        return n

    def seekable(self):
        return True

    def tell(self):
        return self.pos

    def seek(self, offset, whence=io.SEEK_SET):
        if whence == io.SEEK_CUR:
            offset += self.pos
        elif whence == io.SEEK_END:
            offset += self.size
        offset = max(0, min(offset, self.size))
        if offset != self.pos:
            for f in self.futs.values():
                f.cancel()
            self.futs.clear()
            self.next, self.skip = offset // self.chunk, offset % self.chunk
            self.cur, self.off, self.pos = b"", 0, offset
        return self.pos

    def close(self):
        self.pool.shutdown(wait=False, cancel_futures=True)
        super().close()


def open_tar(session, file_id):
    raw = DriveStream(session, file_id)
    buffered = io.BufferedReader(raw, buffer_size=1 << 20)
    return raw, tarfile.open(fileobj=buffered, mode="r|gz")  # "r|gz" = streaming puro


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    ap.add_argument("file", help="ID ou URL do .tar.gz no Drive")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--list", action="store_true", help="lista os membros")
    g.add_argument("--extract", metavar="MEMBRO", help="extrai um membro para --out")
    g.add_argument("--cat", metavar="MEMBRO", help="escreve o membro no stdout (so RAM)")
    ap.add_argument("--out", default=".", help="pasta de destino do --extract")
    ap.add_argument("--service-account", metavar="JSON", help="usa conta de servico em vez de OAuth")
    ap.add_argument("--client-secret", default="credentials.json")
    args = ap.parse_args()

    session = get_session(args.service_account, args.client_secret)
    raw, tar = open_tar(session, parse_file_id(args.file))
    target = args.extract or args.cat

    with tar:
        for m in tar:
            if args.list:
                print(f"{m.size:>12}  {m.name}")
            elif m.name == target or m.name.lstrip("./") == target.lstrip("./"):
                src = tar.extractfile(m)
                if src is None:
                    sys.exit(f"{m.name} nao e um arquivo regular")
                if args.cat:
                    while chunk := src.read(1 << 20):
                        sys.stdout.buffer.write(chunk)
                else:
                    # Grava so este membro, em pedacos (evita path traversal usando o basename).
                    os.makedirs(args.out, exist_ok=True)
                    dest = os.path.join(args.out, os.path.basename(m.name))
                    with open(dest, "wb") as f:
                        while chunk := src.read(1 << 20):
                            f.write(chunk)
                    print(f"Extraido: {dest}", file=sys.stderr)
                break
        else:
            if not args.list:
                sys.exit(f"Membro nao encontrado: {target}")

    print(f"Bytes lidos da rede: {raw.bytes_fetched:,} de {raw.size:,}", file=sys.stderr)


if __name__ == "__main__":
    main()
