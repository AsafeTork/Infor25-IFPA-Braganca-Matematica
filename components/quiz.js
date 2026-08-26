/* components/quiz.js */
import { autoRender } from "./katex.js";

// Track quiz scores per container
const quizTrackers = new Map();

/**
 * Aceita três formatos de questão:
 *   Formato A (múltipla escolha): { stem, options, answer, explain, source }
 *   Formato B (múltipla escolha): { q,    opts,   ans,    expl,    source }
 *   Formato C (entrada de texto): { q,    type: "text", answer: ["resp1", "resp2"], placeholder, expl, source }
 */
export function mountQuiz(container, raw, trackerId) {
  if (!raw) return;

  const isText = raw.type === "text";

  const q = {
    stem:    raw.stem    ?? raw.q    ?? "",
    options: raw.options ?? raw.opts ?? [],
    answer:  raw.answer  ?? raw.ans  ?? 0,
    explain: raw.explain ?? raw.expl ?? "",
    source:  raw.source  ?? "",
    placeholder: raw.placeholder ?? "Digite sua resposta...",
  };

  if (isText && !Array.isArray(q.answer)) return;
  if (!isText && (!Array.isArray(q.options) || q.options.length === 0)) return;

  const el = document.createElement("div");
  el.className = "quiz";

  if (isText) {
    el.innerHTML = `
      ${q.source ? `<div class="q-src">${q.source}</div>` : ""}
      <div class="q-stem">${q.stem}</div>
      <div class="q-text-area">
        <input type="text" class="q-text-input" placeholder="${q.placeholder}" autocomplete="off" />
        <button class="q-text-btn">Verificar</button>
      </div>
      <div class="q-feedback" style="display:none">
        <h5></h5>
        <div class="q-exp">${q.explain}</div>
      </div>`;

    container.appendChild(el);

    const input = el.querySelector(".q-text-input");
    const btn   = el.querySelector(".q-text-btn");
    const fb    = el.querySelector(".q-feedback");
    const fbh   = fb.querySelector("h5");
    let answered = false;

    const check = () => {
      if (answered) return;
      const val = input.value.trim().toLowerCase();
      if (!val) return;
      answered = true;
      const correct = q.answer.some(a => a.toLowerCase() === val);
      input.disabled = true;
      btn.disabled = true;
      input.classList.add(correct ? "correct" : "wrong");
      fb.style.display = "block";
      fb.classList.add(correct ? "correct" : "wrong");
      fbh.textContent = correct ? "✓ Correto!" : "✗ Não desta vez";
      if (!correct) {
        input.value = input.value + "  →  " + q.answer[0];
      }
      autoRender(fb);
      
      // Update tracker
      if (trackerId && quizTrackers.has(trackerId)) {
        const tracker = quizTrackers.get(trackerId);
        tracker.answered++;
        if (correct) tracker.correct++;
        
        // If all questions answered, save score
        if (tracker.answered >= tracker.total) {
          const event = new CustomEvent('quizComplete', {
            detail: {
              lessonId: trackerId,
              correct: tracker.correct,
              total: tracker.total
            }
          });
          document.dispatchEvent(event);
        }
      }
    };

    btn.addEventListener("click", check);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") check();
    });

    autoRender(el);
    return el;
  }

  const letters = ["a","b","c","d","e"];
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
      fb.classList.add(correct ? "correct" : "wrong");
      fbh.textContent = correct ? "✓ Correto!" : "✗ Não desta vez";
      autoRender(fb);
      
      // Update tracker
      if (trackerId && quizTrackers.has(trackerId)) {
        const tracker = quizTrackers.get(trackerId);
        tracker.answered++;
        if (correct) tracker.correct++;
        
        // If all questions answered, save score
        if (tracker.answered >= tracker.total) {
          const event = new CustomEvent('quizComplete', {
            detail: {
              lessonId: trackerId,
              correct: tracker.correct,
              total: tracker.total
            }
          });
          document.dispatchEvent(event);
        }
      }
    });
  });

  autoRender(el);
  return el;
}

export function mountQuizSet(container, list, lessonId) {
  if (!container || !Array.isArray(list)) return;
  
  // Create tracker for this quiz set
  if (lessonId) {
    // Check if tracker already exists (for lessons with multiple quiz sets)
    if (quizTrackers.has(lessonId)) {
      const existing = quizTrackers.get(lessonId);
      existing.total += list.length;
    } else {
      quizTrackers.set(lessonId, {
        total: list.length,
        answered: 0,
        correct: 0
      });
    }
  }
  
  list.forEach(q => mountQuiz(container, q, lessonId));
}

// Reset trackers (call when navigating to new lesson)
export function resetQuizTrackers() {
  quizTrackers.clear();
}
