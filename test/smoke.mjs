/* test/smoke.mjs — smoke test das 3 páginas (Playwright lib, sem runner)
 * Uso: npm test  |  node test/smoke.mjs [--full]
 * Cobre: carga sem erro de console, aluno (navegação/lab/katex), professor
 * (fórmulas/preset/círculo/tabs/ferramentas), landing (tema).
 * Qualquer pageerror/console.error falha o teste. */
import { chromium } from "playwright";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const FULL = process.argv.includes("--full");

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml", ".json": "application/json", ".png": "image/png",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf",
  ".map": "application/json", ".webmanifest": "application/manifest+json",
};

function startServer() {
  const server = http.createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
      if (p.endsWith("/")) p += "index.html";
      const file = normalize(join(ROOT, p));
      if (!file.startsWith(normalize(ROOT))) { res.writeHead(403).end(); return; }
      const data = await readFile(file);
      res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
      res.end(data);
    } catch {
      res.writeHead(404).end("not found");
    }
  });
  return new Promise((r) => server.listen(0, "127.0.0.1", () => r(server)));
}

const results = [];
let failures = 0;
function check(name, ok, extra = "") {
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`);
  if (!ok) failures++;
}

function trackErrors(page, bucket, label) {
  page.on("pageerror", (e) => bucket.push(`[${label}] pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") bucket.push(`[${label}] console.error: ${m.text()}`);
  });
}

