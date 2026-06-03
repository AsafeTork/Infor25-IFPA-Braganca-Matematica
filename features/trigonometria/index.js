export const trigonometriaMeta = { num: "05", title: "Trigonometria", chapter: "Capítulo 5" };

export const trigonometriaLessons = [

/* ═══════════════════════════════════════════════════════════
   AULA 1 — Arcos e ângulos
   ═══════════════════════════════════════════════════════════ */
{
  id: "trig-arcos",
  title: "Arcos e ângulos",
  render(c) {
    c.innerHTML = `
<div class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · Aula 1</div>
  <h1 class="al-title">Arcos e ângulos — medindo voltas</h1>
  <p>Você já mediu ângulos em graus: uma volta completa tem 360°. Mas em matemática e física existe outra unidade chamada <strong>radiano</strong>, que é mais natural para cálculos.</p>
</div>

<div class="def">
  <div class="def-h">O que é um radiano?</div>
  <p>Imagine um círculo qualquer. O raio mede, digamos, <em>r</em> cm. Agora "dobre" esse raio sobre a borda do círculo — ele vai cobrir um pedaço da borda exatamente do seu tamanho.</p>
  <p>O ângulo correspondente a esse pedaço é <strong>1 radiano</strong>.</p>
  <p>Em outras palavras: <strong>1 rad é o ângulo cujo arco tem o mesmo comprimento que o raio.</strong></p>
</div>

<div class="box think">
  <p>Uma volta completa tem arco = 2πr (circunferência). Dividindo pelo raio r, temos 2π radianos em 360°.</p>
  <p>Por isso: <strong>180° = π rad</strong>. Essa é a relação que você vai usar para converter tudo.</p>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Como converter</h2>
  <p>A regra é sempre <strong>regra de três simples</strong> usando a âncora 180° = π rad:</p>
  <div class="box apply">
    <p><strong>Graus → Radianos:</strong> multiplica por π e divide por 180.</p>
    <p>Exemplo: $60° = 60 \\cdot \\dfrac{\\pi}{180} = \\dfrac{\\pi}{3}$</p>
    <p><strong>Radianos → Graus:</strong> substitua π por 180° diretamente.</p>
    <p>Exemplo: $\\dfrac{\\pi}{4} \\to \\dfrac{180°}{4} = 45°$</p>
  </div>
  <div class="box think">
    <p>⚠️ <strong>Erro clássico:</strong> usar a calculadora em modo errado. Antes de calcular sen, cos ou tan, confirme se ela está em DEG (graus) ou RAD (radianos) conforme o enunciado pede.</p>
  </div>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Comprimento de arco</h2>
  <p>Se você sabe o raio e o ângulo em radianos, o comprimento do arco é simples:</p>
  <p>$$\\ell = r \\cdot \\theta$$</p>
  <div class="box solved">
    <p><strong>Exemplo:</strong> Um pêndulo de 40 cm oscila 30°. Que distância percorre a ponta?</p>
    <p>1. Converter: $30° = \\dfrac{\\pi}{6}$ rad</p>
    <p>2. Aplicar: $\\ell = 40 \\cdot \\dfrac{\\pi}{6} = \\dfrac{40\\pi}{6} = \\dfrac{20\\pi}{3} \\approx 20{,}9$ cm</p>
  </div>
</div>

<div id="quiz-arcos"></div>`;

    autoRender(c);
    mountQuizSet(c.querySelector("#quiz-arcos"), [
      { q: "Quanto é π/3 em graus?",
        opts:["60°","45°","90°","30°","120°"], ans:0,
        expl:"Substitua π por 180°: 180°/3 = 60°." },
      { q: "Quanto é 270° em radianos?",
        opts:["3π/2","2π","π","π/2","3π"], ans:0,
        expl:"270° × π/180 = 270π/180 = 3π/2." },
      { q: "Um arco de raio 5 cm e ângulo π/2 rad tem comprimento:",
        opts:["5π/2 cm","5π cm","π cm","10 cm","2,5 cm"], ans:0,
        expl:"ℓ = r·θ = 5·(π/2) = 5π/2 ≈ 7,85 cm. θ já está em radianos." },
    ]);
  }
},

/* ═══════════════════════════════════════════════════════════
   AULA 2 — Círculo trigonométrico
   ═══════════════════════════════════════════════════════════ */
{
  id: "trig-circulo",
  title: "Círculo trigonométrico",
  render(c) {
    c.innerHTML = `
<div class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · Aula 2</div>
  <h1 class="al-title">Seno e cosseno — o que são de verdade?</h1>
  <p>Esqueça a definição de triângulo por um momento. Existe uma forma muito mais simples de entender seno e cosseno usando um círculo.</p>
</div>

<div class="def">
  <div class="def-h">A ideia central — em 3 passos</div>
  <p><strong>Passo 1:</strong> Desenhe um círculo de raio 1 centrado na origem do plano cartesiano. Esse é o <strong>círculo trigonométrico</strong>.</p>
  <p><strong>Passo 2:</strong> Marque um ponto P em qualquer lugar na borda do círculo e trace uma linha da origem até P. Essa linha forma um ângulo θ com o eixo x positivo.</p>
  <p><strong>Passo 3:</strong> As coordenadas de P têm nomes:
    <br>→ A posição <strong>horizontal</strong> de P (eixo x) = <strong>cosseno de θ</strong>
    <br>→ A posição <strong>vertical</strong> de P (eixo y) = <strong>seno de θ</strong>
  </p>
  <p style="margin-top:.5rem">Resumindo: $P = (\\cos\\theta,\\ \\sin\\theta)$</p>
</div>

<div class="box think">
  <p><strong>Por que o raio precisa ser 1?</strong></p>
  <p>Para que as coordenadas de P sejam diretamente o seno e o cosseno, sem precisar dividir por nada. Se o raio fosse 3, o seno seria y/3 — mais trabalhoso.</p>
  <p>Com raio 1, tudo fica entre −1 e 1, e as contas ficam simples.</p>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">① Primeiro: entenda o ângulo</h2>
  <p>O ângulo θ é medido a partir do eixo x positivo, no sentido anti-horário (para cima primeiro, depois para a esquerda). Arraste o ponto P abaixo e veja como θ muda:</p>
  <div id="cv1" style="width:100%;max-width:320px;height:260px;margin:.5rem auto;display:block;"></div>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">② O cosseno é a sombra horizontal</h2>
  <p>Imagine uma luz vindo de cima, projetando a sombra de P direto no chão (eixo x). Essa sombra é o <strong>cosseno</strong>.</p>
  <p>Quando P está à direita → cosseno positivo. Quando P vai para a esquerda → cosseno negativo.</p>
  <div id="cv2" style="width:100%;max-width:320px;height:260px;margin:.5rem auto;display:block;"></div>
  <p style="font-size:.8rem;color:var(--text-mut);text-align:center">🟠 A sombra laranja no eixo x = cosseno</p>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">③ O seno é a sombra vertical</h2>
  <p>Agora a luz vem do lado, projetando a sombra de P na parede (eixo y). Essa sombra é o <strong>seno</strong>.</p>
  <p>Quando P está acima → seno positivo. Quando P está abaixo → seno negativo.</p>
  <div id="cv3" style="width:100%;max-width:320px;height:260px;margin:.5rem auto;display:block;"></div>
  <p style="font-size:.8rem;color:var(--text-mut);text-align:center">🟡 A sombra amarela no eixo y = seno</p>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">④ Seno, cosseno e tangente juntos</h2>
  <p>A <strong>tangente</strong> aparece na linha vertical que passa por x = 1: é onde a linha da hipotenusa (raio estendido) toca essa parede. Ela pode ser grande — por isso não tem limites como o seno e o cosseno.</p>
  <div id="cv4" style="width:100%;max-width:320px;height:260px;margin:.5rem auto;display:block;"></div>
  <p style="font-size:.8rem;color:var(--text-mut);text-align:center">🟠 cos · 🟡 sin · 🟢 tan</p>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Sinais por quadrante — pense, não decore</h2>
  <p>Não precisa decorar uma tabela. Basta pensar onde P está no plano:</p>
  <ul style="line-height:2;padding-left:1.3rem">
    <li><strong>Direita → cosseno positivo</strong> (x > 0)</li>
    <li><strong>Esquerda → cosseno negativo</strong> (x &lt; 0)</li>
    <li><strong>Acima → seno positivo</strong> (y > 0)</li>
    <li><strong>Abaixo → seno negativo</strong> (y &lt; 0)</li>
  </ul>
  <p>Tangente = sin ÷ cos. É positiva quando os dois têm o mesmo sinal (Q1 e Q3), negativa quando têm sinais opostos (Q2 e Q4).</p>
</div>

<div class="def">
  <div class="def-h">A equação fundamental — também dá para entender geometricamente</div>
  <p>P está sempre na borda do círculo de raio 1. Pela distância da origem a P:</p>
  <p>$$\\cos^2\\theta + \\sin^2\\theta = 1$$</p>
  <p>É o teorema de Pitágoras: os dois catetos (cos e sin) e a hipotenusa (raio = 1).</p>
</div>

<div id="quiz-circ"></div>`;

    function makeCanvas(id) {
      const wrap = c.querySelector("#" + id);
      const cv   = document.createElement("canvas");
      cv.style.cssText = "width:100%;height:100%;display:block;cursor:crosshair;touch-action:none;border-radius:8px;";
      wrap.appendChild(cv);
      return cv;
    }

    function drawBase(ctx, cv, { axes=true, circle=true, quadrants=false }={}) {
      const W = cv.offsetWidth, H = cv.offsetHeight;
      if (!W) return null;
      const dpr = window.devicePixelRatio || 1;
      cv.width  = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const dark = document.documentElement.getAttribute("data-theme") !== "light";
      const bg   = dark ? "rgba(26,26,46,.0)" : "rgba(255,255,255,.0)";
      const fg   = dark ? "#e8e3da" : "#1a1a2e";
      const fgm  = dark ? "rgba(220,210,190,.28)" : "rgba(60,60,80,.22)";
      const cx = W/2, cy = H/2, r = Math.min(W,H)*0.36;
      if (axes) {
        ctx.strokeStyle = fgm; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx-r*1.3,cy); ctx.lineTo(cx+r*1.3,cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx,cy-r*1.3); ctx.lineTo(cx,cy+r*1.3); ctx.stroke();
        ctx.fillStyle = fgm; ctx.font = `${~~(r*.1)}px monospace`;
        ctx.textAlign="center"; ctx.textBaseline="top";
        ctx.fillText("1",cx+r,cy+4); ctx.fillText("-1",cx-r,cy+4);
        ctx.textAlign="right"; ctx.textBaseline="middle";
        ctx.fillText("1",cx-4,cy-r); ctx.fillText("-1",cx-4,cy+r);
      }
      if (circle) {
        ctx.strokeStyle = fgm; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx,cy,r,0,2*Math.PI); ctx.stroke();
      }
      if (quadrants) {
        ctx.fillStyle = fgm; ctx.font=`bold ${~~(r*.13)}px monospace`;
        ctx.textAlign="center"; ctx.textBaseline="middle";
        for (const [l,sx,sy] of [["I",1,1],["II",-1,1],["III",-1,-1],["IV",1,-1]])
          ctx.fillText(l, cx+sx*r*.58, cy-sy*r*.58);
      }
      return { cx, cy, r, fg, fgm, dark, W, H };
    }

    const ACC="#ffa500", ACC2="#ffd23f", GRN=getComputedStyle(document.documentElement).getPropertyValue("--text").trim()||"#4ade80";
    const green = "#4ade80";

    const c1=makeCanvas("cv1"), ctx1=c1.getContext("2d");
    const c2=makeCanvas("cv2"), ctx2=c2.getContext("2d");
    const c3=makeCanvas("cv3"), ctx3=c3.getContext("2d");
    const c4=makeCanvas("cv4"), ctx4=c4.getContext("2d");

    function draw1(t) {
      const b=drawBase(ctx1,c1,{quadrants:true}); if(!b) return;
      const {cx,cy,r,fg}=b, px=cx+r*Math.cos(t), py=cy-r*Math.sin(t);
      const tN=((t%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
      ctx1.strokeStyle=fg+"cc"; ctx1.lineWidth=2;
      ctx1.beginPath(); ctx1.moveTo(cx,cy); ctx1.lineTo(px,py); ctx1.stroke();
      ctx1.fillStyle=fg; ctx1.font=`${~~(r*.1)}px monospace`;
      ctx1.textAlign="center"; ctx1.textBaseline="middle";
      ctx1.fillText("1",(cx+px)/2-5*Math.sin(t),(cy+py)/2-5*Math.cos(t));
      ctx1.strokeStyle=ACC+"99"; ctx1.lineWidth=2;
      ctx1.beginPath(); ctx1.arc(cx,cy,r*.22,0,-tN,true); ctx1.stroke();
      ctx1.fillStyle=ACC; ctx1.font=`bold ${~~(r*.1)}px monospace`;
      ctx1.textAlign="center"; ctx1.textBaseline="top";
      ctx1.fillText("θ = "+(tN*180/Math.PI).toFixed(0)+"°", cx, cy-r*.18);
      ctx1.fillStyle=fg; ctx1.font=`bold ${~~(r*.12)}px monospace`;
      ctx1.textAlign=Math.cos(t)>=0?"left":"right";
      ctx1.textBaseline=Math.sin(t)>=0?"bottom":"top";
      ctx1.fillText("P", px+(Math.cos(t)>=0?8:-8), py+(Math.sin(t)>=0?-8:8));
      ctx1.fillStyle=ACC; ctx1.beginPath(); ctx1.arc(px,py,7,0,2*Math.PI); ctx1.fill();
      ctx1.strokeStyle="rgba(0,0,0,.3)"; ctx1.lineWidth=1.5; ctx1.stroke();
    }

    function draw2(t) {
      const b=drawBase(ctx2,c2); if(!b) return;
      const {cx,cy,r,fg,fgm}=b, co=Math.cos(t), si=Math.sin(t);
      const px=cx+r*co, py=cy-r*si;
      ctx2.strokeStyle=fgm; ctx2.lineWidth=1.5;
      ctx2.beginPath(); ctx2.moveTo(cx,cy); ctx2.lineTo(px,py); ctx2.stroke();
      ctx2.strokeStyle=ACC+"44"; ctx2.lineWidth=1.5; ctx2.setLineDash([4,4]);
      ctx2.beginPath(); ctx2.moveTo(px,py); ctx2.lineTo(px,cy); ctx2.stroke();
      ctx2.setLineDash([]);
      ctx2.strokeStyle=ACC; ctx2.lineWidth=5;
      ctx2.beginPath(); ctx2.moveTo(cx,cy); ctx2.lineTo(px,cy); ctx2.stroke();
      ctx2.fillStyle=ACC; ctx2.beginPath(); ctx2.arc(px,cy,5,0,2*Math.PI); ctx2.fill();
      ctx2.font=`bold ${~~(r*.12)}px monospace`;
      ctx2.fillStyle=ACC; ctx2.textAlign="center";
      ctx2.textBaseline=si>=0?"top":"bottom";
      ctx2.fillText("cos θ = "+co.toFixed(2),(cx+px)/2,cy+(si>=0?8:-8));
      ctx2.fillStyle=ACC; ctx2.beginPath(); ctx2.arc(px,py,7,0,2*Math.PI); ctx2.fill();
      ctx2.strokeStyle="rgba(0,0,0,.3)"; ctx2.lineWidth=1.5; ctx2.stroke();
    }

    function draw3(t) {
      const b=drawBase(ctx3,c3); if(!b) return;
      const {cx,cy,r,fg,fgm}=b, co=Math.cos(t), si=Math.sin(t);
      const px=cx+r*co, py=cy-r*si;
      ctx3.strokeStyle=fgm; ctx3.lineWidth=1.5;
      ctx3.beginPath(); ctx3.moveTo(cx,cy); ctx3.lineTo(px,py); ctx3.stroke();
      ctx3.strokeStyle=ACC2+"44"; ctx3.lineWidth=1.5; ctx3.setLineDash([4,4]);
      ctx3.beginPath(); ctx3.moveTo(px,py); ctx3.lineTo(cx,py); ctx3.stroke();
      ctx3.setLineDash([]);
      ctx3.strokeStyle=ACC2; ctx3.lineWidth=5;
      ctx3.beginPath(); ctx3.moveTo(cx,cy); ctx3.lineTo(cx,py); ctx3.stroke();
      ctx3.fillStyle=ACC2; ctx3.beginPath(); ctx3.arc(cx,py,5,0,2*Math.PI); ctx3.fill();
      ctx3.font=`bold ${~~(r*.12)}px monospace`;
      ctx3.fillStyle=ACC2; ctx3.textAlign=co>=0?"left":"right"; ctx3.textBaseline="middle";
      ctx3.fillText("sin θ = "+si.toFixed(2),cx+(co>=0?8:-8),(cy+py)/2);
      ctx3.fillStyle=ACC2; ctx3.beginPath(); ctx3.arc(px,py,7,0,2*Math.PI); ctx3.fill();
      ctx3.strokeStyle="rgba(0,0,0,.3)"; ctx3.lineWidth=1.5; ctx3.stroke();
    }

    function draw4(t) {
      const b=drawBase(ctx4,c4,{quadrants:true}); if(!b) return;
      const {cx,cy,r,fg,fgm,H}=b, co=Math.cos(t), si=Math.sin(t);
      const px=cx+r*co, py=cy-r*si;
      if (Math.abs(co)>0.07) {
        const tn=si/co, tx=cx+r, ty=cy-r*tn;
        ctx4.strokeStyle=green+"28"; ctx4.lineWidth=1; ctx4.setLineDash([3,3]);
        ctx4.beginPath(); ctx4.moveTo(tx,0); ctx4.lineTo(tx,H); ctx4.stroke();
        ctx4.setLineDash([]);
        ctx4.strokeStyle=green+"cc"; ctx4.lineWidth=3;
        ctx4.beginPath(); ctx4.moveTo(tx,cy); ctx4.lineTo(tx,ty); ctx4.stroke();
        if(ty>4&&ty<H-4){ctx4.fillStyle=green;ctx4.beginPath();ctx4.arc(tx,ty,4,0,2*Math.PI);ctx4.fill();}
      }
      ctx4.strokeStyle=ACC+"44"; ctx4.lineWidth=1.5; ctx4.setLineDash([4,3]);
      ctx4.beginPath(); ctx4.moveTo(px,py); ctx4.lineTo(px,cy); ctx4.stroke();
      ctx4.strokeStyle=ACC2+"44";
      ctx4.beginPath(); ctx4.moveTo(px,py); ctx4.lineTo(cx,py); ctx4.stroke();
      ctx4.setLineDash([]);
      ctx4.strokeStyle=ACC; ctx4.lineWidth=4;
      ctx4.beginPath(); ctx4.moveTo(cx,cy); ctx4.lineTo(px,cy); ctx4.stroke();
      ctx4.strokeStyle=ACC2; ctx4.lineWidth=4;
      ctx4.beginPath(); ctx4.moveTo(cx,cy); ctx4.lineTo(cx,py); ctx4.stroke();
      ctx4.strokeStyle=fg+"cc"; ctx4.lineWidth=2;
      ctx4.beginPath(); ctx4.moveTo(cx,cy); ctx4.lineTo(px,py); ctx4.stroke();
      ctx4.fillStyle=ACC; ctx4.beginPath(); ctx4.arc(px,cy,4,0,2*Math.PI); ctx4.fill();
      ctx4.fillStyle=ACC2; ctx4.beginPath(); ctx4.arc(cx,py,4,0,2*Math.PI); ctx4.fill();
      ctx4.fillStyle=ACC; ctx4.beginPath(); ctx4.arc(px,py,7,0,2*Math.PI); ctx4.fill();
      ctx4.strokeStyle="rgba(0,0,0,.3)"; ctx4.lineWidth=1.5; ctx4.stroke();
      const fs=~~(r*.1); ctx4.font=`bold ${fs}px monospace`;
      ctx4.fillStyle=ACC; ctx4.textAlign="center"; ctx4.textBaseline=si>=0?"top":"bottom";
      ctx4.fillText("cos="+co.toFixed(2),(cx+px)/2,cy+(si>=0?5:-5));
      ctx4.fillStyle=ACC2; ctx4.textAlign=co>=0?"left":"right"; ctx4.textBaseline="middle";
      ctx4.fillText("sin="+si.toFixed(2),cx+(co>=0?5:-5),(cy+py)/2);
    }

    let theta=Math.PI/4;
    function redraw(){draw1(theta);draw2(theta);draw3(theta);draw4(theta);}
    requestAnimationFrame(redraw);
    window.addEventListener("themechange", redraw);
    window.addEventListener("resize", ()=>requestAnimationFrame(redraw));

    function bindDrag(cv) {
      let drag=false;
      const pt = e => {
        const r=cv.getBoundingClientRect();
        return { x:(e.clientX-r.left)-r.width/2, y:-((e.clientY-r.top)-r.height/2) };
      };
      cv.addEventListener("pointerdown",e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);drag=true;const p=pt(e);theta=Math.atan2(p.y,p.x);redraw();});
      cv.addEventListener("pointermove",e=>{if(!drag)return;const p=pt(e);theta=Math.atan2(p.y,p.x);redraw();});
      cv.addEventListener("pointerup",  e=>{drag=false;cv.releasePointerCapture(e.pointerId);});
      cv.addEventListener("pointercancel",e=>{drag=false;cv.releasePointerCapture(e.pointerId);});
    }
    bindDrag(c1); bindDrag(c2); bindDrag(c3); bindDrag(c4);

    autoRender(c);
    mountQuizSet(c.querySelector("#quiz-circ"), [
      { q:"Seno de θ é a coordenada __ do ponto P no círculo trigonométrico.",
        opts:["Vertical (eixo y)","Horizontal (eixo x)","O ângulo θ","O raio","Nenhuma"],
        ans:0, expl:"Seno = posição vertical. Cosseno = posição horizontal." },
      { q:"O ponto P está no 3º quadrante (esquerda, abaixo). O que é verdade?",
        opts:["cos < 0 e sin < 0","cos > 0 e sin > 0","cos > 0 e sin < 0","cos < 0 e sin > 0","cos = 0"],
        ans:0, expl:"3º quadrante: x < 0 → cos < 0; y < 0 → sin < 0." },
      { q:"Por que o raio do círculo trigonométrico é 1?",
        opts:["Para que as coordenadas de P sejam diretamente sin e cos","Por tradição","Para facilitar o desenho","Qualquer raio serve","Para que o ângulo seja em graus"],
        ans:0, expl:"Com raio 1, x = cos·1 = cos e y = sin·1 = sin. Com outro raio precisaria dividir." },
    ]);
  }
},

