/* ============================================================
   core/trigVisuals.js
   Motor Visual de Trigonometria — 5 componentes interativos
   para o Capítulo 5.

   Arquitetura:
   ────────────
   1. TrigCircle        — Círculo trigonométrico interativo
   2. CircleToGraph     — Conexão CT → gráfico (split screen)
   3. TrigParamExplorer — Explorador de parâmetros sin/cos/tan
   4. TangentVis        — Visualização da tangente na CT
   5. PeriodicVis       — Fenômenos periódicos (mola, corrente, etc.)

   Requisitos:
   - Integra com core/plotEngine.js (Plot)
   - Usa design tokens de styles/tokens.css
   - Canvas HTML5 com HiDPI (devicePixelRatio)
   - Touch-friendly (pointer events)
   - 60fps via requestAnimationFrame
   - Exporta funções mount*() para uso nas lições
   ============================================================ */

import { Plot } from "./plotEngine.js";

/* ── Helpers globais ────────────────────────────────────── */
const css = (v) =>
  getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const PI = Math.PI;
const TWO_PI = 2 * PI;
const HALF_PI = PI / 2;

/* Paleta derivada dos tokens (fallback seguro) */
const COLORS = {
  get accent()    { return css("--accent")   || "#ffa500"; },
  get accent2()   { return css("--accent-2") || "#ffd23f"; },
  get green()     { return "#4ade80"; },
  get red()       { return "#f87171"; },
  get cyan()      { return "#22d3ee"; },
  get purple()    { return "#c084fc"; },
  get fg()        { return css("--text")     || "#e8e3da"; },
  get fgMut()     { return css("--text-mut") || "#9aa0b4"; },
  get plotBg()    { return css("--plot-bg")  || "#0b0c10"; },
  get surface()   { return css("--surface")  || "#121318"; },
  get gridLine()  { return css("--grid-line")|| "rgba(255,255,255,.055)"; },
  get gridAxis()  { return css("--grid-axis")|| "rgba(255,226,107,.55)"; },
  get isDark()    { return document.documentElement.getAttribute("data-theme") !== "light"; },
};

/* Notáveis (reaproveita do unitCircle.js existente) */
const NOTABLE = [
  { a:0,           label:"0",      sin:"0",     cos:"1",     tan:"0"     },
  { a:PI/6,        label:"π/6",    sin:"1/2",   cos:"√3/2",  tan:"√3/3"  },
  { a:PI/4,        label:"π/4",    sin:"√2/2",  cos:"√2/2",  tan:"1"     },
  { a:PI/3,        label:"π/3",    sin:"√3/2",  cos:"1/2",   tan:"√3"    },
  { a:PI/2,        label:"π/2",    sin:"1",     cos:"0",     tan:"∄"     },
  { a:2*PI/3,      label:"2π/3",   sin:"√3/2",  cos:"-1/2",  tan:"-√3"   },
  { a:3*PI/4,      label:"3π/4",   sin:"√2/2",  cos:"-√2/2", tan:"-1"    },
  { a:5*PI/6,      label:"5π/6",   sin:"1/2",   cos:"-√3/2", tan:"-√3/3" },
  { a:PI,          label:"π",      sin:"0",     cos:"-1",    tan:"0"     },
  { a:7*PI/6,      label:"7π/6",   sin:"-1/2",  cos:"-√3/2", tan:"√3/3"  },
  { a:5*PI/4,      label:"5π/4",   sin:"-√2/2", cos:"-√2/2", tan:"1"     },
  { a:4*PI/3,      label:"4π/3",   sin:"-√3/2", cos:"-1/2",  tan:"√3"    },
  { a:3*PI/2,      label:"3π/2",   sin:"-1",    cos:"0",     tan:"∄"     },
  { a:5*PI/3,      label:"5π/3",   sin:"-√3/2", cos:"1/2",   tan:"-√3"   },
  { a:7*PI/4,      label:"7π/4",   sin:"-√2/2", cos:"√2/2",  tan:"-1"    },
  { a:11*PI/6,     label:"11π/6",  sin:"-1/2",  cos:"√3/2",  tan:"-√3/3" },
];

function trySnap(t) {
  const n = ((t % TWO_PI) + TWO_PI) % TWO_PI;
  for (const k of NOTABLE) {
    if (Math.abs(n - k.a) < 0.1) return k;
  }
  return null;
}

/* Formatador de número → string compacta */
function fmt(v, digits = 4) {
  if (!Number.isFinite(v)) return "∞";
  return (Math.round(v * 10**digits) / 10**digits).toString();
}

/* Configuração HiDPI em canvas */
function setupCanvas(cv) {
  const dpr = window.devicePixelRatio || 1;
  const W = cv.clientWidth || cv.offsetWidth || 300;
  const H = cv.clientHeight || cv.offsetHeight || 300;
  cv.width = W * dpr;
  cv.height = H * dpr;
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, W, H, dpr };
}


/* ==========================================================
   1. TrigCircle — CÍRCULO TRIGONOMÉTRICO INTERATIVO
   ==========================================================

   API:
   ────
   mountTrigCircle(root, opts?) → TrigCircleController

   opts.showTan     — exibir construção da tangente (default: true)
   opts.showProj    — exibir projeções sin/cos (default: true)
   opts.showQuadrants — exibir rótulos de quadrantes (default: true)
   opts.showNotable — exibir pontos notáveis (default: true)
   opts.initialTheta — ângulo inicial em rad (default: PI/4)
   opts.readoutEl   — elemento HTML para info readout
   opts.size        — "auto" | number (px). auto = preenche container.
   opts.onChange(theta, data) — callback ao arrastar

   Retorno (controller):
   ─────────────────────
   .setTheta(t)       — define ângulo programaticamente
   .getTheta()        — retorna ângulo atual
   .getData()         — retorna { sin, cos, tan, quadrant, notable }
   .destroy()         — remove listeners e para animação
   .on(callback)      — registra listener de mudança
   ========================================================== */

