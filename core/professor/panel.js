/* core/professor/panel.js — download, presets, tabs, bottom sheet e atalhos do teclado */
import { plot, overlayMgr } from "./plot.js";
import { PRESET_GROUPS } from "./presets.js";
import { formatExactValue } from "../plotEngine.js";
import { renderOverlaysOnPlot } from "../overlayRenderers.js";
import { addFormula, applyCircleToggle, applyPiAxis, circleActive, formulas, palette, piActive, setView } from "./formulas.js";
import { markPlayFresh, pausePlay, ucActive } from "./unitCircle.js";

/* ── Download — FIX 30x fixed z60 sem clipar (antes absolute z41 dentro de panel overflow) ── */
const btnDownload = document.getElementById("btn-download");
const downloadMenu = document.getElementById("download-menu");
// Move menu para body para evitar offset de transform do panel (fixed dentro de transformed ancestor vira relativo ao panel)
if (downloadMenu && downloadMenu.parentElement !== document.body) document.body.appendChild(downloadMenu);
let _lastDownloadAnchor = null;
function positionDownloadMenu(anchorRect){
  const rect = anchorRect || _lastDownloadAnchor || btnDownload.getBoundingClientRect();
  if (anchorRect) _lastDownloadAnchor = anchorRect;
  const menuW = Math.min(220, window.innerWidth * 0.92);
  const menuH = downloadMenu.offsetHeight || 96;
  let top = rect.top - menuH - 6;
  if (top < 8) top = rect.bottom + 6;
  if (top + menuH > window.innerHeight - 8) top = window.innerHeight - menuH - 8;
  let left = rect.right - menuW;
  if (left < 8) left = 8;
  if (left + menuW > window.innerWidth - 8) left = window.innerWidth - menuW - 8;
  downloadMenu.style.left = left + "px";
  downloadMenu.style.top = top + "px";
  downloadMenu.style.right = "auto";
  downloadMenu.style.bottom = "auto";
  downloadMenu.style.position = "fixed";
  downloadMenu.style.zIndex = "60";
}
btnDownload.addEventListener("click", e => {
  e.stopPropagation();
  const willOpen = !downloadMenu.classList.contains("open");
  if (willOpen) {
    downloadMenu.classList.add("open");
    requestAnimationFrame(() => positionDownloadMenu(btnDownload.getBoundingClientRect()));
  } else {
    downloadMenu.classList.remove("open");
  }
});
downloadMenu.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    const fmt = btn.dataset.format;
    if (fmt === "png") plot.exportPNG(2);
    else if (fmt === "svg") plot.exportSVG();
    downloadMenu.classList.remove("open");
  });
});
document.addEventListener("click", () => downloadMenu.classList.remove("open"));
downloadMenu.addEventListener("click", e => e.stopPropagation());
window.addEventListener("resize", () => { if (downloadMenu.classList.contains("open")) positionDownloadMenu(); });

/* ── Presets ── */
const presetsEl = document.getElementById("prof-presets");
const allPresets = PRESET_GROUPS.flatMap(g=>g.items.map(p=>({...p,group:g.title})));
presetsEl.innerHTML = PRESET_GROUPS.map(g=>`
  <div class="preset-group">
    <div class="preset-group-title">${g.title}</div>
    <div class="preset-btns">
      ${g.items.map(p=>`<button class="preset-btn" data-g="${g.title}" data-label="${p.label}">${g.title==="Exponencial" ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 17 H20"/><path d="M4 15.5 C8 15.5 9.5 5 13 5 C16.5 5 17.5 15.5 20 15.5"/></svg>' : g.title==="Sequências" ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 17 H20"/><path d="M6 13 H9 V10 H12 V7 H15 V4 H18"/></svg>' : g.title==="Trigonometria" ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 17 H20"/><path d="M4 12 C6.5 7.5 8.5 16.5 11 12 C13.5 7.5 15.5 16.5 18 12"/><circle cx="18" cy="12" r="0.9" fill="currentColor" stroke="none"/></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 17 H20"/><path d="M12 4 V17"/><path d="M6 15.5 Q9.5 4 12 4 Q14.5 4 18 15.5"/></svg>'} ${p.label}</button>`).join("")}
    </div>
  </div>`).join("");

presetsEl.querySelectorAll(".preset-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    presetsEl.querySelectorAll(".preset-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const p = allPresets.find(x=>x.group===btn.dataset.g&&x.label===btn.dataset.label);
    if (!p) return;
    pausePlay(); // preset no meio do play pausa; corrida nova a seguir
    markPlayFresh();
    // Acrescenta sem apagar, sem mexer na perspectiva
    p.fns.forEach(fn => {
      const exists = formulas.some(f => f.inp.value.trim() === fn);
      if (!exists && formulas.length < 8) addFormula(fn);
    });
    if (p.pi !== piActive) applyPiAxis(p.pi);
    if (p.uc !== circleActive) applyCircleToggle(p.uc);
  });
});

