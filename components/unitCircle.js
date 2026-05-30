/* components/unitCircle.js
   Círculo trigonométrico interativo para a área do professor.
   - Arrastar o ponto no círculo
   - Snap aos ângulos notáveis (π/6, π/4, π/3, π/2…)
   - Mostra triângulo retângulo inscrito com lados rotulados
   - Exibe sin, cos, tan exatos e decimais
   - Destaque do arco percorrido
   - Projeções sobre os eixos
*/

const NOTABLE = [
  { a: 0,            label: "0",       sin: "0",       cos: "1",       tan: "0" },
  { a: Math.PI/6,    label: "π/6",     sin: "1/2",     cos: "√3/2",    tan: "√3/3" },
  { a: Math.PI/4,    label: "π/4",     sin: "√2/2",    cos: "√2/2",    tan: "1" },
  { a: Math.PI/3,    label: "π/3",     sin: "√3/2",    cos: "1/2",     tan: "√3" },
  { a: Math.PI/2,    label: "π/2",     sin: "1",       cos: "0",       tan: "∄" },
  { a: 2*Math.PI/3,  label: "2π/3",    sin: "√3/2",    cos: "-1/2",    tan: "-√3" },
  { a: 3*Math.PI/4,  label: "3π/4",    sin: "√2/2",    cos: "-√2/2",   tan: "-1" },
  { a: 5*Math.PI/6,  label: "5π/6",    sin: "1/2",     cos: "-√3/2",   tan: "-√3/3" },
  { a: Math.PI,      label: "π",       sin: "0",       cos: "-1",      tan: "0" },
  { a: 7*Math.PI/6,  label: "7π/6",    sin: "-1/2",    cos: "-√3/2",   tan: "√3/3" },
  { a: 5*Math.PI/4,  label: "5π/4",    sin: "-√2/2",   cos: "-√2/2",   tan: "1" },
  { a: 4*Math.PI/3,  label: "4π/3",    sin: "-√3/2",   cos: "-1/2",    tan: "√3" },
  { a: 3*Math.PI/2,  label: "3π/2",    sin: "-1",      cos: "0",       tan: "∄" },
  { a: 5*Math.PI/3,  label: "5π/3",    sin: "-√3/2",   cos: "1/2",     tan: "-√3" },
  { a: 7*Math.PI/4,  label: "7π/4",    sin: "-√2/2",   cos: "√2/2",    tan: "-1" },
  { a: 11*Math.PI/6, label: "11π/6",   sin: "-1/2",    cos: "√3/2",    tan: "-√3/3" },
  { a: 2*Math.PI,    label: "2π",      sin: "0",       cos: "1",       tan: "0" },
];
const SNAP_THRESH = 0.12; // radians

function snapAngle(theta) {
  let best = null, bd = Infinity;
  for (const n of NOTABLE) {
    const d = Math.abs(theta - n.a);
    if (d < SNAP_THRESH && d < bd) { bd = d; best = n; }
  }
  return best;
}

function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

export class UnitCircle {
  constructor(canvas, infoEl) {
    this.cv = canvas;
    this.info = infoEl; // element to display exact values
    this.ctx = canvas.getContext("2d");
    this.theta = Math.PI / 3;
    this.snapped = null;
    this.dragging = false;
    this._bindEvents();
    this.draw();
  }

  _pointerAngle(e) {
    const rect = this.cv.getBoundingClientRect();
    const pt = e.touches ? e.touches[0] : e;
    const x = (pt.clientX - rect.left) / rect.width  * 2 - 1;   // -1..1
    const y = -((pt.clientY - rect.top) / rect.height * 2 - 1);  // -1..1, y-up
    return Math.atan2(y, x);
  }

  _bindEvents() {
    const cv = this.cv;
    const down = e => { e.preventDefault(); this.dragging = true; this._move(e); };
    const move = e => { if (!this.dragging) return; e.preventDefault(); this._move(e); };
    const up   = () => this.dragging = false;
    cv.addEventListener("mousedown",  down);
    cv.addEventListener("mousemove",  move);
    cv.addEventListener("mouseup",    up);
    cv.addEventListener("touchstart", down, { passive: false });
    cv.addEventListener("touchmove",  move, { passive: false });
    cv.addEventListener("touchend",   up);
  }

