/* ============================================================
   core/plotEngine.js
   Plano cartesiano interativo (canvas) com notação matemática real:
   eixos, malha, rótulos em π (radianos) quando solicitado, frações,
   pan/zoom, interceptos, assíntotas e leitura de coordenadas.
   ============================================================ */

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export class Plot {
  constructor(canvas, opts = {}) {
    this.cv = canvas;
    this.ctx = canvas.getContext("2d");
    this.curves = [];                 // { fn, params, color, label }
    this.markers = [];                // { x, y, label }
    this.asymptotes = [];             // { y } horizontais
    this.piAxis = opts.piAxis || false;
    this.view = {
      xmin: opts.xmin ?? -5, xmax: opts.xmax ?? 5,
      ymin: opts.ymin ?? -2, ymax: opts.ymax ?? 8,
    };
    this.onProbe = null;
    this.onDraw  = null;
    this._bind();
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  setPiAxis(v) { this.piAxis = v; this.draw(); }
  setView(v) { Object.assign(this.view, v); this.draw(); }

  setCurves(list) { this.curves = list; this.draw(); }
  setMarkers(list) { this.markers = list || []; this.draw(); }
  setAsymptotes(list) { this.asymptotes = list || []; this.draw(); }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.cv.getBoundingClientRect();
    this.W = r.width; this.H = r.height;
    this.cv.width = r.width * dpr; this.cv.height = r.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  // ---- coordinate transforms ----
  X(x) { const { xmin, xmax } = this.view; return ((x - xmin) / (xmax - xmin)) * this.W; }
  Y(y) { const { ymin, ymax } = this.view; return this.H - ((y - ymin) / (ymax - ymin)) * this.H; }
  invX(px) { const { xmin, xmax } = this.view; return xmin + (px / this.W) * (xmax - xmin); }
  invY(py) { const { ymin, ymax } = this.view; return ymin + ((this.H - py) / this.H) * (ymax - ymin); }

  // ---- nice tick spacing ----
  _step(range, target = 8) {
    const raw = range / target;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    let s = 1;
    if (norm < 1.5) s = 1; else if (norm < 3) s = 2; else if (norm < 7) s = 5; else s = 10;
    return s * mag;
  }

  _fmtPi(x) {
    // expressa x como múltiplo de π (frações pequenas)
    const r = x / Math.PI;
    if (Math.abs(r) < 1e-9) return "0";
    const denoms = [1, 2, 3, 4, 6];
    for (const d of denoms) {
      const n = Math.round(r * d);
      if (Math.abs(r * d - n) < 1e-6 && n !== 0) {
        const sign = n < 0 ? "−" : "";
        const an = Math.abs(n);
        let num = an === d ? "" : (an === 1 ? "" : an);
        let pis = "π";
        if (d === 1) return `${sign}${an === 1 ? "" : an}π`;
        const top = (an === 1 ? "" : an) + "π";
        return `${sign}${top}/${d}`;
      }
    }
    return (r).toFixed(2) + "π";
  }

  draw() {
    const ctx = this.ctx, { W, H } = this;
    ctx.clearRect(0, 0, W, H);

    // background
    ctx.fillStyle = css("--plot-bg"); ctx.fillRect(0, 0, W, H);

    const { xmin, xmax, ymin, ymax } = this.view;
    const line = css("--grid-line"), axis = css("--grid-axis");
    const textc = css("--text-mut");

    const xStep = this.piAxis ? Math.PI / 2 : this._step(xmax - xmin);
    const yStep = this._step(ymax - ymin);

    // grid
    ctx.lineWidth = 1; ctx.strokeStyle = line;
    ctx.font = `12px ${css("--font-mono") || "monospace"}`;
    ctx.textAlign = "center"; ctx.textBaseline = "top";

    const x0 = Math.ceil(xmin / xStep) * xStep;
    for (let x = x0; x <= xmax + 1e-9; x += xStep) {
      const px = this.X(x);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
      if (Math.abs(x) > 1e-9) {
        const lbl = this.piAxis ? this._fmtPi(x) : this._fmtNum(x);
        const yAxisPx = Math.min(Math.max(this.Y(0), 14), H - 16);
        ctx.fillStyle = textc;
        ctx.fillText(lbl, px, yAxisPx + 5);
      }
    }
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    const yy0 = Math.ceil(ymin / yStep) * yStep;
    for (let y = yy0; y <= ymax + 1e-9; y += yStep) {
      const py = this.Y(y);
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
      if (Math.abs(y) > 1e-9) {
        const xAxisPx = Math.min(Math.max(this.X(0), 26), W - 6);
        ctx.fillStyle = textc;
        ctx.fillText(this._fmtNum(y), xAxisPx - 6, py);
      }
    }

    // asymptotes (dashed)
    this.asymptotes.forEach((a) => {
      ctx.save();
      ctx.strokeStyle = css("--accent-2"); ctx.setLineDash([6, 5]); ctx.lineWidth = 1.4;
      const py = this.Y(a.y);
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
      ctx.restore();
    });

    // axes
    ctx.strokeStyle = axis; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(0, this.Y(0)); ctx.lineTo(W, this.Y(0)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(this.X(0), 0); ctx.lineTo(this.X(0), H); ctx.stroke();


    // curves
    this.curves.forEach((c) => this._drawCurve(c));

    // markers
    this.markers.forEach((m) => {
      const px = this.X(m.x), py = this.Y(m.y);
      ctx.fillStyle = css("--accent");
      ctx.beginPath(); ctx.arc(px, py, 5, 0, 7); ctx.fill();
      ctx.strokeStyle = css("--plot-bg"); ctx.lineWidth = 2; ctx.stroke();
      if (m.label) {
        ctx.fillStyle = css("--text");
        ctx.textAlign = "left"; ctx.textBaseline = "bottom";
        ctx.font = `13px ${css("--font-mono")}`;
        ctx.fillText(m.label, px + 9, py - 6);
      }
    });
    this._afterDraw();
  }

  _fmtNum(v) {
    if (Math.abs(v) >= 1000) return v.toExponential(0).replace("e+", "·10^");
    const r = Math.round(v * 1000) / 1000;
    return String(r);
  }

  _drawCurve(c) {
    const ctx = this.ctx, { W } = this;
    const params = c.params || {};
    ctx.lineWidth = c.width || 2.6;
    ctx.strokeStyle = c.color || css("--accent");
    ctx.beginPath();
    let started = false, prevY = null;
    const N = Math.max(W, 600);
    for (let i = 0; i <= N; i++) {
      const px = (i / N) * W;
      const x = this.invX(px);
      let y;
      try { y = c.fn(x, params); } catch { y = NaN; }
      if (!Number.isFinite(y)) { started = false; prevY = null; continue; }
      const py = this.Y(y);
      // break on huge jumps (vertical asymptotes)
      if (started && prevY !== null && Math.abs(py - prevY) > this.H * 2) { started = false; }
      if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
      prevY = py;
    }
    ctx.stroke();
  }

  // ---- interaction: pan, zoom, probe ----
  _bind() {
    let dragging = false, lx = 0, ly = 0;
    this.cv.style.cursor = "crosshair";
    this.cv.addEventListener("mousedown", (e) => { dragging = true; lx = e.offsetX; ly = e.offsetY; this.cv.style.cursor = "grabbing"; });
    window.addEventListener("mouseup", () => { dragging = false; this.cv.style.cursor = "crosshair"; });
    this.cv.addEventListener("mousemove", (e) => {
      if (dragging) {
        const dx = (e.offsetX - lx), dy = (e.offsetY - ly);
        const { xmin, xmax, ymin, ymax } = this.view;
        const sx = (xmax - xmin) / this.W, sy = (ymax - ymin) / this.H;
        this.view.xmin -= dx * sx; this.view.xmax -= dx * sx;
        this.view.ymin += dy * sy; this.view.ymax += dy * sy;
        lx = e.offsetX; ly = e.offsetY; this.draw();
      } else if (this.onProbe) {
        this.onProbe(this.invX(e.offsetX), this.invY(e.offsetY));
      }
    });
    this.cv.addEventListener("wheel", (e) => {
      e.preventDefault();
      const f = e.deltaY > 0 ? 1.12 : 0.89;
      const cx = this.invX(e.offsetX), cy = this.invY(e.offsetY);
      const v = this.view;
      v.xmin = cx + (v.xmin - cx) * f; v.xmax = cx + (v.xmax - cx) * f;
      v.ymin = cy + (v.ymin - cy) * f; v.ymax = cy + (v.ymax - cy) * f;
      this.draw();
    }, { passive: false });
  }

  reset(v) { this.setView(v); }

  _afterDraw() {
    if (this.onDraw) this.onDraw();
  }

}

// Formata um valor numérico como expressão exata — SEM RECURSÃO
export function formatExactValue(val, tolerance = 0.01) {
  if (!isFinite(val)) return "∄";
  if (Math.abs(val) < tolerance) return "0";

  // Múltiplos de π — n é o coeficiente REAL (ex: 1/6 para π/6)
  const piMultiples = [
    [1/6,"π/6"],[1/4,"π/4"],[1/3,"π/3"],[1/2,"π/2"],[2/3,"2π/3"],
    [3/4,"3π/4"],[5/6,"5π/6"],[1,"π"],[4/3,"4π/3"],[3/2,"3π/2"],
    [5/4,"5π/4"],[5/3,"5π/3"],[7/4,"7π/4"],[11/6,"11π/6"],[2,"2π"],
    [-1/6,"-π/6"],[-1/4,"-π/4"],[-1/3,"-π/3"],[-1/2,"-π/2"],[-1,"-π"],
  ];
  for (const [n, sym] of piMultiples) {
    if (Math.abs(val - n * Math.PI) < tolerance) return sym;
  }

  // Valores notáveis de sin/cos/tan — SEM recursão, direto
  const known = [
    [0.5,"1/2"],[0.25,"1/4"],[0.75,"3/4"],
    [Math.sqrt(2)/2,"√2/2"],[Math.sqrt(3)/2,"√3/2"],[1/Math.sqrt(3),"√3/3"],
    [Math.sqrt(2),"√2"],[Math.sqrt(3),"√3"],
    [1,"1"],[2,"2"],[3,"3"],
  ];
  for (const [v, s] of known) {
    if (Math.abs(val - v)  < tolerance) return s;
    if (Math.abs(val + v)  < tolerance) return `-${s}`;
  }

  // Fallback decimal
  return String(Math.round(val * 100) / 100);
}
