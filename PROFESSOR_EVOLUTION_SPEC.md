# AGENT 7 — ÁREA DO PROFESSOR EVOLUÍDA
## Especificação de Evolução · Central de Demonstração Matemática

**Status:** Especificação completa  
**Arquivo alvo:** `professor.html` (evolução do existente, ~931 linhas → ~2500 linhas)  
**Dependências:** `core/plotEngine.js`, `core/mathEngine.js`, `core/trigVisuals.js`

---

## 1. VISÃO GERAL DA EVOLUÇÃO

### O que é hoje
Professor.html é um plotter multi-curva com círculo unitário integrado e ferramentas pedagógicas básicas. Todo o código está em um script inline de ~750 linhas.

### O que será
Uma **central de demonstração matemática** com 14 módulos funcionais, reutilizando os 5 componentes de `trigVisuals.js` e adicionando capacidades de apresentação, anotação e comparação.

### Princípio de Design
**"O professor é o performer, a tela é o palco."** Cada controle deve ser acessível com uma ação (clique ou atalho). A interface se adapta ao contexto — quando o professor precisa de espaço, os controles recolhem.

---

## 2. LAYOUT GERAL

### 2.1 Layout Desktop (≥1024px)
```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: Logo · Links · [⛶ Tela cheia] · [保存 Salvar] · [?]      │
├──────────────────────────────────┬──────────────────────────────────┤
│                                  │  PAINEL LATERAL (320px)         │
│  ÁREA PRINCIPAL                  │                                  │
│  ┌──────────────────────────┐   │  ┌─ Seção: Seletor de Função ─┐ │
│  │                          │   │  │ [sin] [cos] [tan] [gen]   │ │
│  │  Canvas do Plot          │   │  │  A ──●──── 1.0            │ │
│  │  (Plot engine)           │   │  │  B ──●──── 1.0            │ │
│  │                          │   │  │  C ──●──── 0.00           │ │
│  │  + Círculo unitário      │   │  │  D ──●──── 0.00           │ │
│  │  + Overlays              │   │  │  Período: 6.28            │ │
│  │  + Anotações             │   │  │  Imagem: [-1, 1]          │ │
│  │                          │   │  └───────────────────────────┘ │
│  │  [split view toggle]     │   │                                  │
│  └──────────────────────────┘   │  ┌─ Seção: Animação ─────────┐ │
│                                  │  │ ▶ ⏸ ◀ ▶▶  Vel: ──●── 1×  │ │
│  ┌──────────────────────────┐   │  │ Passo: [-1] [0] [+1]     │ │
│  │  Canvas Secundário       │   │  └───────────────────────────┘ │
│  │  (Círculo / Compara /   │   │                                  │
│  │   Split screen)         │   │  ┌─ Seção: Fórmulas ─────────┐ │
│  └──────────────────────────┘   │  │ f₁: y=sin(x)         [×]  │ │
│                                  │  │ f₂: y=cos(x)         [×]  │ │
│  ┌──────────────────────────┐   │  │ + adicionar linha          │ │
│  │  Readout / Info Bar      │   │  └───────────────────────────┘ │
│  └──────────────────────────┘   │                                  │
├──────────────────────────────────┤  ┌─ Seção: Ferramentas ──────┐ │
│  BAR INFERIOR: Anotações,       │  │ 📍 □ | ▓ △ ✏ 📏 📐       │ │
│  atalhos, modo apresentação     │  │ Cores: ● ● ● ● ●          │ │
└──────────────────────────────────┴──────────────────────────────────┘
```

### 2.2 Layout Tablet (768–1023px)
- Painel lateral vira drawer (hamburger menu)
- Área principal ocupa 100% da largura
- Controles de animação ficam como barra flutuante

### 2.3 Layout Mobile (<768px)
- Empilhado: canvas → painel → barra
- Modo apresentação força landscape
- Gestos touch para pan/zoom

---

## 3. MÓDULOS FUNCIONAIS

### MÓDULO 1 — SELETOR DE FUNÇÃO

**Localização:** Topo do painel lateral (seção sempre visível)

**O que faz:** O professor seleciona o tipo de função e ajusta parâmetros em tempo real.

