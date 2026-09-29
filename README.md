# Informática 25 · Matemática
### IFPA — Campus Bragança · Turma Informática 25

Plataforma web interativa de Matemática desenvolvida para o **2.º e 3.º ano do Ensino Médio Técnico em Informática**, baseada no conteúdo do livro da professora e inspirada em ferramentas como Brilliant, Desmos e Khan Academy.

O foco é **raciocínio, interpretação e comportamento matemático** — não respostas prontas.

---

## O que é

Um site com duas áreas distintas, cada uma com um propósito diferente:

### 📚 Área do Aluno
Ambiente de estudo completo, acessível pelo celular ou computador. Contém:

- **Teoria** — explicações diretas com linguagem acessível e notação matemática renderizada (LaTeX via KaTeX)
- **Definições e propriedades** — caixas visuais organizadas por tipo
- **Exemplos resolvidos** — passo a passo comentado
- **Laboratório de fórmulas** — caixa universal onde o aluno digita qualquer expressão e vê o gráfico atualizar em tempo real
- **Zoom ajustável** — botões +/− para aumentar ou diminuir tudo (desktop)
- **Tema claro/escuro** — alternável no topo

O laboratório aceita expressões matemáticas reais:
```
y = 2^x          y = sin(x)         y = 3 + (x-1)·5
y = x^(3/2)      y = cos(2·x)       y = 1800·(1.03)^x
```

### 🖥️ Área do Professor
Quadro de gráficos ao vivo para uso em sala de aula. Contém:

- **Gráfico interativo** — zoom, pan (arrastar), múltiplas fórmulas com cores distintas
- **Círculo unitário** — sobreposto ao gráfico, com sin θ, cos θ, tan θ ao vivo, snap nos ângulos notáveis (π/6, π/4, π/3…) e suporte a mais de uma volta (> 360°)
- **Exemplos prontos** — presets organizados por tema (Exponencial, Sequências, Trigonometria, Álgebra)
- **Leitura de valores exatos** — ao passar o mouse mostra `x = π/3` em vez de `x = 1.047`, `y = √3/2` em vez de `y = 0.866`
- **Eixo em π** — alterna o eixo X para múltiplos de π
- **Ferramentas de anotação** — marcador, linha vertical/horizontal, área, triângulo, seta, régua e texto, com cor por ferramenta
- **Camadas** — lista de anotações com ocultar/remover, undo/redo (Ctrl+Z / Ctrl+Shift+Z) e clique duplo para apagar
- **Download do PNG** — exporta o gráfico em alta resolução (botão ou atalho D)
- **Tema claro/escuro**

---

## Conteúdo

| Cap. | Tema | Aulas |
|------|------|-------|
| 1 | **Potenciação** | Propriedades, expoente inteiro, racional, irracional, notação científica, comparação |
| 1§2 | **Função Exponencial** | Conceito, gráfico, crescimento vs decrescimento, aplicações, equações |
| 2 | **Sequências Numéricas** | Progressão Aritmética, Progressão Geométrica, PA vs PG |
| 5 | **Trigonometria** | Arcos, círculo unitário, ângulos notáveis, seno, cosseno, tangente |

---

## Tecnologia

Tudo é **estático** — sem build, sem bundler, sem backend:

| Parte | Tecnologia |
|-------|-----------|
| Linguagem | HTML + CSS + JavaScript (ES Modules) |
| Renderização matemática | KaTeX 0.16.9 (self-hosted em `vendor/katex/`, offline) |
| Gráficos | Canvas 2D próprio (`core/plotEngine.js`) |
| Parser matemático | Parser/avaliador próprio (`core/mathEngine.js`) |
| Fontes | Bricolage Grotesque + JetBrains Mono (Google Fonts) |
| Offline/PWA | Service worker (`sw.js`) com precache + `manifest.webmanifest` |
| Modo Aula | TV/projetor: tela cheia, alto contraste, atalhos `F`/`Esc`/`Espaço` |
| Hospedagem | Qualquer servidor estático (GitHub Pages, Render, Netlify…) |
| Testes | Playwright (smoke test do comportamento das 3 páginas) |

---

## Estrutura de arquivos

