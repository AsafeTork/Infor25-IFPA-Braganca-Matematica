/* ═══════════════════════════════════════════════════════════════
  .oficina/capturar.mjs — gera as 4 capturas do anexo visual
   ───────────────────────────────────────────────────────────────
   Usa Playwright (já é devDependency do projeto): espera o
   conteúdo renderizar de verdade antes de fotografar — o render
   por requestAnimationFrame é assíncrono e a captura às vezes
   saía pela metade.

   Uso:  node oficina/capturar.mjs          (servidor em :8811)
         BASE=http://localhost:8000 node oficina/capturar.mjs
   ═══════════════════════════════════════════════════════════════ */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE = process.env.BASE ?? "http://127.0.0.1:8811";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "anexos");
const TENTATIVAS = Number(process.env.TENTATIVAS ?? 3);
mkdirSync(OUT, { recursive: true });

const SHOTS = [
  {
    file: "01-aluno-lab.png",
    url: "/aluno.html#pot-inteiro",
    wait: ".lesson-section",
    texto: "Estendendo para expoentes negativos",
  },
  {
    file: "02-aluno-aula.png",
    url: "/aluno.html#trig-movimento-circular",
    wait: ".lesson-section",
    texto: "Pêndulos",
  },
  {
    file: "03-professor-circulo.png",
    url: "/professor.html",
    wait: "#prof-presets .preset-btn",
    async acao(page) {
      await page.click('.preset-btn[data-label="sin(x)"]');
      await page.waitForTimeout(1400);
    },
    texto: "sin(x)",
  },
  {
    file: "04-professor-modo-aula.png",
    url: "/professor.html",
    wait: "#prof-presets .preset-btn",
    async acao(page) {
      await page.click('.preset-btn[data-label="sin + cos"]');
      await page.waitForTimeout(700);
      await page.click("#btn-aula");
      await page.waitForTimeout(1200);
    },
    texto: "Sair do Modo Aula",
  },
];

/* ── navegador ───────────────────────────────────────────────
   Tenta o Chrome do sistema (channel "chrome"), depois o binário
   em /opt/google/chrome, e por último o Chromium do Playwright.
   Se nenhum existir: npx playwright install chromium           */
async function abrirNavegador() {
  const opcoes = [
    { channel: "chrome", args: ["--no-sandbox"] },
    { executablePath: "/opt/google/chrome/chrome", args: ["--no-sandbox"] },
    { args: ["--no-sandbox"] },
  ];
  let ultimoErro;
  for (const op of opcoes) {
    try {
      return await chromium.launch(op);
    } catch (err) {
      ultimoErro = err;
    }
  }
  throw new Error(
    "nenhum navegador disponível — rode: npx playwright install chromium\n" +
      ultimoErro?.message?.split("\n")[0],
  );
}

const browser = await abrirNavegador();
let falhas = 0;

for (const shot of SHOTS) {
  let ok = false;

  for (let n = 1; n <= TENTATIVAS && !ok; n++) {
    const page = await browser.newPage({
      viewport: { width: 1600, height: 1000 },
      deviceScaleFactor: 1,
    });
    try {
      await page.goto(BASE + shot.url, { waitUntil: "load", timeout: 30000 });
      await page.waitForSelector(shot.wait, { timeout: 20000 });
      if (shot.acao) await shot.acao(page);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);

      const html = await page.content();
      if (shot.texto && !html.includes(shot.texto)) {
        throw new Error(`conteúdo ausente: "${shot.texto}"`);
      }

      await page.screenshot({ path: join(OUT, shot.file) });
      ok = true;
      console.log(`  ✓ ${shot.file.padEnd(32)} tentativa ${n}`);
    } catch (err) {
      console.log(`  · ${shot.file.padEnd(32)} ${err.message.split("\n")[0]} — repetindo (${n}/${TENTATIVAS})`);
    } finally {
      await page.close();
    }
  }

  if (!ok) {
    falhas++;
    console.log(`  ✗ ${shot.file.padEnd(32)} FALHOU após ${TENTATIVAS} tentativas`);
  }
}

await browser.close();
process.exit(falhas ? 1 : 0);
