/* components/keypad.js
   Barra de símbolos flutuante, global.
   - Aparece sobre tudo (position:fixed)
   - Categorias colapsáveis exibidas só por ícone SVG
   - Se há um <input> ou <textarea> focado: insere no cursor
   - Caso contrário: copia para a área de transferência
*/

const CATS = [
  {
    id: "greek",
    // Σ icon
    icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M14 4H6l5 6-5 6h8"/></svg>`,
    title: "Letras gregas",
    keys: [
      { l:"π", v:"π" }, { l:"θ", v:"θ" }, { l:"α", v:"α" }, { l:"β", v:"β" },
      { l:"φ", v:"φ" }, { l:"ω", v:"ω" }, { l:"∞", v:"∞" }, { l:"e", v:"e" },
    ]
  },
  {
    id: "pow",
    // x² icon
    icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><text x="2" y="15" font-size="11" stroke="none" fill="currentColor" font-family="monospace">x</text><text x="10" y="10" font-size="8" stroke="none" fill="currentColor" font-family="monospace">n</text></svg>`,
    title: "Potências e raízes",
    keys: [
      { l:"xⁿ",  v:"^(",   c:")" },
      { l:"x²",  v:"²" },
      { l:"x³",  v:"³" },
      { l:"x⁻¹", v:"^(-1)" },
      { l:"√",   v:"sqrt(", c:")" },
      { l:"∛",   v:"cbrt(", c:")" },
      { l:"¹⁄ₓ", v:"1/(" , c:")" },
    ]
  },
  {
    id: "trig",
    // wave icon
    icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1 10 Q4 4 7 10 Q10 16 13 10 Q16 4 19 10"/></svg>`,
    title: "Trigonometria",
    keys: [
      { l:"sin", v:"sin(",  c:")" },
      { l:"cos", v:"cos(",  c:")" },
      { l:"tan", v:"tan(",  c:")" },
      { l:"asin",v:"asin(", c:")" },
      { l:"acos",v:"acos(", c:")" },
      { l:"atan",v:"atan(", c:")" },
      { l:"π/2", v:"π/2" },
      { l:"π/3", v:"π/3" },
      { l:"π/4", v:"π/4" },
      { l:"π/6", v:"π/6" },
    ]
  },
  {
    id: "log",
    // ln icon
    icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><text x="1" y="14" font-size="9" stroke="none" fill="currentColor" font-family="monospace">ln</text><path d="M12 6v8"/><path d="M12 6 Q17 6 17 10 Q17 14 12 14"/></svg>`,
    title: "Logaritmos",
    keys: [
      { l:"ln",  v:"ln(",  c:")" },
      { l:"log", v:"log(", c:")" },
      { l:"log₂",v:"log2(",c:")" },
      { l:"eˣ",  v:"e^(",  c:")" },
    ]
  },
  {
    id: "ops",
    // ÷ icon
    icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10" cy="5" r="1.2" fill="currentColor"/><line x1="4" y1="10" x2="16" y2="10"/><circle cx="10" cy="15" r="1.2" fill="currentColor"/></svg>`,
    title: "Operadores",
    keys: [
      { l:"·",   v:"·" },
      { l:"÷",   v:"/" },
      { l:"( )", v:"(",  c:")" },
      { l:"|x|", v:"abs(",c:")" },
      { l:"±",   v:"±" },
    ]
  },
];

function smartInsert(inp, open, close = "") {
  if (!inp) return;
  const s = inp.selectionStart ?? inp.value.length;
  const e = inp.selectionEnd  ?? s;
  const sel = inp.value.slice(s, e);
  inp.value = inp.value.slice(0, s) + open + sel + close + inp.value.slice(e);
  const caret = s + open.length + (sel ? sel.length + close.length : 0);
  inp.focus();
  inp.setSelectionRange(caret, caret);
  inp.dispatchEvent(new Event("input", { bubbles: true }));
}

function copyText(text) {
  if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
  else {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); ta.remove();
  }
}

function getActiveInput() {
  const el = document.activeElement;
  if (!el) return null;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") return el;
  return null;
}

export function mountFloatingKeypad() {
  // Only mount once
  if (document.getElementById("sym-float")) return;

  const bar = document.createElement("div");
  bar.id = "sym-float";
  bar.className = "sym-float";

  // Open state per category
  const openCat = Object.fromEntries(CATS.map(c => [c.id, false]));
  let activeFlash = null;

  function render() {
    bar.innerHTML = CATS.map(cat => `
      <div class="sf-cat ${openCat[cat.id] ? 'open' : ''}" data-cat="${cat.id}">
        <button class="sf-icon-btn" title="${cat.title}" data-cat="${cat.id}">
          ${cat.icon}
        </button>
        <div class="sf-keys ${openCat[cat.id] ? 'open' : ''}">
          ${cat.keys.map((k, ki) =>
            `<button class="sf-key" data-cat="${cat.id}" data-ki="${ki}">${k.l}</button>`
          ).join("")}
        </div>
      </div>
    `).join("") + `
      <button class="sf-close-all" title="Fechar todos">×</button>
    `;

    // Category toggle
    bar.querySelectorAll(".sf-icon-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const cid = btn.dataset.cat;
        // If already open, close; otherwise close others and open this
        const wasOpen = openCat[cid];
        Object.keys(openCat).forEach(k => openCat[k] = false);
        if (!wasOpen) openCat[cid] = true;
        render();
      });
    });

    // Key press
    bar.querySelectorAll(".sf-key").forEach(btn => {
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault(); // don't steal focus
        const cat = CATS.find(c => c.id === btn.dataset.cat);
        const k = cat.keys[+btn.dataset.ki];
        const inp = getActiveInput();
        if (inp) {
          smartInsert(inp, k.v, k.c || "");
          // flash confirm
          btn.classList.add("flash"); clearTimeout(activeFlash);
          activeFlash = setTimeout(() => btn.classList.remove("flash"), 300);
        } else {
          const text = k.v + (k.c || "");
          copyText(text);
          btn.classList.add("copied");
          setTimeout(() => btn.classList.remove("copied"), 600);
        }
      });
    });

    // Close all
    const closeAll = bar.querySelector(".sf-close-all");
    if (closeAll) closeAll.addEventListener("click", () => {
      Object.keys(openCat).forEach(k => openCat[k] = false);
      render();
    });
  }

  render();
  document.body.appendChild(bar);
}

// Legacy: for professor panel inline use
export { smartInsert };
export function mountKeypad(el, getInput) {
  // Stub — floating keypad is global now
  el.innerHTML = "";
}