/* ═══════════════════════════════════════════════════════════
   AULA 3 — Valores notáveis
   ═══════════════════════════════════════════════════════════ */
{
  id: "trig-notaveis",
  title: "Valores notáveis",
  render(c) {
    c.innerHTML = `
<div class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · Aula 3</div>
  <h1 class="al-title">Valores notáveis — os ângulos que toda prova cobra</h1>
  <p>Existem poucos ângulos cujos senos e cossenos têm valores exatos simples — e eles aparecem em quase toda questão de trigonometria. Vamos entender de onde vêm, não só decorar.</p>
</div>

<div class="def">
  <div class="def-h">De onde vêm os valores de 30° e 60°?</div>
  <p>Pegue um triângulo equilátero (os 3 lados iguais, digamos, lado = 2). Corte ele ao meio com uma linha vertical.</p>
  <p>Você fica com um triângulo de ângulos <strong>30°–60°–90°</strong> e lados:</p>
  <ul style="line-height:1.9;padding-left:1.3rem">
    <li>Hipotenusa = 2 (o lado original do triângulo equilátero)</li>
    <li>Cateto menor = 1 (metade da base)</li>
    <li>Cateto maior = √3 (Pitágoras: √(2²−1²) = √3)</li>
  </ul>
  <p>Daí: $\\sin 30° = \\dfrac{1}{2}$, $\\cos 30° = \\dfrac{\\sqrt{3}}{2}$, $\\sin 60° = \\dfrac{\\sqrt{3}}{2}$, $\\cos 60° = \\dfrac{1}{2}$</p>
</div>

<div class="def">
  <div class="def-h">De onde vem o valor de 45°?</div>
  <p>Pegue um quadrado de lado 1 e corte na diagonal. Você fica com um triângulo <strong>45°–45°–90°</strong> com:</p>
  <ul style="line-height:1.9;padding-left:1.3rem">
    <li>Dois catetos iguais = 1</li>
    <li>Hipotenusa = √2</li>
  </ul>
  <p>Daí: $\\sin 45° = \\cos 45° = \\dfrac{1}{\\sqrt{2}} = \\dfrac{\\sqrt{2}}{2}$</p>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">A tabela completa</h2>
  <table class="vtab mono" style="width:100%;margin:.5rem 0">
    <thead><tr><th>θ (°)</th><th>θ (rad)</th><th>sin θ</th><th>cos θ</th><th>tan θ</th></tr></thead>
    <tbody>
      <tr><td>0°</td><td>0</td><td>0</td><td>1</td><td>0</td></tr>
      <tr><td><strong>30°</strong></td><td>π/6</td><td><strong>1/2</strong></td><td><strong>√3/2</strong></td><td>√3/3</td></tr>
      <tr><td><strong>45°</strong></td><td>π/4</td><td><strong>√2/2</strong></td><td><strong>√2/2</strong></td><td>1</td></tr>
      <tr><td><strong>60°</strong></td><td>π/3</td><td><strong>√3/2</strong></td><td><strong>1/2</strong></td><td>√3</td></tr>
      <tr><td>90°</td><td>π/2</td><td>1</td><td>0</td><td>∄</td></tr>
      <tr><td>180°</td><td>π</td><td>0</td><td>−1</td><td>0</td></tr>
      <tr><td>270°</td><td>3π/2</td><td>−1</td><td>0</td><td>∄</td></tr>
    </tbody>
  </table>
  <div class="box apply">
    <p><strong>Truque rápido:</strong> sin de 0°, 30°, 45°, 60°, 90° segue a sequência √0/2, √1/2, √2/2, √3/2, √4/2 = <strong>0, 1/2, √2/2, √3/2, 1</strong>. O cos é a mesma sequência, ao contrário.</p>
  </div>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Redução ao 1º quadrante — usando simetria</h2>
  <p>Para calcular sin ou cos de ângulos maiores que 90°, usamos que o círculo é simétrico:</p>
  <ol style="line-height:2;padding-left:1.3rem">
    <li>Identifique o quadrante do ângulo</li>
    <li>Calcule o <strong>ângulo de referência</strong> (distância ao eixo x mais próximo)</li>
    <li>Use o valor notável do ângulo de referência</li>
    <li>Aplique o sinal correto do quadrante (positivo à direita/acima, negativo à esquerda/abaixo)</li>
  </ol>
  <div class="box solved">
    <p><strong>Exemplo A:</strong> $\\sin(150°)$</p>
    <p>150° está no Q2 (esquerda, cima). Referência = 180° − 150° = <strong>30°</strong>.</p>
    <p>Q2: sin positivo → $\\sin(150°) = +\\sin(30°) = \\mathbf{\\dfrac{1}{2}}$</p>
  </div>
  <div class="box solved">
    <p><strong>Exemplo B:</strong> $\\cos(240°)$</p>
    <p>240° está no Q3 (esquerda, baixo). Referência = 240° − 180° = <strong>60°</strong>.</p>
    <p>Q3: cos negativo → $\\cos(240°) = -\\cos(60°) = \\mathbf{-\\dfrac{1}{2}}$</p>
  </div>
</div>

<div id="quiz-notaveis"></div>`;

    autoRender(c);
    mountQuizSet(c.querySelector("#quiz-notaveis"), [
      { q:"Qual é o valor de sin(60°)?",
        opts:["√3/2","1/2","√2/2","1","0"], ans:0,
        expl:"Do triângulo 30-60-90: sin(60°) = √3/2 ≈ 0,866. Maior que sin(45°) = √2/2 ≈ 0,707." },
      { q:"Qual é o valor de cos(45°)?",
        opts:["√2/2","1/2","√3/2","1","0"], ans:0,
        expl:"No triângulo 45-45-90 de lado 1: hipotenusa = √2. cos(45°) = 1/√2 = √2/2." },
      { q:"Para calcular sin(300°), qual é o ângulo de referência?",
        opts:["60°","30°","45°","120°","300°"], ans:0,
        expl:"300° está no Q4. Referência = 360° − 300° = 60°. Q4: sin negativo → sin(300°) = −sin(60°) = −√3/2." },
      { q:"cos(210°) = ?",
        opts:["−√3/2","−1/2","√3/2","1/2","0"], ans:0,
        expl:"210° no Q3. Ref = 210° − 180° = 30°. Q3: cos negativo → cos(210°) = −cos(30°) = −√3/2." },
    ]);
  }
},

