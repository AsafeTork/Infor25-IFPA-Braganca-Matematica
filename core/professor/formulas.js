/* core/professor/formulas.js — lista de fórmulas, paleta de cores, view/zoom e toggles π/círculo */
import { canvas, plot } from "./plot.js";
import { COLORS } from "./presets.js";
import { compile } from "../mathEngine.js";
import { circleActivate, clearTrace, invalidateContourCache, pausePlay, pruneTrace, traceEnabled, ucActive, ucPlayRaf, ucTheta, ucUpdateInfo } from "./unitCircle.js";
import { setActiveTab } from "./panel.js";
/* ──────────── FÓRMULAS ──────────── */
export let formulas = [];
export let piActive = false;
export let circleActive = false;

const PALETTE = [
  "#ffa500","#ffd23f","#60a5fa","#34d399","#a78bfa","#fb923c","#f472b6","#38bdf8",
  "#e11d48","#16a34a","#7c3aed","#0ea5e9","#d97706","#059669","#dc2626","#6366f1",
  "#f59e0b","#10b981","#3b82f6","#ec4899",
];

let _palTarget = null;
export const palette = document.getElementById("color-palette");
palette.innerHTML = PALETTE.map(c =>
  `<div class="cp-swatch" style="background:${c}" data-c="${c}"></div>`
).join("");

palette.querySelectorAll(".cp-swatch").forEach(sw => {
  sw.addEventListener("click", e => {
    e.stopPropagation();
    if (!_palTarget) return;
    const newColor = sw.dataset.c;
    _palTarget.color = newColor;
    _palTarget.dot.style.background = newColor;
    palette.querySelectorAll(".cp-swatch").forEach(s =>
      s.classList.toggle("active", s.dataset.c === newColor));
    updatePlot();
  });
});

document.addEventListener("click", () => {
  palette.classList.add("hidden");
  _palTarget = null;
});

function openPalette(dot, formula) {
  _palTarget = formula;
  const rect = dot.getBoundingClientRect();
  const palW = 160;
  const palH = 120;
  let left = rect.right + 8;
  if (left + palW > window.innerWidth) left = rect.left - palW - 8;
  if (left < 0) left = 8;
  let top = Math.min(rect.top, window.innerHeight - palH - 8);
  if (top < 0) top = 8;
  palette.style.left = left + "px";
  palette.style.top  = top + "px";
  palette.classList.remove("hidden");
  palette.querySelectorAll(".cp-swatch").forEach(s =>
    s.classList.toggle("active", s.dataset.c === formula.color));
}

