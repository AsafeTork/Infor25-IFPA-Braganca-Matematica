/* components/unitCircle.js */

const NOTABLE = [
  { a:0,              label:"0",      sin:"0",      cos:"1",      tan:"0"     },
  { a:Math.PI/6,      label:"π/6",    sin:"1/2",    cos:"√3/2",   tan:"√3/3"  },
  { a:Math.PI/4,      label:"π/4",    sin:"√2/2",   cos:"√2/2",   tan:"1"     },
  { a:Math.PI/3,      label:"π/3",    sin:"√3/2",   cos:"1/2",    tan:"√3"    },
  { a:Math.PI/2,      label:"π/2",    sin:"1",      cos:"0",      tan:"∄"     },
  { a:2*Math.PI/3,    label:"2π/3",   sin:"√3/2",   cos:"-1/2",   tan:"-√3"   },
  { a:3*Math.PI/4,    label:"3π/4",   sin:"√2/2",   cos:"-√2/2",  tan:"-1"    },
  { a:5*Math.PI/6,    label:"5π/6",   sin:"1/2",    cos:"-√3/2",  tan:"-√3/3" },
  { a:Math.PI,        label:"π",      sin:"0",      cos:"-1",     tan:"0"     },
  { a:7*Math.PI/6,    label:"7π/6",   sin:"-1/2",   cos:"-√3/2",  tan:"√3/3"  },
  { a:5*Math.PI/4,    label:"5π/4",   sin:"-√2/2",  cos:"-√2/2",  tan:"1"     },
  { a:4*Math.PI/3,    label:"4π/3",   sin:"-√3/2",  cos:"-1/2",   tan:"√3"    },
  { a:3*Math.PI/2,    label:"3π/2",   sin:"-1",     cos:"0",      tan:"∄"     },
  { a:5*Math.PI/3,    label:"5π/3",   sin:"-√3/2",  cos:"1/2",    tan:"-√3"   },
  { a:7*Math.PI/4,    label:"7π/4",   sin:"-√2/2",  cos:"√2/2",   tan:"-1"    },
  { a:11*Math.PI/6,   label:"11π/6",  sin:"-1/2",   cos:"√3/2",   tan:"-√3/3" },
  { a:2*Math.PI,      label:"2π",     sin:"0",      cos:"1",      tan:"0"     },
];

