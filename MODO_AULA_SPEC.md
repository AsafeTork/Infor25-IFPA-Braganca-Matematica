# AGENT 8 — MODO AULA (CLASSROOM MODE)
## Especificação de Design · TV / Projetor

**Status:** Especificação completa  
**Arquivo alvo:** `professor.html` (extensão do Módulo 14 existente) + `styles/modo-aula.css`  
**Dependências:** Módulos 1-14 da evolução do professor  

---

## 1. VISÃO GERAL

### O problema
Em sala de aula:
- Professor está **próximo à tela** (tocando o quadro/trilho)
- Alunos estão a **3-10 metros** de distância
- A tela pode ser TV grande ou projetor
- Resolução e brilho variam
- Professor precisa controlar apresentação rapidamente
- Alunos precisam enxergar claramente

### Princípio de design
**"Clareza > quantidade de informação. Visualização > controles. Conteúdo > interface."**

### O que é hoje
O Módulo 14 (Modo Apresentação) da evolução do professor prevê tela cheia com controles semi-transparentes. É um bom começo, mas não resolve o problema de distância.

### O que será
Um **modo de sala de aula completo** que transforma a interface do professor em uma experiência otimizada para TV/projetor, com:
- Fontes grandes e legíveis a 10 metros
- Controles touch enormes para uso próximo
- Modos de demonstração pré-construídos
- Navegação passo a passo
- Modo de foco para destacar elementos
- Anotações visíveis à distância

---

## 2. LAYOUT MODO AULA

### 2.1 Layout Geral (TV/Projetor)
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     TÍTULO DA DEMONSTRAÇÃO                    │  │
│  │                    "Função Seno — Parâmetros"                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────┬────────────────────────────┐  │
│  │                                  │                            │  │
│  │    GRÁFICO PRINCIPAL             │    CÍRCULO TRIGONOMÉTRICO  │  │
│  │    (65% width)                   │    (35% width)             │  │
│  │                                  │                            │  │
│  │    y = 2·sin(x)                  │         ●                  │  │
│  │                                  │       /   \                │  │
│  │    ─────●───────                 │      ●     \               │  │
│  │         |                        │                            │  │
│  │    ─────|───────                 │    cos θ = 0.707           │  │
│  │         |                        │    sin θ = 0.707           │  │
│  │                                  │    θ = 45°                 │  │
│  └──────────────────────────────────┴────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  A = 2      B = 1      C = 0      D = 0                      │  │
│  │  Período: 2π    Imagem: [-2, 2]                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  [▶ Play]  [⏸ Pause]  [⏭ Passo]  [◀ Anterior]  [▶ Próximo]  │  │
│  │                                                               │  │
│  │  Velocidade: [0.5×] [1×] [2×]                                │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  [☰ Presets]  [🎯 Foco]  [✏ Anotar]  [⚖ Comparar]  [⚙ Config] │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Layout TV Grande (900-1200px)
```
┌─────────────────────────────────────────────────────────────┐
│                    FUNÇÃO SENO                               │
│                                                              │
│  ┌─────────────────────┬─────────────────────────┐          │
│  │                     │                         │          │
│  │    GRÁFICO          │    CÍRCULO              │          │
│  │    (60% width)      │    TRIGonométrico       │          │
│  │                     │    (40% width)          │          │
│  └─────────────────────┴─────────────────────────┘          │
│                                                              │
│  A = 2      B = 1      C = 0      D = 0                     │
│                                                              │
│  [▶ Play]  [⏸ Pause]  [⏭ Passo]  [◀ Anterior]  [▶ Próximo]  │
│                                                              │
│  [☰ Presets]  [🎯 Foco]  [✏ Anotar]  [⚖ Comparar]            │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Layout TV Pequena (600-900px)
```
┌───────────────────────────────────────┐
│          FUNÇÃO SENO                   │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │                                  │ │
│  │    GRÁFICO + CÍRCULO OVERLAY     │ │
│  │    (100% width)                  │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  A = 2  B = 1  C = 0  D = 0           │
│                                        │
│  [▶] [⏸] [⏭] [◀] [▶]                │
│                                        │
│  [☰] [🎯] [✏] [⚖]                    │
└───────────────────────────────────────┘
```

---

## 3. ESPECIFICAÇÕES DE FONTES E CORES

### 3.1 Tamanhos de Fonte para Distância

| Elemento | Tamanho Mínimo | Tamanho Recomendado | Distância Máxima Visível |
|----------|---------------|--------------------|-----------------------|
| Título principal | 48px | 64px | 10m |
| Subtítulo | 32px | 40px | 8m |
| Valor de parâmetro | 36px | 48px | 10m |
| Label de parâmetro | 24px | 32px | 8m |
| Texto de apoio | 20px | 24px | 6m |
| Valor de ângulo | 32px | 40px | 8m |
| Valor de função | 28px | 36px | 7m |
| **Nunca menor que** | **18px** | - | - |

### 3.2 Paleta de Cores para Alto Contraste

```css
/* MODO AULA — Paleta de Alto Contraste */
.modo-aula {
  /* Fundo */
  --aula-bg: #0a0a0f;                    /* Preto profundo */
  --aula-surface: #141420;               /* Superfície escura */
  --aula-surface-2: #1e1e30;             /* Superfície secundária */
  
  /* Texto */
  --aula-text: #ffffff;                   /* Branco puro */
  --aula-text-soft: #e0e0e0;             /* Branco suave */
  --aula-text-muted: #a0a0a0;            /* Cinza para texto secundário */
  
  /* Acentos — alta saturação */
  --aula-accent: #ff8c00;                /* Laranja vibrante */
  --aula-accent-2: #ffd700;              /* Amarelo ouro */
  --aula-accent-3: #00e5ff;              /* Ciano brillante */
  --aula-accent-4: #76ff03;              /* Verde lima */
  --aula-accent-5: #ff4081;              /* Rosa vibrante */
  --aula-accent-6: #e040fb;              /* Roxo vibrante */
  
  /* Elementos visuais */
  --aula-grid: rgba(255, 255, 255, 0.08); /* Grade sutil */
  --aula-axis: rgba(255, 215, 0, 0.7);    /* Eixos dourados */
  --aula-curve-width: 4px;                /* Curvas grossas */
  --aula-point-size: 14px;                /* Pontos grandes */
  
  /* Bordas */
  --aula-border: rgba(255, 255, 255, 0.15);
  --aula-border-active: var(--aula-accent);
  
  /* Sombras para profundidade */
  --aula-glow: 0 0 20px rgba(255, 140, 0, 0.3);
  --aula-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}
