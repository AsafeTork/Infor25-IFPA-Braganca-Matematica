/* core/professor/tools.js — ferramentas de anotação (marcador, área, triângulo, seta, régua, texto) */
import { plot, canvas, overlayMgr } from "./plot.js";
import { compile } from "../mathEngine.js";
import { OverlayType } from "../overlays.js";
import { formatExactValue } from "../plotEngine.js";
import { renderOverlaysOnPlot } from "../overlayRenderers.js";
import { formulas } from "./formulas.js";
import { magnetNotable, ucDragging } from "./unitCircle.js";
/* ──────────── FERRAMENTAS ──────────── */
export let toolColor = "#ffa500";
let toolMode  = null;
let areaOpacity = 0.25;
export let triShowValues = true;
window._playPoints = [];
window._playPoint = { visible: false, x: 0, y: 0 };
let areaStart = null;
let arrowStart = null;
let rulerStart = null;
let trianglePoints = [];
let lastMouseX = null;
let lastMouseY = null;
let currentSnap = null;

document.querySelectorAll(".color-dot").forEach(dot => {
  dot.addEventListener("click", () => {
    document.querySelectorAll(".color-dot").forEach(d => {
      d.classList.remove("active");
      d.setAttribute("aria-checked", "false");
    });
    dot.classList.add("active");
    dot.setAttribute("aria-checked", "true");
    toolColor = dot.dataset.c;
  });
});

const opSlider = document.getElementById("area-opacity");
const opVal    = document.getElementById("area-opacity-val");
opSlider.addEventListener("input", () => {
  areaOpacity = +opSlider.value / 100;
  opVal.textContent = opSlider.value + "%";
});
document.getElementById("tri-show-values")?.addEventListener("change", e => { triShowValues = e.target.checked; plot.draw(); });

function setTool(mode, btn) {
  trianglePoints = [];
  areaStart = null;
  arrowStart = null;
  rulerStart = null;
  lastMouseX = null;
  lastMouseY = null;

  toolMode = toolMode === mode ? null : mode;
  document.querySelectorAll(".tool-btn").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-pressed", "false");
  });
  if (toolMode && btn) {
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
  }
  canvas.style.cursor = toolMode ? "crosshair" : "";
}

document.getElementById("tool-marker").addEventListener("click", e => setTool("marker", e.currentTarget));
document.getElementById("tool-vline").addEventListener("click", e => setTool("vline", e.currentTarget));
document.getElementById("tool-hline").addEventListener("click", e => setTool("hline", e.currentTarget));
document.getElementById("tool-area").addEventListener("click",  e => setTool("area",   e.currentTarget));
document.getElementById("tool-triangle").addEventListener("click", e => setTool("triangle", e.currentTarget));
document.getElementById("tool-text").addEventListener("click", e => setTool("text", e.currentTarget));
document.getElementById("tool-arrow").addEventListener("click", e => setTool("arrow", e.currentTarget));
document.getElementById("tool-ruler").addEventListener("click", e => setTool("ruler", e.currentTarget));
document.getElementById("tool-eraser").addEventListener("click", e => setTool("eraser", e.currentTarget));
document.getElementById("tool-clear").addEventListener("click", () => {
  overlayMgr.clear();
  areaStart = null;
  arrowStart = null;
  rulerStart = null;
  trianglePoints = [];
  lastMouseX = null;
  lastMouseY = null;
  plot.draw();
});

