/* core/aluno.js — app do aluno (extraído de aluno.html) */
import { initTheme, mountThemeToggle } from "./theme.js";
import "./sw-register.js";
import { mountFloatingKeypad } from "../components/keypad.js";
import { potenciacaoLessons, potenciacaoMeta } from "../features/potenciacao/index.js";
import { exponencialLessons, exponencialMeta } from "../features/exponencial/index.js";
import { sequenciasLessons, sequenciasMeta } from "../features/sequencias/index.js";
import { trigonometriaLessons, trigonometriaMeta } from "../features/trigonometria/index.js";
import { OverlayManager } from "./overlays.js";
import { renderOverlaysOnTrigCircle, renderOverlaysOnPlot } from "./overlayRenderers.js";

initTheme();
mountThemeToggle(document.getElementById("tg"));
mountFloatingKeypad();

// Zoom control (desktop only)
let zoomLevel = 100;
const zoomControl = document.getElementById("zoom-control");
const zoomLabel = document.getElementById("zoom-label");

if (window.innerWidth >= 900 && zoomControl) {
  zoomControl.style.display = "flex";
  
  document.getElementById("zoom-in").addEventListener("click", () => {
    if (zoomLevel < 200) {
      zoomLevel += 10;
      applyZoom();
    }
  });
  
  document.getElementById("zoom-out").addEventListener("click", () => {
    if (zoomLevel > 80) {
      zoomLevel -= 10;
      applyZoom();
    }
  });
  
  function applyZoom() {
    const scale = zoomLevel / 100;
    document.documentElement.style.setProperty("--zoom-scale", scale);
    zoomLabel.textContent = zoomLevel + "%";
    localStorage.setItem("zoom-level", zoomLevel);
  }
  
  const saved = localStorage.getItem("zoom-level");
  if (saved) {
    zoomLevel = parseInt(saved);
    applyZoom();
  } else {
    document.documentElement.style.setProperty("--zoom-scale", 1);
  }
}

const MODULES = [
  { meta: potenciacaoMeta,   lessons: potenciacaoLessons },
  { meta: exponencialMeta,   lessons: exponencialLessons },
  { meta: sequenciasMeta,    lessons: sequenciasLessons },
  { meta: trigonometriaMeta, lessons: trigonometriaLessons },
];
const ALL = MODULES.flatMap(m => m.lessons.map(l => ({ ...l, meta: m.meta })));

/* ── Progresso do aluno (localStorage) ── */
const PROGRESS_KEY = "info25:progress";
let doneSet;
try { doneSet = new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY)) || []); }
catch { doneSet = new Set(); }

function saveProgress() {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...doneSet])); } catch {}
}

function markDone(id) {
  if (!id || doneSet.has(id)) return;
  doneSet.add(id);
  saveProgress();
  updateProgressUI();
}

function updateProgressUI() {
  const fill = document.getElementById("al-progress-fill");
  const count = document.getElementById("al-progress-count");
  if (fill && count) {
    const n = ALL.filter(l => doneSet.has(l.id)).length;
    count.textContent = `${n}/${ALL.length}`;
    fill.style.width = `${ALL.length ? (n / ALL.length) * 100 : 0}%`;
  }
  sidebarInner.querySelectorAll(".al-lesson-btn").forEach(btn => {
    btn.classList.toggle("done", doneSet.has(btn.dataset.id));
  });
  MODULES.forEach((m, mi) => {
    const el = sidebarInner.querySelector(`.al-ch-progress[data-mi="${mi}"]`);
    if (el) el.textContent = `${m.lessons.filter(l => doneSet.has(l.id)).length}/${m.lessons.length}`;
  });
}

function lessonBottomVisible() {
  const se = document.scrollingElement || document.documentElement;
  return se.scrollTop + window.innerHeight >= se.scrollHeight - 60;
}

function checkBottom() {
  if (!_readyToTrack) return;
  const l = ALL[cur];
  if (l && lessonBottomVisible()) markDone(l.id);
}



/* ── Build collapsible sidebar ── */
const sidebarInner = document.getElementById("sidebar-inner");

// Track which chapters are open (default: first one open)
const openState = MODULES.map((_, i) => i === 0);

let sidebarBuilt = false;

