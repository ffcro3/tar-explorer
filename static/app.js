"use strict";
/* Tar Explorer: SPA sem dependencias. Rotas por hash: #/drive  #/browse/<id>?p=<pasta>  #/indexes  #/jobs  #/perf  #/settings */

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
    else if (["value", "checked", "disabled", "type", "placeholder", "id", "title", "min", "max", "step", "href"].includes(k)) e[k] = v;
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

const fmt = n => { if (n == null) return "–"; const u = ["B", "KB", "MB", "GB", "TB"]; let i = 0; while (n >= 1024 && i < 4) { n /= 1024; i++; } return (i ? n.toFixed(n < 10 ? 2 : 1) : n) + " " + u[i]; };
const dur = s => { s = Math.round(s); if (s < 60) return s + " s"; const hh = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return hh ? `${hh} h ${String(m).padStart(2, "0")} min` : `${m} min`; };
const date = s => s ? new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "–";
const num = n => (n ?? 0).toLocaleString("pt-BR");

async function api(path, opts = {}) {
  const r = await fetch(path, { method: opts.method || (opts.body ? "POST" : "GET"), headers: { "Content-Type": "application/json" }, body: opts.body ? JSON.stringify(opts.body) : undefined });
  let j = null; try { j = await r.json(); } catch { /* sem corpo */ }
  if (!r.ok) { const e = new Error(j?.error || `Erro ${r.status}`); e.status = r.status; e.data = j; throw e; }
  return j;
}
function toast(msg, err) { const t = h("div", { class: "toast" + (err ? " err" : "") }, msg); $("#toasts").append(t); setTimeout(() => t.remove(), 4200); }
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
const S = { settings: null, me: null, jobs: [], drive: [], hook: null, tree: null, sel: null, mode: "cards", search: "", searchRes: null, fid: null, path: "" };
const main = () => $("#main");
const showDetail = on => { $("#detail").hidden = !on; $(".body").classList.toggle("with-detail", on); };
const runningJobs = () => S.jobs.filter(j => j.state === "running");

// ---------------------------------------------------------------- casca (sidebar + topo)
const NAV = [["drive", "Meu Drive", "cloud"], ["browse", "Explorar", "folder"], ["indexes", "Índices", "db"], ["jobs", "Tarefas", "activity"], ["perf", "Desempenho", "gauge"], ["settings", "Configurações", "sliders"]];
function renderSide(view) {
  const side = $("#side"); side.replaceChildren();
  const quota = S.me?.storageQuota, used = +quota?.usage || 0, lim = +quota?.limit || 0;
  add(side, [
    h("div", { class: "brand" }, h("div", { class: "logo" }, icon("archive", 17)), "Tar Explorer"),
    h("div", { class: "nav-label" }, "Menu"),
    NAV.map(([k, label, ic]) => {
      const disabled = k === "browse" && !S.fid;
      const badge = k === "jobs" && runningJobs().length ? h("span", { class: "badge acc" }, runningJobs().length) : null;
      return h("a", { class: "nav" + (view === k ? " on" : ""), href: k === "browse" ? (S.fid ? `#/browse/${S.fid}` : "#/drive") : `#/${k}`, "aria-disabled": disabled ? "true" : null, onclick: () => $("#side").classList.remove("open") || $("#scrim").classList.remove("open") }, icon(ic), label, badge);
    }),
    h("div", { class: "side-foot" },
      quota ? h("div", { class: "quota" },
        h("div", { class: "row" }, icon("cloud", 16), h("b", null, "Google Drive")),
        lim ? h("div", { class: "bar" }, h("i", { style: `width:${Math.min(100, 100 * used / lim)}%` })) : null,
        h("div", { class: "muted num" }, lim ? `${fmt(used)} de ${fmt(lim)} usados` : `${fmt(used)} usados`)) : null,
      S.me ? h("div", { class: "who" },
        h("div", { class: "avatar" }, S.me.user.photoLink ? h("img", { src: S.me.user.photoLink, alt: "", referrerpolicy: "no-referrer" }) : (S.me.user.displayName || "?")[0]),
        h("div", { class: "t" }, h("div", { style: "font-weight:600" }, S.me.user.displayName), h("div", { class: "muted", style: "font-size:12px" }, S.me.user.emailAddress))) : null)]);
}
function renderTop(crumbs, searchBox) {
  const top = $("#top"); top.replaceChildren();
  const rj = runningJobs()[0];
  add(top, [
    h("button", { class: "icon-btn menu-btn", "aria-label": "Menu", onclick: () => { $("#side").classList.add("open"); $("#scrim").classList.add("open"); } }, icon("menu")),
    h("nav", { class: "crumbs", "aria-label": "Caminho" }, crumbs.map((c, i) => [i ? h("span", { class: "sep" }, icon("chev", 14)) : null,
      c.go ? h("button", { class: "crumb", onclick: c.go }, c.label) : h("span", { class: "crumb last" }, c.label)])),
    searchBox,
    rj ? h("a", { class: "pill", href: "#/jobs", title: rj.name }, h("span", { class: "dot" }), `Indexando ${rj.size ? (100 * rj.got / rj.size).toFixed(0) : 0}%`) : null]);
}
const searchBox = (ph, val, on) => h("label", { class: "search" }, icon("search", 16), h("input", { type: "search", placeholder: ph, value: val || "", "aria-label": ph, oninput: e => on(e.target.value) }));

