/* ============================================================
   core/overlayRenderers.js
   Overlay rendering engine for Plot and TrigCircle canvases.

   Handles 10 overlay types:
     marker, vline, hline, area, triangle, text, arrow, circle, freehand, distance

   API:
     renderOverlaysOnPlot(ctx, plot, overlays, formatExact)
     renderOverlaysOnTrigCircle(ctx, circle, overlays)
     hitTestOverlay(overlay, px, py, engine)
   ============================================================ */

/* ── Helpers ─────────────────────────────────────────────── */
const css = (v) =>
  getComputedStyle(document.documentElement).getPropertyValue(v).trim();

const PI = Math.PI;
const TWO_PI = 2 * PI;
const DEFAULT_HIT_RADIUS = 12;
const LABEL_PAD = 6;

/* ── Individual type renderers ───────────────────────────── */

function renderMarker(ctx, ov, toX, toY, fmt) {
  const px = toX(ov.x);
  const py = toY(ov.y);
  const r = ov.radius || 5;
  const color = ov.color || css("--accent") || "#ffa500";

  ctx.save();

  /* dot */
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(px, py, r, 0, TWO_PI);
  ctx.fill();

  /* outline for contrast */
  ctx.strokeStyle = css("--plot-bg") || "#0b0c10";
  ctx.lineWidth = 2;
  ctx.stroke();

  /* label */
  if (ov.label) {
    const fs = ov.fontSize || 13;
    ctx.font = `${fs}px ${css("--font-mono") || "monospace"}`;
    ctx.fillStyle = ov.labelColor || css("--text") || "#e8e3da";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(ov.label, px + LABEL_PAD, py - LABEL_PAD);
  }

  ctx.restore();
}

