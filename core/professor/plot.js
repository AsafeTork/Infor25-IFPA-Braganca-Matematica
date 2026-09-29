import { Plot, formatExactValue } from "../plotEngine.js";
import { OverlayManager } from "../overlays.js";

/* ──────────── PLOT ──────────── */
export const canvas = document.getElementById("plot-canvas");
// FIX 30x — fallback para canvas hidden no load (getBoundingClientRect 0 → 800x600)
// Garante grid/eixos mesmo sem fórmulas e isometria dpr correta em 375/768/1440
function _getInitSize(){
  const r = canvas.getBoundingClientRect();
  const w = r.width || canvas.clientWidth || canvas.parentElement?.clientWidth || 800;
  const h = r.height || canvas.clientHeight || canvas.parentElement?.clientHeight || 600;
  return { w: w && w>10 ? w : 800, h: h && h>10 ? h : 600 };
}
const _sz = _getInitSize();
const _xR = 12, _yR = _xR * _sz.h / _sz.w;
export const plot   = new Plot(canvas, { xmin:-_xR/2, xmax:_xR/2, ymin:-_yR/2, ymax:_yR/2 });
// FIX 30x — garante que gráfico aparece em todas as situações (hidden, resize, theme)
requestAnimationFrame(() => { try { plot.resize(); plot.draw(); } catch(e){ console.warn(e); } });
window.addEventListener("load", () => { try { plot.resize(); plot.draw(); } catch(e){} });
// se DOM ainda não completo, recalcula após DOMContentLoaded (isometria + dpr)
if (document.readyState !== "complete") {
  document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(() => { try { plot.resize(); plot.draw(); } catch(e){} }));
}

plot.onProbe = (x, y) => {
  document.getElementById("readout").textContent =
    `x = ${formatExactValue(x)}   y = ${formatExactValue(y)}`;
};

/* ──────────── OVERLAY MANAGER ──────────── */
export const overlayMgr = new OverlayManager();
overlayMgr.registerTarget("plot-main", "plot", plot);
// Exposição para testes Playwright (não afeta produção)
window.__plot = plot;
window.__overlayMgr = overlayMgr;