export function addFormula(expr="") {
  const idx = formulas.length;
  const color = COLORS[idx % COLORS.length];
  const row = document.createElement("div");
  row.className = "frow";
  row.innerHTML = `
    <span class="frow-dot" style="background:${color}" title="Mudar cor"></span>
    <input class="frow-inp" name="f${idx}" autocomplete="off" placeholder="y=..." value="${expr}" spellcheck="false">
    <button class="frow-eye" aria-label="Ocultar fórmula" title="Ocultar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2.9 12 C2.9 12 6.6 6.9 12 6.9 C17.4 6.9 21.1 12 21.1 12 C21.1 12 17.4 17.1 12 17.1 C6.6 17.1 2.9 12 2.9 12 Z"/><circle cx="12" cy="12" r="2.4"/></svg></button>
    <button class="frow-del" aria-label="Remover fórmula" title="Remover fórmula"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5.2 7.2 H18.8"/><path d="M9.2 7.2 V4.9 H14.8 V7.2"/><path d="M7 7.2 L7.6 18.6 C7.6 19.5 8.2 20.2 9.1 20.2 H14.9 C15.8 20.2 16.4 19.5 16.4 18.6 L17 7.2"/><path d="M10.2 11.2 V15.8"/><path d="M13.8 11.2 V15.8"/></svg></button>`;
  const inp = row.querySelector("input");
  const dot = row.querySelector(".frow-dot");
  const eye = row.querySelector(".frow-eye");
  const del = row.querySelector(".frow-del");
  inp.addEventListener("input", updatePlot);
  del.addEventListener("click", () => {
    row.remove(); formulas = formulas.filter(f => f.inp !== inp); updatePlot();
  });
  const formula = { inp, color, dot, eye, hidden:false };
  const _eyeOpen = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2.9 12 C2.9 12 6.6 6.9 12 6.9 C17.4 6.9 21.1 12 21.1 12 C21.1 12 17.4 17.1 12 17.1 C6.6 17.1 2.9 12 2.9 12 Z"/><circle cx="12" cy="12" r="2.4"/></svg>';
  const _eyeClosed = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2.9 12 C2.9 12 6.6 6.9 12 6.9 C17.4 6.9 21.1 12 21.1 12 C21.1 12 17.4 17.1 12 17.1 C6.6 17.1 2.9 12 2.9 12 Z"/><circle cx="12" cy="12" r="2.4"/><path d="M3.4 3.4 L20.6 20.6"/></svg>';
  eye.addEventListener("click", () => { formula.hidden = !formula.hidden; eye.innerHTML = formula.hidden ? _eyeClosed : _eyeOpen; eye.style.opacity = formula.hidden ? ".45" : "1"; eye.title = formula.hidden ? "Mostrar" : "Ocultar"; eye.setAttribute("aria-label", formula.hidden ? "Mostrar fórmula" : "Ocultar fórmula"); updatePlot(); });
  dot.addEventListener("click", e => {
    e.stopPropagation();
    openPalette(dot, formula);
  });
  document.getElementById("formulas-rows").appendChild(row);
  formulas.push(formula);
  updatePlot();
}

export function updatePlot() {
  // Consistência ao adicionar/remover/ocultar: rastro só com cores vivas;
  // sem fórmula visível, some marcadores e rastro (nada fantasma).
  try {
    const live = new Set(formulas.filter(f=>!f.hidden && f.inp.value.trim()).map(f=>f.color || ""));
    pruneTrace(live);
    if (live.size === 0) {
      window._playPoints = [];
      if (window._playPoint) window._playPoint.visible = false;
      clearTrace();
    }
    // Marcadores acompanham as linhas em repouso (no play o step refaz a cada frame)
    if (!ucPlayRaf) {
      if (ucActive) { try { ucUpdateInfo(); } catch {} }
      else {
        window._playPoints = [];
        if (window._playPoint) window._playPoint.visible = false;
      }
    }
  } catch {}
  // FIX 2 — esconder função quando rastro ativo: só mostra rastro sendo desenhado
  if (typeof traceEnabled !== 'undefined' && traceEnabled) {
    window._hideCurves = true;
    plot._curvesHidden = true;
    plot._curvesHidden = traceEnabled;
    window._hideCurves = traceEnabled;
    try{ plot.curves.forEach(c=>c.hidden=true); }catch{}
    plot.setCurves([]);
    plot.curves = [];
    if (plot.setLabels) plot.setLabels([]);
    return;
  }
  window._hideCurves = false;
  plot._curvesHidden = false;
  const curves = formulas.filter(f=>!f.hidden).map(({inp,color}) => {
    const expr = inp.value.trim(); if (!expr) return null;
    try {
      const c=compile(expr);
      if(!c||c.error) return null;
      // Suporte a funções implícitas F(x,y)=0  —  ex: coração (x² + y² - 1)³ - x²y³ = 0 , círculo x² + y² = 4
      // coração é implícito (não é y=f(x)), por isso precisa de _drawImplicit via marching squares
      if(c.isImplicit) return {fn:c.fn, color, isImplicit:true, params:c.params};
      return {fn:c.fn, color, isImplicit:false, params:c.params};
    } catch { return null; }
  }).filter(Boolean);
  plot.setCurves(curves);
  // sync para SVG (apenas visíveis)
  if (plot.setLabels) plot.setLabels(formulas.filter(f=>!f.hidden && f.inp.value.trim()).map(f=>({ text: f.inp.value.trim(), color: f.color })));
  invalidateContourCache();
}

