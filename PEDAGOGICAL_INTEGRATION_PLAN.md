# AGENT 10 — INTEGRAÇÃO PEDAGÓGICA
## Plano de Integração Completo · Capítulo 5: Trigonometria

**Status:** Plano completo  
**Objetivo:** Mapear todo o conteúdo do livro para experiências digitais  
**Data:** 2026-08-26

---

## 1. FLUXO DE INTEGRAÇÃO

```
CONTEÚDO DO LIVRO
        ↓
LIÇÃO
        ↓
INTERAÇÃO
        ↓
VISUALIZAÇÃO
        ↓
EXERCÍCIO
        ↓
APLICAÇÃO
```

---

## 2. TABELA DE MAPEAMENTO

### 2.1 Aula 1 — Arcos e Ângulos

| Componente | Especificação |
|------------|---------------|
| **Conteúdo do Livro** | Definição de radiano, conversão graus↔radianos, comprimento de arco |
| **Lição** | `trig-arcos` (Cap 5 · Aula 1) |
| **Tipo de Interação** | Leitura + Quiz interativo |
| **Visualização** | Nenhuma (conceitual) |
| **Tipo de Exercício** | Quiz de múltipla escolha (3 questões) |
| **Aplicação** | Conversão de unidades, cálculo de arco em pêndulo |

**Componentes trigVisuals usados:** Nenhum  
**Código existente:** Texto estático + quiz  
**Código necessário:** Nenhum adicional  
**CSS necessário:** Nenhum adicional

---

### 2.2 Aula 2 — Círculo Trigonométrico

| Componente | Especificação |
|------------|---------------|
| **Conteúdo do Livro** | Definição de círculo unitário, seno como coordenada y, cosseno como coordenada x, tangente geométrica |
| **Lição** | `trig-circulo` (Cap 5 · Aula 2) |
| **Tipo de Interação** | **TrigCircle** — arrastável com snap em notáveis |
| **Visualização** | Círculo trigonométrico interativo com projeções sin/cos |
| **Tipo de Exercício** | Quiz + exploração livre do círculo |
| **Aplicação** | Entender sinais por quadrante, equação fundamental |

**Componentes trigVisuals usados:**
- `mountTrigCircle()` — substitui os 4 canvas inline (draw1–draw4)

**Código existente a modificar:**
- `features/trigonometria/index.js` — função render() da aula trig-circulo
- Remover: 4 funções draw1–draw4, bindDrag, canvas inline
- Adicionar: import de trigVisuals.js, mountTrigCircle()

**Código necessário:**
```javascript
import { mountTrigCircle } from "../../core/trigVisuals.js";

// No render da lição:
mountTrigCircle(c.querySelector("#trig-circle-root"), {
  showTan: true,
  showProj: true,
  showQuadrants: true,
  showNotable: true,
  readoutEl: c.querySelector("#circle-readout"),
  onChange: (theta, data) => {
    // Atualizar readout HTML
  }
});
```

**CSS necessário:** Nenhum (trigVisuals.css já existe)

---

### 2.3 Aula 3 — Valores Notáveis

| Componente | Especificação |
|------------|---------------|
| **Conteúdo do Livro** | Triângulos 30-60-90 e 45-45-90, tabela de valores, redução ao 1º quadrante |
| **Lição** | `trig-notaveis` (Cap 5 · Aula 3) |
| **Tipo de Interação** | Leitura + Tabela interativa + Quiz |
| **Visualização** | Tabela de valores notáveis |
| **Tipo de Exercício** | Quiz (4 questões) + exercícios de redução |
| **Aplicação** | Calcular sen/cos de ângulos como 150°, 240°, 300° |

**Componentes trigVisuals usados:** Nenhum  
**Código existente:** Tabela estática + quiz  
**Código necessário:** Nenhum adicional  
**CSS necessário:** Nenhum adicional

---

### 2.4 Aula 4 — Função Seno

| Componente | Especificação |
|------------|---------------|
| **Conteúdo do Livro** | Definição de f(x) = sen(x), 5 pontos-chave, crescimento/decrescimento, paridade ímpar |
| **Lição** | `trig-seno` (Cap 5 · Aula 4) |
| **Tipo de Interação** | **CircleToGraph** + **Formula Lab** |
| **Visualização** | Círculo sincronizado com gráfico de seno |
| **Tipo de Exercício** | Lab interativo (parâmetros A, B, C, D) + desafios + quiz |
| **Aplicação** | Modificar amplitude, período, fase, deslocamento |

