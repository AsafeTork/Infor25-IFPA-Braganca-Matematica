/* ============================================================
   core/mathEngine.js
   Parser + avaliador de expressões matemáticas.
   Aceita: y = 2^x · y = π^x · y = (1/2)^x · y = A·sin(Bx+C)+D · y = x^(3/2)
   Suporta: + - * / ^ · , parênteses, multiplicação implícita (2x, 3sin x),
            constantes π e e, funções (sin, cos, tan, sqrt, log, ln, exp, abs...),
            e parâmetros nomeados (A, B, C, D, k, a, b...).
   ============================================================ */

const CONSTS = { pi: Math.PI, "π": Math.PI, e: Math.E, tau: 2 * Math.PI, "τ": 2 * Math.PI };

const FUNCS = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs,
  ln: Math.log, log: (x) => Math.log10(x), log2: Math.log2,
  exp: Math.exp, floor: Math.floor, ceil: Math.ceil, sign: Math.sign,
};

/* -------------------- Tokenizer -------------------- */
// multi-char names that must NOT be split into single letters (longest first)
const KNOWN_NAMES = [
  "asin", "acos", "atan", "sinh", "cosh", "tanh", "sqrt", "cbrt",
  "log2", "floor", "ceil", "sign",
  "sin", "cos", "tan", "abs", "exp", "log", "tau", "ln", "pi",
].sort((a, b) => b.length - a.length);

function tokenize(src) {
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const s = src
    .replace(/\s+/g, "")
    .replace(/·/g, "*").replace(/×/g, "*").replace(/−/g, "-").replace(/÷/g, "/")
    // expoentes em sobrescrito (x²  x³  10⁶ …) → ^(2) ^(3) ^(6)
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => "^(" + m.replace(/./g, (ch) => SUP.indexOf(ch)) + ")");
  const tokens = [];
  let i = 0;
  const isDigit = (c) => c >= "0" && c <= "9";
  const isAlpha = (c) => /[a-zA-Zπτθ]/.test(c);

  while (i < s.length) {
    const c = s[i];
    if (isDigit(c) || (c === "." && isDigit(s[i + 1]))) {
      let num = "";
      while (i < s.length && (isDigit(s[i]) || s[i] === ".")) num += s[i++];
      tokens.push({ t: "num", v: parseFloat(num) });
    } else if (isAlpha(c)) {
      let cluster = "";
      while (i < s.length && (isAlpha(s[i]) || isDigit(s[i]))) cluster += s[i++];
      // Peel known function/constant names; leftover letters become single-letter vars
      // so that e.g. "Bx" -> B * x  and  "Asin(x)" -> A * sin(x).
      let j = 0;
      while (j < cluster.length) {
        let matched = null;
        for (const name of KNOWN_NAMES) {
          const seg = cluster.substr(j, name.length);
          if (seg.toLowerCase() === name) { matched = name; break; }
        }
        if (matched) { tokens.push({ t: "id", v: matched }); j += matched.length; }
        else { tokens.push({ t: "id", v: cluster[j] }); j += 1; }
      }
    } else if ("+-*/^(),".includes(c)) {
      tokens.push({ t: c });
      i++;
    } else {
      throw new Error(`Símbolo inesperado: "${c}"`);
    }
  }
  return tokens;
}

