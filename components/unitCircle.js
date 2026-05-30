/* components/unitCircle.js — Círculo trigonométrico interativo */

const NOTABLE = [
  { a: 0,              label:"0",      sin:"0",      cos:"1",      tan:"0"    },
  { a: Math.PI/6,      label:"π/6",    sin:"1/2",    cos:"√3/2",   tan:"√3/3" },
  { a: Math.PI/4,      label:"π/4",    sin:"√2/2",   cos:"√2/2",   tan:"1"    },
  { a: Math.PI/3,      label:"π/3",    sin:"√3/2",   cos:"1/2",    tan:"√3"   },
  { a: Math.PI/2,      label:"π/2",    sin:"1",      cos:"0",      tan:"∄"    },
  { a: 2*Math.PI/3,    label:"2π/3",   sin:"√3/2",   cos:"-1/2",   tan:"-√3"  },
  { a: 3*Math.PI/4,    label:"3π/4",   sin:"√2/2",   cos:"-√2/2",  tan:"-1"   },
  { a: 5*Math.PI/6,    label:"5π/6",   sin:"1/2",    cos:"-√3/2",  tan:"-√3/3"},
  { a: Math.PI,        label:"π",      sin:"0",      cos:"-1",     tan:"0"    },
  { a: 7*Math.PI/6,    label:"7π/6",   sin:"-1/2",   cos:"-√3/2",  tan:"√3/3" },
  { a: 5*Math.PI/4,    label:"5π/4",   sin:"-√2/2",  cos:"-√2/2",  tan:"1"    },
  { a: 4*Math.PI/3,    label:"4π/3",   sin:"-√3/2",  cos:"-1/2",   tan:"√3"   },
  { a: 3*Math.PI/2,    label:"3π/2",   sin:"-1",     cos:"0",      tan:"∄"    },
  { a: 5*Math.PI/3,    label:"5π/3",   sin:"-√3/2",  cos:"1/2",    tan:"-√3"  },
  { a: 7*Math.PI/4,    label:"7π/4",   sin:"-√2/2",  cos:"√2/2",   tan:"-1"   },
  { a: 11*Math.PI/6,   label:"11π/6",  sin:"-1/2",   cos:"√3/2",   tan:"-√3/3"},
  { a: 2*Math.PI,      label:"2π",     sin:"0",      cos:"1",      tan:"0"    },
];
const SNAP = 0.12;