/* ═══════════════════════════════════════════════════════════
   AULA 4 — Função seno
   ═══════════════════════════════════════════════════════════ */
{
  id: "trig-seno",
  title: "Função seno",
  render(c) {
    c.innerHTML = `
<div class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · Aula 4</div>
  <h1 class="al-title">Função seno — o movimento que se repete</h1>
  <p>Imagine um ponto girando no círculo trigonométrico. A sua <strong>altura</strong> (posição vertical) sobe, chega ao máximo, desce, chega ao mínimo, e volta ao início — um ciclo completo. A função seno registra essa altura em função do ângulo percorrido.</p>
</div>

<div class="def">
  <div class="def-h">f(x) = sen(x) — o que cada número significa</div>
  <ul style="line-height:2.2">
    <li><strong>Domínio: ℝ</strong> — funciona para qualquer ângulo, pode girar o quanto quiser</li>
    <li><strong>Imagem: [−1, 1]</strong> — a altura nunca passa de 1 nem de −1 (é a borda do círculo)</li>
    <li><strong>Período: 2π</strong> — depois de uma volta completa, tudo se repete</li>
    <li><strong>f(0) = 0</strong> — começa em zero (o ponto P começa no eixo x)</li>
  </ul>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Os 5 pontos que constroem o gráfico</h2>
  <p>Você não precisa calcular centenas de pontos. Apenas estes 5, dividindo o período em 4 partes iguais:</p>
  <table class="vtab mono" style="width:100%;margin:.5rem 0">
    <thead><tr><th>x</th><th>0</th><th>π/2</th><th>π</th><th>3π/2</th><th>2π</th></tr></thead>
    <tbody>
      <tr><th>Posição de P</th><td>início</td><td>topo</td><td>saída</td><td>fundo</td><td>volta</td></tr>
      <tr><th>sin(x)</th><td><strong>0</strong></td><td><strong>1</strong></td><td><strong>0</strong></td><td><strong>−1</strong></td><td><strong>0</strong></td></tr>
    </tbody>
  </table>
  <p>Padrão: <strong>zero → máximo → zero → mínimo → zero</strong>. Ligue com uma curva suave.</p>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Crescimento e decrescimento</h2>
  <ul style="line-height:2;padding-left:1.3rem">
    <li><strong>Sobe</strong> de −π/2 a π/2 (P subindo do fundo ao topo)</li>
    <li><strong>Desce</strong> de π/2 a 3π/2 (P descendo do topo ao fundo)</li>
  </ul>
  <div class="box think">
    <p>A função seno é <strong>ímpar</strong>: sin(−x) = −sin(x). Isso significa que o gráfico tem simetria de ponto em relação à origem. Se você virar o gráfico de cabeça para baixo e espelhar, fica igual.</p>
  </div>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Laboratório — explore e modifique</h2>` +
      labSlot("lab-seno") + `
</div>
<div id="quiz-seno"></div>`;

    autoRender(c);
    mountLab(c.querySelector("#lab-seno"), {
      base: "y = A·sin(B·x + C) + D",
      vars:[
        {sym:"A",papel:"amplitude",limites:"A > 0",efeito:"máx = D+A · mín = D−A · A=2 dobra a altura"},
        {sym:"B",papel:"frequência",limites:"B > 0",efeito:"período = 2π/B · B=2 = período π · B=0.5 = período 4π"},
        {sym:"C",papel:"fase",limites:"real",efeito:"desloca horizontalmente — C=π/2 adianta meio ciclo"},
        {sym:"D",papel:"deslocamento vertical",limites:"real",efeito:"sobe/desce o eixo de equilíbrio"},
      ],
      piAxis:true, start:"y = sin(x)",
      view:{xmin:-2*Math.PI,xmax:2*Math.PI,ymin:-2.5,ymax:2.5},
      examples:["y = sin(x)","y = 2*sin(x)","y = sin(2*x)","y = sin(x + π/2)","y = sin(x) + 1"],
      desafios:[
        { ordem:"Faça o máximo atingir 3 e o mínimo −3.",
          checa:f=>{let mx=-Infinity,mn=Infinity;for(let x=-6;x<=6;x+=0.1){const v=f(x);if(isFinite(v)){mx=Math.max(mx,v);mn=Math.min(mn,v);}}return Math.abs(mx-3)<0.3&&Math.abs(mn+3)<0.3;},
          dica:"y = 3·sin(x) — A = 3" },
        { ordem:"Reduza o período para π (metade do normal).",
          checa:f=>Math.abs(f(0))<0.1&&Math.abs(f(Math.PI/2)-1)<0.2&&Math.abs(f(Math.PI))<0.1,
          dica:"y = sin(2·x) — T = 2π/2 = π" },
      ],
    });
    mountQuizSet(c.querySelector("#quiz-seno"), [
      { q:"Qual é o valor máximo de f(x) = sin(x)?",
        opts:["1","2","π","∞","0"], ans:0,
        expl:"O seno nunca passa de 1. Ocorre em x = π/2 + 2kπ (topo do círculo)." },
      { q:"Em quais x do intervalo [0, 2π] o sin(x) vale zero?",
        opts:["x = 0, π e 2π","x = 0 e π/2","x = π/2 e 3π/2","x = π apenas","x = 0 apenas"], ans:0,
        expl:"O seno é zero quando P está nos eixos: início (0), metade (π) e volta completa (2π)." },
      { q:"Período de f(x) = sin(3x)?",
        opts:["2π/3","3π","2π","π/3","6π"], ans:0,
        expl:"T = 2π/B = 2π/3. Com B=3 o gráfico 'corre' 3 vezes mais rápido." },
      { q:"A função seno é crescente no intervalo [0, 2π]?",
        opts:["Não — só cresce de 0 a π/2 e depois decresce","Sim — cresce no intervalo todo","Só decresce","É constante","Cresce de 0 a π"], ans:0,
        expl:"Sobe de 0 a π/2, desce de π/2 a 3π/2, sobe de 3π/2 a 2π." },
    ]);
  }
},