**UI:**
```
┌─ Tipo de Função ─────────────┐
│ [sin] [cos] [tan] [genérico] │
├─ Parâmetros ─────────────────┤
│ A ──●─────── 1.0   (amplitude)│
│ B ──●─────── 1.0   (freq.)    │
│ C ──●─────── 0.00  (fase)     │
│ D ──●─────── 0.00  (desloc.)  │
├─ Info Calculada ─────────────┤
│ Período: 2π/B = 6.28         │
│ Imagem: [D-A, D+A] = [-1, 1] │
│ Freq.: 1/T = 0.16 Hz         │
└──────────────────────────────┘
```

**Comportamento:**
- Botões [sin] [cos] [tan] trocam a função base e atualizam o gráfico imediatamente
- Botão [genérico] abre um input para expressão livre (usa `compile()` do mathEngine)
- Sliders A/B/C/D atualizam a função `y = A·f(Bx + C) + D` em tempo real
- Os parâmetros são preservados ao trocar entre sin/cos/tan
- Para tan: assíntotas são exibidas automaticamente

**Integração:**
- Reusa `mountTrigParamExplorer()` de `trigVisuals.js` mas de forma integrada ao layout do professor
- Alternativa: importar o componente e injetar no painel do professor

**Atalhos de teclado:**
- `1` → sin, `2` → cos, `3` → tan, `4` → genérico
- `A/B/C/D` + setas → ajusta parâmetro selecionado

---

### MÓDULO 2 — CONTROLE DE ANIMAÇÃO

**Localização:** Seção abaixo do Seletor de Função

**O que faz:** Controla a animação do ponto no círculo unitário e no gráfico.

**UI:**
```
┌─ Animação ──────────────────────┐
│ [◀◀] [◀] [▶/⏸] [▶] [▶▶]      │
│ Vel: ────●──────── 1.0×         │
│ [Reset]  [Loop: ☑]              │
└──────────────────────────────────┘
```

**Controles:**
| Botão | Ação | Atalho |
|-------|------|--------|
| ▶/⏸ | Play/Pause toggle | `Space` |
| ◀ | Step backward (−π/12) | `←` |
| ▶ | Step forward (+π/12) | `→` |
| ◀◀ | Jump to start (0) | `Home` |
| ▶▶ | Jump to end (2π) | `End` |
| Reset | Volta ao ângulo inicial | `R` |
| Loop | Liga/desliga loop contínuo | `L` |
| Vel slider | 0.1× a 3× | `+`/`−` |

**Comportamento:**
- A animação move o ponto P no círculo e o marcador no gráfico simultaneamente
- Step forward/backward incrementa θ em π/12 (15°) por clique
- Speed slider controla a velocidade de reprodução
- Quando pausado, o professor pode clicar no gráfico para posicionar o ponto
- O estado da animação é: `{ playing, theta, speed, loop }`

**Integração:**
- Conecta com `mountCircleToGraph()` ou `mountTrigCircle()` do trigVisuals.js
- Se o modo split está ativo, anima ambos os canvases

---

### MÓDULO 3 — DESTAQUE DE PONTOS

**Localização:** Subseção dentro de Ferramentas

**O que faz:** Marca pontos especiais e mostra informações detalhadas.

**Funcionalidades:**
1. **Pontos zeros** — onde f(x) = 0
2. **Máximos locais** — onde f'(x) = 0 e f''(x) < 0
3. **Mínimos locais** — onde f'(x) = 0 e f''(x) > 0
4. **Coordenadas de qualquer ponto** — clique e arrasta
5. **Reta tangente** — reta tangente ao ponto selecionado
6. **Reta normal** — perpendicular à tangente no ponto

**UI:**
```
┌─ Destaques ──────────────────────────┐
│ ☑ Zeros  ☑ Máximos  ☑ Mínimos      │
│ [📍 Tangente] [⊥ Normal]             │
│ [📍 Marcar ponto livre]              │
└──────────────────────────────────────┘
```

**Comportamento:**
- Checkboxes ligam/desligam marcadores automáticos
- Cada marcador mostra: `(x₀, f(x₀))` com label
- Tangente: `y = f'(x₀)(x - x₀) + f(x₀)` — calculada numericamente via diferença central
- Normal: `y = -1/f'(x₀)(x - x₀) + f(x₀)`
- Ponto livre: o professor clica no canvas e um marcador é criado com coordenadas

