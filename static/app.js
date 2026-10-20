"use strict";
/* Tar Explorer: SPA sem dependencias. Rotas por hash: #/drive  #/browse/<id>?p=<pasta>  #/indexes  #/tasks  #/perf  #/settings */

// ---------------------------------------------------------------- i18n (pt-BR / en-US)
const MSG = {
  "pt-BR": {
    "nav.menu": "Menu", "nav.drive": "Meu Drive", "nav.browse": "Explorar", "nav.indexes": "Índices", "nav.tasks": "Tarefas", "nav.perf": "Desempenho", "nav.settings": "Configurações",
    "nav.toggle": "Menu", "nav.aria": "Navegação", "lang.label": "Idioma", "common.cancel": "Cancelar", "common.close": "Fechar", "common.open": "Abrir", "common.refresh": "Atualizar", "common.save": "Salvar", "common.discard": "Descartar",
    "common.download": "Baixar", "common.confirm": "Confirmar?", "common.delete": "Excluir", "common.none": "–", "common.error": "Erro {n}", "common.view_tasks": "Ver tarefas",
    "unit.files.one": "arquivo", "unit.files.other": "arquivos", "unit.members.one": "membro", "unit.members.other": "membros", "unit.items": "Itens / tipo",
    "drive.title": "Meus .tar.gz", "drive.sub": "Escolha um arquivo do seu Drive. Nada é baixado por inteiro e o original nunca é alterado.", "drive.paste": "Colar ID ou URL de compartilhamento do Drive",
    "drive.panel": "Arquivos no Drive", "drive.search": "Buscar por nome…", "drive.cols.name": "Nome", "drive.cols.size": "Tamanho", "drive.cols.modified": "Modificado", "drive.cols.index": "Índice",
    "drive.empty": "Nenhum .tar.gz encontrado", "drive.empty_hint": "Só aparecem arquivos cujo nome contém .tar.gz ou .tgz. Se o seu tem outro nome, cole o ID acima.",
    "idx.badge.running": "Indexando {p}%", "idx.badge.done": "Indexado", "idx.badge.none": "Sem índice", "idx.run": "Indexar", "idx.started": "Indexação iniciada.",
    "browse.crumb.error": "Erro", "browse.notfound": "Pasta ou arquivo não encontrado neste índice.", "browse.search": "Buscar neste arquivo…", "browse.unpacked": "descomprimido", "browse.on_drive": "no Drive",
    "browse.dl_folder": "Baixar pasta", "browse.dl_all": "Baixar tudo", "browse.cards": "Cartões", "browse.list": "Lista", "browse.mode": "Modo de exibição", "browse.index_link": "Índice",
    "browse.folders": "Pastas · {n}", "browse.files_n": "Arquivos · {n}", "browse.empty": "Pasta vazia", "browse.results": "{n} resultados para “{q}”", "browse.nothing": "Nada encontrado", "browse.nothing_hint": "Tente outro trecho do nome ou do caminho.",
    "browse.partial": "Mostrando {a} de {b} itens desta pasta. Use a busca para achar o resto.", "browse.dl_dir_tip": "Baixar pasta (.zip)", "browse.dl_dir_aria": "Baixar pasta {name}",
    "detail.composition": "Composição desta pasta", "detail.dist": "Distribuição por tamanho", "detail.loose": "Arquivos soltos e outros", "detail.hint": "Clique em um arquivo para visualizar. Só o trecho necessário é baixado do Drive.",
    "detail.path": "Caminho", "detail.binary": "Arquivo binário: sem prévia. Use Baixar.", "detail.truncated": "… (prévia truncada)", "detail.reading": "Lendo o trecho no Drive…",
    "noidx.sub": "{size} no Drive · ainda sem índice", "noidx.title": "Criar índice", "noidx.desc": "Uma leitura em streaming (nada é gravado do .tar.gz) gera um índice pequeno. Depois a árvore abre na hora e cada arquivo é lido sob demanda. O original no Drive não é alterado.",
    "noidx.save_in": "Salvar em", "noidx.checkpoints": "Checkpoints", "noidx.every": "a cada {n} MB", "noidx.download": "Download", "noidx.conns": "{a} conexões × {c} MB", "noidx.upload": "Enviar o índice também ao Drive (mesma pasta do original)",
    "noidx.create": "Criar índice", "noidx.adjust": "Alterar pasta e ajustes", "noidx.reading": "Lendo o arquivo uma única vez para montar o índice.", "noidx.failed": "Falhou: {e}", "noidx.cancelled": "Indexação cancelada.",
    "indexes.title": "Índices", "indexes.sub": "Cada índice permite abrir um .tar.gz na hora. Ficam nesta pasta do seu computador.", "indexes.open_folder": "Abrir pasta", "indexes.change_folder": "Mudar pasta",
    "indexes.count": "{n} índice(s)", "indexes.on_disk": "{size} em disco", "indexes.cols.file": "Arquivo", "indexes.cols.members": "Membros", "indexes.cols.orig": "Tamanho original", "indexes.cols.index": "Índice", "indexes.cols.created": "Criado",
    "indexes.rebuild": "Recriar", "indexes.deleted": "Índice excluído.", "indexes.empty": "Nenhum índice ainda", "indexes.empty_hint": "Abra um arquivo em “Meu Drive” e clique em Indexar.", "indexes.goto_drive": "Ir para Meu Drive",
    "tasks.title": "Tarefas", "tasks.sub": "Indexações e downloads, em andamento e concluídos. Rodam no servidor e não bloqueiam o app: você pode navegar à vontade.", "tasks.tab.index": "Indexações", "tasks.tab.dl": "Downloads",
    "tasks.clear": "Limpar concluídas", "tasks.empty_i": "Nenhuma indexação", "tasks.empty_i_hint": "Quando você indexar um arquivo, o progresso aparece aqui.", "tasks.empty_d": "Nenhum download", "tasks.empty_d_hint": "Os downloads de arquivos e pastas aparecem aqui e rodam em segundo plano.",
    "state.running": "Indexando", "state.done": "Concluído", "state.error": "Falhou", "state.cancelled": "Cancelado", "state.preparing": "Preparando", "state.sending": "Baixando", "state.interrupted": "Interrompido",
    "job.saving_in": "Salvando em {dir}", "job.uploading": " · enviando ao Drive ao final", "job.of": " de ", "job.read": " lidos", "job.left": "faltam ",
    "dl.started": "Download iniciado: {name}", "dl.see": "Ver downloads", "dl.preparing_file": "Localizando o arquivo dentro do .tar.gz…", "dl.preparing_zip": "Lendo o Drive e montando o .zip ({size})…", "dl.zip_note": "pasta (.zip)", "dl.file_note": "arquivo",
    "dl.interrupted": "interrompido", "dl.done_msg": "veja a barra de downloads do navegador",
    "pill.index": "Indexando {p}%", "pill.dl": "Baixando {p}%", "pill.tasks": "{n} tarefas",
    "perf.title": "Desempenho", "perf.sub": "Descubra quantas conexões e que tamanho de bloco dão a maior velocidade com o seu Drive e a sua internet.", "perf.file": "Arquivo de teste", "perf.depth": "Profundidade",
    "perf.fast": "Rápido · 32 MB por teste", "perf.std": "Padrão · 64 MB por teste", "perf.precise": "Preciso · 128 MB por teste", "perf.run": "Rodar teste", "perf.speed_title": "Velocidade de download (MB/s) · {name}",
    "perf.testing": "Testando {a}/{b}", "perf.stop": "Parar", "perf.finished": "Concluído", "perf.err": "Erro", "perf.interrupted": "Interrompido", "perf.axis": "bloco \\ conexões", "perf.cell": "bloco {c} MB × {a} conexões",
    "perf.best": "Melhor: {r} MB/s", "perf.best_with": " com blocos de {c} MB e {a} conexões (RAM ≈ {ram} MB). ", "perf.decomp": "Descompressão: {d} MB/s em um núcleo, então a rede é o gargalo. ", "perf.limit": "Acima de ~16 conexões o Drive começa a recusar pedidos e a velocidade cai.",
    "perf.apply": "Aplicar melhor configuração", "perf.current": "Atual: {a} conexões × {c} MB", "perf.applied": "Aplicado: {a} conexões × {c} MB.", "perf.none": "Sem teste ainda", "perf.none_hint": "O teste baixa alguns trechos do arquivo escolhido só para medir a velocidade, sem gravar nada em disco (~1 a 2 GB de tráfego).",
    "set.title": "Configurações", "set.sub": "Tudo é salvo em settings.json ao lado do app e vale na hora, sem reiniciar.", "set.indexes": "Índices", "set.dir": "Pasta local dos índices",
    "set.dir_hint": "Em branco usa a pasta padrão. O app testa se consegue gravar antes de salvar. Em uso: ", "set.spacing": "Distância entre checkpoints", "set.spacing_hint": "Vale para os próximos índices. Mede MB do arquivo comprimido.",
    "set.sp8": "8 MB · extração mais rápida, índice maior", "set.sp32": "32 MB · equilibrado (padrão)", "set.sp128": "128 MB · índice menor, extração mais lenta", "set.upload": "Enviar o índice ao Drive, na mesma pasta do original",
    "set.download": "Download", "set.chunk": "Tamanho do bloco: {v}", "set.ahead": "Conexões em paralelo: {v}", "set.ram": "Memória usada ≈ {ram}. Entre 8 e 16 conexões costuma ser o ideal. Mais que isso o Drive recusa pedidos. Use a aba Desempenho para medir.",
    "set.view": "Visualização", "set.preview": "Limite da prévia de texto (KB)", "set.language": "Idioma", "set.account": "Conta", "set.account_text": "Conectado como {email}. O app lê seus arquivos (somente leitura) e só cria o arquivo de índice. Para trocar de conta, apague token.json e reinicie.",
    "set.saved": "Configurações salvas.", "me.quota_used": "{u} de {l} usados", "me.quota_used_nolimit": "{u} usados",
    "err.dir_not_writable": "Não consigo gravar em '{dir}': {reason}", "err.invalid_numbers": "Valores numéricos inválidos.", "err.worker_exit": "O processo de indexação terminou inesperadamente (código {code}). {tail}",
  },
  "en-US": {
    "nav.menu": "Menu", "nav.drive": "My Drive", "nav.browse": "Explore", "nav.indexes": "Indexes", "nav.tasks": "Tasks", "nav.perf": "Performance", "nav.settings": "Settings",
    "nav.toggle": "Menu", "nav.aria": "Navigation", "lang.label": "Language", "common.cancel": "Cancel", "common.close": "Close", "common.open": "Open", "common.refresh": "Refresh", "common.save": "Save", "common.discard": "Discard",
    "common.download": "Download", "common.confirm": "Confirm?", "common.delete": "Delete", "common.none": "–", "common.error": "Error {n}", "common.view_tasks": "View tasks",
    "unit.files.one": "file", "unit.files.other": "files", "unit.members.one": "member", "unit.members.other": "members", "unit.items": "Items / type",
    "drive.title": "My .tar.gz files", "drive.sub": "Pick a file from your Drive. It is never downloaded in full and the original is never modified.", "drive.paste": "Paste a Drive file ID or sharing URL",
    "drive.panel": "Files on Drive", "drive.search": "Search by name…", "drive.cols.name": "Name", "drive.cols.size": "Size", "drive.cols.modified": "Modified", "drive.cols.index": "Index",
    "drive.empty": "No .tar.gz files found", "drive.empty_hint": "Only files whose name contains .tar.gz or .tgz are listed. If yours is named differently, paste its ID above.",
    "idx.badge.running": "Indexing {p}%", "idx.badge.done": "Indexed", "idx.badge.none": "No index", "idx.run": "Index", "idx.started": "Indexing started.",
    "browse.crumb.error": "Error", "browse.notfound": "Folder or file not found in this index.", "browse.search": "Search this archive…", "browse.unpacked": "uncompressed", "browse.on_drive": "on Drive",
    "browse.dl_folder": "Download folder", "browse.dl_all": "Download all", "browse.cards": "Cards", "browse.list": "List", "browse.mode": "View mode", "browse.index_link": "Index",
    "browse.folders": "Folders · {n}", "browse.files_n": "Files · {n}", "browse.empty": "Empty folder", "browse.results": "{n} results for “{q}”", "browse.nothing": "Nothing found", "browse.nothing_hint": "Try another part of the name or path.",
    "browse.partial": "Showing {a} of {b} items in this folder. Use search to find the rest.", "browse.dl_dir_tip": "Download folder (.zip)", "browse.dl_dir_aria": "Download folder {name}",
    "detail.composition": "Folder composition", "detail.dist": "Size distribution", "detail.loose": "Loose files and others", "detail.hint": "Click a file to preview it. Only the needed bytes are fetched from Drive.",
    "detail.path": "Path", "detail.binary": "Binary file: no preview. Use Download.", "detail.truncated": "… (preview truncated)", "detail.reading": "Reading the bytes from Drive…",
    "noidx.sub": "{size} on Drive · no index yet", "noidx.title": "Create index", "noidx.desc": "One streaming pass (the .tar.gz is never written to disk) builds a small index. After that the tree opens instantly and each file is read on demand. The original on Drive is not modified.",
    "noidx.save_in": "Save to", "noidx.checkpoints": "Checkpoints", "noidx.every": "every {n} MB", "noidx.download": "Download", "noidx.conns": "{a} connections × {c} MB", "noidx.upload": "Also upload the index to Drive (same folder as the original)",
    "noidx.create": "Create index", "noidx.adjust": "Change folder and settings", "noidx.reading": "Reading the file once to build the index.", "noidx.failed": "Failed: {e}", "noidx.cancelled": "Indexing cancelled.",
    "indexes.title": "Indexes", "indexes.sub": "Each index lets you open a .tar.gz instantly. They are stored in this folder on your computer.", "indexes.open_folder": "Open folder", "indexes.change_folder": "Change folder",
    "indexes.count": "{n} index(es)", "indexes.on_disk": "{size} on disk", "indexes.cols.file": "File", "indexes.cols.members": "Members", "indexes.cols.orig": "Original size", "indexes.cols.index": "Index", "indexes.cols.created": "Created",
    "indexes.rebuild": "Rebuild", "indexes.deleted": "Index deleted.", "indexes.empty": "No indexes yet", "indexes.empty_hint": "Open a file in “My Drive” and click Index.", "indexes.goto_drive": "Go to My Drive",
    "tasks.title": "Tasks", "tasks.sub": "Indexing jobs and downloads, running and finished. They run on the server and never block the app: navigate freely.", "tasks.tab.index": "Indexing", "tasks.tab.dl": "Downloads",
    "tasks.clear": "Clear finished", "tasks.empty_i": "No indexing jobs", "tasks.empty_i_hint": "When you index a file, its progress shows up here.", "tasks.empty_d": "No downloads", "tasks.empty_d_hint": "File and folder downloads show up here and run in the background.",
    "state.running": "Indexing", "state.done": "Done", "state.error": "Failed", "state.cancelled": "Cancelled", "state.preparing": "Preparing", "state.sending": "Downloading", "state.interrupted": "Interrupted",
    "job.saving_in": "Saving to {dir}", "job.uploading": " · uploading to Drive at the end", "job.of": " of ", "job.read": " read", "job.left": "left ",
    "dl.started": "Download started: {name}", "dl.see": "View downloads", "dl.preparing_file": "Locating the file inside the .tar.gz…", "dl.preparing_zip": "Reading Drive and building the .zip ({size})…", "dl.zip_note": "folder (.zip)", "dl.file_note": "file",
    "dl.interrupted": "interrupted", "dl.done_msg": "check your browser's download bar",
    "pill.index": "Indexing {p}%", "pill.dl": "Downloading {p}%", "pill.tasks": "{n} tasks",
    "perf.title": "Performance", "perf.sub": "Find out how many connections and what block size give the best speed with your Drive and your internet.", "perf.file": "Test file", "perf.depth": "Depth",
    "perf.fast": "Quick · 32 MB per test", "perf.std": "Standard · 64 MB per test", "perf.precise": "Precise · 128 MB per test", "perf.run": "Run test", "perf.speed_title": "Download speed (MB/s) · {name}",
    "perf.testing": "Testing {a}/{b}", "perf.stop": "Stop", "perf.finished": "Done", "perf.err": "Error", "perf.interrupted": "Interrupted", "perf.axis": "block \\ connections", "perf.cell": "block {c} MB × {a} connections",
    "perf.best": "Best: {r} MB/s", "perf.best_with": " with {c} MB blocks and {a} connections (RAM ≈ {ram} MB). ", "perf.decomp": "Decompression: {d} MB/s on one core, so the network is the bottleneck. ", "perf.limit": "Above ~16 connections Drive starts rejecting requests and speed drops.",
    "perf.apply": "Apply best setting", "perf.current": "Current: {a} connections × {c} MB", "perf.applied": "Applied: {a} connections × {c} MB.", "perf.none": "No test yet", "perf.none_hint": "The test downloads a few slices of the chosen file just to measure speed, without writing anything to disk (~1 to 2 GB of traffic).",
    "set.title": "Settings", "set.sub": "Everything is saved to settings.json next to the app and applies immediately, no restart needed.", "set.indexes": "Indexes", "set.dir": "Local indexes folder",
    "set.dir_hint": "Leave blank to use the default folder. The app checks it can write there before saving. In use: ", "set.spacing": "Checkpoint spacing", "set.spacing_hint": "Applies to future indexes. Measured in MB of the compressed file.",
    "set.sp8": "8 MB · faster extraction, bigger index", "set.sp32": "32 MB · balanced (default)", "set.sp128": "128 MB · smaller index, slower extraction", "set.upload": "Upload the index to Drive, in the same folder as the original",
    "set.download": "Download", "set.chunk": "Block size: {v}", "set.ahead": "Parallel connections: {v}", "set.ram": "Memory used ≈ {ram}. 8 to 16 connections is usually ideal. Beyond that Drive rejects requests. Use the Performance tab to measure.",
    "set.view": "Preview", "set.preview": "Text preview limit (KB)", "set.language": "Language", "set.account": "Account", "set.account_text": "Signed in as {email}. The app reads your files (read-only) and only creates the index file. To switch accounts, delete token.json and restart.",
    "set.saved": "Settings saved.", "me.quota_used": "{u} of {l} used", "me.quota_used_nolimit": "{u} used",
    "err.dir_not_writable": "Can't write to '{dir}': {reason}", "err.invalid_numbers": "Invalid numeric values.", "err.worker_exit": "The indexing process ended unexpectedly (code {code}). {tail}",
  },
};
const LANGS = { "pt-BR": "Português (Brasil)", "en-US": "English (US)" };
let LANG = (() => { try { const s = localStorage.getItem("lang"); if (MSG[s]) return s; } catch { /* sem storage */ } return (navigator.language || "").toLowerCase().startsWith("pt") ? "pt-BR" : "en-US"; })();
const tr = (k, p) => String(MSG[LANG][k] ?? MSG["pt-BR"][k] ?? k).replace(/\{(\w+)\}/g, (_, x) => (p && p[x] != null ? p[x] : ""));
const trn = (n, base) => tr(`${base}.${n === 1 ? "one" : "other"}`);
const apiErr = e => (e?.data?.code ? tr("err." + e.data.code, e.data.params) : e?.message || String(e));
function setLang(l) {
  LANG = l; try { localStorage.setItem("lang", l); } catch { /* sem storage */ }
  document.documentElement.lang = l; $("#side").setAttribute("aria-label", tr("nav.aria")); route();
}