export function mountTrigCircle(root, opts = {}) {
  const cfg = {
    showTan:        opts.showTan        ?? true,
    showProj:       opts.showProj       ?? true,
    showQuadrants:  opts.showQuadrants  ?? true,
    showNotable:    opts.showNotable    ?? true,
    initialTheta:   opts.initialTheta   ?? PI / 4,
    readoutEl:      opts.readoutEl      ?? null,
    size:           opts.size           ?? "auto",
    onChange:        opts.onChange       ?? null,
  };

  /* ── DOM ── */
  root.style.position = "relative";
  root.style.touchAction = "none";

  const cv = document.createElement("canvas");
  cv.style.cssText = "width:100%;height:100%;display:block;cursor:crosshair;border-radius:8px;";
  root.appendChild(cv);

  let { ctx, W, H } = setupCanvas(cv);

  /* ── Estado ── */
  let theta = cfg.initialTheta;
  let snapped = null;
  let listeners = [];
  let raf = null;
  let _cx, _cy, _r; // geometria do círculo
  let _drawing = false;

  function notify() {
    const data = getData();
    if (cfg.onChange) cfg.onChange(theta, data);
    listeners.forEach((fn) => fn(theta, data));
  }

  /* ── Coordenadas ── */
  function evAngle(e) {
    const rect = cv.getBoundingClientRect();
    const pt = e.touches ? e.touches[0] : e;
    const px = pt.clientX - rect.left;
    const py = pt.clientY - rect.top;
    const dx = px - _cx;
    const dy = -(py - _cy);
    return Math.atan2(dy, dx);
  }

  /* ── Layout (recompute no resize) ── */
  function layout() {
    const res = setupCanvas(cv);
    ctx = res.ctx; W = res.W; H = res.H;
    const pad = 40;
    _cx = W / 2;
    _cy = H / 2;
    _r  = Math.min(W, H) / 2 - pad;
    if (_r < 10) _r = 10;
  }

  /* ── Draw ── */
  function draw() {
    if (_drawing) return;
    _drawing = true;
    ctx.clearRect(0, 0, W, H);

    const dark = COLORS.isDark;
    const fg    = COLORS.fg;
    const fgm   = COLORS.fgMut;
    const acc   = COLORS.accent;
    const acc2  = COLORS.accent2;
    const green = COLORS.green;

    const t   = theta;
    const tN  = ((t % TWO_PI) + TWO_PI) % TWO_PI;
    const co  = Math.cos(t);
    const si  = Math.sin(t);
    const px  = _cx + _r * co;
    const py  = _cy - _r * si;

    /* ── Fundo sutil por quadrante ── */
    const qi = Math.floor(((tN % TWO_PI) + TWO_PI) % TWO_PI / HALF_PI);
    const qColors = [
      "rgba(74,222,128,.04)",   // Q1 — verde sutil
      "rgba(251,191,36,.04)",   // Q2 — amarelo sutil
      "rgba(248,113,113,.04)",  // Q3 — vermelho sutil
      "rgba(34,211,238,.04)",   // Q4 — ciano sutil
    ];
    ctx.fillStyle = qColors[qi] || "transparent";
    ctx.fillRect(0, 0, W, H);

    /* ── Eixos ── */
    ctx.strokeStyle = fgm; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(_cx - _r * 1.3, _cy); ctx.lineTo(_cx + _r * 1.3, _cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(_cx, _cy - _r * 1.3); ctx.lineTo(_cx, _cy + _r * 1.3); ctx.stroke();

    /* ── Rótulos dos quadrantes ── */
    if (cfg.showQuadrants) {
      ctx.fillStyle = fgm; ctx.font = `bold ${~~(_r * 0.13)}px monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const ql = _r * 0.58;
      for (const [l, sx, sy] of [["I",1,1],["II",-1,1],["III",-1,-1],["IV",1,-1]])
        ctx.fillText(l, _cx + sx * ql, _cy - sy * ql);
    }

    /* ── Pontos notáveis ── */
    if (cfg.showNotable) {
      ctx.fillStyle = fgm;
      for (const n of NOTABLE) {
        ctx.beginPath();
        ctx.arc(_cx + _r * Math.cos(n.a), _cy - _r * Math.sin(n.a), 2.5, 0, TWO_PI);
        ctx.fill();
      }
    }

    /* ── Círculo ── */
    ctx.strokeStyle = dark ? "rgba(220,210,190,.3)" : "rgba(60,60,80,.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(_cx, _cy, _r, 0, TWO_PI); ctx.stroke();

    /* ── Arco percorrido (externo) ── */
    ctx.strokeStyle = acc + "80"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(_cx, _cy, _r, 0, -tN, false); ctx.stroke();

    /* ── Arco interno (indicador de ângulo) ── */
    ctx.strokeStyle = acc + "90"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(_cx, _cy, _r * 0.22, 0, -tN, false); ctx.stroke();

    /* ── Label do ângulo ── */
    const la = tN / 2, lr = _r * 0.32;
    ctx.fillStyle = fg;
    ctx.font = `bold ${~~(_r * 0.115)}px monospace`;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    let lbl = snapped ? snapped.label : `${(tN * 180 / PI).toFixed(1)}°`;
    const turns = (t / TWO_PI).toFixed(1);
    if (Math.abs(t) > TWO_PI + 0.2) lbl += ` ×${turns}`;
    ctx.fillText(lbl, _cx + lr * Math.cos(la) + 4, _cy - lr * Math.sin(la));

    /* ── Tangente ── */
    if (cfg.showTan && Math.abs(co) > 0.07) {
      const tan = si / co;
      const tx  = _cx + _r;          // x=1 em pixels
      const ty  = _cy - _r * tan;    // y=tan em pixels

      // Linha vertical tracejada em x=1
      ctx.strokeStyle = green + "28"; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(tx, 0); ctx.lineTo(tx, H); ctx.stroke();
      ctx.setLineDash([]);

      // Segmento AT (tangente)
      ctx.strokeStyle = green + "cc"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(tx, _cy); ctx.lineTo(tx, ty); ctx.stroke();

      // Linha estendida do raio
      ctx.strokeStyle = green + "44"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(_cx, _cy); ctx.lineTo(tx, ty); ctx.stroke();

      // Ponto na tangente
      ctx.fillStyle = green;
      ctx.beginPath(); ctx.arc(tx, ty, 4, 0, TWO_PI); ctx.fill();

      // Label "tan θ"
      if (ty > 4 && ty < H - 4) {
        ctx.font = `bold ${~~(_r * 0.1)}px monospace`;
        ctx.fillStyle = green; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText("tan θ", tx + 6, ty);
      }
    }
    ctx.setLineDash([]);

    /* ── Projeções sin/cos ── */
    if (cfg.showProj) {
      // Projeção cos (eixo x) — cor accent
      ctx.strokeStyle = acc; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(_cx, py); ctx.lineTo(px, py); ctx.stroke();

      // Projeção sin (eixo y) — cor accent2
      ctx.strokeStyle = acc2; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(px, _cy); ctx.lineTo(px, py); ctx.stroke();
      ctx.setLineDash([]);

      // Pontos nos eixos
      ctx.fillStyle = acc;
      ctx.beginPath(); ctx.arc(px, _cy, 5, 0, TWO_PI); ctx.fill();
      ctx.fillStyle = acc2;
      ctx.beginPath(); ctx.arc(_cx, py, 5, 0, TWO_PI); ctx.fill();

      // Labels cos θ / sin θ
      const fs = ~~(_r * 0.1);
      ctx.font = `bold ${fs}px monospace`;
      ctx.fillStyle = acc; ctx.textAlign = "center";
      ctx.fillText("cos θ", (_cx + px) / 2, _cy + (si >= 0 ? 14 : -11));
      ctx.fillStyle = acc2;
      ctx.textAlign = co >= 0 ? "left" : "right"; ctx.textBaseline = "middle";
      ctx.fillText("sin θ", px + (co >= 0 ? 6 : -6), (_cy + py) / 2);
    }

    /* ── Triângulo retângulo (guia) ── */
    ctx.strokeStyle = fgm; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(_cx, _cy); ctx.lineTo(px, _cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, _cy); ctx.lineTo(px, py); ctx.stroke();
    if (Math.abs(co) > 0.06 && Math.abs(si) > 0.06) {
      const s = 6, sx2 = Math.sign(co) * s, sy2 = Math.sign(si) * s;
      ctx.beginPath();
      ctx.moveTo(px - sx2, _cy); ctx.lineTo(px - sx2, _cy - sy2); ctx.lineTo(px, _cy - sy2);
      ctx.stroke();
    }

    /* ── Raio ── */
    ctx.strokeStyle = fg; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(_cx, _cy); ctx.lineTo(px, py); ctx.stroke();

    /* ── Ponto principal P ── */
    ctx.fillStyle = snapped ? acc2 : acc;
    ctx.beginPath(); ctx.arc(px, py, 8, 0, TWO_PI); ctx.fill();
    ctx.strokeStyle = dark ? "rgba(8,8,20,.75)" : "rgba(255,255,255,.75)";
    ctx.lineWidth = 2; ctx.stroke();

    /* ── Label P ── */
    const fs2 = ~~(_r * 0.12);
    ctx.font = `bold ${fs2}px monospace`;
    ctx.fillStyle = fg;
    ctx.textAlign = co >= 0 ? "left" : "right";
    ctx.textBaseline = si >= 0 ? "bottom" : "top";
    ctx.fillText("P", px + (co >= 0 ? 10 : -10), py + (si >= 0 ? -10 : 10));

    /* ── Coordenadas do ponto (tooltip) ── */
    const fs3 = ~~(_r * 0.09);
    ctx.font = `${fs3}px monospace`;
    ctx.fillStyle = fgm;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText(`(${fmt(co, 3)}, ${fmt(si, 3)})`, px, py + (si >= 0 ? 14 : -20));

    _drawing = false;
  }

  /* ── Readout HTML ── */
  function updateReadout() {
    if (!cfg.readoutEl) return;
    const t  = theta;
    const tN = ((t % TWO_PI) + TWO_PI) % TWO_PI;
    const co = Math.cos(t), si = Math.sin(t), tn = si / co;
    const n  = snapped;
    cfg.readoutEl.innerHTML = `
      <div class="uc-row">
        <span class="uc-k" style="color:var(--accent)">cos</span>
        <span class="uc-exact">${n ? n.cos : fmt(co)}</span>
        ${n ? `<span class="uc-dec">${fmt(co, 3)}</span>` : ""}
      </div>
      <div class="uc-row">
        <span class="uc-k" style="color:var(--accent-2)">sin</span>
        <span class="uc-exact">${n ? n.sin : fmt(si)}</span>
        ${n ? `<span class="uc-dec">${fmt(si, 3)}</span>` : ""}
      </div>
      <div class="uc-row">
        <span class="uc-k" style="color:#4ade80">tan</span>
        <span class="uc-exact">${n ? n.tan : (Math.abs(co) < 0.01 ? "∄" : fmt(tn))}</span>
        ${n && n.tan !== "∄" ? `<span class="uc-dec">${fmt(tn, 3)}</span>` : ""}
      </div>
      <div class="uc-row">
        <span class="uc-k">θ</span>
        <span class="uc-exact">${n ? n.label : (tN * 180 / PI).toFixed(1) + "°"}</span>
        <span class="uc-dec">${(t * 180 / PI).toFixed(1)}° · ${t.toFixed(3)} rad</span>
      </div>
      ${Math.abs(t) > TWO_PI + 0.2
        ? `<div class="uc-snap">↻ ${(t / TWO_PI).toFixed(2)} voltas</div>`
        : ""}
      ${n ? '<div class="uc-snap">⊙ notável</div>' : ""}`;
  }

  /* ── Interatividade (pointer drag) ── */
  let prevAngle = null;

  cv.addEventListener("pointerdown", (e) => {
    const rect = cv.getBoundingClientRect();
    const pt = e;
    const mx = pt.clientX - rect.left;
    const my = pt.clientY - rect.top;
    const ppx = _cx + _r * Math.cos(theta);
    const ppy = _cy - _r * Math.sin(theta);
    const dist = Math.hypot(mx - ppx, my - ppy);
    if (dist > 48) return;
    e.preventDefault();
    cv.setPointerCapture(e.pointerId);
    prevAngle = evAngle(e);
  });

  cv.addEventListener("pointermove", (e) => {
    if (!cv.hasPointerCapture(e.pointerId)) return;
    e.preventDefault();
    const cur = evAngle(e);
    let delta = cur - prevAngle;
    if (delta > PI) delta -= TWO_PI;
    if (delta < -PI) delta += TWO_PI;
    theta += delta;
    prevAngle = cur;

    snapped = trySnap(theta);
    if (snapped) {
      const turns = Math.round(theta / TWO_PI);
      const snapTarget = turns * TWO_PI + snapped.a;
      if (Math.abs(snapTarget - theta) < 0.15) {
        theta = snapTarget;
      }
    }

    if (!raf) {
      raf = requestAnimationFrame(() => {
        raf = null;
        draw();
        updateReadout();
        notify();
      });
    }
  });

  cv.addEventListener("pointerup", (e) => cv.releasePointerCapture(e.pointerId));
  cv.addEventListener("pointercancel", (e) => cv.releasePointerCapture(e.pointerId));

  /* ── Resize ── */
  const ro = new ResizeObserver(() => {
    layout();
    draw();
  });
  ro.observe(root);

  /* ── Theme change ── */
  window.addEventListener("themechange", () => { layout(); draw(); });

  /* ── Init ── */
  layout();
  draw();
  updateReadout();

  /* ── API pública ── */
  function getData() {
    const co = Math.cos(theta), si = Math.sin(theta);
    const quadrant =
      co >= 0 && si >= 0 ? "I" :
      co <  0 && si >= 0 ? "II" :
      co <  0 && si <  0 ? "III" : "IV";
    return { sin: si, cos: co, tan: si / co, quadrant, notable: snapped };
  }

  return {
    setTheta(t) { theta = t; snapped = trySnap(t); draw(); updateReadout(); notify(); },
    getTheta()  { return theta; },
    getData,
    on(fn)       { listeners.push(fn); },
    off(fn)      { listeners = listeners.filter((f) => f !== fn); },
    destroy()    {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      root.innerHTML = "";
    },
    redraw()     { layout(); draw(); updateReadout(); },
  };
}


/* ==========================================================
   2. CircleToGraph — CONEXÃO CT → GRÁFICO (split screen)
   ==========================================================

   Layout:
   ┌──────────────┬──────────────────────────┐
   │  Círculo     │  Gráfico de seno/cos     │
   │  Trigonom.   │  (sincronizado)          │
   │  (canvas)    │  (Plot engine)           │
   └──────────────┴──────────────────────────┘
   │         ▶ Play  ◀ Pause   Velocidade     │
   │         ───●────────── slider            │

   API:
   ────
   mountCircleToGraph(root, opts?) → CTGController

   opts.functions    — ["sin"] | ["cos"] | ["sin","cos"] (default: ["sin"])
   opts.speed        — velocidade (1 = normal) (default: 1)
   opts.autoPlay     — iniciar autoplay (default: false)
   opts.showLine     — linha horizontal conecto CT ↔ gráfico (default: true)
   opts.onChange(theta, values) — callback

   Retorno:
   ─────────
   .play() / .pause() / .toggle()
   .setSpeed(v)
   .setFunctions(["sin","cos"])
   .setTheta(t)
   .destroy()
   ========================================================== */

export function mountCircleToGraph(root, opts = {}) {
  const cfg = {
    functions:  opts.functions  ?? ["sin"],
    speed:      opts.speed      ?? 1,
    autoPlay:   opts.autoPlay   ?? false,
    showLine:   opts.showLine   ?? true,
    onChange:    opts.onChange   ?? null,
  };

  /* ── DOM ── */
  root.innerHTML = `
    <div class="ctg-container">
      <div class="ctg-left">
        <div class="ctg-label">Círculo Trigonométrico</div>
        <div id="ctg-cv-wrap" class="ctg-cv-wrap"></div>
      </div>
      <div class="ctg-right">
        <div class="ctg-label">Gráfico</div>
        <canvas id="ctg-graph" class="ctg-graph"></canvas>
      </div>
    </div>
    <div class="ctg-controls">
      <button class="ctg-btn" id="ctg-play" title="Play/Pause">▶</button>
      <div class="ctg-speed-wrap">
        <span class="ctg-speed-label">Vel:</span>
        <input type="range" id="ctg-speed" min="0.1" max="3" step="0.1" value="${cfg.speed}" class="ctg-slider">
        <span id="ctg-speed-val" class="ctg-speed-val">${cfg.speed}×</span>
      </div>
      <div class="ctg-func-toggle">
        ${cfg.functions.includes("sin") ? '<button class="ctg-btn ctg-active" id="ctg-sin">sin</button>' : '<button class="ctg-btn" id="ctg-sin">sin</button>'}
        ${cfg.functions.includes("cos") ? '<button class="ctg-btn ctg-active" id="ctg-cos">cos</button>' : '<button class="ctg-btn" id="ctg-cos">cos</button>'}
      </div>
    </div>
    <div class="ctg-readout mono" id="ctg-readout">θ = 0° — sin = 0.000 — cos = 1.000</div>
  `;

  const cvWrap = root.querySelector("#ctg-cv-wrap");
  const graphCv = root.querySelector("#ctg-graph");
  const playBtn = root.querySelector("#ctg-play");
  const speedSlider = root.querySelector("#ctg-speed");
  const speedVal = root.querySelector("#ctg-speed-val");
  const readoutEl = root.querySelector("#ctg-readout");
  const sinBtn = root.querySelector("#ctg-sin");
  const cosBtn = root.querySelector("#ctg-cos");

  /* ── Circle component ── */
  const circleReadout = document.createElement("div");
  circleReadout.className = "ctg-circle-readout";
  cvWrap.appendChild(circleReadout);

  const circle = mountTrigCircle(cvWrap, {
    readoutEl: circleReadout,
    showTan: false,
    initialTheta: 0,
    onChange: (t, data) => {
      if (cfg.onChange) cfg.onChange(t, data);
      updateGraphLine(t);
    },
  });

  /* ── Plot engine ── */
  const plot = new Plot(graphCv, {
    piAxis: true,
    xmin: -0.5,
    xmax: TWO_PI + 0.5,
    ymin: -1.8,
    ymax: 1.8,
  });

  /* ── Estado ── */
  let playing = cfg.autoPlay;
  let speed = cfg.speed;
  let activeFuncs = new Set(cfg.functions);
  let animId = null;
  let lastTime = null;
  let theta = 0;
  let lineTheta = 0;

  /* ── Cores das funções ── */
  const fnColors = {
    sin: COLORS.accent2,  // amarelo
    cos: COLORS.accent,   // laranja
  };

  /* ── Atualizar curvas no plot ── */
  function updateCurves() {
    const curves = [];
    if (activeFuncs.has("sin")) {
      curves.push({ fn: Math.sin, color: fnColors.sin, label: "sin(x)" });
    }
    if (activeFuncs.has("cos")) {
      curves.push({ fn: Math.cos, color: fnColors.cos, label: "cos(x)" });
    }
    plot.setCurves(curves);
  }

  /* ── Linha vertical sincronizada ── */
  function updateGraphLine(t) {
    lineTheta = t;
    const tN = ((t % TWO_PI) + TWO_PI) % TWO_PI;
    const markers = [];

    if (activeFuncs.has("sin")) {
      markers.push({
        x: tN, y: Math.sin(t),
        label: `sin=${fmt(Math.sin(t), 3)}`,
      });
    }
    if (activeFuncs.has("cos")) {
      markers.push({
        x: tN, y: Math.cos(t),
        label: `cos=${fmt(Math.cos(t), 3)}`,
      });
    }

    plot.setMarkers(markers);
    plot.draw();

    // Desenhar linha vertical tracejada
    const ctx = plot.ctx;
    const px = plot.X(tN);
    ctx.save();
    ctx.strokeStyle = COLORS.fgMut;
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, plot.H);
    ctx.stroke();
    ctx.restore();

    // Desenhar linha horizontal conectando ao círculo
    if (cfg.showLine && activeFuncs.size > 0) {
      const val = activeFuncs.has("sin") ? Math.sin(t) : Math.cos(t);
      const py = plot.Y(val);
      ctx.save();
      ctx.strokeStyle = activeFuncs.has("sin") ? fnColors.sin + "60" : fnColors.cos + "60";
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(plot.W, py);
      ctx.stroke();
      ctx.restore();
    }

    // Readout
    const co = Math.cos(t), si = Math.sin(t);
    readoutEl.textContent = `θ = ${(tN * 180 / PI).toFixed(1)}° (${tN.toFixed(3)} rad) — sin = ${fmt(si, 3)} — cos = ${fmt(co, 3)}`;
  }

  /* ── Animação ── */
  function animate(ts) {
    if (!playing) return;
    if (lastTime === null) lastTime = ts;
    const dt = (ts - lastTime) / 1000;
    lastTime = ts;

    theta += speed * dt;
    circle.setTheta(theta);
    animId = requestAnimationFrame(animate);
  }

  /* ── Controles ── */
  playBtn.addEventListener("click", () => {
    playing = !playing;
    playBtn.textContent = playing ? "⏸" : "▶";
    if (playing) {
      lastTime = null;
      animId = requestAnimationFrame(animate);
    } else if (animId) {
      cancelAnimationFrame(animId);
    }
  });

  speedSlider.addEventListener("input", () => {
    speed = parseFloat(speedSlider.value);
    speedVal.textContent = speed.toFixed(1) + "×";
  });

  sinBtn?.addEventListener("click", () => {
    if (activeFuncs.has("sin")) { activeFuncs.delete("sin"); sinBtn.classList.remove("ctg-active"); }
    else { activeFuncs.add("sin"); sinBtn.classList.add("ctg-active"); }
    updateCurves();
    updateGraphLine(theta);
  });

  cosBtn?.addEventListener("click", () => {
    if (activeFuncs.has("cos")) { activeFuncs.delete("cos"); cosBtn.classList.remove("ctg-active"); }
    else { activeFuncs.add("cos"); cosBtn.classList.add("ctg-active"); }
    updateCurves();
    updateGraphLine(theta);
  });

  /* ── Resize ── */
  const ro = new ResizeObserver(() => { plot.resize(); updateGraphLine(theta); });
  ro.observe(graphCv);

  /* ── Init ── */
  updateCurves();
  updateGraphLine(0);

  return {
    play()       { playing = true; playBtn.textContent = "⏸"; lastTime = null; animId = requestAnimationFrame(animate); },
    pause()      { playing = false; playBtn.textContent = "▶"; if (animId) cancelAnimationFrame(animId); },
    toggle()     { if (playing) this.pause(); else this.play(); },
    setSpeed(v)  { speed = v; speedSlider.value = v; speedVal.textContent = v.toFixed(1) + "×"; },
    setFunctions(fns) { activeFuncs = new Set(fns); updateCurves(); updateGraphLine(theta); },
    setTheta(t)  { theta = t; circle.setTheta(t); updateGraphLine(t); },
    getTheta()   { return theta; },
    destroy()    { this.pause(); circle.destroy(); plot.destroy?.(); root.innerHTML = ""; },
  };
}


/* ==========================================================
   3. TrigParamExplorer — EXPLORADOR DE PARÂMETROS
   ==========================================================

   Para y = A·sin(Bx + C) + D (ou cos, ou tan)
   Com sliders interativos para cada parâmetro.

   API:
   ────
   mountTrigParamExplorer(root, opts?) → TPEController

   opts.funcType   — "sin" | "cos" | | "tan" (default: "sin")
   opts.A          — amplitude inicial (default: 1)
   opts.B          — frequência inicial (default: 1)
   opts.C          — fase inicial (default: 0)
   opts.D          — deslocamento vertical inicial (default: 0)
   opts.showMarkers — mostrar zeros/máx/mín (default: true)
   opts.showPeriod  — indicador de período (default: true)
   opts.showRange   — indicador de range (default: true)
   opts.compare     — mostrar sen e cos simultaneamente (default: false)

   Retorno:
   ─────────
   .setParams({A,B,C,D})
   .getParams()
   .setFuncType("cos")
   .setCompare(bool)
   .destroy()
   ========================================================== */

export function mountTrigParamExplorer(root, opts = {}) {
  const cfg = {
    funcType:     opts.funcType     ?? "sin",
    A:            opts.A            ?? 1,
    B:            opts.B            ?? 1,
    C:            opts.C            ?? 0,
    D:            opts.D            ?? 0,
    showMarkers:  opts.showMarkers  ?? true,
    showPeriod:   opts.showPeriod   ?? true,
    showRange:    opts.showRange    ?? true,
    compare:      opts.compare      ?? false,
  };

  /* ── DOM ── */
  root.innerHTML = `
    <div class="tpe-container">
      <div class="tpe-sidebar">
        <div class="tpe-func-toggle">
          <button class="tpe-btn ${cfg.funcType === "sin" ? "tpe-active" : ""}" data-fn="sin">sin</button>
          <button class="tpe-btn ${cfg.funcType === "cos" ? "tpe-active" : ""}" data-fn="cos">cos</button>
          <button class="tpe-btn ${cfg.funcType === "tan" ? "tpe-active" : ""}" data-fn="tan">tan</button>
        </div>

        <div class="tpe-slider-group">
          <label class="tpe-label">
            <span class="tpe-param">A</span> — Amplitude
            <span class="tpe-val mono" id="tpe-A-val">${cfg.A}</span>
          </label>
          <input type="range" id="tpe-A" min="0.1" max="5" step="0.1" value="${cfg.A}" class="tpe-slider">
        </div>

        <div class="tpe-slider-group">
          <label class="tpe-label">
            <span class="tpe-param">B</span> — Frequência
            <span class="tpe-val mono" id="tpe-B-val">${cfg.B}</span>
          </label>
          <input type="range" id="tpe-B" min="0.1" max="5" step="0.1" value="${cfg.B}" class="tpe-slider">
        </div>

        <div class="tpe-slider-group">
          <label class="tpe-label">
            <span class="tpe-param">C</span> — Fase
            <span class="tpe-val mono" id="tpe-C-val">${cfg.C.toFixed(2)}</span>
          </label>
          <input type="range" id="tpe-C" min="${-PI}" max="${PI}" step="0.05" value="${cfg.C}" class="tpe-slider">
        </div>

        <div class="tpe-slider-group">
          <label class="tpe-label">
            <span class="tpe-param">D</span> — Deslocamento Vertical
            <span class="tpe-val mono" id="tpe-D-val">${cfg.D.toFixed(2)}</span>
          </label>
          <input type="range" id="tpe-D" min="-3" max="3" step="0.1" value="${cfg.D}" class="tpe-slider">
        </div>

        <div class="tpe-info" id="tpe-info">
          <div class="tpe-info-row">Período: <span class="mono" id="tpe-period">${(TWO_PI / cfg.B).toFixed(2)}</span></div>
          <div class="tpe-info-row">Imagem: <span class="mono" id="tpe-range">[${(cfg.D - cfg.A).toFixed(1)}, ${(cfg.D + cfg.A).toFixed(1)}]</span></div>
        </div>

        <label class="tpe-compare-label">
          <input type="checkbox" id="tpe-compare" ${cfg.compare ? "checked" : ""}>
          Comparar com cos
        </label>
      </div>

      <div class="tpe-graph">
        <canvas id="tpe-canvas" class="tpe-canvas"></canvas>
      </div>
    </div>
  `;

  const canvas = root.querySelector("#tpe-canvas");
  const sliderA = root.querySelector("#tpe-A");
  const sliderB = root.querySelector("#tpe-B");
  const sliderC = root.querySelector("#tpe-C");
  const sliderD = root.querySelector("#tpe-D");
  const valA = root.querySelector("#tpe-A-val");
  const valB = root.querySelector("#tpe-B-val");
  const valC = root.querySelector("#tpe-C-val");
  const valD = root.querySelector("#tpe-D-val");
  const periodEl = root.querySelector("#tpe-period");
  const rangeEl = root.querySelector("#tpe-range");
  const compareCb = root.querySelector("#tpe-compare");

  /* ── Plot ── */
  const plot = new Plot(canvas, {
    piAxis: true,
    xmin: -2 * PI,
    xmax: 2 * PI,
    ymin: -4,
    ymax: 4,
  });

  /* ── Estado ── */
  let params = { A: cfg.A, B: cfg.B, C: cfg.C, D: cfg.D };
  let funcType = cfg.funcType;
  let compare = cfg.compare;
  /* ── Função base ── */
  function baseFn(x) {
    switch (funcType) {
      case "sin": return Math.sin(x);
      case "cos": return Math.cos(x);
      case "tan": return Math.tan(x);
      default: return Math.sin(x);
    }
  }

  /* ── Função parametrizada ── */
  function paramFn(x) {
    return params.A * baseFn(params.B * x + params.C) + params.D;
  }

  /* ── Atualizar ── */
  function update() {
    const curves = [];
    const accent = COLORS.accent;

    // Função parametrizada
    curves.push({ fn: paramFn, color: accent, width: 2.8 });

    // Comparação com cos (se ativo)
    if (compare && funcType !== "cos") {
      const cosFn = (x) => Math.cos(x);
      curves.push({ fn: cosFn, color: COLORS.accent2, width: 2, label: "cos(x)" });
    }

    plot.setCurves(curves);

    // Assíntotas para tan
    if (funcType === "tan") {
      const asymptotes = [];
      const period = PI / params.B;
      const offset = -params.C / params.B;
      for (let k = -5; k <= 5; k++) {
        const ax = offset + (k + 0.5) * period;
        if (ax >= plot.view.xmin && ax <= plot.view.xmax) {
          asymptotes.push({ y: params.D + params.A * 0 }); //Dummy, vertical handled by _drawCurve break
        }
      }
      plot.setAsymptotes([]);
    } else {
      plot.setAsymptotes([]);
    }

    // Marcadores (zeros, máximos, mínimos)
    if (cfg.showMarkers && funcType !== "tan") {
      const markers = [];
      const period = TWO_PI / params.B;

      // Período visível
      const xMin = plot.view.xmin;
      const xMax = plot.view.xmax;

      for (let k = Math.floor(xMin / period); k <= Math.ceil(xMax / period); k++) {
        // Zero: baseFn(Bx + C) = 0
        if (funcType === "sin") {
          // sin(t) = 0 em t = nπ → Bx + C = nπ → x = (nπ - C)/B
          for (let n = Math.floor((params.B * xMin + params.C) / PI); n <= Math.ceil((params.B * xMax + params.C) / PI); n++) {
            const x = (n * PI - params.C) / params.B;
            if (x >= xMin && x <= xMax) {
              markers.push({ x, y: params.D, label: "" });
            }
          }
          // Máximo: sin = 1 em t = π/2 + 2nπ
          for (let n = Math.floor((params.B * xMin + params.C - HALF_PI) / TWO_PI); n <= Math.ceil((params.B * xMax + params.C - HALF_PI) / TWO_PI); n++) {
            const x = (HALF_PI + TWO_PI * n - params.C) / params.B;
            if (x >= xMin && x <= xMax) {
              markers.push({ x, y: params.D + params.A, label: `máx=${fmt(params.D + params.A, 2)}` });
            }
          }
          // Mínimo: sin = -1 em t = 3π/2 + 2nπ
          for (let n = Math.floor((params.B * xMin + params.C - 3*HALF_PI) / TWO_PI); n <= Math.ceil((params.B * xMax + params.C - 3*HALF_PI) / TWO_PI); n++) {
            const x = (3 * HALF_PI + TWO_PI * n - params.C) / params.B;
            if (x >= xMin && x <= xMax) {
              markers.push({ x, y: params.D - params.A, label: `mín=${fmt(params.D - params.A, 2)}` });
            }
          }
        } else if (funcType === "cos") {
          // cos(t) = 0 em t = π/2 + nπ
          for (let n = Math.floor((params.B * xMin + params.C - HALF_PI) / PI); n <= Math.ceil((params.B * xMax + params.C - HALF_PI) / PI); n++) {
            const x = (HALF_PI + PI * n - params.C) / params.B;
            if (x >= xMin && x <= xMax) {
              markers.push({ x, y: params.D, label: "" });
            }
          }
          // Máximo: cos = 1 em t = 2nπ
          for (let n = Math.floor((params.B * xMin + params.C) / TWO_PI); n <= Math.ceil((params.B * xMax + params.C) / TWO_PI); n++) {
            const x = (TWO_PI * n - params.C) / params.B;
            if (x >= xMin && x <= xMax) {
              markers.push({ x, y: params.D + params.A, label: `máx=${fmt(params.D + params.A, 2)}` });
            }
          }
          // Mínimo: cos = -1 em t = π + 2nπ
          for (let n = Math.floor((params.B * xMin + params.C - PI) / TWO_PI); n <= Math.ceil((params.B * xMax + params.C - PI) / TWO_PI); n++) {
            const x = (PI + TWO_PI * n - params.C) / params.B;
            if (x >= xMin && x <= xMax) {
              markers.push({ x, y: params.D - params.A, label: `mín=${fmt(params.D - params.A, 2)}` });
            }
          }
        }
      }
      plot.setMarkers(markers);
    } else {
      plot.setMarkers([]);
    }

    // Info sidebar
    if (funcType === "tan") {
      periodEl.textContent = `${(PI / params.B).toFixed(2)} (π/${params.B})`;
      rangeEl.textContent = "ℝ (todos os reais)";
    } else {
      periodEl.textContent = `${(TWO_PI / params.B).toFixed(2)} (2π/${params.B})`;
      rangeEl.textContent = `[${(params.D - params.A).toFixed(2)}, ${(params.D + params.A).toFixed(2)}]`;
    }

    plot.draw();
  }

  /* ── Event listeners ── */
  sliderA.addEventListener("input", () => {
    params.A = parseFloat(sliderA.value);
    valA.textContent = params.A.toFixed(1);
    update();
  });
  sliderB.addEventListener("input", () => {
    params.B = parseFloat(sliderB.value);
    valB.textContent = params.B.toFixed(1);
    update();
  });
  sliderC.addEventListener("input", () => {
    params.C = parseFloat(sliderC.value);
    valC.textContent = params.C.toFixed(2);
    update();
  });
  sliderD.addEventListener("input", () => {
    params.D = parseFloat(sliderD.value);
    valD.textContent = params.D.toFixed(2);
    update();
  });

  root.querySelectorAll("[data-fn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      funcType = btn.dataset.fn;
      root.querySelectorAll("[data-fn]").forEach((b) => b.classList.remove("tpe-active"));
      btn.classList.add("tpe-active");
      update();
    });
  });

  compareCb.addEventListener("change", () => {
    compare = compareCb.checked;
    update();
  });

  /* ── Resize ── */
  const ro = new ResizeObserver(() => { plot.resize(); update(); });
  ro.observe(canvas);

  /* ── Theme ── */
  window.addEventListener("themechange", () => update());

  /* ── Init ── */
  update();

  return {
    setParams(p)  { Object.assign(params, p); update(); },
    getParams()   { return { ...params }; },
    setFuncType(t){ funcType = t; update(); },
    setCompare(v) { compare = v; compareCb.checked = v; update(); },
    destroy()     { ro.disconnect(); root.innerHTML = ""; },
  };
}


/* ==========================================================
   4. TangentVis — VISUALIZAÇÃO DA TANGENTE NA CT
   ==========================================================

   Mostra:
   - Círculo unitário com linha vertical em x=1
   - Segmento AT representando tan θ
   - Crescimento até infinito quando θ → π/2
   - Gráfico de tan(x) com assíntotas ao lado

   API:
   ────
   mountTangentVis(root, opts?) → TVController

   opts.initialTheta — ângulo inicial (default: PI/4)
   opts.showGraph    — mostrar gráfico ao lado (default: true)
   opts.onChange(theta, tanValue) — callback

   Retorno:
   ─────────
   .setTheta(t)
   .getTheta()
   .destroy()
   ========================================================== */

export function mountTangentVis(root, opts = {}) {
  const cfg = {
    initialTheta: opts.initialTheta ?? PI / 4,
    showGraph:    opts.showGraph    ?? true,
    onChange:      opts.onChange     ?? null,
  };

  /* ── DOM ── */
  root.innerHTML = `
    <div class="tv-container">
      <div class="tv-circle-wrap">
        <div class="tv-label">Círculo Trigonométrico</div>
        <div id="tv-cv-wrap" class="tv-cv-wrap"></div>
      </div>
      ${cfg.showGraph ? `
      <div class="tv-graph-wrap">
        <div class="tv-label">Gráfico de tan(x)</div>
        <canvas id="tv-graph" class="tv-graph"></canvas>
      </div>
      ` : ""}
    </div>
    <div class="tv-readout mono" id="tv-readout">θ = 45° — tan θ = 1.000</div>
  `;

  const cvWrap = root.querySelector("#tv-cv-wrap");
  const readoutEl = root.querySelector("#tv-readout");

  /* ── Tangent Circle (custom draw) ── */
  const cv = document.createElement("canvas");
  cv.style.cssText = "width:100%;height:100%;display:block;cursor:crosshair;border-radius:8px;";
  cvWrap.appendChild(cv);

  let { ctx, W, H } = setupCanvas(cv);

  let theta = cfg.initialTheta;
  let listeners = [];
  let _cx, _cy, _r;
  let _drawing2 = false;

  function layout() {
    const res = setupCanvas(cv);
    ctx = res.ctx; W = res.W; H = res.H;
    const pad = 50;
    _cx = W * 0.35;
    _cy = H / 2;
    _r  = Math.min(W * 0.3, H / 2 - pad);
    if (_r < 10) _r = 10;
  }

  function draw() {
    if (_drawing2) return;
    _drawing2 = true;
    ctx.clearRect(0, 0, W, H);

    const dark = COLORS.isDark;
    const fg    = COLORS.fg;
    const fgm   = COLORS.fgMut;
    const acc   = COLORS.accent;
    const green = COLORS.green;
    const red   = COLORS.red;

    const tN = ((theta % TWO_PI) + TWO_PI) % TWO_PI;
    const co = Math.cos(theta), si = Math.sin(theta);
    const px = _cx + _r * co;
    const py = _cy - _r * si;

    /* ── Círculo ── */
    ctx.strokeStyle = dark ? "rgba(220,210,190,.3)" : "rgba(60,60,80,.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(_cx, _cy, _r, 0, TWO_PI); ctx.stroke();

    /* ── Eixos ── */
    ctx.strokeStyle = fgm; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(_cx - _r * 1.5, _cy); ctx.lineTo(_cx + _r * 1.5, _cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(_cx, _cy - _r * 1.5); ctx.lineTo(_cx, _cy + _r * 1.5); ctx.stroke();

    /* ── Linha vertical em x=1 ── */
    const txLine = _cx + _r;
    ctx.strokeStyle = green + "30"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(txLine, 0); ctx.lineTo(txLine, H); ctx.stroke();
    ctx.setLineDash([]);

    /* ── Rótulo "x = 1" ── */
    ctx.fillStyle = fgm;
    ctx.font = `${~~(_r * 0.1)}px monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    ctx.fillText("x = 1", txLine, _cy - _r * 1.3);

    /* ── Raio estendido até a linha tangente ── */
    if (Math.abs(co) > 0.05) {
      const tan = si / co;
      const ty = _cy - _r * tan;

      // Linha estendida (do centro até a tangente)
      ctx.strokeStyle = green + "40"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(_cx, _cy); ctx.lineTo(txLine, ty); ctx.stroke();

      // Segmento AT (tangente —destaque)
      const segLen = Math.min(Math.abs(ty - _cy), H * 0.45);
      const sign = Math.sign(ty - _cy);
      ctx.strokeStyle = green; ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(txLine, _cy);
      ctx.lineTo(txLine, _cy + sign * segLen);
      ctx.stroke();

      // Ponto na tangente
      ctx.fillStyle = green;
      ctx.beginPath(); ctx.arc(txLine, ty, 5, 0, TWO_PI); ctx.fill();
      ctx.strokeStyle = dark ? "rgba(8,8,20,.75)" : "rgba(255,255,255,.75)";
      ctx.lineWidth = 1.5; ctx.stroke();

      // Label "tan θ"
      ctx.fillStyle = green;
      ctx.font = `bold ${~~(_r * 0.11)}px monospace`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("tan θ", txLine + 8, ty);

      // Valor numérico
      ctx.fillStyle = green;
      ctx.font = `${~~(_r * 0.1)}px monospace`;
      ctx.fillText(`= ${fmt(tan, 2)}`, txLine + 8, ty + 16);

      // Linha tracejada horizontal do ponto até a tangente
      ctx.strokeStyle = acc + "50"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(txLine, py); ctx.stroke();
      ctx.setLineDash([]);
    }

    /* ── Arco percorrido ── */
    ctx.strokeStyle = acc + "80"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(_cx, _cy, _r, 0, -tN, false); ctx.stroke();

    /* ── Label do ângulo ── */
    const la = tN / 2, lr = _r * 0.32;
    ctx.fillStyle = fg;
    ctx.font = `bold ${~~(_r * 0.11)}px monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(theta.toFixed(1) + "°", _cx + lr * Math.cos(la), _cy - lr * Math.sin(la));

    /* ── Raio ── */
    ctx.strokeStyle = fg; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(_cx, _cy); ctx.lineTo(px, py); ctx.stroke();

    /* ── Ponto P ── */
    ctx.fillStyle = acc;
    ctx.beginPath(); ctx.arc(px, py, 7, 0, TWO_PI); ctx.fill();
    ctx.strokeStyle = dark ? "rgba(8,8,20,.75)" : "rgba(255,255,255,.75)";
    ctx.lineWidth = 2; ctx.stroke();

    _drawing2 = false;
  }

  /* ── Gráfico de tan ── */
  let plot = null;
  if (cfg.showGraph) {
    const graphCv = root.querySelector("#tv-graph");
    plot = new Plot(graphCv, {
      piAxis: true,
      xmin: -PI,
      xmax: PI,
      ymin: -4,
      ymax: 4,
    });

    // Assíntotas verticais em x = ±π/2
    // (Plot não suporta assíntotas verticais diretamente,
    //  mas o _drawCurve quebra em jumps grandes)
    plot.setCurves([
      { fn: Math.tan, color: COLORS.green, width: 2.5 },
    ]);
    plot.setAsymptotes([]);

    // Marcador na posição atual
    function updateGraphMarkers() {
      const tN = ((theta % TWO_PI) + TWO_PI) % TWO_PI;
      // Normalizar para [-π, π]
      let tPlot = tN;
      if (tPlot > PI) tPlot -= TWO_PI;
      const tanVal = Math.tan(theta);
      if (Math.abs(tanVal) < 10) {
        plot.setMarkers([{ x: tPlot, y: tanVal, label: `tan=${fmt(tanVal, 2)}` }]);
      } else {
        plot.setMarkers([]);
      }
      plot.draw();

      // Linha vertical tracejada
      const ctx2 = plot.ctx;
      const px = plot.X(tPlot);
      ctx2.save();
      ctx2.strokeStyle = COLORS.green + "60";
      ctx2.setLineDash([4, 3]);
      ctx2.lineWidth = 1;
      ctx2.beginPath();
      ctx2.moveTo(px, 0);
      ctx2.lineTo(px, plot.H);
      ctx2.stroke();
      ctx2.restore();
    }
    // Armazenar para uso externo
    root._updateGraphMarkers = updateGraphMarkers;

    const ro2 = new ResizeObserver(() => { plot.resize(); root._updateGraphMarkers?.(); });
    ro2.observe(graphCv);
  }

  /* ── Interatividade ── */
  function evAngle(e) {
    const rect = cv.getBoundingClientRect();
    const pt = e.touches ? e.touches[0] : e;
    const px = pt.clientX - rect.left;
    const py = pt.clientY - rect.top;
    return Math.atan2(-(py - _cy), px - _cx);
  }

  let prevAngle = null;
  cv.addEventListener("pointerdown", (e) => {
    const rect = cv.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const ppx = _cx + _r * Math.cos(theta);
    const ppy = _cy - _r * Math.sin(theta);
    if (Math.hypot(mx - ppx, my - ppy) > 48) return;
    e.preventDefault();
    cv.setPointerCapture(e.pointerId);
    prevAngle = evAngle(e);
  });

  cv.addEventListener("pointermove", (e) => {
    if (!cv.hasPointerCapture(e.pointerId)) return;
    e.preventDefault();
    const cur = evAngle(e);
    let delta = cur - prevAngle;
    if (delta > PI) delta -= TWO_PI;
    if (delta < -PI) delta += TWO_PI;
    theta += delta;
    prevAngle = cur;

    if (!raf2) {
      raf2 = requestAnimationFrame(() => {
        raf2 = null;
        draw();
        root._updateGraphMarkers?.();
        updateReadout();
      });
    }
  });

  cv.addEventListener("pointerup", (e) => cv.releasePointerCapture(e.pointerId));
  cv.addEventListener("pointercancel", (e) => cv.releasePointerCapture(e.pointerId));

  let raf2 = null;

  function updateReadout() {
    const tN = ((theta % TWO_PI) + TWO_PI) % TWO_PI;
    const co = Math.cos(theta), si = Math.sin(theta);
    const tanVal = si / co;
    readoutEl.textContent = `θ = ${(tN * 180 / PI).toFixed(1)}° (${tN.toFixed(3)} rad) — tan θ = ${Math.abs(co) < 0.01 ? "∞" : fmt(tanVal, 3)}`;
  }

  /* ── Resize & Theme ── */
  const ro = new ResizeObserver(() => { layout(); draw(); });
  ro.observe(cvWrap);
  window.addEventListener("themechange", () => { layout(); draw(); });

  /* ── Init ── */
  layout();
  draw();
  updateReadout();
  root._updateGraphMarkers?.();

  return {
    setTheta(t) {
      theta = t;
      draw();
      root._updateGraphMarkers?.();
      updateReadout();
    },
    getTheta() { return theta; },
    on(fn)     { listeners.push(fn); },
    off(fn)    { listeners = listeners.filter((f) => f !== fn); },
    destroy()  { if (raf2) cancelAnimationFrame(raf2); ro.disconnect(); root.innerHTML = ""; },
  };
}


/* ==========================================================
   5. PeriodicVis — FENÔMENOS PERIÓDICOS
   ==========================================================

   5 animações independentes, cada uma com:
   - Animação do fenômeno (canvas)
   - Gráfico correspondente (Plot)
   - Controles de parâmetro
   - Leitura de valores

   Sub-componentes:
   ────────────────
   A) HarmonicOscillator  — Movimento Harmônico Simples (mola)
   B) ACCurrent           — Corrente alternada (sine wave)
   C) TemperatureCycle    — Variação de temperatura (cosenoide)
   D) DaylightCycle       — Horas de luz (ciclo anual)

   API:
   ────
   mountPeriodicVis(root, type, opts?) → PVController

   type: "sho" | "ac" | "temp" | "daylight"

   opts.amplitude — amplitudo inicial
   opts.frequency — frequência inicial
   opts.phase     — fase inicial
   opts.onChange(params) — callback

   Retorno:
   ─────────
   .setParams({amplitude, frequency, phase})
   .getParams()
   .play() / .pause()
   .destroy()
   ========================================================== */

export function mountPeriodicVis(root, type, opts = {}) {
  const cfg = {
    amplitude: opts.amplitude ?? 1,
    frequency: opts.frequency ?? 1,
    phase:     opts.phase     ?? 0,
    onChange:   opts.onChange  ?? null,
  };

  /* ── Configurações por tipo ── */
  const TYPES = {
    sho: {
      title: "Movimento Harmônico Simples",
      subtitle: "Massa presa a uma mola",
      unit: "m",
      timeUnit: "s",
      fn: (t, A, w, phi) => A * Math.cos(w * t + phi),
      color: COLORS.cyan,
      rangeY: [-2, 2],
      rangeTime: [0, 8],
    },
    ac: {
      title: "Corrente Alternada (AC)",
      subtitle: "Tensão da rede elétrica",
      unit: "V",
      timeUnit: "ms",
      fn: (t, A, w, phi) => A * Math.sin(w * t + phi),
      color: COLORS.accent,
      rangeY: [-170, 170],
      rangeTime: [0, 0.04], // 2 períodos de 60Hz ≈ 33ms
    },
    temp: {
      title: "Variação de Temperatura",
      subtitle: "Temperatura ao longo do dia",
      unit: "°C",
      timeUnit: "h",
      fn: (t, A, w, phi) => 25 + A * Math.cos(w * t + phi),
      color: COLORS.red,
      rangeY: [15, 35],
      rangeTime: [0, 24],
    },
    daylight: {
      title: "Horas de Dia — Ciclo Anual",
      subtitle: "Duração do dia ao longo do ano",
      unit: "h",
      timeUnit: "meses",
      fn: (t, A, w, phi) => 12 + A * Math.cos(w * t + phi),
      color: COLORS.accent2,
      rangeY: [6, 18],
      rangeTime: [0, 12],
    },
  };

  const T = TYPES[type] || TYPES.sho;

  /* ── DOM ── */
  root.innerHTML = `
    <div class="pv-container">
      <div class="pv-anim-wrap">
        <div class="pv-title">${T.title}</div>
        <div class="pv-subtitle">${T.subtitle}</div>
        <canvas id="pv-anim" class="pv-anim"></canvas>
        <div class="pv-readout mono" id="pv-readout">
          t = 0.00 ${T.timeUnit} — valor = ${T.fn(0, cfg.amplitude, cfg.frequency * PI * 2, cfg.phase).toFixed(2)} ${T.unit}
        </div>
      </div>
      <div class="pv-graph-wrap">
        <div class="pv-label">Gráfico</div>
        <canvas id="pv-graph" class="pv-graph"></canvas>
      </div>
    </div>
    <div class="pv-controls">
      <div class="pv-slider-group">
        <label class="pv-label">
          Amplitude
          <span class="pv-val mono" id="pv-A-val">${cfg.amplitude}</span>
        </label>
        <input type="range" id="pv-A" min="0.1" max="3" step="0.1" value="${cfg.amplitude}" class="pv-slider">
      </div>
      <div class="pv-slider-group">
        <label class="pv-label">
          Frequência
          <span class="pv-val mono" id="pv-f-val">${cfg.frequency}</span>
        </label>
        <input type="range" id="pv-f" min="0.1" max="3" step="0.1" value="${cfg.frequency}" class="pv-slider">
      </div>
      <div class="pv-slider-group">
        <label class="pv-label">
          Fase
          <span class="pv-val mono" id="pv-p-val">${cfg.phase.toFixed(2)}</span>
        </label>
        <input type="range" id="pv-p" min="${-PI}" max="${PI}" step="0.05" value="${cfg.phase}" class="pv-slider">
      </div>
      <div class="pv-btn-group">
        <button class="pv-btn" id="pv-play">▶ Play</button>
      </div>
    </div>
  `;

  const animCv = root.querySelector("#pv-anim");
  const graphCv = root.querySelector("#pv-graph");
  const sliderA = root.querySelector("#pv-A");
  const sliderF = root.querySelector("#pv-f");
  const sliderP = root.querySelector("#pv-p");
  const valA = root.querySelector("#pv-A-val");
  const valF = root.querySelector("#pv-f-val");
  const valP = root.querySelector("#pv-p-val");
  const playBtn = root.querySelector("#pv-play");
  const readoutEl = root.querySelector("#pv-readout");

  /* ── Canvas anim ── */
  let animCtx, animW, animH;
  function setupAnim() {
    const res = setupCanvas(animCv);
    animCtx = res.ctx; animW = res.W; animH = res.H;
  }
  setupAnim();

  /* ── Plot ── */
  const plot = new Plot(graphCv, {
    piAxis: false,
    xmin: T.rangeTime[0],
    xmax: T.rangeTime[1],
    ymin: T.rangeY[0],
    ymax: T.rangeY[1],
  });

  /* ── Estado ── */
  let params = {
    amplitude: cfg.amplitude,
    frequency: cfg.frequency,
    phase: cfg.phase,
  };
  let playing = false;
  let t = 0;
  let animId = null;
  let lastTime = null;
  const omega = 2 * PI; // angular frequency base

  /* ── Desenhar animação ── */
  function drawAnim() {
    const ctx = animCtx;
    const w = animW, h = animH;
    ctx.clearRect(0, 0, w, h);

    const val = T.fn(t, params.amplitude, params.frequency * omega, params.phase);
    const normalizedVal = (val - T.rangeY[0]) / (T.rangeY[1] - T.rangeY[0]);
    const pixelY = h * (1 - normalizedVal);

    // Fundo com gradiente sutil
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(255,100,100,.03)");
    grad.addColorStop(0.5, "rgba(100,100,255,.03)");
    grad.addColorStop(1, "rgba(100,255,100,.03)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    if (type === "sho") {
      // Mola
      const massY = pixelY;
      const anchorY = h * 0.1;
      const coils = 8;
      const coilWidth = 20;

      ctx.strokeStyle = COLORS.fgMut;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= coils * 4; i++) {
        const frac = i / (coils * 4);
        const y = anchorY + frac * (massY - anchorY);
        const x = w / 2 + (i % 2 === 0 ? -coilWidth : coilWidth) * Math.sin(frac * coils * TWO_PI);
        if (i === 0) ctx.moveTo(w / 2, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Massa
      const massSize = 30;
      ctx.fillStyle = T.color;
      ctx.beginPath();
      ctx.roundRect(w / 2 - massSize / 2, massY - massSize / 2, massSize, massSize, 6);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("m", w / 2, massY);

      // Linha de referência (equilíbrio)
      const eqY = h * 0.5;
      ctx.strokeStyle = COLORS.fgMut + "40";
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(w * 0.2, eqY); ctx.lineTo(w * 0.8, eqY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = COLORS.fgMut;
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText("equilíbrio", w * 0.8 - 4, eqY - 6);

    } else if (type === "ac") {
      // Fio com onda
      ctx.strokeStyle = T.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const tLocal = (x / w) * T.rangeTime[1];
        const val = T.fn(tLocal, params.amplitude, params.frequency * omega, params.phase);
        const py = h / 2 - (val / T.rangeY[1]) * (h / 2 * 0.8);
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();

      // Ponto animado
      const val = T.fn(t, params.amplitude, params.frequency * omega, params.phase);
      const px = (t / T.rangeTime[1]) * w;
      const py = h / 2 - (val / T.rangeY[1]) * (h / 2 * 0.8);
      ctx.fillStyle = T.color;
      ctx.beginPath(); ctx.arc(px % w, py, 6, 0, TWO_PI); ctx.fill();

    } else if (type === "temp" || type === "daylight") {
      // Gráfico mini ao fundo
      ctx.strokeStyle = T.color + "40";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const tLocal = (x / w) * T.rangeTime[1];
        const val = T.fn(tLocal, params.amplitude, params.frequency * omega, params.phase);
        const py = h * (1 - (val - T.rangeY[0]) / (T.rangeY[1] - T.rangeY[0]));
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();

      // Ponto animado
      const px = (t / T.rangeTime[1]) * w;
      const py = pixelY;
      ctx.fillStyle = T.color;
      ctx.beginPath(); ctx.arc(px % w, py, 6, 0, TWO_PI); ctx.fill();

      // Linha vertical tracejada
      ctx.strokeStyle = T.color + "60";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(px % w, 0);
      ctx.lineTo(px % w, h);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Valor atual
    ctx.fillStyle = T.color;
    ctx.font = `bold ${~~(Math.min(w, h) * 0.08)}px monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText(`${val.toFixed(2)} ${T.unit}`, w / 2, 8);
  }

  /* ── Atualizar gráfico ── */
  function updateGraph() {
    plot.setCurves([
      { fn: (x) => T.fn(x, params.amplitude, params.frequency * omega, params.phase), color: T.color, width: 2.5 },
    ]);

    // Marcador na posição atual
    const val = T.fn(t, params.amplitude, params.frequency * omega, params.phase);
    const tMod = t % T.rangeTime[1];
    if (tMod >= T.rangeTime[0] && tMod <= T.rangeTime[1]) {
      plot.setMarkers([{ x: tMod, y: val, label: `${val.toFixed(2)} ${T.unit}` }]);
    } else {
      plot.setMarkers([]);
    }

    plot.draw();

    // Linha vertical tracejada
    const ctx = plot.ctx;
    const px = plot.X(tMod);
    ctx.save();
    ctx.strokeStyle = T.color + "60";
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, plot.H);
    ctx.stroke();
    ctx.restore();
  }

  /* ── Readout ── */
  function updateReadout() {
    const val = T.fn(t, params.amplitude, params.frequency * omega, params.phase);
    readoutEl.textContent = `t = ${t.toFixed(2)} ${T.timeUnit} — valor = ${val.toFixed(3)} ${T.unit}`;
  }

  /* ── Animação ── */
  function animate(ts) {
    if (!playing) return;
    if (lastTime === null) lastTime = ts;
    const dt = (ts - lastTime) / 1000;
    lastTime = ts;

    t += dt;
    if (t > T.rangeTime[1]) t -= T.rangeTime[1];

    drawAnim();
    updateGraph();
    updateReadout();

    animId = requestAnimationFrame(animate);
  }

  /* ── Controles ── */
  playBtn.addEventListener("click", () => {
    playing = !playing;
    playBtn.textContent = playing ? "⏸ Pausar" : "▶ Play";
    if (playing) {
      lastTime = null;
      animId = requestAnimationFrame(animate);
    } else if (animId) {
      cancelAnimationFrame(animId);
    }
  });

  sliderA.addEventListener("input", () => {
    params.amplitude = parseFloat(sliderA.value);
    valA.textContent = params.amplitude.toFixed(1);
    drawAnim();
    updateGraph();
    if (cfg.onChange) cfg.onChange(params);
  });

  sliderF.addEventListener("input", () => {
    params.frequency = parseFloat(sliderF.value);
    valF.textContent = params.frequency.toFixed(1);
    drawAnim();
    updateGraph();
    if (cfg.onChange) cfg.onChange(params);
  });

  sliderP.addEventListener("input", () => {
    params.phase = parseFloat(sliderP.value);
    valP.textContent = params.phase.toFixed(2);
    drawAnim();
    updateGraph();
    if (cfg.onChange) cfg.onChange(params);
  });

  /* ── Resize ── */
  const ro = new ResizeObserver(() => {
    setupAnim();
    plot.resize();
    drawAnim();
    updateGraph();
  });
  ro.observe(animCv);

  /* ── Theme ── */
  window.addEventListener("themechange", () => { setupAnim(); drawAnim(); updateGraph(); });

  /* ── Init ── */
  drawAnim();
  updateGraph();
  updateReadout();

  return {
    setParams(p) { Object.assign(params, p); drawAnim(); updateGraph(); },
    getParams()  { return { ...params }; },
    play()       { playing = true; playBtn.textContent = "⏸ Pausar"; lastTime = null; animId = requestAnimationFrame(animate); },
    pause()      { playing = false; playBtn.textContent = "▶ Play"; if (animId) cancelAnimationFrame(animId); },
    destroy()    { this.pause(); ro.disconnect(); root.innerHTML = ""; },
  };
}