**Cálculo da derivada:**
```javascript
function numericalDerivative(fn, x, h = 1e-6) {
  return (fn(x + h) - fn(x - h)) / (2 * h);
}
```

**Integração:**
- Reusa `plot.setMarkers()` para marcadores automáticos
- Tangente e normal são desenhadas via `plot.onDraw` callback

---

### MÓDULO 4 — MOSTRAR FÓRMULAS

**Localização:** Seção de Fórmulas no painel

**O que faz:** Exibe a fórmula atual, valores dos parâmetros e valores derivados.

**UI:**
```
┌─ Fórmulas ───────────────────────────┐
│  y = 2·sin(3x + π/4) + 1            │
│  ────────────────────────────────     │
│  A=2  B=3  C=π/4  D=1               │
│  Período: 2π/3  Amplitude: 2         │
│  ────────────────────────────────     │
│  Representações:                      │
│  [y = A·sin(Bx+C)+D]                │
│  [y = 2·sin(3x+0.785)+1]            │
│  [表格 de valores]                    │
└──────────────────────────────────────┘
```

**Funcionalidades:**
1. Mostra a fórmula com parâmetros simbólicos (A, B, C, D)
2. Mostra a fórmula com valores numéricos substituídos
3. Mostra valores derivados: período, frequência, amplitude, imagem, fase
4. Toggle entre representações: simbólica, numérica, tabela
5. KaTeX rendering para fórmulas matemáticas bonitas

**Integração:**
- Usa `compile()` do mathEngine para extrair parâmetros
- KaTeX (já disponível via CDN) renderiza as fórmulas

---

### MÓDULO 5 — ALTERNAR REPRESENTAÇÕES

**Localização:** Controles acima do canvas principal

**O que faz:** Alterna entre diferentes visualizações do mesmo dado.

**Modos disponíveis:**
| Modo | Descrição | Atalho |
|------|-----------|--------|
| Gráfico | Apenas o gráfico (modo atual) | `G` |
| Círculo | Apenas o círculo unitário | `C` |
| Split | Gráfico + Círculo lado a lado | `S` |
| Overlay | Círculo sobreposto ao gráfico | `O` |
| Comparar | Dois gráficos sobrepostos | `K` |

**UI:**
```
[📊 Gráfico] [⊙ Círculo] [⫼ Split] [◎ Overlay] [⚖ Comparar]
```

**Split view:**
```
┌──────────────────┬────────────────────────┐
│  Círculo         │  Gráfico               │
│  Trigonométrico  │  y = sin(x)           │
│                  │  com marcadores        │
│  P = (cos θ,     │  ◄──── θ = 45° ────►  │
│       sin θ)     │                        │
└──────────────────┴────────────────────────┘
```

**Overlay:**
- Círculo unitário semi-transparente desenhado sobre o gráfico
- Conexão visual: ponto P no círculo ↔ ponto (θ, f(θ)) no gráfico
- Linha horizontal tracejada conectando os dois

**Comparar:**
- Dois gráficos sobrepostos (ex: sin vs cos)
- Slider de opacidade para cada curva
- Legend cores distintas

**Integração:**
- Reusa `mountCircleToGraph()` para modo Split
- Reusa `mountTrigCircle()` para modo Círculo
- Reusa `mountTrigParamExplorer()` para modo Comparar

---

### MÓDULO 6 — ADICIONAR ANOTAÇÕES

**Localização:** Seção Ferramentas (expandida)

**O que faz:** Permite ao professor anotar livremente sobre o gráfico.

**Ferramentas:**
| Ferramenta | Ícone | Descrição |
|------------|-------|-----------|
| Texto | `T` | Adiciona label em qualquer posição |
| Livre | `✏` | Desenho livre com o mouse |
| Seta | `→` | Seta de qualquer direção |
| Retângulo | `□` | Destaca uma região retangular |
| Elipse | `○` | Destaca uma região elíptica |

**UI:**
```
┌─ Anotações ─────────────────────┐
│ [T] [✏] [→] [□] [○]           │
│ Tamanho: ──●── 14px             │
│ Cor: ● ● ● ● ● ●              │
│ [🗑 Limpar anotações]          │
│ [↩ Desfazer] [↪ Refazer]       │
└─────────────────────────────────┘
```