  _move(e) {
    let theta = this._pointerAngle(e);
    if (theta < 0) theta += 2 * Math.PI;
    const snap = snapAngle(theta);
    this.theta = snap ? snap.a : theta;
    this.snapped = snap;
    this.draw();
    this._updateInfo();
  }

  draw() {
    const cv = this.cv, ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth, H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const dark = document.documentElement.getAttribute("data-theme") !== "light";
    const fg      = dark ? "#e8e3da" : "#1a1a2e";
    const fgMut   = dark ? "#6b7280" : "#9ca3af";
    const accent  = css("--accent")  || "#ff6a1a";
    const accent2 = css("--accent-2")|| "#ffd23f";
    const green   = dark ? "#4ade80" : "#16a34a";
    const bg      = css("--surface") || "#1a1a2e";

    // Place circle using the full canvas minus margin for labels
    const margin = 38;
    const cx = W / 2, cy = H / 2;
    const r  = Math.min(W, H) / 2 - margin;

    const px = cx + r * Math.cos(this.theta);
    const py = cy - r * Math.sin(this.theta); // y-down canvas

    // ── Background ──
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // ── Grid lines ──
    ctx.strokeStyle = fgMut + "33"; ctx.lineWidth = 1; ctx.setLineDash([]);
    // x-axis
    ctx.beginPath(); ctx.moveTo(cx - r * 1.25, cy); ctx.lineTo(cx + r * 1.25, cy); ctx.stroke();
    // y-axis
    ctx.beginPath(); ctx.moveTo(cx, cy - r * 1.25); ctx.lineTo(cx, cy + r * 1.25); ctx.stroke();

    // ── Dotted reference circles (r=0.5, r=1) ──
    ctx.strokeStyle = fgMut + "22"; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.5, 0, 2 * Math.PI); ctx.stroke();
    ctx.setLineDash([]);

    // ── Main circle ──
    ctx.strokeStyle = fgMut + "66"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke();