/* ═══════════════════════════════════════════════════════════
   AULA 5 — Função cosseno
   ═══════════════════════════════════════════════════════════ */
{
  id: "trig-cosseno",
  title: "Função cosseno",
  render(c) {
    c.innerHTML = `
<div class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · Aula 5</div>
  <h1 class="al-title">Função cosseno — igual ao seno, mas diferente no ponto de partida</h1>
  <p>Se o seno registra a <strong>altura</strong> do ponto P girando, o cosseno registra sua <strong>posição horizontal</strong>. Os dois descrevem o mesmo movimento — mas começam em lugares diferentes.</p>
</div>

<div class="def">
  <div class="def-h">A única diferença que importa: o ponto de partida</div>
  <p>Compare os dois no instante x = 0 (ângulo zero, ponto P no eixo x positivo):</p>
  <ul style="line-height:2">
    <li>sin(0) = 0 → <strong>seno começa em zero</strong></li>
    <li>cos(0) = 1 → <strong>cosseno começa no máximo</strong></li>
  </ul>
  <p>Todo o resto é idêntico: mesma forma de onda, mesmo período 2π, mesma imagem [−1, 1].</p>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Os 5 pontos do cosseno</h2>
  <p>Mesmo processo do seno, mas o padrão é: <strong>máximo → zero → mínimo → zero → máximo</strong>.</p>
  <table class="vtab mono" style="width:100%;margin:.5rem 0">
    <thead><tr><th>x</th><th>0</th><th>π/2</th><th>π</th><th>3π/2</th><th>2π</th></tr></thead>
    <tbody>
      <tr><th>cos(x)</th><td><strong>1</strong></td><td>0</td><td><strong>−1</strong></td><td>0</td><td><strong>1</strong></td></tr>
      <tr><th>sin(x)</th><td>0</td><td><strong>1</strong></td><td>0</td><td><strong>−1</strong></td><td>0</td></tr>
    </tbody>
  </table>
  <div class="box think">
    <p>Note que as tabelas são iguais, mas deslocadas de π/2. De fato: $\\cos(x) = \\sin\\!\\left(x + \\dfrac{\\pi}{2}\\right)$. O cosseno é o seno adiantado em π/2 — ou o seno é o cosseno atrasado em π/2.</p>
  </div>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Crescimento, decrescimento e paridade</h2>
  <ul style="line-height:2;padding-left:1.3rem">
    <li><strong>Decresce</strong> de 0 a π (P saindo do lado direito para o esquerdo)</li>
    <li><strong>Cresce</strong> de π a 2π (P voltando para o lado direito)</li>
  </ul>
  <p>O cosseno é uma função <strong>par</strong>: cos(−x) = cos(x). O gráfico é simétrico em relação ao eixo y — se você espelhar o lado esquerdo e direito, fica igual.</p>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Laboratório</h2>` +
      labSlot("lab-cos") + `
</div>
<div id="quiz-cos"></div>`;

    autoRender(c);
    mountLab(c.querySelector("#lab-cos"), {
      base:"y = A·cos(B·x + C) + D",
      vars:[
        {sym:"A",papel:"amplitude",limites:"A > 0",efeito:"máx = D+A · mín = D−A"},
        {sym:"B",papel:"frequência",limites:"B > 0",efeito:"período = 2π/B"},
        {sym:"C",papel:"fase",limites:"real",efeito:"deslocamento horizontal"},
        {sym:"D",papel:"eixo central",limites:"real",efeito:"translação vertical"},
      ],
      piAxis:true, start:"y = cos(x)",
      view:{xmin:-2*Math.PI,xmax:2*Math.PI,ymin:-2.5,ymax:2.5},
      examples:["y = cos(x)","y = 2*cos(x)","y = cos(2*x)","y = cos(x - π/3)","y = cos(x) - 1"],
      desafios:[
        { ordem:"Mostre que cos(x) = sin(x + π/2) — faça a fórmula e verifique que os gráficos coincidem.",
          checa:f=>Math.abs(f(0)-1)<0.15&&Math.abs(f(Math.PI/2))<0.15&&Math.abs(f(Math.PI)+1)<0.15,
          dica:"y = sin(x + π/2) — em x=0 vale sin(π/2)=1 ✓" },
      ],
    });
    mountQuizSet(c.querySelector("#quiz-cos"), [
      { q:"Qual é o valor de cos(0)?",
        opts:["1","0","−1","√2/2","1/2"], ans:0,
        expl:"Em x=0, P está no ponto (1,0) do círculo — posição horizontal máxima. cos(0) = 1." },
      { q:"Para qual x ∈ [0, 2π] o cos(x) é mínimo (−1)?",
        opts:["x = π","x = 0","x = π/2","x = 3π/2","x = 2π"], ans:0,
        expl:"Em x=π, P está no ponto (−1, 0) — posição mais à esquerda. cos(π) = −1." },
      { q:"Comparando sin e cos: qual chega ao máximo primeiro?",
        opts:["Cosseno — começa já no máximo (x=0)","Seno — chega ao máximo em π/4","São iguais","Depende do ângulo","Nenhum tem máximo"], ans:0,
        expl:"cos(0) = 1 (já no máximo). sin(x) só chega ao máximo em x = π/2." },
      { q:"O período de cos(x) é:",
        opts:["2π","π","π/2","4π","∞"], ans:0,
        expl:"Mesma forma de onda do seno: período 2π (uma volta completa no círculo)." },
    ]);
  }
},

