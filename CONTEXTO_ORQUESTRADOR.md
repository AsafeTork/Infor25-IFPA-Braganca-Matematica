# CONTEXTO OPERACIONAL PARA O ORQUESTRADOR

## 1. VISÃO GERAL

**Projeto:** Site estático educacional de Matemática para o IFPA Campus Branca (Informática 25).
**Tipo:** Site estático HTML/CSS/JS puro, sem build tools, sem backend, sem package.json.
**Páginas:** 3 pontos de entrada independentes.
**Conteúdo:** 22 lições em 4 capítulos (Potenciação, Função Exponencial, Sequências Numéricas, Trigonometria).
**Dependências externas:** KaTeX 0.16.9 (CDN), Google Fonts (Bricolage Grotesque, Spectral, JetBrains Mono).

---

## 2. MAPA DO SISTEMA

```
index.html (Landing)
  ├── "Aluno" → aluno.html
  └── "Professor" → professor.html

aluno.html (Estudante)
  ├── Sidebar colapsável com capítulos/lições
  ├── Renderização de lições via KaTeX
  ├── Fórmulas interativas (Formula Lab)
  ├── Quizzes (múltipla escolha)
  ├── Navegação por hash (#lesson-id)
  └── Zoom desktop (80%-200%, salvo em localStorage)

professor.html (Professor)
  ├── Plotador de gráficos multi-curva
  ├── Círculo unitário interativo (arrastável)
  ├── Ferramentas pedagógicas (marcador, linha vertical, sombreamento, triângulo)
  ├── Presets organizados por capítulo
  └── Paleta de cores para curvas (20 cores)
```

---

## 3. MAPA DE COMPONENTES

### Camada Core (`core/`)
| Componente | Arquivo | Consumidores | Risco |
|---|---|---|---|
| Theme | `core/theme.js` | Todas as 3 páginas | BAIXO |
| Math Engine | `core/mathEngine.js` | professor.html, formulaLab.js | **ALTO** |
| Plot Engine | `core/plotEngine.js` | professor.html, formulaLab.js, exponencial, sequencias | **ALTO** |

### Camada Componentes (`components/`)
| Componente | Arquivo | Consumidores | Risco |
|---|---|---|---|
| Keypad | `components/keypad.js` | aluno.html, professor.html | MÉDIO |
| KaTeX Wrapper | `components/katex.js` | Todos os feature modules | **ALTO** |
| Formula Lab | `components/formulaLab.js` | ~10 instâncias em 4 features | MÉDIO |
| Quiz | `components/quiz.js` | Todos os feature modules | BAIXO |
| Unit Circle | `components/unitCircle.js` | **NENHUM** (código morto) | N/A |

### Camada Features (`features/`)
| Módulo | Arquivo | Lições |
|---|---|---|
| Potenciação | `features/potenciacao/index.js` | 6 lições |
| Função Exponencial | `features/exponencial/index.js` | 6 lições |
| Sequências Numéricas | `features/sequencias/index.js` | 3 lições |
| Trigonometria | `features/trigonometria/index.js` | 7 lições |

### Camada Utils (`utils/`)
| Componente | Arquivo | Consumidores |
|---|---|---|
| Content Helpers | `utils/content.js` | Todos os feature modules |

### Camada Estilos (`styles/`)
| Arquivo | Uso | Status |
|---|---|---|
| `tokens.css` | Design tokens (cores, fontes, espaçamento) | ATIVO |
| `base.css` | Estilos globais (topbar, botões, cards) | ATIVO |
| `aluno.css` | Estilos da página do aluno | ATIVO |
| `board.css` | Estilos da página do professor | ATIVO |
| `boxes.css` | Caixas pedagógicas (def, think, explore, solved, apply) | ATIVO |
| `explorer.css` | Formula Lab e Quiz | ATIVO |
| `landing.css` | Página de landing | **MORTO** (não linkado) |
| `content.css` | Layout alternativo | **MORTO** (não linkado) |

### Código Morto Identificado
| Arquivo | Linhas | Status |
|---|---|---|
| `plotEngine.js` (raiz) | 216 | **MORTO** - nunca importado |
| `components/unitCircle.js` | 287 | **MORTO** - nunca importado |
| `styles/landing.css` | 75 | **MORTO** - nunca linkado |
| `styles/content.css` | 82 | **MORTO** - nunca linkado |

---

## 4. FLUXOS

