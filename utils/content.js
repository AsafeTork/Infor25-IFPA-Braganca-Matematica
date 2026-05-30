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
export const solved = (title, body)  => box("solved",  `Resolução — ${title}`, body);
export const apply  = (body) => box("apply",   "Aplicação real",   body);
export const labSlot = (id)  => `<div id="${id}" class="lab-slot"></div>`;
export const quizSlot= (id)  => `<div id="${id}"></div>`;
