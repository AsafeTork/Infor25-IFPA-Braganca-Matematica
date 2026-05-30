/* ============================================================
   features/exponencial/index.js  —  Capítulo 2 · Função exponencial
   Conteúdo derivado do livro (pp. 20–35): conceito, gráfico,
   crescimento/decrescimento, comparação com o linear, aplicações
   (divisão celular, covid-19, juros), equações exponenciais.
   ============================================================ */
import { autoRender } from "../../components/katex.js";
import { section, def, think, explore, solved, apply, labSlot } from "../../utils/content.js";
import { mountLab } from "../../components/formulaLab.js";
import { mountQuizSet } from "../../components/quiz.js";
import { Plot } from "../../core/plotEngine.js";

/* ---------- 2.1 Conceito ---------- */
const conceito = {
  id: "exp-conceito",
  title: "Conceito de função exponencial",
  render(c) {
    c.innerHTML = section("2 · Função exponencial", "Quando a variável está no expoente", `
        <p>Ao estudar a função afim, vimos o <b>crescimento linear</b> (aumento constante). Na divisão celular
        uma célula vira duas, duas viram quatro… o número de células não cresce somando, mas <b>multiplicando</b>.
        Esse é o crescimento exponencial.</p>` +
        def("Definição", `Dado um real $a$ com $a>0$ e $a\\ne1$, a função
          $f:\\mathbb{R}\\to\\mathbb{R}_{+}^{*}$ dada por $$f(x)=a^{x}$$ é a <b>função exponencial de base $a$</b>.
          Aqui $x$ é a variável (expoente) e $a$ é a base (fixa).`) +
        think(`<ol>
          <li>Por que a base não pode ser negativa, nula ou igual a $1$? Teste $a=1$: o que acontece com $f$?</li>
          <li>Em quais funções, ao aumentar $x$, as imagens aumentam? E em quais diminuem? Compare $f(x)=2^{x}$ e $f(x)=(0{,}2)^{x}$.</li>
        </ol>`) +
        solved(`Para $f(x)=3^{x}$, calcule $S=f(0)+f(1)+f(2)+f(3)$:
          $$S = 3^{0}+3^{1}+3^{2}+3^{3} = 1+3+9+27 = 40.$$`) +
        `<p>Experimente. Mude a base $a$ e observe o painel de leitura — o intercepto em $(0,1)$ nunca muda:</p>` +
        labSlot("lab-conceito"));
    autoRender(c);
    mountLab(c.querySelector("#lab-conceito"), {
      base: "f(x) = a^{x}",
      params: [{ k: "a", name: "base ($a>0,\\ a\\ne1$)", default: 2 }],
      start: "y = 2^x",
      view: { xmin: -4, xmax: 4, ymin: -1, ymax: 9 },
      examples: ["y = 2^x", "y = 3^x", "y = π^x", "y = (1/2)^x", "y = (1/3)^x"],
    });
  },
};

/* ---------- 2.2 Gráfico, crescimento × decrescimento ---------- */
const grafico = {
  id: "exp-grafico",
  title: "Gráfico: crescer × decrescer",
  render(c) {
    c.innerHTML = section("2 · Função exponencial", "Lendo o comportamento no plano", `
        <p>Atribuindo valores a $x$ e calculando $y=a^{x}$, esboçamos o gráfico. Comparando vários casos, conclui-se:</p>` +
        def("Características de $f(x)=a^{x}$", `
          <ul>
            <li>Se $a>1$: <b>crescente</b> — $x_1<x_2 \\Rightarrow a^{x_1}<a^{x_2}$.</li>
            <li>Se $0<a<1$: <b>decrescente</b> — $x_1<x_2 \\Rightarrow a^{x_1}>a^{x_2}$.</li>
            <li>Sempre passa por $(0,1)$, pois $a^{0}=1$.</li>
            <li>Domínio $=\\mathbb{R}$; imagem $=\\mathbb{R}_{+}^{*}$ (nunca toca o eixo $x$).</li>
            <li>O eixo $x$ ($y=0$) é uma <b>assíntota horizontal</b>.</li>
          </ul>`) +
        think(`<ol>
          <li>Os gráficos de $2^{x}$ e $(1/2)^{x}$ têm o mesmo domínio? E a mesma imagem? São simétricos em relação a qual eixo?</li>
          <li>Eles interceptam o eixo das abscissas ($x$)? E o das ordenadas ($y$)? <b>(resp.: não; sim, em $(0,1)$)</b></li>
        </ol>`) +
        `<p>Use a base como parâmetro. Para $a>1$ a curva sobe; para $0<a<1$ ela desce. A linha tracejada é a assíntota:</p>` +
        labSlot("lab-graf"));
    autoRender(c);
    mountLab(c.querySelector("#lab-graf"), {
      base: "f(x) = a^{x}",
      params: [{ k: "a", name: "base", default: 0.5 }],
      start: "y = (1/2)^x",
      view: { xmin: -4, xmax: 4, ymin: -1, ymax: 9 },
      examples: ["y = 2^x", "y = (1/2)^x", "y = 3^x", "y = (1/3)^x", "y = 10^x"],
    });
  },
};