function buildSidebar(currentId) {
  if (!sidebarBuilt) {
    const totalDone = ALL.filter(l => doneSet.has(l.id)).length;
    sidebarInner.innerHTML = `
      <div class="al-sidebar-progress">
        <div class="al-progress-label"><span>Progresso</span><span id="al-progress-count">${totalDone}/${ALL.length}</span></div>
        <div class="al-progress-track"><div class="al-progress-fill" id="al-progress-fill" style="width:${ALL.length ? (totalDone / ALL.length) * 100 : 0}%"></div></div>
      </div>` + MODULES.map((m, mi) => {
      const isOpen = openState[mi];
      const chDone = m.lessons.filter(l => doneSet.has(l.id)).length;
      return `
      <div class="al-chapter" data-mi="${mi}">
        <button class="al-ch-btn ${isOpen ? 'open' : ''}" data-mi="${mi}">
          <span class="al-ch-num">${m.meta.num}</span>
          <span class="al-ch-title">${m.meta.title}</span>
          <span class="al-ch-progress" data-mi="${mi}">${chDone}/${m.lessons.length}</span>
          <svg class="al-ch-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="al-ch-lessons ${isOpen ? 'open' : ''}" id="ch-lessons-${mi}">
          ${m.lessons.map(l => `
            <button class="al-lesson-btn" data-id="${l.id}">
              ${l.title}
            </button>`).join("")}
        </div>
      </div>`;
    }).join("");

    sidebarInner.querySelectorAll(".al-ch-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const mi = +btn.dataset.mi;
        openState[mi] = !openState[mi];
        btn.classList.toggle("open", openState[mi]);
        document.getElementById(`ch-lessons-${mi}`).classList.toggle("open", openState[mi]);
      });
    });

    sidebarInner.addEventListener("click", e => {
      const btn = e.target.closest(".al-lesson-btn");
      if (btn) {
        go(btn.dataset.id);
        closeSidebar();
      }
    });

    sidebarBuilt = true;
  }

  sidebarInner.querySelectorAll(".al-lesson-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.id === currentId);
    btn.classList.toggle("done", doneSet.has(btn.dataset.id));
  });

  if (currentId) {
    const mi = MODULES.findIndex(m => m.lessons.some(l => l.id === currentId));
    if (mi >= 0 && !openState[mi]) {
      openState[mi] = true;
      const chBtn = sidebarInner.querySelector(`.al-ch-btn[data-mi="${mi}"]`);
      const chList = document.getElementById(`ch-lessons-${mi}`);
      if (chBtn) chBtn.classList.add("open");
      if (chList) chList.classList.add("open");
    }
  }
}

/* ── Mobile sidebar ── */
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuBtn = document.getElementById("menu-btn");

function openSidebar() { sidebar.classList.add("open"); overlay.classList.add("active"); }
function closeSidebar() { sidebar.classList.remove("open"); overlay.classList.remove("active"); }

menuBtn.addEventListener("click", () =>
  sidebar.classList.contains("open") ? closeSidebar() : openSidebar());
overlay.addEventListener("click", closeSidebar);
window.addEventListener("resize", ()=>{ if(window.innerWidth>=760){ document.getElementById("al-overlay")?.classList.remove("active"); document.getElementById("overlay")?.classList.remove("active"); document.querySelector(".al-overlay")?.classList.remove("active"); sidebar.classList.remove("open"); } });

/* ── Navigation ── */
let cur = 0;
let _readyToTrack = false;
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const crumbEl = document.getElementById("crumb");
const titleEl = document.getElementById("title");
const lessonEl = document.getElementById("lesson");

/* ── Student OverlayManager (read-only) ── */
const overlayMgr = new OverlayManager();
overlayMgr.registerTarget("trig-canvas", "trigCircle", null);
window.__alunoOverlayMgr = overlayMgr;

