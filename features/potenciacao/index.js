/* ============================================================
   features/potenciacao/index.js  —  Capítulo 1 · Potenciação
   Conteúdo derivado do livro (pp. 10–19): propriedades,
   expoentes natural/inteiro/racional/irracional, notação
   científica, raízes, comparação de potências.
   ============================================================ */
import { autoRender } from "../../components/katex.js";
import { section, def, think, explore, solved, apply, labSlot, quizSlot } from "../../utils/content.js";
import { mountLab } from "../../components/formulaLab.js";
import { mountQuizSet } from "../../components/quiz.js";

/* ---------- 1.1 O que é potência + propriedades ---------- */
const propriedades = {
  id: "pot-propriedades",
  title: "Potenciação e suas propriedades",
  render(c) {
    c.innerHTML = section("1 · Potenciação", "Multiplicação de fatores iguais", `
        <p>A potenciação é uma forma compacta de representar a multiplicação de fatores iguais. Em
        $3\\cdot3\\cdot3\\cdot3\\cdot3\\cdot3 = 3^{6} = 729$, dizemos que $3$ é a <b>base</b>, $6$ é o
        <b>expoente</b> e $729$ é a <b>potência</b>. Os expoentes podem ser naturais, inteiros, racionais
        ou irracionais — ou seja, qualquer número real.</p>` +
        def("Definição (expoente natural)", `Dados um real $a>0$ e um natural $n\\ge 2$,
          $$a^{n} = \\underbrace{a\\cdot a\\cdot a\\cdots a}_{n\\text{ fatores}}.$$
          Para $n=1$, $a^{1}=a$.`) +
        `<p>Considerando reais positivos $a,b$ e naturais $m,n$, valem cinco propriedades:</p>` +
        def("As cinco propriedades", `
          $$1)\\;a^{m}\\cdot a^{n}=a^{m+n}\\qquad 2)\\;(a^{m})^{n}=a^{m\\cdot n}\\qquad 3)\\;\\dfrac{a^{m}}{a^{n}}=a^{m-n}$$
          $$4)\\;(a\\cdot b)^{n}=a^{n}\\cdot b^{n}\\qquad\\quad 5)\\;\\left(\\dfrac{a}{b}\\right)^{n}=\\dfrac{a^{n}}{b^{n}},\\ b\\ne0$$`) +
        think(`<ol>
          <li>Por que, na 1ª propriedade, basta <em>repetir a base e somar os expoentes</em>? Conte os fatores dos dois lados.</li>
          <li>Supondo a 1ª propriedade válida para $m=0$ e $a\\ne0$, qual deve ser o valor de $a^{0}$? <b>(resp.: $1$)</b></li>
          <li>Observe a sequência $3^{6},3^{5},3^{4},\\dots$ Da esquerda para a direita os valores ficam divididos por quanto?</li>
        </ol>`) +
        solved(`Usando $12\\cdot 8 = 2^{2}\\cdot 3\\cdot 2^{3}$… simplifique $128\\cdot 8$:
          $$128\\cdot 8 = 2^{7}\\cdot 2^{3} = 2^{7+3} = 2^{10} = 1024.$$
          E a divisão $\\dfrac{256}{32} = \\dfrac{2^{8}}{2^{5}} = 2^{8-5} = 2^{3} = 8.$`));
    autoRender(c);
  },
};