// ---------------------------------------------------------------- roteador
function route() {
  const hash = location.hash.slice(2) || "drive";
  const [pathPart, qs] = hash.split("?");
  const parts = pathPart.split("/");
  const view = parts[0];
  S.hook = null;
  showDetail(false);
  if (view === "browse") {
    const fid = parts[1] || S.fid;
    if (!fid) { location.hash = "#/drive"; return; }
    if (fid !== S.fid) { S.fid = fid; S.search = ""; S.searchRes = null; }
    S.path = decodeURIComponent(new URLSearchParams(qs || "").get("p") || ""); S.sel = null;
  }
  renderSide(view);
  ({ drive: vDrive, browse: vBrowse, indexes: vIndexes, jobs: vJobs, perf: vPerf, settings: vSettings }[view] || vDrive)();
}
const go = (fid, path) => { location.hash = `#/browse/${fid}` + (path ? `?p=${encodeURIComponent(path)}` : ""); };

// ---------------------------------------------------------------- Meu Drive
function idxBadge(f) {
  if (f.job === "running") return h("span", { class: "badge acc" }, `Indexando ${(100 * f.progress).toFixed(0)}%`);
  if (f.indexed) return h("span", { class: "badge good" }, icon("check", 12), "Indexado");
  return h("span", { class: "badge" }, "Sem índice");
}
async function vDrive() {
  renderTop([{ label: "Meu Drive" }]);
  let q = "";
  const tbody = h("tbody"), pasteIn = h("input", { class: "input", placeholder: "Colar ID ou URL de compartilhamento do Drive", id: "paste", "aria-label": "ID ou URL" });
  const draw = () => {
    tbody.replaceChildren();
    if (!S.drive.length) { tbody.append(h("tr", null, h("td", { colspan: 5 }, h("div", { class: "empty" }, h("div", { class: "ic" }, icon("search")), h("h2", null, "Nenhum .tar.gz encontrado"), h("p", null, "Só aparecem arquivos cujo nome contém .tar.gz ou .tgz. Se o seu tem outro nome, cole o ID acima."))))); return; }
    for (const f of S.drive) tbody.append(h("tr", { class: "click", onclick: () => go(f.id) },
      h("td", null, h("div", { class: "name-cell" }, h("div", { class: "ftile", style: "--tc:#c58516" }, "TGZ"), h("div", { class: "t" }, f.name))),
      h("td", { class: "num" }, fmt(+f.size)), h("td", { class: "muted" }, date(f.modifiedTime)), h("td", null, idxBadge(f)),
      h("td", { class: "r" }, f.indexed ? h("button", { class: "btn sm", onclick: e => { e.stopPropagation(); go(f.id); } }, icon("folder", 15), "Abrir")
        : f.job === "running" ? h("button", { class: "btn sm", onclick: e => { e.stopPropagation(); location.hash = "#/jobs"; } }, "Ver tarefa")
        : h("button", { class: "btn sm primary", onclick: e => { e.stopPropagation(); startIndex(f.id).then(() => go(f.id)); } }, icon("play", 14), "Indexar"))));
  };
  const load = async () => {
    tbody.replaceChildren(h("tr", null, h("td", { colspan: 5 }, h("div", { class: "skeleton" }))));
    try { S.drive = await api("/api/drive?q=" + encodeURIComponent(q)); } catch (e) { S.drive = []; toast(e.message, true); }
    draw();
  };
  let sig = ""; S.hook = async () => { try { const d = await api("/api/drive?q=" + encodeURIComponent(q)), k = JSON.stringify(d); if (k !== sig) { sig = k; S.drive = d; draw(); } } catch { /* ignora */ } };
  const open = () => { const v = pasteIn.value.trim(); if (!v) return; const m = v.match(/\/d\/([\w-]+)|[?&]id=([\w-]+)/); go(m ? (m[1] || m[2]) : v); };
  pasteIn.onkeydown = e => e.key === "Enter" && open();
  main().replaceChildren(h("div", { class: "stack" },
    h("div", { class: "head" }, h("div", null, h("h1", null, "Meus .tar.gz"), h("p", null, "Escolha um arquivo do seu Drive. Nada é baixado por inteiro e o original nunca é alterado."))),
    h("div", { class: "row" }, pasteIn, h("button", { class: "btn primary", onclick: open }, "Abrir")),
    h("div", { class: "panel" },
      h("div", { class: "panel-head" }, h("h2", null, "Arquivos no Drive"),
        h("div", { class: "actions" }, searchBox("Buscar por nome…", "", debounce(v => { q = v; load(); }, 350)), h("button", { class: "icon-btn", title: "Atualizar", "aria-label": "Atualizar", onclick: load }, icon("refresh")))),
      h("div", { class: "tbl-wrap" }, h("table", null, h("thead", null, h("tr", null, ["Nome", "Tamanho", "Modificado", "Índice", ""].map((t, i) => h("th", { class: i === 4 ? "r" : "" }, t)))), tbody)))));
  load();
}
async function startIndex(fid, upload) {
  try { await api("/api/index/start", { body: { file: fid, ...(upload == null ? {} : { upload }) } }); await refreshJobs(); toast("Indexação iniciada."); } catch (e) { toast(e.message, true); throw e; }
}