function syncTrigOverlays() {
  const allOverlays = overlayMgr.getAll();
  const canvases = lessonEl.querySelectorAll("canvas");
  for (const cv of canvases) {
    const ucRoot = cv.closest(".trig-circle-root, .ctg-container, .tpe-container, .tv-container, .pv-container, [data-trig-root]");
    if (!ucRoot) continue;
    let ovc = ucRoot.querySelector(".al-overlay-canvas");
    if (!ovc) {
      ovc = document.createElement("canvas");
      ovc.className = "al-overlay-canvas";
      ovc.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;border-radius:8px;";
      ucRoot.style.position = "relative";
      ucRoot.appendChild(ovc);
    }
    const W = cv.clientWidth || cv.offsetWidth || 300;
    const H = cv.clientHeight || cv.offsetHeight || 300;
    const dpr = window.devicePixelRatio || 1;
    ovc.width = W * dpr;
    ovc.height = H * dpr;
    const ctx = ovc.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (allOverlays.length === 0) continue;
    const pad = 40;
    const circleInfo = { cx: W / 2, cy: H / 2, r: Math.min(W, H) / 2 - pad, W, H };
    // Escolha inteligente: Plot vs TrigCircle (mantém compatibilidade #17)
    const isPlotCanvas = cv.matches("#tpe-canvas, #tv-graph, #pv-graph, #ctg-graph, .tpe-canvas, .tv-graph, .pv-graph, .ctg-graph, .pv-anim, #pv-anim, .lab-canvas") || !!cv.closest(".tpe-graph, .pv-graph-wrap, .tv-graph-wrap, .ctg-right, .pv-anim-wrap, .lab-canvas");
    if (isPlotCanvas) {
      try {
        const plotLike = { X: (x) => (x + 6) / 12 * W, Y: (y) => H - (y + 4) / 8 * H, W, H };
        // Tenta Plot renderer; fallback para TrigCircle se falhar
        for (const ov of allOverlays) {
          if (["area","triangle","vline","hline","marker","arrow","circle","text","freehand","distance","ruler"].includes(ov.type)) {
            renderOverlaysOnPlot(ctx, plotLike, [{ ...ov.props, type: ov.type }]);
          } else {
            renderOverlaysOnTrigCircle(ctx, circleInfo, [{ ...ov.props, type: ov.type }]);
          }
        }
      } catch(e) {
        for (const ov of allOverlays) {
          renderOverlaysOnTrigCircle(ctx, circleInfo, [{ ...ov.props, type: ov.type }]);
        }
      }
    } else {
      for (const ov of allOverlays) {
        renderOverlaysOnTrigCircle(ctx, circleInfo, [{ ...ov.props, type: ov.type }]);
      }
    }
  }
}
overlayMgr.onChange(syncTrigOverlays);

let _pendingBoot = null;

function go(id) {
  if (_pendingBoot) { cancelAnimationFrame(_pendingBoot); _pendingBoot = null; }
  _readyToTrack = false;
  const idx = ALL.findIndex(l => l.id === id);
  if (idx < 0) return;
  
  const mi = MODULES.findIndex(m => m.lessons.some(le => le.id === id));
  cur = idx;
  const l = ALL[cur];

  // Open that chapter if collapsed
  if (mi >= 0 && !openState[mi]) { openState[mi] = true; }

  crumbEl.textContent = `${l.meta.chapter}`;
  titleEl.textContent = l.title;
  if (window._cleanupLesson) try{ window._cleanupLesson(); }catch(e){ console.warn("[aluno] cleanupLesson immediate", e); }
  lessonEl.innerHTML = "";

  const boot = () => {
    _pendingBoot = requestAnimationFrame(() => {
      _pendingBoot = null;
      requestAnimationFrame(() => {
        if (window._cleanupLesson) try{ window._cleanupLesson(); }catch(e){ console.warn("[aluno] cleanupLesson", e); }
        window._cleanupLesson = l.cleanupLesson || null;
        l.render(lessonEl);
        syncTrigOverlays();
        _readyToTrack = true;
        checkBottom();
      });
    });
  };
  if (window.katex) boot();
  else if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot, {once:true});
  setTimeout(()=>{ if(document.getElementById("lesson") && document.getElementById("lesson").innerHTML==="") boot(); }, 2000);

  prevBtn.disabled = cur === 0;
  nextBtn.disabled = cur >= ALL.length - 1;
  prevBtn.style.visibility = cur === 0 ? "hidden" : "visible";
  nextBtn.style.visibility = cur >= ALL.length - 1 ? "hidden" : "visible";
  history.replaceState(null, "", "#" + id);

  buildSidebar(id);
  // Scroll to top of content
  document.getElementById("main").scrollTo({ top: 0, behavior: "smooth" });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.addEventListener("scroll", () => {
  if (!_readyToTrack) return;
  const l = ALL[cur];
  if (l && !doneSet.has(l.id) && lessonBottomVisible()) markDone(l.id);
}, { passive: true });

prevBtn.addEventListener("click", () => { if (cur > 0) go(ALL[cur - 1].id); });
nextBtn.addEventListener("click", () => { if (cur < ALL.length - 1) go(ALL[cur + 1].id); });

const hash = location.hash.slice(1);
buildSidebar(null);
// Defer initial render until after browser paint — eliminates load-time reflows
requestAnimationFrame(() => {
  go(hash && ALL.find(l => l.id === hash) ? hash : ALL[0].id);
});