function snap(theta) {
  // Normalizar para 0..2π para snap
  const t = ((theta % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
  let best = null, bd = Infinity;
  for (const n of NOTABLE) {
    const d = Math.abs(t - n.a);
    if (d < SNAP && d < bd) { bd = d; best = n; }
  }
  return best;
}

function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

export class UnitCircle {
  constructor(canvas, infoEl) {
    this.cv   = canvas;
    this.info = infoEl;
    this.ctx  = canvas.getContext("2d");
    this.theta   = Math.PI / 3;   // ângulo atual (pode acumular > 2π)
    this.snapped = null;
    this.dragging = false;
    this._bindEvents();
    this.draw();
  }

  _pointerAngle(e) {
    const rect = this.cv.getBoundingClientRect();
    const pt = e.touches ? e.touches[0] : e;
    const x = (pt.clientX - rect.left) / rect.width  * 2 - 1;
    const y = -((pt.clientY - rect.top) / rect.height * 2 - 1);
    return Math.atan2(y, x);
  }

  _bindEvents() {
    const cv = this.cv;
    let lastAngle = null;
    let accumulated = 0;

    const down = e => {
      e.preventDefault();
      this.dragging = true;
      lastAngle = this._pointerAngle(e);
      accumulated = this.theta;
      this._moveTo(this._pointerAngle(e), lastAngle, accumulated);
    };
    const move = e => {
      if (!this.dragging) return;
      e.preventDefault();
      const cur = this._pointerAngle(e);
      // Detectar cruzamento de ±π para acumular voltas
      let delta = cur - lastAngle;
      if (delta >  Math.PI) delta -= 2*Math.PI;
      if (delta < -Math.PI) delta += 2*Math.PI;
      accumulated += delta;
      lastAngle = cur;
      this.theta = accumulated;
      const sn = snap(this.theta);
      this.snapped = sn;
      if (sn) {
        // Snap mantendo volta atual
        const base = Math.round(this.theta / (2*Math.PI)) * 2*Math.PI;
        this.theta = base + sn.a;
        accumulated = this.theta;
      }
      this.draw();
      this._updateInfo();
    };
    const up = () => { this.dragging = false; lastAngle = null; };

    cv.addEventListener("mousedown",  down);
    cv.addEventListener("mousemove",  move);
    cv.addEventListener("mouseup",    up);
    cv.addEventListener("touchstart", down, { passive:false });
    cv.addEventListener("touchmove",  move, { passive:false });
    cv.addEventListener("touchend",   up);
  }

  draw() {
    const cv = this.cv, ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth || cv.width;
    const H = cv.clientHeight || cv.height;
    cv.width  = W * dpr;
    cv.height = H * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);   // ← SEM fillRect — fundo transparente

    const dark    = document.documentElement.getAttribute("data-theme") !== "light";
    const fg      = dark ? "#e8e3da" : "#1a1a2e";
    const fgMut   = dark ? "rgba(200,190,170,0.5)" : "rgba(80,80,100,0.45)";
    const accent  = css("--accent")   || "#ffa500";
    const accent2 = css("--accent-2") || "#ffd23f";
    const green   = dark ? "#4ade80" : "#16a34a";

    const margin = 42;
    const cx = W / 2, cy = H / 2;
    const r  = Math.min(W, H) / 2 - margin;

    const theta = this.theta;
    const px = cx + r * Math.cos(theta);
    const py = cy - r * Math.sin(theta);

    /* ── Eixos ── */
    ctx.strokeStyle = fgMut; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(cx - r*1.3, cy); ctx.lineTo(cx + r*1.3, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - r*1.3); ctx.lineTo(cx, cy + r*1.3); ctx.stroke();

    /* ── Círculo principal ── */
    ctx.strokeStyle = dark ? "rgba(200,190,170,0.35)" : "rgba(80,80,100,0.3)";
    ctx.lineWidth = 1.5; ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2*Math.PI); ctx.stroke();

    /* ── Quadrantes I II III IV ── */
    ctx.font = `bold ${Math.round(r*0.13)}px monospace`;
    const ql = r * 0.6;
    ctx.fillStyle = dark ? "rgba(200,190,170,0.25)" : "rgba(80,80,100,0.2)";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const [l,sx,sy] of [["I",1,1],["II",-1,1],["III",-1,-1],["IV",1,-1]]) {
      ctx.fillText(l, cx + sx*ql, cy - sy*ql);
    }

    /* ── Pontos notáveis ── */
    ctx.fillStyle = dark ? "rgba(200,190,170,0.4)" : "rgba(80,80,100,0.4)";
    for (const n of NOTABLE) {
      ctx.beginPath();
      ctx.arc(cx + r*Math.cos(n.a), cy - r*Math.sin(n.a), 2.5, 0, 2*Math.PI);
      ctx.fill();
    }

    /* ── Arco percorrido ── */
    const turns  = Math.floor(Math.abs(theta) / (2*Math.PI));
    const tNorm  = ((theta % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
    // Arco da volta atual
    ctx.strokeStyle = accent + "80"; ctx.lineWidth = 4; ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, -tNorm, false);
    ctx.stroke();
    // Indicador de ângulo perto do centro
    ctx.strokeStyle = accent + "99"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r*0.22, 0, -tNorm, false); ctx.stroke();
    // Se mais de uma volta, mostrar arco completo mais fino
    if (turns > 0) {
      ctx.strokeStyle = accent + "30"; ctx.lineWidth = 3*turns;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2*Math.PI); ctx.stroke();
    }

    /* ── Tangente — sem clip, linha longa ── */
    const tanVal = Math.sin(theta) / Math.cos(theta);
    const showTan = Math.abs(Math.cos(theta)) > 0.08;
    if (showTan) {
      const tx  = cx + r;
      const tyT = cy - r * tanVal;
      // Linha da tangente extendida (sem clip)
      ctx.strokeStyle = green + "55"; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.moveTo(tx, cy - r*3); ctx.lineTo(tx, cy + r*3); ctx.stroke();
      // Segmento realçado: de 0 até tan
      ctx.strokeStyle = green + "cc"; ctx.lineWidth = 2.5; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(tx, cy); ctx.lineTo(tx, tyT); ctx.stroke();
      // Linha secante (origem → ponto da tangente)
      ctx.strokeStyle = green + "55"; ctx.lineWidth = 1.5; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, tyT); ctx.stroke();
      // Ponto da tangente
      ctx.fillStyle = green;
      ctx.beginPath(); ctx.arc(tx, tyT, 4, 0, 2*Math.PI); ctx.fill();
      // Label tan θ
      const fs = Math.round(r*0.11);
      ctx.fillStyle = green; ctx.font = `bold ${fs}px monospace`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("tan θ", tx+8, cy - r*tanVal*0.5);
    }
    ctx.setLineDash([]);

    /* ── Projeções cos (horizontal) e sin (vertical) ── */
    // Linha do ponto até o eixo Y → comprimento = cos
    ctx.strokeStyle = accent; ctx.lineWidth = 2.5; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke();
    // Linha do ponto até o eixo X → comprimento = sin
    ctx.strokeStyle = accent2; ctx.lineWidth = 2.5; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.setLineDash([]);

    /* ── Ponto no eixo X (projeção cos) ── */
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(px, cy, 5, 0, 2*Math.PI); ctx.fill();
    /* ── Ponto no eixo Y (projeção sin) ── */
    ctx.fillStyle = accent2;
    ctx.beginPath(); ctx.arc(cx, py, 5, 0, 2*Math.PI); ctx.fill();

    /* ── Triângulo retângulo (pernas) ── */
    ctx.strokeStyle = dark ? "rgba(200,190,170,0.4)" : "rgba(80,80,100,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
    // Marca de ângulo reto
    if (Math.abs(Math.cos(theta)) > 0.05 && Math.abs(Math.sin(theta)) > 0.05) {
      const s = 7;
      const sx = Math.sign(Math.cos(theta)) * s;
      const sy = Math.sign(Math.sin(theta)) * s;
      ctx.strokeStyle = dark ? "rgba(200,190,170,0.5)" : "rgba(80,80,100,0.4)";
      ctx.beginPath();
      ctx.moveTo(px - sx, cy);
      ctx.lineTo(px - sx, cy - sy);
      ctx.lineTo(px, cy - sy);
      ctx.stroke();
    }

    /* ── Raio (linha da origem ao ponto) ── */
    ctx.strokeStyle = fg; ctx.lineWidth = 2.5; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    // Label "1" no meio do raio
    ctx.fillStyle = fg;
    ctx.font = `${Math.round(r*0.11)}px monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("1", (cx+px)/2 - 8*Math.sin(theta), (cy+py)/2 - 8*Math.cos(theta));

    /* ── Labels das projeções ── */
    const fs = Math.round(r*0.115);
    ctx.font = `bold ${fs}px monospace`;
    ctx.fillStyle = accent; ctx.textAlign = "center";
    ctx.fillText("cos θ", (cx+px)/2, cy + (Math.sin(theta) >= 0 ? 15 : -11));
    ctx.fillStyle = accent2;
    ctx.textAlign = Math.cos(theta) >= 0 ? "left" : "right";
    ctx.textBaseline = "middle";
    ctx.fillText("sin θ", px + (Math.cos(theta) >= 0 ? 7 : -7), (cy+py)/2);

    /* ── Ticks ±1 nos eixos ── */
    ctx.fillStyle = fgMut; ctx.font = `${Math.round(r*0.1)}px monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText("1", cx+r, cy+4); ctx.fillText("-1", cx-r, cy+4);
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ctx.fillText("1", cx-4, cy-r); ctx.fillText("-1", cx-4, cy+r);

    /* ── Ponto principal no círculo ── */
    ctx.fillStyle = this.snapped ? accent2 : accent;
    ctx.beginPath(); ctx.arc(px, py, 8, 0, 2*Math.PI); ctx.fill();
    ctx.strokeStyle = dark ? "rgba(10,10,20,0.8)" : "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2; ctx.stroke();

    /* ── Label do ângulo ── */
    const la = tNorm / 2;
    const lr = r * 0.32;
    ctx.fillStyle = fg;
    ctx.font = `bold ${Math.round(r*0.12)}px monospace`;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    const voltas = Math.round(theta / (2*Math.PI) * 10) / 10;
    let label = this.snapped ? this.snapped.label : `${(tNorm*180/Math.PI).toFixed(1)}°`;
    if (Math.abs(theta) > 2*Math.PI + 0.1) label += ` (${voltas > 0 ? "+" : ""}${voltas}π)`;
    ctx.fillText(label, cx + lr*Math.cos(la) + 4, cy - lr*Math.sin(la));
  }

  _updateInfo() {
    if (!this.info) return;
    const t = this.theta;
    const tNorm = ((t % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
    const cosV = Math.cos(t), sinV = Math.sin(t), tanV = sinV/cosV;
    const deg  = tNorm * 180 / Math.PI;
    const totalDeg = t * 180 / Math.PI;
    const n = this.snapped;

    this.info.innerHTML = `
      <div class="uc-row">
        <span class="uc-k" style="color:var(--accent)">cos</span>
        <span class="uc-exact">${n ? n.cos : cosV.toFixed(4)}</span>
        ${n ? `<span class="uc-dec">${cosV.toFixed(3)}</span>` : ""}
      </div>
      <div class="uc-row">
        <span class="uc-k" style="color:var(--accent-2)">sin</span>
        <span class="uc-exact">${n ? n.sin : sinV.toFixed(4)}</span>
        ${n ? `<span class="uc-dec">${sinV.toFixed(3)}</span>` : ""}
      </div>
      <div class="uc-row">
        <span class="uc-k" style="color:#4ade80">tan</span>
        <span class="uc-exact">${n ? n.tan : (Math.abs(cosV)<0.01 ? "∄" : tanV.toFixed(4))}</span>
        ${n && n.tan !== "∄" ? `<span class="uc-dec">${tanV.toFixed(3)}</span>` : ""}
      </div>
      <div class="uc-row uc-angle">
        <span class="uc-k">θ</span>
        <span class="uc-exact">${n ? n.label : deg.toFixed(1)+"°"}</span>
        <span class="uc-dec">${totalDeg.toFixed(1)}° · ${t.toFixed(3)} rad</span>
      </div>
      ${Math.abs(t) > 2*Math.PI+0.1 ? `<div class="uc-snap">↻ ${(t/(2*Math.PI)).toFixed(2)} voltas</div>` : ""}
      ${this.snapped ? '<div class="uc-snap">⊙ ângulo notável</div>' : ""}
    `;
  }
}