// ---------------------------------------------------------------- Explorar
async function vBrowse() {
  const fid = S.fid;
  renderTop([{ label: "Meu Drive", go: () => (location.hash = "#/drive") }, { label: "…" }]);
  main().replaceChildren(h("div", { class: "stack" }, h("div", { class: "skeleton", style: "width:40%;height:28px" }), h("div", { class: "skeleton" }), h("div", { class: "skeleton" })));
  try {
    S.tree = await api(`/api/tree?file=${fid}&path=${encodeURIComponent(S.path)}`);
  } catch (e) {
    if (e.status === 409 && e.data?.noindex) return noIndex(e.data);
    renderTop([{ label: "Meu Drive", go: () => (location.hash = "#/drive") }, { label: "Erro" }]);
    main().replaceChildren(h("div", { class: "alert" }, icon("alert"), e.status === 404 ? "Pasta ou arquivo não encontrado neste índice." : e.message));
    return;
  }
  drawBrowse();
}
function crumbsFor() {
  const parts = S.path ? S.path.split("/") : [];
  const list = [{ label: "Meu Drive", go: () => (location.hash = "#/drive") }, { label: S.tree.file.name, go: parts.length ? () => go(S.fid, "") : null }];
  parts.forEach((p, i) => list.push({ label: p, go: i < parts.length - 1 ? () => go(S.fid, parts.slice(0, i + 1).join("/")) : null }));
  return list;
}
function drawBrowse() {
  const t = S.tree, f = t.file;
  renderTop(crumbsFor(), searchBox("Buscar neste arquivo…", S.search, debounce(async v => {
    S.search = v;
    if (v.trim().length < 2) { S.searchRes = null; return drawBody(); }
    try { S.searchRes = (await api(`/api/search?file=${S.fid}&q=${encodeURIComponent(v)}`)).items; } catch (e) { toast(e.message, true); }
    drawBody();
  }, 300)));
  const body = h("div", { id: "bbody", class: "stack" });
  main().replaceChildren(
    h("div", { class: "stack" },
      h("div", { class: "head" },
        h("div", null, h("h1", null, S.path ? S.path.split("/").pop() : f.name),
          h("div", { class: "chips", style: "margin-top:10px" },
            h("span", { class: "chip" }, h("b", { class: "num" }, num(t.count)), "arquivos"),
            h("span", { class: "chip" }, h("b", { class: "num" }, fmt(t.size)), "descomprimido"),
            !S.path ? h("span", { class: "chip" }, h("b", { class: "num" }, fmt(f.gz_size)), "no Drive") : null)),
        h("div", { class: "actions" },
          h("div", { class: "seg", role: "group", "aria-label": "Modo de exibição" },
            h("button", { class: S.mode === "cards" ? "on" : "", onclick: () => { S.mode = "cards"; drawBody(); syncSeg(); } }, icon("grid", 15), "Cartões"),
            h("button", { class: S.mode === "list" ? "on" : "", onclick: () => { S.mode = "list"; drawBody(); syncSeg(); } }, icon("list", 15), "Lista")),
          h("a", { class: "btn", href: "#/indexes" }, icon("db", 16), "Índice"))),
      body));
  drawBody(); drawDetail();
}
function syncSeg() { const b = $(".seg"); if (b) [...b.children].forEach((x, i) => x.classList.toggle("on", (i === 0) === (S.mode === "cards"))); }
function row(it, showPath) {
  return h("tr", { class: "click" + (S.sel === it.path ? " sel" : ""), onclick: () => it.dir ? go(S.fid, it.path) : selectFile(it) },
    h("td", null, h("div", { class: "name-cell" }, it.dir ? h("div", { class: "ftile", style: "--tc:var(--c1)" }, icon("folder", 16)) : ftile(it.name),
      h("div", { class: "t" }, it.name, showPath ? h("div", { class: "muted mono", style: "font-weight:400;overflow:hidden;text-overflow:ellipsis" }, it.path.slice(0, -it.name.length - 1) || "/") : null))),
    h("td", { class: "r num" }, fmt(it.size)), h("td", { class: "muted r num" }, it.dir ? `${num(it.count)} arquivos` : ((it.name.split(".").length > 1 ? it.name.split(".").pop() : "–").toUpperCase())));
}
function table(items, showPath) {
  return h("div", { class: "panel" }, h("div", { class: "tbl-wrap" }, h("table", null,
    h("thead", null, h("tr", null, h("th", null, "Nome"), h("th", { class: "r" }, "Tamanho"), h("th", { class: "r" }, "Itens / tipo"))),
    h("tbody", null, items.map(i => row(i, showPath))))));
}
function drawBody() {
  const body = $("#bbody"); if (!body) return; body.replaceChildren();
  if (S.searchRes) {
    body.append(h("div", { class: "head", style: "margin:0" }, h("h2", null, `${S.searchRes.length}${S.searchRes.length === 300 ? "+" : ""} resultados para “${S.search}”`)));
    body.append(S.searchRes.length ? table(S.searchRes, true) : h("div", { class: "card empty" }, h("div", { class: "ic" }, icon("search")), h("h2", null, "Nada encontrado"), h("p", null, "Tente outro trecho do nome ou do caminho.")));
    return;
  }
  const items = S.tree.items, dirs = items.filter(i => i.dir), files = items.filter(i => !i.dir);
  if (!items.length) { body.append(h("div", { class: "card empty" }, h("div", { class: "ic" }, icon("folder")), h("h2", null, "Pasta vazia"))); return; }
  if (S.mode === "cards") {
    if (dirs.length) body.append(h("section", { class: "stack", style: "gap:12px" }, h("h2", null, `Pastas · ${num(dirs.length)}`),
      h("div", { class: "folders" }, dirs.map((d, i) => h("button", { class: "fcard", onclick: () => go(S.fid, d.path) },
        h("div", { class: "fi", style: `--tc:${PAL[i % 6]}` }, icon("folder", 20)), h("div", { class: "n" }, d.name), h("div", { class: "m num" }, `${num(d.count)} arquivos · ${fmt(d.size)}`))))));
    if (files.length) body.append(h("section", { class: "stack", style: "gap:12px" }, h("h2", null, `Arquivos · ${num(files.length)}`), table(files)));
  } else body.append(table(items));
  if (S.tree.total > items.length + 0 && S.tree.total > 2000) body.append(h("div", { class: "note" }, icon("alert", 16), `Mostrando ${num(items.length)} de ${num(S.tree.total)} itens desta pasta. Use a busca para achar o resto.`));
}
function drawDetail() {
  const d = $("#detail"); showDetail(true); d.replaceChildren();
  const t = S.tree, dirs = t.items.filter(i => i.dir).sort((a, b) => b.size - a.size);
  const tot = dirs.reduce((s, x) => s + x.size, 0) + t.items.filter(i => !i.dir).reduce((s, x) => s + x.size, 0) || 1;
  const top = dirs.slice(0, 6);
  const rest = tot - top.reduce((s, x) => s + x.size, 0);
  add(d, [h("div", { class: "head", style: "margin-bottom:12px" }, h("h2", null, "Composição desta pasta")),
    h("div", { class: "bar stacked", role: "img", "aria-label": "Distribuição por tamanho" }, top.map((x, i) => h("i", { style: `width:${100 * x.size / tot}%;background:${PAL[i]}`, title: `${x.name}: ${fmt(x.size)}` })), rest > 0 ? h("i", { style: `width:${100 * rest / tot}%;background:var(--line-strong)` }) : null),
    h("div", { class: "legend" }, top.map((x, i) => h("div", { class: "li" }, h("span", { class: "sw", style: `background:${PAL[i]}` }), h("span", null, x.name), h("span", { class: "muted num" }, fmt(x.size)))),
      rest > 0 ? h("div", { class: "li" }, h("span", { class: "sw", style: "background:var(--line-strong)" }), h("span", null, "Arquivos soltos e outros"), h("span", { class: "muted num" }, fmt(rest))) : null),
    h("div", { class: "note", style: "margin-top:20px" }, icon("db", 16), "Clique em um arquivo para visualizar. Só o trecho necessário é baixado do Drive.")]);
}
async function selectFile(it) {
  S.sel = it.path; drawBody();
  const d = $("#detail"); showDetail(true); d.replaceChildren();
  const qs = new URLSearchParams({ file: S.fid, path: it.path });
  const pv = h("div", null, h("div", { class: "skeleton" }));
  add(d, [h("div", { class: "head", style: "margin-bottom:12px" }, h("h2", { style: "overflow-wrap:anywhere" }, it.name), h("button", { class: "icon-btn", "aria-label": "Fechar", onclick: () => { S.sel = null; drawBody(); drawDetail(); } }, icon("x"))),
    h("div", { class: "name-cell", style: "margin-bottom:14px" }, ftile(it.name), h("div", { class: "muted num" }, fmt(it.size))),
    h("a", { class: "btn primary", href: `/api/file?${qs}&download=1`, style: "text-decoration:none" }, icon("download", 16), "Baixar"),
    h("dl", { class: "kv", style: "margin-top:16px" }, h("dt", null, "Caminho"), h("dd", { class: "mono" }, it.path)), pv]);
  try {
    const j = await api("/api/file?" + qs);
    pv.replaceChildren(j.binary ? h("div", { class: "note", style: "margin-top:14px" }, icon("alert", 16), "Arquivo binário: sem prévia. Use Baixar.")
      : h("pre", { class: "preview" }, j.text + (j.truncated ? "\n\n… (prévia truncada)" : "")));
  } catch (e) { pv.replaceChildren(h("div", { class: "alert", style: "margin-top:14px" }, icon("alert", 16), e.message)); }
}

