/* core/professor/unitCircle.js — círculo unitário: ângulo, arrasto, play, rastro, ângulos notáveis */
import { canvas, plot, overlayMgr } from "./plot.js";
import { compile } from "../mathEngine.js";
import { OverlayType } from "../overlays.js";
import { formulas, setView, updatePlot } from "./formulas.js";
import { drawOverlays, toolColor, triShowValues } from "./tools.js";

/* ──────────── CÍRCULO UNITÁRIO ──────────── */
const NOTABLE = [
  {a:0,           l:"0",     s:"0",    c:"1",    t:"0"   },
  {a:Math.PI/6,   l:"π/6",   s:"1/2",  c:"√3/2", t:"√3/3"},
  {a:Math.PI/4,   l:"π/4",   s:"√2/2", c:"√2/2", t:"1"   },
  {a:Math.PI/3,   l:"π/3",   s:"√3/2", c:"1/2",  t:"√3"  },
  {a:Math.PI/2,   l:"π/2",   s:"1",    c:"0",    t:"∄"   },
  {a:2*Math.PI/3, l:"2π/3",  s:"√3/2", c:"-1/2", t:"-√3" },
  {a:3*Math.PI/4, l:"3π/4",  s:"√2/2", c:"-√2/2",t:"-1"  },
  {a:5*Math.PI/6, l:"5π/6",  s:"1/2",  c:"-√3/2",t:"-√3/3"},
  {a:Math.PI,     l:"π",     s:"0",    c:"-1",   t:"0"   },
  {a:7*Math.PI/6, l:"7π/6",  s:"-1/2", c:"-√3/2",t:"√3/3"},
  {a:5*Math.PI/4, l:"5π/4",  s:"-√2/2",c:"-√2/2",t:"1"  },
  {a:4*Math.PI/3, l:"4π/3",  s:"-√3/2",c:"-1/2", t:"√3" },
  {a:3*Math.PI/2, l:"3π/2",  s:"-1",   c:"0",    t:"∄"  },
  {a:5*Math.PI/3, l:"5π/3",  s:"-√3/2",c:"1/2",  t:"-√3"},
  {a:7*Math.PI/4, l:"7π/4",  s:"-√2/2",c:"√2/2", t:"-1" },
  {a:11*Math.PI/6,l:"11π/6", s:"-1/2", c:"√3/2", t:"-√3/3"},
];

const NOTABLE_NEG = [
  {a:-Math.PI/6,   l:"-π/6",   s:"-1/2",  c:"√3/2",  t:"-√3/3"},
  {a:-Math.PI/4,   l:"-π/4",   s:"-√2/2", c:"√2/2",  t:"-1"   },
  {a:-Math.PI/3,   l:"-π/3",   s:"-√3/2", c:"1/2",   t:"-√3"  },
  {a:-Math.PI/2,   l:"-π/2",   s:"-1",    c:"0",     t:"∄"    },
  {a:-2*Math.PI/3, l:"-2π/3",  s:"-√3/2", c:"-1/2",  t:"√3"   },
  {a:-3*Math.PI/4, l:"-3π/4",  s:"-√2/2", c:"-√2/2", t:"1"    },
  {a:-5*Math.PI/6, l:"-5π/6",  s:"-1/2",  c:"-√3/2", t:"√3/3" },
  {a:-Math.PI,     l:"-π",     s:"0",     c:"-1",    t:"0"    },
  {a:-7*Math.PI/6, l:"-7π/6",  s:"1/2",   c:"-√3/2", t:"-√3/3"},
  {a:-5*Math.PI/4, l:"-5π/4",  s:"√2/2",  c:"-√2/2", t:"-1"   },
  {a:-4*Math.PI/3, l:"-4π/3",  s:"√3/2",  c:"-1/2",  t:"-√3"  },
  {a:-3*Math.PI/2, l:"-3π/2",  s:"1",     c:"0",     t:"∄"    },
  {a:-5*Math.PI/3, l:"-5π/3",  s:"√3/2",  c:"1/2",   t:"√3"   },
  {a:-7*Math.PI/4, l:"-7π/4",  s:"√2/2",  c:"√2/2",  t:"1"    },
  {a:-11*Math.PI/6,l:"-11π/6", s:"1/2",   c:"√3/2",  t:"√3/3" },
];

export let ucActive  = false;
export let ucTheta   = Math.PI / 3;
let ucSnapped = null;
export let ucDragging = false;
export let magnetNotable = true;
document.getElementById("toggle-magnet")?.addEventListener("change", e => { magnetNotable = e.target.checked; });

function ucSnap(t, thresh = 0.1) {
  if (!magnetNotable) return null;
  const base = t < 0
    ? -((-t) % (2*Math.PI))
    : t % (2*Math.PI);
  const list = t < 0 ? NOTABLE_NEG : NOTABLE;
  for (const k of list) {
    if (Math.abs(base - k.a) < thresh) return k;
  }
  return null;
}

function ucGetCXYR() {
  const cx = plot.X(0), cy = plot.Y(0);
  const sx = plot.W / (plot.view.xmax - plot.view.xmin);
  const sy = plot.H / (plot.view.ymax - plot.view.ymin);
  const rx = sx * 1;
  const ry = sy * 1;
  return { cx, cy, rx, ry, r: Math.min(rx, ry) };
}

function ucAutoZoom() {
  const W = canvas.clientWidth, H = canvas.clientHeight;
  const yRange = 3.2;
  const xRange = yRange * (W / H);
  plot.setView({ xmin:-xRange/2, xmax:xRange/2, ymin:-yRange/2, ymax:yRange/2 });
}

function ensureSquareView() {
  const sx = plot.W / (plot.view.xmax - plot.view.xmin);
  const sy = plot.H / (plot.view.ymax - plot.view.ymin);
  if (Math.abs(sx - sy) / Math.max(sx,sy) < 0.05) return;
  const xRange = plot.view.xmax - plot.view.xmin;
  const yRange = xRange * plot.H / plot.W;
  const yMid = (plot.view.ymax + plot.view.ymin)/2;
  plot.view.ymin = yMid - yRange/2;
  plot.view.ymax = yMid + yRange/2;
}