function hitTestOverlay(ov, cx, cy, plot) {
  const type = ov.type;
  // converte tolerância de 18px para unidades de dado — suporta plot.view (Plot) e plot.xmax legado
  const _xmin = plot.view ? plot.view.xmin : plot.xmin;
  const _xmax = plot.view ? plot.view.xmax : plot.xmax;
  const _ymin = plot.view ? plot.view.ymin : plot.ymin;
  const _ymax = plot.view ? plot.view.ymax : plot.ymax;
  const tolX = (_xmax - _xmin) / plot.W * 18;
  const tolY = (_ymax - _ymin) / plot.H * 18;
  const tol = Math.max(tolX, tolY);
  if (type === "marker" || type === "point") {
    const dx = (ov.x ?? 0) - cx;
    const dy = (ov.y ?? 0) - cy;
    return Math.sqrt(dx*dx + dy*dy) / tol;
  }
  if (type === "vline") {
    return Math.abs((ov.x ?? 0) - cx) / tolX;
  }
  if (type === "hline") {
    return Math.abs((ov.y ?? 0) - cy) / tolY;
  }
  if (type === "triangle" && ov.points) {
    let minD = Infinity;
    for (const p of ov.points) {
      const d = Math.sqrt((p.x-cx)**2 + (p.y-cy)**2);
      if (d < minD) minD = d;
    }
    return minD / tol;
  }
  if (type === "area") {
    const x1 = ov.x ?? 0, x2 = ov.x2 ?? ov.x;
    if (cx >= Math.min(x1,x2) && cx <= Math.max(x1,x2)) return 0;
    return Math.min(Math.abs(cx - x1), Math.abs(cx - x2)) / tolX;
  }
  if (type === "arrow" || type === "segment" || type === "ruler") {
    const x1=ov.x1??0, y1=ov.y1??0, x2=ov.x2??0, y2=ov.y2??0;
    const len2 = (x2-x1)**2 + (y2-y1)**2;
    if (len2 < 1e-12) return Math.hypot(cx - x1, cy - y1) / tol;
    let t = ((cx - x1)*(x2-x1) + (cy - y1)*(y2-y1)) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = x1 + t*(x2-x1), py = y1 + t*(y2-y1);
    return Math.hypot(cx - px, cy - py) / tol;
  }
  if (type === "text") {
    const dx = (ov.x ?? 0) - cx;
    const dy = (ov.y ?? 0) - cy;
    return Math.sqrt(dx*dx + dy*dy) / tol;
  }
  return Infinity;
}

function snapToReference(x, y, plot) {
  const _xmin = plot.view ? plot.view.xmin : plot.xmin;
  const _xmax = plot.view ? plot.view.xmax : plot.xmax;
  const _ymin = plot.view ? plot.view.ymin : plot.ymin;
  const _ymax = plot.view ? plot.view.ymax : plot.ymax;
  const SNAP_RX = (_xmax - _xmin) * 0.015;
  const SNAP_RY = (_ymax - _ymin) * 0.015;
  const piFracs = magnetNotable ? [0, Math.PI/6, Math.PI/4, Math.PI/3, Math.PI/2, Math.PI] : [];
  const piSet = new Set();
  for (let k = -12; k <= 12; k++) {
    for (const frac of piFracs) {
      const v = k * Math.PI + frac;
      if (v >= _xmin - 1e-9 && v <= _xmax + 1e-9) piSet.add(Math.round(v*1e10)/1e10);
    }
  }
  // inteiros que não sejam já pi múltiplos
  for (let k = Math.ceil(_xmin); k <= Math.floor(_xmax); k++) {
    const rk = Math.round(k*1e10)/1e10;
    if (!piSet.has(rk)) piSet.add(rk);
  }
  const piValues = [...piSet].sort((a,b)=>a-b);
  const commonY = [-2, -1, -0.5, 0, 0.5, 1, 2].filter(v => v >= _ymin && v <= _ymax);

  let bestX = x, bestXd = Infinity;
  for (const sx of piValues) {
    const d = Math.abs(sx - x);
    if (d < bestXd && d < SNAP_RX) { bestXd = d; bestX = sx; }
  }
  let bestY = y, bestYd = Infinity;
  for (const sy of commonY) {
    const d = Math.abs(sy - y);
    if (d < bestYd && d < SNAP_RY) { bestYd = d; bestY = sy; }
  }
  // Snap à curva: testa y = f(x) para cada fórmula ativa
  let curveSnapped = false;
  for (const f of formulas) {
    if (f.hidden) continue;
    if (!f.inp.value.trim()) continue;
    try {
      const fn = compile(f.inp.value.trim()).fn;
      if (!fn) continue;
      const yCurve = fn(bestX);
      if (!isFinite(yCurve)) continue;
      if (yCurve < _ymin || yCurve > _ymax) continue;
      const dCurve = Math.abs(yCurve - y);
      if (dCurve < SNAP_RY && dCurve < bestYd) {
        bestYd = dCurve;
        bestY = yCurve;
        curveSnapped = true;
      }
    } catch {}
  }
  return { x: bestX, y: bestY, snapped: bestXd < SNAP_RX || bestYd < SNAP_RY || curveSnapped, curveSnapped };
}

