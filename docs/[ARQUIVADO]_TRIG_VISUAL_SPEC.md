# AGENT 4 — MOTOR VISUAL DE TRIGONOMETRIA
## Especificação Técnica · Capítulo 5

**Status:** Especificação completa  
**Arquivos criados:**  
- `core/trigVisuals.js` — Motor visual (5 componentes, ~1200 linhas)  
- `styles/trigVisuals.css` — Estilos dedicados (~400 linhas)  

---

## 1. ARQUITETURA GERAL

### Padrão de Módulo
```
features/trigonometria/index.js  →  import { mountX } from "../../core/trigVisuals.js"
                                      ↓
                                   root.innerHTML = `<div id="vis-X"></div>`
                                      ↓
                                   mountX(container, opts)  → controller
```

Cada componente segue o padrão `mount*(root, opts) → controller`:
- **root**: HTMLElement container (já existe no DOM da lição)
- **opts**: objeto de configuração com defaults
- **controller**: objeto com métodos públicos (setTheta, play, pause, destroy, etc.)

### Design Tokens Utilizados
| Token | Uso nos visuais |
|-------|----------------|
| `--accent` (#ffa500) | Cor do cosseno, linha principal, sliders |
| `--accent-2` (#ffd23f) | Cor do seno, arco interno |
| `--text` (#f3f1ea) | Labels, raios, texto principal |
| `--text-mut` (#9aa0b4) | Eixos, grid, labels secundários |
| `--plot-bg` (#0b0c10) | Fundo de todos os canvas |
| `--surface` (#121318) | Cards, readouts |
| `--surface-2` (#181a20) | Botões, controles |
| `--border` | Bordas de controles |
| `--font-mono` | Todos os valores numéricos |
| `--font-display` | Títulos dos componentes |

### HiDPI & Responsividade
- Todo canvas usa `devicePixelRatio` para nitidez em telas Retina
- `ResizeObserver` dispara relayout automático
- Grid CSS com `@media (max-width: 640px)` para mobile (single column)
- Touch: `pointerdown/move/up` com `setPointerCapture` para drag confiável

---

## 2. COMPONENTE 1 — TrigCircle

**Arquivo:** `core/trigVisuals.js` — função `mountTrigCircle()`

### 2.1 O que mostra
- Círculo unitário no plano cartesiano
- Ponto P = (cos θ, sin θ) arrastável
- Arco percorrido (cor accent) + arco indicador de ângulo
- Projeções: linha horizontal (cos θ, laranja) + linha vertical (sin θ, amarela)
- Pontos nos eixos X e Y com labels
- Construção da tangente (linha vertical em x=1, segmento AT verde)
- Triângulo retângulo guia (catetos + ângulo reto)
- Rótulos de quadrantes (I, II, III, IV)
- 16 pontos notáveis com snap automático
- Readout HTML com valores exatos e decimais
- Coordenadas do ponto (tooltip flutuante)
- Background colorido sutil por quadrante

### 2.2 API

```javascript
const circle = mountTrigCircle(container, {
  showTan: true,           // Mostrar construção da tangente
  showProj: true,          // Mostrar projeções sin/cos
  showQuadrants: true,     // Mostrar rótulos I-IV
  showNotable: true,       // Mostrar pontos notáveis
  initialTheta: Math.PI/4, // Ângulo inicial (rad)
  readoutEl: infoDiv,      // Elemento HTML para readout
  size: "auto",            // "auto" ou número (px)
  onChange: (theta, data) => { ... },
});

// Métodos
circle.setTheta(Math.PI/2);
circle.getTheta();           // → number
circle.getData();            // → { sin, cos, tan, quadrant, notable }
circle.on(callback);         // Adiciona listener
circle.off(callback);        // Remove listener
circle.redraw();             // Força redraw completo
circle.destroy();            // Remove listeners, limpa DOM
```

### 2.3 Interação
- **Drag**: pointerdown no ponto P → captura → pointermove atualiza θ → pointerup libera
- **Snap**: quando θ se aproxima de um notável (±0.15 rad), trava no valor exato
- **Limiter de arrasto**: só captura se o toque estiver a ≤48px do ponto P

### 2.4 Performance
- `requestAnimationFrame` com debounce (só agenda se não houver um pendente)
- `_drawing` flag para evitar reentrância
- ResizeObserver dispora relayout apenas quando o container muda de tamanho

### 2.5 Integração com Lições
```javascript
// Na lição trig-circulo (Aula 2)
function render(c) {
  c.innerHTML = `
    <div id="cv1" class="trig-circle-root"></div>
    <div id="info1"></div>
  `;
  mountTrigCircle(c.querySelector("#cv1"), {
    readoutEl: c.querySelector("#info1"),
    onChange: (t, data) => console.log(data.quadrant),
  });
}
```

---

## 3. COMPONENTE 2 — CircleToGraph

**Arquivo:** `core/trigVisuals.js` — função `mountCircleToGraph()`

### 3.1 Layout
```
┌─────────────────┬───────────────────────────┐
│  Círculo        │  Gráfico (Plot engine)    │
│  Trigonométrico │  sin(x) e/ou cos(x)      │
│  (canvas custom)│  com marcadores          │
└─────────────────┴───────────────────────────┘
│  ▶ Play  ◀ Pause   Vel: ──●──── 1.0×   [sin] [cos] │
```

### 3.2 Sincronização
- Ponto P no círculo = ponto (θ, f(θ)) no gráfico
- Linha horizontal tracejada conectando os dois visualmente
- Marcadores no gráfico mostram valores de sin/cos no instante atual
- Readout combinado: `θ = 45.0° — sin = 0.707 — cos = 0.707`

### 3.3 API

```javascript
const ctg = mountCircleToGraph(container, {
  functions: ["sin", "cos"],  // Quais funções mostrar
  speed: 1,                   // Velocidade da animação
  autoPlay: false,            // Iniciar autoplay
  showLine: true,             // Linha horizontal conectando
  onChange: (theta, data) => { ... },
});

ctg.play();
ctg.pause();
ctg.toggle();
ctg.setSpeed(2.0);
ctg.setFunctions(["sin"]);     // Só seno
ctg.setTheta(Math.PI);         // Define ângulo
ctg.destroy();
```

### 3.4 Controles
| Controle | Comportamento |
|----------|---------------|
| Play/Pause | Alterna animação contínua |
| Speed slider | 0.1× a 3× (default 1×) |
| Botão sin | Liga/desliga curva do seno (amarelo) |
| Botão cos | Liga/desliga curva do cosseno (laranja) |

### 3.5 Animação
- `requestAnimationFrame` loop com `dt` delta-time
- theta incrementa `speed * dt` rad/seg
- Auto-loop: quando θ > 2π, continua (não reseta)

---

## 4. COMPONENTE 3 — TrigParamExplorer

**Arquivo:** `core/trigVisuals.js` — função `mountTrigParamExplorer()`

### 4.1 Layout
```
┌──────────────┬──────────────────────────────────┐
│  [sin][cos]  │                                  │
│  [tan]       │  Canvas do Plot                  │
│              │  y = A·sin(Bx + C) + D           │
│  A ──●──── 1.0   com marcadores de             │
│  B ──●──── 1.0   zeros, máximos, mínimos       │
│  C ──●──── 0.00  e indicadores de              │
│  D ──●──── 0.00  período e range               │
│              │                                  │
│  Período: 6.28│                                 │
│  Imagem: [-1,1]│                                │
│              │                                  │
│  ☑ Comparar  │                                  │
│    com cos   │                                  │
└──────────────┴──────────────────────────────────┘
```

### 4.2 Parâmetros Interativos
| Slider | Função | Faixa | Efeito |
|--------|--------|-------|--------|
| A | Amplitude | 0.1 – 5 | Estica verticalmente. Máx = D+A, Mín = D−A |
| B | Frequência | 0.1 – 5 | Comprime horizontalmente. Período = 2π/B |
| C | Fase | −π – π | Desloca horizontalmente |
| D | Desloc. vertical | −3 – 3 | Sobe/desce o eixo central |

### 4.3 Marcadores Automáticos
- **Zeros**: pontos onde f(x) = 0
- **Máximos**: pontos onde f(x) = D + A
- **Mínimos**: pontos onde f(x) = D − A
- Calculados analiticamente (não por varredura numérica)
- Labels exibidos: `máx=2.00`, `mín=-2.00`

### 4.4 API

```javascript
const tpe = mountTrigParamExplorer(container, {
  funcType: "sin",    // "sin" | "cos" | "tan"
  A: 1, B: 1, C: 0, D: 0,
  showMarkers: true,
  showPeriod: true,
  showRange: true,
  compare: false,     // Mostrar cos(x) para comparação
});

tpe.setParams({ A: 2, B: 3 });
tpe.getParams();          // → { A: 2, B: 3, C: 0, D: 0 }
tpe.setFuncType("cos");
tpe.setCompare(true);
tpe.destroy();
```

### 4.5 Toggle de Função
- Botões sin / cos / tan na sidebar
- Troca a função base sem perder os valores de A, B, C, D
- Para tan: automaticamente assíntotas visíveis (o Plot engine já lida com jumps)

---

## 5. COMPONENTE 4 — TangentVis

**Arquivo:** `core/trigVisuals.js` — função `mountTangentVis()`

### 5.1 Layout
```
┌──────────────────┬──────────────────────┐
│  Círculo com     │  Gráfico de tan(x)   │
│  construção da   │  com assíntotas      │
│  tangente        │  e marcador          │
│                  │                      │
│  - Linha x=1     │  θ = 45° → tan = 1  │
│  - Segmento AT   │                      │
│  - Raio estendido│                      │
│  - Ponto tangente│                      │
└──────────────────┴──────────────────────┘
```

### 5.2 Visualização da Tangente
- **Linha vertical x=1** tracejada ( verde claro)
- **Segmento AT**: linha sólida verde de (1,0) até (1, tan θ)
- **Raio estendido**: linha do centro até o ponto na tangente
- **Ponto T**: círculo verde no ponto (1, tan θ)
- **Labels**: "tan θ" + valor numérico ao lado do ponto
- **Linha tracejada**: horizontal de P até a tangente (conexão visual)

### 5.3 Comportamento Assintótico
- Quando θ → π/2, o segmento AT cresce visualmente
- O gráfico mostra as assíntotas verticais em x = π/2 + kπ
- O Plot engine quebra automaticamente a curva em jumps grandes

### 5.4 API

```javascript
const tv = mountTangentVis(container, {
  initialTheta: Math.PI/4,
  showGraph: true,     // Mostrar gráfico de tan ao lado
  onChange: (theta, tanValue) => { ... },
});

tv.setTheta(Math.PI/3);
tv.getTheta();
tv.destroy();
```

---

## 6. COMPONENTE 5 — PeriodicVis

**Arquivo:** `core/trigVisuals.js` — função `mountPeriodicVis()`

### 6.1 Tipos Disponíveis

| Tipo | ID | Fenômeno | Função | Unidade |
|------|----|----------|--------|---------|
| Movimento Harmônico | `sho` | Massa-mola | A·cos(ωt + φ) | metros |
| Corrente AC | `ac` | Rede elétrica | A·sin(ωt + φ) | Volts |
| Temperatura | `temp` | Ciclo diário | 25 + A·cos(ωt + φ) | °C |
| Horas de luz | `daylight` | Ciclo anual | 12 + A·cos(ωt + φ) | horas |

### 6.2 Layout
```
┌──────────────────┬──────────────────────┐
│  Animação do     │  Gráfico da função   │
│  fenômeno        │  (Plot engine)       │
│                  │                      │
│  Mola/bobina/    │  Curva + marcador    │
│  termômetro/     │ 当前位置             │
│  sol             │                      │
│  + valor atual   │  + linha tracejada   │
└──────────────────┴──────────────────────┘
│  Amplitude ──●── 1.0                       │
│  Frequência ──●── 1.0                      │
│  Fase ──●── 0.00                           │
│  [▶ Play]                                   │
```

### 6.3 Animações por Tipo
- **sho**: Mola com coils desenhados + bloco de massa quadrado
- **ac**: Fio com onda sinusaal + ponto animado
- **temp**: Mini-gráfico ao fundo + ponto vermelho
- **daylight**: Mini-gráfico ao fundo + ponto amarelo

### 6.4 API

```javascript
const pv = mountPeriodicVis(container, "sho", {
  amplitude: 1,
  frequency: 1,
  phase: 0,
  onChange: (params) => { ... },
});

pv.setParams({ amplitude: 2, frequency: 1.5 });
pv.getParams();
pv.play();
pv.pause();
pv.destroy();
```

---

## 7. CSS — Estilos dos Visuais

**Arquivo:** `styles/trigVisuals.css`

### 7.1 Convenções
- Prefixos de classe: `ctg-` (CircleToGraph), `tpe-` (TrigParamExplorer), `tv-` (TangentVis), `pv-` (PeriodicVis)
- Todos usam CSS variables de tokens.css
- Grid CSS com breakpoints mobile
- Canvas com `border-radius: var(--radius-sm)`
- Sliders com `accent-color: var(--accent)`

### 7.2 Responsividade
- Desktop: grid 2 colunas
- Mobile (`max-width: 640px`): grid 1 coluna, empilhado
- Canvas: `width: 100%; height: auto` com aspect-ratio

---

## 8. PONTOS DE INTEGRAÇÃO COM LIÇÕES EXISTENTES

### 8.1 Aula 2 — Círculo trigonométrico (trig-circulo)
**Substituir:** os 4 canvas inline (draw1–draw4) por TrigCircle
```javascript
// Atual: 4 canvases separados com draw functions inline
// Novo: mountTrigCircle() em cada container
```

### 8.2 Aula 4 — Função seno (trig-seno)
**Adicionar:** CircleToGraph antes do labSlot
```javascript
// Na lição, antes do lab existente:
<div id="ctg-seno"></div>
mountCircleToGraph(c.querySelector("#ctg-seno"), { functions: ["sin"] });
```

### 8.3 Aula 5 — Função cosseno (trig-cosseno)
**Adicionar:** TrigParamExplorer com modo compare
```javascript
mountTrigParamExplorer(c.querySelector("#lab-cos-explore"), {
  funcType: "cos",
  compare: true,  // Mostra sin para comparação
});
```

### 8.4 Aula 6 — Função tangente (trig-tangente)
**Adicionar:** TangentVis antes do labSlot
```javascript
mountTangentVis(c.querySelector("#tv-tan"), { showGraph: true });
```

### 8.5 Aula 2 ou nova subseção — Fenômenos periódicos
**Adicionar:** 4 instâncias de PeriodicVis
```javascript
mountPeriodicVis(c.querySelector("#pv-sho"), "sho");
mountPeriodicVis(c.querySelector("#pv-ac"), "ac");
mountPeriodicVis(c.querySelector("#pv-temp"), "temp");
mountPeriodicVis(c.querySelector("#pv-day"), "daylight");
```

---

## 9. DEPENDÊNCIAS E RISCOS

### 9.1 Dependências
| Item | Status | Risco |
|------|--------|-------|
| `core/plotEngine.js` | Existe, usado por TrigParamExplorer, CircleToGraph, TangentVis, PeriodicVis | **ALTO** — não alterar API |
| `styles/tokens.css` | Existe, todos os visuais leem de lá | **MÉDIO** — adicionar variáveis se necessário |
| `components/unitCircle.js` | Código morto, NÃO usado | **ZERO** — os visuais substituem |
| Canvas API | Nativa, sem dependência externa | **ZERO** |
| ResizeObserver | API nativa moderna | **BAIXO** — fallback: window.resize |

### 9.2 Riscos Identificados
1. **Performance**: 5 canvas simultâneos podem sobrecarregar dispositivos fracos
   - Mitigation: só animar o canvas visível (IntersectionObserver)
   - Mitigation: limitar a 30fps em dispositivos com `devicePixelRatio > 2`

2. **Touch conflicts**: múltiplos TrigCircle na mesma página podem capturar eventos
   - Mitigation: `pointerdown` só captura se toque ≤48px do ponto P

3. **Plot engine**: TrigParamExplorer chama `setCurves/setMarkers/draw` frequentemente
   - Mitigation: batch de atualizações via `requestAnimationFrame`

4. **Theme change**: Canvas precisa redesenhar no evento `themechange`
   - Mitigation: todos os componentes registram listener em `window`

### 9.3 Não Alterar
- API do PlotEngine: `setCurves()`, `draw()`, `X()`, `Y()`, `setView()`
- API do MathEngine: `compile(expr)`
- Evento `themechange`
- Estrutura de lições: `{ id, title, render(container) }`

---

## 10. CHECKLIST DE IMPLEMENTAÇÃO

### Arquivos a Criar
- [ ] `core/trigVisuals.js` — Motor visual (5 componentes)
- [ ] `styles/trigVisuals.css` — Estilos dedicados

### Arquivos a Modificar
- [ ] `aluno.html` — Adicionar `<link rel="stylesheet" href="styles/trigVisuals.css">`
- [ ] `features/trigonometria/index.js` — Importar e usar mount* nas lições

### Lições a Atualizar
- [ ] trig-circulo (Aula 2) — Substituir 4 canvases por mountTrigCircle
- [ ] trig-seno (Aula 4) — Adicionar CircleToGraph
- [ ] trig-cosseno (Aula 5) — Adicionar TrigParamExplorer com compare
- [ ] trig-tangente (Aula 6) — Adicionar TangentVis
- [ ] (Opcional) Nova subseção — 4x PeriodicVis

### Testes Manuais
- [ ] TrigCircle: drag funciona em desktop e mobile
- [ ] TrigCircle: snap em valores notáveis
- [ ] TrigCircle: readout atualiza em tempo real
- [ ] CircleToGraph: animação play/pause funciona
- [ ] CircleToGraph: speed slider afeta velocidade
- [ ] CircleToGraph: toggle sin/cos funciona
- [ ] TrigParamExplorer: 4 sliders atualizam gráfico
- [ ] TrigParamExplorer: markers de zeros/máx/mín aparecem
- [ ] TrigParamExplorer: modo compare mostra cos
- [ ] TangentVis: segmento AT cresce quando θ → π/2
- [ ] TangentVis: gráfico de tan sincronizado
- [ ] PeriodicVis: 4 tipos de animação funcionam
- [ ] PeriodicVis: play/pause funciona
- [ ] Todos: tema dark/light funciona
- [ ] Todos: mobile layout (single column)
- [ ] Todos: HiDPI (canvas nítido em Retina)
