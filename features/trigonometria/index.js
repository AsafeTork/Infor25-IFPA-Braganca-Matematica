/* features/trigonometria/index.js — Cap 5: Trigonometria */
import { autoRender } from "../../components/katex.js";
import { section, def, think, explore, solved, apply, labSlot, quizSlot } from "../../utils/content.js";
import { mountLab } from "../../components/formulaLab.js";
import { mountQuizSet } from "../../components/quiz.js";

export const trigonometriaMeta = { num: "05", title: "Trigonometria", chapter: "Capítulo 5" };

export const trigonometriaLessons = [
  /* ──────────── Arcos e ângulos ──────────── */
  {
    id: "trig-arcos",
    title: "Arcos e ângulos",
    render(c) {
      c.innerHTML = section("Cap 5 · §1", "Arcos e ângulos",
          def("Radiano", `Um radiano é o ângulo central que subtende um arco de comprimento igual ao raio.
            $$2\\pi\\text{ rad} = 360° \\qquad \\pi\\text{ rad} = 180°$$`) +
          `<div class="lesson-section">
            <h2 class="lesson-h2">Conversão</h2>
            <p>Graus → Radianos: $$\\theta_{\\text{rad}} = \\theta_{\\text{graus}}\\cdot\\dfrac{\\pi}{180}$$</p>
            <p>Radianos → Graus: $$\\theta_{\\text{graus}} = \\theta_{\\text{rad}}\\cdot\\dfrac{180}{\\pi}$$</p>
            <table class="vtab mono" style="margin:.75rem 0">
              <thead><tr><th>Graus</th><th>30°</th><th>45°</th><th>60°</th><th>90°</th><th>180°</th><th>270°</th><th>360°</th></tr></thead>
              <tbody><tr><th>Rad</th>
                <td>π/6</td><td>π/4</td><td>π/3</td><td>π/2</td><td>π</td><td>3π/2</td><td>2π</td>
              </tr></tbody>
            </table>
          </div>`) +
          think("Por que radianos são mais naturais que graus em Análise? Pense em $\\lim_{\\theta\\to0}\\dfrac{\\sin\\theta}{\\theta}$.") +
          solved("Converter 150° e 5π/4",
            `$150°=150\\cdot\\dfrac{\\pi}{180}=\\dfrac{5\\pi}{6}\\text{ rad}$<br>
             $\\dfrac{5\\pi}{4}=\\dfrac{5\\pi}{4}\\cdot\\dfrac{180}{\\pi}=225°$`) +
          quizSlot("quiz-arcos");

      autoRender(c);
      mountQuizSet(c.querySelector("#quiz-arcos"), [
        { q: "$\\dfrac{3\\pi}{4}$ rad em graus?",
          opts:["$135°$","$120°$","$150°$","$90°$","$225°$"], ans:0,
          expl:"$\\frac{3\\pi}{4}\\cdot\\frac{180}{\\pi}=135°$" },
        { q: "$210°$ em radianos?",
          opts:["$\\dfrac{7\\pi}{6}$","$\\dfrac{5\\pi}{6}$","$\\dfrac{4\\pi}{3}$","$\\dfrac{3\\pi}{4}$","$\\dfrac{7\\pi}{4}$"], ans:0,
          expl:"$210\\cdot\\frac{\\pi}{180}=\\frac{7\\pi}{6}$" },
        { q: "(ENEM) Um arco de 270° corresponde, em radianos, a:",
          opts:["$\\dfrac{3\\pi}{2}$","$\\pi$","$2\\pi$","$\\dfrac{5\\pi}{4}$","$\\dfrac{7\\pi}{4}$"], ans:0,
          expl:"$270\\cdot\\frac{\\pi}{180}=\\frac{3\\pi}{2}$" },
      ]);
    }
  },

  /* ──────────── Círculo trigonométrico ──────────── */
  {
    id: "trig-circulo",
    title: "Círculo trigonométrico",
    render(c) {
      c.innerHTML = section("Cap 5 · §2", "Círculo trigonométrico",
          def("Definição", `Círculo de raio 1 centrado na origem. Ponto $P(\\theta)=(\\cos\\theta,\\sin\\theta)$.
            $$\\cos^2\\theta+\\sin^2\\theta=1 \\quad(\\text{relação fundamental})$$`) +
          `<div class="lesson-section">
            <h2 class="lesson-h2">Sinais por quadrante</h2>
            <table class="vtab mono" style="margin:.75rem 0">
              <thead><tr><th>Quadrante</th><th>ângulo</th><th>sin</th><th>cos</th><th>tan</th></tr></thead>
              <tbody>
                <tr><td>I</td><td>(0, π/2)</td><td>+</td><td>+</td><td>+</td></tr>
                <tr><td>II</td><td>(π/2, π)</td><td>+</td><td>−</td><td>−</td></tr>
                <tr><td>III</td><td>(π, 3π/2)</td><td>−</td><td>−</td><td>+</td></tr>
                <tr><td>IV</td><td>(3π/2, 2π)</td><td>−</td><td>+</td><td>−</td></tr>
              </tbody>
            </table>
          </div>`) +
          `<div class="lesson-section">
            <h2 class="lesson-h2">Visualização — círculo unitário interativo</h2>
            <div id="circ-canvas" style="width:100%;max-width:380px;height:340px;margin:.5rem 0;"></div>
            <p style="font-size:.85rem;color:var(--text-soft)">Arraste o ponto para ver sin/cos em tempo real.</p>
          </div>` +
          think("Por que $\\cos^2\\theta+\\sin^2\\theta=1$ sempre vale? Visualize com Pitágoras no triângulo inscrito.") +
          quizSlot("quiz-circ");

      // Interactive unit circle
      const wrap = c.querySelector("#circ-canvas");
      const cv = document.createElement("canvas");
      cv.style.cssText = "width:100%;height:100%;display:block;cursor:crosshair;";
      wrap.appendChild(cv);

      function drawCircle(theta) {
        const W = cv.offsetWidth, H = cv.offsetHeight;
        const dpr = window.devicePixelRatio || 1;
        cv.width = W * dpr; cv.height = H * dpr;
        const ctx = cv.getContext("2d");
        ctx.scale(dpr, dpr);
        const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.4;
        const isDark = document.documentElement.getAttribute("data-theme") !== "light";
        const fg = isDark ? "#f0ebe3" : "#1a1a2e";
        const acc = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#ff6a1a";
        const acc2 = getComputedStyle(document.documentElement).getPropertyValue("--accent-2").trim() || "#ffd23f";

        ctx.clearRect(0, 0, W, H);
        // axes
        ctx.strokeStyle = fg + "44"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx - r*1.2, cy); ctx.lineTo(cx + r*1.2, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - r*1.2); ctx.lineTo(cx, cy + r*1.2); ctx.stroke();
        // circle
        ctx.strokeStyle = fg + "66"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2*Math.PI); ctx.stroke();
        // cos/sin projections
        const px = cx + r*Math.cos(theta), py = cy - r*Math.sin(theta);
        ctx.strokeStyle = acc2 + "cc"; ctx.lineWidth = 2; ctx.setLineDash([4,3]);
        ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke(); // sin
        ctx.strokeStyle = acc + "cc";
        ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke(); // cos
        ctx.setLineDash([]);
        // radius
        ctx.strokeStyle = fg; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
        // point
        ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(px, py, 6, 0, 2*Math.PI); ctx.fill();
        // labels
        ctx.fillStyle = fg; ctx.font = `bold ${Math.round(r*0.13)}px monospace`;
        const cosV = Math.cos(theta).toFixed(3), sinV = Math.sin(theta).toFixed(3);
        const deg = ((theta * 180 / Math.PI) % 360 + 360) % 360;
        ctx.fillStyle = acc; ctx.fillText(`cos = ${cosV}`, 8, H - 28);
        ctx.fillStyle = acc2; ctx.fillText(`sin = ${sinV}`, 8, H - 12);
        ctx.fillStyle = fg; ctx.fillText(`θ = ${deg.toFixed(1)}° = ${(theta).toFixed(3)} rad`, cx-30, 18);
      }

      let theta = Math.PI / 4;
      let dragging = false;
      drawCircle(theta);
      window.addEventListener("themechange", () => drawCircle(theta));

      function pointerToTheta(e, el) {
        const rect = el.getBoundingClientRect();
        const pt = e.touches ? e.touches[0] : e;
        const x = (pt.clientX - rect.left) - el.offsetWidth/2;
        const y = -((pt.clientY - rect.top) - el.offsetHeight/2);
        return Math.atan2(y, x);
      }
      cv.addEventListener("mousedown",  e => { dragging = true; theta = pointerToTheta(e, cv); drawCircle(theta); });
      cv.addEventListener("mousemove",  e => { if (!dragging) return; theta = pointerToTheta(e, cv); drawCircle(theta); });
      cv.addEventListener("mouseup",    () => dragging = false);
      cv.addEventListener("touchstart", e => { e.preventDefault(); theta = pointerToTheta(e, cv); drawCircle(theta); }, { passive: false });
      cv.addEventListener("touchmove",  e => { e.preventDefault(); theta = pointerToTheta(e, cv); drawCircle(theta); }, { passive: false });

      autoRender(c);
      mountQuizSet(c.querySelector("#quiz-circ"), [
        { q: "$\\sin(\\pi/6)$?",
          opts:["$1/2$","$\\sqrt{3}/2$","$\\sqrt{2}/2$","$1$","$0$"], ans:0,
          expl:"Valor notável: $\\sin(30°)=\\sin(\\pi/6)=1/2$" },
        { q: "Se $\\cos\\theta < 0$ e $\\sin\\theta > 0$, $\\theta$ está no:",
          opts:["2.º quadrante","1.º quadrante","3.º quadrante","4.º quadrante","eixo y"], ans:0,
          expl:"cos− e sin+ → II quadrante (90° a 180°)." },
        { q: "$\\cos^2(\\pi/3)+\\sin^2(\\pi/3) = $?",
          opts:["$1$","$1/2$","$3/4$","$\\sqrt{3}$","$2$"], ans:0,
          expl:"Relação fundamental: sempre 1." },
      ]);
    }
  },

  /* ──────────── Valores notáveis ──────────── */
  {
    id: "trig-notaveis",
    title: "Valores notáveis",
    render(c) {
      c.innerHTML = section("Cap 5 · §3", "Valores notáveis") +
        `<div class="lesson-section">
          <table class="vtab mono" style="font-size:.95rem">
            <thead><tr><th>θ</th><th>0</th><th>π/6</th><th>π/4</th><th>π/3</th><th>π/2</th><th>π</th><th>3π/2</th><th>2π</th></tr></thead>
            <tbody>
              <tr><th>sin</th><td>0</td><td>1/2</td><td>√2/2</td><td>√3/2</td><td>1</td><td>0</td><td>−1</td><td>0</td></tr>
              <tr><th>cos</th><td>1</td><td>√3/2</td><td>√2/2</td><td>1/2</td><td>0</td><td>−1</td><td>0</td><td>1</td></tr>
              <tr><th>tan</th><td>0</td><td>√3/3</td><td>1</td><td>√3</td><td>∄</td><td>0</td><td>∄</td><td>0</td></tr>
            </tbody>
          </table>
          <p style="margin-top:.75rem">Macete: sin cresce de 0 a 1 em [0, π/2] com os radicais
          $\\sqrt{0}/2,\\;\\sqrt{1}/2,\\;\\sqrt{2}/2,\\;\\sqrt{3}/2,\\;\\sqrt{4}/2$.</p>
        </div>` +
        think("Derive $\\tan(\\pi/3)=\\sqrt{3}$ a partir de $\\sin$ e $\\cos$. Justifique cada passo.") +
        quizSlot("quiz-not");

      autoRender(c);
      mountQuizSet(c.querySelector("#quiz-not"), [
        { q: "$\\tan(\\pi/4)$?",
          opts:["$1$","$\\sqrt{3}$","$\\sqrt{2}/2$","$1/2$","$\\sqrt{3}/3$"], ans:0,
          expl:"$\\sin(\\pi/4)=\\cos(\\pi/4)=\\sqrt{2}/2\\Rightarrow\\tan=1$" },
        { q: "$\\sin(\\pi/3)$?",
          opts:["$\\sqrt{3}/2$","$1/2$","$\\sqrt{2}/2$","$\\sqrt{3}$","$1$"], ans:0,
          expl:"Valor notável: $\\sqrt{3}/2\\approx0{,}866$" },
        { q: "$\\cos(2\\pi/3)$?",
          opts:["$-1/2$","$1/2$","$-\\sqrt{3}/2$","$\\sqrt{2}/2$","$0$"], ans:0,
          expl:"$2\\pi/3=\\pi-\\pi/3$. No 2.º quad, cos−: $-\\cos(\\pi/3)=-1/2$" },
      ]);
    }
  },

  /* ──────────── Função seno ──────────── */
  {
    id: "trig-seno",
    title: "Função seno",
    render(c) {
      c.innerHTML = section("Cap 5 · §4", "Função seno",
          def("Forma geral", `$$f(x) = A\\sin(Bx + C) + D$$`)) +
        `<div class="lesson-section">` +
        labSlot("lab-seno") + `</div>` +
        think("Se $B=2$, o período diminui ou aumenta em relação a $B=1$? Por quê $T=2\\pi/B$?") +
        quizSlot("quiz-seno");

      autoRender(c);

      mountLab(c.querySelector("#lab-seno"), {
        base: "f(x) = A\\sin(Bx+C)+D",
        vars: [
          { sym: "A", papel: "amplitude", limites: "A > 0",
            efeito: "escala vertical — máx = D+A, mín = D−A" },
          { sym: "B", papel: "frequência angular", limites: "B > 0",
            efeito: "período T = 2π/B · B>1 comprime · B<1 estica" },
          { sym: "C", papel: "fase inicial", limites: "∈ ℝ",
            efeito: "desloca horizontalmente o gráfico (C/B para a esquerda)" },
          { sym: "D", papel: "deslocamento vertical", limites: "∈ ℝ",
            efeito: "translada o eixo de equilíbrio da oscilação" },
        ],
        piAxis: true,
        start: "y = sin(x)",
        view: { xmin: -2*Math.PI, xmax: 2*Math.PI, ymin: -2.5, ymax: 2.5 },
        examples: ["y = sin(x)", "y = 2·sin(x)", "y = sin(2·x)", "y = sin(x + π/2)", "y = sin(x) + 1"],
        desafios: [
          { ordem: "Faça o gráfico ter amplitude 2 (máximo = 2, mínimo = −2).",
            checa: f => { let mx=-Infinity, mn=Infinity; for(let x=-Math.PI*2;x<=Math.PI*2;x+=0.1){const v=f(x);if(isFinite(v)){mx=Math.max(mx,v);mn=Math.min(mn,v);}} return Math.abs(mx-2)<0.2&&Math.abs(mn+2)<0.2; },
            dica: "Multiplique por 2: y = 2·sin(x)" },
          { ordem: "Reduza o período à metade (T = π em vez de 2π).",
            checa: f => Math.abs(f(Math.PI/2) - f(-Math.PI/2)) < 0.2 && Math.abs(f(0))<0.1,
            dica: "y = sin(2·x) — período = 2π/2 = π" },
          { ordem: "Desloque o gráfico π/2 para a esquerda (fase C = π/2).",
            checa: f => Math.abs(f(0) - 1) < 0.15,
            dica: "y = sin(x + π/2) — em x=0 vale sin(π/2)=1" },
        ],
      });

      mountQuizSet(c.querySelector("#quiz-seno"), [
        { q: "Período de $f(x)=\\sin(3x)$?",
          opts:["$2\\pi/3$","$2\\pi$","$\\pi$","$3\\pi$","$6\\pi$"], ans:0,
          expl:"$T=2\\pi/B=2\\pi/3$" },
        { q: "Amplitude de $f(x)=4\\sin(x)-1$?",
          opts:["$4$","$1$","$3$","$5$","$2$"], ans:0,
          expl:"Amplitude = |A| = 4. O −1 é deslocamento vertical, não afeta amplitude." },
        { q: "(ENEM) $f(x)=\\sin(2x)$. Menor período positivo?",
          opts:["$\\pi$","$2\\pi$","$\\pi/2$","$4\\pi$","$\\pi/4$"], ans:0,
          expl:"$T=2\\pi/2=\\pi$" },
      ]);
    }
  },

  /* ──────────── Função cosseno ──────────── */
  {
    id: "trig-cosseno",
    title: "Função cosseno",
    render(c) {
      c.innerHTML = section("Cap 5 · §5", "Função cosseno",
          def("Relação com o seno", `$$\\cos(x)=\\sin\\!\\left(x+\\dfrac{\\pi}{2}\\right)$$
            Forma geral: $f(x)=A\\cos(Bx+C)+D$ — mesmos parâmetros do seno.`)) +
        `<div class="lesson-section">` +
        labSlot("lab-cos") + `</div>` +
        think("Em que $x$ o cosseno atinge máximo? Mínimo? Compare com o seno — onde está a diferença?") +
        quizSlot("quiz-cos");

      autoRender(c);

      mountLab(c.querySelector("#lab-cos"), {
        base: "f(x) = A\\cos(Bx+C)+D",
        vars: [
          { sym: "A", papel: "amplitude", limites: "A > 0", efeito: "mesma interpretação do seno" },
          { sym: "B", papel: "frequência angular", limites: "B > 0", efeito: "T = 2π/B" },
          { sym: "C", papel: "fase", limites: "∈ ℝ", efeito: "deslocamento horizontal" },
          { sym: "D", papel: "eixo de equilíbrio", limites: "∈ ℝ", efeito: "translação vertical" },
        ],
        piAxis: true,
        start: "y = cos(x)",
        view: { xmin: -2*Math.PI, xmax: 2*Math.PI, ymin: -2.5, ymax: 2.5 },
        examples: ["y = cos(x)", "y = 2·cos(x)", "y = cos(2·x)", "y = cos(x - π/3)", "y = cos(x) - 1"],
        desafios: [
          { ordem: "Converta cos(x) em seno com a mesma curva.",
            checa: f => Math.abs(f(0) - 1) < 0.15 && Math.abs(f(Math.PI/2)) < 0.15,
            dica: "cos(x) = sin(x + π/2)" },
          { ordem: "Faça o cosseno ter amplitude 3 e eixo em y = 2.",
            checa: f => { let mx=-Infinity; for(let x=0;x<=2*Math.PI;x+=0.1){const v=f(x);if(isFinite(v))mx=Math.max(mx,v);} return Math.abs(mx - 5) < 0.3; },
            dica: "y = 3·cos(x) + 2 — máximo = 3+2 = 5" },
        ],
      });

      mountQuizSet(c.querySelector("#quiz-cos"), [
        { q: "$\\cos(0)$?",
          opts:["$1$","$0$","$-1$","$1/2$","$\\sqrt{2}/2$"], ans:0,
          expl:"$\\cos(0)=1$ — máximo do cosseno." },
        { q: "Para qual $x\\in[0,2\\pi]$ vale $\\cos x = -1$?",
          opts:["$\\pi$","$\\pi/2$","$3\\pi/2$","$2\\pi$","$0$"], ans:0,
          expl:"Mínimo do cosseno ocorre em $x=\\pi$." },
      ]);
    }
  },

  /* ──────────── Função tangente ──────────── */
  {
    id: "trig-tangente",
    title: "Função tangente",
    render(c) {
      c.innerHTML = section("Cap 5 · §6", "Função tangente",
          def("Definição", `$$\\tan x = \\dfrac{\\sin x}{\\cos x}$$
            Não definida quando $\\cos x=0$, ou seja, em $x=\\dfrac{\\pi}{2}+k\\pi,\\ k\\in\\mathbb{Z}$.
            Período: $T=\\pi$.`)) +
        `<div class="lesson-section">` +
        labSlot("lab-tan") + `</div>` +
        think("A tangente não tem amplitude. Por quê? O que isso significa sobre a imagem da função?") +
        quizSlot("quiz-tan");

      autoRender(c);

      mountLab(c.querySelector("#lab-tan"), {
        base: "f(x) = A\\tan(Bx+C)+D",
        vars: [
          { sym: "A", papel: "escala vertical", limites: "A ≠ 0", efeito: "\"estica\" a curva — não é amplitude pois tan tem imagem ℝ" },
          { sym: "B", papel: "frequência", limites: "B > 0", efeito: "período T = π/B" },
          { sym: "C", papel: "fase", limites: "∈ ℝ", efeito: "translação horizontal" },
        ],
        piAxis: true,
        start: "y = tan(x)",
        view: { xmin: -Math.PI, xmax: Math.PI, ymin: -4, ymax: 4 },
        examples: ["y = tan(x)", "y = 2·tan(x)", "y = tan(2·x)", "y = tan(x - π/4)"],
        desafios: [
          { ordem: "Faça uma tangente com período π/2.",
            checa: f => { const v1=f(Math.PI/8), v2=f(Math.PI/8+Math.PI/2); return isFinite(v1)&&isFinite(v2)&&Math.abs(v1-v2)<0.3; },
            dica: "y = tan(2·x) — período = π/2" },
        ],
      });

      mountQuizSet(c.querySelector("#quiz-tan"), [
        { q: "Período de $f(x)=\\tan(x)$?",
          opts:["$\\pi$","$2\\pi$","$\\pi/2$","$2$","$4\\pi$"], ans:0,
          expl:"Período da tangente é sempre $\\pi$." },
        { q: "$\\tan(\\pi/4)$?",
          opts:["$1$","$\\sqrt{3}$","$\\sqrt{3}/3$","$0$","$\\sqrt{2}$"], ans:0,
          expl:"$\\tan(\\pi/4)=\\sin/\\cos=\\frac{\\sqrt{2}/2}{\\sqrt{2}/2}=1$" },
        { q: "(ENEM) Domínio natural de $f(x)=\\tan x$?",
          opts:[
            "$\\mathbb{R}\\setminus\\{\\frac{\\pi}{2}+k\\pi,\\ k\\in\\mathbb{Z}\\}$",
            "$\\mathbb{R}$",
            "$(0,\\infty)$",
            "$[-1,1]$",
            "$\\mathbb{R}\\setminus\\{k\\pi\\}$"
          ], ans:0,
          expl:"Excluem-se os zeros do cosseno: $x=\\pi/2+k\\pi$." },
      ]);
    }
  },
];
