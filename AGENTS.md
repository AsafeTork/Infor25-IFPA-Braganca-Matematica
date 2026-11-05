# Guia de contexto do projeto

Use este arquivo como roteador. Não leia o repositório inteiro antes de trabalhar: identifique a superfície afetada, abra o conjunto mínimo abaixo e expanda somente seguindo imports, seletores DOM ou falhas de teste.

## Resumo operacional

- Aplicação web estática, sem build e sem backend; HTML + CSS + JavaScript ES Modules.
- Três páginas: `index.html` (landing), `aluno.html` (aulas) e `professor.html` (quadro interativo).
- Entradas JavaScript: `core/home.js`, `core/aluno.js` e `core/professor/board.js`.
- Estado persistido somente no navegador: tema (`inf25-theme`), zoom do aluno (`zoom-level`) e progresso (`info25:progress`).
- Gráficos usam Canvas 2D próprio; fórmulas usam parser próprio; KaTeX está em `vendor/`.
- `test/smoke.mjs` é a principal descrição executável do comportamento esperado.

## Antes de investigar

1. Leia este arquivo.
2. Rode `git status --short` e preserve alterações do usuário.
3. Classifique o problema pela tabela abaixo.
4. Procure o texto/ID/classe/função citada com `rg -n` antes de abrir arquivos grandes.
5. Leia primeiro os trechos encontrados e imports imediatos. Só depois expanda para engines compartilhadas.

## Roteamento por tipo de problema

| Sintoma ou tarefa | Leia primeiro | Expanda somente se necessário |
|---|---|---|
| Landing, cards ou tema inicial | `index.html`, `core/home.js`, `core/theme.js`, `styles/base.css` | `styles/tokens.css`, `core/sw-register.js` |
| Navegação, sidebar, hash, progresso ou zoom do aluno | `aluno.html`, `core/aluno.js`, `styles/aluno.css` | feature da aula envolvida, `components/keypad.js` |
| Texto, exercício ou conteúdo de uma aula | apenas `features/<tema>/index.js`; localize o `id` da aula | `utils/content.js`, `components/katex.js`, CSS pedagógico |
| Laboratório de fórmulas dentro de uma aula | feature que chama `mountLab`, `components/formulaLab.js` | `core/mathEngine.js`, `core/plotEngine.js`, `components/katex.js`, `styles/explorer.css` |
| Fórmula rejeitada, resultado matemático incorreto ou parsing | `core/mathEngine.js` e o chamador | `components/formulaLab.js` ou `core/professor/formulas.js` |
| Gráfico, eixos, zoom, pan, exportação ou coordenadas | `core/plotEngine.js` e o chamador | `core/mathEngine.js`, CSS do contêiner |
| Visual interativo trigonométrico do aluno | `features/trigonometria/index.js`, buscando o `mount*`, e a função correspondente em `core/trigVisuals.js` | `core/trigData.js`, `styles/trigVisuals.css`, `core/plotEngine.js` |
| Fórmulas do professor, cores, eixo em pi ou vista | `professor.html`, `core/professor/formulas.js` | `core/professor/plot.js`, `presets.js`, `core/mathEngine.js`, `core/plotEngine.js` |
| Círculo unitário, ângulo, play, rastro ou animação do professor | `core/professor/unitCircle.js`, `core/professor/formulas.js` | `core/professor/tools.js`, `plot.js`, `professor.html` |
| Ferramentas de desenho/anotação | `core/professor/tools.js`, `core/overlays.js`, `core/overlayRenderers.js` | `core/professor/panel.js`, `plot.js`, `professor.html` |
| Presets, abas, camadas, download, atalhos ou bottom sheet | `core/professor/panel.js`, `core/professor/presets.js`, `professor.html` | `formulas.js`, `tools.js`, `styles/professor.css` |
| Escala da UI ou do gráfico do professor | `core/professor/scale.js`, IDs relacionados em `professor.html` | `styles/professor.css`, `plotEngine.js` |
| Modo Aula | `core/professor/modoAula.js`, `styles/modo-aula.css`, elementos `btn-aula`/`ma-exit` em `professor.html` | `scale.js`, `panel.js`, `MODO_AULA_SPEC.md` apenas como intenção histórica |
| Layout, responsividade ou aparência | HTML da página + CSS específico da página | `styles/base.css`, depois `styles/tokens.css`; para canvas, procure cores hardcoded no JS |
| Tema claro/escuro | `core/theme.js`, `styles/tokens.css` | ouvintes de `themechange` no componente afetado |
| Offline, instalação ou cache desatualizado | `sw.js`, `core/sw-register.js`, `manifest.webmanifest` | lista de imports/links das três páginas; teste PWA em `test/smoke.mjs` |
| Falha geral ao carregar uma página | HTML da página, seu entry point e trecho correspondente de `test/smoke.mjs` | siga imports na ordem de boot |
| Material da oficina/PDF | `oficina/README.md`, depois o arquivo-fonte indicado ali | `oficina/capturar.mjs`, `oficina/build.sh`; não misture com o app |

