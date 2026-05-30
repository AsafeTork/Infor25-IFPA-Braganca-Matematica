/* components/quiz.js */
import { autoRender } from "./katex.js";

/**
 * Aceita dois formatos de questão:
 *   Formato A: { stem, options, answer, explain, source }
 *   Formato B: { q,    opts,   ans,    expl,    source }
 */
export function mountQuiz(container, raw) {
  if (!raw) return;
  const q = {
    stem:    raw.stem    ?? raw.q    ?? "",
    options: raw.options ?? raw.opts ?? [],
    answer:  raw.answer  ?? raw.ans  ?? 0,
    explain: raw.explain ?? raw.expl ?? "",
    source:  raw.source  ?? "",
  };

  if (!Array.isArray(q.options) || q.options.length === 0) return;

  const letters = ["a","b","c","d","e"];
  const el = document.createElement("div");
  el.className = "quiz";
  el.innerHTML = `
    ${q.source ? `<div class="q-src">${q.source}</div>` : ""}
    <div class="q-stem">${q.stem}</div>
    <div class="q-options">
      ${q.options.map((o, i) => `
        <button class="q-opt" data-i="${i}">
          <span class="mk">${letters[i]}</span><span>${o}</span>
        </button>`).join("")}
    </div>
    <div class="q-feedback" style="display:none">
      <h5></h5>
      <div class="q-exp">${q.explain}</div>
    </div>`;

  container.appendChild(el);

  const fb  = el.querySelector(".q-feedback");
  const fbh = fb.querySelector("h5");
  let answered = false;

  el.querySelectorAll(".q-opt").forEach(btn => {
    btn.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const chosen = +btn.dataset.i;
      const correct = chosen === q.answer;
      btn.classList.add(correct ? "correct" : "wrong");
      el.querySelectorAll(".q-opt").forEach((b, i) => {
        b.disabled = true;
        if (i === q.answer) b.classList.add("correct");
      });
      fb.style.display = "block";
      fbh.textContent = correct ? "✓ Correto!" : "✗ Não desta vez";
      fbh.style.color = correct ? "var(--accent)" : "#f87171";
      autoRender(fb);
    });
  });

  autoRender(el);
  return el;
}

export function mountQuizSet(container, list) {
  if (!container || !Array.isArray(list)) return;
  list.forEach(q => mountQuiz(container, q));
}