**Componentes trigVisuals usados:**
- `mountCircleToGraph()` — antes do labSlot existente

**Código existente a modificar:**
- `features/trigonometria/index.js` — função render() da aula trig-seno
- Adicionar: div para CircleToGraph antes do lab

**Código necessário:**
```javascript
import { mountCircleToGraph } from "../../core/trigVisuals.js";

// No render da lição:
mountCircleToGraph(c.querySelector("#ctg-seno"), {
  functions: ["sin"],
  speed: 1,
  autoPlay: false,
  showLine: true,
});
```

**CSS necessário:** Nenhum adicional

---

### 2.5 Aula 5 — Função Cosseno

| Componente | Especificação |
|------------|---------------|
| **Conteúdo do Livro** | Relação cos(x) = sin(x + π/2), 5 pontos, paridade par |
| **Lição** | `trig-cosseno` (Cap 5 · Aula 5) |
| **Tipo de Interação** | **TrigParamExplorer** com modo compare |
| **Visualização** | Gráfico de cos com comparação visual com sin |
| **Tipo de Exercício** | Lab interativo + desafio de comparação + quiz |
| **Aplicação** | Verificar que cos(x) = sin(x + π/2) |

**Componentes trigVisuals usados:**
- `mountTrigParamExplorer()` — com compare: true

**Código existente a modificar:**
- `features/trigonometria/index.js` — função render() da aula trig-cosseno
- Substituir labSlot por TrigParamExplorer com compare

**Código necessário:**
```javascript
import { mountTrigParamExplorer } from "../../core/trigVisuals.js";

// No render da lição:
mountTrigParamExplorer(c.querySelector("#tpe-cos"), {
  funcType: "cos",
  compare: true,  // Mostra sin para comparação
  showMarkers: true,
  showPeriod: true,
  showRange: true,
});
```

**CSS necessário:** Nenhum adicional

---

### 2.6 Aula 6 — Função Tangente

| Componente | Especificação |
|------------|---------------|
| **Conteúdo do Livro** | tan(x) = sin(x)/cos(x), assíntotas, período π, imagem ℝ |
| **Lição** | `trig-tangente` (Cap 5 · Aula 6) |
| **Tipo de Interação** | **TangentVis** + **Formula Lab** |
| **Visualização** | Construção da tangente no círculo + gráfico sincronizado |
| **Tipo de Exercício** | Lab interativo + desafio de período + quiz |
| **Aplicação** | Criar tangente com período π/2 |

**Componentes trigVisuals usados:**
- `mountTangentVis()` — antes do labSlot existente

**Código existente a modificar:**
- `features/trigonometria/index.js` — função render() da aula trig-tangente
- Adicionar: div para TangentVis antes do lab

**Código necessário:**
```javascript
import { mountTangentVis } from "../../core/trigVisuals.js";

// No render da lição:
mountTangentVis(c.querySelector("#tv-tan"), {
  showGraph: true,
  initialTheta: Math.PI/4,
});
```

**CSS necessário:** Nenhum adicional

---

### 2.7 Aula 7 — Revisão e Simulado

| Componente | Especificação |
|------------|---------------|
| **Conteúdo do Livro** | Revisão de todos os tópicos, exercícios resolvidos |
| **Lição** | `trig-revisao-simulado` (Cap 5 · Aula 7) |
| **Tipo de Interação** | Leitura + exercícios resolvidos |
| **Visualização** | Fórmulas KaTeX |
| **Tipo de Exercício** | 11 questões completas com soluções |
| **Aplicação** | Preparação para simulado |

**Componentes trigVisuals usados:** Nenhum  
**Código existente:** Exercícios resolvidos em HTML  
**Código necessário:** Nenhum adicional  
**CSS necessário:** Nenhum adicional

---

## 3. ESTRUTURA FINAL DAS LIÇÕES

### 3.1 Total de Lições: 7

