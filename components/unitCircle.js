/* components/unitCircle.js */

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

function css(v) {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
}

export class UnitCircle {
  constructor(canvas, infoEl) {
    this.cv   = canvas;
    this.ctx  = canvas.getContext("2d");
    this.info = infoEl;
    this.theta = Math.PI / 3;
    this.snapped = null;
    this._raf  = null;
    this._prevAngle = null;
    this._bind();
    this._syncSize();
    this.draw();
    new ResizeObserver(() => { this._syncSize(); this._schedDraw(); }).observe(canvas);
  }

  /* Só redimensiona quando necessário */
  _syncSize() {
    const dpr = window.devicePixelRatio || 1;
    const W = this.cv.clientWidth;
    const H = this.cv.clientHeight;
    if (this.cv.width !== Math.round(W*dpr) || this.cv.height !== Math.round(H*dpr)) {
      this.cv.width  = Math.round(W * dpr);
      this.cv.height = Math.round(H * dpr);
    }
  }

  _schedDraw() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => {
      this._raf = null;
      this.draw();
      this._updateInfo();
    });
  }

  /* Ângulo de um evento relativo ao centro do canvas */
  _evAngle(e) {
    const rect = this.cv.getBoundingClientRect();
    const pt   = e.touches ? e.touches[0] : e;
    const x    = (pt.clientX - rect.left) / rect.width  * 2 - 1;
    const y    = -((pt.clientY - rect.top) / rect.height * 2 - 1);
    return Math.atan2(y, x); // -π .. +π
  }

  _bind() {
    const cv = this.cv;
    cv.style.touchAction = "none";

    cv.addEventListener("pointerdown", e => {
      e.preventDefault();
      cv.setPointerCapture(e.pointerId); // ← garante que o movimento segue no celular
      this._prevAngle = this._evAngle(e);
    });

    cv.addEventListener("pointermove", e => {
      if (!cv.hasPointerCapture(e.pointerId)) return;
      e.preventDefault();

      const cur = this._evAngle(e);
      let delta = cur - this._prevAngle;
      /* Evitar salto de ±2π quando cruza o eixo -π/+π */
      if (delta >  Math.PI) delta -= 2*Math.PI;
      if (delta < -Math.PI) delta += 2*Math.PI;

      this.theta += delta;
      this._prevAngle = cur; // ← SEMPRE atualizar antes do snap

      /* Snap: não muda theta drasticamente, só corrige o último dígito */
      const sn = trySnap(this.theta);
      if (sn) {
        const turns = Math.round(this.theta / (2*Math.PI));
        const snapped = turns * 2*Math.PI + sn.a;
        /* Só aplica snap se a diferença for pequena (evita salto) */
        if (Math.abs(snapped - this.theta) < 0.15) {
          this.theta = snapped;
        }
      }
      this.snapped = sn;
      this._schedDraw();
    });

    cv.addEventListener("pointerup",     e => { cv.releasePointerCapture(e.pointerId); });
    cv.addEventListener("pointercancel", e => { cv.releasePointerCapture(e.pointerId); });
  }

  draw() {
    const cv = this.cv, ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    const W   = cv.width / dpr;
    const H   = cv.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const dark   = document.documentElement.getAttribute("data-theme") !== "light";
    const fg     = dark ? "#e8e3da"              : "#1a1a2e";
    const fgMut  = dark ? "rgba(220,210,190,.4)" : "rgba(60,60,80,.35)";
    const accent = css("--accent")   || "#ffa500";
    const acc2   = css("--accent-2") || "#ffd23f";
    const green  = dark ? "#4ade80"  : "#16a34a";

    const M  = Math.max(28, Math.min(W, H) * 0.08);
    const cx = W/2, cy = H/2;
    const r  = Math.min(W, H)/2 - M;
    if (r < 20) { ctx.restore(); return; }

    const t   = this.theta;
    const tN  = ((t % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
    const cos = Math.cos(t), sin = Math.sin(t);
    const px  = cx + r*cos, py = cy - r*sin;

    /* ── Eixos ── */
    ctx.strokeStyle = fgMut; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(M*.3, cy);  ctx.lineTo(W-M*.3, cy);  ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, M*.3);  ctx.lineTo(cx, H-M*.3);  ctx.stroke();

    /* ── Círculo ── */
    ctx.strokeStyle = dark ? "rgba(220,210,190,.28)" : "rgba(60,60,80,.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2*Math.PI); ctx.stroke();

    /* ── Quadrantes ── */
    ctx.font = `bold ${~~(r*.12)}px monospace`;
    ctx.fillStyle = dark ? "rgba(220,210,190,.15)" : "rgba(60,60,80,.12)";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const ql = r*.58;
    for (const [l,sx,sy] of [["I",1,1],["II",-1,1],["III",-1,-1],["IV",1,-1]])
      ctx.fillText(l, cx+sx*ql, cy-sy*ql);

    /* ── Pontos notáveis ── */
    ctx.fillStyle = dark ? "rgba(220,210,190,.3)" : "rgba(60,60,80,.3)";
    for (const n of NOTABLE) {
      ctx.beginPath();
      ctx.arc(cx+r*Math.cos(n.a), cy-r*Math.sin(n.a), 2.5, 0, 2*Math.PI);
      ctx.fill();
    }

    /* ── Arco ── */
    ctx.strokeStyle = accent+"80"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, -tN, false); ctx.stroke();
    ctx.strokeStyle = accent+"90"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r*.22, 0, -tN, false); ctx.stroke();

    /* ── Tangente ── */
    if (Math.abs(cos) > 0.07) {
      const tan = sin/cos;
      const tx  = cx + r;
      const ty  = cy - r*tan;
      ctx.strokeStyle = green+"28"; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.moveTo(tx, 0); ctx.lineTo(tx, H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = green+"cc"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(tx, cy); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.strokeStyle = green+"44"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.fillStyle = green;
      ctx.beginPath(); ctx.arc(tx, ty, 4, 0, 2*Math.PI); ctx.fill();
      if (ty > 6 && ty < H-6) {
        ctx.font = `bold ${~~(r*.1)}px monospace`;
        ctx.fillStyle = green; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText("tan θ", tx+6, ty);
      }
    }
    ctx.setLineDash([]);

    /* ── Projeções tracejadas ── */
    ctx.strokeStyle = accent;  ctx.lineWidth = 2; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke();
    ctx.strokeStyle = acc2;    ctx.lineWidth = 2; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.setLineDash([]);

    /* ── Pontos cos/sin nos eixos ── */
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(px, cy, 5, 0, 2*Math.PI); ctx.fill();
    ctx.fillStyle = acc2;
    ctx.beginPath(); ctx.arc(cx, py, 5, 0, 2*Math.PI); ctx.fill();

    /* ── Triângulo retângulo ── */
    ctx.strokeStyle = fgMut; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
    if (Math.abs(cos) > 0.06 && Math.abs(sin) > 0.06) {
      const s = 6, sx = Math.sign(cos)*s, sy = Math.sign(sin)*s;
      ctx.strokeStyle = fgMut; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px-sx, cy); ctx.lineTo(px-sx, cy-sy); ctx.lineTo(px, cy-sy);
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
    const fs = ~~(r*.1);
    ctx.font = `bold ${fs}px monospace`;
    ctx.fillStyle = accent; ctx.textAlign = "center";
    ctx.fillText("cos θ", (cx+px)/2, cy+(sin>=0?14:-11));
    ctx.fillStyle = acc2;
    ctx.textAlign = cos>=0?"left":"right"; ctx.textBaseline = "middle";
    ctx.fillText("sin θ", px+(cos>=0?6:-6), (cy+py)/2);

    /* ── Ticks ±1 ── */
    ctx.fillStyle = fgMut;
    ctx.font = `${~~(r*.09)}px monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText("1", cx+r, cy+3); ctx.fillText("-1", cx-r, cy+3);
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ctx.fillText("1", cx-3, cy-r); ctx.fillText("-1", cx-3, cy+r);

    /* ── Ponto ── */
    ctx.fillStyle = this.snapped ? acc2 : accent;
    ctx.beginPath(); ctx.arc(px, py, 8, 0, 2*Math.PI); ctx.fill();
    ctx.strokeStyle = dark ? "rgba(8,8,20,.75)" : "rgba(255,255,255,.75)";
    ctx.lineWidth = 2; ctx.stroke();

    /* ── Label ângulo ── */
    const la = tN/2, lr = r*.32;
    ctx.fillStyle = fg;
    ctx.font = `bold ${~~(r*.11)}px monospace`;
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
        <span class="uc-dec">${(t*180/Math.PI).toFixed(1)}° · ${t.toFixed(3)} rad</span>
      </div>
      ${Math.abs(t)>2*Math.PI+.2?`<div class="uc-snap">↻ ${(t/(2*Math.PI)).toFixed(2)} voltas</div>`:""}
      ${n?'<div class="uc-snap">⊙ notável</div>':""}`;
  }
}