### Fluxo de Navegação do Aluno
```
Carregamento → Lê hash URL → go(id) → Renderiza lição
  ├── Sidebar: clica capítulo → abre/fecha
  ├── Sidebar: clica lição → go(id) → Renderiza
  ├── Botão "Próximo" → go(nextId)
  ├── Botão "Anterior" → go(prevId)
  └── Mobile: hamburger → abre sidebar → clica lição → fecha sidebar
```

### Fluxo do Formula Lab
```
Lição renderiza → mountLab(root, cfg)
  ├── Usuário digita expressão → compile() → plot.setCurves() → draw()
  ├── Clica chip de exemplo → set input → update()
  ├── Arrasta canvas → pan (muda viewport)
  ├── Scroll canvas → zoom (muda viewport)
  └── Desafio: "Verificar" → eval da função → feedback
```

### Fluxo do Professor
```
Carregamento → new Plot() → Fórmulas padrão (2^x, (1/2)^x)
  ├── "+ linha" → addFormula() → input vazio
  ├── Digita expressão → compile() → plot.setCurves()
  ├── Clica dot → abre paleta de cores
  ├── Clica preset → clearFormulas() → loadPreset()
  ├── "pi eixo" → setPiAxis(true/false)
  ├── "círculo" → toggle unit circle
  ├── "reset" → setView(default)
  └── Ferramentas: marcador/linha/área/triângulo → click no canvas
```

### Fluxo do Círculo Unitário
```
Ativado → ucDraw() renderiza círculo
  ├── Arrasta ponto P → atualiza theta → snap ângulos notáveis
  ├── Clica botão ângulo notável → setTheta()
  ├── Input customizado → parseAngle() → setTheta()
  ├── Botão +/- → nega theta → muda aba pos/neg
  └── Multi-volta: cores diferentes por volta, contador exibido
```

---

## 5. PONTOS DE ALTERAÇÃO

### Alteração Visual Global
- **Onde:** `styles/tokens.css` (cores, fontes, espaçamento)
- **Efeito:** Cascata para todas as páginas e componentes
- **Cuidado:** Cores hardcoded em JS canvas (`#ffa500`, `#ffd23f`, `#4ade80`, etc.) precisam ser atualizadas manualmente

### Alteração de uma Lição Específica
- **Onde:** `features/[capitulo]/index.js` → função `render()` da lição
- **Efeito:** isolado àquela lição
- **Seguro:** Baixo risco

### Alteração no Plot Engine
- **Onde:** `core/plotEngine.js`
- **Efeito:** Quebra todas as fórmulas interativas e o professor
- **Cuidado:** **ALTO** - API pública (`setCurves`, `draw`, `X`, `Y`, `invX`, `invY`, `setView`, `setPiAxis`, `onProbe`, `onDraw`)

### Alteração no Math Engine
- **Onde:** `core/mathEngine.js`
- **Efeito:** Quebra todas as expressões matemáticas
- **Cuidado:** **ALTO** - Tokenizer, parser, `CONSTS`, `FUNCS`

### Alteração na Navegação do Aluno
- **Onde:** `aluno.html` (script inline ~190 linhas)
- **Efeito:** Navegação, sidebar, hash routing
- **Cuidado:** **ALTO** - Código inline sem modularização

### Alteração no Professor
- **Onde:** `professor.html` (script inline ~750 linhas)
- **Efeito:** Círculo unitário, ferramentas, fórmulas, presets
- **Cuidado:** **ALTO** - Maior massa de código do projeto

### Adição de Novo Capítulo
- **Onde:** Criar `features/[novo]/index.js` + importar em `aluno.html`
- **Efeito:** Adiciona ao array `MODULES` e à sidebar
- **Seguro:** Padrão bem definido

### Alteração de Cores Hardcoded em CSS
- **Onde:** `boxes.css`, `explorer.css`, `base.css`, `board.css`
- **Efeito:** Localizado àquele componente
- **Cuidado:** MÉDIO - Cores não estão em tokens

---

## 6. DEPENDÊNCIAS

### Grafo de Dependências Críticas
```
mathEngine.js ← formulaLab.js ← features/*/index.js ← aluno.html
plotEngine.js ← formulaLab.js ← features/*/index.js ← aluno.html
plotEngine.js ← professor.html (inline)
katex.js ← content.js, quiz.js, formulaLab.js, features/*/index.js
theme.js ← todas as 3 páginas
keypad.js ← aluno.html, professor.html
```

### Eventos Customizados
- `themechange` (window): Disparado por `theme.js`, ouvido por plotEngine, formulaLab, exponencial, sequencias

### Dados Compartilhados via localStorage
- `"inf25-theme"`: Tema (dark/light)
- `"zoom-level"`: Nível de zoom (aluno.html)

---