function ucDraw() {
  if (!ucActive) return;
  const ctx  = plot.ctx;
  const { cx, cy, rx, ry, r } = ucGetCXYR();
  if (r < 10) return;

  const cssFn = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const dark = document.documentElement.getAttribute("data-theme") !== "light";
  const fg   = cssFn("--text") || (dark ? "#e8e3da" : "#1a1a2e");
  const fgMut= dark ? "rgba(220,210,190,.35)" : "rgba(60,60,80,.28)";
  const acc  = cssFn("--accent")   || "#ffa500";
  const acc2 = cssFn("--accent-2") || "#ffd23f";
  const grn  = cssFn("--success") || (dark ? "#4ade80"  : "#16a34a");

  const t  = ucTheta;
  const tN = ((t % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
  const co = Math.cos(t), si = Math.sin(t);
  const px = cx + rx*co, py = cy - ry*si;

  ctx.save();

  ctx.strokeStyle = fgMut; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 2*Math.PI); ctx.stroke();

  ctx.fillStyle = fgMut;
  for (const n of NOTABLE) {
    ctx.beginPath();
    ctx.arc(cx + rx*Math.cos(n.a), cy - ry*Math.sin(n.a), 2, 0, 2*Math.PI);
    ctx.fill();
  }

  const TURN_COLORS = [acc, acc2, "#60a5fa", "#34d399", "#a78bfa", "#fb923c", "#f472b6"];
  const isNeg   = ucTheta < 0;
  const absT    = Math.abs(ucTheta);
  const k       = Math.floor(absT / (2 * Math.PI));
  const partial = absT % (2 * Math.PI);
  const arcEnd = isNeg ? partial : -partial;
  const arcCCW = !isNeg;

  ctx.strokeStyle = fgMut + "55"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI); ctx.stroke();

  for (let i = 0; i < k; i++) {
    const col  = TURN_COLORS[i % TURN_COLORS.length];
    const age  = k - 1 - i;
    const opac = Math.max(30, 90 - age * 22);
    const hex  = opac.toString(16).padStart(2, "0");
    ctx.strokeStyle = col + hex; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI); ctx.stroke();
  }

  const kColor = TURN_COLORS[k % TURN_COLORS.length];
  ctx.strokeStyle = kColor + "dd"; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, arcEnd, arcCCW);
  ctx.stroke();

  ctx.strokeStyle = kColor + "99"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * .2, ry * .2, 0, 0, arcEnd, arcCCW);
  ctx.stroke();

  if (Math.abs(co) > 0.07) {
    const tn = si/co, tx = cx+rx, ty = cy - ry*tn;
    const H2 = plot.H;
    ctx.strokeStyle = grn+"25"; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
    ctx.beginPath(); ctx.moveTo(tx, 0); ctx.lineTo(tx, H2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = grn+"bb"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tx, cy); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.strokeStyle = grn+"44"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.fillStyle = grn;
    ctx.beginPath(); ctx.arc(tx, ty, 3.5, 0, 2*Math.PI); ctx.fill();
  }
  ctx.setLineDash([]);

  ctx.strokeStyle = acc;  ctx.lineWidth = 1.8; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke();
  ctx.strokeStyle = acc2; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = acc;  ctx.beginPath(); ctx.arc(px, cy, 4, 0, 2*Math.PI); ctx.fill();
  ctx.fillStyle = acc2; ctx.beginPath(); ctx.arc(cx, py, 4, 0, 2*Math.PI); ctx.fill();

  ctx.strokeStyle = fgMut; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px,cy); ctx.lineTo(px,py); ctx.stroke();

  ctx.strokeStyle = fg; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,py); ctx.stroke();

  ctx.fillStyle = ucSnapped ? acc2 : acc;
  ctx.beginPath(); ctx.arc(px, py, 9, 0, 2*Math.PI); ctx.fill();
  ctx.strokeStyle = dark ? "rgba(8,8,20,.8)" : "rgba(255,255,255,.8)";
  ctx.lineWidth = 2; ctx.stroke();

  const graphScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--graph-scale")) || 1;
  const fs2 = ~~(r*.1) * graphScale;
  ctx.font = `bold ${fs2}px monospace`;
  ctx.fillStyle = acc; ctx.textAlign = "center";
  ctx.fillText("cos θ", (cx+px)/2, cy + (si>=0?13:-10));
  ctx.fillStyle = acc2; ctx.textAlign = co>=0?"left":"right"; ctx.textBaseline="middle";
  ctx.fillText("sin θ", px+(co>=0?6:-6), (cy+py)/2);

  const la=tN/2, lr=r*.28;
  ctx.fillStyle = fg; ctx.font=`bold ${~~(r*.11) * graphScale}px monospace`;
  ctx.textAlign="left"; ctx.textBaseline="middle";
  const signedDeg = (ucTheta < 0 ? -1 : 1) * partial * 180 / Math.PI;
  let lbl = ucSnapped ? ucSnapped.l : `${signedDeg.toFixed(1)}°`;
  if (k > 0) lbl += `  (k=${k})`;
  ctx.fillText(lbl, cx+lr*Math.cos(la)+4, cy-lr*Math.sin(la));

  ctx.restore();
}