// ---------------------------------------------------------------- utilidades
const $ = (s, r = document) => r.querySelector(s);
const add = (e, kids) => { for (const c of kids.flat(Infinity)) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c))); };
const h = (tag, a, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(a || {})) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (k === "style") e.style.cssText = v;
    else if (k === "for") e.htmlFor = v;
    else if (["value", "checked", "disabled", "type", "placeholder", "id", "title", "min", "max", "step", "href", "hidden"].includes(k)) e[k] = v;
    else e.setAttribute(k, v === true ? "" : v);
  }
  add(e, kids);
  return e;
};
const I = {
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  chev: '<path d="m9 18 6-6-6-6"/>',
  sliders: '<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  open: '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
  archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
};
const icon = (n, s = 18) => { const d = document.createElement("span"); d.style.display = "contents"; d.innerHTML = `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`; return d.firstChild; };
const spinner = () => h("span", { class: "spinner", "aria-hidden": "true" });

const fmt = n => { if (n == null) return tr("common.none"); const u = ["B", "KB", "MB", "GB", "TB"]; let i = 0; while (n >= 1024 && i < 4) { n /= 1024; i++; } return (i ? n.toLocaleString(LANG, { maximumFractionDigits: n < 10 ? 2 : 1 }) : n) + " " + u[i]; };
const dur = s => { s = Math.max(0, Math.round(s)); if (s < 60) return s + " s"; const hh = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return hh ? `${hh} h ${String(m).padStart(2, "0")} min` : `${m} min`; };
const date = s => (s ? new Date(s).toLocaleDateString(LANG, { day: "2-digit", month: "short", year: "numeric" }) : tr("common.none"));
const num = n => (n ?? 0).toLocaleString(LANG);