// ---------------------------------------------------------------- sem índice
function noIndex(data) {
  const file = data.file, fid = S.fid;
  renderTop([{ label: "Meu Drive", go: () => (location.hash = "#/drive") }, { label: file.name }]);
  const box = h("div", { class: "hero" });
  const draw = () => {
    const job = S.jobs.find(j => j.id === fid) || data.job;
    box.replaceChildren();
    if (job?.state === "running") return box.append(h("div", { class: "head", style: "margin:0" }, h("div", null, h("h1", null, file.name), h("p", null, "Lendo o arquivo uma única vez para montar o índice."))), jobCard(job, true));
    add(box, [h("div", null, h("h1", null, file.name), h("p", { class: "muted" }, `${fmt(file.size)} no Drive · ainda sem índice`)),
      h("div", { class: "card pad", style: "display:grid;gap:16px" },
        h("div", null, h("h2", null, "Criar índice"), h("p", { class: "muted", style: "margin:6px 0 0" }, "Uma leitura em streaming (nada é gravado do .tar.gz) gera um índice pequeno. Depois a árvore abre na hora e cada arquivo é lido sob demanda. O original no Drive não é alterado.")),
        h("dl", { class: "kv" }, h("dt", null, "Salvar em"), h("dd", { class: "mono" }, S.settings.index_dir_effective),
          h("dt", null, "Checkpoints"), h("dd", null, `a cada ${S.settings.spacing_mb} MB`), h("dt", null, "Download"), h("dd", null, `${S.settings.ahead} conexões × ${S.settings.chunk_mb} MB`)),
        h("label", { class: "toggle" }, h("input", { type: "checkbox", id: "up", checked: S.settings.upload }), "Enviar o índice também ao Drive (mesma pasta do original)"),
        h("div", { class: "actions" },
          h("button", { class: "btn primary", onclick: async () => { try { await startIndex(fid, $("#up").checked); draw(); } catch { /* toast ja mostrado */ } } }, icon("play", 15), "Criar índice"),
          h("a", { class: "btn", href: "#/settings" }, icon("sliders", 15), "Alterar pasta e ajustes")),
        job?.state === "error" ? h("div", { class: "alert" }, icon("alert"), `Falhou: ${job.error}`) : job?.state === "cancelled" ? h("div", { class: "note" }, "Indexação cancelada.") : null)]);
  };
  main().replaceChildren(box); draw();
  let last = S.jobs.find(j => j.id === fid)?.state;
  S.hook = () => {
    const job = S.jobs.find(j => j.id === fid);
    if (job?.state === "done") return vBrowse();
    if (job?.state === "running" || job?.state !== last) { last = job?.state; draw(); }  // nao reconstroi a tela parada (perderia o clique)
  };
}