    // ── Quadrant labels ──
    ctx.font = `bold ${Math.round(r * 0.13)}px monospace`;
    const ql = r * 0.6;
    const qLabels = [["I",1,1],["II",-1,1],["III",-1,-1],["IV",1,-1]];
    ctx.fillStyle = fgMut + "55"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const [l,sx,sy] of qLabels) ctx.fillText(l, cx + sx*ql, cy - sy*ql);

    // ── Notable angle dots ──
    ctx.fillStyle = fgMut + "66";
    for (const n of NOTABLE) {
      const nx = cx + r * Math.cos(n.a);
      const ny = cy - r * Math.sin(n.a);
      ctx.beginPath(); ctx.arc(nx, ny, 3, 0, 2 * Math.PI); ctx.fill();
    }

    // ── Arc from 0 to theta ──
    ctx.strokeStyle = accent + "60"; ctx.lineWidth = 4; ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, -this.theta, this.theta > Math.PI);
    // Actually draw arc CCW (positive theta):
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, -this.theta, false);
    ctx.stroke();
    // Small arc angle indicator near center
    ctx.strokeStyle = accent + "80"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.22, 0, -this.theta, false); ctx.stroke();

    // ── Projections (dashed) ──
    // sin (vertical from point to x-axis)
    ctx.strokeStyle = accent2; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
    // cos (horizontal from y-axis to point)
    ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke();
    // tan (vertical tangent at (1,0) to radius extended)
    const tanVal = Math.sin(this.theta) / Math.cos(this.theta);
    if (Math.abs(Math.cos(this.theta)) > 0.12) {
      const tx = cx + r; const ty = cy - r * tanVal;
      ctx.strokeStyle = green + "99"; ctx.lineWidth = 2; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(tx, cy); ctx.lineTo(tx, ty); ctx.stroke();
      // Line from origin to (1, tan)
      ctx.strokeStyle = green + "55"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();
      // tan dot
      ctx.fillStyle = green; ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(tx, ty, 4, 0, 2*Math.PI); ctx.fill();
    }
    ctx.setLineDash([]);

    // ── Triangle legs ──
    ctx.strokeStyle = fgMut + "aa"; ctx.lineWidth = 1;
    // cos leg: origin to foot (px, cy)
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();
    // sin leg: foot to point
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
    // right-angle marker at foot
    const s = 6;
    ctx.strokeStyle = fgMut + "88"; ctx.lineWidth = 1;
    if (Math.abs(Math.cos(this.theta)) > 0.05 && Math.abs(Math.sin(this.theta)) > 0.05) {
      const sx = Math.sign(Math.cos(this.theta)) * s;
      const sy = Math.sign(Math.sin(this.theta)) * s;
      ctx.beginPath();
      ctx.moveTo(px - sx, cy);
      ctx.lineTo(px - sx, cy - sy);
      ctx.lineTo(px, cy - sy);
      ctx.stroke();
    }

    // ── Radius ──
    ctx.strokeStyle = fg; ctx.lineWidth = 2.5; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    // "1" label on radius midpoint
    ctx.fillStyle = fg; ctx.font = `${Math.round(r*0.11)}px monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("1", (cx+px)/2 - 8*Math.sin(this.theta), (cy+py)/2 - 8*Math.cos(this.theta));

    // ── Labels on projection lines ──
    const fs = Math.round(r * 0.115);
    ctx.font = `bold ${fs}px monospace`;
    // cos label (below/above the horizontal leg)
    ctx.fillStyle = accent; ctx.textAlign = "center";
    ctx.fillText("cos θ", (cx + px) / 2, cy + (Math.sin(this.theta) >= 0 ? 14 : -10));
    // sin label (left/right of vertical leg)
    ctx.fillStyle = accent2; ctx.textAlign = Math.cos(this.theta) >= 0 ? "left" : "right";
    ctx.textBaseline = "middle";
    ctx.fillText("sin θ", px + (Math.cos(this.theta) >= 0 ? 6 : -6), (cy + py) / 2);
    // tan label
    if (Math.abs(Math.cos(this.theta)) > 0.12) {
      const tx = cx + r;
      ctx.fillStyle = green; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("tan θ", tx + 6, cy - r * tanVal * 0.5);
    }

    // ── Axis tick labels (1 and -1) ──
    ctx.fillStyle = fgMut; ctx.font = `${Math.round(r*0.1)}px monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText("1", cx + r, cy + 4); ctx.fillText("-1", cx - r, cy + 4);
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ctx.fillText("1", cx - 4, cy - r); ctx.fillText("-1", cx - 4, cy + r);

    // ── Point ──
    ctx.fillStyle = this.snapped ? accent2 : accent;
    ctx.beginPath(); ctx.arc(px, py, 7, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = bg; ctx.lineWidth = 2; ctx.stroke();

    // ── Angle label near arc ──
    const la = this.theta / 2;
    const lr = r * 0.32;
    ctx.fillStyle = fg; ctx.font = `bold ${Math.round(r*0.12)}px monospace`;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    const snapLabel = this.snapped ? this.snapped.label : `${(this.theta*180/Math.PI).toFixed(1)}°`;
    ctx.fillText(snapLabel, cx + lr * Math.cos(la) + 4, cy - lr * Math.sin(la));
  }

  _updateInfo() {
    if (!this.info) return;
    const t = this.theta;
    const cosV = Math.cos(t), sinV = Math.sin(t), tanV = sinV / cosV;
    const deg = (t * 180 / Math.PI % 360 + 360) % 360;
    const n = this.snapped;

    this.info.innerHTML = `
      <div class="uc-row"><span class="uc-k" style="color:var(--accent)">cos</span>
        <span class="uc-exact">${n ? n.cos : cosV.toFixed(4)}</span>
        ${n ? `<span class="uc-dec">${cosV.toFixed(4)}</span>` : ''}
      </div>
      <div class="uc-row"><span class="uc-k" style="color:var(--accent-2)">sin</span>
        <span class="uc-exact">${n ? n.sin : sinV.toFixed(4)}</span>
        ${n ? `<span class="uc-dec">${sinV.toFixed(4)}</span>` : ''}
      </div>
      <div class="uc-row"><span class="uc-k" style="color:#4ade80">tan</span>
        <span class="uc-exact">${n ? n.tan : (Math.abs(cosV) < 0.01 ? '∄' : tanV.toFixed(4))}</span>
        ${n && n.tan !== '∄' ? `<span class="uc-dec">${tanV.toFixed(4)}</span>` : ''}
      </div>
      <div class="uc-row uc-angle">
        <span class="uc-k">θ</span>
        <span class="uc-exact">${n ? n.label : deg.toFixed(1)+'°'}</span>
        <span class="uc-dec">${deg.toFixed(1)}° · ${t.toFixed(4)} rad</span>
      </div>
      ${this.snapped ? '<div class="uc-snap">⊙ ângulo notável</div>' : ''}
    `;
  }
}