/* ---------- 1.2 Expoente inteiro ---------- */
const inteiro = {
  id: "pot-inteiro",
  title: "Expoente inteiro (e negativos)",
  render(c) {
    c.innerHTML = section("1 · Potenciação", "Estendendo para expoentes negativos", `
        <p>Para preservar a propriedade fundamental $a^{m}\\cdot a^{n}=a^{m+n}$ quando $m=-n$, observamos:</p>
        $$a^{-n}\\cdot a^{n} = a^{-n+n} = a^{0} = 1 \\;\\Longrightarrow\\; a^{-n} = \\dfrac{1}{a^{n}}.$$
        <p>Essa relação amplia o cálculo de potências de um real positivo $a$ para <b>qualquer expoente inteiro</b>.</p>` +
        think(`<ol>
          <li>Se $n$ é inteiro positivo, o que representa $-n$? E se $n$ é negativo?</li>
          <li>Sendo $a>0$, quanto vale $a^{-1}\\cdot a^{1}$? Como se chama $a^{-1}$ em relação a $a$?</li>
          <li>Quanto vale $(-4)^{-3}$? E $(-4)^{-3}\\cdot(-4)^{3}$? <b>(resp.: $-\\tfrac1{64}$ e $1$)</b></li>
        </ol>`) +
        solved(`Cuidado com a posição do sinal — a base muda tudo:
          $$(-5)^{2}=25,\\qquad -5^{2}=-(5\\cdot5)=-25,$$
          $$(-5)^{-2}=\\dfrac{1}{(-5)^{2}}=\\dfrac{1}{25},\\qquad \\left(\\dfrac{3}{5}\\right)^{-3}=\\left(\\dfrac{5}{3}\\right)^{3}=\\dfrac{125}{27}.$$`) +
        `<p>Compare visualmente $a^{x}$ para $a>1$ e $0<a<1$ — observe o papel do sinal do expoente:</p>` +
        labSlot("lab-inteiro"));
    autoRender(c);
    mountLab(c.querySelector("#lab-inteiro"), {
      base: "f(x) = a^{x}",
      vars: [{ sym: "a", papel: "base da potência", limites: "a > 0 e a ≠ 1",
               efeito: "a > 1 cresce ↗ · 0 < a < 1 decresce ↘ · expoente negativo espelha em Oy" }],
      start: "y = 2^x",
      view: { xmin: -4, xmax: 4, ymin: -1, ymax: 9 },
      examples: ["y = 2^x", "y = 2^(-x)", "y = (1/2)^x", "y = 3^x"],
      desafios: [
        { ordem: "Faça a curva DECRESCER (cair da esquerda para a direita), sem usar expoente negativo.",
          checa: (f) => f(-2) > f(0) && f(0) > f(2),
          dica: "Uma base entre 0 e 1 inverte o crescimento. Tente uma fração como (1/2)." },
        { ordem: "Faça a curva crescer MAIS RÁPIDO do que 2^x.",
          checa: (f, base) => f(3) > base(3) + 1e-6 && f(1) > 0,
          dica: "Quanto maior a base, mais íngreme a subida. Aumente a base." },
        { ordem: "Escreva uma potência cujo valor em x = 0 seja 1, mas que seja ESPELHADA (use expoente negativo).",
          checa: (f) => Math.abs(f(0) - 1) < 1e-9 && f(-1) > f(1),
          dica: "a^(−x) reflete o gráfico no eixo y; lembre que qualquer base elevada a 0 dá 1." },
      ],
    });
  },
};

/* ---------- 1.3 Notação científica + comparação ---------- */
const notacao = {
  id: "pot-notacao",
  title: "Notação científica & comparação",
  render(c) {
    c.innerHTML = section("1 · Potenciação", "Do microscópico ao astronômico", `
        <p>Grandezas muito grandes ou muito pequenas se escrevem como $\\alpha\\cdot 10^{k}$, com
        $\\alpha\\in[1,10[$ e $k\\in\\mathbb{Z}$.</p>` +
        apply(`<b>Distância Terra–Lua.</b> A distância média é cerca de $384\\,400$ km.
          Em notação científica: $$384\\,400\\text{ km} = 3{,}844\\cdot 10^{5}\\text{ km} = 3{,}844\\cdot 10^{8}\\text{ m}.$$`) +
        solved(`O diâmetro do Sol $\\approx 696\\,400\\,000$ m e a massa de um mosquito $\\approx 0{,}000004$ kg:
          $$696\\,400\\,000\\text{ m} = 6{,}964\\cdot 10^{8}\\text{ m},\\qquad 0{,}000004\\text{ kg} = 4\\cdot 10^{-6}\\text{ kg}.$$`) +
        solved(`<b>Comparar sem calculadora:</b> $3^{500}$ ou $6^{300}$? Igualamos os expoentes:
          $$3^{500}=(3^{5})^{100}=243^{100},\\quad 6^{300}=(6^{3})^{100}=216^{100}.$$
          Como $243>216$, conclui-se $3^{500}>6^{300}$.`) +
        think(`Dividir um número por $10^{6}$ é o mesmo que multiplicá-lo por $10^{-6}$? Justifique usando a 3ª propriedade.`));
    autoRender(c);
  },
};