// ---------------------------------------------------------------- Índices
async function vIndexes() {
  renderTop([{ label: "Índices" }]);
  const wrap = h("div", { class: "stack" });
  main().replaceChildren(wrap);
  const load = async () => {
    let d; try { d = await api("/api/indexes"); } catch (e) { wrap.replaceChildren(h("div", { class: "alert" }, icon("alert"), e.message)); return; }
    const totalSize = d.items.reduce((s, x) => s + x.file_size, 0);
    wrap.replaceChildren(
      h("div", { class: "head" }, h("div", null, h("h1", null, "Índices"), h("p", null, "Cada índice permite abrir um .tar.gz na hora. Ficam nesta pasta do seu computador.")),
        h("div", { class: "actions" }, h("span", { class: "chip mono", title: d.dir }, d.dir), h("button", { class: "btn", onclick: () => api("/api/open-folder", { method: "POST", body: {} }).catch(e => toast(e.message, true)) }, icon("open", 16), "Abrir pasta"), h("a", { class: "btn", href: "#/settings" }, icon("sliders", 16), "Mudar pasta"))),
      d.items.length ? h("div", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", null, `${d.items.length} índice(s)`), h("span", { class: "muted num" }, `${fmt(totalSize)} em disco`)),
        h("div", { class: "tbl-wrap" }, h("table", null, h("thead", null, h("tr", null, ["Arquivo", "Membros", "Tamanho original", "Índice", "Criado", ""].map((t, i) => h("th", { class: i === 5 ? "r" : "" }, t)))),
          h("tbody", null, d.items.map(x => h("tr", null,
            h("td", null, h("div", { class: "name-cell" }, h("div", { class: "ftile", style: "--tc:#c58516" }, "TGZ"), h("div", { class: "t" }, x.name || x.id))),
            h("td", { class: "num" }, x.count != null ? num(x.count) : "–"), h("td", { class: "num" }, fmt(x.gz_size)), h("td", { class: "num" }, fmt(x.file_size)), h("td", { class: "muted" }, date(x.created)),
            h("td", { class: "r" }, h("div", { class: "actions", style: "justify-content:flex-end" },
              h("button", { class: "btn sm", onclick: () => go(x.id) }, icon("folder", 14), "Abrir"),
              h("button", { class: "btn sm", onclick: async () => { await api("/api/indexes/" + x.id, { method: "DELETE" }); await startIndex(x.id); location.hash = "#/jobs"; } }, icon("refresh", 14), "Recriar"),
              confirmBtn("Excluir", async () => { await api("/api/indexes/" + x.id, { method: "DELETE" }); toast("Índice excluído."); load(); })))))))))
        : h("div", { class: "card empty" }, h("div", { class: "ic" }, icon("db")), h("h2", null, "Nenhum índice ainda"), h("p", null, "Abra um arquivo em “Meu Drive” e clique em Indexar."), h("a", { class: "btn primary", href: "#/drive" }, "Ir para Meu Drive")));
  };
  load();
}
function confirmBtn(label, fn) {
  const b = h("button", { class: "btn sm danger" }, icon("trash", 14), label);
  let armed = false, t;
  b.onclick = () => { if (!armed) { armed = true; b.replaceChildren("Confirmar?"); t = setTimeout(() => { armed = false; b.replaceChildren(icon("trash", 14), label); }, 3000); } else { clearTimeout(t); fn(); } };
  return b;
}