**Comportamento:**
- Texto: professor clica → input aparece → digita → Enter confirma
- Livre: mouse down → movimento → mouse up cria caminho
- Seta: clique origem → arrasta → solta destino
- Retângulo: clique canto → arrasta → solta canto oposto
- Elipse: mesma mecânica que retângulo
- Undo/Redo: pilha de ações (max 50)

**Armazenamento:**
```javascript
const annotations = []; // { type, points, text, color, size, timestamp }
const undoStack = [];
const redoStack = [];
```

---

### MÓDULO 7 — DESENHAR (Geometria)

**Localização:** Subseção dentro de Ferramentas

**O que faz:** Construções geométricas precisas.

**Ferramentas:**
| Ferramenta | Ação |
|------------|------|
| Ângulo | Mostra o arco de ângulo entre dois segmentos |
| Distância | Mostra a distância entre dois pontos |
| Paralela | Linha paralela a uma dada |
| Perpendicular | Linha perpendicular a uma dada |
| Bissetriz | Divide um ângulo ao meio |

**UI:**
```
┌─ Geometria ──────────────────────────┐
│ [∠ Ângulo] [📏 Distância]           │
│ [∥ Paralela] [⊥ Perpendicular]      │
│ Mostrar valores: ☑                   │
└──────────────────────────────────────┘
```

**Comportamento:**
- Ângulo: professor seleciona 3 pontos (vértice no meio) → arco + valor em graus/radianos
- Distância: seleciona 2 pontos → segmento + label de distância
- Paralela: seleciona linha existente + ponto → nova linha paralela
- Perpendicular: seleciona linha existente + ponto → nova linha perpendicular

---

### MÓDULO 8 — DESTACAR REGIÕES

**Localização:** Seção Ferramentas (já existente, expandida)

**O que faz:** Sombreamento inteligente de regiões.

**Tipos de região:**
| Tipo | Descrição |
|------|-----------|
| Área sob curva | ∫f(x)dx entre dois pontos |
| Intervalo | Faixa vertical destacada |
| Crescente/Decrescente | Onde f'(x) > 0 ou f'(x) < 0 |
| Positivo/Negativo | Onde f(x) > 0 ou f(x) < 0 |
| Entre curvas | Área entre duas funções |

**UI:**
```
┌─ Regiões ─────────────────────────────┐
│ [▓ Área sob curva]  [█ Intervalo]     │
│ [↑ Crescente]  [↓ Decrescente]        │
│ [⊕ Positivo]   [⊖ Negativo]          │
│ [≅ Entre curvas]                      │
│ Opacidade: ──●── 25%                  │
│ Cor: ● ● ● ● ●                       │
└───────────────────────────────────────┘
```

**Comportamento:**
- Área sob curva: dois cliques no eixo X → preenche entre curva e eixo
- Intervalo: dois cliques → faixa vertical com label
- Crescente/Decrescente: calcula derivada numericamente → colore regiões
- Positivo/Negativo: verifica sinal de f(x) → colore acima/abaixo do eixo
- Entre curvas: seleciona duas fórmulas → preenche entre elas

**Cálculo de área:**
```javascript
function computeArea(fn, x1, x2, steps = 200) {
  const dx = (x2 - x1) / steps;
  let area = 0;
  for (let i = 0; i < steps; i++) {
    area += Math.abs(fn(x1 + i * dx)) * dx;
  }
  return area;
}
```

---

### MÓDULO 9 — PAUSAR E AVANÇAR PASSO A PASSO

**Localização:** Integrado ao Módulo 2 (Controle de Animação)

**O que faz:** Controle preciso frame a frame.

**Detalhamento:**
- Step size configurável: π/12, π/6, π/4, π/3, π/2, π, 2π
- Cada step atualiza: ângulo θ, valores sin/cos/tan, marcador no gráfico
- Modo "snap": cada step vai para o próximo ângulo notável
- Indicador visual: brilho no ponto P indica step em andamento

**UI adicional:**
```
┌─ Passo ───────────────────────────┐
│ Tamanho: [π/12] [π/6] [π/4] [π/2]│
│ [← Passo]  θ = 45.0°  [Passo →]  │
│ Próximo notável: π/3 (60°)        │
└────────────────────────────────────┘
```

**Atalhos:**
- `←` / `→` → step backward/forward
- `Shift+←` / `Shift+→` → step até próximo/anterior notável

---