window.addEventListener("themechange", ()=>{ plot.draw(); });

overlayMgr.onChange(() => plot.draw());
function renderLayers() {
  const list = document.getElementById("layers-list");
  const count = document.getElementById("layers-count");
  const all = overlayMgr.getAll();
  count.textContent = all.length;
  if (all.length === 0) { list.innerHTML = '<span style="font-size:calc(.7rem * var(--info-scale,1));color:var(--text-mut);padding:.2rem">Nenhuma anotação</span>'; return; }
  list.innerHTML = all.map((o, idx) => {
    const label = o.type === "marker" ? `Ponto (${(o.props.x??0).toFixed(1)},${(o.props.y??0).toFixed(1)})`
      : o.type === "vline" ? `V x=${(o.props.x??0).toFixed(2)}`
      : o.type === "hline" ? `H y=${(o.props.y??0).toFixed(2)}`
      : o.type === "area" ? `Área [${(o.props.x??0).toFixed(1)},${(o.props.x2??o.props.x).toFixed(1)}]`
      : o.type === "triangle" ? `Triângulo`
      : o.type === "arrow" ? `Seta`
      : o.type === "text" ? `Texto: ${(o.props.text||"").slice(0,12)}`
      : o.type === "ruler" ? `Régua`
      : o.type;
    const isHidden = !!o.props.hidden;
    const eyeTitle = isHidden ? "Mostrar" : "Ocultar";
    const rowOpacity = isHidden ? "0.55" : "1";
    return `<div style="display:flex;align-items:center;gap:.3rem;padding:calc(.25rem * var(--info-scale,1)) calc(.3rem * var(--info-scale,1));background:var(--surface-2);border:1px solid var(--border);border-radius:calc(5px * var(--info-scale,1));font-size:calc(.7rem * var(--info-scale,1));opacity:${rowOpacity}">
      <span style="width:8px;height:8px;border-radius:50%;background:${o.props.color||"#ffa500"};flex-shrink:0"></span>
      <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label}</span>
      <button data-layer-eye="${o.id}" aria-label="${eyeTitle} anotação" title="${eyeTitle}" style="background:transparent;border:1px solid var(--border);color:var(--text-mut);cursor:pointer;padding:.15rem .35rem;border-radius:6px;min-height:32px;min-width:32px;display:flex;align-items:center;justify-content:center">${isHidden ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2.9 12 C2.9 12 6.6 6.9 12 6.9 C17.4 6.9 21.1 12 21.1 12 C21.1 12 17.4 17.1 12 17.1 C6.6 17.1 2.9 12 2.9 12 Z"/><circle cx="12" cy="12" r="2.4"/><path d="M3.4 3.4 L20.6 20.6"/></svg>' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2.9 12 C2.9 12 6.6 6.9 12 6.9 C17.4 6.9 21.1 12 21.1 12 C21.1 12 17.4 17.1 12 17.1 C6.6 17.1 2.9 12 2.9 12 Z"/><circle cx="12" cy="12" r="2.4"/></svg>'}</button>
      <button data-layer-del="${o.id}" aria-label="Apagar anotação" title="Apagar" style="background:transparent;border:1px solid var(--border);color:var(--text-mut);cursor:pointer;padding:.15rem .35rem;border-radius:6px;min-height:32px;min-width:32px;display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5.2 7.2 H18.8"/><path d="M9.2 7.2 V4.9 H14.8 V7.2"/><path d="M7 7.2 L7.6 18.6 C7.6 19.5 8.2 20.2 9.1 20.2 H14.9 C15.8 20.2 16.4 19.5 16.4 18.6 L17 7.2"/><path d="M10.2 11.2 V15.8"/><path d="M13.8 11.2 V15.8"/></svg></button>
    </div>`;
  }).join("");
  list.querySelectorAll("[data-layer-eye]").forEach(btn => {
    btn.addEventListener("click", () => {
      const ov = overlayMgr.get(btn.dataset.layerEye);
      if (!ov) return;
      overlayMgr.update(btn.dataset.layerEye, { hidden: !ov.props.hidden });
      plot.draw();
    });
  });
  list.querySelectorAll("[data-layer-del]").forEach(btn => {
    btn.addEventListener("click", () => { overlayMgr.remove(btn.dataset.layerDel); plot.draw(); });
  });
  // remoção via clique duplo na linha (UX extra)
  Array.from(list.children).forEach(row => {
    row.addEventListener("dblclick", () => {
      const delBtn = row.querySelector("[data-layer-del]");
      if (delBtn) { overlayMgr.remove(delBtn.dataset.layerDel); plot.draw(); document.getElementById("readout").textContent="Anotação removida"; }
    });
  });
}
overlayMgr.onChange(renderLayers);
renderLayers();
overlayMgr.onChange(() => {
  plot._overlays = overlayMgr.getAll().filter(o => !o.props.hidden).map(o => ({
    draw: (ctx, p) => renderOverlaysOnPlot(ctx, p, [{ ...o.props, type: o.type }], formatExactValue)
  }));
});
plot._overlays = overlayMgr.getAll().filter(o => !o.props.hidden).map(o => ({
  draw: (ctx, p) => renderOverlaysOnPlot(ctx, p, [{ ...o.props, type: o.type }], formatExactValue)
}));
document.getElementById("tool-undo").addEventListener("click", () => { overlayMgr.undo(); plot.draw(); });
document.getElementById("tool-redo").addEventListener("click", () => { overlayMgr.redo(); plot.draw(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    downloadMenu.classList.remove("open");
    palette.classList.add("hidden");
    if (activeSheetPanel) closeSheet();
  }
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); overlayMgr.undo(); plot.draw(); }
  if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); overlayMgr.redo(); plot.draw(); }
  if (e.key === "d" || e.key === "D") { e.preventDefault(); plot.exportPNG(2); }
  if (e.key === "r" || e.key === "R") { e.preventDefault(); setView(null, { animated: true, ms: 340 }); }
});