// ---------------------------------------------------------------- Tarefas
function jobCard(j, big) {
  const pct = j.size ? 100 * j.got / j.size : 0, run = j.state === "running";
  const state = { running: ["acc", "Indexando"], done: ["good", "Concluído"], error: ["bad", "Falhou"], cancelled: ["", "Cancelado"] }[j.state];
  return h("div", { class: "card job" },
    h("div", { class: "top-row" }, h("div", { class: "name-cell" }, h("div", { class: "ftile", style: "--tc:#c58516" }, "TGZ"), h("div", { class: "t" }, j.name)),
      h("div", { class: "actions" }, h("span", { class: "badge " + state[0] }, state[1]),
        run ? h("button", { class: "btn sm danger", onclick: () => api("/api/index/cancel", { body: { file: j.id } }).then(refreshJobs) }, icon("x", 14), "Cancelar") : null,
        !run && j.state === "done" ? h("button", { class: "btn sm", onclick: () => go(j.id) }, icon("folder", 14), "Abrir") : null)),
    run || j.state === "done" ? h("div", { class: "bar" }, h("i", { style: `width:${j.state === "done" ? 100 : pct}%` })) : null,
    h("div", { class: "stats num" },
      h("span", null, h("b", null, run ? pct.toFixed(1) + "%" : fmt(j.size)), run ? ` · ${fmt(j.got)} de ${fmt(j.size)}` : " lidos"),
      run ? h("span", null, h("b", null, fmt(j.rate) + "/s")) : null, run && j.rate ? h("span", null, "faltam ", h("b", null, dur(j.eta))) : null,
      h("span", null, h("b", null, num(j.members)), " membros")),
    h("div", { class: "muted", style: "font-size:12.5px" }, `Salvando em ${j.dir}${j.upload ? " · enviando ao Drive ao final" : ""}`),
    j.error ? h("div", { class: "alert" }, icon("alert", 16), j.error) : null,
    j.log?.length && !big ? h("div", { class: "log" }, j.log.slice(-2).join("\n")) : null);
}
function vJobs() {
  renderTop([{ label: "Tarefas" }]);
  const wrap = h("div", { class: "stack" });
  const draw = () => wrap.replaceChildren(
    h("div", { class: "head" }, h("div", null, h("h1", null, "Tarefas"), h("p", null, "Indexações em andamento e concluídas. Elas continuam rodando no servidor mesmo se você fechar esta aba.")),
      h("button", { class: "btn", onclick: async () => { await api("/api/jobs/clear", { method: "POST", body: {} }); refreshJobs(); } }, "Limpar concluídas")),
    S.jobs.length ? h("div", { class: "stack", style: "gap:12px" }, S.jobs.map(j => jobCard(j)))
      : h("div", { class: "card empty" }, h("div", { class: "ic" }, icon("activity")), h("h2", null, "Nenhuma tarefa"), h("p", null, "Quando você indexar um arquivo, o progresso aparece aqui.")));
  S.hook = draw; main().replaceChildren(wrap); draw();
}