async function api(path, opts = {}) {
  const r = await fetch(path, { method: opts.method || (opts.body ? "POST" : "GET"), headers: { "Content-Type": "application/json" }, body: opts.body ? JSON.stringify(opts.body) : undefined });
  let j = null; try { j = await r.json(); } catch { /* sem corpo */ }
  if (!r.ok) { const e = new Error(j?.code ? tr("err." + j.code, j.params) : j?.error || tr("common.error", { n: r.status })); e.status = r.status; e.data = j; throw e; }
  return j;
}
function toast(msg, err, link) {
  const t = h("div", { class: "toast" + (err ? " err" : "") }, msg, link ? h("a", { href: link[0], class: "toast-link" }, link[1]) : null);
  $("#toasts").append(t); setTimeout(() => t.remove(), 5200);
}
const debounce = (f, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; };

const EXT = { pdf: ["PDF", "#d1344b"], doc: ["DOC", "#2b6cd0"], docx: ["DOC", "#2b6cd0"], xls: ["XLS", "#14804f"], xlsx: ["XLS", "#14804f"], csv: ["CSV", "#14804f"],
  ppt: ["PPT", "#d9622b"], pptx: ["PPT", "#d9622b"], jpg: ["IMG", "#7a52d1"], jpeg: ["IMG", "#7a52d1"], png: ["IMG", "#7a52d1"], gif: ["IMG", "#7a52d1"], webp: ["IMG", "#7a52d1"], heic: ["IMG", "#7a52d1"],
  mp4: ["VID", "#c2418b"], mkv: ["VID", "#c2418b"], mov: ["VID", "#c2418b"], avi: ["VID", "#c2418b"], mp3: ["AUD", "#0f9d8a"], wav: ["AUD", "#0f9d8a"], flac: ["AUD", "#0f9d8a"],
  zip: ["ZIP", "#c58516"], rar: ["ZIP", "#c58516"], "7z": ["ZIP", "#c58516"], gz: ["ZIP", "#c58516"], tar: ["ZIP", "#c58516"],
  txt: ["TXT", "#6a7282"], md: ["MD", "#6a7282"], log: ["LOG", "#6a7282"], json: ["JSON", "#6a7282"], js: ["JS", "#b8860b"], py: ["PY", "#2b6cd0"], html: ["HTML", "#d9622b"], css: ["CSS", "#7a52d1"], exe: ["EXE", "#6a7282"], dll: ["DLL", "#6a7282"] };
function ftile(name) {
  const ext = (name.includes(".") ? name.split(".").pop() : "").toLowerCase();
  const [label, color] = EXT[ext] || [ext ? ext.slice(0, 4).toUpperCase() : "FILE", "#6a7282"];
  return h("div", { class: "ftile", style: `--tc:${color}` }, label);
}
const PAL = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)", "var(--c6)"];

// ---------------------------------------------------------------- estado global
const S = { settings: null, me: null, jobs: [], dls: [], drive: [], hook: null, tree: null, sel: null, mode: "cards", search: "", searchRes: null, fid: null, path: "", pop: false, tab: "index", nsig: "" };
const main = () => $("#main");
const showDetail = on => { $("#detail").hidden = !on; $(".body").classList.toggle("with-detail", on); };
const runningJobs = () => S.jobs.filter(j => j.state === "running");
const activeDls = () => S.dls.filter(d => d.state === "preparing" || d.state === "sending");
const pctOf = (done, total) => (total ? Math.min(100, 100 * done / total) : 0);
const jpct = j => pctOf(j.got, j.size);
const dpct = d => pctOf(d.sent, d.total);
const curView = () => { const v = location.hash.slice(2).split(/[/?]/)[0] || "drive"; return v === "jobs" ? "tasks" : v; };