/* ---------- 2.3 Exponencial × linear (visual lado a lado) ---------- */
const comparacao = {
  id: "exp-vs-linear",
  title: "Exponencial × linear",
  render(c) {
    c.innerHTML = section("2 · Função exponencial", "Por que o exponencial sempre vence", `
        <p>A função afim $f(x)=5x-1$ gera a sequência $(4,9,14,\\dots)$: aumenta $5$ <em>em cada passo</em>.
        Já $(1,3,9,27,81,\\dots)$ <em>multiplica por $3$</em> a cada passo. No início o linear pode ir à frente,
        mas o exponencial cresce tão rápido que o ultrapassa e nunca mais é alcançado.</p>` +
        `<p>Compare diretamente o crescimento linear (laranja) e o exponencial (amarelo):</p>
        <canvas id="cmp" class="lab-canvas" style="height:360px"></canvas>
        <p class="lab-hint mono">linha reta f(x)=5x · curva g(x)=2^x — arraste e dê zoom</p>` +
        think(`Até cerca de qual valor de $x$ a reta está acima da curva? Depois desse ponto, quem domina? Por quê?`));
    const p = new Plot(c.querySelector("#cmp"), { xmin: -1, xmax: 9, ymin: -2, ymax: 40 });
    const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    autoRender(c);
    p.setCurves([
      { fn: (x) => 5 * x, color: css("--accent"), label: "5x" },
      { fn: (x) => Math.pow(2, x), color: css("--accent-2"), label: "2^x" },
    ]);
    window.addEventListener("themechange", () => {
      p.setCurves([
        { fn: (x) => 5 * x, color: css("--accent") },
        { fn: (x) => Math.pow(2, x), color: css("--accent-2") },
      ]);
    });
  },
};

/* ---------- 2.4 Aplicações reais ---------- */
const aplicacoes = {
  id: "exp-aplicacoes",
  title: "Aplicações: células, covid, juros",
  render(c) {
    c.innerHTML = section("2 · Função exponencial", "Modelagem matemática do mundo real", `
        ${apply(`<b>Divisão celular / bactérias.</b> Uma célula-mãe duplica seu conteúdo e se divide em duas.
          Partindo de uma célula, após $x$ divisões há $N(x)=2^{x}$ células. É crescimento exponencial puro.`)}
        ${apply(`<b>Covid-19 (início de 2020).</b> Os casos confirmados cresceram de forma <em>não linear</em>:
          em parte do período, o número quase dobrava em intervalos fixos — o retrato de uma exponencial.
          Por isso os gráficos da época pareciam “explodir”.`)}
        ${apply(`<b>Juros compostos.</b> Um salário-base de R\\$\\,1\\,800 com aumento de $3\\%$ ao ano:
          $$s(t)=1800\\cdot(1{,}03)^{t}.$$ A base $1{,}03>1$ garante crescimento exponencial do salário.`)}
        ${solved(`<b>(Uerj)</b> Um imóvel perde $36\\%$ do valor a cada $2$ anos: $V(t)=V_0\\cdot(0{,}64)^{t/2}$.
          Para $V_0=50\\,000$, daqui a $3$ anos:
          $$V(3)=50\\,000\\cdot(0{,}64)^{3/2}=50\\,000\\cdot 0{,}512 = 25\\,600.$$ Decrescimento exponencial ($0<0{,}64<1$).`)}
        <p>Modele você mesmo. A base $&gt;1$ cresce (bactérias, juros); a base $&lt;1$ decai (imóvel, decaimento):</p>
        ${labSlot("lab-app")}`);
    autoRender(c);
    mountLab(c.querySelector("#lab-app"), {
      base: "N(x) = N_{0}\\cdot a^{x}",
      params: [{ k: "N", name: "valor inicial $N_0$", default: 1 }, { k: "a", name: "fator por passo", default: 2 }],
      start: "y = 3·2^x",
      view: { xmin: 0, xmax: 10, ymin: -2, ymax: 60 },
      examples: ["y = N·a^x", "y = 1800·(1.03)^x", "y = 100·(1/2)^x", "y = 2^x"],
    });
  },
};