## 7. RISCOS

| Área | Risco | Efeito Colateral |
|---|---|---|
| `core/plotEngine.js` | **ALTO** | Quebra gráficos em todas as lições com labs e no professor |
| `core/mathEngine.js` | **ALTO** | Quebra parsing de expressões em todos os inputs |
| `components/katex.js` | **ALTO** | Quebra renderização LaTeX em todas as lições |
| `professor.html` (inline) | **ALTO** | Qualquer mudança afeta círculo, ferramentas, presets |
| `aluno.html` (inline) | **ALTO** | Qualquer mudança afeta navegação e sidebar |
| `styles/tokens.css` | **MÉDIO** | Mudanças visuais em cascata |
| `components/formulaLab.js` | **MÉDIO** | Afeta ~10 instâncias de labs |
| `components/keypad.js` | **BAIXO** | Componente global mas isolado |
| `styles/boxes.css` | **BAIXO** | Afeta apenas caixas pedagógicas |
| Features individuais | **BAIXO** | Isolado à lição específica |

---

## 8. REGRAS DE PRESERVAÇÃO

1. **API do Plot Engine:** `setCurves()`, `draw()`, `X()`, `Y()`, `invX()`, `invY()`, `setView()`, `setPiAxis()`, `onProbe`, `onDraw` — não alterar assinaturas
2. **API do Math Engine:** `compile(expr)` → `{ fn, rhs, params, ast, error }` — não alterar formato de retorno
3. **Evento `themechange`:** Não renomear nem alterar payload
4. **Estrutura de lições:** Cada lição deve exportar `{ id, title, render(container) }`
5. **Formato de quiz:** `{ stem, options, answer, explain, source }` ou `{ q, opts, ans, expl, source }`
6. **Config do Formula Lab:** `mountLab(root, cfg)` com propriedades `base`, `vars`, `start`, `view`, `examples`, `desafios`
7. **Hash routing:** Formato `#lesson-id` deve ser preservado para deep linking
8. **CSS tokens:** Propriedades CSS em `:root` e `[data-theme]` são a fonte única de verdade para visual
9. **Module pattern:** Features exportam arrays de lições, não efeitos colaterais
10. **Singleton guard:** `mountFloatingKeypad()` verifica `if (document.getElementById("sym-float")) return`

---

## 9. LACUNAS

1. **Capítulos 3 e 4 ausentes:** Numeração pula de 2 para 5 — intencional ou gap?
2. **Touch/mobile:** Plot engine usa `mousedown`/`wheel` — pan/zoom pode não funcionar em touch
3. **Performance:** Número máximo de Plot instances simultâneas não testado
4. **Acessibilidade:** Sem ARIA labels em elementos interativos de canvas
5. **Segurança:** `parseAngle()` usa `Function()` (eval) — risco baixo mas presente
6. **Testes:** Nenhum teste automatizado existe
7. **Compatibilidade:** Usa `color-mix()`, `100dvh`, `backdrop-filter` — browsers antigos podem não suportar
8. **Deployment:** Sem pipeline de CI/CD configurado

---

## 10. RECOMENDAÇÕES PARA FUTURAS INTERVENÇÕES

### Para Alterações Visuais
1. Comece por `styles/tokens.css` para mudanças globais
2. Verifique cores hardcoded em JS canvas após mudar tokens
3. Teste em ambos os temas (dark/light)

### Para Alterações Funcionais
1. Identifique se afeta core (plotEngine, mathEngine) ou apenas features
2. Core: teste em todas as páginas que o consomem
3. Features: teste a lição específica e navegação

### Para Adição de Conteúdo
1. Crie novo arquivo em `features/[capitulo]/index.js`
2. Siga o padrão de exportação: `{ id, title, render(container) }`
3. Importe em `aluno.html` e adicione ao array `MODULES`
4. Use `content.js` helpers (`section`, `def`, `think`, `solved`, `apply`, `labSlot`, `quizSlot`)

### Para Limpeza de Código Morto
1. `plotEngine.js` (raiz): seguro para deletar
2. `components/unitCircle.js`: seguro para deletar
3. `styles/landing.css`: seguro para deletar
4. `styles/content.css`: seguro para deletar

### Para Correção de Bugs
1. `tokens.css` linha 82: corrigir `#fbf6 ea` → `#fbf6ea`
2. `base.css` linha 112: remover `}` órfão
3. Verificar se AUDITORIA.md e MUDANCAS.md precisam de atualização

### Regra Geral
**Sempre verifique onde um componente é usado antes de modificá-lo.** Use `grep` para rastrear imports e referências.