function renderVline(ctx, ov, toX, _toY, plotH) {
  const px = toX(ov.x);
  const color = ov.color || css("--accent") || "#ffa500";
  const width = ov.width || 1.4;
  const dash = ov.dashed !== false ? [6, 4] : [];

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.globalAlpha = ov.opacity ?? 1;
  ctx.beginPath();
  ctx.moveTo(px, 0);
  ctx.lineTo(px, plotH);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function renderHline(ctx, ov, _toX, toY, _plotH, plotW) {
  const py = toY(ov.y);
  const color = ov.color || css("--accent-2") || "#ffd23f";
  const width = ov.width || 1.4;
  const dash = ov.dashed !== false ? [6, 4] : [];

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.globalAlpha = ov.opacity ?? 1;
  ctx.beginPath();
  ctx.moveTo(0, py);
  ctx.lineTo(plotW, py);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function renderArea(ctx, ov, toX, toY, h) {
  const x1 = ov.x;
  const x2 = ov.x2 ?? ov.x1 ?? ov.x;
  const lo = Math.min(x1, x2);
  const hi = Math.max(x1, x2);
  const pxLo = toX(lo);
  const pxHi = toX(hi);
  const color = ov.color || css("--accent") || "#ffa500";

  const pyTop = typeof ov.yTop === "number" ? toY(ov.yTop) : 0;
  const pyBot = typeof ov.yBottom === "number" ? toY(ov.yBottom) : (h || toY(0));

  ctx.save();
  ctx.globalAlpha = ov.opacity ?? 0.25;
  ctx.fillStyle = ov.color || css("--accent") || "#ffa500";
  ctx.beginPath();
  ctx.moveTo(pxLo, pyBot);
  ctx.lineTo(pxLo, pyTop);
  ctx.lineTo(pxHi, pyTop);
  ctx.lineTo(pxHi, pyBot);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function renderTriangle(ctx, ov, toX, toY) {
  const pts = ov.points;
  if (!Array.isArray(pts) || pts.length < 3) return;

  ctx.save();
  ctx.globalAlpha = ov.opacity ?? 0.35;
  ctx.fillStyle = ov.color || css("--accent") || "#ffa500";
  ctx.strokeStyle = ov.color || css("--accent") || "#ffa500";
  ctx.lineWidth = ov.width || 2;

  ctx.beginPath();
  ctx.moveTo(toX(pts[0].x), toY(pts[0].y));
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(toX(pts[i].x), toY(pts[i].y));
  }
  ctx.closePath();
  if (ov.fill !== false) ctx.fill();
  ctx.globalAlpha = Math.min(1, (ov.opacity ?? 0.35) + 0.5);
  ctx.stroke();
  ctx.restore();
}

function renderArrow(ctx, ov, toX, toY) {
  const x1 = ov.x1 ?? 0;
  const y1 = ov.y1 ?? 0;
  const x2 = ov.x2 ?? 1;
  const y2 = ov.y2 ?? 0;
  const px1 = toX(x1), py1 = toY(y1);
  const px2 = toX(x2), py2 = toY(y2);
  const color = ov.color || css("--accent") || "#ffa500";
  const width = ov.width || 2;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;

  ctx.beginPath();
  ctx.moveTo(px1, py1);
  ctx.lineTo(px2, py2);
  ctx.stroke();

  const angle = Math.atan2(py2 - py1, px2 - px1);
  const headLen = 10;
  ctx.beginPath();
  ctx.moveTo(px2, py2);
  ctx.lineTo(px2 - headLen * Math.cos(angle - Math.PI / 6), py2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(px2 - headLen * Math.cos(angle + Math.PI / 6), py2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  if (ov.label) {
    const fs = ov.fontSize || 12;
    ctx.font = `${fs}px ${css("--font-mono") || "monospace"}`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(ov.label, (px1 + px2) / 2, Math.min(py1, py2) - 6);
  }

  ctx.restore();
}

function renderCircle(ctx, ov, toX, toY) {
  const cx = ov.cx ?? 0;
  const cy = ov.cy ?? 0;
  const rx = ov.rx ?? 1;
  const ry = ov.ry ?? 1;
  const px = toX(cx);
  const py = toY(cy);
  const prx = Math.abs(toX(cx + rx) - toX(cx));
  const pry = Math.abs(toY(cy) - toY(cy + ry));
  const color = ov.color || css("--accent") || "#ffa500";

  ctx.save();

  if (ov.opacity) {
    ctx.globalAlpha = ov.opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(px, py, prx, pry, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = ov.stroke || color;
  ctx.lineWidth = ov.strokeWidth || 1.5;
  ctx.beginPath();
  ctx.ellipse(px, py, prx, pry, 0, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.restore();
}

function renderText(ctx, ov, toX, toY) {
  const px = toX(ov.x);
  const py = toY(ov.y);
  const fs = ov.fontSize || 16;
  const color = ov.color || css("--text") || "#e8e3da";

  ctx.save();
  ctx.font = `${ov.fontWeight || "normal"} ${fs}px ${css("--font-mono") || "monospace"}`;
  ctx.fillStyle = color;
  ctx.textAlign = ov.align || "left";
  ctx.textBaseline = ov.baseline || "top";
  ctx.globalAlpha = ov.opacity ?? 1;

  if (ov.stroke) {
    ctx.strokeStyle = ov.stroke;
    ctx.lineWidth = ov.strokeWidth || 3;
    ctx.strokeText(ov.text || "", px, py);
  }
  ctx.fillText(ov.text || "", px, py);
  ctx.restore();
}

function renderFreehand(ctx, ov, toX, toY) {
  const pts = ov.points;
  if (!Array.isArray(pts) || pts.length < 2) return;

  ctx.save();
  ctx.strokeStyle = ov.color || css("--accent") || "#ffa500";
  ctx.lineWidth = ov.width || 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = ov.opacity ?? 1;

  if (ov.dashed) ctx.setLineDash(ov.dashed);

  ctx.beginPath();
  ctx.moveTo(toX(pts[0].x), toY(pts[0].y));
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(toX(pts[i].x), toY(pts[i].y));
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function renderDistance(ctx, ov, toX, toY, fmt) {
  const x1 = ov.x1 ?? ov.x;
  const y1 = ov.y1 ?? ov.y;
  const x2 = ov.x2 ?? x1;
  const y2 = ov.y2 ?? y1;
  const px1 = toX(x1), py1 = toY(y1);
  const px2 = toX(x2), py2 = toY(y2);

  const color = ov.color || css("--accent") || "#ffa500";

  ctx.save();

  /* segment */
  ctx.strokeStyle = color;
  ctx.lineWidth = ov.width || 2;
  ctx.beginPath();
  ctx.moveTo(px1, py1);
  ctx.lineTo(px2, py2);
  ctx.stroke();

  /* end dots */
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(px1, py1, 3, 0, TWO_PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(px2, py2, 3, 0, TWO_PI);
  ctx.fill();

  /* label */
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const label = ov.label || (fmt ? fmt(dist) : String(Math.round(dist * 100) / 100));
  const mx = (px1 + px2) / 2;
  const my = (py1 + py2) / 2;
  const fs = ov.fontSize || 12;

  ctx.font = `${fs}px ${css("--font-mono") || "monospace"}`;
  ctx.fillStyle = ov.labelColor || color;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  /* white halo for readability */
  ctx.strokeStyle = css("--plot-bg") || "#0b0c10";
  ctx.lineWidth = 3;
  ctx.strokeText(label, mx, my - LABEL_PAD);
  ctx.fillText(label, mx, my - LABEL_PAD);

  ctx.restore();
}

/* ── Dispatcher by type ──────────────────────────────────── */

const RENDERERS = {
  marker:    (ctx, ov, toX, toY, _w, _h, fmt) => renderMarker(ctx, ov, toX, toY, fmt),
  vline:     (ctx, ov, toX, toY, w, _h)       => renderVline(ctx, ov, toX, toY, _h),
  hline:     (ctx, ov, toX, toY, w, _h)       => renderHline(ctx, ov, toX, toY, _h, w),
  area:      (ctx, ov, toX, toY, w, h)        => renderArea(ctx, ov, toX, toY, h),
  triangle:  (ctx, ov, toX, toY)              => renderTriangle(ctx, ov, toX, toY),
  text:      (ctx, ov, toX, toY)              => renderText(ctx, ov, toX, toY),
  arrow:     (ctx, ov, toX, toY)              => renderArrow(ctx, ov, toX, toY),
  circle:    (ctx, ov, toX, toY)              => renderCircle(ctx, ov, toX, toY),
  freehand:  (ctx, ov, toX, toY)              => renderFreehand(ctx, ov, toX, toY),
  distance:  (ctx, ov, toX, toY, _w, _h, fmt) => renderDistance(ctx, ov, toX, toY, fmt),
};

/* ==========================================================
   renderOverlaysOnPlot
   ==========================================================
   Draws all visible overlays onto a Plot canvas context.

   @param {CanvasRenderingContext2D} ctx
   @param {Plot}   plot        — must expose .X(), .Y(), .W, .H
   @param {Array}  overlays    — overlay objects with `type` field
   @param {Function} formatExact — optional formatter for labels
   ========================================================== */
export function renderOverlaysOnPlot(ctx, plot, overlays, formatExact) {
  if (!Array.isArray(overlays) || overlays.length === 0) return;

  const toX = (x) => plot.X(x);
  const toY = (y) => plot.Y(y);
  const w = plot.W;
  const h = plot.H;

  for (const ov of overlays) {
    if (ov === null || ov === undefined) continue;
    if (ov.visible === false) continue;

    const render = RENDERERS[ov.type];
    if (!render) continue;

    render(ctx, ov, toX, toY, w, h, formatExact);
  }
}

/* ==========================================================
   renderOverlaysOnTrigCircle
   ==========================================================
   Draws overlays that make sense on the TrigCircle canvas.

   Applicable types: marker, text, distance, freehand, vline, hline
   (area and triangle are mapped to circle-space coordinates).

   @param {CanvasRenderingContext2D} ctx
   @param {Object} circle — must expose:
       .cx   center x in px
       .cy   center y in px
       .r    radius in px
       .W    canvas width
       .H    canvas height
   @param {Array} overlays
   ========================================================== */
export function renderOverlaysOnTrigCircle(ctx, circle, overlays) {
  if (!Array.isArray(overlays) || overlays.length === 0) return;

  const { cx, cy, r, W, H } = circle;

  /* map polar (angle, radius) → canvas px */
  const toX = (val) => {
    /* if overlay stores raw px, pass through */
    if (typeof val === "number" && Math.abs(val) > TWO_PI && !isNaN(val)) return val;
    return cx + r * Math.cos(val);
  };
  const toY = (val) => {
    if (typeof val === "number" && Math.abs(val) > TWO_PI && !isNaN(val)) return val;
    return cy - r * Math.sin(val);
  };

  for (const ov of overlays) {
    if (ov === null || ov === undefined) continue;
    if (ov.visible === false) continue;

    const render = RENDERERS[ov.type];
    if (!render) continue;

    render(ctx, ov, toX, toY, W, H, null);
  }
}

/* ==========================================================
   hitTestOverlay
   ==========================================================
   Returns true if pixel (px, py) is near the overlay element.

   @param {Object} overlay
   @param {number} px        — pointer x in canvas CSS pixels
   @param {number} py        — pointer y in canvas CSS pixels
   @param {Object} engine    — Plot or TrigCircle (must expose .X/.Y or .cx/.cy/.r)
   @param {number} [tolerance] — hit radius in px (default 12)
   @returns {boolean}
   ========================================================== */
export function hitTestOverlay(overlay, px, py, engine, tolerance) {
  if (!overlay) return false;
  if (overlay.visible === false) return false;

  const tol = tolerance ?? DEFAULT_HIT_RADIUS;

  switch (overlay.type) {
    case "marker":
      return _hitPoint(overlay.x, overlay.y, px, py, engine, tol);

    case "vline":
      return _hitVline(overlay.x, px, py, engine, tol);

    case "hline":
      return _hitHline(overlay.y, px, py, engine, tol);

    case "area":
      return _hitArea(overlay, px, py, engine, tol);

    case "triangle":
      return _hitTriangle(overlay, px, py, engine, tol);

    case "text":
      return _hitPoint(overlay.x, overlay.y, px, py, engine, tol);

    case "freehand":
      return _hitFreehand(overlay, px, py, engine, tol);

    case "distance":
      return _hitDistance(overlay, px, py, engine, tol);

    default:
      return false;
  }
}

/* ── Hit-test helpers ────────────────────────────────────── */

function _toCanvas(x, y, engine) {
  if (typeof engine.X === "function") {
    return { cx: engine.X(x), cy: engine.Y(y) };
  }
  /* TrigCircle: values are angles or raw px */
  if (typeof engine.cx === "number" && typeof engine.r === "number") {
    const cx = engine.cx + engine.r * Math.cos(x);
    const cy = engine.cy - engine.r * Math.sin(x);
    return { cx, cy };
  }
  return { cx: x, cy: y };
}

function _hitPoint(x, y, px, py, engine, tol) {
  const { cx, cy } = _toCanvas(x, y, engine);
  return Math.hypot(px - cx, py - cy) <= tol;
}

function _hitVline(x, px, py, engine, tol) {
  let linePx;
  if (typeof engine.X === "function") {
    linePx = engine.X(x);
  } else if (typeof engine.cx === "number" && typeof engine.r === "number") {
    linePx = engine.cx + engine.r * Math.cos(x);
  } else {
    linePx = x;
  }
  return Math.abs(px - linePx) <= tol;
}

function _hitHline(y, px, py, engine, tol) {
  let linePy;
  if (typeof engine.Y === "function") {
    linePy = engine.Y(y);
  } else if (typeof engine.cy === "number" && typeof engine.r === "number") {
    linePy = engine.cy - engine.r * Math.sin(y);
  } else {
    linePy = y;
  }
  return Math.abs(py - linePy) <= tol;
}

function _hitArea(ov, px, py, engine, tol) {
  const x1 = Math.min(ov.x, ov.x2 ?? ov.x);
  const x2 = Math.max(ov.x, ov.x2 ?? ov.x);
  let pLo, pHi;
  if (typeof engine.X === "function") {
    pLo = engine.X(x1);
    pHi = engine.X(x2);
  } else {
    pLo = x1; pHi = x2;
  }
  /* convert to canvas coords (Plot X is left→right) */
  const left = Math.min(pLo, pHi);
  const right = Math.max(pLo, pHi);
  if (px < left - tol || px > right + tol) return false;
  /* vertical: check y bounds */
  if (typeof engine.Y === "function") {
    const yTop = ov.yTop ?? ov.yMax ?? 0;
    const yBot = ov.yBottom ?? ov.yMin ?? 0;
    const cTop = engine.Y(yTop);
    const cBot = engine.Y(yBot);
    const top = Math.min(cTop, cBot);
    const bot = Math.max(cTop, cBot);
    return py >= top - tol && py <= bot + tol;
  }
  return true;
}

function _hitTriangle(ov, px, py, engine, tol) {
  const pts = ov.points;
  if (!Array.isArray(pts) || pts.length < 3) return false;
  /* convert points to canvas */
  const cpts = pts.map((p) => _toCanvas(p.x, p.y, engine));
  /* simple point-in-polygon via ray casting */
  let inside = false;
  for (let i = 0, j = cpts.length - 1; i < cpts.length; j = i++) {
    const xi = cpts[i].cx, yi = cpts[i].cy;
    const xj = cpts[j].cx, yj = cpts[j].cy;
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  if (inside) return true;
  /* also check proximity to edges */
  for (let i = 0, j = cpts.length - 1; i < cpts.length; j = i++) {
    if (_distToSegment(px, py, cpts[i].cx, cpts[i].cy, cpts[j].cx, cpts[j].cy) <= tol) return true;
  }
  return false;
}

function _hitFreehand(ov, px, py, engine, tol) {
  const pts = ov.points;
  if (!Array.isArray(pts) || pts.length < 2) return false;
  for (let i = 1; i < pts.length; i++) {
    const a = _toCanvas(pts[i - 1].x, pts[i - 1].y, engine);
    const b = _toCanvas(pts[i].x, pts[i].y, engine);
    if (_distToSegment(px, py, a.cx, a.cy, b.cx, b.cy) <= tol) return true;
  }
  return false;
}

function _hitDistance(ov, px, py, engine, tol) {
  const a = _toCanvas(ov.x1 ?? ov.x, ov.y1 ?? ov.y, engine);
  const b = _toCanvas(ov.x2 ?? ov.x, ov.y2 ?? ov.y, engine);
  return _distToSegment(px, py, a.cx, a.cy, b.cx, b.cy) <= tol;
}

function _distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/* ==========================================================
   createOverlay  — factory helper
   ========================================================== */
export function createOverlay(type, props) {
  return { type, visible: true, ...props };
}