// ---------------------------------------------------------------- casca (sidebar + topo)
const NAV = [["drive", "nav.drive", "cloud"], ["browse", "nav.browse", "folder"], ["indexes", "nav.indexes", "db"], ["tasks", "nav.tasks", "activity"], ["perf", "nav.perf", "gauge"], ["settings", "nav.settings", "sliders"]];
function renderSide(view) {
  const side = $("#side"); side.replaceChildren();
  const quota = S.me?.storageQuota, used = +quota?.usage || 0, lim = +quota?.limit || 0, nTasks = runningJobs().length + activeDls().length;
  add(side, [
    h("div", { class: "brand" }, h("div", { class: "logo" }, icon("archive", 17)), "Tar Explorer"),
    h("div", { class: "nav-label" }, tr("nav.menu")),
    NAV.map(([k, label, ic]) => {
      const disabled = k === "browse" && !S.fid;
      const badge = k === "tasks" && nTasks ? h("span", { class: "badge acc" }, nTasks) : null;
      return h("a", { class: "nav" + (view === k ? " on" : ""), href: k === "browse" ? (S.fid ? `#/browse/${S.fid}` : "#/drive") : `#/${k}`, "aria-disabled": disabled ? "true" : null, onclick: () => { $("#side").classList.remove("open"); $("#scrim").classList.remove("open"); } }, icon(ic), tr(label), badge);
    }),
    h("div", { class: "side-foot" },
      h("div", { class: "seg lang", role: "group", "aria-label": tr("lang.label") }, Object.keys(LANGS).map(l => h("button", { class: l === LANG ? "on" : "", title: LANGS[l], onclick: () => setLang(l) }, l === "pt-BR" ? "PT" : "EN"))),
      quota ? h("div", { class: "quota" },
        h("div", { class: "row" }, icon("cloud", 16), h("b", null, "Google Drive")),
        lim ? h("div", { class: "bar" }, h("i", { style: `width:${Math.min(100, 100 * used / lim)}%` })) : null,
        h("div", { class: "muted num" }, lim ? tr("me.quota_used", { u: fmt(used), l: fmt(lim) }) : tr("me.quota_used_nolimit", { u: fmt(used) }))) : null,
      S.me ? h("div", { class: "who" },
        h("div", { class: "avatar" }, S.me.user.photoLink ? h("img", { src: S.me.user.photoLink, alt: "", referrerpolicy: "no-referrer" }) : (S.me.user.displayName || "?")[0]),
        h("div", { class: "t" }, h("div", { style: "font-weight:600" }, S.me.user.displayName), h("div", { class: "muted", style: "font-size:12px" }, S.me.user.emailAddress))) : null)]);
}
function renderTop(crumbs, searchBox) {
  const top = $("#top"); top.replaceChildren();
  add(top, [
    h("button", { class: "icon-btn menu-btn", "aria-label": tr("nav.toggle"), onclick: toggleNav }, icon("menu")),
    h("nav", { class: "crumbs", "aria-label": "Path" }, crumbs.map((c, i) => [i ? h("span", { class: "sep" }, icon("chev", 14)) : null,
      c.go ? h("button", { class: "crumb", onclick: c.go }, c.label) : h("span", { class: "crumb last" }, c.label)])),
    searchBox,
    pillEl()]);
}
const searchBox = (ph, val, on) => h("label", { class: "search" }, icon("search", 16), h("input", { type: "search", placeholder: ph, value: val || "", "aria-label": ph, oninput: e => on(e.target.value) }));
function toggleNav() {
  if (innerWidth <= 860) { $("#side").classList.add("open"); $("#scrim").classList.add("open"); return; }
  const c = $(".shell").classList.toggle("collapsed");
  try { localStorage.setItem("nav-collapsed", c ? "1" : ""); } catch { /* sem storage */ }
}

// ---------------------------------------------------------------- tarefas ativas (selo do topo + popover)
function tasksNow() {
  return [...runningJobs().map(j => ({ k: "i" + j.id, kind: "index", name: j.name, pct: jpct(j), rate: j.rate, eta: j.eta, cancel: () => api("/api/index/cancel", { body: { file: j.id } }) })),
    ...activeDls().map(d => ({ k: "d" + d.id, kind: "dl", name: d.name, pct: dpct(d), rate: d.rate, eta: d.eta, cancel: () => api("/api/downloads/cancel", { body: { id: d.id } }) }))];
}
const pillLabel = ts => (ts.length === 1 ? tr(ts[0].kind === "index" ? "pill.index" : "pill.dl", { p: ts[0].pct.toFixed(0) }) : tr("pill.tasks", { n: ts.length }));
const taskMeta = t => `${t.pct.toFixed(1)}%${t.rate ? ` · ${fmt(t.rate)}/s · ${tr("job.left")}${dur(t.eta)}` : ""}`;
function pillEl() {
  const ts = tasksNow();
  if (!ts.length) { S.pop = false; return null; }
  return h("div", { class: "pillwrap" },
    h("button", { class: "pill", "aria-haspopup": "true", "aria-expanded": String(!!S.pop), onclick: e => { e.stopPropagation(); S.pop = !S.pop; renderTopPill(); } },
      h("span", { class: "dot" }), h("span", { class: "pill-label" }, pillLabel(ts))),
    S.pop ? popEl(ts) : null);
}
function popEl(ts) {
  return h("div", { class: "pop", "data-ids": ts.map(t => t.k).join(), onclick: e => e.stopPropagation() },
    ts.map(t => h("div", { class: "pop-job", "data-id": t.k },
      h("div", { class: "pop-top" }, h("b", { class: "pop-name", title: t.name }, h("span", { class: "muted" }, t.kind === "index" ? "◆ " : "↓ "), t.name),
        h("button", { class: "icon-btn", title: tr("common.cancel"), "aria-label": `${tr("common.cancel")} ${t.name}`, onclick: () => t.cancel().then(refresh) }, icon("x", 15))),
      h("div", { class: "bar" }, h("i", { style: `width:${t.pct}%` })),
      h("div", { class: "muted num pop-meta" }, taskMeta(t)))),
    h("a", { class: "btn sm", href: "#/tasks" }, tr("common.view_tasks")));
}
function renderTopPill() {
  // Atualiza no lugar (texto e barras): trocar elementos engoliria cliques.
  const ts = tasksNow(), wrap = $("#top .pillwrap");
  if (!ts.length) { S.pop = false; if (wrap) wrap.remove(); return; }
  if (!wrap) { const el = pillEl(); if (el) $("#top").append(el); return; }
  $(".pill-label", wrap).textContent = pillLabel(ts);
  $(".pill", wrap).setAttribute("aria-expanded", String(!!S.pop));
  const pop = $(".pop", wrap), ids = ts.map(t => t.k).join();
  if (!S.pop) { if (pop) pop.remove(); return; }
  if (!pop || pop.dataset.ids !== ids) { if (pop) pop.remove(); wrap.append(popEl(ts)); return; }
  for (const t of ts) {
    const row = pop.querySelector(`[data-id="${t.k}"]`);
    if (row) { $(".bar > i", row).style.width = t.pct + "%"; $(".pop-meta", row).textContent = taskMeta(t); }
  }
}

// ---------------------------------------------------------------- roteador
function route() {
  const hash = location.hash.slice(2) || "drive";
  const [pathPart, qs] = hash.split("?");
  const parts = pathPart.split("/"), view = parts[0] === "jobs" ? "tasks" : parts[0];
  S.hook = null; showDetail(false);
  if (view === "browse") {
    const fid = parts[1] || S.fid;
    if (!fid) { location.hash = "#/drive"; return; }
    if (fid !== S.fid) { S.fid = fid; S.search = ""; S.searchRes = null; }
    S.path = decodeURIComponent(new URLSearchParams(qs || "").get("p") || ""); S.sel = null;
  }
  renderSide(view);
  ({ drive: vDrive, browse: vBrowse, indexes: vIndexes, tasks: vTasks, perf: vPerf, settings: vSettings }[view] || vDrive)();
}
const go = (fid, path) => { location.hash = `#/browse/${fid}` + (path ? `?p=${encodeURIComponent(path)}` : ""); };

// ---------------------------------------------------------------- Meu Drive
function idxBadge(f) {
  if (f.job === "running") return h("span", { class: "badge acc" }, tr("idx.badge.running", { p: (100 * f.progress).toFixed(0) }));
  if (f.indexed) return h("span", { class: "badge good" }, icon("check", 12), tr("idx.badge.done"));
  return h("span", { class: "badge" }, tr("idx.badge.none"));
}
async function startIndex(fid, upload) {
  try { await api("/api/index/start", { body: { file: fid, ...(upload == null ? {} : { upload }) } }); await refresh(); toast(tr("idx.started")); } catch (e) { toast(apiErr(e), true); throw e; }
}
async function vDrive() {
  renderTop([{ label: tr("nav.drive") }]);
  let q = "";
  const tbody = h("tbody"), pasteIn = h("input", { class: "input", placeholder: tr("drive.paste"), id: "paste", "aria-label": tr("drive.paste") });
  const draw = () => {
    tbody.replaceChildren();
    if (!S.drive.length) { tbody.append(h("tr", null, h("td", { colspan: 5 }, h("div", { class: "empty" }, h("div", { class: "ic" }, icon("search")), h("h2", null, tr("drive.empty")), h("p", null, tr("drive.empty_hint")))))); return; }
    for (const f of S.drive) tbody.append(h("tr", { class: "click", onclick: () => go(f.id) },
      h("td", null, h("div", { class: "name-cell" }, h("div", { class: "ftile", style: "--tc:#c58516" }, "TGZ"), h("div", { class: "t" }, f.name))),
      h("td", { class: "num" }, fmt(+f.size)), h("td", { class: "muted" }, date(f.modifiedTime)), h("td", null, idxBadge(f)),
      h("td", { class: "r" }, f.indexed ? h("button", { class: "btn sm", onclick: e => { e.stopPropagation(); go(f.id); } }, icon("folder", 15), tr("common.open"))
        : f.job === "running" ? h("button", { class: "btn sm", onclick: e => { e.stopPropagation(); location.hash = "#/tasks"; } }, tr("common.view_tasks"))
        : h("button", { class: "btn sm primary", onclick: e => { e.stopPropagation(); startIndex(f.id).then(() => go(f.id)); } }, icon("play", 14), tr("idx.run")))));
  };
  const load = async () => {
    tbody.replaceChildren(h("tr", null, h("td", { colspan: 5 }, h("div", { class: "skeleton" }))));
    try { S.drive = await api("/api/drive?q=" + encodeURIComponent(q)); } catch (e) { S.drive = []; toast(apiErr(e), true); }
    draw();
  };
  let sig = ""; S.hook = async () => { try { const d = await api("/api/drive?q=" + encodeURIComponent(q)), k = JSON.stringify(d); if (k !== sig) { sig = k; S.drive = d; draw(); } } catch { /* ignora */ } };
  const open = () => { const v = pasteIn.value.trim(); if (!v) return; const m = v.match(/\/d\/([\w-]+)|[?&]id=([\w-]+)/); go(m ? (m[1] || m[2]) : v); };
  pasteIn.onkeydown = e => e.key === "Enter" && open();
  main().replaceChildren(h("div", { class: "stack" },
    h("div", { class: "head" }, h("div", null, h("h1", null, tr("drive.title")), h("p", null, tr("drive.sub")))),
    h("div", { class: "row" }, pasteIn, h("button", { class: "btn primary", onclick: open }, tr("common.open"))),
    h("div", { class: "panel" },
      h("div", { class: "panel-head" }, h("h2", null, tr("drive.panel")),
        h("div", { class: "actions" }, searchBox(tr("drive.search"), "", debounce(v => { q = v; load(); }, 350)), h("button", { class: "icon-btn", title: tr("common.refresh"), "aria-label": tr("common.refresh"), onclick: load }, icon("refresh")))),
      h("div", { class: "tbl-wrap" }, h("table", null, h("thead", null, h("tr", null, ["drive.cols.name", "drive.cols.size", "drive.cols.modified", "drive.cols.index", ""].map((k, i) => h("th", { class: i === 4 ? "r" : "" }, k && tr(k))))), tbody)))));
  load();
}