/* ── Tabs 30x — Fórmulas / Ângulo / Ferramentas + infos fixas ── */
export function setActiveTab(name){
  document.querySelectorAll(".panel-tab").forEach(b=>{
    const on = b.dataset.tab === name;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", on ? "true" : "false");
  });
  document.querySelectorAll(".tab-panel").forEach(p=>p.classList.toggle("active", p.dataset.tab === name));
  if (name === "ferramentas") {
    const det = document.getElementById("tools-section");
    if (det && det.tagName === "DETAILS" && !det.open) det.open = true;
  }
}
document.querySelectorAll(".panel-tab").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    setActiveTab(btn.dataset.tab);
    const resumo = document.getElementById("prof-infos-resumo");
    if (resumo) {
      if (btn.dataset.tab === "angulo" && ucActive) {
        resumo.style.display = "block";
        resumo.textContent = `θ = ${document.getElementById("uc-ang")?.textContent || "—"} · cos ${document.getElementById("uc-cos")?.textContent || "—"} · sin ${document.getElementById("uc-sin")?.textContent || "—"}`;
      } else if (btn.dataset.tab !== "angulo") {
        if (ucActive && resumo.textContent) { resumo.style.display = "block"; }
      }
    }
  });
});

/* ── Bottom sheet (mobile) ── */
const bottomBar = document.getElementById("prof-bottom-bar");
const sheetOverlay = document.getElementById("sheet-overlay");
const profPanel = document.getElementById("prof-panel");
const profSheetEl = document.getElementById("prof-sheet");
let activeSheetPanel = null;

function openSheet(panelName) {
  if (activeSheetPanel === panelName) { closeSheet(); return; }
  profPanel.classList.add("open");
  profPanel.dataset.active = panelName;
  sheetOverlay.classList.add("open");
  bottomBar.querySelectorAll(".prof-bar-btn").forEach(b=>b.classList.toggle("active", b.dataset.panel===panelName));
  const tabMap = { formulas: "formulas", tools: "ferramentas", circle: "angulo" };
  const tabName = tabMap[panelName];
  if (tabName) setActiveTab(tabName);
  const target = panelName==="formulas" ? document.getElementById("sec-formulas") : panelName==="tools" ? document.getElementById("tools-section") : panelName==="circle" ? document.getElementById("uc-info") : null;
  if (target) {
    if (target.tagName === "DETAILS" && !target.open) target.open = true;
    setTimeout(()=>target.scrollIntoView({behavior:"smooth", block:"start"}), 120);
  }
  activeSheetPanel = panelName;
}

function closeSheet() {
  activeSheetPanel = null;
  profPanel.classList.remove("open");
  delete profPanel.dataset.active;
  sheetOverlay.classList.remove("open");
  bottomBar.querySelectorAll(".prof-bar-btn").forEach(b => b.classList.remove("active"));
}

bottomBar.querySelectorAll("[data-panel]").forEach(btn => {
  btn.addEventListener("click", () => openSheet(btn.dataset.panel));
});
bottomBar.querySelectorAll("[data-action]").forEach(btn => {
  btn.addEventListener("click", e => {
    if (btn.dataset.action==="download") {
      e.stopPropagation();
      const rect = btn.getBoundingClientRect();
      const willOpen = !downloadMenu.classList.contains("open");
      if (willOpen) {
        downloadMenu.classList.add("open");
        requestAnimationFrame(()=>positionDownloadMenu(rect));
      } else {
        downloadMenu.classList.remove("open");
      }
    }
    if (btn.dataset.action === "reset") { setView(null, { animated: true, ms: 340 }); }
    if (btn.dataset.action === "theme") { document.getElementById("theme-btn").click(); }
  });
});
sheetOverlay.addEventListener("click", closeSheet);
document.querySelector(".prof-sheet-handle")?.addEventListener("click", closeSheet);

