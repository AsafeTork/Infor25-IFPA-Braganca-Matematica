# Informática 25 · matemática

Plataforma web estática de aprendizagem matemática — inspirada em Brilliant, Desmos,
GeoGebra e Khan Academy, construída sobre o conteúdo do livro da professora.
Foco em **raciocínio, interpretação e comportamento matemático**, não em respostas prontas.

Cobre os dois primeiros blocos do livro:

- **Capítulo 1 — Potenciação** (propriedades, expoente inteiro/racional/irracional, notação científica, comparação de potências, raízes)
- **Capítulo 2 — Função Exponencial** (conceito, gráfico, crescimento × decrescimento, comparação com o linear, aplicações reais, equações exponenciais)

## Como é (e o que não é)

Não é uma calculadora gráfica nem um app infantil. É um ambiente de estudo com
teoria, visualização, interpretação, prática guiada, **prática livre com caixa
universal de fórmulas**, exercícios do livro, questões estilo ENEM/vestibular e desafios.

A caixa universal aceita expressões matemáticas reais e atualiza o gráfico em tempo real:

```
y = 2^x        y = π^x        y = (1/2)^x
y = x^(3/2)    y = A·sin(Bx + C) + D    y = 10^x
```

Sem sliders: os parâmetros são editados como **texto matemático**. Eixos com π,
radianos, frações e símbolos corretos.

## Estrutura

```
index.html          Landing page (logo + Aluno / Professor)
aluno.html          Área do aluno — aulas, teoria, prática, exercícios
professor.html      Área do professor — quadro de fórmulas ao vivo
core/               mathEngine (parser), plotEngine (canvas), theme
components/         formulaLab (caixa universal), quiz, katex
features/           potenciacao/ e exponencial/ — conteúdo das aulas
utils/              helpers de conteúdo pedagógico
styles/             tokens (tema claro/escuro), base, landing, content, board, explorer
assets/             logo.svg de fallback
```

Tudo é **estático**: HTML + CSS + JavaScript (ES Modules). Não há build, bundler
ou backend. KaTeX e as fontes são carregados via CDN.

## Logo

A landing tenta carregar `logo.png`, `logo.jpg`, `logo.jpeg`, `logo.svg`, `logo.webp`
na raiz do projeto e, por fim, `assets/logo.svg`. **Para usar a sua logo**, basta
colocar um arquivo chamado `logo.png` (ou `.svg`) na raiz do repositório.

## Como subir no GitHub e publicar

1. Crie um repositório novo no GitHub (ex.: `informatica25`).
2. Envie todos os arquivos desta pasta para a raiz do repositório:

   ```bash
   git init
   git add .
   git commit -m "Plataforma Informática 25 — matemática"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/informatica25.git
   git push -u origin main
   ```

3. No GitHub: **Settings → Pages → Source: `main` / root** e salve.
4. Em ~1 minuto o site fica disponível em
   `https://SEU-USUARIO.github.io/informatica25/`.

> Os módulos ES (`import`) exigem ser servidos por HTTP. GitHub Pages faz isso.
> Para testar localmente, **não** abra o arquivo direto (`file://`); rode um
> servidor simples:
>
> ```bash
> python3 -m http.server 8000
> # abra http://localhost:8000
> ```

## Expansão

A arquitetura é modular: cada tópico do livro é um arquivo em `features/<tema>/index.js`
que exporta uma lista de aulas. Para adicionar logaritmos ou outros capítulos, crie
`features/logaritmos/index.js` no mesmo formato e importe-o em `aluno.html`.
