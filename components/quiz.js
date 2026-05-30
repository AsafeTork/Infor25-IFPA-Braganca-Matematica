/* components/quiz.js — questões guiadas que ensinam o raciocínio */
import { autoRender } from "./katex.js";

/**
 * mountQuiz(container, question)
 * question = {
 *   stem (HTML/LaTeX), source, options:[...], answer:index,
 *   explain (HTML/LaTeX explicando o caminho — não só a resposta)
 * }
 */
export function mountQuiz(container, q) {
  const el = document.createElement("div");
  el.className = "quiz";
  const letters = ["a", "b", "c", "d", "e"];
  el.innerHTML = `
    ${q.source ? `<div class="q-src">${q.source}</div>` : ""}
    <div class="q-stem">${q.stem}</div>
    <div class="q-options">
      ${q.options.map((o, i) => `<button class="q-opt" data-i="${i}">
        <span class="mk">${letters[i]}</span><span>${o}</span></button>`).join("")}
    </div>
    <div class="q-feedback">
      <h5></h5>
      <div class="q-exp">${q.explain || ""}</div>
    </div>`;
  container.appendChild(el);

  const fb = el.querySelector(".q-feedback");
  const fbh = fb.querySelector("h5");
  let answered = false;
  el.querySelectorAll(".q-opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const i = +btn.dataset.i;
      const correct = q.answer;
      el.querySelectorAll(".q-opt").forEach((b, j) => {
        if (j === correct) b.classList.add("correct");
        if (j === i && i !== correct) b.classList.add("wrong");
      });
      fbh.textContent = i === correct ? "Correto — entenda o porquê:" : "Não foi dessa vez. Veja o caminho:";
      fb.classList.add("show");
      autoRender(fb);
    });
  });
  autoRender(el);
  return el;
}

export function mountQuizSet(container, list) {
  list.forEach((q) => mountQuiz(container, q));
}