// ---------------------------------------------------------------- downloads
const dlFile = it => download(`/api/file?file=${S.fid}&path=${encodeURIComponent(it.path)}&download=1`, it.name);
const dlFolder = it => download(`/api/folder?file=${S.fid}&path=${encodeURIComponent(it.path)}`, `${it.name}.zip`);
function download(url, name) {
  // O navegador faz o download; o servidor registra e mostra o progresso em Tarefas, sem bloquear a tela.
  const a = h("a", { href: url, download: "" });
  document.body.append(a); a.click(); a.remove();
  toast(tr("dl.started", { name }), false, ["#/tasks", tr("dl.see")]);
  S.tab = "dl";
  setTimeout(refresh, 700); setTimeout(refresh, 2000);
}

// ---------------------------------------------------------------- Explorar
async function vBrowse() {
  const fid = S.fid;
  renderTop([{ label: tr("nav.drive"), go: () => (location.hash = "#/drive") }, { label: "…" }]);
  main().replaceChildren(h("div", { class: "stack" }, h("div", { class: "skeleton", style: "width:40%;height:28px" }), h("div", { class: "skeleton" }), h("div", { class: "skeleton" })));
  try {
    S.tree = await api(`/api/tree?file=${fid}&path=${encodeURIComponent(S.path)}`);
  } catch (e) {
    if (e.status === 409 && e.data?.noindex) return noIndex(e.data);
    renderTop([{ label: tr("nav.drive"), go: () => (location.hash = "#/drive") }, { label: tr("browse.crumb.error") }]);
    main().replaceChildren(h("div", { class: "alert" }, icon("alert"), e.status === 404 ? tr("browse.notfound") : apiErr(e)));
    return;
  }
  drawBrowse();
}
function crumbsFor() {
  const parts = S.path ? S.path.split("/") : [];
  const list = [{ label: tr("nav.drive"), go: () => (location.hash = "#/drive") }, { label: S.tree.file.name, go: parts.length ? () => go(S.fid, "") : null }];
  parts.forEach((p, i) => list.push({ label: p, go: i < parts.length - 1 ? () => go(S.fid, parts.slice(0, i + 1).join("/")) : null }));
  return list;
}
function drawBrowse() {
  const tree = S.tree, f = tree.file;
  renderTop(crumbsFor(), searchBox(tr("browse.search"), S.search, debounce(async v => {
    S.search = v;
    if (v.trim().length < 2) { S.searchRes = null; return drawBody(); }
    try { S.searchRes = (await api(`/api/search?file=${S.fid}&q=${encodeURIComponent(v)}`)).items; } catch (e) { toast(apiErr(e), true); }
    drawBody();
  }, 300)));
  const body = h("div", { id: "bbody", class: "stack" });
  main().replaceChildren(
    h("div", { class: "stack" },
      h("div", { class: "head" },
        h("div", null, h("h1", null, S.path ? S.path.split("/").pop() : f.name),
          h("div", { class: "chips", style: "margin-top:10px" },
            h("span", { class: "chip" }, h("b", { class: "num" }, num(tree.count)), trn(tree.count, "unit.files")),
            h("span", { class: "chip" }, h("b", { class: "num" }, fmt(tree.size)), tr("browse.unpacked")),
            !S.path ? h("span", { class: "chip" }, h("b", { class: "num" }, fmt(f.gz_size)), tr("browse.on_drive")) : null)),
        h("div", { class: "actions" },
          tree.count ? h("button", { class: "btn", onclick: () => dlFolder({ path: S.path, name: S.path ? S.path.split("/").pop() : f.name.replace(/\.(tar\.gz|tgz)$/i, ""), size: tree.size }) }, icon("download", 16), tr(S.path ? "browse.dl_folder" : "browse.dl_all")) : null,
          h("div", { class: "seg", role: "group", "aria-label": tr("browse.mode") },
            h("button", { class: S.mode === "cards" ? "on" : "", onclick: () => { S.mode = "cards"; drawBody(); syncSeg(); } }, icon("grid", 15), tr("browse.cards")),
            h("button", { class: S.mode === "list" ? "on" : "", onclick: () => { S.mode = "list"; drawBody(); syncSeg(); } }, icon("list", 15), tr("browse.list"))),
          h("a", { class: "btn", href: "#/indexes" }, icon("db", 16), tr("browse.index_link")))),
      body));
  drawBody(); drawDetail();
}
function syncSeg() { const b = $(".head .seg"); if (b) [...b.children].forEach((x, i) => x.classList.toggle("on", (i === 0) === (S.mode === "cards"))); }
function row(it, showPath) {
  const ext = it.name.includes(".") ? it.name.split(".").pop().toUpperCase() : tr("common.none");
  return h("tr", { class: "click" + (S.sel === it.path ? " sel" : ""), onclick: () => (it.dir ? go(S.fid, it.path) : selectFile(it)) },
    h("td", null, h("div", { class: "name-cell" }, it.dir ? h("div", { class: "ftile", style: "--tc:var(--c1)" }, icon("folder", 16)) : ftile(it.name),
      h("div", { class: "t" }, it.name, showPath ? h("div", { class: "muted mono", style: "font-weight:400;overflow:hidden;text-overflow:ellipsis" }, it.path.slice(0, -it.name.length - 1) || "/") : null))),
    h("td", { class: "r num" }, fmt(it.size)), h("td", { class: "muted r num" }, it.dir ? `${num(it.count)} ${trn(it.count, "unit.files")}` : ext),
    h("td", { class: "r", style: "width:1%" }, h("button", { class: "icon-btn", title: it.dir ? tr("browse.dl_dir_tip") : tr("common.download"), "aria-label": `${tr("common.download")} ${it.name}`, onclick: e => { e.stopPropagation(); it.dir ? dlFolder(it) : dlFile(it); } }, icon("download", 16))));
}
function table(items, showPath) {
  return h("div", { class: "panel" }, h("div", { class: "tbl-wrap" }, h("table", null,
    h("thead", null, h("tr", null, h("th", null, tr("drive.cols.name")), h("th", { class: "r" }, tr("drive.cols.size")), h("th", { class: "r" }, tr("unit.items")), h("th", null, ""))),
    h("tbody", null, items.map(i => row(i, showPath))))));
}
function drawBody() {
  const body = $("#bbody"); if (!body) return; body.replaceChildren();
  if (S.searchRes) {
    body.append(h("div", { class: "head", style: "margin:0" }, h("h2", null, tr("browse.results", { n: num(S.searchRes.length) + (S.searchRes.length === 300 ? "+" : ""), q: S.search }))));
    body.append(S.searchRes.length ? table(S.searchRes, true) : h("div", { class: "card empty" }, h("div", { class: "ic" }, icon("search")), h("h2", null, tr("browse.nothing")), h("p", null, tr("browse.nothing_hint"))));
    return;
  }
  const items = S.tree.items, dirs = items.filter(i => i.dir), files = items.filter(i => !i.dir);
  if (!items.length) { body.append(h("div", { class: "card empty" }, h("div", { class: "ic" }, icon("folder")), h("h2", null, tr("browse.empty")))); return; }
  if (S.mode === "cards") {
    if (dirs.length) body.append(h("section", { class: "stack", style: "gap:12px" }, h("h2", null, tr("browse.folders", { n: num(dirs.length) })),
      h("div", { class: "folders" }, dirs.map((d, i) => h("div", { class: "fwrap" },
        h("button", { class: "icon-btn dlbtn", title: tr("browse.dl_dir_tip"), "aria-label": tr("browse.dl_dir_aria", { name: d.name }), onclick: () => dlFolder(d) }, icon("download", 16)),
        h("button", { class: "fcard", onclick: () => go(S.fid, d.path) },
          h("div", { class: "fi", style: `--tc:${PAL[i % 6]}` }, icon("folder", 20)), h("div", { class: "n" }, d.name), h("div", { class: "m num" }, `${num(d.count)} ${trn(d.count, "unit.files")} · ${fmt(d.size)}`)))))));
    if (files.length) body.append(h("section", { class: "stack", style: "gap:12px" }, h("h2", null, tr("browse.files_n", { n: num(files.length) })), table(files)));
  } else body.append(table(items));
  if (S.tree.total > items.length) body.append(h("div", { class: "note" }, icon("alert", 16), tr("browse.partial", { a: num(items.length), b: num(S.tree.total) })));
}
function drawDetail() {
  const d = $("#detail"); showDetail(true); d.replaceChildren();
  const tree = S.tree, dirs = tree.items.filter(i => i.dir).sort((a, b) => b.size - a.size);
  const tot = dirs.reduce((s, x) => s + x.size, 0) + tree.items.filter(i => !i.dir).reduce((s, x) => s + x.size, 0) || 1;
  const top = dirs.slice(0, 6), rest = tot - top.reduce((s, x) => s + x.size, 0);
  add(d, [h("div", { class: "head", style: "margin-bottom:12px" }, h("h2", null, tr("detail.composition"))),
    h("div", { class: "bar stacked", role: "img", "aria-label": tr("detail.dist") }, top.map((x, i) => h("i", { style: `width:${100 * x.size / tot}%;background:${PAL[i]}`, title: `${x.name}: ${fmt(x.size)}` })), rest > 0 ? h("i", { style: `width:${100 * rest / tot}%;background:var(--line-strong)` }) : null),
    h("div", { class: "legend" }, top.map((x, i) => h("div", { class: "li" }, h("span", { class: "sw", style: `background:${PAL[i]}` }), h("span", null, x.name), h("span", { class: "muted num" }, fmt(x.size)))),
      rest > 0 ? h("div", { class: "li" }, h("span", { class: "sw", style: "background:var(--line-strong)" }), h("span", null, tr("detail.loose")), h("span", { class: "muted num" }, fmt(rest))) : null),
    h("div", { class: "note", style: "margin-top:20px" }, icon("db", 16), tr("detail.hint"))]);
}
async function selectFile(it) {
  S.sel = it.path; drawBody();
  const d = $("#detail"); showDetail(true); d.replaceChildren();
  const qs = new URLSearchParams({ file: S.fid, path: it.path });
  const pv = h("div", null, h("div", { class: "loading" }, spinner(), tr("detail.reading")));
  add(d, [h("div", { class: "head", style: "margin-bottom:12px" }, h("h2", { style: "overflow-wrap:anywhere" }, it.name), h("button", { class: "icon-btn", "aria-label": tr("common.close"), onclick: () => { S.sel = null; drawBody(); drawDetail(); } }, icon("x"))),
    h("div", { class: "name-cell", style: "margin-bottom:14px" }, ftile(it.name), h("div", { class: "muted num" }, fmt(it.size))),
    h("button", { class: "btn primary", onclick: () => dlFile(it) }, icon("download", 16), tr("common.download")),
    h("dl", { class: "kv", style: "margin-top:16px" }, h("dt", null, tr("detail.path")), h("dd", { class: "mono" }, it.path)), pv]);
  try {
    const j = await api("/api/file?" + qs);
    pv.replaceChildren(j.binary ? h("div", { class: "note", style: "margin-top:14px" }, icon("alert", 16), tr("detail.binary"))
      : h("pre", { class: "preview" }, j.text + (j.truncated ? "\n\n" + tr("detail.truncated") : "")));
  } catch (e) { pv.replaceChildren(h("div", { class: "alert", style: "margin-top:14px" }, icon("alert", 16), apiErr(e))); }
}