## Fluxos e dependências críticas

```text
aluno.html
  -> core/aluno.js
     -> features/*/index.js
        -> utils/content.js / components/formulaLab.js
           -> core/mathEngine.js + core/plotEngine.js
     -> componentes trigonométricos -> core/trigVisuals.js

professor.html
  -> core/professor/board.js
     -> plot.js (singletons Plot e OverlayManager)
     -> formulas.js <-> unitCircle.js <-> tools.js
     -> panel.js -> presets/download/camadas/atalhos
     -> scale.js + modoAula.js
```

O núcleo do professor é carregado por efeitos colaterais e possui imports circulares intencionais. Não isole um módulo sem conferir sua inicialização via `board.js`; os elementos DOM de `professor.html` precisam existir quando os módulos são avaliados.

## Arquivos grandes: onde entrar

- `core/plotEngine.js`: classe `Plot`; resize/vista no início, desenho a partir de `draw`, curvas em `_drawCurve`/`_drawImplicit`, interação em `_bind`, exportações perto do fim.
- `core/trigVisuals.js`: procure diretamente por `mountTrigCircle`, `mountCircleToGraph`, `mountTrigParamExplorer`, `mountTangentVis` ou `mountPeriodicVis`.
- `core/professor/unitCircle.js`: desenho no início, interação/estado no meio, play/rastro depois de `circleActivate`, parser de ângulo no fim.
- `core/overlayRenderers.js`: renderizadores por tipo no início, APIs públicas `renderOverlaysOnPlot`/`renderOverlaysOnTrigCircle`, hit-test depois.
- `features/*/index.js`: procure pelo `id` da aula ou pelo texto visível; não é preciso ler outras features.

## Contratos a preservar

- Cada aula tem `{ id, title, render(container) }`; o hash é `#<id>`.
- `compile(input)` em `core/mathEngine.js` retorna o objeto consumido pelos labs e pelo professor; confira ambos ao mudar o formato.
- A API de `Plot` é compartilhada pelo aluno e professor. Mudanças em coordenadas, view, draw ou eventos são de alto impacto.
- `themechange` é o evento que força canvases/componentes a redesenhar no tema novo.
- `OverlayManager` guarda estado/histórico; `overlayRenderers.js` apenas desenha e faz hit-test.
- Cores e medidas globais vêm de `styles/tokens.css`, mas canvases também têm fallbacks/hardcodes em JS.
- Ao adicionar, remover ou renomear recurso usado offline, atualize `PRECACHE_URLS` e incremente `VERSION` em `sw.js`.
- `vendor/` é dependência de terceiros: não leia nem edite por padrão.

## Fonte de verdade documental

Prioridade: código atual + `test/smoke.mjs` > `README.md` > documentos de especificação.

- Arquivos em `docs/[ARQUIVADO]_*.md` são históricos e contêm fatos já obsoletos; use apenas para entender decisões antigas.
- `MODO_AULA_SPEC.md`, `PROFESSOR_EVOLUTION_SPEC.md`, `PEDAGOGICAL_INTEGRATION_PLAN.md` e `CAP5_CONSOLIDACAO.md` descrevem planos/intenção e podem divergir da implementação.
- `MUDANCAS.md` é registro antigo, não inventário atual.

## Validação mínima

| Mudança | Validação mínima |
|---|---|
| Qualquer JavaScript | `npm run check` |
| Landing/tema | bloco landing de `npm test` + claro/escuro |
| Aluno/conteúdo/lab | `npm test`; use `npm run test:full` se mudou fórmula, parser, lab ou plot |
| Professor/círculo/ferramentas/modo aula | `npm test` e checagem manual da interação alterada |
| Core compartilhado (`mathEngine`, `plotEngine`, tema, overlays) | `npm run check` + `npm run test:full` |
| PWA/service worker | `npm run test:full`; confirme que todo recurso importado está no precache |
| Apenas documentação/oficina | comando específico de `oficina/README.md`, se aplicável |

O teste Playwright sobe seu próprio servidor; para inspeção manual use `npm run serve` e nunca abra os HTMLs via `file://`.

## Contexto que não deve ser carregado por padrão

- `vendor/`, imagens, fontes e PDF.
- Toda a pasta `docs/` e specs longas da raiz.
- Features de matérias não relacionadas ao problema.
- `oficina/` quando o problema é no aplicativo, e vice-versa.
- Todos os CSS de uma vez: comece pelo CSS específico da superfície e só suba para `base.css`/`tokens.css` se a regra for compartilhada.