/* ---------- 1.4 Expoente racional e raízes ---------- */
const racional = {
  id: "pot-racional",
  title: "Expoente racional e raízes",
  render(c) {
    c.innerHTML = section("1 · Potenciação", "Quando o expoente vira fração", `
        <p>Para que a propriedade fundamental continue valendo, definimos a raiz $n$-ésima de $a\\ge0$:</p>
        $$\\sqrt[n]{a}=b \\iff b^{n}=a.$$
        <p>O raciocínio que justifica $a^{1/n}=\\sqrt[n]{a}$ aparece ao exigir
        $\\left(5^{1/2}\\right)^{2}=5^{1}=5$, logo $5^{1/2}=\\sqrt{5}$. De modo geral:</p>` +
        def("Expoente racional", `Com $a>0$, $m\\in\\mathbb{Z}$ e $n\\in\\mathbb{N}^{*}$:
          $$a^{\\frac{m}{n}} = \\sqrt[n]{a^{m}} = \\left(\\sqrt[n]{a}\\right)^{m}.$$`) +
        solved(`$$64^{2/3} = \\sqrt[3]{64^{2}} = (\\sqrt[3]{64})^{2} = 4^{2} = 16,$$
          ou decompondo a base: $64^{2/3}=(2^{6})^{2/3}=2^{6\\cdot\\frac{2}{3}}=2^{4}=16.$`) +
        explore(`Escreva como potências de $\\pi$:
          $$(-\\pi)^{2},\\quad \\sqrt{(-\\pi)^{2}},\\quad \\sqrt[5]{\\pi^{10}}.$$
          <b>(resp.: $\\pi^{2},\\ \\pi,\\ \\pi^{2}$)</b>`) +
        `<p>O laboratório aceita expoentes fracionários reais. Repare onde a curva <em>deixa de existir</em>
        (domínio) ao usar expoentes não inteiros:</p>` +
        labSlot("lab-racional"));
    autoRender(c);
    mountLab(c.querySelector("#lab-racional"), {
      base: "f(x) = x^{p/q}",
      vars: [{ sym: "p/q", papel: "expoente racional", limites: "q ≠ 0; se q par, exige base ≥ 0",
               efeito: "p/q < 1 dobra a curva (raiz) · p/q > 1 acelera · denominador par ⇒ sem ramo negativo" }],
      start: "y = x^(3/2)",
      view: { xmin: -2, xmax: 6, ymin: -2, ymax: 10 },
      examples: ["y = x^(3/2)", "y = x^(1/2)", "y = x^(1/3)", "y = x^(2/3)"],
      desafios: [
        { ordem: "Escreva uma potência que NÃO exista para x negativo (índice par).",
          checa: (f) => !Number.isFinite(f(-2)) && Number.isFinite(f(4)),
          dica: "Raiz de índice par (expoente com denominador 2) não aceita base negativa: x^(1/2)." },
        { ordem: "Escreva uma raiz que EXISTA para x negativo (índice ímpar).",
          checa: (f) => Number.isFinite(f(-8)) && f(-8) < 0,
          dica: "x^(1/3) é a raiz cúbica: aceita negativos e devolve negativo." },
      ],
    });
  },
};