// 30x — view sempre isométrico: W/H = xRange / yRange  (preserva círculo)
// v=null => reset animado por padrão; v explícito => imediato salvo opts.animated=true
export function setView(v, opts = {}) {
  if (v) {
    const animated = !!opts.animated;
    if (animated && plot.animateView) plot.animateView(v, opts.ms || 320);
    else plot.setView(v);
    return;
  }
  const animated = opts.animated !== false; // reset padrão animado
  const W = canvas.clientWidth || plot.W || 800;
  const H = canvas.clientHeight || plot.H || 600;
  let xR, yR;
  if (piActive) { xR = 4*Math.PI; yR = xR * H / W; }
  else { xR = 12; yR = xR * H / W; }
  const target = { xmin:-xR/2, xmax:xR/2, ymin:-yR/2, ymax:yR/2 };
  if (animated && plot.animateView) plot.animateView(target, opts.ms || 320);
  else plot.setView(target);
}

let _animRaf = null;
export function animateView(target, ms=320) {
  if (_animRaf) cancelAnimationFrame(_animRaf);
  // normaliza alvo para isométrico (círculo não distorce) — usa plot.W/H atuais
  const W = plot.W || canvas.clientWidth || 800;
  const H = plot.H || canvas.clientHeight || 600;
  const vw = target.xmax - target.xmin;
  const isoVh = vw * H / W;
  const cy = (target.ymin + target.ymax) / 2;
  const isoTarget = { xmin: target.xmin, xmax: target.xmax, ymin: cy - isoVh/2, ymax: cy + isoVh/2 };
  // se já tem método no Plot, delega (garante cancelamento e rAF interno)
  if (plot.animateView && plot.animateView !== animateView) { plot.animateView(isoTarget, ms); return; }
  const start = {...plot.view};
  const t0 = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - t0)/ms);
    const e = 1 - Math.pow(1-t,3); // easeOutCubic — suave 60fps (numberanalytics best practice)
    plot.view.xmin = start.xmin + (isoTarget.xmin - start.xmin)*e;
    plot.view.xmax = start.xmax + (isoTarget.xmax - start.xmax)*e;
    plot.view.ymin = start.ymin + (isoTarget.ymin - start.ymin)*e;
    plot.view.ymax = start.ymax + (isoTarget.ymax - start.ymax)*e;
    plot.draw();
    if (t<1) _animRaf = requestAnimationFrame(tick);
    else _animRaf = null;
  }
  _animRaf = requestAnimationFrame(tick);
}
window.__animateView = animateView;
window.__setView = setView;
window.__getUcTheta = () => ucTheta;
window.__ucActive = () => ucActive;

document.getElementById("btn-add").addEventListener("click", ()=>addFormula());

const btnPi = document.getElementById("btn-pi");
export function applyPiAxis(on) {
  piActive = on;
  btnPi.classList.toggle("active", on);
  plot.setPiAxis(on);
  plot.draw();
}
btnPi.addEventListener("click", ()=>{ applyPiAxis(!piActive); });

const btnCircle = document.getElementById("btn-circle");
export function applyCircleToggle(on) {
  circleActive = on; btnCircle.classList.toggle("active", on);
  circleActivate(on);
  document.getElementById("uc-info").classList.toggle("show", on);
  if (on) {
    setActiveTab("angulo");
    ucUpdateInfo(); plot.draw();
    const resumo = document.getElementById("prof-infos-resumo");
    if (resumo) { resumo.style.display="block"; resumo.textContent = `θ = ${document.getElementById("uc-ang")?.textContent || "—"} · cos ${document.getElementById("uc-cos")?.textContent || "—"} · sin ${document.getElementById("uc-sin")?.textContent || "—"}`; }
  } else {
    plot.draw();
    const resumo = document.getElementById("prof-infos-resumo");
    if (resumo) resumo.style.display="none";
  }
}
btnCircle.addEventListener("click", ()=>{
  pausePlay();
  applyCircleToggle(!circleActive);
});

document.getElementById("btn-reset").addEventListener("click", ()=>{ setView(null, { animated: true, ms: 340 }); });