| # | ID | Título | Componentes |
|---|-----|--------|-------------|
| 1 | `trig-arcos` | Arcos e ângulos | Texto + Quiz |
| 2 | `trig-circulo` | Círculo trigonométrico | **TrigCircle** + Quiz |
| 3 | `trig-notaveis` | Valores notáveis | Tabela + Quiz |
| 4 | `trig-seno` | Função seno | **CircleToGraph** + Lab + Quiz |
| 5 | `trig-cosseno` | Função cosseno | **TrigParamExplorer** + Lab + Quiz |
| 6 | `trig-tangente` | Função tangente | **TangentVis** + Lab + Quiz |
| 7 | `trig-revisao-simulado` | Revisão para simulado | Exercícios resolvidos |

### 3.2 Sequência de Aprendizagem

```
Aula 1: Fundamentos (arco, radiano)
    ↓
Aula 2: Visualização (círculo trigonométrico)
    ↓
Aula 3: Memória (valores notáveis)
    ↓
Aula 4: Função seno (primeira função)
    ↓
Aula 5: Função cosseno (comparação com seno)
    ↓
Aula 6: Função tangente (razão sin/cos)
    ↓
Aula 7: Revisão e aplicação
```

---

## 4. PONTOS DE INTEGRAÇÃO

### 4.1 Aula 2 — trig-circulo

**Componentes trigVisuals:**
- `mountTrigCircle()` — 1 instância

**Arquivos a modificar:**
- `features/trigonometria/index.js` — render da aula trig-circulo

**Novo código necessário:**
```javascript
// Import
import { mountTrigCircle } from "../../core/trigVisuals.js";

// No render:
c.innerHTML = `
  <div class="lesson-section">
    <div class="al-crumb">Cap 5 · Aula 2</div>
    <h1 class="al-title">Seno e cosseno — o que são de verdade?</h1>
    <p>...</p>
  </div>
  
  <div class="def">
    <div class="def-h">A ideia central — em 3 passos</div>
    <p>...</p>
  </div>
  
  <div class="lesson-section">
    <h2 class="lesson-h2">Círculo trigonométrico interativo</h2>
    <p>Arraste o ponto P e veja como as coordenadas mudam:</p>
    <div id="trig-circle-root" style="width:100%;max-width:400px;height:400px;margin:1rem auto;"></div>
    <div id="circle-readout" class="circle-readout"></div>
  </div>
  
  <div class="lesson-section">
    <h2 class="lesson-h2">Sinais por quadrante</h2>
    <p>...</p>
  </div>
  
  <div id="quiz-circ"></div>
`;

// Mount do componente
const circleRoot = c.querySelector("#trig-circle-root");
const readoutEl = c.querySelector("#circle-readout");

mountTrigCircle(circleRoot, {
  showTan: true,
  showProj: true,
  showQuadrants: true,
  showNotable: true,
  readoutEl: readoutEl,
  onChange: (theta, data) => {
    readoutEl.innerHTML = `
      <span style="color:var(--accent)">cos θ = ${data.cos.toFixed(3)}</span>
      <span style="color:var(--accent-2)">sin θ = ${data.sin.toFixed(3)}</span>
      <span>θ = ${(theta * 180 / Math.PI).toFixed(1)}°</span>
    `;
  }
});

// Quiz
autoRender(c);
mountQuizSet(c.querySelector("#quiz-circ"), [ /* ... */ ]);
```

**CSS necessário:** Adicionar estilos para `.circle-readout`

---

### 4.2 Aula 4 — trig-seno

**Componentes trigVisuals:**
- `mountCircleToGraph()` — 1 instância

**Arquivos a modificar:**
- `features/trigonometria/index.js` — render da aula trig-seno

**Novo código necessário:**
```javascript
// Import
import { mountCircleToGraph } from "../../core/trigVisuals.js";

// No render, antes do labSlot:
c.innerHTML = `
  <div class="lesson-section">
    <div class="al-crumb">Cap 5 · Aula 4</div>
    <h1 class="al-title">Função seno — o movimento que se repete</h1>
    <p>...</p>
  </div>
  
  <div class="def">
    <div class="def-h">f(x) = sen(x) — o que cada número significa</div>
    <ul>...</ul>
  </div>
  
  <div class="lesson-section">
    <h2 class="lesson-h2">Conexão círculo → gráfico</h2>
    <p>Veja como o ponto P no círculo gera o gráfico de seno:</p>
    <div id="ctg-seno" style="width:100%;height:350px;margin:1rem 0;"></div>
  </div>
  
  <div class="lesson-section">
    <h2 class="lesson-h2">Laboratório — explore e modifique</h2>
    ${labSlot("lab-seno")}
  </div>
  
  <div id="quiz-seno"></div>