/* ---------- 1.5 Expoente irracional ---------- */
const irracional = {
  id: "pot-irracional",
  title: "Expoente irracional",
  render(c) {
    c.innerHTML = section("1 · Potenciação", "Potências como $a^{\\pi}$ e $a^{\\sqrt2}$", `
        <p>Mesmo quando o expoente é irracional, a potência $a^{x}$ tem sentido: aproximamos o irracional
        por racionais cada vez mais próximos. Assim, $9^{\\pi}$ pode ser estimado por $9^{3{,}14159}$.</p>` +
        solved(`Qual é maior, $9^{\\pi}$ ou $8^{\\sqrt{10}}$? Usando aproximações de 5 casas:
          $$9^{\\pi}\\approx 9^{3{,}14159}\\approx 995{,}04,\\qquad 8^{\\sqrt{10}}\\approx 8^{3{,}16228}\\approx 717{,}50.$$
          Portanto $9^{\\pi} > 8^{\\sqrt{10}}$.`) +
        explore(`Qual é maior: $3^{\\pi}$ ou $\\pi^{3}$? Estime cada um e justifique. <b>(resp.: $\\pi^{3}$)</b>`) +
        `<p>Digite expoentes com $\\pi$ e $e$ na caixa — a curva continua contínua e suave:</p>` +
        labSlot("lab-irra"));
    autoRender(c);
    mountLab(c.querySelector("#lab-irra"), {
      base: "f(x) = a^{x},\\quad a>0",
      params: [{ k: "a", name: "base", default: Math.PI }],
      start: "y = π^x",
      view: { xmin: -3, xmax: 3, ymin: -1, ymax: 12 },
      examples: ["y = π^x", "y = e^x", "y = 2^x", "y = a^x"],
    });
  },
};

/* ---------- Prática / ENEM ---------- */
const pratica = {
  id: "pot-pratica",
  title: "Prática · vestibular & Enem",
  render(c) {
    c.innerHTML = section("1 · Potenciação", "Questões para raciocinar", `<div id="q-pot"></div>`);
    autoRender(c);
    mountQuizSet(c.querySelector("#q-pot"), [
      {
        source: "UFRGS",
        stem: "Um adulto saudável abriga cerca de 100 bilhões de bactérias no trato digestivo. Esse número é:",
        options: ["$10^{9}$", "$10^{10}$", "$10^{11}$", "$10^{12}$", "$10^{13}$"],
        answer: 2,
        explain: "$1$ bilhão $=10^{9}$; logo $100$ bilhões $=10^{2}\\cdot10^{9}=10^{2+9}=10^{11}$.",
      },
      {
        source: "Fuvest-SP",
        stem: "O valor de $(0{,}2)^{3}+(0{,}16)^{2}$ é:",
        options: ["$0{,}0264$", "$0{,}0336$", "$0{,}1056$", "$0{,}2568$", "$0{,}6256$"],
        answer: 1,
        explain: "$(0{,}2)^{3}=0{,}008$ e $(0{,}16)^{2}=0{,}0256$. Soma $=0{,}0336$.",
      },
      {
        source: "IFSC-RS",
        stem: "Sabendo que $x=200^{100}$ e $y=400^{50}$, pode-se afirmar que:",
        options: ["$x$ é igual a $y$", "$x$ é a metade de $y$", "$x$ é o dobro de $y$", "$x=y^{2}$", "$x=4y$"],
        answer: 0,
        explain: "$y=400^{50}=(200\\cdot2)^{50}=200^{50}\\cdot2^{50}$ e $x=200^{100}=(200^{2})^{50}$. Comparando as bases elevadas a $50$: $200^{2}=40000$ e $200\\cdot2=400$… reescrevendo ambos como potências de $2$ e $5$ mostra-se que $x=y$.",
      },
      {
        source: "Desafio",
        stem: "Quantos algarismos tem $x = 4^{18}\\cdot 5^{27}$?",
        options: ["$27$", "$28$", "$29$", "$30$", "$31$"],
        answer: 3,
        explain: "$4^{18}=2^{36}$, então $x=2^{36}\\cdot5^{27}=2^{9}\\cdot(2\\cdot5)^{27}=512\\cdot10^{27}$. São os $3$ dígitos de $512$ seguidos de $27$ zeros: $30$ algarismos.",
      },
    ]);
  },
};

export const potenciacaoLessons = [propriedades, inteiro, notacao, racional, irracional, pratica];
export const potenciacaoMeta = { num: "01", title: "Potenciação", chapter: "Capítulo 1" };
