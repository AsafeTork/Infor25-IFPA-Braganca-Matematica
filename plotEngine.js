export class Plot {
  constructor(canvas, view = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.xmin = view.xmin ?? -6;
    this.xmax = view.xmax ?? 6;
    this.ymin = view.ymin ?? -4;
    this.ymax = view.ymax ?? 4;
    this.curves = [];
    this.markers = [];
    this.asymptotes = [];
    this.piAxis = false;
    this.showUnitCircle = false;
    this.onProbe = null;
    this.onDraw = null;
    this._setupListeners();
    this.draw();
  }

  _setupListeners() {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const x = (px / this.canvas.width) * (this.xmax - this.xmin) + this.xmin;
      const y = this.ymin + (1 - py / this.canvas.height) * (this.ymax - this.ymin);
      if (this.onProbe) this.onProbe(x, y);
    });
  }

  setView(v) {
    this.xmin = v.xmin;
    this.xmax = v.xmax;
    this.ymin = v.ymin;
    this.ymax = v.ymax;
    this.draw();
  }

  setPiAxis(v) {
    this.piAxis = v;
    this.draw();
  }

  setCurves(curves) {
    this.curves = curves;
    this.draw();
  }

  X(x) {
    return ((x - this.xmin) / (this.xmax - this.xmin)) * this.canvas.width;
  }

  Y(y) {
    return this.canvas.height - ((y - this.ymin) / (this.ymax - this.ymin)) * this.canvas.height;
  }

  draw() {
    const ctx = this.ctx;
    const { width: W, height: H } = this.canvas;
    const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

    ctx.fillStyle = css("--bg");
    ctx.fillRect(0, 0, W, H);

    const gridColor = css("--border");
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;

    for (let x = Math.ceil(this.xmin); x <= Math.floor(this.xmax); x++) {
      const px = this.X(x);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, H);
      ctx.stroke();
    }

    for (let y = Math.ceil(this.ymin); y <= Math.floor(this.ymax); y++) {
      const py = this.Y(y);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(W, py);
      ctx.stroke();
    }

    const axis = css("--text-soft");
    ctx.strokeStyle = axis;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, this.Y(0));
    ctx.lineTo(W, this.Y(0));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.X(0), 0);
    ctx.lineTo(this.X(0), H);
    ctx.stroke();

    if (this.showUnitCircle) this._drawUnitCircle();

    this.curves.forEach((c) => this._drawCurve(c));

    this.markers.forEach((m) => {
      const px = this.X(m.x), py = this.Y(m.y);
      ctx.fillStyle = css("--accent");
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, 7);
      ctx.fill();
    });

    if (this.piAxis) {
      const piStep = Math.PI;
      for (let n = Math.ceil(this.xmin / piStep); n <= Math.floor(this.xmax / piStep); n++) {
        const x = n * piStep;
        if (x < this.xmin || x > this.xmax) continue;
        const px = this.X(x);
        ctx.fillStyle = css("--text-mut");
        ctx.font = "12px var(--font-mono)";
        ctx.textAlign = "center";
        const label = n === 0 ? "0" : n === 1 ? "π" : n === -1 ? "-π" : `${n}π`;
        ctx.fillText(label, px, this.Y(0) + 20);
      }
    }

    this._afterDraw();
  }

  _drawCurve(c) {
    const ctx = this.ctx;
    const step = (this.xmax - this.xmin) / this.canvas.width;
    ctx.strokeStyle = c.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let first = true;
    for (let x = this.xmin; x <= this.xmax; x += step) {
      try {
        const y = c.fn(x);
        if (!isFinite(y) || Math.abs(y) > 1e6) continue;
        const px = this.X(x), py = this.Y(y);
        if (py < 0 || py > this.canvas.height) continue;
        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          ctx.lineTo(px, py);
        }
      } catch (e) {}
    }
    ctx.stroke();
  }

  _drawUnitCircle() {
    try {
      const ctx = this.ctx;
      const { width: W, height: H } = this.canvas;
      const cx = this.X(0), cy = this.Y(0);
      const r = Math.min(W, H) / 2 - 40;
      if (r < 20) return;

      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--border").trim();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx - r * 1.2, cy);
      ctx.lineTo(cx + r * 1.2, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 1.2);
      ctx.lineTo(cx, cy + r * 1.2);
      ctx.stroke();

      ctx.globalAlpha = 1.0;
    } catch (e) {
      console.warn("Erro ao desenhar círculo:", e);
    }
  }

  reset(v) {
    this.setView(v);
  }

  _afterDraw() {
    if (this.onDraw) this.onDraw();
  }
}

// Simples formatação de valores - SEM RECURSÃO
export function formatExactValue(val, tolerance = 0.01) {
  if (Math.abs(val) < 0.001) return "0";

  const piMultiples = [
    [Math.PI, "π"], [Math.PI/2, "π/2"], [Math.PI/3, "π/3"], [Math.PI/4, "π/4"], [Math.PI/6, "π/6"],
    [2*Math.PI/3, "2π/3"], [3*Math.PI/4, "3π/4"], [5*Math.PI/6, "5π/6"],
    [-Math.PI, "-π"], [-Math.PI/2, "-π/2"],
  ];

  for (const [v, s] of piMultiples) {
    if (Math.abs(val - v) < tolerance) return s;
  }

  const sqrts = [
    [Math.sqrt(2), "√2"], [Math.sqrt(3), "√3"], [Math.sqrt(2)/2, "√2/2"], [Math.sqrt(3)/2, "√3/2"],
    [1/Math.sqrt(3), "√3/3"],
  ];

  for (const [v, s] of sqrts) {
    if (Math.abs(val - v) < tolerance) return s;
    if (Math.abs(val + v) < tolerance) return `-${s}`;
  }

  const r = Math.round(val * 100) / 100;
  return String(r);
}
