# Plano de Reestruturação — Capítulo 5: Funções Trigonométricas

## Objetivo
Reestruturar o conteúdo do Capítulo 5 com títulos e legendas que referenciam o assunto (sem dizer "Capítulo 5"), integrando as 5 novas visualizações interativas e seguindo melhores práticas de aprendizagem interativa com gráficos.

## Estrutura de Títulos e Legendas

### Título Principal: "O Círculo e as Ondas: Funções Trigonométricas"
### Subtítulo: "Explorando a Matemática do Movimento Periódico"

## Estrutura das Aulas (8 aulas)

### Aula 1: "Movimento Circular: Da Terra aos Pêndulos"
- **Legenda**: "Como o movimento repetitivo se transforma em matemática"
- **Conteúdo**: Exemplos do mundo real (rotação da Terra, rodas-gigantes, pêndulos)
- **Visualização interativa**: Arrastar slider para ver movimento circular ao longo do tempo
- **Conceitos**: Introdução ao movimento periódico, relação entre ângulo e tempo

### Aula 2: "O Círculo Trigonométrico: Nosso Mapa de Referência"
- **Legenda**: "O guia fundamental para entender seno, cosseno e tangente"
- **Conteúdo**: Introdução ao círculo unitário com ângulos rotulados
- **Visualização interativa**: Clicar no círculo para ver coordenadas e valores de ângulo
- **Conceitos**: Coordenadas (x,y) = (cos θ, sin θ), relação com o raio unitário

### Aula 3: "Ângulos em Qualquer Posição: Indo Além de 90°"
- **Legenda**: "Ângulos na posição padrão e como encontrar equivalentes"
- **Conteúdo**: Ângulos na posição padrão, ângulos coterminal
- **Visualização interativa**: Arrastar ponto ao redor do círculo para explorar todos os quadrantes
- **Conceitos**: Ângulos negativos, ângulos maiores que 360°, coterminal

### Aula 4: "A Função Seno: A Altura do Movimento"
- **Legenda**: "Como a posição vertical se transforma em uma função"
- **Conteúdo**: Seno como coordenada y no círculo unitário
- **Visualização interativa**: Conectar círculo unitário ao gráfico da onda senoidal
- **Conceitos**: Período, amplitude, imagem [-1,1], valores notáveis

### Aula 5: "A Função Cosseno: A Distância Horizontal"
- **Legenda**: "O companheiro do seno — mesma forma, ponto de partida diferente"
- **Conteúdo**: Cosseno como coordenada x no círculo unitário
- **Visualização interativa**: Conectar círculo unitário ao gráfico da onda cosseno
- **Conceitos**: Relação seno-cosseno, paridade, deslocamento de fase

### Aula 6: "A Função Tangente: A Razão Sinusoidal"
- **Legenda**: "A função que não tem limites — e por quê"
- **Conteúdo**: Tangente como razão seno/cosseno
- **Visualização interativa**: Explorar a linha tangente no círculo unitário
- **Conceitos**: Assíntotas verticais, período π, imagem ℝ

### Aula 7: "Periocidade: O Ritmo das Funções Trigonométricas"
- **Legenda**: "Como as ondas se repetem e se transformam"
- **Conteúdo**: Período, amplitude, deslocamento de fase, translação vertical
- **Visualização interativa**: Ajustar parâmetros para ver transformações de onda
- **Conceitos**: Forma geral y = A·sen(Bx + C) + D, transformações

### Aula 8: "Aplicações: Ondas Sonoras, Luz e Movimento"
- **Legenda**: "A trigonometria no mundo real — som, luz e marés"
- **Conteúdo**: Aplicações no mundo real: ondas sonoras, luz, marés
- **Visualização interativa**: Manipular parâmetros de onda para corresponder a fenômenos reais
- **Conceitos**: Frequência, amplitude em contextos reais, síntese de som

## Melhores Práticas Aplicadas

### 1. Teoria da Aprendizagem Multimedia (Mayer)
- **Codificação dupla**: Informação apresentada visualmente e verbalmente
- **Proximidade temporal**: Texto e gráficos adjacentes
- **Contingência espacial**: Elementos relacionados próximos uns dos outros

### 2. Representações Múltiplas (Ainsworth)
- **Conexões explícitas**: Entre representações simbólicas e gráficas
- **Restrição**: Uma representação pode restringir a interpretação de outra
- **Construção**: Combinando representações para entender mais profundamente

### 3. Interação e Exploração
- **Manipulação direta**: Estudantes podem arrastar, clicar, ajustar parâmetros
- **Feedback imediato**: Respostas visuais às ações dos estudantes
- **Exploração guiada**: Atividades estruturadas com objetivos claros

### 4. Progressão Pedagógica
- **Concreto → Abstrato**: Começar com exemplos do mundo real
- **Múltiplas representações**: Visual, simbólico e verbal
- **Estruturas progressivas**: Quebrar conceitos complexos em partes gerenciáveis

## Integração das Visualizações Interativas

### Componentes do `core/trigVisuals.js`:
1. **TrigCircle** → Aulas 2, 3, 4, 5, 6
2. **CircleToGraph** → Aulas 4, 5
3. **TrigParamExplorer** → Aula 7
4. **TangentVis** → Aula 6
5. **PeriodicVis** → Aulas 7, 8

### Integração:
- Cada aula terá pelo menos uma visualização interativa
- As visualizações serão integradas usando `mountTrigCircle`, `mountCircleToGraph`, etc.
- As visualizações existentes no arquivo atual serão substituídas pelas novas versões

## Estrutura do Arquivo

```javascript
// Metadados atualizados
export const trigonometriaMeta = { 
  num: "05", 
  title: "O Círculo e as Ondas", 
  subtitle: "Funções Trigonométricas",
  chapter: "Funções Trigonométricas" 
};

// 8 aulas reestruturadas
export const trigonometriaLessons = [
  // Aula 1: Movimento Circular
  // Aula 2: O Círculo Trigonométrico
  // Aula 3: Ângulos em Qualquer Posição
  // Aula 4: A Função Seno
  // Aula 5: A Função Cosseno
  // Aula 6: A Função Tangente
  // Aula 7: Periocidade
  // Aula 8: Aplicações
];
```

## Pendências Documentadas (Serão Abordadas)

1. **Código morto**: `components/unitCircle.js` e root `plotEngine.js` nunca são importados
2. **Bugs CSS**: `tokens.css` linha 82 (`#fbf6 ea` → `#fbf6ea`), `base.css` linha 112 (`}` órfã)
3. **Segurança**: `parseAngle()` usa construtor `Function()` (eval equivalente)
4. **Acessibilidade**: Faltam rótulos ARIA em elementos interativos
5. **Touch mobile**: Plot engine usa eventos `mousedown`/`wheel` que não funcionam em touch
6. **Capítulos ausentes**: Capítulos 3 e 4 estão faltando na sidebar
7. **CSS não utilizados**: `landing.css` e `content.css` nunca são linkados
8. **Estilos inline**: 77+ atributos de estilo inline em trigonometria/index.js

## Próximos Passos

1. Criar novo arquivo `features/trigonometria/index.js` com a estrutura reestruturada
2. Integrar as 5 novas visualizações interativas
3. Aplicar melhores práticas de aprendizagem interativa
4. Testar e validar a implementação
5. Endereçar pendências documentadas