### MÓDULO 10 — COMPARAR GRÁFICOS

**Localização:** Modo de representação + barra inferior

**O que faz:** Mostra múltiplas funções para comparação.

**Funcionalidades:**
1. Até 6 curvas simultâneas (já suportado pelo plot engine)
2. Toggle de visibilidade por curva (olho 👁)
3. Overlay de funções com cores distintas
4. Modo "fantasma": curva anterior visível como referência
5. Medidor de diferença: mostra |f₁(x) - f₂(x)|

**UI:**
```
┌─ Comparação ───────────────────────────┐
│ ☑ y=sin(x)    ● laranja  [👁] [🗑]   │
│ ☑ y=cos(x)    ● amarelo  [👁] [🗑]   │
│ ☐ y=tan(x)    ● verde    [👁] [🗑]   │
│ + Adicionar curva                      │
│ ────────────────────────────────────── │
│ Mostrar diferença: ☑ |sin(x)-cos(x)|  │
└────────────────────────────────────────┘
```

**Integração:**
- Reusa `plot.setCurves()` que já aceita array de curvas
- Cada curva tem: `{ fn, color, width, label, visible }`

---

### MÓDULO 11 — APRESENTAR FENÔMENOS

**Localização:** Presets expandidos + seção dedicada

**O que faz:** Carrega demonstrações pré-construídas com contexto real.

**Fenômenos disponíveis:**
| ID | Nome | Função | Contexto |
|----|------|--------|----------|
| `sho` | Movimento Harmônico | A·cos(ωt+φ) | Massa-mola |
| `ac` | Corrente AC | A·sin(ωt+φ) | Rede elétrica 127V/60Hz |
| `temp` | Temperatura | 25+A·cos(ωt+φ) | Ciclo diário em Belém |
| `daylight` | Luz do dia | 12+A·cos(ωt+φ) | Ciclo anual no equador |
| `pendulum` | Pêndulo simples | A·cos(ωt) | Relógio de pêndulo |
| `sound` | Onda sonora | A·sin(2πft) | Nota Lá (440Hz) |
| `tide` | Maré | A·cos(ωt+φ) | Ciclo de marés (12h) |
| `seasons` | Estações | cos(2πt/365) | Temperatura anual |

**UI:**
```
┌─ Fenômenos ────────────────────────────┐
│ [弹簧 Mola] [⚡ Corrente] [🌡 Temperatura] │
│ [☀ Luz] [🔔 Som] [🌊 Maré]           │
│ ─────────────────────────────────────── │
│ Movimento Harmônico Simples             │
│ "Uma massa de 2kg presa a uma mola..." │
│ Amplitude ──●── 1.0                    │
│ Frequência ──●── 1.0                   │
│ [▶ Animar]                              │
└─────────────────────────────────────────┘
```

**Integração:**
- Reusa `mountPeriodicVis()` de trigVisuals.js
- Cada fenômeno tem: título, descrição, função, animação canvas, gráfico

---

### MÓDULO 12 — PREPARAR UMA DEMONSTRAÇÃO

**Localização:** Menu hamburger / barra de ferramentas

**O que faz:** Cria sequências de passos para apresentação.

**Funcionalidades:**
1. **Salvar estado atual** — captura: curvas, parâmetros, viewport, annotations
2. **Criar sequência** — ordena estados salvos em passos
3. **Navegar entre passos** — anterior/próximo
4. **Exportar** — salva como JSON (localStorage ou arquivo)
5. **Importar** — carrega demo salva

**UI:**
```
┌─ Demonstração ──────────────────────────┐
│ Passo 1/5: "Função seno base"           │
│ [◀ Anterior] [Próximo ▶] [editar]       │
│ ─────────────────────────────────────── │
│ [💾 Salvar estado] [📋 Nova demo]       │
│ [📥 Importar] [📤 Exportar]             │
└─────────────────────────────────────────┘
```

**Estrutura de um passo:**
```javascript
{
  id: "step-1",
  title: "Função seno base",
  state: {
    curves: [{ expr: "y=sin(x)", color: "#ffa500" }],
    params: { A: 1, B: 1, C: 0, D: 0 },
    funcType: "sin",
    view: { xmin: -2*Math.PI, xmax: 2*Math.PI, ymin: -3, ymax: 3 },
    piAxis: true,
    unitCircle: false,
    theta: Math.PI/4,
    annotations: [],
  },
  notes: "Mostrar a função seno padrão antes de adicionar parâmetros.",
}
```

