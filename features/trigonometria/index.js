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
  /* ──────────── Círculo trigonométrico ──────────── */
  {
    id: "trig-circulo",
    title: "Círculo trigonométrico",
    render(c) {
      c.innerHTML = `
<div class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · §2</div>
  <h1 class="al-title">O que é o círculo trigonométrico?</h1>
  <p>Imagine um círculo de raio 1 com o centro na origem do plano cartesiano. Esse é o círculo trigonométrico — e é a ferramenta central para entender seno, cosseno e tangente.</p>
</div>

<div class="def">
  <div class="def-h">A ideia essencial</div>
  <p>Coloque um ponto <strong>P</strong> na borda do círculo. Ligue-o à origem com uma reta.</p>
  <p>Essa reta forma um ângulo <strong>θ</strong> com o eixo x positivo.</p>
  <p>As coordenadas do ponto <strong>P</strong> têm nomes:</p>
  <ul>
    <li><strong>A coordenada horizontal</strong> (o quanto foi para a direita/esquerda) = <strong>cosseno de θ</strong></li>
    <li><strong>A coordenada vertical</strong> (o quanto foi para cima/baixo) = <strong>seno de θ</strong></li>
  </ul>
  <p>Simples assim: $P(\\theta) = (\\cos\\theta,\\ \\sin\\theta)$.</p>
</div>

<div class="box think">
  <p><strong>Por que o raio é 1?</strong> Porque assim as coordenadas do ponto caem exatamente entre −1 e 1 — e isso faz seno e cosseno terem sempre esse intervalo. Com raio diferente, seria necessário dividir pelo raio o tempo todo.</p>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Veja acontecendo</h2>
  <p>Arraste o ponto no círculo abaixo. Observe como seno (vertical) e cosseno (horizontal) mudam:</p>
  <div id="circ-canvas" style="width:100%;max-width:380px;height:340px;margin:.5rem auto;display:block;"></div>
  <p style="font-size:.82rem;color:var(--text-mut)">🟠 Laranja = cosseno (horizontal) · 🟡 Amarelo = seno (vertical)</p>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Os sinais mudam por quadrante</h2>
  <p>Quando o ponto está no lado direito do círculo, o cosseno é positivo (x > 0). Quando está no lado esquerdo, é negativo. Da mesma forma para o seno com cima/baixo.</p>
  <p><strong>Regra prática (TSCS):</strong></p>
  <table class="vtab mono" style="margin:.75rem 0">
    <thead><tr><th>Quadrante</th><th>Posição</th><th>sin</th><th>cos</th><th>tan</th></tr></thead>
    <tbody>
      <tr><td><strong>I</strong></td><td>Direita, cima</td><td style="color:#34d399">+</td><td style="color:#34d399">+</td><td style="color:#34d399">+</td></tr>
      <tr><td><strong>II</strong></td><td>Esquerda, cima</td><td style="color:#34d399">+</td><td style="color:#f87171">−</td><td style="color:#f87171">−</td></tr>
      <tr><td><strong>III</strong></td><td>Esquerda, baixo</td><td style="color:#f87171">−</td><td style="color:#f87171">−</td><td style="color:#34d399">+</td></tr>
      <tr><td><strong>IV</strong></td><td>Direita, baixo</td><td style="color:#f87171">−</td><td style="color:#34d399">+</td><td style="color:#f87171">−</td></tr>
    </tbody>
  </table>
  <div class="box apply">
    <p><strong>Mnemônico TSCS:</strong> <em>"Todos os Sinos Cantam Suave"</em> — o que está positivo em cada quadrante: <strong>T</strong>odos (Q1), <strong>S</strong>eno (Q2), <strong>C</strong>osseno (Q4), <strong>T</strong>angente (Q3). Mas na prática é mais fácil pensar geometricamente: cima = sen+, direita = cos+.</p>
  </div>
</div>

<div class="def">
  <div class="def-h">Relação de Pitágoras</div>
  <p>O ponto P sempre está na borda do círculo de raio 1. Pela fórmula da distância à origem:</p>
  <p>$$\\cos^2\\theta + \\sin^2\\theta = 1$$</p>
  <p>Isso vale para qualquer ângulo — é a <strong>relação fundamental</strong> da trigonometria.</p>
</div>

<div id="quiz-circ"></div>`;

      // Interactive unit circle (kept simple)
      const wrap = c.querySelector("#circ-canvas");
      const cv = document.createElement("canvas");
      cv.style.cssText = "width:100%;height:100%;display:block;cursor:crosshair;touch-action:none;";
      wrap.appendChild(cv);

      function drawCircle(theta) {
        const W = cv.offsetWidth, H = cv.offsetHeight;
        if (!W || !H) return;
        const dpr = window.devicePixelRatio || 1;
        cv.width = W * dpr; cv.height = H * dpr;
        const ctx = cv.getContext("2d");
        ctx.scale(dpr, dpr);
        const cx = W/2, cy = H/2, r = Math.min(W,H)*0.38;
        const dark = document.documentElement.getAttribute("data-theme") !== "light";
        const fg   = dark ? "#e8e3da" : "#1a1a2e";
        const fgm  = dark ? "#6b728088" : "#9ca3af88";
        const acc  = "#ffa500", acc2 = "#ffd23f", green = dark ? "#4ade80" : "#16a34a";

        ctx.clearRect(0,0,W,H);

        // Eixos
        ctx.strokeStyle = fgm; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx-r*1.25,cy); ctx.lineTo(cx+r*1.25,cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx,cy-r*1.25); ctx.lineTo(cx,cy+r*1.25); ctx.stroke();

        // Círculo
        ctx.strokeStyle = dark?"rgba(200,190,170,.25)":"rgba(60,60,80,.2)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx,cy,r,0,2*Math.PI); ctx.stroke();

        // Quadrant labels
        ctx.fillStyle = dark?"rgba(200,190,170,.18)":"rgba(60,60,80,.15)";
        ctx.font = `bold ${Math.round(r*.13)}px monospace`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText("I",  cx+r*.55, cy-r*.55);
        ctx.fillText("II", cx-r*.55, cy-r*.55);
        ctx.fillText("III",cx-r*.55, cy+r*.55);
        ctx.fillText("IV", cx+r*.55, cy+r*.55);

        const px = cx+r*Math.cos(theta), py = cy-r*Math.sin(theta);
        const cosV = Math.cos(theta), sinV = Math.sin(theta);

        // Triângulo retângulo
        ctx.strokeStyle = fgm; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px,cy); ctx.lineTo(px,py); ctx.stroke();

        // Projeções destacadas com cor
        // Cosseno (horizontal) — laranja
        ctx.strokeStyle = acc; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,cy); ctx.stroke();
        // Ponto cos no eixo x
        ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(px,cy,4,0,2*Math.PI); ctx.fill();

        // Seno (vertical) — amarelo
        ctx.strokeStyle = acc2; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(px,cy); ctx.lineTo(px,py); ctx.stroke();
        // Ponto sin no eixo y (projeção)
        ctx.fillStyle = acc2; ctx.beginPath(); ctx.arc(cx,py,4,0,2*Math.PI); ctx.fill();

        // Raio
        ctx.strokeStyle = fg; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,py); ctx.stroke();
        ctx.fillStyle = fg; ctx.font=`${Math.round(r*.1)}px monospace`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText("1", (cx+px)/2 - 6*Math.sin(theta), (cy+py)/2 - 6*Math.cos(theta));

        // Ponto P
        ctx.fillStyle = cosV >= 0 ? acc : "#f87171";
        ctx.beginPath(); ctx.arc(px,py,8,0,2*Math.PI); ctx.fill();
        ctx.strokeStyle = dark?"rgba(8,8,20,.7)":"rgba(255,255,255,.7)"; ctx.lineWidth=2; ctx.stroke();

        // Ângulo arc
        const tN = ((theta%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
        ctx.strokeStyle = fg+"99"; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.arc(cx,cy,r*.22,0,-tN,true); ctx.stroke();

        // Labels das projeções
        const fs = Math.round(r*.12);
        ctx.font = `bold ${fs}px monospace`;
        ctx.fillStyle = acc; ctx.textAlign="center"; ctx.textBaseline = sinV>=0?"top":"bottom";
        ctx.fillText(`cos = ${cosV.toFixed(2)}`, (cx+px)/2, cy + (sinV>=0?6:-6));
        ctx.fillStyle = acc2; ctx.textAlign = cosV>=0?"left":"right"; ctx.textBaseline="middle";
        ctx.fillText(`sin = ${sinV.toFixed(2)}`, px+(cosV>=0?7:-7), (cy+py)/2);

        // Ângulo label
        const deg = (tN*180/Math.PI).toFixed(1);
        ctx.fillStyle = fg; ctx.font=`bold ${Math.round(r*.1)}px monospace`;
        ctx.textAlign="center"; ctx.textBaseline="top";
        ctx.fillText(`θ = ${deg}°`, cx, 6);
      }

      let theta = Math.PI/4; let dragging=false;
      requestAnimationFrame(()=>drawCircle(theta));
      window.addEventListener("themechange", ()=>drawCircle(theta));

      function toTheta(e) {
        const rect=cv.getBoundingClientRect(), pt=e.touches?e.touches[0]:e;
        const x=(pt.clientX-rect.left)-rect.width/2;
        const y=-((pt.clientY-rect.top)-rect.height/2);
        return Math.atan2(y,x);
      }
      cv.addEventListener("pointerdown",e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);dragging=true;theta=toTheta(e);drawCircle(theta);});
      cv.addEventListener("pointermove",e=>{if(!dragging)return;theta=toTheta(e);drawCircle(theta);});
      cv.addEventListener("pointerup",  e=>{dragging=false;cv.releasePointerCapture(e.pointerId);});

      autoRender(c);
      mountQuizSet(c.querySelector("#quiz-circ"), [
        { q: "No círculo trigonométrico, o seno de θ representa:",
          opts:["A coordenada vertical do ponto P","A coordenada horizontal do ponto P","O comprimento do raio","O ângulo em graus","A área do setor"],
          ans:0, expl:"Seno = coordenada y (vertical). Cosseno = coordenada x (horizontal)." },
        { q: "Se o ponto P está no 2º quadrante (esquerda, cima), qual afirmação é VERDADEIRA?",
          opts:["sin > 0 e cos < 0","sin < 0 e cos > 0","sin > 0 e cos > 0","sin < 0 e cos < 0","sin = 0"],
          ans:0, expl:"2º quadrante: x negativo (cos < 0), y positivo (sin > 0)." },
        { q: "Por que cos²θ + sin²θ = 1 sempre?",
          opts:["P está sempre na borda do círculo de raio 1 (Pitágoras)","É uma coincidência","Só vale para ângulos notáveis","Por causa da calculadora","Não vale sempre"],
          ans:0, expl:"O ponto P tem coordenadas (cos θ, sin θ) e distância 1 da origem: cos²θ + sin²θ = 1²= 1." },
      ]);
    }
  },

  /* ──────────── Valores notáveis ──────────── */
  {
    id: "trig-notaveis",
    title: "Valores notáveis",
    render(c) {
      c.innerHTML = `
<div class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · §3</div>
  <h1 class="al-title">Valores notáveis de seno e cosseno</h1>
  <p>Existem alguns ângulos especiais cujos senos e cossenos têm valores exatos simples — e que aparecem em toda prova e vestibular. Vale a pena saber de cor.</p>
</div>

<div class="def">
  <div class="def-h">De onde vêm esses valores?</div>
  <p>Dois triângulos simples explicam tudo:</p>
  <ul>
    <li><strong>30° e 60°:</strong> pegue um triângulo equilátero de lado 2 e corte ao meio. Você obtém um triângulo com ângulos 30°–60°–90° e lados 1, √3, 2.</li>
    <li><strong>45°:</strong> pegue um quadrado de lado 1 e corte na diagonal. Você obtém um triângulo 45°–45°–90° com lados 1, 1, √2.</li>
  </ul>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">A tabela completa</h2>
  <table class="vtab mono" style="font-size:.93rem;margin:.75rem 0;width:100%">
    <thead><tr><th>θ (graus)</th><th>θ (rad)</th><th>sin θ</th><th>cos θ</th><th>tan θ</th></tr></thead>
    <tbody>
      <tr><td>0°</td><td>0</td><td>0</td><td>1</td><td>0</td></tr>
      <tr><td>30°</td><td>π/6</td><td>1/2</td><td>√3/2</td><td>√3/3</td></tr>
      <tr><td>45°</td><td>π/4</td><td>√2/2</td><td>√2/2</td><td>1</td></tr>
      <tr><td>60°</td><td>π/3</td><td>√3/2</td><td>1/2</td><td>√3</td></tr>
      <tr><td>90°</td><td>π/2</td><td>1</td><td>0</td><td>∄</td></tr>
      <tr><td>180°</td><td>π</td><td>0</td><td>−1</td><td>0</td></tr>
      <tr><td>270°</td><td>3π/2</td><td>−1</td><td>0</td><td>∄</td></tr>
      <tr><td>360°</td><td>2π</td><td>0</td><td>1</td><td>0</td></tr>
    </tbody>
  </table>

  <div class="box apply">
    <p><strong>Truque da raiz quadrada (para 0° a 90°):</strong></p>
    <p>O seno de 0°, 30°, 45°, 60°, 90° é: $\\dfrac{\\sqrt{0}}{2},\\ \\dfrac{\\sqrt{1}}{2},\\ \\dfrac{\\sqrt{2}}{2},\\ \\dfrac{\\sqrt{3}}{2},\\ \\dfrac{\\sqrt{4}}{2}$</p>
    <p>Ou seja: <strong>0, 1/2, √2/2, √3/2, 1</strong> — a sequência cresce com o ângulo.</p>
    <p>O cosseno é a mesma sequência, mas ao contrário (decresce).</p>
    <p>Note também: <strong>sin 30° = cos 60°</strong> e <strong>sin 60° = cos 30°</strong> — seno e cosseno são complementares.</p>
  </div>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Redução ao 1º quadrante</h2>
  <p>Para calcular sin ou cos de ângulos do 2º, 3º ou 4º quadrante, usamos simetria:</p>
  <ol style="line-height:1.9;padding-left:1.3rem">
    <li><strong>Ache o ângulo de referência</strong> (distância ao eixo x mais próximo)</li>
    <li><strong>Use o valor notável</strong> do ângulo de referência</li>
    <li><strong>Aplique o sinal</strong> do quadrante (TSCS)</li>
  </ol>

  <div class="box solved">
    <p><strong>Exemplo:</strong> calcular sin(150°) e cos(150°)</p>
    <p>150° está no <strong>Q2</strong> (entre 90° e 180°).</p>
    <p>Ângulo de referência = 180° − 150° = <strong>30°</strong></p>
    <p>Q2: sin é positivo, cos é negativo.</p>
    <p>$\\sin(150°) = +\\sin(30°) = \\mathbf{\\dfrac{1}{2}}$</p>
    <p>$\\cos(150°) = -\\cos(30°) = \\mathbf{-\\dfrac{\\sqrt{3}}{2}}$</p>
  </div>

  <div class="box solved">
    <p><strong>Exemplo:</strong> calcular sin(315°)</p>
    <p>315° está no <strong>Q4</strong> (entre 270° e 360°).</p>
    <p>Ângulo de referência = 360° − 315° = <strong>45°</strong></p>
    <p>Q4: sin é negativo, cos é positivo.</p>
    <p>$\\sin(315°) = -\\sin(45°) = \\mathbf{-\\dfrac{\\sqrt{2}}{2}}$</p>
  </div>
</div>

<div id="quiz-notaveis"></div>`;

      autoRender(c);
      mountQuizSet(c.querySelector("#quiz-notaveis"), [
        { q: "Qual é o valor de sin(60°)?",
          opts:["√3/2","1/2","√2/2","1","0"], ans:0,
          expl:"sin(60°) = √3/2 ≈ 0,866. Lembre: sin cresce de 0 a 90°, logo sin(60°) > sin(45°) > sin(30°)." },
        { q: "Qual é o valor de cos(0°)?",
          opts:["1","0","−1","√2/2","1/2"], ans:0,
          expl:"cos(0°) = 1. Em θ=0, o ponto P está em (1,0) — exatamente no eixo x positivo." },
        { q: "Para calcular sin(120°), qual é o ângulo de referência?",
          opts:["60°","30°","45°","90°","120°"], ans:0,
          expl:"120° está no Q2. Ângulo de referência = 180° − 120° = 60°. Logo sin(120°) = +sin(60°) = √3/2." },
        { q: "Qual é o valor de tan(45°)?",
          opts:["1","√3","√3/3","0","∄"], ans:0,
          expl:"tan(45°) = sin(45°)/cos(45°) = (√2/2)/(√2/2) = 1." },
      ]);
    }
  },

  /* ──────────── Função seno ──────────── */
  {
    id: "trig-seno",
    title: "Função seno",
    render(c) {
      c.innerHTML = `
<div class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · §4</div>
  <h1 class="al-title">O que é a função seno?</h1>
  <p>Imagine o ponto P girando no círculo trigonométrico. À medida que ele gira, sua <strong>altura</strong> (coordenada y = seno) sobe e desce repetidamente. A função seno registra essa altura ao longo do tempo.</p>
</div>

<div class="def">
  <div class="def-h">f(x) = sen(x) — características essenciais</div>
  <ul style="line-height:2">
    <li><strong>Domínio:</strong> todos os reais (ℝ) — funciona para qualquer ângulo</li>
    <li><strong>Imagem:</strong> de −1 a 1 — nunca passa desses limites</li>
    <li><strong>Período:</strong> 2π — se repete a cada volta completa</li>
    <li><strong>Começa em zero:</strong> f(0) = sin(0) = 0</li>
    <li><strong>Máximo = 1</strong> em x = π/2 · <strong>Mínimo = −1</strong> em x = 3π/2</li>
  </ul>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Os 5 pontos-chave (método rápido para o simulado)</h2>
  <p>Qualquer gráfico de seno pode ser esboçado com apenas 5 pontos — um a cada quarto de período:</p>
  <table class="vtab mono" style="margin:.5rem 0;width:100%">
    <thead><tr><th>x</th><th>0</th><th>π/2</th><th>π</th><th>3π/2</th><th>2π</th></tr></thead>
    <tbody><tr><th>sin(x)</th><td>0</td><td>1</td><td>0</td><td>−1</td><td>0</td></tr></tbody>
  </table>
  <p>Ligue esses pontos com uma curva suave — isso é o gráfico do seno.</p>
  <div class="box think">
    <p><strong>Padrão dos 5 pontos:</strong> zero → máximo → zero → mínimo → zero. Memorize esse ritmo.</p>
  </div>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Crescimento e decrescimento</h2>
  <ul style="line-height:1.9;padding-left:1.3rem">
    <li><strong>Crescente</strong> de −π/2 a π/2 (subindo do mínimo ao máximo)</li>
    <li><strong>Decrescente</strong> de π/2 a 3π/2 (descendo do máximo ao mínimo)</li>
  </ul>
  <p>A função é <strong>ímpar</strong>: sin(−x) = −sin(x). O gráfico tem simetria de ponto em relação à origem.</p>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Explore no laboratório</h2>` +
        labSlot("lab-seno") + `
</div>` +
        `<div id="quiz-seno"></div>`;

      autoRender(c);

      mountLab(c.querySelector("#lab-seno"), {
        base: "f(x) = A·sin(Bx+C)+D",
        vars: [
          { sym: "A", papel: "amplitude", limites: "A > 0",
            efeito: "escala vertical — máx = D+A, mín = D−A" },
          { sym: "B", papel: "frequência angular", limites: "B > 0",
            efeito: "período T = 2π/B · B>1 comprime · B<1 estica" },
          { sym: "C", papel: "fase inicial", limites: "∈ ℝ",
            efeito: "desloca horizontalmente (C/B para a esquerda)" },
          { sym: "D", papel: "deslocamento vertical", limites: "∈ ℝ",
            efeito: "translada o eixo de equilíbrio" },
        ],
        piAxis: true,
        start: "y = sin(x)",
        view: { xmin: -2*Math.PI, xmax: 2*Math.PI, ymin: -2.5, ymax: 2.5 },
        examples: ["y = sin(x)", "y = 2*sin(x)", "y = sin(2*x)", "y = sin(x + π/2)", "y = sin(x) + 1"],
        desafios: [
          { ordem: "Faça o gráfico ter amplitude 2 (máximo = 2, mínimo = −2).",
            checa: f => { let mx=-Infinity, mn=Infinity; for(let x=-Math.PI*2;x<=Math.PI*2;x+=0.1){const v=f(x);if(isFinite(v)){mx=Math.max(mx,v);mn=Math.min(mn,v);}} return Math.abs(mx-2)<0.2&&Math.abs(mn+2)<0.2; },
            dica: "Multiplique por 2: y = 2·sin(x)" },
          { ordem: "Reduza o período à metade (T = π em vez de 2π).",
            checa: f => Math.abs(f(Math.PI/2) - f(-Math.PI/2)) < 0.2 && Math.abs(f(0))<0.1,
            dica: "y = sin(2·x) — período = 2π/2 = π" },
        ],
      });

      mountQuizSet(c.querySelector("#quiz-seno"), [
        { q: "Qual é o valor máximo de f(x) = sin(x)?",
          opts:["1","2","π","∞","√2"], ans:0,
          expl:"O seno nunca passa de 1. Isso ocorre em x = π/2 + 2kπ." },
        { q: "Em quantos pontos f(x) = sin(x) = 0 no intervalo [0, 2π]?",
          opts:["3","2","1","4","0"], ans:0,
          expl:"f(x) = 0 em x = 0, x = π e x = 2π. São 3 pontos." },
        { q: "Período de f(x) = sin(3x)?",
          opts:["2π/3","2π","π","3π","6π"], ans:0,
          expl:"T = 2π/B = 2π/3. Com B=3, o gráfico 'cabe' 3 períodos no espaço de um." },
        { q: "A função sin(x) é crescente no intervalo:",
          opts:["[−π/2, π/2]","[0, π]","[π/2, 3π/2]","[π, 2π]","[0, 2π]"], ans:0,
          expl:"O seno sobe do mínimo (−π/2) ao máximo (π/2). Nos outros intervalos está descendo." },
      ]);
    }
  },

  /* ──────────── Função cosseno ──────────── */
  {
    id: "trig-cosseno",
    title: "Função cosseno",
    render(c) {
      c.innerHTML = `
<div class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · §5</div>
  <h1 class="al-title">O que é a função cosseno?</h1>
  <p>Enquanto o seno registra a <strong>altura</strong> do ponto P girando no círculo, o cosseno registra sua <strong>posição horizontal</strong> — o quanto está para a direita ou para a esquerda.</p>
</div>

<div class="def">
  <div class="def-h">f(x) = cos(x) — a diferença crucial em relação ao seno</div>
  <p>O cosseno tem as <strong>mesmas propriedades gerais</strong> que o seno (domínio ℝ, imagem [−1,1], período 2π) — mas começa em um lugar diferente:</p>
  <ul style="line-height:2">
    <li><strong>Começa no máximo:</strong> f(0) = cos(0) = 1 (enquanto sin(0) = 0)</li>
    <li><strong>Máximo = 1</strong> em x = 0, 2π, 4π… · <strong>Mínimo = −1</strong> em x = π, 3π…</li>
    <li><strong>Decrescente</strong> de 0 a π · <strong>Crescente</strong> de π a 2π</li>
    <li>Função <strong>par</strong>: cos(−x) = cos(x) — simétrica em relação ao eixo y</li>
  </ul>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Os 5 pontos-chave do cosseno</h2>
  <p><strong>Mnemônico:</strong> "Cosseno começa no máximo." Compare:</p>
  <table class="vtab mono" style="margin:.5rem 0;width:100%">
    <thead><tr><th>x</th><th>0</th><th>π/2</th><th>π</th><th>3π/2</th><th>2π</th></tr></thead>
    <tbody>
      <tr><th>cos(x)</th><td><strong>1</strong></td><td>0</td><td><strong>−1</strong></td><td>0</td><td><strong>1</strong></td></tr>
      <tr><th>sin(x)</th><td>0</td><td><strong>1</strong></td><td>0</td><td><strong>−1</strong></td><td>0</td></tr>
    </tbody>
  </table>
  <div class="box think">
    <p>Note que os padrões de sin e cos são idênticos, mas <strong>defasados de π/2</strong>. De fato: $\\cos(x) = \\sin\\!\\left(x + \\dfrac{\\pi}{2}\\right)$.</p>
    <p>O cosseno "chega antes" — seu máximo aparece π/2 mais cedo que o do seno.</p>
  </div>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Explore no laboratório</h2>` +
        labSlot("lab-cos") + `
</div>` +
        `<div id="quiz-cos"></div>`;

      autoRender(c);

      mountLab(c.querySelector("#lab-cos"), {
        base: "f(x) = A·cos(Bx+C)+D",
        vars: [
          { sym: "A", papel: "amplitude",           limites: "A > 0", efeito: "máx = D+A, mín = D−A" },
          { sym: "B", papel: "frequência angular",   limites: "B > 0", efeito: "período T = 2π/B" },
          { sym: "C", papel: "fase",                 limites: "∈ ℝ",   efeito: "deslocamento horizontal" },
          { sym: "D", papel: "eixo de equilíbrio",   limites: "∈ ℝ",   efeito: "translação vertical" },
        ],
        piAxis: true,
        start: "y = cos(x)",
        view: { xmin: -2*Math.PI, xmax: 2*Math.PI, ymin: -2.5, ymax: 2.5 },
        examples: ["y = cos(x)", "y = 2*cos(x)", "y = cos(2*x)", "y = cos(x - π/3)", "y = cos(x) - 1"],
        desafios: [
          { ordem: "Converta cos(x) em seno usando a defasagem de π/2.",
            checa: f => Math.abs(f(0)-1)<0.15 && Math.abs(f(Math.PI/2))<0.15,
            dica: "y = sin(x + π/2) — em x=0 vale sin(π/2)=1 ✓" },
        ],
      });

      mountQuizSet(c.querySelector("#quiz-cos"), [
        { q: "Qual é o valor de cos(0)?",
          opts:["1","0","−1","1/2","√2/2"], ans:0,
          expl:"cos(0) = 1. Em x=0, o ponto está em (1,0) — máximo do cosseno." },
        { q: "Para qual x ∈ [0, 2π] vale cos(x) = −1?",
          opts:["π","π/2","3π/2","2π","0"], ans:0,
          expl:"O mínimo do cosseno ocorre em x = π (ponto (−1, 0) no círculo)." },
        { q: "O cosseno é uma função:",
          opts:["Par — cos(−x) = cos(x)","Ímpar — cos(−x) = −cos(x)","Nem par nem ímpar","Sempre positiva","Sempre decrescente"], ans:0,
          expl:"cos(−x) = cos(x) — simétrico em relação ao eixo y. Verifique: cos(−60°) = cos(60°) = 1/2." },
        { q: "Qual é o período de f(x) = cos(2x)?",
          opts:["π","2π","π/2","4π","1"], ans:0,
          expl:"T = 2π/B = 2π/2 = π. Com B=2, completa um ciclo em π." },
      ]);
    }
  },

  /* ──────────── Função tangente ──────────── */
  {
    id: "trig-tangente",
    title: "Função tangente",
    render(c) {
      c.innerHTML = `
<div class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · §6</div>
  <h1 class="al-title">O que é a função tangente?</h1>
  <p>A tangente combina seno e cosseno numa só relação: $\\tan(x) = \\dfrac{\\sin(x)}{\\cos(x)}$.</p>
  <p>Pense geometricamente: no círculo unitário, a tangente é o comprimento do segmento vertical na reta x = 1 que vai até a linha da hipotenusa.</p>
</div>

<div class="def">
  <div class="def-h">Por que a tangente "explode"?</div>
  <p>Quando cos(x) = 0 (em x = π/2, 3π/2, …), a divisão $\\dfrac{\\sin x}{\\cos x}$ não existe (divisão por zero). Nesses pontos a tangente tem <strong>assíntotas verticais</strong> — o gráfico vai ao infinito.</p>
  <p>Fora disso, a tangente pode assumir <strong>qualquer valor real</strong> (imagem = ℝ).</p>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Características da tangente</h2>
  <ul style="line-height:2;padding-left:1.3rem">
    <li><strong>Domínio:</strong> $\\mathbb{R}\\setminus\\left\\{\\dfrac{\\pi}{2}+k\\pi\\right\\}$ — todos os reais exceto onde cos = 0</li>
    <li><strong>Imagem:</strong> ℝ — não tem máximo nem mínimo</li>
    <li><strong>Período:</strong> π — metade do período do seno e cosseno</li>
    <li><strong>Função ímpar:</strong> tan(−x) = −tan(x)</li>
    <li><strong>Sempre crescente</strong> em cada ramo (entre assíntotas consecutivas)</li>
  </ul>

  <div class="box apply">
    <p><strong>Valores notáveis da tangente:</strong></p>
    <table class="vtab mono" style="margin:.4rem 0">
      <thead><tr><th>θ</th><th>0°</th><th>30°</th><th>45°</th><th>60°</th><th>90°</th></tr></thead>
      <tbody><tr><th>tan θ</th><td>0</td><td>√3/3</td><td>1</td><td>√3</td><td>∄</td></tr></tbody>
    </table>
    <p>Note: tan(45°) = 1 porque sin(45°) = cos(45°). E tan(90°) não existe porque cos(90°) = 0.</p>
  </div>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Explore no laboratório</h2>` +
        labSlot("lab-tan") + `
</div>` +
        `<div id="quiz-tan"></div>`;

      autoRender(c);

      mountLab(c.querySelector("#lab-tan"), {
        base: "f(x) = A·tan(Bx+C)+D",
        vars: [
          { sym: "A", papel: "escala vertical",  limites: "A ≠ 0", efeito: "estica/comprime — não é 'amplitude' pois imagem é ℝ" },
          { sym: "B", papel: "frequência",        limites: "B > 0", efeito: "período T = π/B" },
          { sym: "C", papel: "fase",              limites: "∈ ℝ",   efeito: "translação horizontal" },
        ],
        piAxis: true,
        start: "y = tan(x)",
        view: { xmin: -Math.PI, xmax: Math.PI, ymin: -4, ymax: 4 },
        examples: ["y = tan(x)", "y = 2*tan(x)", "y = tan(2*x)", "y = tan(x - π/4)"],
        desafios: [
          { ordem: "Faça uma tangente com período π/2 (duas vezes mais rápida).",
            checa: f => { const v1=f(Math.PI/8), v2=f(Math.PI/8+Math.PI/2); return isFinite(v1)&&isFinite(v2)&&Math.abs(v1-v2)<0.3; },
            dica: "y = tan(2·x) — período = π/2" },
        ],
      });

      mountQuizSet(c.querySelector("#quiz-tan"), [
        { q: "Por que tan(π/2) não existe?",
          opts:["Porque cos(π/2) = 0 (divisão por zero)","Porque sin(π/2) = 0","Porque o ângulo é muito grande","É um erro de calculadora","Existe sim, vale 1"], ans:0,
          expl:"tan = sin/cos. Em π/2, cos = 0, então a divisão não está definida." },
        { q: "Qual é o período de f(x) = tan(x)?",
          opts:["π","2π","π/2","2","4π"], ans:0,
          expl:"Diferente de sin e cos (período 2π), a tangente tem período π." },
        { q: "Qual é o valor de tan(45°)?",
          opts:["1","√3","√3/3","0","∄"], ans:0,
          expl:"tan(45°) = sin(45°)/cos(45°) = (√2/2)/(√2/2) = 1." },
        { q: "A tangente é crescente ou decrescente em cada ramo?",
          opts:["Sempre crescente","Sempre decrescente","Ora crescente, ora decrescente","Constante","Não tem ramos"], ans:0,
          expl:"A tangente é estritamente crescente em cada intervalo entre assíntotas: (−π/2, π/2), (π/2, 3π/2), etc." },
      ]);
    }
  },
];

