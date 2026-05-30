/* ============================================================
   components/formulaLab.js
   Laboratório de fórmulas — modelo pedagógico:
   • mostra a FÓRMULA-BASE e explica cada variável (papel, limites,
     efeito no gráfico) — ACIMA da caixa;
   • UMA única caixa de fórmula (o aluno escreve a fórmula inteira,
     sem caixinhas por parâmetro — ele precisa aprender a fórmula);
   • teclado de símbolos (π, expoentes, √…);
   • plano cartesiano que reage em tempo real;
   • DESAFIOS: um comando descreve o EFEITO desejado (sem dizer qual
     parâmetro mexer); embaixo o aluno verifica se acertou.
   ============================================================ */
import { compile } from "../core/mathEngine.js";
import { Plot } from "../core/plotEngine.js";
import { tex, toLatex } from "./katex.js";

let LAB_ID = 0;

/**
 * @param {HTMLElement} root
 * @param {Object} cfg
 *   cfg.base     — fórmula-base em LaTeX (forma geral)
 *   cfg.vars     — [{ sym, papel, limites, efeito }] explicação das variáveis
 *   cfg.start    — fórmula inicial concreta (ex: "y = 2^x")
 *   cfg.piAxis   — eixo x em múltiplos de π
 *   cfg.view     — janela inicial {xmin,xmax,ymin,ymax}
 *   cfg.examples — [string] pontos de partida prontos
 *   cfg.desafios — [{ ordem, checa:(f, base)=>bool, dica }]
 *   cfg.compact  — layout reduzido
 */