**Armazenamento:**
- localStorage key: `"prof-demos"`
- Formato: `{ name, steps[], createdAt, updatedAt }`

---

### MÓDULO 13 — LIMPAR A TELA

**Localização:** Barra de ferramentas + atalhos

**O que faz:** Controle granular do que é limpo.

**Ações:**
| Ação | Descrição | Atalho |
|------|-----------|--------|
| Limpar anotações | Remove apenas anotações | `Ctrl+Shift+A` |
| Limpar destaques | Remove markers, áreas, linhas | `Ctrl+Shift+D` |
| Limpar tudo | Remove anotações + destaques | `Ctrl+Shift+C` |
| Resetar vista | Volta ao zoom padrão | `Ctrl+0` |
| Resetar completo | Estado inicial limpo | `Ctrl+Shift+R` |
| Desfazer | Undo última ação | `Ctrl+Z` |
| Refazer | Redo última ação | `Ctrl+Y` |

**UI:**
```
┌─ Limpar ─────────────────────────────┐
│ [🗑 Anotações] [🗑 Destaques]        │
│ [🔄 Resetar vista] [🧹 Tudo]         │
│ [↩ Desfazer] [↪ Refazer]            │
└──────────────────────────────────────┘
```

---

### MÓDULO 14 — MODO APRESENTAÇÃO

**Localização:** Botão no header + atalho

**O que faz:** Tela cheia otimizada para projeção.

**Características:**
1. Tela cheia (Fullscreen API)
2. Controles ficam semi-transparentes (aparecem ao hover)
3. Fontes maiores para legibilidade à distância
4. Contraste alto
5. Animações suaves
6. Barra de ferramentas minimalista

**UI em modo apresentação:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                    CANVAS PRINCIPAL                             │
│                    (100% da tela)                               │
│                                                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ y=sin(x)  θ=45°  sin=0.707  cos=0.707  [▶] [←] [→] [⛶] [×] │
└─────────────────────────────────────────────────────────────────┘
```

**Controles visíveis em apresentação:**
- Barra inferior: fórmula atual, valores, play/pause, step, sair
- Barra superior (hover): seletor de função, ferramentas
- Nada mais — maximalismo visual

**Atalho:** `F11` ou `F` para entrar/sair

---

## 4. ATALHOS DE TECLADO COMPLETOS

| Atalho | Ação |
|--------|------|
| `Space` | Play/Pause animação |
| `←` / `→` | Step backward/forward |
| `Shift+←` / `Shift+→` | Próximo/ anterior notável |
| `Home` / `End` | Início / Fim do ciclo |
| `1` / `2` / `3` / `4` | sin / cos / tan / genérico |
| `A` + setas | Ajustar amplitude |
| `B` + setas | Ajustar frequência |
| `C` + setas | Ajustar fase |
| `D` + setas | Ajustar deslocamento vertical |
| `G` / `C` / `S` / `O` / `K` | Modo de representação |
| `F` / `F11` | Modo apresentação |
| `R` | Reset animação |
| `L` | Toggle loop |
| `T` | Ferramenta texto |
| `P` | Ferramenta ponto |
| `Ctrl+Z` | Desfazer |
| `Ctrl+Y` | Refazer |
| `Ctrl+0` | Resetar vista |
| `Ctrl+S` | Salvar estado |
| `?` | Mostrar atalhos |

---

## 5. INTEGRAÇÃO COM CÓDIGO EXISTENTE

### 5.1 Reutilização de `trigVisuals.js`

| Componente | Como é reutilizado |
|------------|-------------------|
| `mountTrigCircle()` | Modo "Círculo" e "Overlay" |
| `mountCircleToGraph()` | Modo "Split" — já faz sync círculo→gráfico |
| `mountTrigParamExplorer()` | Seletor de Função com sliders |
| `mountTangentVis()` | Disponível como preset de fenômeno |
| `mountPeriodicVis()` | Módulo de Fenômenos (8 tipos) |

### 5.1.1 Opção de Implementação

**Opção A (Recomendada):** Importar componentes e montar no layout do professor
```javascript
import { mountTrigCircle, mountCircleToGraph, mountTrigParamExplorer } from "./core/trigVisuals.js";

