/* components/unitCircle.js
   Dois modos:
   A) standalone(canvas, infoEl)         — desenha com coord próprio
   B) overlay(canvas, infoEl, getView)   — alinha ao plano cartesiano do Plot
*/

const NOTABLE = [
  { a:0,            label:"0",     sin:"0",    cos:"1",    tan:"0"    },
  { a:Math.PI/6,    label:"π/6",   sin:"1/2",  cos:"√3/2", tan:"√3/3" },
  { a:Math.PI/4,    label:"π/4",   sin:"√2/2", cos:"√2/2", tan:"1"    },
  { a:Math.PI/3,    label:"π/3",   sin:"√3/2", cos:"1/2",  tan:"√3"   },
  { a:Math.PI/2,    label:"π/2",   sin:"1",    cos:"0",    tan:"∄"    },
  { a:2*Math.PI/3,  label:"2π/3",  sin:"√3/2", cos:"-1/2", tan:"-√3"  },
  { a:3*Math.PI/4,  label:"3π/4",  sin:"√2/2", cos:"-√2/2",tan:"-1"   },
  { a:5*Math.PI/6,  label:"5π/6",  sin:"1/2",  cos:"-√3/2",tan:"-√3/3"},
  { a:Math.PI,      label:"π",     sin:"0",    cos:"-1",   tan:"0"    },
  { a:7*Math.PI/6,  label:"7π/6",  sin:"-1/2", cos:"-√3/2",tan:"√3/3" },
  { a:5*Math.PI/4,  label:"5π/4",  sin:"-√2/2",cos:"-√2/2",tan:"1"    },
  { a:4*Math.PI/3,  label:"4π/3",  sin:"-√3/2",cos:"-1/2", tan:"√3"   },
  { a:3*Math.PI/2,  label:"3π/2",  sin:"-1",   cos:"0",    tan:"∄"    },
  { a:5*Math.PI/3,  label:"5π/3",  sin:"-√3/2",cos:"1/2",  tan:"-√3"  },
  { a:7*Math.PI/4,  label:"7π/4",  sin:"-√2/2",cos:"√2/2", tan:"-1"   },
  { a:11*Math.PI/6, label:"11π/6", sin:"-1/2", cos:"√3/2", tan:"-√3/3"},
];

