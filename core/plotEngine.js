/* ============================================================
   core/plotEngine.js
   Plano cartesiano interativo (canvas) com notação matemática real:
   eixos, malha, rótulos em π (radianos) quando solicitado, frações,
   pan/zoom, interceptos, assíntotas e leitura de coordenadas.

   Zoom 30x — isométrico, focal, suave e responsivo
   Fontes / best practices 2025-2026:
   - MDN "Pinch zoom gestures" – PointerEvent cache, evCache.length===2,
     https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
   - tigerabrodi.blog "Handle Trackpad Pinch vs Scroll" (2026-03-04):
     ctrlKey separa zoom/pan, clamp deltaY ±60, factor = 2^(-clamped*0.01),
     passive:false + preventDefault (hcg-pinch-zoom, zoompinch)
   - Grafana Canvas pan/zoom improvements 2025-07-31: root container mantém
     constraints, zoom-to-content, âncoras estáveis
   - numberanalytics.com Zooming/Panning Strategies: geometric zoom escala
     uniforme, semantic vs geometric, feedback visual, hardware acceleration
   - StackOverflow "How to make canvas responsive" + "Canvas zoom + pan":
     resize via getBoundingClientRect + devicePixelRatio, translate para centro,
     requestAnimationFrame para 60fps, offscreen bitmap para performance
   ============================================================ */

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export class Plot {
  constructor(canvas, opts = {}) {
    this.cv = canvas;
    this.ctx = canvas.getContext("2d");
    this.curves = [];                 // { fn, params, color, label }
    this.markers = [];                // { x, y, label }
    this.asymptotes = [];             // { y } horizontais
    this._overlays = [];              // [{ draw(ctx, plot) }]
    this.piAxis = opts.piAxis || false;
    this.view = {
      xmin: opts.xmin ?? -5, xmax: opts.xmax ?? 5,
      ymin: opts.ymin ?? -2, ymax: opts.ymax ?? 8,
    };
    this.onProbe = null;
    this.onDraw  = null;
    // zoom/pan state
    this._pointers = new Map();
    this._pinchInitialDist = 0;
    this._pinchInitialView = null;
    this._isDragging = false;
    this._dragStart = { x: 0, y: 0 };
    this._dragStartView = null;
    this._rafPending = false;
    this._animRaf = null;
    // limites isométricos: xRange evita degeneração e estouro
    this._limits = { minXRange: 0.4, maxXRange: 120 };
    // garante que style impeça scroll nativo durante pinch/pan
    this.cv.style.touchAction = "none";
    this._bind();
    this.resize();
    this._onResize = () => this.resize();
    window.addEventListener("resize", this._onResize);
  }

  get xmin() { return this.view.xmin; }
  get xmax() { return this.view.xmax; }
  get ymin() { return this.view.ymin; }
  get ymax() { return this.view.ymax; }
  set xmin(v) { this.view.xmin = v; }
  set xmax(v) { this.view.xmax = v; }
  set ymin(v) { this.view.ymin = v; }
  set ymax(v) { this.view.ymax = v; }

  setPiAxis(v) { this.piAxis = v; this.draw(); }
  setView(v) {
    if (!v) return;
    Object.assign(this.view, v);
    this._enforceIsometric();
    this._clampViewRange();
    this.draw();
  }

  setCurves(list) { this.curves = list; this.draw(); }
  setMarkers(list) { this.markers = list || []; this.draw(); }
  setAsymptotes(list) { this.asymptotes = list || []; this.draw(); }
  setOverlays(list) { this._overlays = list || []; this.draw(); }
  setLabels(list) { this._labels = list || []; }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.cv.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const oldW = this.W, oldH = this.H;
    const oldView = oldW && oldH ? { ...this.view } : null;
    this.W = r.width; this.H = r.height;
    this.cv.width = r.width * dpr; this.cv.height = r.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Responsive canvas best practice: preservar centro e escala isométrica ao redimensionar
    // (StackOverflow responsive canvas + Grafana root-container)
    if (oldView) {
      const cx = (oldView.xmin + oldView.xmax) / 2;
      const cy = (oldView.ymin + oldView.ymax) / 2;
      const xRange = oldView.xmax - oldView.xmin;
      // yRange isométrico para nova razão W/H
      const newYRange = xRange * this.H / this.W;
      this.view.xmin = cx - xRange / 2;
      this.view.xmax = cx + xRange / 2;
      this.view.ymin = cy - newYRange / 2;
      this.view.ymax = cy + newYRange / 2;
      this._clampViewRange();
    } else {
      this._enforceIsometric();
    }
    this.draw();
  }

  // ---- coordinate transforms ----
  X(x) { const { xmin, xmax } = this.view; return ((x - xmin) / (xmax - xmin)) * this.W; }
  Y(y) { const { ymin, ymax } = this.view; return this.H - ((y - ymin) / (ymax - ymin)) * this.H; }
  invX(px) { const { xmin, xmax } = this.view; return xmin + (px / this.W) * (xmax - xmin); }
  invY(py) { const { ymin, ymax } = this.view; return ymin + ((this.H - py) / this.H) * (ymax - ymin); }
  // helpers que operam sobre view arbitrária (usado no pinch mid-calc)
  _invXForView(view, px) { return view.xmin + (px / this.W) * (view.xmax - view.xmin); }
  _invYForView(view, py) { return view.ymin + ((this.H - py) / this.H) * (view.ymax - view.ymin); }

  // ---- isometria & limites ----
  _enforceIsometric() {
    if (!this.W || !this.H) return;
    const vw = this.view.xmax - this.view.xmin;
    const desiredVh = vw * this.H / this.W;
    const cy = (this.view.ymax + this.view.ymin) / 2;
    this.view.ymin = cy - desiredVh / 2;
    this.view.ymax = cy + desiredVh / 2;
  }
  _clampViewRange() {
    const vw = this.view.xmax - this.view.xmin;
    const { minXRange, maxXRange } = this._limits;
    if (vw < minXRange || vw > maxXRange) {
      const cx = (this.view.xmin + this.view.xmax) / 2;
      const cy = (this.view.ymin + this.view.ymax) / 2;
      const clamped = Math.max(minXRange, Math.min(maxXRange, vw));
      const newVh = clamped * this.H / this.W;
      this.view.xmin = cx - clamped / 2;
      this.view.xmax = cx + clamped / 2;
      this.view.ymin = cy - newVh / 2;
      this.view.ymax = cy + newVh / 2;
      return true;
    }
    return false;
  }
  // zoom focal isométrico: factor <1 zoom in, >1 zoom out (geometric zoom)
  zoomAt(px, py, factor) {
    if (!isFinite(px) || !isFinite(py) || !isFinite(factor)) return;
    factor = Math.max(0.1, Math.min(10, factor));
    const cx = this.invX(px);
    const cy = this.invY(py);
    const v = this.view;
    // aplica fator uniforme em X e Y (isométrico)
    const nxmin = cx + (v.xmin - cx) * factor;
    const nxmax = cx + (v.xmax - cx) * factor;
    const nymin = cy + (v.ymin - cy) * factor;
    const nymax = cy + (v.ymax - cy) * factor;
    v.xmin = nxmin; v.xmax = nxmax; v.ymin = nymin; v.ymax = nymax;
    this._clampViewRange();
    this._enforceIsometric();
  }
  // pan por delta em px
  panBy(dxPx, dyPx) {
    const sx = (this.view.xmax - this.view.xmin) / this.W;
    const sy = (this.view.ymax - this.view.ymin) / this.H;
    this.view.xmin -= dxPx * sx; this.view.xmax -= dxPx * sx;
    this.view.ymin += dyPx * sy; this.view.ymax += dyPx * sy;
  }
  _requestDraw() {
    if (this._rafPending) return;
    this._rafPending = true;
    requestAnimationFrame(() => {
      this._rafPending = false;
      this.draw();
    });
  }
  // animação suave isométrica (easeOutCubic) — usado por reset e controles +/- e setView animado
  animateView(target, ms = 320) {
    if (this._animRaf) cancelAnimationFrame(this._animRaf);
    // normaliza alvo para isométrico antes de animar
    const W = this.W, H = this.H;
    const vw = target.xmax - target.xmin;
    const vhIso = vw * H / W;
    const cy = (target.ymin + target.ymax) / 2;
    const isoTarget = {
      xmin: target.xmin, xmax: target.xmax,
      ymin: cy - vhIso / 2, ymax: cy + vhIso / 2
    };
    const start = { ...this.view };
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - t, 3);
      this.view.xmin = start.xmin + (isoTarget.xmin - start.xmin) * e;
      this.view.xmax = start.xmax + (isoTarget.xmax - start.xmax) * e;
      this.view.ymin = start.ymin + (isoTarget.ymin - start.ymin) * e;
      this.view.ymax = start.ymax + (isoTarget.ymax - start.ymax) * e;
      this.draw();
      if (t < 1) this._animRaf = requestAnimationFrame(tick);
      else this._animRaf = null;
    };
    this._animRaf = requestAnimationFrame(tick);
  }

  // ---- nice tick spacing ----
  _step(range, target = 8, canvasPx) {
    if (canvasPx && canvasPx > 0) {
      target = Math.max(3, Math.min(12, Math.floor(canvasPx / 70)));
    }
    const raw = range / target;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    let s = 1;
    if (norm < 1.5) s = 1; else if (norm < 3.5) s = 2; else if (norm < 7.5) s = 5; else s = 10;
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
        if (d === 1) return `${sign}${an === 1 ? "" : an}π`;
        const top = (an === 1 ? "" : an) + "π";
        return `${sign}${top}/${d}`;
      }
    }
    return (r).toFixed(2) + "π";
  }

  draw() {
    const ctx = this.ctx, { W, H } = this;
    if (!W || !H) return;
    ctx.clearRect(0, 0, W, H);

    // background
    ctx.fillStyle = css("--plot-bg"); ctx.fillRect(0, 0, W, H);

    const { xmin, xmax, ymin, ymax } = this.view;
    const line = css("--grid-line"), axis = css("--grid-axis");
    const textc = css("--text-mut");

    const xStep = this.piAxis ? Math.PI / 2 : this._step(xmax - xmin, 8, W);
    const yStep = this._step(ymax - ymin, 8, H);

    // grid
    ctx.lineWidth = 1; ctx.strokeStyle = line;
    const xNumLabels = (xmax - xmin) / xStep;
    let graphScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--graph-scale"));
    if (isNaN(graphScale) || !graphScale) graphScale = 1;
    let xFs = 18 * graphScale;
    if (xNumLabels > 15) xFs = 15 * graphScale;
    else if (xNumLabels > 10) xFs = 16 * graphScale;
    else if (xNumLabels < 5) xFs = 20 * graphScale;
    ctx.font = `${xFs}px ${css("--font-mono") || "monospace"}`;
    ctx.textAlign = "center"; ctx.textBaseline = "top";

    const x0 = Math.ceil(xmin / xStep) * xStep;
    let lastPx = null;
    for (let x = x0; x <= xmax + 1e-9; x += xStep) {
      const px = this.X(x);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
      if (lastPx !== null && Math.abs(px - lastPx) < 50) continue;
      lastPx = px;
      if (Math.abs(x) > 1e-9) {
        const lbl = this.piAxis ? this._fmtPi(x) : this._fmtNum(x);
        const yAxisPx = Math.min(Math.max(this.Y(0), 14), H - 16);
        ctx.fillStyle = textc;
        ctx.fillText(lbl, px, yAxisPx + 5);
      }
    }
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    const yNumLabels = (ymax - ymin) / yStep;
    let yFs = 18 * graphScale;
    if (yNumLabels > 15) yFs = 15 * graphScale;
    else if (yNumLabels > 10) yFs = 16 * graphScale;
    else if (yNumLabels < 5) yFs = 20 * graphScale;
    ctx.font = `${yFs}px ${css("--font-mono") || "monospace"}`;
    const yy0 = Math.ceil(ymin / yStep) * yStep;
    let lastPy = null;
    for (let y = yy0; y <= ymax + 1e-9; y += yStep) {
      const py = this.Y(y);
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
      if (lastPy !== null && Math.abs(py - lastPy) < 50) continue;
      lastPy = py;
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
    // overlays
    this._overlays.forEach((o) => o.draw(ctx, this));

    this._afterDraw();
  }

  _fmtNum(v) {
    if (Math.abs(v) >= 1000) return v.toExponential(0).replace("e+", "·10^");
    if (Math.abs(v) < 0.001 && v !== 0) return v.toExponential(1);
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

  // ---- interaction: pan, zoom, probe (Pointer Events + Wheel + Pinch) ----
  _bind() {
    this.cv.style.cursor = "crosshair";
    this.cv.style.touchAction = "none";

    // Pointer down: inicia pan ou pinch
    this.cv.addEventListener("pointerdown", (e) => {
      if (e.defaultPrevented) return;
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this._pointers.size === 1) {
        this._isDragging = true;
        const rect = this.cv.getBoundingClientRect();
        this._dragStart.x = e.clientX - rect.left;
        this._dragStart.y = e.clientY - rect.top;
        this._dragStartView = { ...this.view };
        this.cv.style.cursor = "grabbing";
        try { this.cv.setPointerCapture(e.pointerId); } catch {}
      } else if (this._pointers.size === 2) {
        // segundo dedo: inicia pinch, cancela pan momentaneamente
        this._isDragging = false;
        const pts = [...this._pointers.values()];
        this._pinchInitialDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        this._pinchInitialView = { ...this.view };
      }
    });

    this.cv.addEventListener("pointermove", (e) => {
      const rect = this.cv.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (this._pointers.has(e.pointerId)) {
        this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // --- PINCH a 2 dedos (MDN pinch gesture, Konva multi-touch pattern) ---
      if (this._pointers.size === 2 && this._pinchInitialView) {
        e.preventDefault();
        const pts = [...this._pointers.values()];
        const curDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (curDist < 10 || this._pinchInitialDist < 10) return;
        const scale = this._pinchInitialDist / curDist; // <1 zoom in, >1 zoom out
        const clampedScale = Math.max(0.15, Math.min(6, scale));
        const midX = (pts[0].x + pts[1].x) / 2;
        const midY = (pts[0].y + pts[1].y) / 2;
        const midPxX = midX - rect.left;
        const midPxY = midY - rect.top;
        const iv = this._pinchInitialView;
        const vw = iv.xmax - iv.xmin;
        // foco no midpoint: mantém ponto sob dedos fixo (focal-point zoom)
        const midDataX = this._invXForView(iv, midPxX);
        const midDataY = this._invYForView(iv, midPxY);
        const nw = vw * clampedScale;
        const nhIso = nw * this.H / this.W; // isométrico
        const nxmin = midDataX - (midPxX / this.W) * nw;
        const nymin = midDataY - ((this.H - midPxY) / this.H) * nhIso;
        this.view.xmin = nxmin;
        this.view.xmax = nxmin + nw;
        this.view.ymin = nymin;
        this.view.ymax = nymin + nhIso;
        this._clampViewRange();
        this._requestDraw();
        return;
      }

      // --- PAN com 1 dedo/mouse (drag) ---
      if (this._isDragging && this._pointers.size === 1 && this._dragStartView) {
        // só inicia pan se botão pressionado (evita hover)
        if (e.buttons === 0 && e.pointerType === "mouse") {
          // mouse move sem botão: probe
          if (this.onProbe) this.onProbe(this.invX(mx), this.invY(my));
          return;
        }
        e.preventDefault();
        const dx = mx - this._dragStart.x;
        const dy = my - this._dragStart.y;
        const sv = this._dragStartView;
        const sx = (sv.xmax - sv.xmin) / this.W;
        const sy = (sv.ymax - sv.ymin) / this.H;
        this.view.xmin = sv.xmin - dx * sx;
        this.view.xmax = sv.xmax - dx * sx;
        this.view.ymin = sv.ymin + dy * sy;
        this.view.ymax = sv.ymax + dy * sy;
        this._requestDraw();
        return;
      }

      // --- HOVER probe (sem drag/pinch) ---
      if (this._pointers.size === 0 && this.onProbe && e.buttons === 0) {
        this.onProbe(this.invX(mx), this.invY(my));
      } else if (this._pointers.size === 1 && !this._isDragging && this.onProbe) {
        // pointermove sem capture (mouse hover)
        this.onProbe(this.invX(mx), this.invY(my));
      }
    });

    const endPointer = (e) => {
      const hadTwo = this._pointers.size === 2;
      this._pointers.delete(e.pointerId);
      if (this._pointers.size === 0) {
        this._isDragging = false;
        this._dragStartView = null;
        this._pinchInitialView = null;
        if (!this._externalCursor) this.cv.style.cursor = "crosshair";
        try { this.cv.releasePointerCapture(e.pointerId); } catch {}
      } else if (this._pointers.size === 1 && hadTwo) {
        // transição pinch -> pan: reinicia drag a partir do dedo restante
        const remaining = [...this._pointers.values()][0];
        const rect = this.cv.getBoundingClientRect();
        this._dragStart.x = remaining.x - rect.left;
        this._dragStart.y = remaining.y - rect.top;
        this._dragStartView = { ...this.view };
        this._isDragging = true;
        this._pinchInitialView = null;
      }
    };
    this.cv.addEventListener("pointerup", endPointer);
    this.cv.addEventListener("pointercancel", endPointer);
    // pointerleave não finaliza pinch, apenas probe
    this.cv.addEventListener("pointerleave", (e) => {
      if (this._pointers.size === 0 && this.onProbe) {
        // opcional: manter último probe
      }
    });

    // --- WHEEL zoom focal (tigerabrodi + hcg-pinch-zoom best practice) ---
    this.cv.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = this.cv.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 16;
      else if (e.deltaMode === 2) delta *= 100;
      // Clamp delta para normalizar trackpad (0.5-3) vs mouse wheel (100+) — tigerabrodi
      const MAX_DELTA = 24;
      const clamped = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, delta));
      // Sensibilidade: trackpad pinch (ctrlKey) mais sensível que roda
      const sensitivity = (e.ctrlKey || e.metaKey) ? 0.015 : 0.008;
      const factor = Math.pow(2, clamped * sensitivity);
      const limited = Math.max(0.5, Math.min(2, factor));
      this.zoomAt(mx, my, limited);
      this._requestDraw();
    }, { passive: false });

    // double-click zoom in focal
    this.cv.addEventListener("dblclick", (e) => {
      e.preventDefault();
      const rect = this.cv.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      this.zoomAt(mx, my, 0.68);
      this._requestDraw();
    });
  }

  exportPNG(pixelRatio = 2) {
    const cv = document.createElement("canvas");
    cv.width = this.W * pixelRatio;
    cv.height = this.H * pixelRatio;
    const ctx = cv.getContext("2d");
    ctx.scale(pixelRatio, pixelRatio);

    ctx.fillStyle = css("--plot-bg") || "#0b0c10";
    ctx.fillRect(0, 0, this.W, this.H);

    const origCtx = this.ctx;
    this.ctx = ctx;
    this.draw();
    this.ctx = origCtx;

    cv.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "grafico.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  exportSVG() {
    const bg = css("--plot-bg") || "#0b0c10";
    const gridColor = css("--grid-line") || "rgba(255,255,255,.055)";
    const axisColor = css("--grid-axis") || "rgba(255,226,107,.55)";
    const textColor = css("--text-mut") || "#f3f1ea";

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${this.W}" height="${this.H}" viewBox="0 0 ${this.W} ${this.H}">`;
    svg += `<rect width="100%" height="100%" fill="${bg}"/>`;

    const { xmin, xmax, ymin, ymax } = this.view;
    const xStep = this.piAxis ? Math.PI / 2 : this._step(xmax - xmin, 8, this.W);
    const yStep = this._step(ymax - ymin, 8, this.H);

    const x0 = Math.ceil(xmin / xStep) * xStep;
    for (let x = x0; x <= xmax + 1e-9; x += xStep) {
      const px = this.X(x);
      svg += `<line x1="${px}" y1="0" x2="${px}" y2="${this.H}" stroke="${gridColor}" stroke-width="1"/>`;
      if (Math.abs(x) > 1e-9) {
        const lbl = this.piAxis ? this._fmtPi(x) : this._fmtNum(x);
        const yAxisPx = Math.min(Math.max(this.Y(0), 14), this.H - 16);
        svg += `<text x="${px}" y="${yAxisPx + 14}" fill="${textColor}" font-size="12" font-family="monospace" text-anchor="middle">${lbl}</text>`;
      }
    }

    const y0 = Math.ceil(ymin / yStep) * yStep;
    for (let y = y0; y <= ymax + 1e-9; y += yStep) {
      const py = this.Y(y);
      svg += `<line x1="0" y1="${py}" x2="${this.W}" y2="${py}" stroke="${gridColor}" stroke-width="1"/>`;
      if (Math.abs(y) > 1e-9) {
        const xAxisPx = Math.min(Math.max(this.X(0), 26), this.W - 6);
        svg += `<text x="${xAxisPx - 6}" y="${py + 4}" fill="${textColor}" font-size="12" font-family="monospace" text-anchor="end">${this._fmtNum(y)}</text>`;
      }
    }

    const ox = this.X(0), oy = this.Y(0);
    svg += `<line x1="${ox}" y1="0" x2="${ox}" y2="${this.H}" stroke="${axisColor}" stroke-width="1.6"/>`;
    svg += `<line x1="0" y1="${oy}" x2="${this.W}" y2="${oy}" stroke="${axisColor}" stroke-width="1.6"/>`;

    for (const curve of this.curves) {
      const N = Math.max(this.W, 600);
      const dx = (xmax - xmin) / N;
      let points = [];
      let started = false, prevY = null;
      for (let i = 0; i <= N; i++) {
        const x = xmin + i * dx;
        let y;
        try { y = curve.fn(x); } catch { y = NaN; }
        if (!isFinite(y)) {
          if (points.length > 1) {
            svg += `<polyline points="${points.join(" ")}" fill="none" stroke="${curve.color || css("--accent")}" stroke-width="2.6"/>`;
          }
          points = [];
          started = false;
          prevY = null;
          continue;
        }
        const py = this.Y(y);
        if (started && prevY !== null && Math.abs(py - prevY) > this.H * 2) {
          if (points.length > 1) {
            svg += `<polyline points="${points.join(" ")}" fill="none" stroke="${curve.color || css("--accent")}" stroke-width="2.6"/>`;
          }
          points = [];
        }
        points.push(`${this.X(x).toFixed(1)},${py.toFixed(1)}`);
        started = true;
        prevY = py;
      }
      if (points.length > 1) {
        svg += `<polyline points="${points.join(" ")}" fill="none" stroke="${curve.color || css("--accent")}" stroke-width="2.6"/>`;
      }
    }

    for (const m of this.markers) {
      const px = this.X(m.x), py = this.Y(m.y);
      svg += `<circle cx="${px}" cy="${py}" r="5" fill="${css("--accent")}" stroke="${bg}" stroke-width="2"/>`;
      if (m.label) {
        svg += `<text x="${px + 9}" y="${py - 6}" fill="${css("--text")}" font-size="13" font-family="monospace" text-anchor="start">${m.label}</text>`;
      }
    }

    if (this._overlays && this._overlays.length > 0) {
      for (const ov of this._overlays) {
        const o = { ...ov.props, type: ov.type };
        const s = this._renderOverlayToSVG(o, (v) => this.X(v), (v) => this.Y(v), this.W, this.H);
        if (s) svg += s;
      }
    }

    // Labels (fórmulas) no topo esquerdo — espelha drawLabels() do professor
    if (this._labels && this._labels.length > 0) {
      let ly = 16;
      for (const lab of this._labels) {
        svg += `<rect x="8" y="${ly-10}" width="${lab.text.length*7+8}" height="14" fill="rgba(128,128,128,0.18)" stroke="rgba(128,128,128,0.2)" rx="3"/>`;
        svg += `<text x="12" y="${ly}" fill="${lab.color}" font-size="12" font-family="monospace" font-weight="bold">${lab.text}</text>`;
        ly += 18;
      }
    }

    svg += `</svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grafico.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  reset(v) { this.setView(v); }

  setCursor(mode) {
    this._externalCursor = !!mode;
    this.cv.style.cursor = mode || "crosshair";
  }

  _renderOverlayToSVG(ov, toXS, toYS, W, H) {
    const color = ov.color || "#ffa500";
    const type = ov.type;

    if (type === "marker" || type === "point") {
      const cx = toXS(ov.x ?? 0), cy = toYS(ov.y ?? 0);
      return `<circle cx="${cx}" cy="${cy}" r="4" fill="${color}"/>`;
    } else if (type === "vline") {
      const px = toXS(ov.x ?? 0);
      return `<line x1="${px}" y1="0" x2="${px}" y2="${H}" stroke="${color}" stroke-width="2"/>`;
    } else if (type === "hline") {
      const py = toYS(ov.y ?? 0);
      return `<line x1="0" y1="${py}" x2="${W}" y2="${py}" stroke="${color}" stroke-width="2"/>`;
    } else if (type === "arrow" || type === "segment") {
      const x1=toXS(ov.x1??0), y1=toYS(ov.y1??0);
      const x2=toXS(ov.x2??0), y2=toYS(ov.y2??0);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${ov.width||2}"/>`;
    } else if (type === "area") {
      const x1=toXS(ov.x??0), x2=toXS(ov.x2??ov.x);
      return `<rect x="${Math.min(x1,x2)}" y="0" width="${Math.abs(x2-x1)}" height="${H}" fill="${color}" opacity="${ov.opacity||0.25}"/>`;
    } else if (type === "triangle" && ov.points) {
      const pts = ov.points.map(p => `${toXS(p.x)},${toYS(p.y)}`).join(" ");
      return `<polygon points="${pts}" fill="${color}" fill-opacity="${ov.opacity||0.25}" stroke="${color}" stroke-width="2"/>`;
    } else if (type === "text") {
      const x = toXS(ov.x??0), y = toYS(ov.y??0);
      return `<text x="${x}" y="${y}" fill="${color}" font-size="${ov.fontSize||12}" font-family="monospace">${ov.text || ""}</text>`;
    }
    return "";
  }

  destroy() {
    window.removeEventListener("resize", this._onResize);
    if (this._animRaf) cancelAnimationFrame(this._animRaf);
  }

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