/* ──────────── AULA 7: Lista de Revisão · Simulado ──────────── */
trigonometriaLessons.push({
  id: "trig-revisao-simulado",
  title: "📋 Revisão para o Simulado",
  render(c) {
    const h = (html) => html;
    c.innerHTML = `
<div class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-weight:700;font-size:.8rem;margin-bottom:.5rem">
    ⚠️ Esta aula é preparação direta para o simulado
  </div>
  <h1 class="al-title">Lista de Revisão · Simulado de Trigonometria</h1>
  <p style="color:var(--text-soft);margin-bottom:1.5rem">
    Prof.ª Dr.ª Andréia Gomes Pinheiro · IFPA Campus Bragança<br>
    Resolva cada questão após ler a estratégia. As soluções completas estão abaixo de cada exercício.
  </p>
</div>

<!-- ═══ DICA GERAL ═══ -->
<div class="def" style="margin-bottom:1.5rem">
  <div class="def-h">🧠 Estratégia Geral para o Simulado</div>
  <p>Antes de qualquer questão, cheque dois pontos:</p>
  <ol style="margin:.4rem 0;padding-left:1.3rem">
    <li><strong>Calculadora:</strong> está em DEG ou RAD? Troque conforme o enunciado pede.</li>
    <li><strong>Ângulo grande?</strong> Divida por 360° e trabalhe só com o resto — economiza tempo e evita erros.</li>
  </ol>
  <p style="margin-top:.5rem">A âncora de tudo: <strong>180° = π rad</strong>. Toda conversão sai daí por regra de três simples.</p>
</div>

<!-- ═══ Q1 ═══ -->
<div class="box explore" style="margin-bottom:1rem">
  <h3 style="color:var(--accent);margin:0 0 .5rem">Q1 · Converter radianos → graus</h3>
  <p>Converta cada medida para graus: a) $\\dfrac{2\\pi}{3}$ · b) $\\dfrac{3\\pi}{4}$ · c) $\\dfrac{11\\pi}{6}$ · d) $\\dfrac{5\\pi}{3}$</p>
</div>
<div class="box solved" style="margin-bottom:1.5rem">
  <p><strong>💡 Truque:</strong> Substitua $\\pi$ por $180°$ diretamente na fração e simplifique.</p>
  <p>a) $\\dfrac{2\\pi}{3} \\to \\dfrac{2 \\times 180°}{3} = \\mathbf{120°}$</p>
  <p>b) $\\dfrac{3\\pi}{4} \\to \\dfrac{3 \\times 180°}{4} = \\mathbf{135°}$</p>
  <p>c) $\\dfrac{11\\pi}{6} \\to \\dfrac{11 \\times 180°}{6} = \\mathbf{330°}$</p>
  <p>d) $\\dfrac{5\\pi}{3} \\to \\dfrac{5 \\times 180°}{3} = \\mathbf{300°}$</p>
  <p><strong>⚠️ Erro comum:</strong> Multiplicar por $\\pi/180$ quando devia ser o contrário. Lembre: rad → grau = <em>multiplica</em> por $180°$, divide por $\\pi$.</p>
</div>

<!-- ═══ Q2 ═══ -->
<div class="box explore" style="margin-bottom:1rem">
  <h3 style="color:var(--accent);margin:0 0 .5rem">Q2 · Converter graus → radianos</h3>
  <p>Converta para radianos: a) 249° · b) 225° · c) 75° · d) 315°</p>
</div>
<div class="box solved" style="margin-bottom:1.5rem">
  <p><strong>💡 Método:</strong> Multiplique por $\\dfrac{\\pi}{180}$ e simplifique a fração. Sempre divida pelo MDC.</p>
  <p>a) $249° \\times \\dfrac{\\pi}{180} = \\dfrac{249\\pi}{180} = \\mathbf{\\dfrac{83\\pi}{60}}$</p>
  <p>b) $225° \\times \\dfrac{\\pi}{180} = \\dfrac{225\\pi}{180} = \\mathbf{\\dfrac{5\\pi}{4}}$</p>
  <p>c) $75° \\times \\dfrac{\\pi}{180} = \\dfrac{75\\pi}{180} = \\mathbf{\\dfrac{5\\pi}{12}}$</p>
  <p>d) $315° \\times \\dfrac{\\pi}{180} = \\dfrac{315\\pi}{180} = \\mathbf{\\dfrac{7\\pi}{4}}$</p>
</div>

<!-- ═══ Q3 ═══ -->
<div class="box explore" style="margin-bottom:1rem">
  <h3 style="color:var(--accent);margin:0 0 .5rem">Q3 · Comprimento de arco → encontrar o raio</h3>
  <p>Uma circunferência tem arco $AB = 8{,}5$ cm e ângulo central $= 2{,}5$ rad. Qual é o raio?</p>
</div>
<div class="box solved" style="margin-bottom:1.5rem">
  <p><strong>💡 Fórmula:</strong> $\\ell = r \\cdot \\theta$ (com $\\theta$ em radianos!)</p>
  <p>Isolando $r$: $r = \\dfrac{\\ell}{\\theta} = \\dfrac{8{,}5}{2{,}5} = \\mathbf{3{,}4 \\text{ cm}}$</p>
  <p><strong>⚠️ Erro comum:</strong> Usar $\\theta$ em graus diretamente na fórmula. Se vier em graus, converta primeiro!</p>
</div>

<!-- ═══ Q4 ═══ -->
<div class="box explore" style="margin-bottom:1rem">
  <h3 style="color:var(--accent);margin:0 0 .5rem">Q4 · Comprimento do arco do pêndulo</h3>
  <p>Pêndulo de 15 cm oscila de A até B descrevendo ângulo $\\theta = \\dfrac{\\pi}{12}$ rad. Qual o comprimento da trajetória?</p>
</div>
<div class="box solved" style="margin-bottom:1.5rem">
  <p><strong>💡 O pêndulo é o "raio"</strong> e o ângulo já está em radianos, então basta aplicar $\\ell = r \\cdot \\theta$.</p>
  <p>$\\ell = 15 \\times \\dfrac{\\pi}{12} = \\dfrac{15\\pi}{12} = \\dfrac{5\\pi}{4} \\approx \\mathbf{3{,}93 \\text{ cm}}$</p>
</div>

<!-- ═══ Q5 ═══ -->
<div class="box explore" style="margin-bottom:1rem">
  <h3 style="color:var(--accent);margin:0 0 .5rem">Q5 · Determinar o quadrante de ângulos grandes</h3>
  <p>Indique o quadrante: a) 8000° · b) 3600° · c) $\\dfrac{15\\pi}{4}$ · d) $\\dfrac{77\\pi}{3}$</p>
</div>
<div class="box solved" style="margin-bottom:1.5rem">
  <p><strong>💡 Método:</strong> Divida por 360° (ou 2π). O <em>resto</em> é o que importa.</p>
  <p>a) $8000 \\div 360 = 22$ voltas com resto $8000 - 22\\times360 = 80°$ → $0° < 80° < 90°$ → <strong>Q1</strong></p>
  <p>b) $3600 \\div 360 = 10$ voltas exatas, resto $= 0°$ → <strong>eixo positivo de x</strong> (não pertence a quadrante)</p>
  <p>c) $\\dfrac{15\\pi}{4} - 2\\pi = \\dfrac{15\\pi}{4} - \\dfrac{8\\pi}{4} = \\dfrac{7\\pi}{4} = 315°$ → $270° < 315° < 360°$ → <strong>Q4</strong></p>
  <p>d) $\\dfrac{77\\pi}{3} \\div 2\\pi = \\dfrac{77}{6} \\approx 12{,}8$ → 12 voltas $= \\dfrac{72\\pi}{3}$; resto $= \\dfrac{5\\pi}{3} = 300°$ → <strong>Q4</strong></p>
  <p><strong>⚠️ Erro comum:</strong> Ângulos exatamente em 90°, 180°, 270°, 360° estão nos eixos, não em quadrantes.</p>
</div>

<!-- ═══ Q6 ═══ -->
<div class="box explore" style="margin-bottom:1rem">
  <h3 style="color:var(--accent);margin:0 0 .5rem">Q6 · Expressão geral $x = 220° + 360°\\cdot k$</h3>
  <p>a) Qual a medida do arco para $k=10$? b) A que quadrante pertencem todos os arcos $x$? c) Qual é a menor determinação positiva?</p>
</div>
<div class="box solved" style="margin-bottom:1.5rem">
  <p>a) $x = 220° + 360° \\times 10 = 220° + 3600° = \\mathbf{3820°}$</p>
  <p>b) $220°$ está entre $180°$ e $270°$ → todos os arcos terminam no <strong>3º quadrante (Q3)</strong> — cada volta de 360° retorna ao mesmo ponto.</p>
  <p>c) A menor determinação positiva é o próprio ângulo base: $\\mathbf{220°}$.</p>
  <p><strong>💡 Lembre:</strong> A expressão $\\alpha + 360° \\cdot k$ representa a família infinita de arcos côngruos a $\\alpha$ — todos terminam no mesmo ponto da circunferência.</p>
</div>

<!-- ═══ Q7 ═══ -->
<div class="box explore" style="margin-bottom:1rem">
  <h3 style="color:var(--accent);margin:0 0 .5rem">Q7 · Arcos côngruos — expressão geral</h3>
  <p>Encontre a primeira determinação positiva e a expressão geral dos côngruos de: a) 30° · b) 240° · c) −60° · d) $\\dfrac{2\\pi}{3}$ · e) $-\\dfrac{3\\pi}{4}$</p>
</div>
<div class="box solved" style="margin-bottom:1.5rem">
  <p><strong>💡 Dois arcos são côngruos</strong> se sua diferença é múltiplo de $360°$ (ou $2\\pi$). Para negativos, some $360°$ até ficar positivo.</p>
  <p>a) $30°$ já positivo → Expressão: $\\mathbf{30° + 360°k}$</p>
  <p>b) $240°$ já positivo → Expressão: $\\mathbf{240° + 360°k}$</p>
  <p>c) $-60° + 360° = 300°$ → Menor det. positiva: $\\mathbf{300°}$ → Expressão: $\\mathbf{-60° + 360°k}$ (ou $300° + 360°k$)</p>
  <p>d) $\\dfrac{2\\pi}{3}$ já positivo → Expressão: $\\mathbf{\\dfrac{2\\pi}{3} + 2\\pi k}$</p>
  <p>e) $-\\dfrac{3\\pi}{4} + 2\\pi = \\dfrac{5\\pi}{4}$ → Menor det. positiva: $\\mathbf{\\dfrac{5\\pi}{4}}$ → Expressão: $\\mathbf{-\\dfrac{3\\pi}{4} + 2\\pi k}$</p>
</div>

<!-- ═══ Q8 ═══ -->
<div class="box explore" style="margin-bottom:1rem">
  <h3 style="color:var(--accent);margin:0 0 .5rem">Q8 · Sen e cos com redução ao 1º quadrante</h3>
  <p>Calcule sen e cos de: a) 150° · b) 315° · c) $\\dfrac{4\\pi}{3}$</p>
</div>
<div class="box solved" style="margin-bottom:1.5rem">
  <p><strong>💡 Passos:</strong> (1) Ache o quadrante. (2) Calcule o ângulo de referência (distância ao eixo x mais próximo). (3) Use o valor notável. (4) Aplique o sinal do quadrante (regra TSCS: <em>Todos–Seno–Cosseno–Tangente</em>, o que é positivo em cada quadrante: Q1 todos, Q2 só sen, Q3 só tan, Q4 só cos).</p>
  <p><strong>a) 150° (Q2):</strong> ref. = $180° - 150° = 30°$. Q2: sen(+), cos(−).<br>
     $\\sin 150° = +\\sin 30° = \\mathbf{\\dfrac{1}{2}}$ · $\\cos 150° = -\\cos 30° = \\mathbf{-\\dfrac{\\sqrt{3}}{2}}$</p>
  <p><strong>b) 315° (Q4):</strong> ref. = $360° - 315° = 45°$. Q4: sen(−), cos(+).<br>
     $\\sin 315° = -\\sin 45° = \\mathbf{-\\dfrac{\\sqrt{2}}{2}}$ · $\\cos 315° = +\\cos 45° = \\mathbf{\\dfrac{\\sqrt{2}}{2}}$</p>
  <p><strong>c) $\\dfrac{4\\pi}{3}$ = 240° (Q3):</strong> ref. = $240° - 180° = 60°$. Q3: sen(−), cos(−).<br>
     $\\sin\\dfrac{4\\pi}{3} = -\\sin 60° = \\mathbf{-\\dfrac{\\sqrt{3}}{2}}$ · $\\cos\\dfrac{4\\pi}{3} = -\\cos 60° = \\mathbf{-\\dfrac{1}{2}}$</p>
</div>

<!-- ═══ Q9 ═══ -->
<div class="box explore" style="margin-bottom:1rem">
  <h3 style="color:var(--accent);margin:0 0 .5rem">Q9 · Gráfico de $f(x) = \\sin x$</h3>
  <p>Esboce o gráfico e indique domínio, imagem, valor máximo, valor mínimo e intervalos de crescimento/decrescimento.</p>
</div>
<div class="box solved" style="margin-bottom:1.5rem">
  <p><strong>💡 Mnemônico:</strong> "Seno começa em zero, vai para cima." Plote os 5 pontos-chave por período:</p>
  <table class="vtab mono" style="margin:.5rem 0">
    <thead><tr><th>$x$</th><th>$0$</th><th>$\\pi/2$</th><th>$\\pi$</th><th>$3\\pi/2$</th><th>$2\\pi$</th></tr></thead>
    <tbody><tr><th>$f(x)$</th><td>$0$</td><td>$1$</td><td>$0$</td><td>$-1$</td><td>$0$</td></tr></tbody>
  </table>
  <p>• <strong>Domínio:</strong> $\\mathbb{R}$ · <strong>Imagem:</strong> $[-1,\\,1]$</p>
  <p>• <strong>Máximo:</strong> $y=1$ em $x = \\dfrac{\\pi}{2}+2k\\pi$ · <strong>Mínimo:</strong> $y=-1$ em $x = \\dfrac{3\\pi}{2}+2k\\pi$</p>
  <p>• <strong>Crescente</strong> em $\\left[-\\dfrac{\\pi}{2}+2k\\pi,\\; \\dfrac{\\pi}{2}+2k\\pi\\right]$</p>
  <p>• <strong>Decrescente</strong> em $\\left[\\dfrac{\\pi}{2}+2k\\pi,\\; \\dfrac{3\\pi}{2}+2k\\pi\\right]$</p>
  <p>• Função <strong>ímpar</strong>: $\\sin(-x) = -\\sin x$ (simétrica em relação à origem)</p>
</div>

<!-- ═══ Q10 ═══ -->
<div class="box explore" style="margin-bottom:1rem">
  <h3 style="color:var(--accent);margin:0 0 .5rem">Q10 · Gráfico de $f(x) = \\cos x$</h3>
  <p>Esboce o gráfico e indique domínio, imagem, valor máximo, valor mínimo e intervalos de crescimento/decrescimento.</p>
</div>
<div class="box solved" style="margin-bottom:1.5rem">
  <p><strong>💡 Mnemônico:</strong> "Cosseno começa no máximo." Pontos-chave:</p>
  <table class="vtab mono" style="margin:.5rem 0">
    <thead><tr><th>$x$</th><th>$0$</th><th>$\\pi/2$</th><th>$\\pi$</th><th>$3\\pi/2$</th><th>$2\\pi$</th></tr></thead>
    <tbody><tr><th>$f(x)$</th><td>$1$</td><td>$0$</td><td>$-1$</td><td>$0$</td><td>$1$</td></tr></tbody>
  </table>
  <p>• <strong>Domínio:</strong> $\\mathbb{R}$ · <strong>Imagem:</strong> $[-1,\\,1]$</p>
  <p>• <strong>Máximo:</strong> $y=1$ em $x = 2k\\pi$ · <strong>Mínimo:</strong> $y=-1$ em $x = \\pi+2k\\pi$</p>
  <p>• <strong>Decrescente</strong> em $[2k\\pi,\\; \\pi+2k\\pi]$</p>
  <p>• <strong>Crescente</strong> em $[\\pi+2k\\pi,\\; 2\\pi+2k\\pi]$</p>
  <p>• Função <strong>par</strong>: $\\cos(-x) = \\cos x$ (simétrica em relação ao eixo $y$)</p>
  <p>• $\\cos x = \\sin\\!\\left(x + \\dfrac{\\pi}{2}\\right)$ — o cosseno é o seno com defasagem de $\\dfrac{\\pi}{2}$.</p>
</div>

<!-- ═══ Q11 ═══ -->
<div class="box explore" style="margin-bottom:1rem">
  <h3 style="color:var(--accent);margin:0 0 .5rem">Q11 · Determinar parâmetro da função trigonométrica</h3>
  <p>O ponto $(0,\\,5)$ pertence a $f(x) = a + \\sin x$. Calcule $f\\!\\left(\\dfrac{3\\pi}{2}\\right)$.</p>
</div>
<div class="box solved" style="margin-bottom:2rem">
  <p><strong>Passo 1:</strong> Use o ponto dado para encontrar $a$.</p>
  <p>$(0,5)$ pertence à função → $f(0) = 5$</p>
  <p>$f(0) = a + \\sin 0 = a + 0 = a \\Rightarrow \\mathbf{a = 5}$</p>
  <p><strong>Passo 2:</strong> Aplique $a=5$ em $f\\!\\left(\\dfrac{3\\pi}{2}\\right)$.</p>
  <p>$f\\!\\left(\\dfrac{3\\pi}{2}\\right) = 5 + \\sin\\dfrac{3\\pi}{2} = 5 + (-1) = \\mathbf{4}$</p>
</div>

<!-- ═══ DICAS FINAIS ═══ -->
<div class="def" style="border-top-color:#60a5fa;background:color-mix(in srgb,#60a5fa 8%,var(--surface))">
  <div class="def-h" style="color:#60a5fa">📌 Resumo das Estratégias para o Simulado</div>
  <ol style="padding-left:1.3rem;line-height:1.9">
    <li><strong>Âncora única:</strong> $180° = \\pi$ rad — toda conversão sai daí.</li>
    <li><strong>Ângulo grande?</strong> Divida por 360° e use o resto.</li>
    <li><strong>Comprimento de arco:</strong> $\\ell = r\\theta$ — $\\theta$ <em>obrigatoriamente</em> em radianos.</li>
    <li><strong>Sinais por quadrante (TSCS):</strong> Q1 Todos, Q2 Seno, Q3 Cosseno, Q4 Tangente — o que é positivo em cada um.</li>
    <li><strong>Valores notáveis:</strong> sen/cos de 30°, 45°, 60° de cor. cos 30° = sen 60° = √3/2; cos 60° = sen 30° = 1/2; cos 45° = sen 45° = √2/2.</li>
    <li><strong>Seno começa em zero, cosseno começa no máximo.</strong></li>
    <li><strong>Calculadora:</strong> confira DEG ou RAD antes de calcular.</li>
  </ol>
</div>`;

    autoRender(c);
  }
});
