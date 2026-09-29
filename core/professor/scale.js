import { plot } from "./plot.js";
import { animateView } from "./formulas.js";

// 30x — UI scale (sidebar) vs graph zoom (view isométrico) totalmente isolados
// Fontes: Display Scale Strategy (zudo-css) calc(*var(--scale)) + Grafana + MDN Pinch
// - --info-scale (0.8–1.8) = sidebar tipografia+padding/gap/radius via calc(...*var(--info-scale)),
//   max-height sempre em dvh (70dvh mobile, 100dvh-52px desktop) + overflow-y:auto +
//   scrollbar-gutter:stable + overscroll-behavior:contain. Nunca toca canvas.
// - --graph-scale (0.8–1.8) = canvas tipografia (labels) via getPropertyValue,
//   lido em Plot.draw() para font-size calc(18px*graphScale). Nunca transform:scale.
// - view (xmin/xmax/ymin/ymax) = zoom geométrico isométrico. Alterado via zoomAt/panBy/
//   animateView/pinch/wheel/resize. Sempre _enforceIsometric() + _clampViewRange().
//   Wheel/pinch/drag manipulam view direto, NÃO alteram --graph-scale/--info-scale.
// - Botões UI (+/- ao lado Aluno) só mudam --info-scale; botões gráfico (+/- no canvas)
//   mudam --graph-scale E animam view focal no centro com fator prev/next isométrico.
//   Assim não há conflito: sidebar escala sem sair da tela (scroll interno), gráfico
//   mantém proporção H/W e foco, ambos 80%–180% sem cortar.
let uiScale = 1;
let graphScale = 1;
function updateUiScale(delta){
  uiScale = Math.min(1.8, Math.max(0.8, uiScale + delta));
  uiScale = Math.round(uiScale*10)/10;
  document.documentElement.style.setProperty("--info-scale", uiScale);
  document.getElementById("font-val-ui").textContent = Math.round(uiScale*100)+"%";
  // Nenhum efeito no canvas/view — isolado (não chama plot.draw)
}
function updateGraphScale(delta){
  const prev = graphScale;
  graphScale = Math.min(1.8, Math.max(0.8, graphScale + delta));
  graphScale = Math.round(graphScale*10)/10;
  document.documentElement.style.setProperty("--graph-scale", graphScale);
  document.getElementById("font-val-graph").textContent = Math.round(graphScale*100)+"%";
  // zoom isométrico suave no centro do canvas (separa fonte de view, sem quebrar layout)
  // factor = prev / next : >1 quando diminui (zoom out), <1 quando aumenta (zoom in)
  if (typeof plot !== "undefined" && plot.W && plot.H) {
    const factor = prev / graphScale;
    const cx = (plot.view.xmin + plot.view.xmax) / 2;
    const cy = (plot.view.ymin + plot.view.ymax) / 2;
    const vw = plot.view.xmax - plot.view.xmin;
    const targetW = vw * factor;
    const targetH = targetW * plot.H / plot.W; // isométrico: mantém H/W
    const target = {
      xmin: cx - targetW/2, xmax: cx + targetW/2,
      ymin: cy - targetH/2, ymax: cy + targetH/2
    };
    if (typeof plot.animateView === "function") plot.animateView(target, 260);
    else if (typeof animateView === "function") animateView(target, 260);
    else plot.draw();
  } else if (typeof plot !== "undefined") {
    plot.draw();
  }
}
// Modo Aula: aplica/restaura escalas sem animar view (só tipografia)
export function getScales() { return { ui: uiScale, graph: graphScale }; }
export function setScales(ui, graph) {
  uiScale = Math.min(1.8, Math.max(0.8, Math.round(ui * 10) / 10));
  graphScale = Math.min(1.8, Math.max(0.8, Math.round(graph * 10) / 10));
  document.documentElement.style.setProperty("--info-scale", uiScale);
  document.documentElement.style.setProperty("--graph-scale", graphScale);
  const lUi = document.getElementById("font-val-ui");
  const lGr = document.getElementById("font-val-graph");
  if (lUi) lUi.textContent = Math.round(uiScale * 100) + "%";
  if (lGr) lGr.textContent = Math.round(graphScale * 100) + "%";
}

document.getElementById("font-dec-ui")?.addEventListener("click", () => updateUiScale(-0.1));
document.getElementById("font-inc-ui")?.addEventListener("click", () => updateUiScale(0.1));
document.getElementById("font-dec-graph")?.addEventListener("click", () => updateGraphScale(-0.1));
document.getElementById("font-inc-graph")?.addEventListener("click", () => updateGraphScale(0.1));