`;

// Mount do componente
mountCircleToGraph(c.querySelector("#ctg-seno"), {
  functions: ["sin"],
  speed: 1,
  autoPlay: false,
  showLine: true,
});

// Lab existente
mountLab(c.querySelector("#lab-seno"), { /* ... */ });

// Quiz existente
mountQuizSet(c.querySelector("#quiz-seno"), [ /* ... */ ]);
```

**CSS necessário:** Nenhum adicional

---

### 4.3 Aula 5 — trig-cosseno

**Componentes trigVisuals:**
- `mountTrigParamExplorer()` — 1 instância com compare

**Arquivos a modificar:**
- `features/trigonometria/index.js` — render da aula trig-cosseno

**Novo código necessário:**
```javascript
// Import
import { mountTrigParamExplorer } from "../../core/trigVisuals.js";

// No render, substituindo o lab existente:
c.innerHTML = `
  <div class="lesson-section">
    <div class="al-crumb">Cap 5 · Aula 5</div>
    <h1 class="al-title">Função cosseno — igual ao seno, mas diferente no ponto de partida</h1>
    <p>...</p>
  </div>
  
  <div class="def">
    <div class="def-h">A única diferença que importa</div>
    <ul>...</ul>
  </div>
  
  <div class="lesson-section">
    <h2 class="lesson-h2">Comparação seno vs cosseno</h2>
    <p>Use os sliders para explorar os parâmetros e veja a comparação:</p>
    <div id="tpe-cos" style="width:100%;height:400px;margin:1rem 0;"></div>
  </div>
  
  <div id="quiz-cos"></div>
`;

// Mount do componente
mountTrigParamExplorer(c.querySelector("#tpe-cos"), {
  funcType: "cos",
  A: 1, B: 1, C: 0, D: 0,
  showMarkers: true,
  showPeriod: true,
  showRange: true,
  compare: true,  // Mostra sin para comparação
});

// Quiz existente
mountQuizSet(c.querySelector("#quiz-cos"), [ /* ... */ ]);
```

**CSS necessário:** Nenhum adicional

---

### 4.4 Aula 6 — trig-tangente

**Componentes trigVisuals:**
- `mountTangentVis()` — 1 instância

**Arquivos a modificar:**
- `features/trigonometria/index.js` — render da aula trig-tangente

**Novo código necessário:**
```javascript
// Import
import { mountTangentVis } from "../../core/trigVisuals.js";

// No render, antes do labSlot:
c.innerHTML = `
  <div class="lesson-section">
    <div class="al-crumb">Cap 5 · Aula 6</div>
    <h1 class="al-title">Função tangente — a razão entre seno e cosseno</h1>
    <p>...</p>
  </div>
  
  <div class="def">
    <div class="def-h">Definição e intuição geométrica</div>
    <p>...</p>
  </div>
  
  <div class="lesson-section">
    <h2 class="lesson-h2">Visualização da tangente</h2>
    <p>Veja como a tangente é construída no círculo:</p>
    <div id="tv-tan" style="width:100%;height:350px;margin:1rem 0;"></div>
  </div>
  
  <div class="lesson-section">
    <h2 class="lesson-h2">Laboratório</h2>
    ${labSlot("lab-tan")}
  </div>
  
  <div id="quiz-tan"></div>
`;

// Mount do componente
mountTangentVis(c.querySelector("#tv-tan"), {
  showGraph: true,
  initialTheta: Math.PI/4,
});

// Lab existente
mountLab(c.querySelector("#lab-tan"), { /* ... */ });

// Quiz existente
mountQuizSet(c.querySelector("#quiz-tan"), [ /* ... */ ]);
```

**CSS necessário:** Nenhum adicional

---

## 5. ESTRATÉGIA DE AVALIAÇÃO

### 5.1 Aula 1 — Arcos e Ângulos

| Tipo | Descrição | Qtd |
|------|-----------|-----|
| **Quiz** | Múltipla escolha sobre conversão | 3 |
| **Exercício** | Converter radianos → graus | 1 |
| **Exercício** | Calcular comprimento de arco | 1 |