canvas.addEventListener("mousemove", e => {
  if (!toolMode) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) / rect.width  * plot.W;
  const my = (e.clientY - rect.top)  / rect.height * plot.H;
  const x  = plot.invX(mx);
  const y  = plot.invY(my);
  lastMouseX = x;
  lastMouseY = y;

  if (toolMode === "eraser") {
    const all = overlayMgr.getAll();
    let bestDist = Infinity;
    for (const ov of all) {
      const ovFlat = { ...ov.props, type: ov.type };
      const d = hitTestOverlay(ovFlat, x, y, plot);
      if (d < bestDist) bestDist = d;
    }
    currentSnap = null;
    plot.cv.style.cursor = bestDist < 2 ? "crosshair" : "default";
  } else {
    const snapped = snapToReference(x, y, plot);
    currentSnap = snapped.snapped ? snapped : null;
    plot.cv.style.cursor = snapped.snapped ? "cell" : "crosshair";
  }
});

canvas.addEventListener("click", e => {
  if (ucDragging) return;
  if (!toolMode) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) / rect.width  * plot.W;
  const my = (e.clientY - rect.top)  / rect.height * plot.H;
  const x  = plot.invX(mx);
  const y  = plot.invY(my);

  if (toolMode === "eraser") {
    const all = overlayMgr.getAll();
    let bestIdx = -1, bestDist = Infinity;
    for (let i = 0; i < all.length; i++) {
      const ov = all[i];
      const ovFlat = { ...ov.props, type: ov.type };
      const dist = hitTestOverlay(ovFlat, x, y, plot);
      if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    }
    if (bestIdx >= 0 && bestDist < 2) { overlayMgr.remove(all[bestIdx].id); plot.draw(); document.getElementById("readout").textContent="Anotação removida"; }
    return;
  }

  if (toolMode === "marker") {
    const snapped = snapToReference(x, y, plot);
    overlayMgr.add(OverlayType.MARKER, "plot-main", { x: snapped.x, y: snapped.y, color: toolColor, radius: 7, label: formatExactValue(snapped.x) });
    plot.draw();
  } else if (toolMode === "vline") {
    const snapped = snapToReference(x, y, plot);
    overlayMgr.add(OverlayType.VLINE, "plot-main", { x: snapped.x, color: toolColor, width: 2 });
    plot.draw();
  } else if (toolMode === "hline") {
    const snapped = snapToReference(x, y, plot);
    overlayMgr.add(OverlayType.HLINE, "plot-main", { y: snapped.y, color: toolColor, width: 2 });
    plot.draw();
  } else if (toolMode === "area") {
    const snapped = snapToReference(x, y, plot);
    const sx = snapped.x;
    if (areaStart === null) {
      areaStart = sx;
      const w = Math.abs(sx - areaStart);
      document.getElementById("readout").textContent = `Área largura Δx=${w.toFixed(2)} — clique para sombrear triângulo também`;
    } else {
      overlayMgr.add(OverlayType.AREA, "plot-main", { color: toolColor, opacity: areaOpacity, x: Math.min(areaStart, sx), x2: Math.max(areaStart, sx) });
      const h = plot.ymax - plot.ymin;
      const areaVal = (Math.abs(sx - areaStart) * h).toFixed(2);
      document.getElementById("readout").textContent = `Área retangular ≈ ${areaVal} (Δx=${Math.abs(sx-areaStart).toFixed(2)} × Δy=${h.toFixed(2)})`;
      // Se houver triângulo visível, mostre sua área no readout
      const tris = overlayMgr.getAll().filter(o=>o.type==="triangle" && !o.props.hidden);
      if (tris.length>0) {
        const pts = tris[tris.length-1].props.points;
        const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
        const la=d(pts[0],pts[1]), lb=d(pts[1],pts[2]), lc=d(pts[2],pts[0]);
        const s=(la+lb+lc)/2;
        const aTri=Math.sqrt(Math.max(0,s*(s-la)*(s-lb)*(s-lc))).toFixed(2);
        document.getElementById("readout").textContent += ` · Triângulo área=${aTri}`;
      }
      areaStart = null;
      setTool(null, null);
      plot.draw();
    }
  } else if (toolMode === "triangle") {
    const snapped = snapToReference(x, y, plot);
    trianglePoints.push({ x: snapped.x, y: snapped.y });
    document.getElementById("readout").textContent = `x = ${snapped.x.toFixed(2)}   y = ${snapped.y.toFixed(2)}`;
    if (trianglePoints.length === 3) {
      overlayMgr.add(OverlayType.TRIANGLE, "plot-main", {
        color: toolColor, opacity: 0.25,
        points: trianglePoints, showValues: triShowValues
      });
      trianglePoints = [];
      setTool(null, null);
      plot.draw();
    } else {
      plot.draw();
      const ctx = plot.ctx;
      ctx.save();
      ctx.fillStyle = toolColor;
      for (const p of trianglePoints) {
        ctx.beginPath();
        ctx.arc(plot.X(p.x), plot.Y(p.y), 5, 0, 2*Math.PI);
        ctx.fill();
      }
      if (trianglePoints.length === 1) {
        ctx.strokeStyle = toolColor + "40";
        ctx.lineWidth = 1;
        ctx.setLineDash([4,4]);
        ctx.beginPath();
        ctx.moveTo(plot.X(trianglePoints[0].x), plot.Y(trianglePoints[0].y));
        ctx.lineTo(plot.X(snapped.x), plot.Y(snapped.y));
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (trianglePoints.length === 2) {
        ctx.strokeStyle = toolColor + "40";
        ctx.lineWidth = 1;
        ctx.setLineDash([4,4]);
        for (const p of trianglePoints) {
          ctx.beginPath();
          ctx.moveTo(plot.X(p.x), plot.Y(p.y));
          ctx.lineTo(plot.X(snapped.x), plot.Y(snapped.y));
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }
      ctx.restore();
    }
  } else if (toolMode === "text") {
    const snapped = snapToReference(x, y, plot);
    const txt = prompt("Texto da anotação:");
    if (txt) {
      overlayMgr.add(OverlayType.TEXT, "plot-main", { x: snapped.x, y: snapped.y, text: txt, color: toolColor, fontSize: 14 });
      plot.draw();
    }
  } else if (toolMode === "arrow") {
    const snapped = snapToReference(x, y, plot);
    if (arrowStart === null) {
      arrowStart = { x: snapped.x, y: snapped.y };
    } else {
      overlayMgr.add(OverlayType.ARROW, "plot-main", {
        x1: arrowStart.x, y1: arrowStart.y, x2: snapped.x, y2: snapped.y,
        color: toolColor, width: 2,
      });
      arrowStart = null;
      setTool(null, null);
      plot.draw();
    }
  } else if (toolMode === "ruler") {
    const snapped = snapToReference(x, y, plot);
    if (rulerStart === null) {
      rulerStart = { x: snapped.x, y: snapped.y };
    } else {
      overlayMgr.add(OverlayType.RULER, "plot-main", { x1: rulerStart.x, y1: rulerStart.y, x2: snapped.x, y2: snapped.y, color: toolColor, width: 2 });
      rulerStart = null;
      setTool(null, null);
      plot.draw();
    }
  }
});
// 30x — evita conflito pan vs ferramentas: quando ferramenta ativa, plot não deve pan
// (Plot verifica e.defaultPrevented no pointerdown; tigerabrodi usa ctrlKey para separar)
canvas.addEventListener("pointerdown", e => {
  if (toolMode && !ucDragging) e.preventDefault();
}, { capture: true });

export function drawOverlays() {
  const ctx = plot.ctx;
  const graphScaleDraw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--graph-scale")) || 1;

  const allOverlays = overlayMgr.getAll();
  for (const ov of allOverlays) {
    if (ov.props.hidden) continue;
    const ovFlat = { ...ov.props, type: ov.type };
    renderOverlaysOnPlot(ctx, plot, [ovFlat], formatExactValue);
  }

  if (areaStart !== null) {
    const px = plot.X(areaStart);
    ctx.strokeStyle = toolColor + "bb"; ctx.lineWidth = 2; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, plot.H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = toolColor; ctx.font = `${10 * graphScaleDraw}px monospace`;
    ctx.textAlign = "center"; ctx.fillText("→ clique p/ fechar área", px, 14);

    if (lastMouseX !== null) {
      const px2 = plot.X(lastMouseX);
      const left = Math.min(px, px2);
      const right = Math.max(px, px2);
      ctx.fillStyle = toolColor + "15";
      ctx.fillRect(left, 0, right - left, plot.H);
      ctx.strokeStyle = toolColor + "40";
      ctx.lineWidth = 1;
      ctx.setLineDash([2,2]);
      ctx.strokeRect(left, 0, right - left, plot.H);
      ctx.setLineDash([]);
      const w = Math.abs(lastMouseX - areaStart).toFixed(2);
      ctx.fillStyle = toolColor;
      ctx.font = `${11 * graphScaleDraw}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`Δx=${w}`, (px + plot.X(lastMouseX))/2, 28);
    }
  }

  if (arrowStart !== null) {
    const px = plot.X(arrowStart.x);
    const py = plot.Y(arrowStart.y);
    ctx.fillStyle = toolColor;
    ctx.beginPath(); ctx.arc(px, py, 5, 0, 2*Math.PI); ctx.fill();

    if (lastMouseX !== null && lastMouseY !== null) {
      const px2 = plot.X(lastMouseX);
      const py2 = plot.Y(lastMouseY);
      ctx.strokeStyle = toolColor + "60";
      ctx.lineWidth = 2;
      ctx.setLineDash([4,4]);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px2, py2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  if (rulerStart !== null) {
    const px = plot.X(rulerStart.x); const py = plot.Y(rulerStart.y);
    ctx.fillStyle = toolColor; ctx.beginPath(); ctx.arc(px, py, 5, 0, 2*Math.PI); ctx.fill();
    if (lastMouseX !== null) {
      const px2 = plot.X(lastMouseX), py2 = plot.Y(lastMouseY);
      ctx.strokeStyle = toolColor + "60"; ctx.lineWidth = 2; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px2,py2); ctx.stroke(); ctx.setLineDash([]);
      const dx = lastMouseX - rulerStart.x, dy = lastMouseY - rulerStart.y;
      const d = Math.hypot(dx,dy).toFixed(2);
      ctx.fillStyle = toolColor; ctx.font=`${11 * graphScaleDraw}px monospace`; ctx.textAlign="center";
      ctx.fillText(`d=${d}`, (px+px2)/2, (py+py2)/2 -8);
    }
  }

  if (currentSnap && toolMode && toolMode !== "eraser") {
    ctx.strokeStyle = toolColor + "60";
    ctx.lineWidth = 1;
    ctx.setLineDash([3,3]);
    const sx = plot.X(currentSnap.x);
    const sy = plot.Y(currentSnap.y);
    ctx.beginPath();
    ctx.moveTo(sx, 0); ctx.lineTo(sx, plot.H);
    ctx.moveTo(0, sy); ctx.lineTo(plot.W, sy);
    ctx.stroke();
    ctx.setLineDash([]);
    if (currentSnap.curveSnapped) {
      const py = plot.Y(currentSnap.y);
      ctx.fillStyle = toolColor;
      ctx.beginPath(); ctx.arc(sx, py, 4, 0, 2*Math.PI); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
    }
  }
}

