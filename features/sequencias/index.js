/* features/sequencias/index.js — Cap 2: Sequências Numéricas */
import { autoRender } from "../../components/katex.js";
import { section, def, think, explore, solved, apply, labSlot, quizSlot } from "../../utils/content.js";
import { mountLab } from "../../components/formulaLab.js";
import { mountQuizSet } from "../../components/quiz.js";

export const sequenciasMeta = { num: "02", title: "Sequências Numéricas", chapter: "Capítulo 2" };

export const sequenciasLessons = [
  /* ──────────── PA ──────────── */
  {
    id: "pa-conceito",
    title: "Progressão Aritmética",
    render(c) {
      c.innerHTML = section("Cap 2 · §1", "Progressão Aritmética",
          def("PA", `$(a_n)$ é PA se $a_{n+1}-a_n=r$ (constante). $r$ = <b>razão</b>.`) +
          `<div class="lesson-section">
            <h2 class="lesson-h2">Fórmulas</h2>
            <p>Termo geral: $$a_n = a_1 + (n-1)r$$</p>
            <p>Soma: $$S_n = \\dfrac{n(a_1+a_n)}{2} = \\dfrac{n\\bigl[2a_1+(n-1)r\\bigr]}{2}$$</p>
          </div>`) +
          think("$(3,8,13,18,\\ldots)$ — razão? 10.º termo? Soma dos 10 primeiros?") +
          solved("Resolução",
            `$r=5$; $a_{10}=3+9\\cdot5=48$; $S_{10}=\\dfrac{10(3+48)}{2}=255$`) +
          `<div class="lesson-section">
            <h2 class="lesson-h2">Laboratório — PA no plano cartesiano</h2>
            <p>$a_n$ em função de $n$ é uma <b>reta</b> com inclinação $r$.</p>` +
          labSlot("lab-pa") + `</div>` +
          quizSlot("quiz-pa");

      autoRender(c);

      mountLab(c.querySelector("#lab-pa"), {
        base: "f(n) = a_1 + (n-1)\\cdot r",
        vars: [
          { sym: "a₁", papel: "primeiro termo", limites: "∈ ℝ", efeito: "intercepto vertical (em n=1)" },
          { sym: "r",  papel: "razão", limites: "∈ ℝ · r=0 sequência constante",
            efeito: "r>0 cresce ↗ · r<0 decresce ↘ · define inclinação da reta" },
        ],
        start: "y = 3 + (x-1)·5",
        view: { xmin: 0, xmax: 12, ymin: -10, ymax: 60 },
        examples: ["y = 3 + (x-1)·5", "y = 10 + (x-1)·(-2)", "y = 1 + (x-1)·7"],
        desafios: [
          { ordem: "Faça uma PA com 5.º termo = 20 e razão 3.",
            checa: f => Math.abs(f(5)-20)<1e-6 && Math.abs(f(6)-f(5)-3)<1e-6,
            dica: "a₅=a₁+4r=20. r=3 ⇒ a₁=8. Escreva: y = 8 + (x−1)·3" },
          { ordem: "Crie uma PA decrescente que comece em 50.",
            checa: f => Math.abs(f(1)-50)<1e-6 && f(2)<f(1),
            dica: "Razão negativa: y = 50 + (x−1)·(−4)" },
        ],
      });

      mountQuizSet(c.querySelector("#quiz-pa"), [
        { q: "15.º termo de $(3,7,11,\\ldots)$?",
          opts:["$59$","$55$","$63$","$56$","$60$"], ans:0,
          expl:"$r=4$; $a_{15}=3+14\\cdot4=59$" },
        { q: "PA com $a_1=1, r=2$. Soma dos 20 primeiros termos?",
          opts:["$400$","$380$","$420$","$360$","$440$"], ans:0,
          expl:"$a_{20}=39$; $S_{20}=\\frac{20\\cdot40}{2}=400$" },
        { q: "Entre 5 e 29 inserem-se 3 meios aritméticos. Razão?",
          opts:["$6$","$8$","$4$","$5$","$7$"], ans:0,
          expl:"5 termos: $29=5+4r\\Rightarrow r=6$" },
      ]);
    }
  },

  /* ──────────── PG ──────────── */
  {
    id: "pg-conceito",
    title: "Progressão Geométrica",
    render(c) {
      c.innerHTML = section("Cap 2 · §2", "Progressão Geométrica",
          def("PG", `$(a_n)$ é PG se $\\dfrac{a_{n+1}}{a_n}=q$ (constante, $q\\ne0$). $q$ = <b>razão</b>.`) +
          `<div class="lesson-section">
            <h2 class="lesson-h2">Fórmulas</h2>
            <p>Termo geral: $$a_n = a_1 \\cdot q^{n-1}$$</p>
            <p>Soma ($q\\ne1$): $$S_n = a_1\\cdot\\dfrac{q^n-1}{q-1}$$</p>
          </div>`) +
          think("Compare: PA cresce <em>adicionando</em>, PG cresce <em>multiplicando</em>. Por que PG supera PA a longo prazo?") +
          solved("$(2,6,18,54,\\ldots)$ — $a_8$ e $S_8$?",
            `$q=3$; $a_8=2\\cdot3^7=4374$; $S_8=2\\cdot\\dfrac{3^8-1}{2}=6560$`) +
          apply("Divisão celular",
            `$N(t)=N_0\\cdot2^t$. A cada geração a população dobra — PG com $q=2$.<br>
             Partindo de 1 célula: após 10 divisões $N=2^{10}=1024$.`) +
          `<div class="lesson-section">
            <h2 class="lesson-h2">Laboratório — PG no plano cartesiano</h2>
            <p>$a_n = a_1\\cdot q^{n-1}$ é uma exponencial discreta — formato idêntico ao de $f(x)=A\\cdot q^x$.</p>` +
          labSlot("lab-pg") + `</div>` +
          quizSlot("quiz-pg");

      autoRender(c);

      mountLab(c.querySelector("#lab-pg"), {
        base: "f(n) = a_1 \\cdot q^{n-1}",
        vars: [
          { sym: "a₁", papel: "primeiro termo", limites: "a₁ > 0", efeito: "escala vertical" },
          { sym: "q",  papel: "razão da PG", limites: "q > 0, q ≠ 1",
            efeito: "q>1 cresce explosivo ↑ · 0<q<1 decai ↘ até zero" },
        ],
        start: "y = 2·3^(x-1)",
        view: { xmin: 0, xmax: 8, ymin: -5, ymax: 80 },
        examples: ["y = 2·3^(x-1)", "y = 100·(1/2)^(x-1)", "y = 1·2^(x-1)", "y = 5·(1.1)^(x-1)"],
        desafios: [
          { ordem: "PG com a₁=3 e q=2. Confirme que o 4.º termo é 24.",
            checa: f => Math.abs(f(1)-3)<1e-6 && Math.abs(f(4)-24)<1e-6,
            dica: "y = 3·2^(x−1). f(4) = 3·8 = 24." },
          { ordem: "PG decrescente (0 < q < 1) com a₁ = 81.",
            checa: f => Math.abs(f(1)-81)<1e-6 && f(2)<f(1),
            dica: "y = 81·(1/3)^(x−1)" },
        ],
      });

      mountQuizSet(c.querySelector("#quiz-pg"), [
        { q: "6.º termo de $(3,6,12,\\ldots)$?",
          opts:["$96$","$48$","$192$","$64$","$128$"], ans:0,
          expl:"$q=2$; $a_6=3\\cdot2^5=96$" },
        { q: "$S_5$ de $(1,2,4,8,16)$?",
          opts:["$31$","$30$","$32$","$63$","$15$"], ans:0,
          expl:"$S_5=\\frac{2^5-1}{2-1}=31$" },
        { q: "(ENEM) Epidemia dobra a cada 3 dias. De 100 casos, após 9 dias:",
          opts:["$800$","$400$","$1600$","$200$","$1200$"], ans:0,
          expl:"3 duplicações: $100\\cdot2^3=800$" },
      ]);
    }
  },

  /* ──────────── PA × PG visual ──────────── */
  {
    id: "seq-vs",
    title: "PA vs PG — comparação",
    render(c) {
      c.innerHTML = section("Cap 2 · §3", "Crescimento linear vs exponencial") +
        `<div class="lesson-section">
          <p>PA: crescimento <b>aditivo</b> (reta). PG: crescimento <b>multiplicativo</b> (exponencial).
          A longo prazo a PG supera qualquer PA.</p>
          <p>$$a_n^{\\text{PA}}=a_1+(n-1)r \\qquad a_n^{\\text{PG}}=a_1\\cdot q^{n-1}$$</p>
          <div id="cmp-seq" style="width:100%;height:300px;border-radius:12px;overflow:hidden;margin:.75rem 0;"></div>
          <p style="font-size:.85rem;color:var(--text-soft)">Laranja = PA (r=5) · Amarelo = PG (q=1,5) · a₁=5</p>
        </div>` +
        think("A partir de qual índice a PG supera definitivamente a PA? Leia no gráfico.") +
        quizSlot("quiz-vs");

      const canvas = document.createElement("canvas");
      canvas.style.cssText = "width:100%;height:100%;display:block;";
      c.querySelector("#cmp-seq").appendChild(canvas);
      import("../../core/plotEngine.js").then(({ Plot }) => {
        const p = new Plot(canvas, { xmin:0, xmax:15, ymin:-5, ymax:120 });
        p.setCurves([
          { fn: x => 5+(x-1)*5, color: "var(--accent)" },
          { fn: x => 5*Math.pow(1.5,x-1), color: "var(--accent-2)" },
        ]);
      });

      autoRender(c);
      mountQuizSet(c.querySelector("#quiz-vs"), [
        { q: "PA $(5,10,15,\\ldots)$ e PG $(5,10,20,\\ldots)$. No 6.º termo, qual é maior?",
          opts:["PG","PA","Iguais","Não dá saber","Nenhuma"], ans:0,
          expl:"$a_6^{PA}=30$ vs $a_6^{PG}=5\\cdot2^5=160$. PG." },
        { q: "Juros compostos modelam PA ou PG?",
          opts:["PG","PA","Depende","Nenhuma","Ambas"], ans:0,
          expl:"Juros compostos: capital multiplica por $(1+i)$ a cada período → PG." },
      ]);
    }
  },
];