**Medição de compreensão:**
- Taxa de acerto no quiz ≥ 80%
- Capacidade de converter sem calculadora

---

### 5.2 Aula 2 — Círculo Trigonométrico

| Tipo | Descrição | Qtd |
|------|-----------|-----|
| **Quiz** | Coordenadas de P, sinais por quadrante | 3 |
| **Exploração** | Arrastar ponto P e identificar valores | 1 |
| **Desafio** | Encontrar θ tal que sin(θ) = 0.5 | 1 |

**Medição de compreensão:**
- Identificar corretamente o quadrante
- Saber que cos é x e sin é y
- Entender por que raio = 1

---

### 5.3 Aula 3 — Valores Notáveis

| Tipo | Descrição | Qtd |
|------|-----------|-----|
| **Quiz** | Valores de sen/cos em 30°, 45°, 60° | 4 |
| **Exercício** | Reduzir ângulos ao 1º quadrante | 3 |
| **Desafio** | Calcular sen(150°) sem calculadora | 1 |

**Medição de compreensão:**
- Memorizar valores notáveis
- Aplicar regra TSCS (Todos-Seno-Cosseno-Tangente)

---

### 5.4 Aula 4 — Função Seno

| Tipo | Descrição | Qtd |
|------|-----------|-----|
| **Quiz** | Domínio, imagem, período, zeros | 4 |
| **Lab** | Ajustar A para máx = 3, mín = -3 | 1 |
| **Lab** | Reduzir período para π | 1 |
| **Desafio** | Criar seno com fase π/2 | 1 |

**Medição de compreensão:**
- Identificar período = 2π/B
- Saber que imagem é [-1, 1]
- Entender que seno é ímpar

---

### 5.5 Aula 5 — Função Cosseno

| Tipo | Descrição | Qtd |
|------|-----------|-----|
| **Quiz** | Valores em 0, π/2, π, 3π/2 | 4 |
| **Lab** | Verificar cos(x) = sin(x + π/2) | 1 |
| **Desafio** | Criar cosseno com deslocamento | 1 |

**Medição de compreensão:**
- Saber que cos(0) = 1
- Entender que cosseno é par
- Verificar relação com seno

---

### 5.6 Aula 6 — Função Tangente

| Tipo | Descrição | Qtd |
|------|-----------|-----|
| **Quiz** | Por que tan(π/2) não existe, período, imagem | 4 |
| **Lab** | Criar tangente com período π/2 | 1 |
| **Desafio** | Encontrar assíntotas de tan(2x) | 1 |

**Medição de compreensão:**
- Entender que tan = sin/cos
- Saber que período é π
- Identificar assíntotas

---

### 5.7 Aula 7 — Revisão e Simulado

| Tipo | Descrição | Qtd |
|------|-----------|-----|
| **Exercícios** | 11 questões completas | 11 |
| **Cobertura** | Todos os tópicos das aulas 1-6 | - |

**Medição de compreensão:**
- Resolver 80% das questões corretamente
- Aplicar estratégias do resumo final

---

## 6. PREREQUISITOS

### 6.1 Para cada lição

| Lição | Pré-requisitos | Conceitos que constrói | Conexões |
|-------|----------------|----------------------|----------|
| **Aula 1** | Geometria básica (ângulos, círculo) | Radiano, conversão, arco | Base para todas as outras |
| **Aula 2** | Aula 1 (radiano) | Círculo unitário, seno, cosseno | Conecta com Aulas 3-6 |
| **Aula 3** | Aulas 1-2 (conversão, círculo) | Valores exatos, redução | Usado em exercícios |
| **Aula 4** | Aulas 1-3 (valores notáveis) | Função seno, período, amplitude | Comparação com Aula 5 |
| **Aula 5** | Aula 4 (função seno) | Função cosseno, paridade | Relação sin↔cos |
| **Aula 6** | Aulas 4-5 (sin, cos) | Função tangente, assíntotas | Complementa sin/cos |
| **Aula 7** | Todas as aulas anteriores | Revisão integrada | Preparação para avaliação |

### 6.2 Conexões entre lições