async function main() {
  const server = await startServer();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();

  /* ── 1. LANDING ── */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errs = [];
    trackErrors(page, errs, "index");
    await page.goto(`${base}/index.html`, { waitUntil: "load" });
    check("index: título", (await page.title()).includes("Informática 25"));
    check("index: card aluno presente", await page.locator('a[href="aluno.html"]').count() === 1);
    check("index: card professor presente", await page.locator('a[href="professor.html"]').count() === 1);
    const t0 = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    await page.click("#tg");
    const t1 = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    check("index: toggle tema alterna", t0 !== t1, `${t0} → ${t1}`);
    await page.waitForTimeout(150);
    check("index: sem erros de console", errs.length === 0, errs.join(" | "));
    await ctx.close();
  }

  /* ── 2. ALUNO ── */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errs = [];
    trackErrors(page, errs, "aluno");
    await page.goto(`${base}/aluno.html`, { waitUntil: "load" });
    await page.waitForSelector(".al-lesson-btn", { timeout: 10000 });
    const lessons = await page.locator(".al-lesson-btn").count();
    check("aluno: sidebar montada (≥10 aulas)", lessons >= 10, `${lessons} aulas`);
    check("aluno: katex renderizado", await page.locator("#lesson .katex").count() > 0);
    check("aluno: keypad flutuante montado", await page.locator(".sf-wrap, .sf-close-all, [class*=sf-]").count() > 0);

    // navegação: clica na 3ª aula → hash + conteúdo mudam
    const before = await page.evaluate(() => location.hash);
    await page.locator(".al-lesson-btn").nth(2).click();
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => location.hash);
    check("aluno: navegação muda hash", before !== after, `${before || "(vazio)"} → ${after}`);
    check("aluno: conteúdo re-renderizou", await page.locator("#lesson .katex").count() > 0);

    // laboratório de fórmulas: aula "expoente inteiro" tem lab
    // (goto só com hash é same-document — recarrega p/ garantir render inicial)
    await page.goto(`${base}/aluno.html#pot-inteiro`, { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForSelector(".lab-input", { timeout: 10000 });
    check("aluno: lab de fórmulas montado", await page.locator(".lab-input").count() > 0);
    if (FULL) {
      const inp = page.locator(".lab-input").first();
      await inp.fill("2^x");
      await page.waitForTimeout(250);
      check("aluno: lab renderiza fórmula digitada",
        await page.locator(".lab-render .katex, .lab-render .katex-mathml").count() > 0);
    }
    // progresso: marcar aula ao ver o fim do conteúdo + persistir após reload
    const lessonId = await page.evaluate(() => location.hash.slice(1));
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(400);
    check("aluno: progresso salvo ao chegar ao fim da aula",
      await page.evaluate((id) =>
        (JSON.parse(localStorage.getItem("info25:progress") || "[]")).includes(id), lessonId),
      lessonId);
    await page.reload({ waitUntil: "load" });
    await page.waitForSelector(".al-lesson-btn", { timeout: 10000 });
    check("aluno: progresso persiste (✓ na sidebar)", await page.locator(".al-lesson-btn.done").count() >= 1);
    check("aluno: barra de progresso global existe", await page.locator("#al-progress-fill").count() === 1);

    await page.waitForTimeout(150);
    check("aluno: sem erros de console", errs.length === 0, errs.join(" | "));
    await ctx.close();
  }

  /* ── 3. PROFESSOR ── */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errs = [];
    trackErrors(page, errs, "professor");
    await page.goto(`${base}/professor.html`, { waitUntil: "load" });
    await page.waitForSelector("#plot-canvas", { timeout: 10000 });
    check("professor: canvas existe", await page.locator("#plot-canvas").count() === 1);

    // fórmulas default (2) + adicionar
    await page.waitForSelector(".frow", { timeout: 10000 });
    const f0 = await page.locator(".frow").count();
    check("professor: 2 fórmulas default", f0 === 2, `${f0}`);
    await page.click("#btn-add");
    check("professor: botão add cria fórmula", await page.locator(".frow").count() === f0 + 1);
    await page.locator(".frow-del").last().click();
    check("professor: remover fórmula funciona", await page.locator(".frow").count() === f0);

    // preset adiciona fórmula (escolhe um que não está nos defaults p/ não ser deduplicado)
    const presets = await page.locator(".preset-btn").count();
    check("professor: presets renderizados (≥8)", presets >= 8, `${presets}`);
    const fBefore = await page.locator(".frow").count();
    await page.locator('.preset-btn[data-label="sin(x)"]').first().click();
    await page.waitForTimeout(200);
    check("professor: preset adiciona fórmula", await page.locator(".frow").count() > fBefore,
      `${fBefore} → ${await page.locator(".frow").count()}`);

    // círculo unitário (estado pode já vir ligado pelo preset — normaliza antes)
    const ucOn = () => page.evaluate(() => document.getElementById("uc-info").classList.contains("show"));
    if (await ucOn()) await page.click("#btn-circle");
    await page.waitForTimeout(150);
    await page.click("#btn-circle");
    await page.waitForTimeout(200);
    check("professor: círculo liga (uc-info.show)", await ucOn());
    check("professor: ângulo exibido", (await page.locator("#uc-ang").innerText()).trim().length > 0);
    await page.click("#btn-circle");
    await page.waitForTimeout(150);
    check("professor: círculo desliga", !(await ucOn()));

    // tabs (fórmulas / ângulo / ferramentas)
    const tabs = await page.locator(".panel-tab").count();
    check("professor: 3 abas do painel", tabs === 3, `${tabs} abas`);
    await page.locator('.panel-tab[data-tab="ferramentas"]').click();
    await page.waitForTimeout(150);
    check("professor: aba ferramentas ativa",
      await page.evaluate(() => document.querySelector('.tab-panel[data-tab="ferramentas"]').classList.contains("active")));

    // ferramenta de anotação: marca → camada criada
    const layers0 = Number(await page.locator("#layers-count").innerText());
    await page.click("#tool-marker");
    const box = await page.locator("#plot-canvas").boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(200);
    const layers1 = Number(await page.locator("#layers-count").innerText());
    check("professor: ferramenta marcador cria anotação", layers1 === layers0 + 1, `${layers0} → ${layers1}`);

    // undo/redo
    await page.click("#tool-undo");
    await page.waitForTimeout(150);
    check("professor: undo remove anotação",
      Number(await page.locator("#layers-count").innerText()) === layers0);
    await page.click("#tool-redo");
    await page.waitForTimeout(150);
    check("professor: redo recria anotação",
      Number(await page.locator("#layers-count").innerText()) === layers1);

    // zoom via eixo (botões de fonte/ui existem) + reset
    check("professor: botão reset view existe", await page.locator("#btn-reset").count() === 1);
    await page.click("#btn-reset");

    // baixar menu abre
    await page.click("#btn-download");
    await page.waitForTimeout(150);
    check("professor: menu download abre",
      await page.evaluate(() => document.getElementById("download-menu").classList.contains("open")));
    await page.keyboard.press("Escape");

    // tema
    const t0 = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    await page.click("#theme-btn");
    const t1 = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    check("professor: toggle tema alterna", t0 !== t1, `${t0} → ${t1}`);

    await page.waitForTimeout(200);
    check("professor: sem erros de console", errs.length === 0, errs.join(" | "));
    await ctx.close();
  }

  /* ── 4. Modo Aula (TV/projetor) ── */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errs = [];
    trackErrors(page, errs, "aula");
    await page.goto(`${base}/professor.html`, { waitUntil: "load" });
    await page.waitForSelector("#btn-aula", { timeout: 10000 });
    await page.click("#btn-aula");
    await page.waitForTimeout(250);
    check("aula: classe no body", await page.evaluate(() => document.body.classList.contains("modo-aula")));
    check("aula: topbar escondida",
      await page.evaluate(() => getComputedStyle(document.querySelector(".prof-top")).display === "none"));
    check("aula: botão de sair visível", await page.locator("#ma-exit").isVisible());
    check("aula: tema forçado dark", await page.evaluate(() => document.documentElement.getAttribute("data-theme") === "dark"));
    check("aula: aria-pressed true", await page.evaluate(() => document.getElementById("btn-aula").getAttribute("aria-pressed") === "true"));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    check("aula: Esc sai do modo", await page.evaluate(() => !document.body.classList.contains("modo-aula")));
    check("aula: botão de sair some", !(await page.locator("#ma-exit").isVisible()));
    await page.keyboard.press("f");
    await page.waitForTimeout(200);
    check("aula: atalho F ativa", await page.evaluate(() => document.body.classList.contains("modo-aula")));
    await page.click("#ma-exit");
    await page.waitForTimeout(200);
    check("aula: botão sair desativa", await page.evaluate(() => !document.body.classList.contains("modo-aula")));
    await page.waitForTimeout(200);
    check("aula: sem erros de console", errs.length === 0, errs.join(" | "));
    await ctx.close();
  }

  /* ── 5. mobile smoke (professor + aluno carregam em 375px) ── */
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 700 }, hasTouch: true });
    const page = await ctx.newPage();
    const errs = [];
    trackErrors(page, errs, "mobile");
    await page.goto(`${base}/aluno.html`, { waitUntil: "load" });
    await page.waitForSelector(".al-lesson-btn", { timeout: 10000 });
    await page.goto(`${base}/professor.html`, { waitUntil: "load" });
    await page.waitForSelector("#plot-canvas", { timeout: 10000 });
    check("mobile: professor carrega sem erro", errs.length === 0, errs.join(" | "));
    await ctx.close();
  }

  /* ── 6. PWA offline (service worker) ── */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errs = [];
    trackErrors(page, errs, "pwa");
    // fase online: visita as 3 páginas p/ popular precache + fontes externas
    for (const url of ["/index.html", "/aluno.html", "/professor.html"]) {
      await page.goto(base + url, { waitUntil: "load" });
      await page.waitForTimeout(600);
    }
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload({ waitUntil: "load" });
    check("pwa: página controlada pelo SW",
      await page.evaluate(() => !!navigator.serviceWorker.controller));
    const cached = await page.evaluate(async () => {
      const keys = await caches.keys();
      const pre = keys.find((k) => k.startsWith("precache-"));
      return pre ? (await (await caches.open(pre)).keys()).length : 0;
    });
    check("pwa: precache ≥50 arquivos", cached >= 50, `${cached} arquivos`);
    // fase offline: tudo deve continuar funcionando
    await ctx.setOffline(true);
    await page.goto(`${base}/index.html`, { waitUntil: "load" });
    check("pwa: index recarrega offline", await page.locator('a[href="aluno.html"]').count() === 1);
    await page.goto(`${base}/aluno.html`, { waitUntil: "load" });
    await page.waitForSelector(".al-lesson-btn", { timeout: 10000 });
    check("pwa: aluno offline monta sidebar", await page.locator(".al-lesson-btn").count() >= 10);
    await page.waitForSelector("#lesson .katex", { timeout: 10000 });
    check("pwa: aluno offline renderiza katex", await page.locator("#lesson .katex").count() > 0);
    await page.goto(`${base}/professor.html`, { waitUntil: "load" });
    await page.waitForSelector(".frow", { timeout: 10000 });
    check("pwa: professor offline monta fórmulas", await page.locator(".frow").count() > 0);
    await page.waitForTimeout(300);
    check("pwa: offline sem erros de console", errs.length === 0, errs.join(" | "));
    await ctx.close();
  }

  await browser.close();
  server.close();

  console.log("\n" + results.join("\n"));
  console.log(`\n${results.length - failures}/${results.length} ok`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error("ERRO FATAL:", e); process.exit(1); });