/* -------------------- Parser (recursive descent) -> AST --------------------
   grammar:
     expr   := term (('+'|'-') term)*
     term   := factor (('*'|'/'|implicit) factor)*
     factor := unary ('^' factor)?        // right-assoc power
     unary  := ('-'|'+') unary | primary
     primary:= num | const | func '(' expr ')' | id | '(' expr ')'
---------------------------------------------------------------------------- */
function parse(tokens) {
  let p = 0;
  const peek = () => tokens[p];
  const next = () => tokens[p++];
  const eat = (t) => { if (!peek() || peek().t !== t) throw new Error(`Esperado "${t}"`); return next(); };

  function parseExpr() {
    let node = parseTerm();
    while (peek() && (peek().t === "+" || peek().t === "-")) {
      const op = next().t;
      node = { type: "bin", op, l: node, r: parseTerm() };
    }
    return node;
  }

  function startsFactor() {
    const tk = peek();
    if (!tk) return false;
    return tk.t === "num" || tk.t === "id" || tk.t === "(";
  }

  function parseTerm() {
    let node = parseFactor();
    while (peek()) {
      if (peek().t === "*" || peek().t === "/") {
        const op = next().t;
        node = { type: "bin", op, l: node, r: parseFactor() };
      } else if (startsFactor()) {
        // implicit multiplication: 2x, 3sin(x), (x)(x+1)
        node = { type: "bin", op: "*", l: node, r: parseFactor() };
      } else break;
    }
    return node;
  }

  function parseFactor() {
    const node = parseUnary();
    if (peek() && peek().t === "^") {
      next();
      return { type: "bin", op: "^", l: node, r: parseFactor() };
    }
    return node;
  }

  function parseUnary() {
    if (peek() && (peek().t === "-" || peek().t === "+")) {
      const op = next().t;
      return { type: "unary", op, v: parseUnary() };
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const tk = peek();
    if (!tk) throw new Error("Expressão incompleta.");
    if (tk.t === "num") { next(); return { type: "num", v: tk.v }; }
    if (tk.t === "(") { next(); const e = parseExpr(); eat(")"); return e; }
    if (tk.t === "id") {
      next();
      const name = tk.v;
      if (peek() && peek().t === "(") {
        // function call (lowercased)
        next();
        const arg = parseExpr();
        eat(")");
        return { type: "call", name: name.toLowerCase(), arg };
      }
      return { type: "var", name };
    }
    throw new Error("Token inesperado.");
  }

  const ast = parseExpr();
  if (p < tokens.length) throw new Error("Sobrou expressão sem operador.");
  return ast;
}

/* -------------------- pow real-domain -------------------- */
// Para raízes com índice ímpar: (-8)^(1/3) = -2, correto no ℝ.
// Para bases negativas com expoente irracional → NaN.
function powReal(base, exp) {
  if (base >= 0) return Math.pow(base, exp);
  // base negativa
  if (Number.isInteger(exp)) return Math.pow(base, exp); // (-2)^3 = -8 ok
  // Testa se exp = p/q com q ímpar (representação mais simples possível em float)
  // Aproximação: se 1/exp é inteiro ímpar ou exp*q é inteiro ímpar
  // Estratégia prática: tenta numerador/denominador via limite de precisão
  const MAX_Q = 100;
  for (let q = 1; q <= MAX_Q; q++) {
    const p = Math.round(exp * q);
    if (Math.abs(p / q - exp) < 1e-10) {
      if (q % 2 === 1) return (base < 0 ? -1 : 1) * Math.pow(Math.abs(base), exp);
      return NaN; // denominador par → NaN para base negativa
    }
  }
  return NaN; // irracional com base negativa → NaN
}

/* -------------------- Evaluator -------------------- */
function evalNode(node, scope) {
  switch (node.type) {
    case "num": return node.v;
    case "unary": { const v = evalNode(node.v, scope); return node.op === "-" ? -v : v; }
    case "bin": {
      const l = evalNode(node.l, scope), r = evalNode(node.r, scope);
      switch (node.op) {
        case "+": return l + r;
        case "-": return l - r;
        case "*": return l * r;
        case "/": return l / r;
        case "^":
          return powReal(l, r);
      }
      break;
    }
    case "call": {
      const f = FUNCS[node.name];
      if (!f) throw new Error(`Função desconhecida: ${node.name}`);
      return f(evalNode(node.arg, scope));
    }
    case "var": {
      const n = node.name;
      if (n in scope) return scope[n];
      if (n.toLowerCase() in CONSTS) return CONSTS[n.toLowerCase()];
      throw new Error(`Variável não definida: ${n}`);
    }
  }
  return NaN;
}

/* -------------------- Public API -------------------- */
/**
 * Compila "y = <expr>" ou "<expr>" em uma função f(x, params?).
 * Retorna { fn, rhs, params:[...], error }
 */
export function compile(input) {
  try {
    let rhs = input.trim();
    const eqi = rhs.indexOf("=");
    if (eqi >= 0) rhs = rhs.slice(eqi + 1).trim(); // descarta "y =", "f(x) ="
    if (!rhs) return { error: "Digite uma expressão." };

    const ast = parse(tokenize(rhs));

    // detecta parâmetros (variáveis que não sejam x nem constantes)
    const params = new Set();
    (function walk(n) {
      if (n.type === "var") {
        const low = n.name.toLowerCase();
        if (n.name !== "x" && !(low in CONSTS)) params.add(n.name);
      } else if (n.type === "bin") { walk(n.l); walk(n.r); }
      else if (n.type === "unary") walk(n.v);
      else if (n.type === "call") walk(n.arg);
    })(ast);

    const fn = (x, p = {}) => evalNode(ast, { x, ...p });
    return { fn, rhs, params: [...params], ast, error: null };
  } catch (err) {
    return { error: err.message };
  }
}

export { CONSTS, FUNCS };
