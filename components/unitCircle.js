/* components/unitCircle.js — alinhado ao plano cartesiano do plot */

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
    this.cv      = canvas;
    this.ctx     = canvas.getContext("2d");
    this.info    = infoEl;
    this.theta   = Math.PI / 3;
    this.snapped = null;
    this._raf    = null;
    // Layout — preenchido por draw(layout)
    this._cx = 0; this._cy = 0; this._r = 100;
    this._bind();
  }

  /* ── Ângulo a partir do CENTRO REAL do círculo ── */
  _evAngle(e) {
    const rect = this.cv.getBoundingClientRect();
    const pt   = e.touches ? e.touches[0] : e;
    // Posição em pixels lógicos dentro do canvas
    const px   = (pt.clientX - rect.left);
    const py   = (pt.clientY - rect.top);
    // Escalar para coordenadas do canvas (pode ter DPR)
    const scaleX = this.cv.clientWidth  > 0 ? 1 : 1;
    const scaleY = this.cv.clientHeight > 0 ? 1 : 1;
    // Ângulo em relação ao centro real do círculo (não ao centro do canvas)
    const dx = px * scaleX - this._cx;
    const dy = -(py * scaleY - this._cy); // flip Y: math coords
    return Math.atan2(dy, dx);
  }

  _bind() {
    const cv = this.cv;
    cv.style.touchAction = "none";
    let prev = null;

    cv.addEventListener("pointerdown", e => {
      // Só captura se o toque estiver perto do ponto no círculo (±40px)
      const rect = cv.getBoundingClientRect();
      const pt   = e.touches ? e.touches[0] : e;
      const mx   = pt.clientX - rect.left;
      const my   = pt.clientY - rect.top;
      const px   = this._cx + this._r * Math.cos(this.theta);
      const py   = this._cy - this._r * Math.sin(this.theta);
      const dist = Math.hypot(mx - px, my - py);
      if (dist > 48) return; // Longe do ponto → deixa evento chegar ao plot
      e.preventDefault();
      cv.setPointerCapture(e.pointerId);
      prev = this._evAngle(e);
    });

    cv.addEventListener("pointermove", e => {
      if (!cv.hasPointerCapture(e.pointerId)) return;
      e.preventDefault();
      const cur = this._evAngle(e);
      let delta = cur - prev;
      if (delta >  Math.PI) delta -= 2*Math.PI;
      if (delta < -Math.PI) delta += 2*Math.PI;
      this.theta += delta;
      prev = cur;

      const sn = trySnap(this.theta);
      if (sn) {
        const turns = Math.round(this.theta / (2*Math.PI));
        const snapped = turns * 2*Math.PI + sn.a;
        if (Math.abs(snapped - this.theta) < 0.15) {
          this.theta = snapped;
        }
      }
      this.snapped = sn;

      if (!this._raf) {
        this._raf = requestAnimationFrame(() => {
          this._raf = null;
          this.draw({ cx: this._cx, cy: this._cy, r: this._r });
          this._updateInfo();
        });
      }
    });

    cv.addEventListener("pointerup",     e => cv.releasePointerCapture(e.pointerId));
    cv.addEventListener("pointercancel", e => cv.releasePointerCapture(e.pointerId));
  }

  draw(layout) {
    if (this._drawing) return; // evita loop reentrante
    this._drawing = true;
    const ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    const W   = this.cv.width  / dpr;
    const H   = this.cv.height / dpr;

    // Guardar layout para o drag
    if (layout) {
      this._cx = layout.cx;
      this._cy = layout.cy;
      this._r  = layout.r;
    }
    const cx = this._cx, cy = this._cy, r = this._r;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    if (r < 10) { ctx.restore(); return; }

    const dark   = document.documentElement.getAttribute("data-theme") !== "light";
    const fg     = dark ? "#e8e3da"               : "#1a1a2e";
    const fgMut  = dark ? "rgba(220,210,190,.4)"  : "rgba(60,60,80,.35)";
    const accent = css("--accent")   || "#ffa500";
    const acc2   = css("--accent-2") || "#ffd23f";
    const green  = dark ? "#4ade80"  : "#16a34a";

    const t   = this.theta;
    const tN  = ((t % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
    const cos = Math.cos(t), sin = Math.sin(t);
    const px  = cx + r * cos;
    const py  = cy - r * sin; // Y invertido

    /* ── Círculo ── */
    ctx.strokeStyle = dark ? "rgba(220,210,190,.35)" : "rgba(60,60,80,.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2*Math.PI); ctx.stroke();

    /* ── Rótulos dos quadrantes ── */
    const ql = r * 0.6;
    ctx.font = `bold ${~~(r*.13)}px monospace`;
    ctx.fillStyle = dark ? "rgba(220,210,190,.16)" : "rgba(60,60,80,.12)";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const [l,sx,sy] of [["I",1,1],["II",-1,1],["III",-1,-1],["IV",1,-1]])
      ctx.fillText(l, cx+sx*ql, cy-sy*ql);

    /* ── Pontos notáveis ── */
    ctx.fillStyle = dark ? "rgba(220,210,190,.3)" : "rgba(60,60,80,.3)";
    for (const n of NOTABLE) {
      ctx.beginPath();
      ctx.arc(cx + r*Math.cos(n.a), cy - r*Math.sin(n.a), 2.5, 0, 2*Math.PI);
      ctx.fill();
    }

    /* ── Arco percorrido ── */
    ctx.strokeStyle = accent+"80"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, -tN, false); ctx.stroke();
    ctx.strokeStyle = accent+"90"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r*.22, 0, -tN, false); ctx.stroke();

    /* ── Tangente (linha vertical em x=1) ── */
    const showTan = Math.abs(cos) > 0.07;
    if (showTan) {
      const tan = sin / cos;
      const tx  = cx + r;          // x=1 em pixels
      const ty  = cy - r * tan;    // y=tan em pixels
      ctx.strokeStyle = green+"28"; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.moveTo(tx, 0); ctx.lineTo(tx, H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = green+"cc"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(tx, cy); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.strokeStyle = green+"44"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.fillStyle = green;
      ctx.beginPath(); ctx.arc(tx, ty, 4, 0, 2*Math.PI); ctx.fill();
      if (ty > 4 && ty < H-4) {
        ctx.font = `bold ${~~(r*.1)}px monospace`;
        ctx.fillStyle = green; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText("tan θ", tx+6, ty);
      }
    }
    ctx.setLineDash([]);

    /* ── Projeções tracejadas ── */
    ctx.strokeStyle = accent;  ctx.lineWidth = 2; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke(); // cos
    ctx.strokeStyle = acc2;    ctx.lineWidth = 2; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke(); // sin
    ctx.setLineDash([]);

    /* ── Pontos nos eixos ── */
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(px, cy, 5, 0, 2*Math.PI); ctx.fill(); // cos no eixo X
    ctx.fillStyle = acc2;
    ctx.beginPath(); ctx.arc(cx, py, 5, 0, 2*Math.PI); ctx.fill(); // sin no eixo Y

    /* ── Triângulo retângulo ── */
    ctx.strokeStyle = fgMut; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
    if (Math.abs(cos) > 0.06 && Math.abs(sin) > 0.06) {
      const s = 6, sx2 = Math.sign(cos)*s, sy2 = Math.sign(sin)*s;
      ctx.beginPath();
      ctx.moveTo(px-sx2, cy); ctx.lineTo(px-sx2, cy-sy2); ctx.lineTo(px, cy-sy2);
      ctx.stroke();
    }

    /* ── Raio ── */
    ctx.strokeStyle = fg; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();

    /* ── Labels cos θ / sin θ ── */
    const fs = ~~(r*.1);
    ctx.font = `bold ${fs}px monospace`;
    ctx.fillStyle = accent; ctx.textAlign = "center";
    ctx.fillText("cos θ", (cx+px)/2, cy+(sin>=0?14:-11));
    ctx.fillStyle = acc2;
    ctx.textAlign = cos>=0?"left":"right"; ctx.textBaseline = "middle";
    ctx.fillText("sin θ", px+(cos>=0?6:-6), (cy+py)/2);

    /* ── Ponto principal ── */
    ctx.fillStyle = this.snapped ? acc2 : accent;
    ctx.beginPath(); ctx.arc(px, py, 8, 0, 2*Math.PI); ctx.fill();
    ctx.strokeStyle = dark ? "rgba(8,8,20,.75)" : "rgba(255,255,255,.75)";
    ctx.lineWidth = 2; ctx.stroke();

    /* ── Label do ângulo (junto ao arco pequeno) ── */
    const la = tN/2, lr = r*.32;
    ctx.fillStyle = fg;
    ctx.font = `bold ${~~(r*.115)}px monospace`;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    const turns = (t / (2*Math.PI)).toFixed(1);
    let lbl = this.snapped ? this.snapped.label : `${(tN*180/Math.PI).toFixed(1)}°`;
    if (Math.abs(t) > 2*Math.PI + 0.2) lbl += ` ×${turns}`;
    ctx.fillText(lbl, cx + lr*Math.cos(la)+4, cy - lr*Math.sin(la));

    ctx.restore();
    this._drawing = false;
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