function trySnap(t) {
  const n = ((t % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
  for (const k of NOTABLE) {
    if (Math.abs(n - k.a) < 0.1) return k;
  }
  return null;
}

function cssVar(v) {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
}

export class UnitCircle {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {HTMLElement|null} infoEl
   * @param {()=>{xmin,xmax,ymin,ymax,W,H}|null} getView
   *   Se fornecido, usa o sistema de coordenadas do Plot (modo overlay alinhado)
   */
  constructor(canvas, infoEl, getView = null) {
    this.cv      = canvas;
    this.ctx     = canvas.getContext("2d");
    this.info    = infoEl;
    this.getView = getView;   // null = modo standalone
    this.theta   = Math.PI / 3;
    this.snapped = null;
    this._raf    = null;
    this._prev   = null;
    this._W = 0; this._H = 0; this._dpr = 1;
    this._syncSize();
    this._bind();
    this.draw();
    new ResizeObserver(() => { this._syncSize(); this._sched(); }).observe(canvas);
  }

  _syncSize() {
    const dpr = window.devicePixelRatio || 1;
    const W = this.cv.clientWidth;
    const H = this.cv.clientHeight;
    if (this.cv.width  !== Math.round(W*dpr) ||
        this.cv.height !== Math.round(H*dpr)) {
      this.cv.width  = Math.round(W * dpr);
      this.cv.height = Math.round(H * dpr);
      this._W = W; this._H = H; this._dpr = dpr;
    }
  }

  _sched() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => {
      this._raf = null;
      this.draw();
      this._updateInfo();
    });
  }

  /* Ângulo de um evento relativo ao centro do canvas/plano */
  _evAngle(e) {
    const rect = this.cv.getBoundingClientRect();
    const pt   = e.touches ? e.touches[0] : e;
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;

    // Em modo overlay, o centro é a origem do plano cartesiano
    if (this.getView) {
      const v = this.getView();
      const pxPerUnit = rect.width / (v.xmax - v.xmin);
      const ox = rect.left + (-v.xmin) * pxPerUnit;  // x=0 em pixels
      const oy = rect.top  + (v.ymax)  * pxPerUnit;  // y=0 em pixels (invertido)
      return Math.atan2(-(pt.clientY - oy), pt.clientX - ox);
    }
    return Math.atan2(-(pt.clientY - cy), pt.clientX - cx);
  }

  _bind() {
    const cv = this.cv;
    cv.style.touchAction = "none";

    cv.addEventListener("pointerdown", e => {
      e.preventDefault();
      cv.setPointerCapture(e.pointerId);
      this._prev = this._evAngle(e);
    });

    cv.addEventListener("pointermove", e => {
      if (!cv.hasPointerCapture(e.pointerId)) return;
      e.preventDefault();
      const cur = this._evAngle(e);
      let delta = cur - this._prev;
      if (delta >  Math.PI) delta -= 2*Math.PI;
      if (delta < -Math.PI) delta += 2*Math.PI;
      this.theta += delta;
      this._prev = cur;

      const sn = trySnap(this.theta);
      if (sn) {
        const turns = Math.round(this.theta / (2*Math.PI));
        const target = turns * 2*Math.PI + sn.a;
        if (Math.abs(target - this.theta) < 0.15) this.theta = target;
      }
      this.snapped = sn;
      this._sched();
    });

    cv.addEventListener("pointerup",     e => cv.releasePointerCapture(e.pointerId));
    cv.addEventListener("pointercancel", e => cv.releasePointerCapture(e.pointerId));
  }

  /* Retorna {cx, cy, r} no espaço CSS (antes do DPR) */
  _geometry() {
    const W = this._W, H = this._H;
    if (this.getView) {
      // Modo overlay: usar a mesma transformação do Plot
      const v = this.getView();
      const scaleX = W / (v.xmax - v.xmin);
      const scaleY = H / (v.ymax - v.ymin);
      const cx = (-v.xmin) * scaleX;
      const cy = (v.ymax)  * scaleY;
      const r  = scaleX;  // 1 unidade em pixels
      return { cx, cy, r };
    }
    // Modo standalone: centrar na canvas
    const M = Math.max(28, Math.min(W, H) * 0.08);
    const r = Math.min(W, H) / 2 - M;
    return { cx: W/2, cy: H/2, r };
  }

  draw() {
    const cv = this.cv, ctx = this.ctx;
    const dpr = this._dpr || (window.devicePixelRatio || 1);
    const W   = cv.width  / dpr;
    const H   = cv.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const dark   = document.documentElement.getAttribute("data-theme") !== "light";
    const fg     = dark ? "#e8e3da"              : "#1a1a2e";
    const fgMut  = dark ? "rgba(220,210,190,.4)" : "rgba(60,60,80,.35)";
    const accent = cssVar("--accent")   || "#ffa500";
    const acc2   = cssVar("--accent-2") || "#ffd23f";
    const green  = dark ? "#4ade80"  : "#16a34a";

    const { cx, cy, r } = this._geometry();
    if (r < 10) { ctx.restore(); return; }

    const t   = this.theta;
    const tN  = ((t % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
    const cos = Math.cos(t), sin = Math.sin(t);
    const px  = cx + r*cos, py = cy - r*sin;

    /* ── Círculo ── */
    ctx.strokeStyle = dark ? "rgba(220,210,190,.35)" : "rgba(60,60,80,.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2*Math.PI); ctx.stroke();

    /* ── Pontos notáveis ── */
    ctx.fillStyle = dark ? "rgba(220,210,190,.35)" : "rgba(60,60,80,.35)";
    for (const n of NOTABLE) {
      ctx.beginPath();
      ctx.arc(cx + r*Math.cos(n.a), cy - r*Math.sin(n.a), Math.max(2, r*0.025), 0, 2*Math.PI);
      ctx.fill();
    }

    /* ── Rótulos de quadrante (só modo standalone) ── */
    if (!this.getView) {
      const ql = r*.58;
      ctx.font = `bold ${~~(r*.12)}px monospace`;
      ctx.fillStyle = dark ? "rgba(220,210,190,.15)" : "rgba(60,60,80,.12)";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (const [l,sx,sy] of [["I",1,1],["II",-1,1],["III",-1,-1],["IV",1,-1]])
        ctx.fillText(l, cx+sx*ql, cy-sy*ql);
    }

    /* ── Arco percorrido ── */
    ctx.strokeStyle = accent+"80"; ctx.lineWidth = Math.max(2, r*0.04);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, -tN, false); ctx.stroke();
    ctx.strokeStyle = accent+"90"; ctx.lineWidth = Math.max(1.5, r*0.025);
    ctx.beginPath(); ctx.arc(cx, cy, r*.22, 0, -tN, false); ctx.stroke();

    /* ── Tangente ── */
    if (Math.abs(cos) > 0.07) {
      const tan = sin/cos;
      const tx  = cx + r;
      const ty  = cy - r*tan;
      ctx.strokeStyle = green+"28"; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.moveTo(tx, -9999); ctx.lineTo(tx, 9999); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = green+"cc"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(tx, cy); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.strokeStyle = green+"44"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.fillStyle = green;
      ctx.beginPath(); ctx.arc(tx, ty, Math.max(3, r*0.04), 0, 2*Math.PI); ctx.fill();
      if (ty > 4 && ty < H-4) {
        ctx.font = `bold ${~~Math.max(10,r*.1)}px monospace`;
        ctx.fillStyle = green; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText("tan θ", tx+6, ty);
      }
    }
    ctx.setLineDash([]);

    /* ── Projeções ── */
    ctx.strokeStyle = accent;  ctx.lineWidth = 2; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke();
    ctx.strokeStyle = acc2;    ctx.lineWidth = 2; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.setLineDash([]);

    /* ── Pontos nos eixos ── */
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(px, cy, Math.max(4,r*0.055), 0, 2*Math.PI); ctx.fill();
    ctx.fillStyle = acc2;
    ctx.beginPath(); ctx.arc(cx, py, Math.max(4,r*0.055), 0, 2*Math.PI); ctx.fill();

    /* ── Triângulo retângulo ── */
    ctx.strokeStyle = fgMut; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
    if (Math.abs(cos) > 0.06 && Math.abs(sin) > 0.06) {
      const s = Math.max(5, r*0.07), sx = Math.sign(cos)*s, sy = Math.sign(sin)*s;
      ctx.beginPath();
      ctx.moveTo(px-sx, cy); ctx.lineTo(px-sx, cy-sy); ctx.lineTo(px, cy-sy);
      ctx.stroke();
    }

    /* ── Raio ── */
    ctx.strokeStyle = fg; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    const fs = Math.max(10, ~~(r*.1));
    ctx.fillStyle = fg; ctx.font = `${fs}px monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("1", (cx+px)/2 - 7*sin, (cy+py)/2 - 7*cos);

    /* ── Labels cos/sin ── */
    ctx.font = `bold ${fs}px monospace`;
    ctx.fillStyle = accent; ctx.textAlign = "center";
    ctx.fillText("cos θ", (cx+px)/2, cy+(sin>=0?fs+2:-(fs+2)));
    ctx.fillStyle = acc2;
    ctx.textAlign = cos>=0?"left":"right"; ctx.textBaseline = "middle";
    ctx.fillText("sin θ", px+(cos>=0?6:-6), (cy+py)/2);

    /* ── Ticks ±1 ── */
    ctx.fillStyle = fgMut; ctx.font = `${~~Math.max(9,r*.09)}px monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText("1", cx+r, cy+3); ctx.fillText("-1", cx-r, cy+3);
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ctx.fillText("1", cx-3, cy-r); ctx.fillText("-1", cx-3, cy+r);

    /* ── Ponto ── */
    const pr = Math.max(6, r*0.08);
    ctx.fillStyle = this.snapped ? acc2 : accent;
    ctx.beginPath(); ctx.arc(px, py, pr, 0, 2*Math.PI); ctx.fill();
    ctx.strokeStyle = dark ? "rgba(8,8,20,.75)" : "rgba(255,255,255,.75)";
    ctx.lineWidth = 2; ctx.stroke();

    /* ── Label do ângulo ── */
    const la = tN/2, lr = r*.32;
    ctx.fillStyle = fg;
    ctx.font = `bold ${~~Math.max(11,r*.11)}px monospace`;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    const turns = Math.round(t/(2*Math.PI)*10)/10;
    let lbl = this.snapped ? this.snapped.label : `${(tN*180/Math.PI).toFixed(1)}°`;
    if (Math.abs(t) > 2*Math.PI + 0.2) lbl += ` ×${turns.toFixed(1)}`;
    ctx.fillText(lbl, cx + lr*Math.cos(la)+4, cy - lr*Math.sin(la));

    ctx.restore();
  }

  _updateInfo() {
    if (!this.info) return;
    const t  = this.theta;
    const tN = ((t % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
    const c  = Math.cos(t), s = Math.sin(t), tn = s/c;
    const n  = this.snapped;
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
        <span class="uc-exact">${n?n.label:(tN*180/Math.PI).toFixed(1)+"°"}</span>
        <span class="uc-dec">${(t*180/Math.PI).toFixed(1)}° · ${t.toFixed(3)}r</span>
      </div>
      ${Math.abs(t)>2*Math.PI+.2?`<div class="uc-snap">↻ ${(t/(2*Math.PI)).toFixed(2)} voltas</div>`:""}
      ${n?'<div class="uc-snap">⊙ notável</div>':""}`;
  }
}