```
Aula 1 (Arcos) ──→ Aula 2 (Círculo) ──→ Aula 3 (Notáveis)
                         │                      │
                         ↓                      ↓
                    Aula 4 (Seno) ──→ Aula 5 (Cosseno)
                         │                      │
                         └──────────┬───────────┘
                                    ↓
                            Aula 6 (Tangente)
                                    ↓
                            Aula 7 (Revisão)
```

---

## 7. RESULTADOS DE APRENDIZAGEM

### 7.1 Aula 1 — Arcos e Ângulos

**O aluno saberá:**
- O que é um radiano e por que existe
- A relação 180° = π rad
- Como converter entre graus e radianos

**O aluno será capaz de:**
- Converter qualquer ângulo de graus para radianos e vice-versa
- Calcular comprimento de arco usando ℓ = r·θ

**Conexão com próxima lição:** Usará radianos para medir ângulos no círculo trigonométrico

---

### 7.2 Aula 2 — Círculo Trigonométrico

**O aluno saberá:**
- Que o círculo trigonométrico tem raio 1
- Que P = (cos θ, sin θ)
- A construção geométrica da tangente

**O aluno será capaz de:**
- Identificar o quadrante de um ângulo
- Determinar se sen/cos/tan são positivos ou negativos
- Usar a equação fundamental cos²θ + sin²θ = 1

**Conexão com próxima lição:** Usará valores notáveis do círculo

---

### 7.3 Aula 3 — Valores Notáveis

**O aluno saberá:**
- Os valores de sen/cos/tan para 0°, 30°, 45°, 60°, 90°
- A origem geométrica desses valores
- Como reduzir ângulos ao 1º quadrante

**O aluno será capaz de:**
- Calcular sen/cos de qualquer múltiplo de 30° ou 45°
- Aplicar a regra TSCS para sinais

**Conexão com próxima lição:** Usará valores notáveis para plotar o seno

---

### 7.4 Aula 4 — Função Seno

**O aluno saberá:**
- f(x) = sen(x) tem período 2π, imagem [-1, 1]
- Os 5 pontos que constroem o gráfico
- Que seno é função ímpar

**O aluno será capaz:**
- Esboçar o gráfico de sen(x)
- Determinar período, amplitude e fase
- Modificar parâmetros A, B, C, D

**Conexão com próxima lição:** Comparará com cosseno

---

### 7.5 Aula 5 — Função Cosseno

**O aluno saberá:**
- cos(x) = sen(x + π/2)
- O cosseno é função par
- O gráfico começa no máximo

**O aluno será capaz de:**
- Comparar visualmente seno e cosseno
- Verificar a relação de fase
- Identificar por que cos(0) = 1

**Conexão com próxima lição:** Usará cos para definir tangente

---

### 7.6 Aula 6 — Função Tangente

**O aluno saberá:**
- tan(x) = sin(x)/cos(x)
- Período é π (metade de sin/cos)
- Imagem é ℝ (qualquer valor real)

**O aluno será capaz de:**
- Identificar assíntotas verticais
- Por que tan(π/2) não existe
- Criar tangentes com diferentes períodos

**Conexão com próxima lição:** Revisará todas as funções

---

### 7.7 Aula 7 — Revisão

**O aluno saberá:**
- Todos os tópicos de trigonometria
- Estratégias para o simulado

**O aluno será capaz de:**
- Resolver problemas integrados
- Aplicar múltiplos conceitos simultaneamente

---

## 8. PRIORIDADE DE IMPLEMENTAÇÃO

### 8.1 Essencial (Fase 1)

| Prioridade | Lição | Componente | Justificativa |
|------------|-------|------------|---------------|
| **ALTA** | Aula 2 | TrigCircle | Conceito central da trigonometria |
| **ALTA** | Aula 4 | CircleToGraph | Conexão círculo→gráfico |
| **ALTA** | Aula 5 | TrigParamExplorer | Comparação sin/cos |

### 8.2 Importante (Fase 2)

| Prioridade | Lição | Componente | Justificativa |
|------------|-------|------------|---------------|
| **MÉDIA** | Aula 6 | TangentVis | Complementa sin/cos |
| **MÉDIA** | Aula 1 | Texto + Quiz | Fundamento necessário |
| **MÉDIA** | Aula 3 | Tabela + Quiz | Memorização |

### 8.3 Avançado (Fase 3)