// ---------------------------------------------------------------- sem indice
const jobError = j => (j.error_code ? tr("err." + j.error_code, j.error_params) : j.error || "");
function noIndex(data) {
  const file = data.file, fid = S.fid;
  renderTop([{ label: tr("nav.drive"), go: () => (location.hash = "#/drive") }, { label: file.name }]);
  const box = h("div", { class: "hero" });
  let card = null;
  const draw = () => {
    const job = S.jobs.find(j => j.id === fid) || data.job;
    if (job?.state === "running") {
      if (!card) { box.replaceChildren(h("div", null, h("h1", null, file.name), h("p", { class: "muted" }, tr("noidx.reading")))); card = mkCard(job, "index"); box.append(card); } else card.upd(job);
      return;
    }
    card = null; box.replaceChildren();
    add(box, [h("div", null, h("h1", null, file.name), h("p", { class: "muted" }, tr("noidx.sub", { size: fmt(file.size) }))),
      h("div", { class: "card pad", style: "display:grid;gap:16px" },
        h("div", null, h("h2", null, tr("noidx.title")), h("p", { class: "muted", style: "margin:6px 0 0" }, tr("noidx.desc"))),
        h("dl", { class: "kv" }, h("dt", null, tr("noidx.save_in")), h("dd", { class: "mono" }, S.settings.index_dir_effective),
          h("dt", null, tr("noidx.checkpoints")), h("dd", null, tr("noidx.every", { n: S.settings.spacing_mb })), h("dt", null, tr("noidx.download")), h("dd", null, tr("noidx.conns", { a: S.settings.ahead, c: S.settings.chunk_mb }))),
        h("label", { class: "toggle" }, h("input", { type: "checkbox", id: "up", checked: S.settings.upload }), tr("noidx.upload")),
        h("div", { class: "actions" },
          h("button", { class: "btn primary", onclick: async () => { try { await startIndex(fid, $("#up").checked); draw(); } catch { /* toast ja mostrado */ } } }, icon("play", 15), tr("noidx.create")),
          h("a", { class: "btn", href: "#/settings" }, icon("sliders", 15), tr("noidx.adjust"))),
        job?.state === "error" ? h("div", { class: "alert" }, icon("alert"), tr("noidx.failed", { e: jobError(job) })) : job?.state === "cancelled" ? h("div", { class: "note" }, tr("noidx.cancelled")) : null)]);
  };
  main().replaceChildren(box); draw();
  let last = S.jobs.find(j => j.id === fid)?.state;
  S.hook = () => {
    const job = S.jobs.find(j => j.id === fid);
    if (job?.state === "done") return vBrowse();
    if (job?.state === "running" || job?.state !== last) { last = job?.state; draw(); }
  };
}

// ---------------------------------------------------------------- Indices
function confirmBtn(label, fn) {
  const b = h("button", { class: "btn sm danger" }, icon("trash", 14), label);
  let armed = false, t;
  b.onclick = () => { if (!armed) { armed = true; b.replaceChildren(tr("common.confirm")); t = setTimeout(() => { armed = false; b.replaceChildren(icon("trash", 14), label); }, 3000); } else { clearTimeout(t); fn(); } };
  return b;
}
async function vIndexes() {
  renderTop([{ label: tr("nav.indexes") }]);
  const wrap = h("div", { class: "stack" });
  main().replaceChildren(wrap);
  const load = async () => {
    let d; try { d = await api("/api/indexes"); } catch (e) { wrap.replaceChildren(h("div", { class: "alert" }, icon("alert"), apiErr(e))); return; }
    const totalSize = d.items.reduce((s, x) => s + x.file_size, 0);
    wrap.replaceChildren(
      h("div", { class: "head" }, h("div", null, h("h1", null, tr("indexes.title")), h("p", null, tr("indexes.sub"))),
        h("div", { class: "actions" }, h("span", { class: "chip mono", title: d.dir }, d.dir), h("button", { class: "btn", onclick: () => api("/api/open-folder", { method: "POST", body: {} }).catch(e => toast(apiErr(e), true)) }, icon("open", 16), tr("indexes.open_folder")), h("a", { class: "btn", href: "#/settings" }, icon("sliders", 16), tr("indexes.change_folder")))),
      d.items.length ? h("div", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", null, tr("indexes.count", { n: d.items.length })), h("span", { class: "muted num" }, tr("indexes.on_disk", { size: fmt(totalSize) }))),
        h("div", { class: "tbl-wrap" }, h("table", null, h("thead", null, h("tr", null, ["indexes.cols.file", "indexes.cols.members", "indexes.cols.orig", "indexes.cols.index", "indexes.cols.created", ""].map((k, i) => h("th", { class: i === 5 ? "r" : "" }, k && tr(k))))),
          h("tbody", null, d.items.map(x => h("tr", null,
            h("td", null, h("div", { class: "name-cell" }, h("div", { class: "ftile", style: "--tc:#c58516" }, "TGZ"), h("div", { class: "t" }, x.name || x.id))),
            h("td", { class: "num" }, x.count != null ? num(x.count) : tr("common.none")), h("td", { class: "num" }, fmt(x.gz_size)), h("td", { class: "num" }, fmt(x.file_size)), h("td", { class: "muted" }, date(x.created)),
            h("td", { class: "r" }, h("div", { class: "actions", style: "justify-content:flex-end" },
              h("button", { class: "btn sm", onclick: () => go(x.id) }, icon("folder", 14), tr("common.open")),
              h("button", { class: "btn sm", onclick: async () => { await api("/api/indexes/" + x.id, { method: "DELETE" }); await startIndex(x.id); location.hash = "#/tasks"; } }, icon("refresh", 14), tr("indexes.rebuild")),
              confirmBtn(tr("common.delete"), async () => { await api("/api/indexes/" + x.id, { method: "DELETE" }); toast(tr("indexes.deleted")); load(); })))))))))
        : h("div", { class: "card empty" }, h("div", { class: "ic" }, icon("db")), h("h2", null, tr("indexes.empty")), h("p", null, tr("indexes.empty_hint")), h("a", { class: "btn primary", href: "#/drive" }, tr("indexes.goto_drive"))));
  };
  load();
}