```

### 3.3 Estilos de Texto

```css
/* Títulos — máxima visibilidade */
.modo-aula .aula-title {
  font-family: var(--font-display);
  font-size: clamp(48px, 5vw, 72px);
  font-weight: 800;
  color: var(--aula-text);
  text-align: center;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

/* Valores de parâmetros */
.modo-aula .aula-param-value {
  font-family: var(--font-mono);
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 700;
  color: var(--aula-accent);
  letter-spacing: 0.02em;
}

/* Labels de parâmetros */
.modo-aula .aula-param-label {
  font-family: var(--font-mono);
  font-size: clamp(24px, 2.5vw, 32px);
  font-weight: 600;
  color: var(--aula-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Valores de funções */
.modo-aula .aula-func-value {
  font-family: var(--font-mono);
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 600;
  color: var(--aula-accent-2);
}
```

---

## 4. CONTROLES TOUCH

### 4.1 Tamanhos de Alvos Touch

```css
/* Botões de ação — enormes para uso rápido */
.modo-aula .aula-btn {
  min-width: 80px;
  min-height: 80px;
  padding: 16px 24px;
  border-radius: 16px;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 3px solid var(--aula-border);
  background: var(--aula-surface);
  color: var(--aula-text);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.modo-aula .aula-btn:hover,
.modo-aula .aula-btn:active {
  border-color: var(--aula-accent);
  background: var(--aula-surface-2);
  box-shadow: var(--aula-glow);
  transform: scale(1.05);
}

.modo-aula .aula-btn.active {
  background: var(--aula-accent);
  color: #000;
  border-color: var(--aula-accent);
}

/* Botões de play/pause — maiores ainda */
.modo-aula .aula-play-btn {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  font-size: 36px;
  border: 4px solid var(--aula-accent);
  background: var(--aula-surface);
  color: var(--aula-accent);
}

.modo-aula .aula-play-btn.playing {
  background: var(--aula-accent);
  color: #000;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 140, 0, 0.4); }
  50% { box-shadow: 0 0 0 20px rgba(255, 140, 0, 0); }
}
```

### 4.2 Layout dos Controles

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONTROLES DE ANIMAÇÃO                       │
│                                                                  │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────┐ │
│   │  ◀◀    │  │   ◀     │  │   ▶/⏸  │  │   ▶     │  │  ▶▶  │ │
│   │ Início  │  │ Voltar  │  │ Play/   │  │ Avançar │  │ Fim  │ │
│   │         │  │         │  │ Pause   │  │         │  │      │ │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘  └──────┘ │
│                                                                  │
│   ┌────────────────────────────────────────────────────────────┐ │
│   │  Velocidade:  [0.5×]  [1×]  [2×]  [3×]                  │ │
│   └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│   ┌────────────────────────────────────────────────────────────┐ │
│   │  Passo:  [π/12]  [π/6]  [π/4]  [π/2]  [π]  [2π]         │ │
│   └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Gestos Touch

| Gesto | Ação | Feedback |
|-------|------|----------|
| Toque simples | Selecionar elemento | Highlight azul |
| Toque longo (500ms) | Abrir contexto/opções | Menu popup |
| Deslizar esquerda | Próximo passo | Animação de transição |
| Deslizar direita | Passo anterior | Animação de transição |
| Deslizar cima | Aumentar parâmetro | Valor muda com seta |
| Deslizar baixo | Diminuir parâmetro | Valor muda com seta |
| Pinça (dois dedos) | Zoom in/out | Zoom suave |
| Dois toques | Resetar vista | Animação de reset |
| Arrastar ponto | Mover ângulo | Ponto acompanha |

---

## 5. ATALHOS DE TECLADO

### 5.1 Atalhos Essenciais

| Atalho | Ação | Ícone |
|--------|------|-------|
| `Espaço` | Play/Pause | ▶/⏸ |
| `Seta Esquerda` | Passo anterior | ◀ |
| `Seta Direita` | Próximo passo | ▶ |
| `Seta Cima` | Aumentar amplitude | ↑ |
| `Seta Baixo` | Diminuir amplitude | ↓ |
| `1` | Selecionar seno | sin |
| `2` | Selecionar cosseno | cos |
| `3` | Selecionar tangente | tan |
| `4` | Função genérica | f(x) |
| `A` | Focar em amplitude | A |
| `B` | Focar em frequência | B |
| `C` | Focar em fase | C |
| `D` | Focar em deslocamento | D |
| `R` | Resetar | ⌖ |
| `F` | Modo foco | 🎯 |
| `N` | Modo anotação | ✏ |
| `C` | Modo comparação | ⚖ |
| `P` | Modo apresentação | ⛶ |
| `Esc` | Sair do modo | × |
| `?` | Mostrar ajuda | ? |

### 5.2 Atalhos Avançados

| Atalho | Ação |
|--------|------|
| `Shift+←` | Ângulo notável anterior |
| `Shift+→` | Próximo ângulo notável |
| `Home` | Ir para início (0) |
| `End` | Ir para fim (2π) |
| `Ctrl+Z` | Desfazer |
| `Ctrl+Y` | Refazer |
| `Ctrl+0` | Resetar vista |
| `Ctrl+S` | Salvar estado |
| `F11` | Tela cheia |
| `Tab` | Alternar foco entre painéis |

---

## 6. PRESETS DE DEMONSTRAÇÃO

### 6.1 Presets Pré-Construídos

```javascript
const CLASSROOM_PRESETS = [
  {
    id: "basico-seno",
    title: "O que é seno?",
    description: "Introdução à função seno",
    steps: [
      {
        title: "Círculo unitário",
        description: "O seno é a coordenada y do ponto no círculo",
        state: {
          viewMode: "circle",
          funcType: "sin",
          params: { A: 1, B: 1, C: 0, D: 0 },
          showUnitCircle: true,
          showGraph: false,
          theta: Math.PI / 4,
        },
        annotations: [
          { type: "text", x: 0, y: 1.3, text: "sen θ = coordenada y", color: "#ffd700" },
        ],
      },
      {
        title: "Projeção no eixo y",
        description: "O seno é a projeção vertical",
        state: {
          viewMode: "circle",
          funcType: "sin",
          params: { A: 1, B: 1, C: 0, D: 0 },
          showUnitCircle: true,
          showGraph: false,
          showProjections: true,
          theta: Math.PI / 3,
        },
      },
      {
        title: "O gráfico de seno",
        description: "Traçando o seno ao longo do ângulo",
        state: {
          viewMode: "graph",
          funcType: "sin",
          params: { A: 1, B: 1, C: 0, D: 0 },
          piAxis: true,
          theta: 0,
        },
        animation: { autoPlay: true, speed: 1 },
      },
      {
        title: "Seno completo",
        description: "Um período da função seno",
        state: {
          viewMode: "split",
          funcType: "sin",
          params: { A: 1, B: 1, C: 0, D: 0 },
          piAxis: true,
          theta: Math.PI / 2,
        },
      },
    ],
  },
  {
    id: "parametros-funcao",
    title: "Parâmetros da função",
    description: "Explorando A, B, C, D",
    steps: [
      {
        title: "Amplitude (A)",
        description: "A controla a 'altura' da onda",
        state: {
          viewMode: "graph",
          funcType: "sin",
          params: { A: 1, B: 1, C: 0, D: 0 },
          focusParam: "A",
          piAxis: true,
        },
        annotations: [
          { type: "arrow", x1: -3, y1: 1, x2: -3, y2: 2, color: "#ff4081" },
          { type: "text", x: -2.5, y: 1.5, text: "Amplitude", color: "#ff4081" },
        ],
      },
      {
        title: "Amplitude = 2",
        description: "Dobrando a amplitude",
        state: {
          viewMode: "graph",
          funcType: "sin",
          params: { A: 2, B: 1, C: 0, D: 0 },
          focusParam: "A",
          piAxis: true,
        },
        transition: { animate: true, duration: 500 },
      },
      {
        title: "Frequência (B)",
        description: "B controla quantas oscilações cabem no período",
        state: {
          viewMode: "graph",
          funcType: "sin",
          params: { A: 1, B: 2, C: 0, D: 0 },
          focusParam: "B",
          piAxis: true,
        },
      },
      {
        title: "Fase (C)",
        description: "C desloca a onda horizontalmente",
        state: {
          viewMode: "graph",
          funcType: "sin",
          params: { A: 1, B: 1, C: Math.PI / 2, D: 0 },
          focusParam: "C",
          piAxis: true,
        },
      },
      {
        title: "Deslocamento vertical (D)",
        description: "D move a onda para cima ou para baixo",
        state: {
          viewMode: "graph",
          funcType: "sin",
          params: { A: 1, B: 1, C: 0, D: 2 },
          focusParam: "D",
          piAxis: true,
        },
      },
    ],
  },
  {
    id: "seno-vs-cosseno",
    title: "Seno vs Cosseno",
    description: "Comparação entre seno e cosseno",
    steps: [
      {
        title: "Apenas seno",
        description: "A função seno começa em 0",
        state: {
          viewMode: "graph",
          funcType: "sin",
          curves: [{ expr: "y=sin(x)", color: "#ffd700", label: "sen(x)" }],
          piAxis: true,
        },
      },
      {
        title: "Adicionando cosseno",
        description: "O cosseno é o seno deslocado",
        state: {
          viewMode: "graph",
          funcType: "sin",
          curves: [
            { expr: "y=sin(x)", color: "#ffd700", label: "sen(x)" },
            { expr: "y=cos(x)", color: "#ff8c00", label: "cos(x)" },
          ],
          piAxis: true,
        },
        annotations: [
          { type: "text", x: 0.5, y: 1.3, text: "Deslocamento de π/2", color: "#00e5ff" },
        ],
      },
      {
        title: "Relação com o círculo",
        description: "sen θ = cos(θ - π/2)",
        state: {
          viewMode: "split",
          funcType: "sin",
          curves: [
            { expr: "y=sin(x)", color: "#ffd700", label: "sen(x)" },
            { expr: "y=cos(x)", color: "#ff8c00", label: "cos(x)" },
          ],
          piAxis: true,
          theta: Math.PI / 4,
        },
      },
    ],
  },
  {
    id: "fenomenos-periodicos",
    title: "Fenômenos periódicos",
    description: "Aplicações no mundo real",
    steps: [
      {
        title: "Movimento Harmônico",
        description: "Uma massa presa a uma mola",
        state: {
          viewMode: "phenomenon",
          phenomenonType: "sho",
          params: { amplitude: 1, frequency: 1, phase: 0 },
        },
      },
      {
        title: "Corrente Alternada",
        description: "Tensão da rede elétrica (127V/60Hz)",
        state: {
          viewMode: "phenomenon",
          phenomenonType: "ac",
          params: { amplitude: 127, frequency: 60, phase: 0 },
        },
      },
      {
        title: "Temperatura diária",
        description: "Variação de temperatura ao longo do dia",
        state: {
          viewMode: "phenomenon",
          phenomenonType: "temp",
          params: { amplitude: 5, frequency: 1, phase: 0 },
        },
      },
    ],
  },
];
```

### 6.2 Interface de Seleção de Presets

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESETS DE DEMONSTRAÇÃO                      │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │ 📐 O que é seno?    │  │ 🔢 Parâmetros       │              │
│  │                     │  │                     │              │
│  │ 4 passos           │  │ 5 passos            │              │
│  │ ~5 minutos         │  │ ~8 minutos          │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │ ⚖ Seno vs Cosseno  │  │ 🌊 Fenômenos        │              │
│  │                     │  │                     │              │
│  │ 3 passos           │  │ 3 passos            │              │
│  │ ~4 minutos         │  │ ~6 minutos          │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [📝 Criar novo preset]  [📂 Carregar preset salvo]         ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. MODO PASSO A PASSO

### 7.1 Navegação entre Passos

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Passo 3 de 5: "O gráfico de seno"                             │
│  ───────────────────────────────────────────────────────────────│
│                                                                  │
│  Traçando o seno ao longo do ângulo                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  [●●●○○] Progresso: 60%                                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────┐ │
│  │ ◀ Início│  │ ◀ Ant.  │  │ ▶ Próx. │  │ ▶ Fim   │  │ ⏭ Auto│ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └──────┘ │
│                                                                  │
│  [▶ Iniciar animação deste passo]                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Estado de cada Passo

```javascript
const stepState = {
  id: "step-3",
  title: "O gráfico de seno",
  description: "Traçando o seno ao longo do ângulo",
  state: {
    // Modo de visualização
    viewMode: "graph",           // "graph" | "circle" | "split" | "overlay" | "compare" | "phenomenon"
    
    // Função
    funcType: "sin",
    params: { A: 1, B: 1, C: 0, D: 0 },
    
    // Curvas visíveis
    curves: [
      { expr: "y=sin(x)", color: "#ffd700", visible: true, width: 4 }
    ],
    
    // Viewport
    view: { xmin: -2 * Math.PI, xmax: 2 * Math.PI, ymin: -3, ymax: 3 },
    piAxis: true,
    
    // Animação
    theta: 0,
    showUnitCircle: false,
    showGraph: true,
    showProjections: true,
    
    // Elementos visuais
    showMarkers: true,
    showTangent: false,
    showNormal: false,
    
    // Foco
    focusParam: null,             // "A" | "B" | "C" | "D" | null
    
    // Anotações do passo
    annotations: [
      { type: "text", x: 0.5, y: 1.5, text: "sen(x)", color: "#ffd700", size: 32 }
    ],
  },
  
  // Animação automática do passo
  animation: {
    autoPlay: false,
    speed: 1,
    duration: 5000,               // ms, 0 = infinito
    loop: false,
  },
  
  // Transição para o próximo passo
  transition: {
    type: "fade",                 // "fade" | "slide" | "zoom" | "none"
    duration: 300,
  },
  
  // Notas do professor (não visíveis para alunos)
  notes: "Este passo mostra como o seno é gerado pelo movimento circular.",
};
```

### 7.3 Animação Automática por Passo

Cada passo pode ter uma animação configurada:

```javascript
// Exemplo: Passo com animação automática
{
  title: "Seno completo",
  animation: {
    autoPlay: true,
    speed: 1,
    duration: 0,           // infinito até próximo passo
    loop: false,
    onEnd: "nextStep",     // "nextStep" | "pause" | "loop"
  },
}
```

---

## 8. MODO FOCO

### 8.1 Conceito

O modo foco destaca um elemento específico enquanto diminui a atenção dos outros:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  │              MODO FOCO: AMPLITUDE (A)                       ││
│  │                                                             ││
│  │   ┌─────────────────────────────────────────────────────┐  ││
│  │   │                                                     │  ││
│  │   │    ████████████████████████████████████████████     │  ││
│  │   │    ██                                        ██     │  ││
│  │   │    ██   AMPLITUDE = 2                       ██     │  ││
│  │   │    ██   A = 2                               ██     │  ││
│  │   │    ██                                        ██     │  ││
│  │   │    ████████████████████████████████████████████     │  ││
│  │   │                                                     │  ││
│  │   └─────────────────────────────────────────────────────┘  ││
│  │                                                             ││
│  │   Outros parâmetros aparecem em segundo plano:             ││
│  │   B = 1  (ativo)  C = 0  (ativo)  D = 0  (ativo)          ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [🎯 Sair do modo foco]                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Implementação

```css
/* Modo Foco */
.modo-aula.focus-mode .aula-param {
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.modo-aula.focus-mode .aula-param.focused {
  opacity: 1;
  transform: scale(1.1);
  box-shadow: var(--aula-glow);
  z-index: 10;
}

.modo-aula.focus-mode .aula-param.focused .aula-param-label {
  color: var(--aula-accent);
  font-size: clamp(28px, 3vw, 40px);
}

.modo-aula.focus-mode .aula-param.focused .aula-param-value {
  font-size: clamp(48px, 5vw, 72px);
  color: var(--aula-accent);
  text-shadow: 0 0 20px var(--aula-accent);
}

/* Destaque no gráfico */
.modo-aula.focus-mode .plot-highlight {
  stroke-width: 6px;
  filter: drop-shadow(0 0 10px var(--aula-accent));
}

.modo-aula.focus-mode .plot-dimmed {
  opacity: 0.3;
}
```

### 8.3 Parâmetros com Foco

| Parâmetro | O que destaca | Cor do destaque |
|-----------|--------------|-----------------|
| A (Amplitude) | Altura da onda, máximos/mínimos | Rosa (#ff4081) |
| B (Frequência) | Número de oscilações, período | Ciano (#00e5ff) |
| C (Fase) | Deslocamento horizontal | Verde (#76ff03) |
| D (Desloc.) | Deslocamento vertical, linha média | Roxo (#e040fb) |

---

## 9. MODO ANOTAÇÃO

### 9.1 Ferramentas de Anotação

```
┌─────────────────────────────────────────────────────────────────┐
│                     FERRAMENTAS DE ANOTAÇÃO                      │
│                                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────┐ │
│  │  T      │  │  ✏      │  │  →      │  │  □      │  │  ○   │ │
│  │ Texto   │  │ Livre   │  │ Seta    │  │ Retâng. │  │ Elipse│ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └──────┘ │
│                                                                  │
│  Tamanho: [Pequeno] [Médio] [Grande] [Enorme]                  │
│                                                                  │
│  Cor: ● ● ● ● ● ● ●                                           │
│       Laranja Amarelo Azul Verde Rosa Vermelho Branco           │
│                                                                  │
│  [🗑 Limpar anotações]  [↩ Desfazer]  [↪ Refazer]              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Estilos de Anotação para Distância

```css
/* Anotações em modo sala de aula */
.modo-aula .annotation-text {
  font-size: clamp(24px, 3vw, 40px);
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  border-radius: 8px;
}

.modo-aula .annotation-arrow {
  stroke-width: 4px;
  marker-end: url(#arrowhead-large);
}

.modo-aula .annotation-rect {
  stroke-width: 3px;
  stroke-dasharray: 8 4;
}

.modo-aula .annotation-ellipse {
  stroke-width: 3px;
  stroke-dasharray: 8 4;
}
```

---

## 10. MODO COMPARAÇÃO

### 10.1 Layout de Comparação

```
┌─────────────────────────────────────────────────────────────────┐
│                     COMPARAÇÃO: SENO vs COSSENO                  │
│                                                                  │
│  ┌──────────────────────┬──────────────────────┐                │
│  │                      │                      │                │
│  │    sen(x)            │    cos(x)            │                │
│  │    ● Amarelo         │    ● Laranja         │                │
│  │                      │                      │                │
│  │    [👁 Visível]      │    [👁 Visível]      │                │
│  │    Opacidade: 100%   │    Opacidade: 100%   │                │
│  │                      │                      │                │
│  └──────────────────────┴──────────────────────┘                │
│                                                                  │
│  Mostrar diferença: ☑ |sen(x) - cos(x)|                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  [sen(x)] [cos(x)] [sen(x)+cos(x)] [sen(x)·cos(x)]        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Curvas Predefinidas para Comparação

```javascript
const COMPARISON_PRESETS = [
  { label: "sen(x)", expr: "y=sin(x)", color: "#ffd700" },
  { label: "cos(x)", expr: "y=cos(x)", color: "#ff8c00" },
  { label: "sen(x)+cos(x)", expr: "y=sin(x)+cos(x)", color: "#00e5ff" },
  { label: "sen(x)·cos(x)", expr: "y=sin(x)*cos(x)", color: "#76ff03" },
  { label: "sen²(x)", expr: "y=sin(x)^2", color: "#ff4081" },
  { label: "cos²(x)", expr: "y=cos(x)^2", color: "#e040fb" },
  { label: "|sen(x)|", expr: "y=abs(sin(x))", color: "#ff6e40" },
  { label: "sen(2x)", expr: "y=sin(2*x)", color: "#69f0ae" },
];
```

---

## 11. BREAKPOINTS RESPONSIVOS

### 11.1 Definições

```css
/* Breakpoints para modo sala de aula */
/* Desktop grande (>1200px) — Projetor/Tela grande */
@media (min-width: 1200px) {
  .modo-aula { /* Layout completo */ }
}

/* TV grande (900-1200px) — TV de sala */
@media (min-width: 900px) and (max-width: 1199px) {
  .modo-aula { /* Layout simplificado */ }
}

/* TV pequena (600-900px) — Monitor/TV pequena */
@media (min-width: 600px) and (max-width: 899px) {
  .modo-aula { /* Layout mínimo */ }
}

/* Mobile (<600px) — Controle remoto/tablet */
@media (max-width: 599px) {
  .modo-aula { /* Layout touch-optimized */ }
}
```

### 11.2 Adaptações por Breakpoint

| Elemento | Desktop (>1200px) | TV Grande (900-1200px) | TV Pequena (600-900px) | Mobile (<600px) |
|----------|------------------|----------------------|----------------------|----------------|
| Título | 64px | 48px | 36px | 28px |
| Parâmetros | 48px | 36px | 28px | 24px |
| Botões | 100px | 80px | 60px | 56px |
| Grid | 2 colunas | 2 colunas | 1 coluna | 1 coluna |
| Controles | Embutidos | Embutidos | Flutuantes | Flutuantes |
| Anotações | Sempre visíveis | Sempre visíveis | Ao tocar | Ao tocar |

---

## 12. INTEGRAÇÃO COM CÓDIGO EXISTENTE

### 12.1 Estrutura de Arquivos

```
styles/
├── modo-aula.css          ← NOVO: Estilos do modo sala de aula
├── tokens.css             ← Existente (não alterar)
├── base.css               ← Existente (não alterar)
└── board.css              ← Existente (extendido)

professor.html             ← MODIFICADO: Adiciona toggle do modo
```

### 12.2 CSS a Criar: `styles/modo-aula.css`

```css
/* ============================================================
   styles/modo-aula.css
   Modo Sala de Aula — TV / Projetor
   ============================================================ */

/* ── Variáveis do modo ── */
.modo-aula {
  /* Fundo escuro para projeção */
  --aula-bg: #0a0a0f;
  --aula-surface: #141420;
  --aula-surface-2: #1e1e30;
  
  /* Texto de alto contraste */
  --aula-text: #ffffff;
  --aula-text-soft: #e0e0e0;
  --aula-text-muted: #a0a0a0;
  
  /* Acentos vibrantes */
  --aula-accent: #ff8c00;
  --aula-accent-2: #ffd700;
  --aula-accent-3: #00e5ff;
  --aula-accent-4: #76ff03;
  --aula-accent-5: #ff4081;
  --aula-accent-6: #e040fb;
  
  /* Elementos visuais */
  --aula-grid: rgba(255, 255, 255, 0.08);
  --aula-axis: rgba(255, 215, 0, 0.7);
  --aula-curve-width: 4px;
  --aula-point-size: 14px;
  
  /* Bordas e sombras */
  --aula-border: rgba(255, 255, 255, 0.15);
  --aula-border-active: var(--aula-accent);
  --aula-glow: 0 0 20px rgba(255, 140, 0, 0.3);
  --aula-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

/* ── Reset de estilos base ── */
.modo-aula * {
  box-sizing: border-box;
}

.modo-aula body {
  margin: 0;
  padding: 0;
  background: var(--aula-bg);
  color: var(--aula-text);
  font-family: var(--font-display);
  overflow: hidden;
  height: 100vh;
  width: 100vw;
}

/* ── Layout principal ── */
.modo-aula .aula-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  gap: 20px;
}

/* ── Título ── */
.modo-aula .aula-header {
  text-align: center;
  padding: 10px 0;
}

.modo-aula .aula-title {
  font-size: clamp(48px, 5vw, 72px);
  font-weight: 800;
  color: var(--aula-text);
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.modo-aula .aula-subtitle {
  font-size: clamp(24px, 2.5vw, 36px);
  color: var(--aula-text-soft);
  margin: 8px 0 0 0;
}

/* ── Área de visualização ── */
.modo-aula .aula-view {
  flex: 1;
  display: grid;
  grid-template-columns: 65fr 35fr;
  gap: 20px;
  min-height: 0;
}

.modo-aula .aula-graph {
  position: relative;
  background: var(--aula-surface);
  border-radius: 16px;
  border: 2px solid var(--aula-border);
  overflow: hidden;
}

.modo-aula .aula-graph canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.modo-aula .aula-circle {
  position: relative;
  background: var(--aula-surface);
  border-radius: 16px;
  border: 2px solid var(--aula-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modo-aula .aula-circle canvas {
  flex: 1;
  width: 100%;
  display: block;
}

.modo-aula .aula-circle-info {
  padding: 16px;
  background: var(--aula-surface-2);
  border-top: 2px solid var(--aula-border);
}

/* ── Info do círculo ── */
.modo-aula .aula-circle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-family: var(--font-mono);
  font-size: clamp(20px, 2vw, 28px);
}

.modo-aula .aula-circle-label {
  color: var(--aula-text-soft);
  font-weight: 600;
}

.modo-aula .aula-circle-value {
  color: var(--aula-accent);
  font-weight: 700;
}

/* ── Parâmetros ── */
.modo-aula .aula-params {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 20px;
  background: var(--aula-surface);
  border-radius: 16px;
  border: 2px solid var(--aula-border);
}

.modo-aula .aula-param {
  text-align: center;
  padding: 16px 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.modo-aula .aula-param:hover {
  background: var(--aula-surface-2);
}

.modo-aula .aula-param-label {
  font-size: clamp(20px, 2vw, 28px);
  color: var(--aula-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.modo-aula .aula-param-value {
  font-family: var(--font-mono);
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 700;
  color: var(--aula-accent);
}

/* ── Info derivada ── */
.modo-aula .aula-derived {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 12px 20px;
  background: var(--aula-surface-2);
  border-radius: 12px;
  font-family: var(--font-mono);
  font-size: clamp(18px, 1.8vw, 24px);
  color: var(--aula-text-soft);
}

.modo-aula .aula-derived span {
  color: var(--aula-accent-2);
  font-weight: 600;
}

/* ── Controles de animação ── */
.modo-aula .aula-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: var(--aula-surface);
  border-radius: 16px;
  border: 2px solid var(--aula-border);
}

.modo-aula .aula-btn {
  min-width: 80px;
  min-height: 80px;
  padding: 16px 24px;
  border-radius: 16px;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 3px solid var(--aula-border);
  background: var(--aula-surface);
  color: var(--aula-text);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.modo-aula .aula-btn:hover,
.modo-aula .aula-btn:active {
  border-color: var(--aula-accent);
  background: var(--aula-surface-2);
  box-shadow: var(--aula-glow);
  transform: scale(1.05);
}

.modo-aula .aula-btn.active {
  background: var(--aula-accent);
  color: #000;
  border-color: var(--aula-accent);
}

.modo-aula .aula-play-btn {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  font-size: 36px;
  border: 4px solid var(--aula-accent);
  background: var(--aula-surface);
  color: var(--aula-accent);
}

.modo-aula .aula-play-btn.playing {
  background: var(--aula-accent);
  color: #000;
  animation: pulse 2s infinite;
}

/* ── Barra de ferramentas ── */
.modo-aula .aula-toolbar {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: var(--aula-surface);
  border-radius: 16px;
  border: 2px solid var(--aula-border);
}

.modo-aula .aula-tool-btn {
  min-width: 80px;
  min-height: 60px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid var(--aula-border);
  background: var(--aula-surface-2);
  color: var(--aula-text-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.modo-aula .aula-tool-btn:hover {
  border-color: var(--aula-accent);
  color: var(--aula-accent);
}

.modo-aula .aula-tool-btn.active {
  background: var(--aula-accent);
  color: #000;
  border-color: var(--aula-accent);
}

/* ── Velocidade ── */
.modo-aula .aula-speed {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
}

.modo-aula .aula-speed-label {
  font-size: 20px;
  color: var(--aula-text-muted);
  font-weight: 600;
}

.modo-aula .aula-speed-btn {
  min-width: 60px;
  min-height: 50px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  border: 2px solid var(--aula-border);
  background: var(--aula-surface-2);
  color: var(--aula-text-soft);
  transition: all 0.2s ease;
}

.modo-aula .aula-speed-btn.active {
  background: var(--aula-accent);
  color: #000;
  border-color: var(--aula-accent);
}

/* ── Modo foco ── */
.modo-aula.focus-mode .aula-param {
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.modo-aula.focus-mode .aula-param.focused {
  opacity: 1;
  transform: scale(1.1);
  box-shadow: var(--aula-glow);
  z-index: 10;
}

/* ── Animações ── */
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 140, 0, 0.4); }
  50% { box-shadow: 0 0 0 20px rgba(255, 140, 0, 0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* ── Responsivo ── */
@media (max-width: 1199px) {
  .modo-aula .aula-view {
    grid-template-columns: 60fr 40fr;
    gap: 16px;
  }
  
  .modo-aula .aula-params {
    gap: 24px;
    padding: 16px;
  }
  
  .modo-aula .aula-controls {
    gap: 16px;
    padding: 16px;
  }
}

@media (max-width: 899px) {
  .modo-aula .aula-view {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .modo-aula .aula-circle {
    display: none; /* Em TV pequena, círculo fica no gráfico */
  }
  
  .modo-aula .aula-params {
    flex-wrap: wrap;
    gap: 16px;
    padding: 12px;
  }
  
  .modo-aula .aula-param {
    min-width: 120px;
    padding: 12px 16px;
  }
  
  .modo-aula .aula-controls {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px;
  }
  
  .modo-aula .aula-btn {
    min-width: 60px;
    min-height: 60px;
    font-size: 20px;
  }
  
  .modo-aula .aula-play-btn {
    width: 80px;
    height: 80px;
    font-size: 30px;
  }
}

@media (max-width: 599px) {
  .modo-aula .aula-container {
    padding: 12px;
    gap: 12px;
  }
  
  .modo-aula .aula-title {
    font-size: 28px;
  }
  
  .modo-aula .aula-params {
    gap: 12px;
    padding: 8px;
  }
  
  .modo-aula .aula-param {
    min-width: 80px;
    padding: 8px 12px;
  }
  
  .modo-aula .aula-param-label {
    font-size: 16px;
  }
  
  .modo-aula .aula-param-value {
    font-size: 24px;
  }
  
  .modo-aula .aula-controls {
    gap: 8px;
    padding: 8px;
  }
  
  .modo-aula .aula-btn {
    min-width: 50px;
    min-height: 50px;
    font-size: 18px;
    padding: 8px 12px;
  }
  
  .modo-aula .aula-play-btn {
    width: 70px;
    height: 70px;
    font-size: 28px;
  }
  
  .modo-aula .aula-toolbar {
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
  }
  
  .modo-aula .aula-tool-btn {
    min-width: 60px;
    min-height: 50px;
    font-size: 16px;
  }
}
```

### 12.3 JavaScript a Adicionar em `professor.html`

```javascript
/* ──────────── MODO AULA ──────────── */
let modoAulaActive = false;
let modoAulaState = {
  viewMode: "split",           // "graph" | "circle" | "split" | "overlay" | "compare" | "phenomenon"
  focusParam: null,            // "A" | "B" | "C" | "D" | null
  focusMode: false,
  annotationMode: false,
  compareMode: false,
  currentPreset: null,
  currentStep: 0,
  playbackSpeed: 1,
};

// Presets de demonstração
const CLASSROOM_PRESETS = [ /* ... como definido acima ... */ ];

function toggleModoAula() {
  modoAulaActive = !modoAulaActive;
  document.body.classList.toggle("modo-aula", modoAulaActive);
  
  if (modoAulaActive) {
    // Entrar em tela cheia
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
    // Aplicar estilos de alto contraste
    aplicarAltoContraste();
    // Atualizar layout
    atualizarLayoutModoAula();
  } else {
    // Sair de tela cheia
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    // Restaurar estilos normais
    restaurarEstilos();
  }
}

function aplicarAltoContraste() {
  // Aumentar espessura das curvas
  plot.curves.forEach(c => {
    c.originalWidth = c.width;
    c.width = 4;
  });
  
  // Aumentar tamanho dos pontos
  plot.markers.forEach(m => {
    m.originalSize = m.size;
    m.size = 14;
  });
  
  // Aumentar tamanho dos labels
  plot.setPiAxis(true);
  plot.draw();
}

function restaurarEstilos() {
  // Restaurar espessura das curvas
  plot.curves.forEach(c => {
    if (c.originalWidth !== undefined) {
      c.width = c.originalWidth;
      delete c.originalWidth;
    }
  });
  
  // Restaurar tamanho dos pontos
  plot.markers.forEach(m => {
    if (m.originalSize !== undefined) {
      m.size = m.originalSize;
      delete m.originalSize;
    }
  });
  
  plot.draw();
}

function atualizarLayoutModoAula() {
  // Atualizar parâmetros na tela
  const params = getCurrentParams();
  document.querySelectorAll(".aula-param-value").forEach((el, i) => {
    const values = [params.A, params.B, params.C, params.D];
    el.textContent = values[i].toFixed(2);
  });
  
  // Atualizar info derivada
  const periodo = 2 * Math.PI / params.B;
  const imagem = `[${(params.D - params.A).toFixed(1)}, ${(params.D + params.A).toFixed(1)}]`;
  document.getElementById("aula-periodo").textContent = periodo.toFixed(2);
  document.getElementById("aula-imagem").textContent = imagem;
}

function aplicarFoco(param) {
  modoAulaState.focusParam = param;
  modoAulaState.focusMode = true;
  
  document.body.classList.add("focus-mode");
  document.querySelectorAll(".aula-param").forEach(el => {
    el.classList.toggle("focused", el.dataset.param === param);
  });
  
  // Destacar no gráfico
  destacarParametroNoGrafico(param);
}

function destacarParametroNoGrafico(param) {
  // Lógica para destacar visualmente o parâmetro no gráfico
  // Por exemplo, mudar a cor da curva ou adicionar setas
  switch (param) {
    case "A":
      // Destacar amplitude (máximos/mínimos)
      destacarAmplitude();
      break;
    case "B":
      // Destacar período
      destacarPeriodo();
      break;
    case "C":
      // Destacar fase
      destacarFase();
      break;
    case "D":
      // Destacar deslocamento vertical
      destacarDeslocamento();
      break;
  }
}

function iniciarDemo(presetId) {
  const preset = CLASSROOM_PRESETS.find(p => p.id === presetId);
  if (!preset) return;
  
  modoAulaState.currentPreset = preset;
  modoAulaState.currentStep = 0;
  
  aplicarPasso(preset.steps[0]);
}

function aplicarPasso(step) {
  // Aplicar estado do passo
  if (step.state.viewMode) {
    mudarModoVisualizacao(step.state.viewMode);
  }
  
  if (step.state.params) {
    atualizarParametros(step.state.params);
  }
  
  if (step.state.curves) {
    plot.setCurves(step.state.curves);
  }
  
  if (step.state.focusParam) {
    aplicarFoco(step.state.focusParam);
  }
  
  if (step.annotations) {
    adicionarAnotacoes(step.annotations);
  }
  
  if (step.animation?.autoPlay) {
    iniciarAnimacao(step.animation);
  }
  
  // Atualizar UI
  atualizarUIPasso(step);
}

function proximoPasso() {
  const preset = modoAulaState.currentPreset;
  if (!preset) return;
  
  if (modoAulaState.currentStep < preset.steps.length - 1) {
    modoAulaState.currentStep++;
    aplicarPasso(preset.steps[modoAulaState.currentStep]);
  }
}

function passoAnterior() {
  const preset = modoAulaState.currentPreset;
  if (!preset) return;
  
  if (modoAulaState.currentStep > 0) {
    modoAulaState.currentStep--;
    aplicarPasso(preset.steps[modoAulaState.currentStep]);
  }
}

/* ── Atalhos de teclado para modo aula ── */
document.addEventListener("keydown", (e) => {
  if (!modoAulaActive) return;
  
  switch (e.key) {
    case " ":
      e.preventDefault();
      togglePlayPause();
      break;
    case "ArrowLeft":
      e.preventDefault();
      passoAnterior();
      break;
    case "ArrowRight":
      e.preventDefault();
      proximoPasso();
      break;
    case "ArrowUp":
      e.preventDefault();
      aumentarAmplitude();
      break;
    case "ArrowDown":
      e.preventDefault();
      diminuirAmplitude();
      break;
    case "1":
      selecionarFuncao("sin");
      break;
    case "2":
      selecionarFuncao("cos");
      break;
    case "3":
      selecionarFuncao("tan");
      break;
    case "a":
      aplicarFoco("A");
      break;
    case "b":
      aplicarFoco("B");
      break;
    case "c":
      aplicarFoco("C");
      break;
    case "d":
      aplicarFoco("D");
      break;
    case "f":
      toggleModoFoco();
      break;
    case "n":
      toggleModoAnotacao();
      break;
    case "Escape":
      if (modoAulaActive) {
        toggleModoAula();
      }
      break;
  }
});

/* ── Touch gestures ── */
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", (e) => {
  if (!modoAulaActive) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", (e) => {
  if (!modoAulaActive) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  
  // Deslizar horizontalmente
  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      passoAnterior();
    } else {
      proximoPasso();
    }
  }
  
  // Deslizar verticalmente
  if (Math.abs(deltaY) > 50 && Math.abs(deltaY) > Math.abs(deltaX)) {
    if (deltaY > 0) {
      diminuirAmplitude();
    } else {
      aumentarAmplitude();
    }
  }
}, { passive: true });
```

---

## 13. CHECKLIST DE IMPLEMENTAÇÃO

### 13.1 Arquivos a Criar
- [ ] `styles/modo-aula.css` — Estilos do modo sala de aula (~500 linhas)

### 13.2 Arquivos a Modificar
- [ ] `professor.html` — Adicionar toggle e lógica do modo (~200 linhas adicionais)

### 13.3 Funcionalidades por Prioridade

**Prioridade ALTA:**
- [ ] Toggle do modo (botão + atalho)
- [ ] Layout responsivo para TV/projetor
- [ ] Fontes grandes e alto contraste
- [ ] Controles touch grandes
- [ ] Atalhos de teclado essenciais

**Prioridade MÉDIA:**
- [ ] Presets de demonstração pré-construídos
- [ ] Navegação passo a passo
- [ ] Modo foco para parâmetros
- [ ] Anotações visíveis à distância

**Prioridade BAIXA:**
- [ ] Modo comparação avançado
- [ ] Animações automáticas por passo
- [ ] Salvar/Carregar presets personalizados
- [ ] Suporte a múltiplos monitores

### 13.4 Testes Manuais

- [ ] Modo entra/sai de tela cheia corretamente
- [ ] Fontes são legíveis a 5 metros em TV
- [ ] Controles touch funcionam com dedo (não requires stylus)
- [ ] Atalhos de teclado funcionam sem olhar o teclado
- [ ] Presets carregam corretamente
- [ ] Navegação passo a passo funciona
- [ ] Modo foco destaca corretamente o parâmetro
- [ ] Anotações são visíveis à distância
- [ ] Layout se adapta a diferentes tamanhos de tela
- [ ] Animações são suaves em 60fps

---

## 14. FLUXOS DE INTERAÇÃO

### Fluxo 1: Professor inicia aula
1. Abre `professor.html`
2. Clica no botão "📺 Modo Aula" ou pressiona `F`
3. Tela fica em tela cheia com alto contraste
4. Seleciona preset "O que é seno?"
5. Navega entre passos com setas ou touch

### Fluxo 2: Professor quer destacar amplitude
1. Pressiona `A` ou clica no parâmetro A
2. Modo foco ativa automaticamente
3. A amplitude fica destacada com cor rosa
4. Outros parâmetros ficam transparentes
5. Professor explica while o destaque está visível

### Fluxo 3: Professor quer comparar seno e cosseno
1. Pressiona `C` ou clica "⚖ Comparar"
2. Duas curvas aparecem lado a lado
3. Professor ajusta opacidade de cada uma
4. Mostra a relação visual entre as funções

### Fluxo 4: Aluno faz pergunta
1. Professor pausa animação com `Espaço`
2. Pressiona `N` para entrar em modo anotação
3. Escreve resposta na tela com ferramenta de texto
4. Alunos enxergam a anotação de qualquer lugar

---

**Fim da especificação — AGENT 8**
