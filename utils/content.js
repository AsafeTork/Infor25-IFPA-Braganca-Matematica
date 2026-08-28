/* utils/content.js — helpers pedagógicos + pipeline de renderização */
import { processMath } from "../components/katex.js";

export function h(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/** Define o conteúdo de um container, pré-renderizando toda a matemática $...$ e $$...$$ */
export function setHTML(el, html) {
  el.innerHTML = processMath(html);
}

export const section = (eyebrow, title, body = "") => `
  <section class="lesson-section">
    <span class="section-eyebrow">${eyebrow}</span>
    <h2 class="lesson-h2">${title}</h2>
    ${body}
  </section>`;

export const def  = (title, body)    => `<div class="def"><div class="def-h">${title}</div><div>${body}</div></div>`;
export const box  = (kind, tag, body)=> `<div class="box ${kind}"><span class="box-tag">${tag}</span>${body}</div>`;
export const think  = (body) => box("think",   "Para pensar",      body);
export const explore= (body) => box("explore", "Para explorar",    body);
export const solved = (bodyOrTitle, body) => body !== undefined
  ? box("solved", `Resolução — ${bodyOrTitle}`, body)
  : box("solved", "Resolução", bodyOrTitle);
export const apply  = (body) => box("apply",   "Aplicação real",   body);
export const labSlot = (id)  => `<div id="${id}" class="lab-slot"></div>`;
/** Desafio opcional destacado — borda laranja + fundo suave */
export const challenge = (body) => `<!-- Desafio opcional --><div class="challenge-box" style="border-left:3px solid var(--accent);background:color-mix(in srgb,var(--accent) 8%,var(--surface));padding:.75rem 1rem;border-radius:0 8px 8px 0;margin:.75rem 0"><div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.35rem"><span aria-hidden="true">◆</span><strong style="color:var(--accent);font-size:.74rem;letter-spacing:.05em;text-transform:uppercase">Desafio opcional — tente sem olhar a dica</strong></div>${body}</div>`;
// quizSlot mantido por compatibilidade mas não usado — quizes removidos em favor de desafios opcionais
export const quizSlot= (id)  => `<div id="${id}"></div>`;