// ---------------------------------------------------------------- Tarefas (indexacoes e downloads)
function mkCard(j, kind) {
  // Cartao atualizado no lugar (upd): nao e reconstruido a cada poll, entao os cliques nao se perdem.
  const isDl = kind === "dl";
  const badge = h("span", { class: "badge" }), actions = h("div", { class: "actions" }), barI = h("i", { style: "width:0%" }), barEl = h("div", { class: "bar" }, barI);
  const stats = h("div", { class: "stats num" }), meta = h("div", { class: "muted", style: "font-size:12.5px" }), err = h("div", { class: "alert", hidden: true });
  const el = h("div", { class: "card job" }, h("div", { class: "top-row" }, h("div", { class: "name-cell" }, isDl ? h("div", { class: "ftile", style: "--tc:var(--accent)" }, icon("download", 16)) : h("div", { class: "ftile", style: "--tc:#c58516" }, "TGZ"), h("div", { class: "t" }, j.name)), h("div", { class: "actions" }, badge, actions)), barEl, stats, meta, err);
  let lastState = null;
  el.upd = j => {
    const run = isDl ? (j.state === "preparing" || j.state === "sending") : j.state === "running";
    const cls = { running: "acc", sending: "acc", preparing: "acc", done: "good", error: "bad", cancelled: "", interrupted: "" }[j.state];
    badge.className = "badge " + cls; badge.textContent = tr("state." + j.state);
    if (lastState !== j.state) {
      lastState = j.state; actions.replaceChildren();
      if (run) actions.append(h("button", { class: "btn sm danger", onclick: () => api(isDl ? "/api/downloads/cancel" : "/api/index/cancel", { body: isDl ? { id: j.id } : { file: j.id } }).then(refresh) }, icon("x", 14), tr("common.cancel")));
      else if (!isDl && j.state === "done") actions.append(h("button", { class: "btn sm", onclick: () => go(j.id) }, icon("folder", 14), tr("common.open")));
    }
    const pct = isDl ? dpct(j) : jpct(j), done = isDl ? j.sent : j.got, size = isDl ? j.total : j.size, preparing = isDl && j.state === "preparing";
    barEl.hidden = !(run || j.state === "done"); barEl.classList.toggle("indet", preparing);
    barI.style.width = (j.state === "done" ? 100 : pct) + "%";
    stats.replaceChildren(...(preparing ? [h("span", null, j.kind === "zip" ? tr("dl.preparing_zip", { size: fmt(size) }) : tr("dl.preparing_file"))]
      : [h("span", null, h("b", null, run ? pct.toFixed(1) + "%" : fmt(isDl ? done : size)), run ? ` · ${fmt(Math.min(done, size))}${tr("job.of")}${fmt(size)}` : isDl ? "" : tr("job.read")),
        run && j.rate ? h("span", null, h("b", null, fmt(j.rate) + "/s")) : null, run && j.rate ? h("span", null, tr("job.left"), h("b", null, dur(j.eta))) : null,
        isDl ? (j.files ? h("span", null, h("b", null, num(j.files)), " " + trn(j.files, "unit.files")) : null) : h("span", null, h("b", null, num(j.members)), " " + trn(j.members, "unit.members"))]).filter(Boolean));
    meta.textContent = isDl ? (j.kind === "zip" ? tr("dl.zip_note") : tr("dl.file_note")) + (j.state === "done" ? " · " + tr("dl.done_msg") : j.state === "interrupted" ? " · " + tr("dl.interrupted") : "")
      : tr("job.saving_in", { dir: j.dir }) + (j.upload ? tr("job.uploading") : "");
    const em = isDl ? j.error : jobError(j);
    err.hidden = !em; err.replaceChildren(...(em ? [icon("alert", 16), em] : []));
  };
  el.upd(j);
  return el;
}
function liveList(box, items, kind) {
  const have = new Map([...box.children].map(c => [c.dataset.k, c]));
  items.forEach((it, i) => {
    let c = have.get(it.id);
    if (c) { c.upd(it); have.delete(it.id); } else { c = mkCard(it, kind); c.dataset.k = it.id; }
    if (box.children[i] !== c) box.insertBefore(c, box.children[i] || null);
  });
  have.forEach(c => c.remove());
}
function vTasks() {
  renderTop([{ label: tr("nav.tasks") }]);
  const listI = h("div", { class: "stack", style: "gap:12px" }), listD = h("div", { class: "stack", style: "gap:12px" });
  const emptyI = h("div", { class: "card empty" }, h("div", { class: "ic" }, icon("activity")), h("h2", null, tr("tasks.empty_i")), h("p", null, tr("tasks.empty_i_hint")));
  const emptyD = h("div", { class: "card empty" }, h("div", { class: "ic" }, icon("download")), h("h2", null, tr("tasks.empty_d")), h("p", null, tr("tasks.empty_d_hint")));
  const segI = h("button", { onclick: () => { S.tab = "index"; sync(); } }), segD = h("button", { onclick: () => { S.tab = "dl"; sync(); } });
  const sync = () => {
    segI.className = S.tab === "index" ? "on" : ""; segD.className = S.tab === "dl" ? "on" : "";
    segI.replaceChildren(icon("activity", 15), `${tr("tasks.tab.index")} · ${S.jobs.length}`); segD.replaceChildren(icon("download", 15), `${tr("tasks.tab.dl")} · ${S.dls.length}`);
    listI.hidden = S.tab !== "index"; listD.hidden = S.tab !== "dl";
    emptyI.hidden = S.tab !== "index" || S.jobs.length > 0; emptyD.hidden = S.tab !== "dl" || S.dls.length > 0;
  };
  const draw = () => { liveList(listI, S.jobs, "index"); liveList(listD, S.dls, "dl"); sync(); };
  S.hook = draw;
  main().replaceChildren(h("div", { class: "stack" },
    h("div", { class: "head" }, h("div", null, h("h1", null, tr("tasks.title")), h("p", null, tr("tasks.sub"))),
      h("button", { class: "btn", onclick: async () => { await api("/api/jobs/clear", { method: "POST", body: {} }); await api("/api/downloads/clear", { method: "POST", body: {} }); refresh(); } }, tr("tasks.clear"))),
    h("div", { class: "seg", role: "tablist" }, segI, segD), emptyI, emptyD, listI, listD));
  draw();
}

