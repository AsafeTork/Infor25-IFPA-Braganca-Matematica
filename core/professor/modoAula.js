/* core/professor/modoAula.js — Modo Aula (TV/projetor)
   Prioridade ALTA de MODO_AULA_SPEC.md: toggle (botão + atalho F/Esc),
   tela cheia, tema dark forçado, curvas/labels mais grossos (alto contraste),
   espaço = play/pause do círculo. Layout/fontes grandes via styles/modo-aula.css
   (escala existente --info-scale/--graph-scale). */
import { plot } from "./plot.js";
import { getScales, setScales } from "./scale.js";

let active = false;
let prevTheme = null;
let savedScales = null;

export const isModoAula = () => active;

export function toggleModoAula(force) {
  const next = typeof force === "boolean" ? force : !active;
  if (next === active) return active;
  active = next;
  const root = document.documentElement;
  if (active) {
    prevTheme = root.getAttribute("data-theme");
    savedScales = getScales();
    root.setAttribute("data-theme", "dark");
    document.body.classList.add("modo-aula");
    setScales(1.32, 1.5); // sidebar e canvas legíveis a distância
    if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
  } else {
    document.body.classList.remove("modo-aula");
    if (prevTheme) root.setAttribute("data-theme", prevTheme);
    prevTheme = null;
    if (savedScales) { setScales(savedScales.ui, savedScales.graph); savedScales = null; }
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }
  // alto contraste à distância: curvas, pontos e labels do canvas mais grossos
  plot.setStyleMul(active ? 1.7 : 1);
  const btn = document.getElementById("btn-aula");
  if (btn) {
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  }
  // esconder a topbar muda o tamanho do stage → resize imediato do canvas
  requestAnimationFrame(() => plot.resize());
  return active;
}

document.getElementById("btn-aula")?.addEventListener("click", () => toggleModoAula());
document.getElementById("ma-exit")?.addEventListener("click", () => toggleModoAula(false));
document.querySelectorAll('[data-action="aula"]').forEach(btn =>
  btn.addEventListener("click", () => toggleModoAula()));

/* Atalhos (essenciais da spec):
   F = toggle · Esc = sai (se menu aberto, o handler do panel fecha o menu) ·
   Espaço = play/pause do círculo (só no modo ativo, nunca em inputs/botões) */
document.addEventListener("keydown", (e) => {
  const t = e.target;
  const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
  if (e.key === "f" || e.key === "F") {
    if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    toggleModoAula();
    return;
  }
  if (e.key === "Escape" && active) {
    if (document.querySelector(".prof-download-menu.open, .prof-panel.open")) return;
    toggleModoAula(false);
    return;
  }
  if ((e.key === " " || e.code === "Space") && active && !typing) {
    if (t && t.tagName === "BUTTON") return; // deixa botão focado agir normalmente
    e.preventDefault();
    document.getElementById("uc-play-btn")?.click();
  }
});