// ---------------------------------------------------------------- Desempenho
async function vPerf() {
  renderTop([{ label: "Desempenho" }]);
  const wrap = h("div", { class: "stack" }); main().replaceChildren(wrap);
  let b = null; try { b = await api("/api/bench/status"); } catch { /* sem teste */ }
  if (!S.drive.length) { try { S.drive = await api("/api/drive"); } catch { /* ignora */ } }
  const sel = h("select", { class: "input", id: "bf", style: "max-width:380px" }, S.drive.map(f => h("option", { value: f.id }, `${f.name} (${fmt(+f.size)})`)));
  const mb = h("select", { class: "input", id: "bmb", style: "max-width:200px" }, [[32, "Rápido · 32 MB por teste"], [64, "Padrão · 64 MB por teste"], [128, "Preciso · 128 MB por teste"]].map(([v, l]) => h("option", { value: v, selected: v === 64 }, l)));
  const result = h("div");
  const draw = () => {
    const rows = b?.rows || [], chunks = [8, 16, 32], aheads = [2, 4, 8, 12, 16], max = Math.max(1, ...rows.map(r => r.rate));
    const cell = (c, a) => { const r = rows.find(x => x.chunk_mb === c && x.ahead === a); const best = b?.best && b.best.chunk_mb === c && b.best.ahead === a;
      return r ? h("div", { class: "c num" + (best ? " best" : ""), style: `--v:${r.rate / max}`, title: `bloco ${c} MB × ${a} conexões` }, (r.rate / 1048576).toFixed(0)) : h("div", { class: "c todo" }, "·"); };
    result.replaceChildren(b && b.state !== "none" ? h("div", { class: "card pad stack", style: "gap:16px" },
      h("div", { class: "top-row", style: "display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px" }, h("h2", null, `Velocidade de download (MB/s) · ${b.file || ""}`),
        b.state === "running" ? h("div", { class: "actions" }, h("span", { class: "badge acc" }, `Testando ${b.done}/${b.total}`), h("button", { class: "btn sm danger", onclick: () => api("/api/bench/cancel", { body: {} }) }, "Parar")) : h("span", { class: "badge " + (b.state === "done" ? "good" : "") }, b.state === "done" ? "Concluído" : b.state === "error" ? "Erro" : "Interrompido")),
      b.state === "running" ? h("div", { class: "bar" }, h("i", { style: `width:${100 * b.done / b.total}%` })) : null,
      h("div", { class: "tbl-wrap" }, h("div", { class: "heat", style: "min-width:420px" }, h("div", { class: "h" }, "bloco \\ conexões"), aheads.map(a => h("div", { class: "h num" }, a)),
        chunks.map(c => [h("div", { class: "h num" }, `${c} MB`), aheads.map(a => cell(c, a))]))),
      b.error ? h("div", { class: "alert" }, icon("alert", 16), b.error) : null,
      b.best ? h("div", { class: "note" }, icon("gauge", 16), h("div", null, h("b", { style: "color:var(--fg)" }, `Melhor: ${(b.best.rate / 1048576).toFixed(0)} MB/s`), ` com blocos de ${b.best.chunk_mb} MB e ${b.best.ahead} conexões (RAM ≈ ${b.best.chunk_mb * b.best.ahead} MB). `,
        b.decomp ? `Descompressão: ${(b.decomp / 1048576).toFixed(0)} MB/s em um núcleo, então a rede é o gargalo. ` : "", "Acima de ~16 conexões o Drive começa a recusar pedidos e a velocidade cai.")) : null,
      b.best && b.state !== "running" ? h("div", { class: "actions" }, h("button", { class: "btn primary", onclick: async () => { S.settings = await api("/api/settings", { body: { chunk_mb: b.best.chunk_mb, ahead: b.best.ahead } }); toast(`Aplicado: ${b.best.ahead} conexões × ${b.best.chunk_mb} MB.`); draw(); } }, icon("check", 16), "Aplicar melhor configuração"),
        h("span", { class: "muted" }, `Atual: ${S.settings.ahead} conexões × ${S.settings.chunk_mb} MB`)) : null) : h("div", { class: "card empty" }, h("div", { class: "ic" }, icon("gauge")), h("h2", null, "Sem teste ainda"), h("p", null, "O teste baixa alguns trechos do arquivo escolhido só para medir a velocidade, sem gravar nada em disco (~1 a 2 GB de tráfego).")));
  };
  S.hook = async () => { if (b?.state === "running") { try { b = await api("/api/bench/status"); draw(); } catch { /* ignora */ } } };
  wrap.append(h("div", { class: "head" }, h("div", null, h("h1", null, "Desempenho"), h("p", null, "Descubra quantas conexões e que tamanho de bloco dão a maior velocidade com o seu Drive e a sua internet."))),
    h("div", { class: "card pad", style: "display:grid;gap:12px" }, h("div", { class: "field" }, h("label", { for: "bf" }, "Arquivo de teste"), sel),
      h("div", { class: "field" }, h("label", { for: "bmb" }, "Profundidade"), mb),
      h("div", { class: "actions" }, h("button", { class: "btn primary", onclick: async () => { try { b = await api("/api/bench/start", { body: { file: sel.value, mb: +mb.value } }); draw(); } catch (e) { toast(e.message, true); } } }, icon("play", 15), "Rodar teste"))),
    result);
  draw();
}