| Prioridade | Lição | Componente | Justificativa |
|------------|-------|------------|---------------|
| **BAIXA** | Aula 7 | Revisão | Consolidar aprendizado |

### 8.4 Trabalho Futuro

| Prioridade | Componente | Descrição |
|------------|------------|-----------|
| **FUTURO** | PeriodicVis | 4 fenômenos periódicos (mola, corrente, temperatura, luz) |
| **FUTURO** | Modo Aula | Integração com professor.html para projeção |

---

## 9. CHECKLIST DE IMPLEMENTAÇÃO

### 9.1 Arquivos a Criar
- [ ] Nenhum (trigVisuals.js e trigVisuals.css já existem)

### 9.2 Arquivos a Modificar
- [ ] `features/trigonometria/index.js` — Atualizar renders das aulas 2, 4, 5, 6
- [ ] `aluno.html` — Adicionar link para trigVisuals.css se necessário

### 9.3 Lições a Atualizar

| Lição | Mudança Principal | Complexidade |
|-------|-------------------|--------------|
| `trig-circulo` | Substituir 4 canvases por mountTrigCircle | MÉDIA |
| `trig-seno` | Adicionar mountCircleToGraph | BAIXA |
| `trig-cosseno` | Substituir lab por mountTrigParamExplorer | MÉDIA |
| `trig-tangente` | Adicionar mountTangentVis | BAIXA |

### 9.4 Testes Manuais

**Aula 2 (TrigCircle):**
- [ ] Drag funciona em desktop e mobile
- [ ] Snap em valores notáveis funciona
- [ ] Readout atualiza em tempo real
- [ ] Projeções sin/cos aparecem
- [ ] Tangente aparece quando |cos| > 0.07

**Aula 4 (CircleToGraph):**
- [ ] Animação play/pause funciona
- [ ] Speed slider afeta velocidade
- [ ] Linha conecta círculo e gráfico
- [ ] Marcadores aparecem no gráfico

**Aula 5 (TrigParamExplorer):**
- [ ] 4 sliders atualizam gráfico
- [ ] Markers de zeros/máx/mín aparecem
- [ ] Modo compare mostra sin e cos
- [ ] Período e imagem são calculados

**Aula 6 (TangentVis):**
- [ ] Segmento AT cresce quando θ → π/2
- [ ] Gráfico de tan sincronizado
- [ ] Assíntotas visíveis

**Geral:**
- [ ] Tema dark/light funciona em todos
- [ ] Mobile layout (single column)
- [ ] HiDPI (canvas nítido em Retina)
- [ ] Nenhum erro no console

---

## 10. MÉTRICAS DE SUCESSO

### 10.1 Engajamento
- Tempo médio nas lições com visuais: > 5 minutos
- Taxa de conclusão dos labs: > 70%
- Interações com TrigCircle: > 10 por sessão

### 10.2 Aprendizagem
- Taxa de acerto no quiz da Aula 2: > 80%
- Taxa de acerto no quiz da Aula 4: > 75%
- Resolução de desafios nos labs: > 60%

### 10.3 Técnico
- Performance: 60fps em todos os visuais
- Compatibilidade: funciona em Chrome, Firefox, Safari
- Mobile: touch funciona corretamente

---

## 11. RESUMO EXECUTIVO

### O que será feito:
1. **Aula 2:** Substituir 4 canvases inline por `mountTrigCircle()`
2. **Aula 4:** Adicionar `mountCircleToGraph()` antes do lab
3. **Aula 5:** Substituir lab por `mountTrigParamExplorer()` com compare
4. **Aula 6:** Adicionar `mountTangentVis()` antes do lab

### O que não será alterado:
- Aulas 1, 3, 7 (mantêm formato atual)
- API do PlotEngine
- API do MathEngine
- Evento themechange
- Estrutura de lições

### Dependências:
- `core/trigVisuals.js` (já existe, ~1750 linhas)
- `styles/trigVisuals.css` (já existe)
- `core/plotEngine.js` (já existe, usado por trigVisuals)

### Riscos:
- **BAIXO:** Componentes são independentes e bem isolados
- **MÉDIO:** Performance com múltiplos canvas (mitigado por HiDPI setup)
- **BAIXO:** Touch events (mitigado por pointer events)

---

**Fim do Plano de Integração Pedagógica**