// ---------------------------------------------------------------- Desempenho
async function vPerf() {
  renderTop([{ label: tr("nav.perf") }]);
  const wrap = h("div", { class: "stack" }); main().replaceChildren(wrap);
  let b = null; try { b = await api("/api/bench/status"); } catch { /* sem teste */ }
  if (!S.drive.length) { try { S.drive = await api("/api/drive"); } catch { /* ignora */ } }
  const sel = h("select", { class: "input", id: "bf", style: "max-width:380px" }, S.drive.map(f => h("option", { value: f.id }, `${f.name} (${fmt(+f.size)})`)));
  const mb = h("select", { class: "input", id: "bmb", style: "max-width:240px" }, [[32, "perf.fast"], [64, "perf.std"], [128, "perf.precise"]].map(([v, l]) => h("option", { value: v, selected: v === 64 }, tr(l))));
  const result = h("div");
  const draw = () => {
    const rows = b?.rows || [], chunks = [8, 16, 32], aheads = [2, 4, 8, 12, 16], max = Math.max(1, ...rows.map(r => r.rate));
    const cell = (c, a) => { const r = rows.find(x => x.chunk_mb === c && x.ahead === a); const best = b?.best && b.best.chunk_mb === c && b.best.ahead === a;
      return r ? h("div", { class: "c num" + (best ? " best" : ""), style: `--v:${r.rate / max}`, title: tr("perf.cell", { c, a }) }, (r.rate / 1048576).toFixed(0)) : h("div", { class: "c todo" }, "·"); };
    result.replaceChildren(b && b.state !== "none" ? h("div", { class: "card pad stack", style: "gap:16px" },
      h("div", { style: "display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px" }, h("h2", null, tr("perf.speed_title", { name: b.file || "" })),
        b.state === "running" ? h("div", { class: "actions" }, h("span", { class: "badge acc" }, tr("perf.testing", { a: b.done, b: b.total })), h("button", { class: "btn sm danger", onclick: () => api("/api/bench/cancel", { body: {} }) }, tr("perf.stop"))) : h("span", { class: "badge " + (b.state === "done" ? "good" : "") }, b.state === "done" ? tr("perf.finished") : b.state === "error" ? tr("perf.err") : tr("perf.interrupted"))),
      b.state === "running" ? h("div", { class: "bar" }, h("i", { style: `width:${100 * b.done / b.total}%` })) : null,
      h("div", { class: "tbl-wrap" }, h("div", { class: "heat", style: "min-width:420px" }, h("div", { class: "h" }, tr("perf.axis")), aheads.map(a => h("div", { class: "h num" }, a)),
        chunks.map(c => [h("div", { class: "h num" }, `${c} MB`), aheads.map(a => cell(c, a))]))),
      b.error ? h("div", { class: "alert" }, icon("alert", 16), b.error) : null,
      b.best ? h("div", { class: "note" }, icon("gauge", 16), h("div", null, h("b", { style: "color:var(--fg)" }, tr("perf.best", { r: (b.best.rate / 1048576).toFixed(0) })), tr("perf.best_with", { c: b.best.chunk_mb, a: b.best.ahead, ram: b.best.chunk_mb * b.best.ahead }),
        b.decomp ? tr("perf.decomp", { d: (b.decomp / 1048576).toFixed(0) }) : "", tr("perf.limit"))) : null,
      b.best && b.state !== "running" ? h("div", { class: "actions" }, h("button", { class: "btn primary", onclick: async () => { S.settings = await api("/api/settings", { body: { chunk_mb: b.best.chunk_mb, ahead: b.best.ahead } }); toast(tr("perf.applied", { a: b.best.ahead, c: b.best.chunk_mb })); draw(); } }, icon("check", 16), tr("perf.apply")),
        h("span", { class: "muted" }, tr("perf.current", { a: S.settings.ahead, c: S.settings.chunk_mb }))) : null)
      : h("div", { class: "card empty" }, h("div", { class: "ic" }, icon("gauge")), h("h2", null, tr("perf.none")), h("p", null, tr("perf.none_hint"))));
  };
  S.hook = async () => { if (b?.state === "running") { try { b = await api("/api/bench/status"); draw(); } catch { /* ignora */ } } };
  wrap.append(h("div", { class: "head" }, h("div", null, h("h1", null, tr("perf.title")), h("p", null, tr("perf.sub")))),
    h("div", { class: "card pad", style: "display:grid;gap:12px" }, h("div", { class: "field" }, h("label", { for: "bf" }, tr("perf.file")), sel),
      h("div", { class: "field" }, h("label", { for: "bmb" }, tr("perf.depth")), mb),
      h("div", { class: "actions" }, h("button", { class: "btn primary", onclick: async () => { try { b = await api("/api/bench/start", { body: { file: sel.value, mb: +mb.value } }); draw(); } catch (e) { toast(apiErr(e), true); } } }, icon("play", 15), tr("perf.run")))),
    result);
  draw();
}

// ---------------------------------------------------------------- Configuracoes
function vSettings() {
  renderTop([{ label: tr("nav.settings") }]);
  const s = S.settings;
  const f = { dir: h("input", { class: "input", id: "s-dir", value: s.index_dir, placeholder: s.index_dir_effective }),
    sp: h("select", { class: "input", id: "s-sp" }, [[8, tr("set.sp8")], [16, "16 MB"], [32, tr("set.sp32")], [64, "64 MB"], [128, tr("set.sp128")]].map(([v, l]) => h("option", { value: v, selected: v === +s.spacing_mb }, l))),
    up: h("input", { type: "checkbox", id: "s-up", checked: s.upload }), ch: h("input", { type: "range", id: "s-ch", min: 4, max: 64, step: 4, value: s.chunk_mb }), ah: h("input", { type: "range", id: "s-ah", min: 1, max: 24, value: s.ahead }),
    pv: h("input", { class: "input", id: "s-pv", type: "number", min: 16, max: 8192, value: s.preview_kb }),
    lang: h("select", { class: "input", id: "s-lang", style: "max-width:240px", onchange: e => setLang(e.target.value) }, Object.entries(LANGS).map(([k, v]) => h("option", { value: k, selected: k === LANG }, v))) };
  const chLab = h("div", { class: "lab" }), ahLab = h("div", { class: "lab" }), ramEl = h("div", { class: "hint" });
  const upd = () => { chLab.textContent = tr("set.chunk", { v: f.ch.value + " MB" }); ahLab.textContent = tr("set.ahead", { v: f.ah.value }); ramEl.textContent = tr("set.ram", { ram: (f.ch.value * f.ah.value) + " MB" }); };
  f.ch.oninput = f.ah.oninput = upd; upd();
  const save = async () => {
    try { S.settings = await api("/api/settings", { body: { index_dir: f.dir.value, spacing_mb: +f.sp.value, upload: f.up.checked, chunk_mb: +f.ch.value, ahead: +f.ah.value, preview_kb: +f.pv.value } }); toast(tr("set.saved")); vSettings(); }
    catch (e) { toast(apiErr(e), true); }
  };
  main().replaceChildren(h("div", { class: "stack form-grid" },
    h("div", { class: "head", style: "margin:0" }, h("div", null, h("h1", null, tr("set.title")), h("p", null, tr("set.sub")))),
    h("div", { class: "card section" }, h("h2", null, tr("set.language")), h("div", { class: "field" }, h("label", { for: "s-lang" }, tr("lang.label")), f.lang)),
    h("div", { class: "card section" }, h("h2", null, tr("set.indexes")),
      h("div", { class: "field" }, h("label", { for: "s-dir" }, tr("set.dir")), f.dir, h("span", { class: "hint" }, tr("set.dir_hint"), h("span", { class: "mono" }, s.index_dir_effective))),
      h("div", { class: "field" }, h("label", { for: "s-sp" }, tr("set.spacing")), f.sp, h("span", { class: "hint" }, tr("set.spacing_hint"))),
      h("label", { class: "toggle" }, f.up, tr("set.upload"))),
    h("div", { class: "card section" }, h("h2", null, tr("set.download")), h("div", { class: "field" }, chLab, f.ch), h("div", { class: "field" }, ahLab, f.ah, ramEl)),
    h("div", { class: "card section" }, h("h2", null, tr("set.view")), h("div", { class: "field" }, h("label", { for: "s-pv" }, tr("set.preview")), f.pv)),
    h("div", { class: "card section" }, h("h2", null, tr("set.account")), h("p", { class: "muted", style: "margin:0" }, tr("set.account_text", { email: S.me?.user.emailAddress || "–" }))),
    h("div", { class: "actions" }, h("button", { class: "btn primary", onclick: save }, icon("check", 16), tr("common.save")), h("button", { class: "btn", onclick: vSettings }, tr("common.discard")))));
}

// ---------------------------------------------------------------- polling e boot
async function refresh() {
  try { [S.jobs, S.dls] = await Promise.all([api("/api/jobs"), api("/api/downloads")]); } catch { return; }
  const sig = runningJobs().length + ":" + activeDls().length;
  if (sig !== S.nsig) { S.nsig = sig; renderSide(curView()); }
  renderTopPill();
  if (S.hook) S.hook();
}
(async function boot() {
  document.documentElement.lang = LANG; $("#side").setAttribute("aria-label", tr("nav.aria"));
  try { if (localStorage.getItem("nav-collapsed")) $(".shell").classList.add("collapsed"); } catch { /* sem storage */ }
  document.addEventListener("click", () => { if (S.pop) { S.pop = false; renderTopPill(); } });
  $("#scrim").onclick = () => { $("#side").classList.remove("open"); $("#scrim").classList.remove("open"); };
  try { S.settings = await api("/api/settings"); } catch (e) { toast(apiErr(e), true); }
  api("/api/me").then(m => { S.me = m; renderSide(curView()); }).catch(() => { /* sem conta */ });
  try { [S.jobs, S.dls] = await Promise.all([api("/api/jobs"), api("/api/downloads")]); } catch { /* ignora */ }
  addEventListener("hashchange", route);
  route();
  setInterval(refresh, 1500);
})();
