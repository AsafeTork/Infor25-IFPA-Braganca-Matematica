/* core/theme.js — alterna modo claro/escuro */
const KEY = "inf25-theme";

export function initTheme() {
  const saved = localStorage.getItem(KEY) || "dark";
  document.documentElement.setAttribute("data-theme", saved);
  return saved;
}

export function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(KEY, next);
  window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  return next;
}

const SUN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
const MOON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 12.7A9 9 0 1 1 11.3 3A7 7 0 0 0 21 12.7Z"/></svg>`;

export function mountThemeToggle(el) {
  const paint = () => { el.innerHTML = document.documentElement.getAttribute("data-theme") === "dark" ? MOON : SUN; };
  paint();
  el.addEventListener("click", () => { toggleTheme(); paint(); });
}