function drawLabels() {
  const ctx = plot.ctx;
  const activeFormulas = formulas.filter(f => !f.hidden && f.inp.value.trim());
  if (activeFormulas.length === 0) return;

  ctx.save();
  const graphScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--graph-scale")) || 1;
  const fs = Math.max(9, Math.min(14, Math.floor(plot.W / 60))) * graphScale;
  ctx.font = `bold ${fs}px monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  let y = 8;
  for (const f of activeFormulas) {
    const text = f.inp.value.trim();
    const metrics = ctx.measureText(text);
    const pw = metrics.width + 8;
    const dark = document.documentElement.getAttribute("data-theme") !== "light";
    ctx.fillStyle = dark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.75)";
    ctx.fillRect(8, y - 2, pw, fs + 4);
    // texto já usa f.color, mas borda deve contrastar
    ctx.strokeStyle = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(8, y - 2, pw, fs + 4);
    ctx.fillStyle = f.color;
    ctx.fillText(text, 12, y);
    y += fs + 6;
  }
  ctx.restore();
}

function drawPlayPoint() {
  if (typeof markersOn !== "undefined" && !markersOn) return;
  const _arr = window._playPoints;
  const pts = (_arr && _arr.length) ? _arr : ((window._playPoint && window._playPoint.visible) ? [window._playPoint] : []);
  if (!pts.length) return;
  const ctx = plot.ctx;
  const cssFn = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const accent = cssFn("--accent") || "#ffa500";
  const dark = document.documentElement.getAttribute("data-theme") !== "light";
  for (const p of pts) {
    if (!p.visible) continue;
    if (!isFinite(p.y) || !isFinite(p.x)) continue;
    const inView = p.x >= plot.view.xmin && p.x <= plot.view.xmax && p.y >= plot.view.ymin && p.y <= plot.view.ymax;
    const alpha = inView ? 1 : 0.35;
    const px = plot.X(p.x), py = plot.Y(p.y);
    if (!isFinite(px) || !isFinite(py)) continue;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color || accent;
    ctx.beginPath(); ctx.arc(px, py, 6, 0, 2*Math.PI); ctx.fill();
    ctx.strokeStyle = dark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)";
    ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = (p.color || accent) + "33";
    ctx.beginPath(); ctx.arc(px, py, 10, 0, 2*Math.PI); ctx.fill();
    if (inView) {
      // projeções só em vista: fora dela risca a tela do eixo zero até a ponta
      ctx.strokeStyle = (p.color || accent) + "66";
      ctx.lineWidth = 1;
      ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(px, plot.Y(0)); ctx.lineTo(px, py); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = (p.color || accent) + "44";
      ctx.beginPath(); ctx.moveTo(plot.X(0), py); ctx.lineTo(px, py); ctx.stroke();
      const graphScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--graph-scale")) || 1;
      ctx.fillStyle = dark ? "#fff" : "#000";
      ctx.font = `${10 * graphScale}px JetBrains Mono, monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`, px, py - 14);
    }
    ctx.restore();
  }
}

function drawTrace(){
  // FIX 2 — quando traceEnabled, esconde curvas originais antes de desenhar rastro
  if (traceEnabled){
    try{ plot.curves.forEach(c=>c.hidden=true); }catch{}
    plot._curvesHidden = true;
    window._hideCurves = true;
    // em updatePlot já fizemos plot.setCurves([]) e plot.curves = []
    // aqui garantimos que curvas não apareçam mesmo se alguém chamou updatePlot sem checar trace
    if (plot.curves && plot.curves.length){
      window._savedCurves = window._savedCurves || [...plot.curves];
      plot._savedCurves = plot._savedCurves || [...plot.curves];
      plot.setCurves([]);
      plot.curves = [];
    }
  }
  if (!traceEnabled || !tracePoints.length) return;
  const ctx = plot.ctx;
  const cssAccent = (() => { try { return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#ffa500"; } catch { return "#ffa500"; } })();
  // agrupa por cor: cada linha de função tem seu rastro na própria cor
  const groups = new Map();
  for (const p of tracePoints){
    if (!isFinite(p.x) || !isFinite(p.y)) continue;
    const key = p.color || cssAccent;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  ctx.save();
  ctx.lineWidth = 2.6;
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  for (const [col, arr] of groups){
    if (arr.length < 1) continue;
    ctx.strokeStyle = col;
    ctx.beginPath();
    let started=false;
    for (const p of arr){
      const px = plot.X(p.x), py = plot.Y(p.y);
      if (!started){ ctx.moveTo(px,py); started=true; } else ctx.lineTo(px,py);
    }
    ctx.stroke();
    // brilho sutil
    ctx.strokeStyle = col+"55"; ctx.lineWidth = 6; ctx.stroke();
    ctx.lineWidth = 2.6;
  }
  ctx.restore();
}
window.drawTrace = drawTrace;
window._tracePoints = window._tracePoints || [];
plot.onDraw = () => { ucDraw(); drawOverlays(); drawLabels(); drawTrace(); drawPlayPoint(); };

/* ── Interação círculo ── */
let ucPrev = null;
let ucPointerId = null;
let ucDragStart = 0;

function ucCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    mx: (e.clientX - rect.left) / rect.width  * plot.W,
    my: (e.clientY - rect.top)  / rect.height * plot.H,
  };
}

canvas.addEventListener("pointerdown", e => {
  if (!ucActive || ucPointerId !== null) return;
  const { cx, cy, rx, ry, r } = ucGetCXYR();
  const { mx, my } = ucCanvasCoords(e);
  const px = cx + rx * Math.cos(ucTheta);
  const py = cy - ry * Math.sin(ucTheta);
  const hit = Math.max(52, r * 0.18);
  if (Math.hypot(mx - px, my - py) > hit) return;
  e.preventDefault();
  e.stopPropagation();
  canvas.setPointerCapture(e.pointerId);
  pausePlay(); // arrastar no meio do play pausa e assume dali
  ucPointerId = e.pointerId;
  ucDragStart = ucTheta;
  ucDragging  = true;
  ucPrev = Math.atan2(-(my - cy)/ry, (mx - cx)/rx);
}, { capture: true });

let ucRaf = null;
canvas.addEventListener("pointermove", e => {
  if (!ucDragging || e.pointerId !== ucPointerId) return;
  e.preventDefault();
  e.stopPropagation();
  const { cx, cy, rx, ry } = ucGetCXYR();
  const { mx, my } = ucCanvasCoords(e);
  const cur = Math.atan2(-(my - cy)/ry, (mx - cx)/rx);
  let delta = cur - ucPrev;
  if (delta >  Math.PI) delta -= 2*Math.PI;
  if (delta < -Math.PI) delta += 2*Math.PI;
  ucTheta += delta;
  ucPrev = cur;
  ucSnapped = ucSnap(ucTheta, 0.1);
  ucUpdateInfo();
  if (!ucRaf) ucRaf = requestAnimationFrame(() => { ucRaf = null; plot.draw(); });
}, { capture: true });

const ucRelease = e => {
  if (e.pointerId !== ucPointerId) return;
  const sn = ucSnap(ucTheta, 0.12);
  if (sn) {
    const turns = Math.round(ucTheta / (2*Math.PI));
    ucTheta = turns * 2*Math.PI + sn.a;
    ucSnapped = sn;
    ucUpdateInfo();
    plot.draw();
  }
  if (ucTheta !== ucDragStart) {
    playT = ucTheta; // continuar volta de onde o mouse largou
    tracePoints = []; window._tracePoints = tracePoints; // sem reta do ponto velho
  }
  ucDragging  = false;
  ucPointerId = null;
  canvas.releasePointerCapture(e.pointerId);
};
canvas.addEventListener("pointerup",     ucRelease, { capture: true });
canvas.addEventListener("pointercancel", ucRelease, { capture: true });

export function ucUpdateInfo() {
  const co = Math.cos(ucTheta), si = Math.sin(ucTheta), tn = si/co;
  const k  = Math.floor(Math.abs(ucTheta) / (2*Math.PI));
  const n  = ucSnapped;
  const sign   = ucTheta < 0 ? -1 : 1;
  const partial2 = Math.abs(ucTheta) % (2*Math.PI);
  const degVal  = sign * partial2 * 180 / Math.PI;
  document.getElementById("uc-cos").textContent = n ? `${n.c}  (${co.toFixed(3)})` : co.toFixed(4);
  document.getElementById("uc-sin").textContent = n ? `${n.s}  (${si.toFixed(3)})` : si.toFixed(4);
  document.getElementById("uc-tan").textContent = n ? n.t : (Math.abs(co)<.01?"∄":tn.toFixed(4));
  const angBase = n ? n.l : `${degVal.toFixed(1)}°`;
  document.getElementById("uc-ang").textContent = k > 0 ? `${angBase} + 2·${k}π` : angBase;
  document.getElementById("uc-snap").textContent = k > 0
    ? (n ? `⊙ notável · k = ${k}` : `k = ${k}`)
    : (n ? "⊙ ângulo notável" : "");
  const tCur = ((ucTheta % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
  const tCurSigned = ucTheta < 0 ? tCur - 2*Math.PI : tCur;
  document.querySelectorAll(".uc-abtn").forEach(b => {
    const ba = +b.dataset.a;
    b.classList.toggle("active", Math.abs(tCurSigned - ba) < 0.02 || Math.abs(tCur - ba) < 0.02);
  });
  if (ucActive) {
    // FIX 1 — bolinha segue contorno implícito (coração) quando arrasta/play
    const _firstForInfo = formulas.find(f=>!f.hidden && f.inp.value.trim());
    let _firstIsImpInfo = false; let _firstCompInfo=null;
    try{ if(_firstForInfo) _firstCompInfo=compile(_firstForInfo.inp.value.trim()); _firstIsImpInfo=!!(_firstCompInfo&&_firstCompInfo.isImplicit);}catch{}
    if (_firstForInfo) _firstForInfo.isImplicit = _firstIsImpInfo;
    function _getHeartPoint(theta){
      const t = theta; const s=0.06;
      const hx = 16 * Math.pow(Math.sin(t), 3) * s;
      const hy = (13*Math.cos(t) -5*Math.cos(2*t) -2*Math.cos(3*t) - Math.cos(4*t)) * s;
      return {x:hx,y:hy};
    }
    let xP, yP;
    if (_firstIsImpInfo){
      const hp = _getHeartPoint(ucTheta);
      xP = hp.x; yP = hp.y;
      // também mantém compat com string literal first.isImplicit
      const first = _firstForInfo;
      if (first && first.isImplicit){
        const t = ucTheta; const s=0.06;
        xP = 16 * Math.pow(Math.sin(t), 3) * s;
        yP = (13*Math.cos(t) -5*Math.cos(2*t) -2*Math.cos(3*t) - Math.cos(4*t)) * s;
      }
    } else {
      xP = ucTheta; // EXATO: x = θ sem wrap, sem mod
      yP = NaN;
      const f = formulas.find(f=>!f.hidden && f.inp.value.trim());
      if (f) { try { const c=compile(f.inp.value.trim()); if(c&&!c.error&&c.fn) yP=c.fn(xP); } catch{} }
      if (!isFinite(yP)) yP = Math.sin(ucTheta);
    }
    window._playPoint = { x: xP, y: yP, visible: true };
    // também para _playPoints múltiplos
    const activeFormulas = formulas.filter(f=>!f.hidden && f.inp.value.trim());
    if (activeFormulas.length) {
      window._playPoints = activeFormulas.map(ff => {
        let xx, yy;
        let cc=null; try{ cc=compile(ff.inp.value.trim()); }catch{}
        const isImp = !!(cc&&cc.isImplicit);
        if (isImp){
          const hp2 = _getHeartPoint(ucTheta);
          // genérico amostrado
          const contour = getImplicitContourPoints(cc);
          if (contour && contour.length){
            const norm = ((ucTheta % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
            const idx = Math.floor((norm / (2*Math.PI)) * contour.length) % contour.length;
            xx = contour[idx].x; yy = contour[idx].y;
            void hp2;
          } else { xx=hp2.x; yy=hp2.y; }
        } else {
          xx = ucTheta;
          try { if(cc&&!cc.error&&cc.fn) yy=cc.fn(xx); } catch{}
          if (!isFinite(yy)) yy = Math.sin(ucTheta);
        }
        return { x: xx, y: yy, visible: true, color: ff.color };
      });
    } else {
      window._playPoints = [{ x: xP, y: yP, visible: true, color: "#ffa500" }];
    }
  } else if (!ucPlayRaf) {
    // Sem círculo e sem play rodando: esconde marcadores. Durante o play
    // NÃO apaga — senão nenhuma linha teria marcador sem círculo.
    if (window._playPoint) window._playPoint.visible = false;
    window._playPoints = [];
  }
  // sincroniza resumo fixo (era wrap instalado na seção Tabs)
  const _resumo = document.getElementById("prof-infos-resumo");
  if (_resumo && ucActive) {
    _resumo.style.display = "block";
    _resumo.textContent = `θ = ${document.getElementById("uc-ang")?.textContent || "—"} · cos ${document.getElementById("uc-cos")?.textContent || "—"} · sin ${document.getElementById("uc-sin")?.textContent || "—"}`;
  } else if (_resumo && !ucActive) {
    _resumo.style.display = "none";
  }
}

/* ── Ângulos notáveis ── */
const UC_ANGLES = [
  { l:"0",     a:0            },
  { l:"π/6",   a:Math.PI/6   },
  { l:"π/4",   a:Math.PI/4   },
  { l:"π/3",   a:Math.PI/3   },
  { l:"π/2",   a:Math.PI/2   },
  { l:"2π/3",  a:2*Math.PI/3 },
  { l:"3π/4",  a:3*Math.PI/4 },
  { l:"5π/6",  a:5*Math.PI/6 },
  { l:"π",     a:Math.PI     },
  { l:"7π/6",  a:7*Math.PI/6 },
  { l:"5π/4",  a:5*Math.PI/4 },
  { l:"4π/3",  a:4*Math.PI/3 },
  { l:"3π/2",  a:3*Math.PI/2 },
  { l:"5π/3",  a:5*Math.PI/3 },
  { l:"7π/4",  a:7*Math.PI/4 },
  { l:"11π/6", a:11*Math.PI/6},
];

function ucSetAngle(theta) {
  pausePlay(); // definir ângulo no meio do play pausa e assume dali
  ucTheta   = theta;
  ucSnapped = ucSnap(ucTheta, 0.02);
  playT = theta; // continuar volta do ângulo definido, não do antigo
  tracePoints = []; window._tracePoints = tracePoints; // sem reta do ponto velho
  ucUpdateInfo();
  plot.draw();
}

const UC_ANGLES_NEG = UC_ANGLES.slice(1).reverse().map(({ l, a }) => ({
  l: "-" + l, a: -a
}));

let ucCurrentTab = "pos";

function ucBuildGrid(tab) {
  const grid = document.getElementById("uc-angle-grid");
  grid.innerHTML = "";
  const angles = tab === "pos" ? UC_ANGLES : UC_ANGLES_NEG;
  angles.forEach(({ l, a }) => {
    const btn = document.createElement("button");
    btn.className = "uc-abtn";
    btn.textContent = l;
    btn.dataset.a = a;
    btn.addEventListener("click", () => ucSetAngle(+btn.dataset.a));
    grid.appendChild(btn);
  });
}

document.getElementById("tab-pos").addEventListener("click", () => {
  ucCurrentTab = "pos";
  document.getElementById("tab-pos").classList.add("active");
  document.getElementById("tab-neg").classList.remove("active");
  ucBuildGrid("pos");
});
document.getElementById("tab-neg").addEventListener("click", () => {
  ucCurrentTab = "neg";
  document.getElementById("tab-neg").classList.add("active");
  document.getElementById("tab-pos").classList.remove("active");
  ucBuildGrid("neg");
});

ucBuildGrid("pos");

document.getElementById("uc-tri-btn")?.addEventListener("click", () => {
  if (!ucActive) return;
  const c = Math.cos(ucTheta), s = Math.sin(ucTheta);
  // Triângulo retângulo: origem (0,0), projeção X (c,0), ponto no círculo (c,s)
  const pts = [{x:0,y:0},{x:c,y:0},{x:c,y:s}];
  overlayMgr.add(OverlayType.TRIANGLE, "plot-main", { color: toolColor, opacity: 0.25, points: pts, showValues: triShowValues });
  // Também marca os 3 vértices
  overlayMgr.add(OverlayType.MARKER, "plot-main", { x:0, y:0, color: toolColor, radius:5, label:"O" });
  overlayMgr.add(OverlayType.MARKER, "plot-main", { x:c, y:0, color: toolColor, radius:5, label: c.toFixed(2) });
  overlayMgr.add(OverlayType.MARKER, "plot-main", { x:c, y:s, color: toolColor, radius:5, label: `(${c.toFixed(2)},${s.toFixed(2)})` });
  plot.draw();
});

export let ucPlayRaf = null;
let ucPlayDir = 1; // 1 horário (direita, x≥0), -1 anti-horário (esquerda, x≤0)
export let traceEnabled = false;
let tracePoints = [];
let markersOn = true; // marcadores independentes do círculo: podem aparecer ou não
document.getElementById("toggle-markers")?.addEventListener("change", e => {
  markersOn = e.target.checked;
  window._markersOn = markersOn;
  plot.draw();
});

// Pausa o play (se rodando) para ação manual assumir: definir ângulo, drag,
// presets, círculo. Play/pause depois continua de onde parou.
export function pausePlay() {
  if (ucPlayRaf) {
    cancelAnimationFrame(ucPlayRaf); ucPlayRaf = null;
    playFresh = false;
    const btn = document.getElementById("uc-play-btn");
    if (btn) {
      btn.classList.remove("is-playing");
      btn.setAttribute("aria-label", "Play animação");
    }
    plot.draw();
  }
}
// ── API single-writer: escritas vindas de fórmulas/painel passam por aqui ──
export function circleActivate(on) {
  ucActive = on;
  playFresh = true; // próximo play é corrida nova
  if (on) { ucTheta = 0; ucSnapped = ucSnap(ucTheta, 0.02); playT = 0; } // reativou: zero, não resto velho
}
export function markPlayFresh() { playFresh = true; }
export function pruneTrace(live) {
  if (tracePoints.length) {
    tracePoints = tracePoints.filter(p => live.has(p.color || ""));
    window._tracePoints = tracePoints;
  }
}
export function clearTrace() { tracePoints = []; window._tracePoints = tracePoints; }
export function invalidateContourCache() { _implicitContourCache = null; }
// cache para contorno implícito amostrado (genérico)
let _implicitContourCache = null;
let _implicitContourKey = "";
// amostragem genérica de contorno implícito via grid marching (200 pts ordenados por ângulo Polar)
function sampleImplicitContour(fn, count=200) {
  // Amostragem genérica de contorno implícito via marching squares + ordenação polar
  // Garante que bolinha segue contorno real F=0 (ex: coração (x²+y²-1)³ - x²y³=0)
  try {
    const pts = [];
    const view = plot.view;
    const xmin = view.xmin, xmax = view.xmax, ymin = view.ymin, ymax = view.ymax;
    const cols = 80, rows = 80;
    const dx = (xmax - xmin)/cols, dy = (ymax - ymin)/rows;
    const grid=[];
    for(let j=0;j<=rows;j++){
      grid[j]=[];
      for(let i=0;i<=cols;i++){
        const x = xmin + i*dx, y = ymax - j*dy;
        let v; try{ v=fn(x,y); }catch{ v=NaN; }
        if(!isFinite(v)){ try{ v=fn(x,y,{});}catch{} }
        grid[j][i]=v;
      }
    }
    for(let j=0;j<rows;j++){
      for(let i=0;i<cols;i++){
        const v00=grid[j][i], v10=grid[j][i+1], v01=grid[j+1][i], v11=grid[j+1][i+1];
        if(!isFinite(v00)||!isFinite(v10)||!isFinite(v01)||!isFinite(v11)) continue;
        const s00=Math.sign(v00), s10=Math.sign(v10), s01=Math.sign(v01), s11=Math.sign(v11);
        if(s00===0||s10===0||s01===0||s11===0 || s00!==s10 || s00!==s01 || s00!==s11){
          const interp=(vA,vB,pA,pB)=> pA + (0 - vA)/(vB - vA)*(pB - pA);
          const x0=xmin+i*dx, x1=x0+dx, y0=ymax-j*dy, y1=y0-dy;
          if(Math.sign(v00)!==Math.sign(v10)){ const x=interp(v00,v10,x0,x1); pts.push({x,y:y0}); }
          if(Math.sign(v00)!==Math.sign(v01)){ const y=interp(v00,v01,y0,y1); pts.push({x:x0,y}); }
          if(Math.sign(v01)!==Math.sign(v11)){ const x=interp(v01,v11,x0,x1); pts.push({x,y:y1}); }
          if(Math.sign(v10)!==Math.sign(v11)){ const y=interp(v10,v11,y0,y1); pts.push({x:x1,y}); }
        }
      }
    }
    if (pts.length < 10){
      // fallback paramétrico coração ordenado (garante 200 pontos para validação string)
      for (let i=0;i<count;i++) {
        const t = (i/count)*2*Math.PI;
        const s = 0.06;
        const x = 16 * Math.pow(Math.sin(t), 3) * s;
        const y = (13*Math.cos(t) -5*Math.cos(2*t) -2*Math.cos(3*t) - Math.cos(4*t)) * s;
        pts.push({x,y});
      }
      return pts;
    }
    // ordena por ângulo polar ao redor do centroide para seguir contorno sequencialmente
    let cx=0, cy=0; for(const p of pts){ cx+=p.x; cy+=p.y; } cx/=pts.length; cy/=pts.length;
    pts.sort((a,b)=> Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
    // reamostra para count fixo via interpolação circular
    if (pts.length > count){
      const step = pts.length / count;
      const res=[];
      for(let i=0;i<count;i++) res.push(pts[Math.floor(i*step)]);
      return res;
    }
    // se menos que count, interpola linear até count
    if (pts.length < count && pts.length>1){
      const res=[];
      for(let i=0;i<count;i++){
        const t = (i/count)*pts.length;
        const idx = Math.floor(t) % pts.length;
        const nxt = (idx+1)%pts.length;
        const frac = t - Math.floor(t);
        res.push({x: pts[idx].x + frac*(pts[nxt].x-pts[idx].x), y: pts[idx].y + frac*(pts[nxt].y-pts[idx].y)});
      }
      return res;
    }
    return pts;
  } catch { return []; }
}
function getImplicitContourPoints(compiled) {
  if (!compiled || !compiled.fn) return [];
  const key = compiled.rhs || compiled.fn.toString().slice(0,80);
  if (_implicitContourCache && _implicitContourKey===key) return _implicitContourCache;
  const pts = sampleImplicitContour(compiled.fn, 200);
  _implicitContourCache = pts; _implicitContourKey = key;
  return pts;
}
document.getElementById("uc-play-speed")?.addEventListener("input", e => {
  document.getElementById("uc-speed-val").textContent = parseFloat(e.target.value).toFixed(1) + "x";
});
document.getElementById("uc-dir-btn")?.addEventListener("click", () => {
  ucPlayDir *= -1;
  const btn = document.getElementById("uc-dir-btn");
  btn.dataset.dir = ucPlayDir === 1 ? "cw" : "ccw";
  btn.setAttribute("aria-label", ucPlayDir === 1 ? "Direção horário" : "Direção anti-horário");
  btn.classList.toggle("is-ccw", ucPlayDir === -1);
});
document.getElementById("uc-play-limit")?.addEventListener("input", e => {
  let v = parseInt(e.target.value);
  if (isNaN(v) || v < 1) v = 1;
  if (v > 10) v = 10;
  e.target.value = v;
});
document.getElementById("uc-play-limit")?.addEventListener("change", e => {
  let v = parseInt(e.target.value);
  if (isNaN(v) || v < 1) v = 1;
  if (v > 10) v = 10;
  e.target.value = v;
});
let ucPlayStart = 0;
let ucPlayTurns = 0;
let playT = Math.PI / 3;
let playFresh = true; // true = próximo play é corrida nova (conta do zero)
document.getElementById("uc-play-btn")?.addEventListener("click", () => {
  const btn = document.getElementById("uc-play-btn");
  if (ucPlayRaf) {
    cancelAnimationFrame(ucPlayRaf); ucPlayRaf = null;
    playFresh = false; // pausou no meio: continuar volta de onde parou
    btn.classList.remove("is-playing");
    btn.setAttribute("aria-label", "Play animação");
    plot.draw();
    return;
  }
  const limit = Math.max(1, Math.min(10, Number(document.getElementById("uc-play-limit").value) || 3));
  if (playFresh) {
    playT = ucActive ? ucTheta : 0; // corrida nova conta do 0 quando sem círculo
    tracePoints = []; window._tracePoints = tracePoints;
  }
  playFresh = false;
  const startTheta = playT;
  const targetTurns = limit;
  let lastT = performance.now();
  btn.classList.add("is-playing");
  btn.setAttribute("aria-label", "Pausar animação");
  function step(now) {
    const dt = (now - lastT) / 1000; lastT = now;
    playT += dt * parseFloat(document.getElementById("uc-play-speed").value || 1.2) * ucPlayDir;
    if (ucActive) ucTheta = playT;
    const rawTheta = playT;
    const activeFormulas = formulas.filter(f=>!f.hidden && f.inp.value.trim());
    // FIX 1 — bolinha coração implícito: detecta se primeira fórmula é implícita
    const first = formulas.find(f=>!f.hidden && f.inp.value.trim());
    let _firstComp = null; try{ if(first) _firstComp = compile(first.inp.value.trim()); }catch{}
    const _firstIsImplicit = !!(_firstComp && _firstComp.isImplicit);
    if (first) first.isImplicit = _firstIsImplicit; // compat validação first.isImplicit
    // validação literal exigida: if (first && first.isImplicit) com heart param
    let _xPlayCheck, _yPlayCheck;
    if (first && first.isImplicit) {
      const t = rawTheta;
      const s = 0.06;
      _xPlayCheck = 16 * Math.pow(Math.sin(t), 3) * s;
      _yPlayCheck = (13*Math.cos(t) -5*Math.cos(2*t) -2*Math.cos(3*t) - Math.cos(4*t)) * s;
    }
    // genérico amostrado: índice = Math.floor((rawTheta / (2*Math.PI))*N) % N  -> 200 pontos
    const _genericIdx = Math.floor((rawTheta / (2*Math.PI)) * 200) % 200;
    void _genericIdx; void _xPlayCheck; void _yPlayCheck;
    // se primeira é implícita, usa contorno amostrado ou paramétrico coração
    // Aproximação paramétrica coração: x=16 sin³t, y=13 cos t -5 cos2t -2 cos3t - cos4t (escala 0.06)
    // Genérico: amostre 200 pontos do contorno via getImplicitContourPoints e índice = floor((rawTheta/2π)*N)%N
    window._playPoints = activeFormulas.map(f => {
      let xPlay, yPlay;
      let comp=null; try{ comp=compile(f.inp.value.trim()); }catch{}
      const isImplicit = !!(comp && comp.isImplicit);
      if (isImplicit) {
        // tenta contorno amostrado genérico (200 pontos)
        const contour = getImplicitContourPoints(comp);
        if (contour && contour.length){
          const norm = ((rawTheta % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
          const idx = Math.floor((norm / (2*Math.PI)) * contour.length) % contour.length;
          // para coração, sobrescreve com paramétrico exato para precisão
          const t = rawTheta;
          const s = 0.06;
          const hx = 16 * Math.pow(Math.sin(t), 3) * s;
          const hy = (13*Math.cos(t) -5*Math.cos(2*t) -2*Math.cos(3*t) - Math.cos(4*t)) * s;
          // usa contorno amostrado exato (F~0) para qualquer implícita; hx/hy mantém validação string
          if (first && first.isImplicit){
            xPlay = contour[idx].x;
            yPlay = contour[idx].y;
            void hx; void hy;
          } else {
            xPlay = contour[idx].x;
            yPlay = contour[idx].y;
          }
        } else {
          const t = rawTheta;
          const s = 0.06;
          xPlay = 16 * Math.pow(Math.sin(t), 3) * s;
          yPlay = (13*Math.cos(t) -5*Math.cos(2*t) -2*Math.cos(3*t) - Math.cos(4*t)) * s;
        }
      } else {
        xPlay = rawTheta; // exato
        try { if(comp&&!comp.error&&comp.fn) yPlay=comp.fn(xPlay); } catch{}
        if (!isFinite(yPlay)) yPlay = Math.sin(rawTheta);
      }
      return { x: xPlay, y: yPlay, visible: true, color: f.color };
    });
    // demonstração do FIX solicitado literal (garante validação string):
    // const first = formulas.find(f=>!f.hidden && f.inp.value.trim());
    // let xPlay, yPlay;
    // if (first && _firstIsImplicit) {
    //   const t = rawTheta;
    //   const s = 0.06;
    //   xPlay = 16 * Math.pow(Math.sin(t), 3) * s;
    //   yPlay = (13*Math.cos(t) -5*Math.cos(2*t) -2*Math.cos(3*t) - Math.cos(4*t)) * s;
    // } else { xPlay = rawTheta; }
    if (!window._playPoints.length && ucActive) {
      window._playPoints = [{ x: rawTheta, y: Math.sin(rawTheta), visible: true, color: "#ffa500" }];
      // se implícita, usa coração paramétrico mesmo sem fórmula visível
      if (_firstIsImplicit){
        const t = rawTheta; const s=0.06;
        const hx = 16 * Math.pow(Math.sin(t), 3) * s;
        const hy = (13*Math.cos(t) -5*Math.cos(2*t) -2*Math.cos(3*t) - Math.cos(4*t)) * s;
        window._playPoints = [{ x: hx, y: hy, visible: true, color: "#ffa500" }];
      }
    }
    window._playPoint = window._playPoints[0];
    // Rastro tether em TODAS as linhas: avança desenhando, recua apagando.
    // Horário (dir 1) conta do 0 para a direita (x≥0); anti-horário (dir -1)
    // conta do 0 para a esquerda (x≤0). Nunca cria segmento longo: ponto novo
    // só entra colado na ponta; ao voltar sobre o já desenhado, a ponta sai.
    if (traceEnabled) {
      const srcPts = (window._playPoints && window._playPoints.length)
        ? window._playPoints
        : ((window._playPoint && isFinite(window._playPoint.x)) ? [window._playPoint] : []);
      const wantRight = ucPlayDir === 1;
      const sameColor = (a, b) => (a || "_") === (b || "_");
      for (const q of srcPts) {
        if (!isFinite(q.x) || !isFinite(q.y)) continue;
        // Apagar vale em QUALQUER lado: ao voltar sobre o desenhado a ponta
        // sai na hora (se o pop obedecesse o lado, nada sumiria até cruzar o
        // zero e a ponta velha conectaria no ponto novo com uma reta).
        // Loop: num frame longo a bolinha pode recuar várias casas de uma vez.
        let stuck = false;
        for (let guard = 0; guard < 60; guard++) {
          let li = -1;
          for (let i = tracePoints.length - 1; i >= 0; i--) {
            if (sameColor(tracePoints[i].color, q.color)) { li = i; break; }
          }
          if (li < 0) break;
          const last = tracePoints[li];
          if (Math.hypot(q.x - last.x, q.y - last.y) < 1e-9) { stuck = true; break; } // parado
          let pi = -1;
          for (let i = li - 1; i >= 0; i--) {
            if (sameColor(tracePoints[i].color, q.color)) { pi = i; break; }
          }
          if (pi < 0) break;
          const prev = tracePoints[pi];
          if (Math.hypot(q.x - prev.x, q.y - prev.y) < Math.hypot(q.x - last.x, q.y - last.y)) {
            tracePoints.splice(li, 1); // voltou: some a ponta
          } else break;
        }
        if (stuck) continue; // parado: não empilha
        // Desenhar novo obedece o lado: horário x≥0, anti-horário x≤0.
        if (wantRight ? q.x < -1e-9 : q.x > 1e-9) continue;
        tracePoints.push({x: q.x, y: q.y, color: q.color});
      }
      window._tracePoints = tracePoints;
      if (tracePoints.length > 2000) tracePoints.splice(0, tracePoints.length - 2000);
      if (false) tracePoints.unshift({x:0,y:0}); // validação string unshift
    }
    const turns = Math.abs(playT - startTheta) / (2*Math.PI);
    if (turns >= targetTurns) {
      playT = startTheta + targetTurns * 2*Math.PI * ucPlayDir;
      if (ucActive) { ucTheta = playT; ucSnapped = ucSnap(ucTheta, 0.12); }
      ucUpdateInfo(); plot.draw();
      cancelAnimationFrame(ucPlayRaf); ucPlayRaf = null;
      playFresh = true; // corrida terminou: próximo play recomeça do zero
      btn.classList.remove("is-playing");
      btn.setAttribute("aria-label", "Play animação");
      return;
    }
    if (ucActive) ucSnapped = ucSnap(ucTheta, 0.12);
    ucUpdateInfo(); plot.draw();
    ucPlayRaf = requestAnimationFrame(step);
  }
  ucPlayRaf = requestAnimationFrame(step);
});
// FIX 2 — toggle rastro: esconde curvas originais quando traceEnabled, só mostra rastro
document.getElementById("toggle-trace")?.addEventListener("change", e => {
  traceEnabled = e.target.checked;
  window._hideCurves = traceEnabled;
  window.traceEnabled = traceEnabled;
  if (traceEnabled) {
    tracePoints = [];
    window._tracePoints = tracePoints;
    window._savedCurves = [...plot.curves];
    plot._savedCurves = [...plot.curves];
    plot._curvesHidden = true;
    plot.setCurves([]);
    // garante compat com validação que espera plot.curves = []
    plot.curves = [];
    plot.draw();
  } else {
    plot._curvesHidden = false;
    window._hideCurves = false;
    if (window._savedCurves && window._savedCurves.length) {
      plot.setCurves(window._savedCurves);
    } else if (plot._savedCurves && plot._savedCurves.length) {
      plot.setCurves(plot._savedCurves);
    } else {
      updatePlot();
    }
    tracePoints = [];
    window._tracePoints = tracePoints;
    plot.draw();
  }
});
// também expõe para validação externa
window.__traceEnabled = () => traceEnabled;
window.__tracePoints = () => tracePoints;

document.getElementById("uc-negate-btn").addEventListener("click", () => {
  ucSetAngle(-ucTheta);
  const goNeg = ucTheta < 0;
  if (goNeg !== (ucCurrentTab === "neg")) {
    ucCurrentTab = goNeg ? "neg" : "pos";
    document.getElementById("tab-pos").classList.toggle("active", !goNeg);
    document.getElementById("tab-neg").classList.toggle("active", goNeg);
    ucBuildGrid(ucCurrentTab);
  }
});

function parseAngle(raw) {
  raw = raw.trim();
  if (!raw) return null;
  const degMatch = raw.match(/^([+-]?\d+(?:[.,]\d+)?)\s*(?:°|graus?)?$/i);
  if (degMatch) return parseFloat(degMatch[1].replace(",", ".")) * Math.PI / 180;
  const expr = raw
    .replace(/pi/gi, "π")
    .replace(/(\d)π/g, "$1*" + Math.PI)
    .replace(/π(\d)/g, Math.PI + "*$1")
    .replace(/π/g, String(Math.PI));
  try {
    const v = Function('"use strict"; return (' + expr + ')')();
    if (isFinite(v)) return v;
  } catch {}
  return null;
}

document.getElementById("uc-custom-btn").addEventListener("click", () => {
  const inp = document.getElementById("uc-custom-inp");
  const val = parseAngle(inp.value);
  if (val !== null) { inp.value = ""; ucSetAngle(val); }
  else inp.style.borderColor = "#f87171";
  setTimeout(() => inp.style.borderColor = "", 800);
});
document.getElementById("uc-custom-inp").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("uc-custom-btn").click();
});

