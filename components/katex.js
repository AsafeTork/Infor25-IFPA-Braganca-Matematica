/* components/katex.js — renderização matemática via KaTeX */

export function tex(el, latex, display = false) {
  if (window.katex) {
    try { window.katex.render(latex, el, { displayMode: display, throwOnError: false }); return; }
    catch (e) { el.textContent = latex; }
  } else { el.textContent = latex; }
}

/** percorre o documento e renderiza tudo dentro de \( ... \) e $$ ... $$ */
/**
 * Walks all text nodes inside `root` and renders $...$ and $$...$$ in-place.
 * Uses recursive childNodes traversal (no NodeFilter / createTreeWalker needed).
 * Skips: canvas, script, style, already-rendered .katex elements, .lab internals.
 * Safe to call AFTER mountLab/mountQuizSet — those are element nodes, not touched.
 */
export function autoRender(root) {
  if (!root || !window.katex) return;
  _walkMath(root);
}

function _walkMath(el) {
  // Use a static copy so replacements mid-loop don't confuse iteration
  const kids = Array.from(el.childNodes);
  for (const node of kids) {
    if (node.nodeType === 3) {            // TEXT_NODE
      const raw = node.textContent;
      if (!raw.includes('$')) continue;
      const rendered = processMath(raw);
      if (rendered === raw) continue;
      const span = document.createElement('span');
      span.innerHTML = rendered;
      node.replaceWith(span);
    } else if (node.nodeType === 1) {     // ELEMENT_NODE — recurse, but skip certain subtrees
      const tag = node.tagName;
      const cls = node.className || '';
      if (tag === 'CANVAS' || tag === 'SVG' || tag === 'SCRIPT' || tag === 'STYLE') continue;
      if (typeof cls === 'string' && (cls.includes('katex') || cls.includes('lab-canvas') || cls.includes('sym-float'))) continue;
      _walkMath(node);
    }
  }
}

/** converte uma expressão estilo "2^x", "(1/2)^x", "A·sin(Bx+C)" em LaTeX legível */
export function toLatex(expr) {
  let s = expr.trim();
  const eq = s.indexOf("=");
  let lhs = "y";
  if (eq >= 0) { lhs = s.slice(0, eq).trim() || "y"; s = s.slice(eq + 1).trim(); }
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => "^(" + m.replace(/./g, (ch) => SUP.indexOf(ch)) + ")");
  s = s
    .replace(/·|\*/g, " \\cdot ")
    .replace(/pi/gi, "\\pi ")
    .replace(/π/g, "\\pi ")
    .replace(/sqrt\(([^)]*)\)/g, "\\sqrt{$1}")
    .replace(/\(([^()]+)\)\/\(([^()]+)\)/g, "\\frac{$1}{$2}")
    .replace(/([0-9a-zA-Z.]+)\/([0-9a-zA-Z.]+)/g, "\\frac{$1}{$2}")
    .replace(/\^\(([^)]*)\)/g, "^{$1}")
    .replace(/\^([0-9a-zA-Z.]+)/g, "^{$1}");
  return `${lhs} = ${s}`;
}

/**
 * Pre-renders all $...$ and $$...$$ in an HTML string to KaTeX HTML.
 * Call this BEFORE setting innerHTML — avoids all autoRender timing/scanning issues.
 * Handles escaped backslashes already (\\theta in JS string = \theta for KaTeX).
 */
export function processMath(html) {
  if (!window.katex) return html;
  // Replace $$...$$ (display) first (before inline $ matching)
  html = html.replace(/\$\$([^$]+?)\$\$/gs, (_, tex) => {
    try { return window.katex.renderToString(tex, { displayMode: true, throwOnError: false }); }
    catch { return `<code>${tex}</code>`; }
  });
  // Replace $...$ (inline) — not preceded/followed by $
  html = html.replace(/\$([^$\n]+?)\$/g, (_, tex) => {
    try { return window.katex.renderToString(tex, { displayMode: false, throwOnError: false }); }
    catch { return `<code>${tex}</code>`; }
  });
  return html;
}