/* ---------- 2.5 Equações exponenciais ---------- */
const equacoes = {
  id: "exp-equacoes",
  title: "Equações exponenciais",
  render(c) {
    c.innerHTML = section("2 · Função exponencial", "A incógnita no expoente", `
        <p>Uma <b>equação exponencial</b> tem a incógnita no expoente de uma potência de base real positiva e $\\ne1$.
        Resolvemos usando as propriedades da potência e o fato de que a exponencial é <b>injetora</b>:</p>
        $$a^{x_1}=a^{x_2}\\iff x_1=x_2 \\quad (a>0,\\ a\\ne1).$$` +
        solved(`Resolva $3^{x}=1$, $3^{x}=3$ e $3^{x}=9$. Igualando bases:
          $$3^{x}=3^{0}\\Rightarrow x=0,\\quad 3^{x}=3^{1}\\Rightarrow x=1,\\quad 3^{x}=3^{2}\\Rightarrow x=2.$$`) +
        solved(`$3^{x+2}+3^{x}=2430$. Fatorando $3^{x}$:
          $$3^{x}(3^{2}+1)=2430 \\Rightarrow 3^{x}\\cdot 10 = 2430 \\Rightarrow 3^{x}=243=3^{5}\\Rightarrow x=5.$$`) +
        explore(`$5^{2x}-6\\cdot5^{x}+5=0$. Faça a substituição $5^{x}=m$, resolva a equação do 2º grau em $m$
          e volte para $x$. Quantas soluções reais existem?`));
    autoRender(c);
  },
};

/* ---------- 2.6 Prática / ENEM ---------- */
const pratica = {
  id: "exp-pratica",
  title: "Prática · vestibular & Enem",
  render(c) {
    c.innerHTML = section("2 · Função exponencial", "Questões para raciocinar", `<div id="q-exp"></div>`);
    autoRender(c);
    mountQuizSet(c.querySelector("#q-exp"), [
      {
        source: "Enem",
        stem: "O piso salarial é R\\$\\,1\\,800 com aumento fixo por ano: $s(t)=1800\\cdot(1{,}03)^{t}$. Com $2$ anos de serviço, o salário será, em reais, aproximadamente:",
        options: ["$7\\,416{,}00$", "$3\\,819{,}24$", "$3\\,709{,}62$", "$3\\,708{,}00$", "$1\\,909{,}62$"],
        answer: 4,
        explain: "$s(2)=1800\\cdot(1{,}03)^{2}=1800\\cdot1{,}0609=1909{,}62$. Cuidado: o expoente $2$ não multiplica, ele aparece como potência.",
      },
      {
        source: "Ulbra-RS",
        stem: "Sobreviventes seguem $N(t)=C\\cdot A^{t}$. Havia $400$ no dia $0$ e $50$ no dia $3$. Quantos no dia $4$?",
        options: ["$40$", "$30$", "$25$", "$20$", "$10$"],
        answer: 2,
        explain: "De $400=C$ e $50=400\\,A^{3}$ vem $A^{3}=\\tfrac18\\Rightarrow A=\\tfrac12$. Então $N(4)=400\\cdot(\\tfrac12)^{4}=400\\cdot\\tfrac1{16}=25$.",
      },
      {
        source: "Livro",
        stem: "Para $f(x)=2\\cdot5^{x}$, vale $f(m+n)=f(m)\\cdot f(n)$ para todos $m,n$?",
        options: ["Sim, sempre", "Não — aparece um fator extra", "Só se $m=n$", "Só se $m+n=0$", "Só se $x>0$"],
        answer: 1,
        explain: "$f(m+n)=2\\cdot5^{m+n}$, mas $f(m)\\cdot f(n)=(2\\cdot5^{m})(2\\cdot5^{n})=4\\cdot5^{m+n}$. Há um fator $2$ a mais, então não vale.",
      },
      {
        source: "Desafio",
        stem: "Na sequência gerada por $f(x)=3\\cdot4^{-x}$, cada termo (a partir do 2º) é o anterior multiplicado por:",
        options: ["$4$", "$3$", "$\\tfrac14$", "$-4$", "$\\tfrac13$"],
        answer: 2,
        explain: "$f(1)=\\tfrac34,\\ f(2)=\\tfrac3{16},\\ f(3)=\\tfrac3{64}$. A razão entre termos consecutivos é $\\tfrac14$ — uma progressão geométrica decrescente.",
      },
    ]);
  },
};

export const exponencialLessons = [conceito, grafico, comparacao, aplicacoes, equacoes, pratica];
export const exponencialMeta = { num: "02", title: "Função exponencial", chapter: "Capítulo 1 · seção 2" };