// No módulo de representação:
function setMode(mode) {
  switch(mode) {
    case "circle":
      mountTrigCircle(circleContainer, { readoutEl, onChange: syncGraph });
      break;
    case "split":
      mountCircleToGraph(splitContainer, { functions: activeFuncs, showLine: true });
      break;
    case "param":
      mountTrigParamExplorer(paramContainer, { funcType, A, B, C, D });
      break;
  }
}
```

**Opção B:** Extrair a lógica de trigVisuals.js e integrar inline
- Mais controle, mas duplicação de código
- Não recomendada

### 5.2 Reutilização de `plotEngine.js`

| API | Uso no Professor |
|-----|------------------|
| `plot.setCurves(list)` | Atualiza curvas exibidas |
| `plot.setMarkers(list)` | Marcadores de pontos especiais |
| `plot.setView(v)` | Zoom/pan programático |
| `plot.setPiAxis(v)` | Toggle eixo π |
| `plot.X(x)` / `plot.Y(y)` | Conversão de coordenadas |
| `plot.invX(px)` / `plot.invY(py)` | Coordenadas do mouse |
| `plot.onDraw` | Callback para overlays customizados |
| `plot.onProbe` | Readout de coordenadas |

### 5.3 Reutilização de `mathEngine.js`

| API | Uso no Professor |
|-----|------------------|
| `compile(expr)` | Compilar expressões de curva |
| `.fn(x)` | Avaliar função em ponto |
| `.params` | Detectar parâmetros (A, B, C, D) |
| `.ast` | Análise para derivada numérica |

### 5.4 Não Alterar

- API do PlotEngine: assinaturas públicas
- API do MathEngine: formato de retorno
- Evento `themechange`
- Estrutura de lições do aluno

---

## 6. NOVOS ARQUIVOS

### 6.1 `styles/professor-evolution.css`
Estilos dedicados para os novos módulos (~500 linhas):
- `.prof-mode-btn` — botões de modo de representação
- `.prof-anim-bar` — barra de controles de animação
- `.prof-param-*` — estilos de sliders
- `.prof-formula-display` — renderização de fórmulas
- `.prof-annotation-*` — estilos de anotações
- `.prof-presentation` — estilos do modo apresentação
- `.prof-step-*` — estilos de passo a passo

### 6.2 Não criar novos arquivos JS
Toda a lógica permanece inline em `professor.html` (padrão do projeto) ou importa de `trigVisuals.js`.

---

## 7. IMPLEMENTAÇÃO POR FASES

### Fase 1: Fundação (prioridade ALTA)
- [ ] Seletor de Função com sliders (Módulo 1)
- [ ] Fórmulas com display KaTeX (Módulo 4)
- [ ] Alternar representações — modos básico (Módulo 5)
- [ ] Integração com trigVisuals.js

### Fase 2: Animação (prioridade ALTA)
- [ ] Controle de animação completo (Módulo 2)
- [ ] Passo a passo com step configurável (Módulo 9)
- [ ] Sincronização círculo↔gráfico

### Fase 3: Destaques (prioridade MÉDIA)
- [ ] Pontos zeros/máx/mín automáticos (Módulo 3)
- [ ] Tangente e normal (Módulo 3)
- [ ] Regiões inteligentes (Módulo 8)

### Fase 4: Anotações (prioridade MÉDIA)
- [ ] Texto e desenho livre (Módulo 6)
- [ ] Geometria básica (Módulo 7)
- [ ] Undo/Redo

### Fase 5: Apresentação (prioridade BAIXA)
- [ ] Modo tela cheia (Módulo 14)
- [ ] Salvar/Carregar demonstrações (Módulo 12)
- [ ] Fenômenos pré-construídos (Módulo 11)

### Fase 6: Comparação (prioridade BAIXA)
- [ ] Comparar múltiplos gráficos (Módulo 10)
- [ ] Medidor de diferença
- [ ] Modo fantasma

---

## 8. ESTADO GLOBAL DO PROFESSOR

```javascript
const profState = {
  // Função
  funcType: "sin",           // "sin" | "cos" | "tan" | "generic"
  params: { A: 1, B: 1, C: 0, D: 0 },
  customExpr: "",            // para modo genérico

  // Curvas
  curves: [
    { expr: "y=sin(x)", color: "#ffa500", visible: true, width: 2.6 },
  ],

  // Representação
  viewMode: "graph",         // "graph" | "circle" | "split" | "overlay" | "compare"

  // Animação
  anim: {
    playing: false,
    theta: 0,
    speed: 1,
    loop: true,
    stepSize: Math.PI / 12,
  },

  // Viewport
  view: { xmin: -2*Math.PI, xmax: 2*Math.PI, ymin: -3, ymax: 3 },
  piAxis: true,

  // Ferramentas
  activeTool: null,           // "marker" | "vline" | "area" | "triangle" | "text" | "freehand" | "angle" | "distance"
  toolColor: "#ffa500",
  toolOpacity: 0.25,

  // Destaques
  showZeros: true,
  showMaxima: true,
  showMinima: false,
  showTangent: false,
  showNormal: false,

  // Anotações
  annotations: [],

  // Demonstração
  demos: [],                  // sequências salvas
  currentDemo: null,
  currentStep: 0,

  // UI
  presentationMode: false,
  panelOpen: true,
};
```

---

## 9. FLUXOS DE INTERAÇÃO

### Fluxo 1: Professor quer mostrar sin(x) com parâmetros
1. Clica [sin] no seletor → gráfico atualiza para sin(x)
2. Arrasta slider A → gráfico mostra 2·sin(x)
3. Arrasta slider B → gráfico mostra 2·sin(3x)
4. Clica checkbox "Zeros" → marcadores aparecem
5. Clica ▶ → animação começa, ponto P se move

### Fluxo 2: Professor quer comparar sin e cos
1. Clica [⚖ Comparar] → modo comparação ativa
2. Adiciona curva y=cos(x)
3. Sin aparece em amarelo, cos em laranja
4. Ajusta opacidade de cada curva
5. Mostra overlay para ver relação visual

### Fluxo 3: Professor quer preparar aula
1. Cria Demo "Aula de Trigonometria"
2. Passo 1: sin(x) básico → salva
3. Passo 2: sin(2x) → salva
4. Passo 3: sin(x) + cos(x) → salva
5. Passo 4: círculo unitário → salva
6. Na hora da aula: navega entre passos com ◀▶

### Fluxo 4: Professor quer modo apresentação
1. Clica [⛶] ou pressiona F
2. Tela fica fullscreen
3. Controles ficam semi-transparentes
4. Ao passar mouse: controles aparecem
5. Navega com setas do teclado
6. ESC ou F sai do modo

---

## 10. CHECKLIST DE IMPLEMENTAÇÃO

### Arquivos a Criar
- [ ] `styles/professor-evolution.css` — Estilos dos novos módulos

### Arquivos a Modificar
- [ ] `professor.html` — Evolução principal (~2500 linhas)

### Funcionalidades por Prioridade
- [ ] Seletor de Função com sliders (Módulo 1)
- [ ] Controle de Animação completo (Módulo 2)
- [ ] Destaques de Pontos (Módulo 3)
- [ ] Display de Fórmulas (Módulo 4)
- [ ] Alternar Representações (Módulo 5)
- [ ] Anotações (Módulo 6)
- [ ] Geometria (Módulo 7)
- [ ] Regiões (Módulo 8)
- [ ] Passo a Passo (Módulo 9)
- [ ] Comparar Gráficos (Módulo 10)
- [ ] Fenômenos (Módulo 11)
- [ ] Salvar/Carregar Demo (Módulo 12)
- [ ] Limpar Tela (Módulo 13)
- [ ] Modo Apresentação (Módulo 14)

### Testes Manuais
- [ ] Seletor de função troca entre sin/cos/tan em tempo real
- [ ] Sliders A/B/C/D atualizam gráfico imediatamente
- [ ] Animação play/pause funciona
- [ ] Step forward/backward funciona
- [ ] Marcadores de zeros/máx/mín aparecem
- [ ] Tangente é calculada corretamente
- [ ] Split view mostra círculo + gráfico sincronizados
- [ ] Anotações de texto funcionam
- [ ] Undo/Redo funciona
- [ ] Modo apresentação entra/sai de fullscreen
- [ ] Salvar/Carregar demo preserva estado
- [ ] Todos os atalhos de teclado funcionam
- [ ] Tema dark/light funciona
- [ ] Layout responsivo funciona