function snapTo(t) {
  const n = ((t % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
  let best = null, bd = Infinity;
  for (const k of NOTABLE) {
    const d = Math.abs(n - k.a);
    if (d < 0.12 && d < bd) { bd = d; best = k; }
  }
  return best;
}

function css(v) {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
}

export class UnitCircle {
  constructor(canvas, infoEl) {
    this.cv   = canvas;
    this.ctx  = canvas.getContext("2d");
    this.info = infoEl;
    this.theta    = Math.PI / 3;
    this.snapped  = null;
    this.dragging = false;
    this._raf     = null;
    this._W = 0; this._H = 0; this._dpr = 1;
    this._resize();
    this._bindEvents();
    this.draw();
    this._ro = new ResizeObserver(() => { this._resize(); this.draw(); });
    this._ro.observe(canvas);
  }

  /* ── Resize apenas quando tamanho muda ── */
  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const W   = this.cv.clientWidth;
    const H   = this.cv.clientHeight;
    if (W === this._W && H === this._H && dpr === this._dpr) return;
    this._W = W; this._H = H; this._dpr = dpr;
    this.cv.width  = Math.round(W * dpr);
    this.cv.height = Math.round(H * dpr);
  }

  /* ── Converter posição do pointer para ângulo ── */
  _angle(e) {
    const r  = this.cv.getBoundingClientRect();
    const pt = e.touches ? e.touches[0] : e;
    const x  = (pt.clientX - r.left)  / r.width  * 2 - 1;
    const y  = -((pt.clientY - r.top) / r.height * 2 - 1);
    return Math.atan2(y, x);
  }

  /* ── Eventos com pointer events (funciona em touch + mouse) ── */
  _bindEvents() {
    const cv = this.cv;
    cv.style.touchAction = "none"; // impede scroll durante drag
    let prev = null, accum = 0;

    const onDown = e => {
      e.preventDefault();
      this.dragging = true;
      prev   = this._angle(e);
      accum  = this.theta;
    };

    const onMove = e => {
      if (!this.dragging) return;
      e.preventDefault();
      const cur = this._angle(e);
      let delta = cur - prev;
      if (delta >  Math.PI) delta -= 2*Math.PI;
      if (delta < -Math.PI) delta += 2*Math.PI;
      accum += delta;
      prev   = cur;

      const sn = snapTo(accum);
      if (sn) {
        const base = Math.round(accum / (2*Math.PI)) * 2*Math.PI;
        accum = base + sn.a;
      }
      this.theta   = accum;
      this.snapped = sn;

      if (!this._raf) {
        this._raf = requestAnimationFrame(() => {
          this._raf = null;
          this.draw();
          this._updateInfo();
        });
      }
    };

    const onUp = () => { this.dragging = false; prev = null; };

    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup",   onUp);
    cv.addEventListener("pointercancel", onUp);
  }

  draw() {
    const ctx = this.ctx;
    const dpr = this._dpr;
    const W   = this._W;
    const H   = this._H;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);  // fundo transparente

    const dark   = document.documentElement.getAttribute("data-theme") !== "light";
    const fg     = dark ? "#e8e3da"              : "#1a1a2e";
    const fgMut  = dark ? "rgba(220,210,190,.45)": "rgba(60,60,80,.4)";
    const accent = css("--accent")  || "#ffa500";
    const acc2   = css("--accent-2")|| "#ffd23f";
    const green  = dark ? "#4ade80" : "#16a34a";

    const M  = 38;
    const cx = W/2, cy = H/2;
    const r  = Math.min(W, H)/2 - M;
    if (r < 20) { ctx.restore(); return; }

    const t   = this.theta;
    const tN  = ((t % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
    const cos = Math.cos(t), sin = Math.sin(t);
    const px  = cx + r*cos;
    const py  = cy - r*sin;

    /* ── Eixos ── */
    ctx.strokeStyle = fgMut; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(M*0.3, cy);  ctx.lineTo(W-M*0.3, cy);  ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, M*0.3);  ctx.lineTo(cx, H-M*0.3);  ctx.stroke();

    /* ── Círculo ── */
    ctx.strokeStyle = dark ? "rgba(220,210,190,.3)" : "rgba(60,60,80,.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2*Math.PI); ctx.stroke();

    /* ── Rótulos dos quadrantes I II III IV ── */
    const ql = r * 0.58;
    ctx.font = `bold ${~~(r*.13)}px monospace`;
    ctx.fillStyle = dark ? "rgba(220,210,190,.18)" : "rgba(60,60,80,.15)";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const [l,sx,sy] of [["I",1,1],["II",-1,1],["III",-1,-1],["IV",1,-1]])
      ctx.fillText(l, cx+sx*ql, cy-sy*ql);

    /* ── Pontos notáveis ── */
    ctx.fillStyle = dark ? "rgba(220,210,190,.35)" : "rgba(60,60,80,.35)";
    for (const n of NOTABLE) {
      ctx.beginPath();
      ctx.arc(cx+r*Math.cos(n.a), cy-r*Math.sin(n.a), 2.5, 0, 2*Math.PI);
      ctx.fill();
    }

    /* ── Arco percorrido ── */
    ctx.strokeStyle = accent+"90"; ctx.lineWidth = 4; ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, -tN, false); ctx.stroke();
    ctx.strokeStyle = accent+"99"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r*.22, 0, -tN, false); ctx.stroke();

    /* ── Tangente (sem clip — linha vertical em x=1) ── */
    const showTan = Math.abs(cos) > 0.08;
    if (showTan) {
      const tan  = sin / cos;
      const tx   = cx + r;
      const tyT  = cy - r*tan;
      // Linha guia longa (ocupa toda a altura disponível)
      ctx.strokeStyle = green+"30"; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.moveTo(tx, 0); ctx.lineTo(tx, H); ctx.stroke();
      // Segmento tan propriamente dito
      ctx.strokeStyle = green+"cc"; ctx.lineWidth = 2.5; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(tx, cy); ctx.lineTo(tx, tyT); ctx.stroke();
      // Linha secante
      ctx.strokeStyle = green+"50"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, tyT); ctx.stroke();
      // Ponto
      ctx.fillStyle = green;
      ctx.beginPath(); ctx.arc(tx, tyT, 4, 0, 2*Math.PI); ctx.fill();
      // Label (só se estiver dentro dos bounds)
      if (tyT > 4 && tyT < H-4) {
        ctx.fillStyle = green;
        ctx.font = `bold ${~~(r*.105)}px monospace`;
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText("tan θ", tx+6, tyT);
      }
    }
    ctx.setLineDash([]);

    /* ── Projeções cos e sin (tracejado) ── */
    ctx.strokeStyle = accent;  ctx.lineWidth = 2; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke();  // cos
    ctx.strokeStyle = acc2;    ctx.lineWidth = 2; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();  // sin
    ctx.setLineDash([]);

    /* ── Pontos nos eixos (cos no eixo X, sin no eixo Y) ── */
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(px, cy, 5, 0, 2*Math.PI); ctx.fill();  // cos
    ctx.fillStyle = acc2;
    ctx.beginPath(); ctx.arc(cx, py, 5, 0, 2*Math.PI); ctx.fill();  // sin

    /* ── Triângulo retângulo ── */
    ctx.strokeStyle = fgMut; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
    if (Math.abs(cos) > 0.06 && Math.abs(sin) > 0.06) {
      const s = 7, sx = Math.sign(cos)*s, sy = Math.sign(sin)*s;
      ctx.beginPath();
      ctx.moveTo(px-sx, cy);
      ctx.lineTo(px-sx, cy-sy);
      ctx.lineTo(px, cy-sy);
      ctx.stroke();
    }

    /* ── Raio ── */
    ctx.strokeStyle = fg; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = fg;
    ctx.font = `${~~(r*.1)}px monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("1", (cx+px)/2 - 7*sin, (cy+py)/2 - 7*cos);

    /* ── Labels cos θ / sin θ ── */
    const fs = ~~(r*.11);
    ctx.font = `bold ${fs}px monospace`;
    ctx.fillStyle = accent; ctx.textAlign = "center";
    ctx.fillText("cos θ", (cx+px)/2, cy+(sin>=0?14:-11));
    ctx.fillStyle = acc2;
    ctx.textAlign = cos>=0 ? "left" : "right"; ctx.textBaseline = "middle";
    ctx.fillText("sin θ", px+(cos>=0?6:-6), (cy+py)/2);

    /* ── Ticks ±1 ── */
    ctx.fillStyle = fgMut;
    ctx.font = `${~~(r*.09)}px monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText("1", cx+r, cy+3); ctx.fillText("-1", cx-r, cy+3);
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ctx.fillText("1", cx-3, cy-r); ctx.fillText("-1", cx-3, cy+r);

    /* ── Ponto principal ── */
    ctx.fillStyle = this.snapped ? acc2 : accent;
    ctx.beginPath(); ctx.arc(px, py, 8, 0, 2*Math.PI); ctx.fill();
    ctx.strokeStyle = dark ? "rgba(10,10,20,.7)" : "rgba(255,255,255,.7)";
    ctx.lineWidth = 2; ctx.stroke();

    /* ── Label do ângulo ── */
    const la = tN/2, lr = r*.32;
    ctx.fillStyle = fg;
    ctx.font = `bold ${~~(r*.115)}px monospace`;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    const voltas = t / (2*Math.PI);
    let lbl = this.snapped ? this.snapped.label : `${(tN*180/Math.PI).toFixed(1)}°`;
    if (Math.abs(t) > 2*Math.PI+.1) lbl += ` ×${voltas.toFixed(1)}`;
    ctx.fillText(lbl, cx + lr*Math.cos(la)+4, cy - lr*Math.sin(la));

    ctx.restore();
  }

  _updateInfo() {
    if (!this.info) return;
    const t   = this.theta;
    const tN  = ((t % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
    const c   = Math.cos(t), s = Math.sin(t), tn = s/c;
    const n   = this.snapped;
    const deg = tN*180/Math.PI;
    const tot = t*180/Math.PI;
    this.info.innerHTML = `
      <div class="uc-row">
        <span class="uc-k" style="color:var(--accent)">cos</span>
        <span class="uc-exact">${n?n.cos:c.toFixed(4)}</span>
        ${n?`<span class="uc-dec">${c.toFixed(3)}</span>`:""}
      </div>
      <div class="uc-row">
        <span class="uc-k" style="color:var(--accent-2)">sin</span>
        <span class="uc-exact">${n?n.sin:s.toFixed(4)}</span>
        ${n?`<span class="uc-dec">${s.toFixed(3)}</span>`:""}
      </div>
      <div class="uc-row">
        <span class="uc-k" style="color:#4ade80">tan</span>
        <span class="uc-exact">${n?n.tan:(Math.abs(c)<.01?"∄":tn.toFixed(4))}</span>
        ${n&&n.tan!=="∄"?`<span class="uc-dec">${tn.toFixed(3)}</span>`:""}
      </div>
      <div class="uc-row">
        <span class="uc-k">θ</span>
        <span class="uc-exact">${n?n.label:deg.toFixed(1)+"°"}</span>
        <span class="uc-dec">${tot.toFixed(1)}°</span>
      </div>
      ${Math.abs(t)>2*Math.PI+.1?`<div class="uc-snap">↻ ${(t/(2*Math.PI)).toFixed(2)} voltas</div>`:""}
      ${n?'<div class="uc-snap">⊙ notável</div>':""}
    `;
  }
}
