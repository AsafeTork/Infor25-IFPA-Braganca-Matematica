/* ============================================================
   features/trigonometria/index.js
   Capítulo 5 — Funções Trigonométricas · 8 Aulas

   Arcos, círculo trigonométrico, sen/cos/tan, valores notáveis,
   gráficos periódicos, tangente, aplicações periódicas.
   ============================================================ */
import { autoRender } from "../../components/katex.js";
import { labSlot } from "../../utils/content.js";
import { mountLab } from "../../components/formulaLab.js";

import { mountTrigCircle, mountCircleToGraph, mountTrigParamExplorer, mountTangentVis, mountPeriodicVis } from "../../core/trigVisuals.js";

export const trigonometriaMeta = { num: "05", title: "O Círculo e as Ondas", subtitle: "Funções Trigonométricas", chapter: "Funções Trigonométricas" };

/* ── Cleanup controller registry ─────────────────────────── */
let _activeControllers = [];
function cleanupLesson() {
  _activeControllers.forEach(c => c?.destroy?.());
  _activeControllers = [];
}

export const trigonometriaLessons = [

/* ═══════════════════════════════════════════════════════════
   AULA 1 — Movimento Circular: Da Terra aos Pêndulos
   ═══════════════════════════════════════════════════════════ */
{
  id: "trig-movimento-circular",
  title: "Movimento Circular",
  render(c) {
    cleanupLesson();
    c.innerHTML = `
<section class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · Aula 1</div>
  <h1 class="al-title">Movimento Circular: Da Terra aos Pêndulos</h1>
  <p class="al-subtitle">Como o movimento repetitivo se transforma em matemática</p>
</section>

<div class="def">
  <div class="def-h">Por que tudo isso importa?</div>
  <p>A Terra gira em torno do Sol. Um pêndulo oscila de um lado para o outro. Uma nota musical vibra. Um pisca-pisca pisca. Todos esses fenômenos compartilham uma mesma ideia: <strong>movimento que se repete</strong>.</p>
  <p>A trigonometria nasceu justamente para descrever esse tipo de movimento. Quando você entende que um ponto girando num círculo pode ser "desenrolado" numa onda, tudo faz sentido: seno, cosseno, tangente são apenas formas de medir <em>onde</em> o ponto está naquele ciclo.</p>
</div>

<section class="lesson-section">
  <h2 class="lesson-h2">Exemplos que você já conhece</h2>
  <div class="box explore">
    <p><strong>Planetas e satélites</strong> — A Terra percorre uma órbita quase circular ao redor do Sol. Um satélite artificial percorre uma trajetória circular ao redor da Terra. A cada instante, o satélite está em uma posição que pode ser descrita por um ângulo.</p>
  </div>
  <div class="box explore">
    <p><strong>Pêndulo</strong> — A ponta de um pêndulo oscila de A até B e volta. Embora o caminho não seja um círculo completo, o ângulo de oscilação pode ser medido — e sua posição horizontal segue uma função seno.</p>
  </div>
  <div class="box explore">
    <p><strong>Relógio de ponteiros</strong> — O ponteiro dos segundos completa uma volta (360°) a cada 60 segundos. Se você marcar a posição vertical do ponteiro a cada segundo, vai traçar uma onda senoidal.</p>
  </div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">A ideia central: ângulo + círculo = função</h2>
  <p>Imagine um ponto P girando ao redor de um centro, a uma velocidade constante. Se você anotar a <strong>altura</strong> (posição vertical) de P a cada instante, vai obter uma tabela de valores que forma uma onda.</p>
  <div class="box apply">
    <p>Cada <strong>posição</strong> num círculo → um <strong>ângulo</strong> → um <strong>par (x, y)</strong> → um <strong>ponto no gráfico</strong>.</p>
    <p>Quando o ponto completa uma volta, tudo se repete. Isso é <strong>periodicidade</strong>.</p>
  </div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Graus e radianos — a linguagem dos ângulos</h2>
  <p>Para medir o ângulo percorrido, usamos duas escalas:</p>
  <ul style="line-height:2;padding-left:1.3rem">
    <li><strong>Graus (°)</strong> — 360° = volta completa. Familiar do dia a dia.</li>
    <li><strong>Radianos (rad)</strong> — 2π rad = volta completa. Natural para cálculos matemáticos.</li>
  </ul>
  <p>A relação é sempre: $180° = \\pi \\text{ rad}$</p>
  <div class="box solved">
    <p><strong>Exemplo:</strong> Converter 60° para radianos</p>
    <p>$60° \\times \\dfrac{\\pi}{180} = \\dfrac{\\pi}{3} \\approx 1{,}047 \\text{ rad}$</p>
  </div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Interativo — Explore o movimento circular</h2>
  <p>Arraste o ponto P ao longo do círculo. Observe como o ângulo θ muda e como as coordenadas de P se alteram. Note que ao completar uma volta (360° ou 2π rad), tudo se repete.</p>
  <div id="vis-mov-circular" class="trig-circle-root" style="max-width:380px;height:320px;margin:.8rem auto"></div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Referência rápida</h2>
  <table class="vtab mono" style="width:100%;margin:.5rem 0">
    <thead><tr><th>Voltas</th><th>Graus</th><th>Radianos</th><th>O que acontece</th></tr></thead>
    <tbody>
      <tr><td>¼ volta</td><td>90°</td><td>π/2</td><td>P no topo (máximo)</td></tr>
      <tr><td>½ volta</td><td>180°</td><td>π</td><td>P no lado esquerdo</td></tr>
      <tr><td>¾ volta</td><td>270°</td><td>3π/2</td><td>P no fundo (mínimo)</td></tr>
      <tr><td>1 volta</td><td>360°</td><td>2π</td><td>P volta ao início</td></tr>
    </tbody>
  </table>
</section>

<div class="box think">
  <p><strong>Por que π radianos = 180°?</strong></p>
  <p>A circunferência de um círculo de raio r é 2πr. Se "dobrarmos" o raio sobre a borda, cada 1 radiano cobre um arco de comprimento r. Uma volta inteira (circunferência) tem 2π raios — daí 2π rad = 360°, ou seja, π rad = 180°.</p>
</div>

`;
  }
},

/* ═══════════════════════════════════════════════════════════
   AULA 2 — O Círculo Trigonométrico
   ═══════════════════════════════════════════════════════════ */
{
  id: "trig-circulo-trig",
  title: "O Círculo Trigonométrico",
  render(c) {
    cleanupLesson();
    c.innerHTML = `
<section class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · Aula 2</div>
  <h1 class="al-title">O Círculo Trigonométrico: Nosso Mapa de Referência</h1>
  <p class="al-subtitle">O guia fundamental para entender seno, cosseno e tangente</p>
</section>

<div class="def">
  <div class="def-h">O que é o círculo trigonométrico?</div>
  <p>É um círculo de <strong>raio 1</strong> centrado na origem $(0, 0)$ do plano cartesiano. Qualquer ponto P na borda desse círculo tem coordenadas que são, respectivamente, o cosseno e o seno de um ângulo θ.</p>
  <p style="margin-top:.5rem">$$P = (\\cos\\theta,\\; \\sin\\theta)$$</p>
</div>

<div class="box think">
  <p><strong>Por que raio = 1?</strong></p>
  <p>Se o raio fosse qualquer valor r, as coordenadas seriam $(r\\cos\\theta,\\; r\\sin\\theta)$. Com r = 1, as coordenadas <em>já são</em> o seno e o cosseno — sem precisar dividir por nada. Tudo fica entre −1 e 1, e as contas ficam limpas.</p>
</div>

<section class="lesson-section">
  <h2 class="lesson-h2">Interativo — Círculo Trigonométrico</h2>
  <p>Arraste o ponto P ao redor do círculo. Observe como as projeções nos eixos representam cos θ (eixo x) e sen θ (eixo y). Quando P está nos pontos notáveis, os valores exatos aparecem.</p>
  <div id="vis-ct-geral" class="trig-circle-root" style="max-width:400px;height:360px;margin:.8rem auto"></div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Sinais por quadrante — pense, não decore</h2>
  <ul style="line-height:2;padding-left:1.3rem">
    <li><strong>Direita → cosseno positivo</strong> (x > 0)</li>
    <li><strong>Esquerda → cosseno negativo</strong> (x < 0)</li>
    <li><strong>Acima → seno positivo</strong> (y > 0)</li>
    <li><strong>Abaixo → seno negativo</strong> (y < 0)</li>
  </ul>
  <p>Tangente = sin ÷ cos. É positiva quando os dois têm o mesmo sinal (Q1 e Q3), negativa quando têm sinais opostos (Q2 e Q4).</p>
</section>

<div class="def">
  <div class="def-h">A identidade pitagórica</div>
  <p>P está sempre a distância 1 da origem. Pelo teorema de Pitágoras:</p>
  <p>$$\\cos^2\\theta + \\sin^2\\theta = 1$$</p>
  <p>Isso vale para <em>qualquer</em> ângulo θ — é a equação do círculo unitário.</p>
</div>

<section class="lesson-section">
  <h2 class="lesson-h2">Valores notáveis no círculo</h2>
  <table class="vtab mono" style="width:100%;margin:.5rem 0">
    <thead><tr><th>θ</th><th>0</th><th>π/6</th><th>π/4</th><th>π/3</th><th>π/2</th><th>π</th><th>3π/2</th></tr></thead>
    <tbody>
      <tr><th>cos θ</th><td>1</td><td>√3/2</td><td>√2/2</td><td>1/2</td><td>0</td><td>−1</td><td>0</td></tr>
      <tr><th>sin θ</th><td>0</td><td>1/2</td><td>√2/2</td><td>√3/2</td><td>1</td><td>0</td><td>−1</td></tr>
    </tbody>
  </table>
</section>

`;
    autoRender(c);
    const visRoot = c.querySelector("#vis-ct-geral");
    const circ = mountTrigCircle(visRoot, {
      initialTheta: Math.PI / 4,
      showTan: true,
      showProj: true,
      showQuadrants: true,
      showNotable: true,
    });
    _activeControllers.push(circ);
  }
},

/* ═══════════════════════════════════════════════════════════
   AULA 3 — Ângulos em Qualquer Posição
   ═══════════════════════════════════════════════════════════ */
{
  id: "trig-angulos-qualquer",
  title: "Ângulos em Qualquer Posição",
  render(c) {
    cleanupLesson();
    c.innerHTML = `
<section class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · Aula 3</div>
  <h1 class="al-title">Ângulos em Qualquer Posição: Indo Além de 90°</h1>
  <p class="al-subtitle">Ângulos na posição padrão e como encontrar equivalentes</p>
</section>

<div class="def">
  <div class="def-h">Posição padrão de um ângulo</div>
  <p>Um ângulo está em <strong>posição padrão</strong> quando:</p>
  <ul style="line-height:2;padding-left:1.3rem">
    <li>Seu vértice está na <strong>origem</strong> (0, 0)</li>
    <li>Seu lado inicial está no <strong>eixo x positivo</strong></li>
    <li>Seu lado final aponta para o ponto P no círculo</li>
  </ul>
  <p>Medimos o ângulo no sentido <strong>anti-horário</strong> (positivo) ou <strong>horário</strong> (negativo).</p>
</div>

<section class="lesson-section">
  <h2 class="lesson-h2">Interativo — Arraste P por todos os quadrantes</h2>
  <p>Arraste o ponto P ao redor do círculo e observe: o ângulo pode ser maior que 90°, maior que 180°, pode ser negativo. As coordenadas de P mudam conforme o quadrante.</p>
  <div id="vis-angulos" class="trig-circle-root" style="max-width:400px;height:360px;margin:.8rem auto"></div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Ângulos cotermiais — mesmos pontos, nomes diferentes</h2>
  <p>Dois ângulos são <strong>cotermiais</strong> quando terminam no mesmo ponto do círculo. Para encontrar ângulos cotermiais, some ou subtraia voltas completas (360° ou 2π rad).</p>
  <div class="box apply">
    <p><strong>Exemplo:</strong> 30°, 390°, −330°, 750° são todos cotermiais.</p>
    <p>$390° = 30° + 360°$ · $-330° = 30° - 360°$ · $750° = 30° + 2 × 360°$</p>
  </div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Ângulos negativos</h2>
  <p>Um ângulo negativo significa que giramos no sentido <strong>horário</strong> (para baixo primeiro). Os senos e cossenos seguem as mesmas regras — apenas os sinais mudam conforme o quadrante.</p>
  <ul style="line-height:2;padding-left:1.3rem">
    <li>$\\cos(-\\theta) = \\cos(\\theta)$ — cosseno é <strong>par</strong></li>
    <li>$\\sin(-\\theta) = -\\sin(\\theta)$ — seno é <strong>ímpar</strong></li>
  </ul>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Ângulos maiores que 360°</h2>
  <p>Quando um ângulo passa de 360°, o ponto P já completou uma ou mais voltas. Para encontrar onde ele está, basta calcular o <strong>resto da divisão por 360°</strong> (ou por 2π em radianos).</p>
  <div class="box solved">
    <p><strong>Exemplo:</strong> 800°</p>
    <p>$800° ÷ 360° = 2$ voltas com resto $80°$. Então 800° é cotermial com 80° — está no 1º quadrante.</p>
  </div>
</section>

`;
    autoRender(c);
    const visRoot = c.querySelector("#vis-angulos");
    const circ = mountTrigCircle(visRoot, {
      initialTheta: Math.PI / 6,
      showTan: true,
      showProj: true,
      showQuadrants: true,
      showNotable: true,
    });
    _activeControllers.push(circ);
  }
},

/* ═══════════════════════════════════════════════════════════
   AULA 4 — A Função Seno
   ═══════════════════════════════════════════════════════════ */
{
  id: "trig-funcao-seno",
  title: "A Função Seno",
  render(c) {
    cleanupLesson();
    c.innerHTML = `
<section class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · Aula 4</div>
  <h1 class="al-title">A Função Seno: A Altura do Movimento</h1>
  <p class="al-subtitle">Como a posição vertical se transforma em uma função</p>
</section>

<div class="def">
  <div class="def-h">f(x) = sin(x) — a função que nasce do círculo</div>
  <p>Imagine o ponto P girando no círculo trigonométrico. A cada ângulo x, a <strong>altura</strong> de P (sua coordenada y) é o valor de sen(x).</p>
  <ul style="line-height:2.2">
    <li><strong>Domínio: ℝ</strong> — funciona para qualquer ângulo</li>
    <li><strong>Imagem: [−1, 1]</strong> — a altura nunca passa de 1 nem de −1</li>
    <li><strong>Período: 2π</strong> — depois de uma volta, tudo se repete</li>
    <li><strong>f(0) = 0</strong> — começa em zero (P no eixo x)</li>
  </ul>
</div>

<section class="lesson-section">
  <h2 class="lesson-h2">Os 5 pontos que constroem o gráfico</h2>
  <p>Divida o período em 4 partes iguais. Estes 5 pontos bastam para esboçar a onda senoidal:</p>
  <table class="vtab mono" style="width:100%;margin:.5rem 0">
    <thead><tr><th>x</th><th>0</th><th>π/2</th><th>π</th><th>3π/2</th><th>2π</th></tr></thead>
    <tbody>
      <tr><th>Posição de P</th><td>início</td><td>topo</td><td>saída</td><td>fundo</td><td>volta</td></tr>
      <tr><th>sin(x)</th><td><strong>0</strong></td><td><strong>1</strong></td><td><strong>0</strong></td><td><strong>−1</strong></td><td><strong>0</strong></td></tr>
    </tbody>
  </table>
  <p>Padrão: <strong>zero → máximo → zero → mínimo → zero</strong>. Conecte com uma curva suave.</p>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Interativo — Círculo Trigonométrico → Gráfico de seno</h2>
  <p>O painel esquerdo mostra o círculo trigonométrico. O painel direito mostra o gráfico de seno sendo "desenrolado" conforme P gira. A linha horizontal conecta a altura de P no círculo ao ponto correspondente no gráfico.</p>
  <div id="vis-c2g-seno" style="width:100%;max-width:700px;min-height:300px;margin:.8rem auto"></div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Crescimento, decrescimento e simetria</h2>
  <ul style="line-height:2;padding-left:1.3rem">
    <li><strong>Sobe</strong> de −π/2 a π/2 (P subindo do fundo ao topo)</li>
    <li><strong>Desce</strong> de π/2 a 3π/2 (P descendo do topo ao fundo)</li>
  </ul>
  <div class="box think">
    <p>A função seno é <strong>ímpar</strong>: $\\sin(-x) = -\\sin(x)$. O gráfico tem simetria de ponto em relação à origem.</p>
  </div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Laboratório — Explore parâmetros de seno</h2>
  ${labSlot("lab-seno")}
</section>

`;
    autoRender(c);
    const ctgSin = mountCircleToGraph(c.querySelector("#vis-c2g-seno"), {
      functions: ["sin"],
      autoPlay: true,
      speed: 0.5,
    });
    _activeControllers.push(ctgSin);

    mountLab(c.querySelector("#lab-seno"), {
      base: "y = A·sin(B·x + C) + D",
      vars: [
        { sym: "A", papel: "amplitude", limites: "A > 0", efeito: "máx = D+A · mín = D−A" },
        { sym: "B", papel: "frequência", limites: "B > 0", efeito: "período = 2π/B" },
        { sym: "C", papel: "fase", limites: "real", efeito: "desloca horizontalmente" },
        { sym: "D", papel: "deslocamento vertical", limites: "real", efeito: "sobe/desce o eixo central" },
      ],
      piAxis: true,
      start: "y = sin(x)",
      view: { xmin: -2 * Math.PI, xmax: 2 * Math.PI, ymin: -2.5, ymax: 2.5 },
      examples: ["y = sin(x)", "y = 2*sin(x)", "y = sin(2*x)", "y = sin(x + π/2)", "y = sin(x) + 1"],
    });
  }
},

/* ═══════════════════════════════════════════════════════════
   AULA 5 — A Função Cosseno
   ═══════════════════════════════════════════════════════════ */
{
  id: "trig-funcao-cosseno",
  title: "A Função Cosseno",
  render(c) {
    cleanupLesson();
    c.innerHTML = `
<section class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · Aula 5</div>
  <h1 class="al-title">A Função Cosseno: A Distância Horizontal</h1>
  <p class="al-subtitle">O companheiro do seno — mesma forma, ponto de partida diferente</p>
</section>

<div class="def">
  <div class="def-h">A única diferença que importa: o ponto de partida</div>
  <p>Compare os dois no instante x = 0:</p>
  <ul style="line-height:2">
    <li>sin(0) = 0 → <strong>seno começa em zero</strong></li>
    <li>cos(0) = 1 → <strong>cosseno começa no máximo</strong></li>
  </ul>
  <p>Todo o resto é idêntico: mesma forma de onda, mesmo período 2π, mesma imagem [−1, 1].</p>
</div>

<section class="lesson-section">
  <h2 class="lesson-h2">Tabela comparativa — seno vs cosseno</h2>
  <table class="vtab mono" style="width:100%;margin:.5rem 0">
    <thead><tr><th>x</th><th>0</th><th>π/2</th><th>π</th><th>3π/2</th><th>2π</th></tr></thead>
    <tbody>
      <tr><th>sin(x)</th><td>0</td><td><strong>1</strong></td><td>0</td><td><strong>−1</strong></td><td>0</td></tr>
      <tr><th>cos(x)</th><td><strong>1</strong></td><td>0</td><td><strong>−1</strong></td><td>0</td><td><strong>1</strong></td></tr>
    </tbody>
  </table>
  <div class="box think">
    <p>Note que as linhas são iguais, mas deslocadas de π/2. De fato: $\\cos(x) = \\sin\\!\\left(x + \\dfrac{\\pi}{2}\\right)$.</p>
  </div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Interativo — Círculo → Gráfico de cosseno</h2>
  <p>Agora observe a <strong>posição horizontal</strong> de P sendo projetada no gráfico. O cosseno começa no máximo (1) quando x = 0 e segue a mesma onda do seno, mas defasada.</p>
  <div id="vis-c2g-cos" style="width:100%;max-width:700px;min-height:300px;margin:.8rem auto"></div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Paridade e simetria</h2>
  <p>O cosseno é uma função <strong>par</strong>: $\\cos(-x) = \\cos(x)$. O gráfico é simétrico em relação ao eixo y.</p>
  <ul style="line-height:2;padding-left:1.3rem">
    <li><strong>Decresce</strong> de 0 a π (P saindo do lado direito para o esquerdo)</li>
    <li><strong>Cresce</strong> de π a 2π (P voltando para o lado direito)</li>
  </ul>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Laboratório — Explore parâmetros de cosseno</h2>
  ${labSlot("lab-cos")}
</section>

`;
    autoRender(c);
    const ctgCos = mountCircleToGraph(c.querySelector("#vis-c2g-cos"), {
      functions: ["cos"],
      autoPlay: true,
      speed: 0.5,
    });
    _activeControllers.push(ctgCos);

    mountLab(c.querySelector("#lab-cos"), {
      base: "y = A·cos(B·x + C) + D",
      vars: [
        { sym: "A", papel: "amplitude", limites: "A > 0", efeito: "máx = D+A · mín = D−A" },
        { sym: "B", papel: "frequência", limites: "B > 0", efeito: "período = 2π/B" },
        { sym: "C", papel: "fase", limites: "real", efeito: "desloca horizontalmente" },
        { sym: "D", papel: "eixo central", limites: "real", efeito: "translação vertical" },
      ],
      piAxis: true,
      start: "y = cos(x)",
      view: { xmin: -2 * Math.PI, xmax: 2 * Math.PI, ymin: -2.5, ymax: 2.5 },
      examples: ["y = cos(x)", "y = 2*cos(x)", "y = cos(2*x)", "y = cos(x - π/3)", "y = cos(x) - 1"],
    });
  }
},

/* ═══════════════════════════════════════════════════════════
   AULA 6 — A Função Tangente
   ═══════════════════════════════════════════════════════════ */
{
  id: "trig-funcao-tangente",
  title: "A Função Tangente",
  render(c) {
    cleanupLesson();
    c.innerHTML = `
<section class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · Aula 6</div>
  <h1 class="al-title">A Função Tangente: A Razão Sinusoidal</h1>
  <p class="al-subtitle">A função que não tem limites — e por quê</p>
</section>

<div class="def">
  <div class="def-h">Definição e intuição geométrica</div>
  <p>$$\\tan(x) = \\dfrac{\\sin(x)}{\\cos(x)}$$</p>
  <p>Geometricamente: no círculo trigonométrico, trace uma linha vertical em x = 1 (tangente ao círculo). Estenda o raio até essa linha. A altura onde o raio toca essa linha é a tangente.</p>
  <p>Quando o raio aponta quase para cima (x → π/2), a tangente vai ao infinito. Isso acontece porque cos(π/2) = 0 — e dividir por zero não existe.</p>
</div>

<section class="lesson-section">
  <h2 class="lesson-h2">Interativo — Tangente no círculo e no gráfico</h2>
  <p>O painel esquerdo mostra a construção geométrica da tangente no círculo. O painel direito mostra o gráfico de tan(x) com suas assíntotas verticais. Arraste o ponto e observe a tangente crescendo até infinito.</p>
  <div id="vis-tangente" style="width:100%;max-width:700px;height:320px;margin:.8rem auto"></div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Por que a tangente "explode"?</h2>
  <p>Quando $\\cos(x) = 0$ (em x = π/2, 3π/2, −π/2, …), a divisão sen/ cos não existe. Nesses pontos aparecem <strong>assíntotas verticais</strong>.</p>
  <div class="box think">
    <p>Diferente do seno e cosseno que ficam entre −1 e 1, a tangente pode assumir <strong>qualquer valor real</strong>. Imagem = ℝ.</p>
  </div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Propriedades</h2>
  <ul style="line-height:2.2;padding-left:1.3rem">
    <li><strong>Domínio:</strong> todos os reais exceto x = π/2 + kπ</li>
    <li><strong>Imagem:</strong> ℝ (qualquer valor)</li>
    <li><strong>Período: π</strong> — metade do seno e cosseno</li>
    <li><strong>Sempre crescente</strong> em cada ramo</li>
    <li><strong>Função ímpar:</strong> tan(−x) = −tan(x)</li>
  </ul>
  <div class="box apply">
    <p><strong>Valores notáveis:</strong></p>
    <table class="vtab mono" style="margin:.3rem 0">
      <thead><tr><th>θ</th><th>0°</th><th>30°</th><th>45°</th><th>60°</th><th>90°</th></tr></thead>
      <tbody><tr><th>tan θ</th><td>0</td><td>√3/3</td><td>1</td><td>√3</td><td>∄</td></tr></tbody>
    </table>
    <p>tan(45°) = 1 porque sin(45°) = cos(45°). tan(90°) não existe porque cos(90°) = 0.</p>
  </div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Laboratório — Explore parâmetros de tangente</h2>
  ${labSlot("lab-tan")}
</section>

`;
    autoRender(c);
    const tv = mountTangentVis(c.querySelector("#vis-tangente"), {
      initialTheta: Math.PI / 4,
      showGraph: true,
    });
    _activeControllers.push(tv);

    mountLab(c.querySelector("#lab-tan"), {
      base: "y = A·tan(B·x + C) + D",
      vars: [
        { sym: "A", papel: "escala vertical", limites: "A ≠ 0", efeito: "não é amplitude (imagem é ℝ) — só estica" },
        { sym: "B", papel: "frequência", limites: "B > 0", efeito: "período = π/B" },
        { sym: "C", papel: "fase", limites: "real", efeito: "desloca as assíntotas horizontalmente" },
      ],
      piAxis: true,
      start: "y = tan(x)",
      view: { xmin: -Math.PI, xmax: Math.PI, ymin: -4, ymax: 4 },
      examples: ["y = tan(x)", "y = 2*tan(x)", "y = tan(2*x)", "y = tan(x - π/4)"],
    });
  }
},

/* ═══════════════════════════════════════════════════════════
   AULA 7 — Periocidade
   ═══════════════════════════════════════════════════════════ */
{
  id: "trig-periocidade",
  title: "Periocidade",
  render(c) {
    cleanupLesson();
    c.innerHTML = `
<section class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · Aula 7</div>
  <h1 class="al-title">Periocidade: O Ritmo das Funções Trigonométricas</h1>
  <p class="al-subtitle">Como as ondas se repetem e se transformam</p>
</section>

<div class="def">
  <div class="def-h">O que é uma função periódica?</div>
  <p>Uma função é <strong>periódica</strong> se existe um valor T > 0 tal que:</p>
  <p>$$f(x + T) = f(x) \\quad \\text{para todo } x$$</p>
  <p>O menor valor T que satisfaz essa condição é o <strong>período</strong>. Depois de T unidades, tudo se repete.</p>
</div>

<section class="lesson-section">
  <h2 class="lesson-h2">Os períodos das três funções</h2>
  <table class="vtab mono" style="width:100%;margin:.5rem 0">
    <thead><tr><th>Função</th><th>Período</th><th>Significado</th></tr></thead>
    <tbody>
      <tr><td>sin(x)</td><td><strong>2π</strong></td><td>Uma volta completa no círculo</td></tr>
      <tr><td>cos(x)</td><td><strong>2π</strong></td><td>Uma volta completa no círculo</td></tr>
      <tr><td>tan(x)</td><td><strong>π</strong></td><td>Metade — cada ramo se repete a cada π</td></tr>
    </tbody>
  </table>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Interativo — Transforme a onda</h2>
  <p>Use os sliders para alterar os parâmetros de $y = A \\cdot \\text{sen}(Bx + C) + D$. Observe como cada parâmetro afeta a forma da onda, o período e a posição.</p>
  <div id="vis-param-seno" style="width:100%;max-width:700px;height:400px;margin:.8rem auto"></div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">O que cada parâmetro faz</h2>
  <div class="box apply">
    <p><strong>A — Amplitude:</strong> Controla a "altura" da onda. Máximo = D + A, mínimo = D − A.</p>
  </div>
  <div class="box apply">
    <p><strong>B — Frequência angular:</strong> Controla o período. $T = \\dfrac{2\\pi}{B}$. Se B = 2, o período é π (mais ondas no mesmo espaço).</p>
  </div>
  <div class="box apply">
    <p><strong>C — Fase:</strong> Desloca a onda horizontalmente. $-\\dfrac{C}{B}$ é o deslocamento.</p>
  </div>
  <div class="box apply">
    <p><strong>D — Deslocamento vertical:</strong> Sobe ou desce o eixo central da onda.</p>
  </div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Exemplo completo</h2>
  <div class="box solved">
    <p><strong>Questão:</strong> Qual é o período de $f(x) = 3\\sin(2x + \\pi/4) - 1$?</p>
    <p><strong>Resposta:</strong> O período depende só de B = 2: $T = \\dfrac{2\\pi}{2} = \\pi$.</p>
    <p>A amplitude é A = 3 (máximo = −1 + 3 = 2, mínimo = −1 − 3 = −4).</p>
    <p>O eixo central está em D = −1.</p>
  </div>
</section>

`;
    autoRender(c);
    const tpe = mountTrigParamExplorer(c.querySelector("#vis-param-seno"), {
      funcType: "sin",
      A: 1,
      B: 1,
      C: 0,
      D: 0,
      showMarkers: true,
      showPeriod: true,
      showRange: true,
    });
    _activeControllers.push(tpe);
  }
},

/* ═══════════════════════════════════════════════════════════
   AULA 8 — Aplicações
   ═══════════════════════════════════════════════════════════ */
{
  id: "trig-aplicacoes",
  title: "Aplicações",
  render(c) {
    cleanupLesson();
    c.innerHTML = `
<section class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · Aula 8</div>
  <h1 class="al-title">Aplicações: Ondas Sonoras, Luz e Movimento</h1>
  <p class="al-subtitle">A trigonometria no mundo real — som, luz e marés</p>
</section>

<div class="def">
  <div class="def-h">Funções trigonométricas estão em toda parte</div>
  <p>As mesmas ondas senoidais que desenhamos no quadro são usadas para modelar som, luz, temperatura, marés, eletricidade e muito mais. A trigonometria não é abstrata — é a linguagem que a natureza usa para descrever fenômenos periódicos.</p>
</div>

<section class="lesson-section">
  <h2 class="lesson-h2">Ondas sonoras — o que é um som?</h2>
  <p>Um som é uma vibração que se propaga pelo ar. A <strong>frequência</strong> determina o tom (grave ou agudo). A <strong>amplitude</strong> determina o volume.</p>
  <ul style="line-height:2;padding-left:1.3rem">
    <li>Nota Lá (la): 440 Hz → 440 oscilações por segundo</li>
    <li>Grave: ~100 Hz · Agudo: ~4000 Hz</li>
    <li>Limite humano: ~20 Hz a ~20.000 Hz</li>
  </ul>
  <p>Uma onda sonora pode ser modelada por $y = A \\cdot \\sin(2\\pi f \\cdot t)$, onde f é a frequência.</p>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Interativo — Movimento Harmônico Simples (mola)</h2>
  <p>Uma massa presa a uma mola oscila de forma senoidal. A posição da massa em função do tempo segue $x(t) = A \\cos(\\omega t)$. Ajuste amplitude, frequência e fase.</p>
  <div id="vis-sho" style="width:100%;max-width:700px;min-height:320px;margin:.8rem auto"></div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Luz — ondas eletromagnéticas</h2>
  <p>A luz visível é uma onda eletromagnética. A <strong>cor</strong> depende da frequência:</p>
  <ul style="line-height:2;padding-left:1.3rem">
    <li>Vermelho: ~4,3 × 10¹⁴ Hz (menor frequência visível)</li>
    <li>Violeta: ~7,5 × 10¹⁴ Hz (maior frequência visível)</li>
  </ul>
  <p>O campo elétrico da luz oscila senoidalmente no espaço e no tempo.</p>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Corrente alternada — eletricidade em casa</h2>
  <p>A energia elétrica que chega à sua casa é uma <strong>corrente alternada (AC)</strong> — a tensão oscila como uma onda senoidal.</p>
  <ul style="line-height:2;padding-left:1.3rem">
    <li>No Brasil: 60 Hz (60 oscilações por segundo)</li>
    <li>Tensão: 127 V ou 220 V (valores eficazes)</li>
    <li>Pico: ~170 V (127 × √2) ou ~311 V (220 × √2)</li>
  </ul>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Interativo — Corrente Alternada</h2>
  <p>Observe a oscilação da tensão AC ao longo do tempo. Ajuste amplitude (tensão máxima), frequência e fase.</p>
  <div id="vis-ac" style="width:100%;max-width:700px;min-height:320px;margin:.8rem auto"></div>
</section>

<section class="lesson-section">
  <h2 class="lesson-h2">Temperatura — ciclo diário e anual</h2>
  <p>A temperatura ao longo do dia segue aproximadamente uma curva cossenoidal: mínima ao amanhecer, máxima no início da tarde.</p>
  <div id="vis-temp" style="width:100%;max-width:700px;min-height:320px;margin:.8rem auto"></div>
</section>

<div class="box think">
  <p><strong>A unificadora:</strong> Em todos esses exemplos — mola, corrente, temperatura, som — a mesma função seno/cosseno descreve o fenômeno. O que muda são os <strong>parâmetros</strong>: amplitude, frequência, fase. Essa é a poder da trigonometria: uma única ferramenta para infinitos fenômenos periódicos.</p>
</div>

`;
    autoRender(c);

    const pvSho = mountPeriodicVis(c.querySelector("#vis-sho"), "sho", {
      amplitude: 1,
      frequency: 1,
      phase: 0,
    });
    const pvAc = mountPeriodicVis(c.querySelector("#vis-ac"), "ac", {
      amplitude: 1,
      frequency: 1,
      phase: 0,
    });
    const pvTemp = mountPeriodicVis(c.querySelector("#vis-temp"), "temp", {
      amplitude: 5,
      frequency: 1,
      phase: 0,
    });
    _activeControllers.push(pvSho, pvAc, pvTemp);
  }
},

];

/* ── Expose cleanup for navigation hook ──────────────────── */
export { cleanupLesson };
