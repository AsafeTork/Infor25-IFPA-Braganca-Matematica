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
- **Quizes** — questões estilo ENEM e vestibular com feedback explicado
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
| Renderização matemática | KaTeX 0.16.9 (CDN) |
| Gráficos | Canvas 2D próprio (`core/plotEngine.js`) |
| Parser matemático | Parser/avaliador próprio (`core/mathEngine.js`) |
| Fontes | Bricolage Grotesque + JetBrains Mono (Google Fonts) |
| Hospedagem | Qualquer servidor estático (GitHub Pages, Render, Netlify…) |

---

## Estrutura de arquivos

```
index.html                  Landing page
aluno.html                  Área do aluno
professor.html              Área do professor

core/
  mathEngine.js             Parser + avaliador de expressões matemáticas
  plotEngine.js             Engine de canvas (gráficos, zoom, pan)
  theme.js                  Tema claro/escuro

components/
  formulaLab.js             Laboratório de fórmulas interativo
  quiz.js                   Sistema de questões com feedback
  unitCircle.js             Círculo trigonométrico interativo
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
  board.css                 Layout do quadro do professor
  explorer.css              Laboratório, quiz, barra de símbolos
  boxes.css                 Caixas pedagógicas (definição, resolução…)
  landing.css               Página inicial

assets/
  logo.svg                  Logo da plataforma
```

---

## Expandir o conteúdo

A arquitetura é modular. Para adicionar um novo capítulo:

1. Crie `features/logaritmos/index.js` no mesmo formato dos outros
2. Importe e registre em `aluno.html`

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