// ---------------------------------------------------------------- Configurações
function vSettings() {
  renderTop([{ label: "Configurações" }]);
  const s = S.settings;
  const f = { dir: h("input", { class: "input", id: "s-dir", value: s.index_dir, placeholder: s.index_dir_effective }), sp: h("select", { class: "input", id: "s-sp" }, [[8, "8 MB · extração mais rápida, índice maior"], [16, "16 MB"], [32, "32 MB · equilibrado (padrão)"], [64, "64 MB"], [128, "128 MB · índice menor, extração mais lenta"]].map(([v, l]) => h("option", { value: v, selected: v === +s.spacing_mb }, l))),
    up: h("input", { type: "checkbox", id: "s-up", checked: s.upload }), ch: h("input", { type: "range", id: "s-ch", min: 4, max: 64, step: 4, value: s.chunk_mb }), ah: h("input", { type: "range", id: "s-ah", min: 1, max: 24, value: s.ahead }), pv: h("input", { class: "input", id: "s-pv", type: "number", min: 16, max: 8192, value: s.preview_kb }) };
  const ramEl = h("b", null), chL = h("b", null), ahL = h("b", null);
  const upd = () => { chL.textContent = f.ch.value + " MB"; ahL.textContent = f.ah.value; ramEl.textContent = (f.ch.value * f.ah.value) + " MB"; };
  f.ch.oninput = f.ah.oninput = upd; upd();
  const save = async () => {
    try { S.settings = await api("/api/settings", { body: { index_dir: f.dir.value, spacing_mb: +f.sp.value, upload: f.up.checked, chunk_mb: +f.ch.value, ahead: +f.ah.value, preview_kb: +f.pv.value } }); toast("Configurações salvas."); vSettings(); }
    catch (e) { toast(e.message, true); }
  };
  main().replaceChildren(h("div", { class: "stack form-grid" },
    h("div", { class: "head", style: "margin:0" }, h("div", null, h("h1", null, "Configurações"), h("p", null, "Tudo é salvo em settings.json ao lado do app e vale na hora, sem reiniciar."))),
    h("div", { class: "card section" }, h("h2", null, "Índices"),
      h("div", { class: "field" }, h("label", { for: "s-dir" }, "Pasta local dos índices"), f.dir, h("span", { class: "hint" }, "Em branco usa a pasta padrão. O app testa se consegue gravar antes de salvar. Em uso: ", h("span", { class: "mono" }, s.index_dir_effective))),
      h("div", { class: "field" }, h("label", { for: "s-sp" }, "Distância entre checkpoints"), f.sp, h("span", { class: "hint" }, "Vale para os próximos índices. Mede MB do arquivo comprimido.")),
      h("label", { class: "toggle" }, f.up, "Enviar o índice ao Drive, na mesma pasta do original")),
    h("div", { class: "card section" }, h("h2", null, "Download"),
      h("div", { class: "field" }, h("div", { class: "lab" }, "Tamanho do bloco: ", chL), f.ch),
      h("div", { class: "field" }, h("div", { class: "lab" }, "Conexões em paralelo: ", ahL), f.ah, h("span", { class: "hint" }, "Memória usada ≈ ", ramEl, ". Entre 8 e 16 conexões costuma ser o ideal. Mais que isso o Drive recusa pedidos. Use a aba Desempenho para medir.")),
    ),
    h("div", { class: "card section" }, h("h2", null, "Visualização"),
      h("div", { class: "field" }, h("label", { for: "s-pv" }, "Limite da prévia de texto (KB)"), f.pv)),
    h("div", { class: "card section" }, h("h2", null, "Conta"),
      h("p", { class: "muted", style: "margin:0" }, `Conectado como ${S.me?.user.emailAddress || "–"}. O app lê seus arquivos (somente leitura) e só cria o arquivo de índice. Para trocar de conta, apague token.json e reinicie.`)),
    h("div", { class: "actions" }, h("button", { class: "btn primary", onclick: save }, icon("check", 16), "Salvar"), h("button", { class: "btn", onclick: vSettings }, "Descartar"))));
}

// ---------------------------------------------------------------- polling e boot
async function refreshJobs() {
  try { S.jobs = await api("/api/jobs"); } catch { return; }
  const n = runningJobs().length; if (n !== S.nrun) { S.nrun = n; renderSide(location.hash.slice(2).split(/[/?]/)[0] || "drive"); }
  const view = location.hash.slice(2).split(/[/?]/)[0] || "drive";
  if (view !== "browse" || !S.tree) renderTopPill();
  if (S.hook) S.hook();
}
function renderTopPill() {
  const rj = runningJobs()[0], old = $("#top .pill");
  if (old) old.remove();
  if (rj) $("#top").append(h("a", { class: "pill", href: "#/jobs", title: rj.name }, h("span", { class: "dot" }), `Indexando ${rj.size ? (100 * rj.got / rj.size).toFixed(0) : 0}%`));
}
(async function boot() {
  $("#scrim").onclick = () => { $("#side").classList.remove("open"); $("#scrim").classList.remove("open"); };
  try { S.settings = await api("/api/settings"); } catch (e) { toast(e.message, true); }
  api("/api/me").then(m => { S.me = m; renderSide(location.hash.slice(2).split(/[/?]/)[0] || "drive"); }).catch(() => { /* sem conta */ });
  try { S.jobs = await api("/api/jobs"); } catch { /* ignora */ }
  addEventListener("hashchange", route);
  route();
  setInterval(refreshJobs, 2500);
})();