/* ═══════════════════════════════════════════════════════════
   AULA 6 — Função tangente
   ═══════════════════════════════════════════════════════════ */
{
  id: "trig-tangente",
  title: "Função tangente",
  render(c) {
    c.innerHTML = `
<div class="lesson-section">
  <div class="al-crumb" style="color:var(--accent);font-size:.78rem;font-weight:600">Cap 5 · Aula 6</div>
  <h1 class="al-title">Função tangente — a razão entre seno e cosseno</h1>
  <p>A tangente é construída dividindo seno pelo cosseno. Isso parece simples, mas cria um comportamento bem diferente: ela não tem limites e "explode" em certos ângulos.</p>
</div>

<div class="def">
  <div class="def-h">Definição e intuição geométrica</div>
  <p>$$\\tan(x) = \\dfrac{\\sin(x)}{\\cos(x)}$$</p>
  <p>Geometricamente: no círculo trigonométrico, trace uma linha vertical em x = 1 (tangente ao círculo). Estenda o raio até essa linha. A altura onde o raio toca essa linha é a tangente.</p>
  <p>Quando o raio aponta quase para cima (x → π/2), essa linha está muito acima — a tangente vai ao infinito. Quando aponta quase para baixo (x → −π/2), vai ao menos infinito.</p>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Por que a tangente "explode"?</h2>
  <p>Quando cos(x) = 0, a divisão sin/cos não existe (denominador zero). Isso ocorre em x = π/2, 3π/2, −π/2, …</p>
  <p>Nesses pontos aparecem as <strong>assíntotas verticais</strong> — o gráfico vai ao infinito e "quebra".</p>
  <div class="box think">
    <p>Diferente do seno e cosseno que ficam entre −1 e 1, a tangente pode assumir <strong>qualquer valor real</strong>. Imagem = ℝ.</p>
  </div>
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Propriedades</h2>
  <ul style="line-height:2.2;padding-left:1.3rem">
    <li><strong>Domínio:</strong> todos os reais exceto x = π/2 + kπ</li>
    <li><strong>Imagem:</strong> ℝ (qualquer valor)</li>
    <li><strong>Período: π</strong> — metade do seno e cosseno (cada "ramo" dura π)</li>
    <li><strong>Sempre crescente</strong> em cada ramo (entre duas assíntotas)</li>
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
</div>

<div class="lesson-section">
  <h2 class="lesson-h2">Laboratório</h2>` +
      labSlot("lab-tan") + `
</div>
<div id="quiz-tan"></div>`;

    autoRender(c);
    mountLab(c.querySelector("#lab-tan"), {
      base:"y = A·tan(B·x + C) + D",
      vars:[
        {sym:"A",papel:"escala vertical",limites:"A ≠ 0",efeito:"não é amplitude (imagem é ℝ) — só estica"},
        {sym:"B",papel:"frequência",limites:"B > 0",efeito:"período = π/B · B=2 → período π/2"},
        {sym:"C",papel:"fase",limites:"real",efeito:"desloca as assíntotas horizontalmente"},
      ],
      piAxis:true, start:"y = tan(x)",
      view:{xmin:-Math.PI,xmax:Math.PI,ymin:-4,ymax:4},
      examples:["y = tan(x)","y = 2*tan(x)","y = tan(2*x)","y = tan(x - π/4)"],
      desafios:[
        { ordem:"Crie uma tangente com período π/2.",
          checa:f=>{const v1=f(0),v2=f(Math.PI/2+0.01);return isFinite(v1)&&!isFinite(v2);},
          dica:"y = tan(2·x) — assíntota em π/4 em vez de π/2" },
      ],
    });
    mountQuizSet(c.querySelector("#quiz-tan"), [
      { q:"Por que tan(π/2) não existe?",
        opts:["cos(π/2) = 0 — divisão por zero","sin(π/2) = 0","O ângulo é muito grande","É um erro","Existe e vale 1"], ans:0,
        expl:"tan = sin/cos. Em π/2, cos = 0 → divisão impossível → assíntota vertical." },
      { q:"Qual é o período de tan(x)?",
        opts:["π","2π","π/2","2","4π"], ans:0,
        expl:"Diferente do seno e cosseno (2π), a tangente tem período π. Cada ramo cabe em π." },
      { q:"A imagem (conjunto de valores possíveis) da tangente é:",
        opts:["ℝ — qualquer número real","[−1, 1]","[0, ∞)","(−∞, 0)","Não tem imagem"], ans:0,
        expl:"Ao contrário do seno e cosseno, a tangente não tem limite: vai de −∞ a +∞ em cada ramo." },
      { q:"tan(x) é crescente ou decrescente?",
        opts:["Crescente em cada ramo","Decrescente em cada ramo","Ora cresce, ora decresce","Constante","Não é monótona"], ans:0,
        expl:"Em cada intervalo entre assíntotas, a tangente vai de −∞ a +∞ — estritamente crescente." },
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