```
index.html                  Landing page (monta core/home.js)
aluno.html                  Área do aluno (monta core/aluno.js)
professor.html              Área do professor (monta core/professor/board.js)
sw.js                       Service worker (precache + cache offline)
manifest.webmanifest        Manifest PWA (instalação/offline)

core/
  home.js                   Tema da landing
  aluno.js                  App do aluno (sidebar, aulas, laboratório, navegação)
  theme.js                  Tema claro/escuro
  mathEngine.js             Parser + avaliador de expressões matemáticas
  plotEngine.js             Engine de canvas (gráficos, zoom, pan)
  overlays.js               Camadas de anotação (undo/redo, tipos de anotação)
  overlayRenderers.js       Render das anotações no canvas
  trigVisuals.js            Componentes visuais de trigonometria
  trigData.js               Dados/diagramas de trigonometria
  professor/                Quadro do professor, dividido em módulos:
    board.js                  orquestração (importa os módulos + boot)
    plot.js                   canvas, Plot e gerenciador de overlays
    scale.js                  escala da sidebar vs escala do gráfico
    unitCircle.js             círculo unitário (ângulo, play, rastro)
    tools.js                  ferramentas de anotação
    formulas.js               fórmulas, paleta, view/zoom, toggles π/círculo
    panel.js                  download, presets, tabs, bottom sheet, atalhos
    presets.js                dados de cores e presets
    modoAula.js               Modo Aula (TV/projetor): toggle, fullscreen, atalhos

components/
  formulaLab.js             Laboratório de fórmulas interativo
  keypad.js                 Barra flutuante de símbolos (π, √, sin…)
  katex.js                  Renderização LaTeX

features/
  potenciacao/index.js      Aulas do Capítulo 1
  exponencial/index.js      Aulas de Função Exponencial
  sequencias/index.js       Aulas de Sequências
  trigonometria/index.js    Aulas de Trigonometria

utils/
  content.js                Helpers HTML pedagógicos (def, think, solved…)

styles/
  tokens.css                Variáveis de design (cores, espaçamentos, fontes)
  base.css                  Reset, topbar, botões, caixas pedagógicas
  aluno.css                 Layout da área do aluno
  professor.css             Layout do quadro do professor
  modo-aula.css             Modo Aula (TV/projetor)
  explorer.css              Laboratório e barra de símbolos
  boxes.css                 Caixas pedagógicas (definição, resolução…)
  trigVisuals.css           Estilos dos visuais de trigonometria

test/
  smoke.mjs                 Smoke test Playwright (3 páginas)

docs/                       Documentos de specs ([ARQUIVADO]_ = encerrados)

vendor/
  katex/                    KaTeX 0.16.9 self-hosted (JS, CSS, fonts)

assets/
  logo.svg                  Logo da plataforma
  icons/                    Ícones PNG 192/512 (PWA)
```

---

## Expandir o conteúdo

A arquitetura é modular. Para adicionar um novo capítulo:

1. Crie `features/logaritmos/index.js` no mesmo formato dos outros
2. Importe e registre em `core/aluno.js`

Cada aula é um objeto `{ id, title, render(container) }`. O `render` escreve HTML diretamente no container, podendo usar os helpers de `utils/content.js`.

---

## Como rodar localmente

> ES Modules exigem servidor HTTP — não abra `index.html` direto pelo explorador de arquivos.

```bash
# Python (sem instalar nada)
python3 -m http.server 8000

# Node.js
npx serve .

# VS Code
# Instale a extensão "Live Server" e clique em "Go Live"
```

Depois abra **http://localhost:8000** no navegador.

### Testes

> Os testes são opcionais para rodar o site, mas exigem Node.js.

```bash
npm install        # baixa o Playwright (uma vez)
npm test           # smoke test: 31 checagens nas 3 páginas
npm run test:full  # smoke + laboratório de fórmulas
npm run check      # checagem de sintaxe de todos os módulos
```

---

## Publicar no GitHub Pages

```bash
git add .
git commit -m "Atualização"
git push
```

Depois: **Settings → Pages → Source: `main` / root** → salvar.

O site fica disponível em `https://SEU-USUARIO.github.io/NOME-DO-REPO/` em cerca de 1 minuto.

---

*Desenvolvido por **Asafe Tork** com Claude (Anthropic) · IFPA Campus Bragança · 2025*