export function mountLab(root, cfg = {}) {
  const id = ++LAB_ID;
  const vars = cfg.vars || [];
  const desafios = cfg.desafios || [];
  root.classList.add("lab");

  root.innerHTML = `
    ${cfg.base ? `
    <div class="lab-base">
      <span class="section-eyebrow">Fórmula-base</span>
      <div class="lab-base-tex" id="base-${id}"></div>
      ${vars.length ? `<div class="varlist">${vars.map(v => `
        <div class="varrow">
          <span class="vsym mono">${v.sym}</span>
          <div class="vbody">
            <b>${v.papel || ""}</b>
            ${v.limites ? `<span class="vlim">limites: ${v.limites}</span>` : ""}
            ${v.efeito ? `<span class="veff">no gráfico: ${v.efeito}</span>` : ""}
          </div>
        </div>`).join("")}</div>` : ""}
    </div>` : ""}

    <div class="lab-grid${cfg.compact ? " compact" : ""}">
      <div class="lab-left">
        <label class="lab-label" for="inp-${id}">Escreva a fórmula inteira</label>
        <div class="lab-inputwrap">
          <span class="lab-prompt">f(x)=</span>
          <input id="inp-${id}" class="lab-input mono" spellcheck="false"
                 value="${cfg.start || "y = 2^x"}" autocomplete="off" autocapitalize="off">
        </div>
        <div class="lab-render" id="ren-${id}"></div>
        <div class="lab-err" id="err-${id}"></div>

        ${cfg.examples ? `<div class="lab-examples">
          <span class="lab-mini">Ponto de partida:</span>
          ${cfg.examples.map(e => `<button class="chip" data-ex="${e}">${e}</button>`).join("")}
        </div>` : ""}

        <div class="lab-hint mono">arraste p/ mover · scroll p/ zoom · use o teclado de símbolos acima</div>
      </div>

      <div class="lab-right">
        <canvas id="cv-${id}" class="lab-canvas"></canvas>
        <div class="lab-readout mono" id="rd-${id}">—</div>
      </div>
    </div>

    ${desafios.length ? `
    <div class="lab-challenge card" id="ch-${id}">
      <div class="ch-head">
        <span class="section-eyebrow">Desafio <span id="chn-${id}">1</span>/${desafios.length}</span>
      </div>
      <p class="ch-order" id="cho-${id}"></p>
      <div class="ch-actions">
        <button class="btn primary sm" id="chk-${id}">Verificar</button>
        <button class="btn ghost sm" id="hint-${id}">Dica</button>
        <button class="btn ghost sm" id="next-${id}" hidden>Próximo desafio →</button>
      </div>
      <div class="ch-feedback" id="chf-${id}"></div>
      <div class="ch-hint" id="chh-${id}" hidden></div>
    </div>` : ""}

    <div class="lab-analysis card" id="an-${id}">
      <div class="section-eyebrow">Leitura matemática</div>
      <div class="lab-analysis-grid" id="ag-${id}"></div>
      <details class="lab-table"><summary>Tabela de valores — interprete o padrão</summary>
        <div id="tb-${id}"></div></details>
    </div>
  `;

  if (cfg.base) tex(document.getElementById(`base-${id}`), cfg.base, true);

  const input   = root.querySelector(`#inp-${id}`);
  const render  = root.querySelector(`#ren-${id}`);
  const errEl   = root.querySelector(`#err-${id}`);
  const canvas  = root.querySelector(`#cv-${id}`);
  const readout = root.querySelector(`#rd-${id}`);
  const agrid   = root.querySelector(`#ag-${id}`);
  const tbody   = root.querySelector(`#tb-${id}`);


  const plot = new Plot(canvas, { piAxis: cfg.piAxis, ...(cfg.view || {}) });

  // função de referência (fórmula inicial) p/ desafios relativos
  const baseC = compile(cfg.start || "y = 2^x");
  const base0 = baseC.error ? () => NaN : (x) => baseC.fn(x);

  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
  function fmt(v) {
    if (!Number.isFinite(v)) return "∄";
    if (Math.abs(v) >= 1e5 || (Math.abs(v) < 1e-3 && v !== 0)) return v.toExponential(2);
    return (Math.round(v * 1000) / 1000).toString();
  }

  function analyze(f) {
    const make = (label, val) => `<div class="agi"><span>${label}</span><b>${val}</b></div>`;
    let html = "";
    let allReal = true;
    for (const x of [-3.5, -1.7, 0, 0.5, 2.3, 4.1]) if (!Number.isFinite(f(x))) allReal = false;
    html += make("Domínio", allReal ? "ℝ (todos os reais)" : "subconjunto de ℝ");

    const y0 = f(0);
    if (Number.isFinite(y0)) {
      html += make("Intercepto com Oy", `(0, ${fmt(y0)})`);
      plot.setMarkers([{ x: 0, y: y0, label: `(0, ${fmt(y0)})` }]);
    } else plot.setMarkers([]);

    const a = f(-2), b = f(2);
    let mono = "varia";
    if (Number.isFinite(a) && Number.isFinite(b)) {
      if (b > a + 1e-9) mono = "crescente ↗";
      else if (b < a - 1e-9) mono = "decrescente ↘";
      else mono = "constante →";
    }
    html += make("Comportamento", mono);

    let positive = true;
    for (let x = -6; x <= 6; x += 0.5) { const v = f(x); if (Number.isFinite(v) && v <= 0) positive = false; }
    if (positive) { html += make("Imagem", "ℝ₊*  (sempre y > 0)"); plot.setAsymptotes([{ y: 0 }]); }
    else { html += make("Imagem", "depende do gráfico"); plot.setAsymptotes([]); }

    agrid.innerHTML = html;

    let t = `<table class="vtab mono"><thead><tr><th>x</th>`;
    const xs = [-2, -1, 0, 1, 2, 3];
    t += xs.map(x => `<th>${x}</th>`).join("") + "</tr></thead><tbody><tr><th>f(x)</th>";
    t += xs.map(x => `<td>${fmt(f(x))}</td>`).join("") + "</tr></tbody></table>";
    tbody.innerHTML = t;
  }

  let lastF = null;
  function update() {
    const c = compile(input.value);
    if (c.error) {
      errEl.textContent = "⚠ " + c.error;
      errEl.style.display = "block";
      lastF = null;
      return;
    }
    errEl.style.display = "none";
    tex(render, toLatex(input.value), true);
    const f = (x) => c.fn(x);
    lastF = f;
    plot.setCurves([{ fn: f, color: css("--accent") }]);
    analyze(f);
  }

  input.addEventListener("input", update);
  root.querySelectorAll("[data-ex]").forEach(b =>
    b.addEventListener("click", () => { input.value = b.dataset.ex; update(); }));

  plot.onProbe = (x, y) => { readout.textContent = `x = ${fmt(x)}   y = ${fmt(y)}`; };
  window.addEventListener("themechange", () => { plot.draw(); update(); });

  /* ---------------- Desafios ---------------- */
  if (desafios.length) {
    let di = 0;
    const chn  = root.querySelector(`#chn-${id}`);
    const cho  = root.querySelector(`#cho-${id}`);
    const chf  = root.querySelector(`#chf-${id}`);
    const chh  = root.querySelector(`#chh-${id}`);
    const btnK = root.querySelector(`#chk-${id}`);
    const btnH = root.querySelector(`#hint-${id}`);
    const btnN = root.querySelector(`#next-${id}`);

    function showChallenge() {
      chn.textContent = di + 1;
      cho.textContent = desafios[di].ordem;
      chf.textContent = ""; chf.className = "ch-feedback";
      chh.hidden = true; chh.textContent = desafios[di].dica || "";
      btnN.hidden = true;
    }
    btnK.addEventListener("click", () => {
      if (!lastF) { chf.className = "ch-feedback wrong"; chf.textContent = "Escreva uma fórmula válida primeiro."; return; }
      let ok = false;
      try { ok = !!desafios[di].checa(lastF, base0); } catch { ok = false; }
      if (ok) {
        chf.className = "ch-feedback ok";
        chf.textContent = "✓ Acertou! Você fez o gráfico se comportar como pedido.";
        if (di < desafios.length - 1) btnN.hidden = false;
        else chf.textContent = "✓ Acertou — e era o último desafio. Mandou bem!";
      } else {
        chf.className = "ch-feedback wrong";
        chf.textContent = "✗ Ainda não. Observe o gráfico e ajuste a fórmula. (toque em Dica se precisar)";
      }
    });
    btnH.addEventListener("click", () => { chh.hidden = !chh.hidden; });
    btnN.addEventListener("click", () => { if (di < desafios.length - 1) { di++; showChallenge(); } });
    showChallenge();
  }

  update();
  return { plot, update, input };
}
