# Proposta de Inscrição — Oficina

**Título da oficina:** Matemática Interativa em Sala de Aula — prática com a plataforma *Informal25*
**Subtítulo:** Do raciocínio à visualização: a área do aluno e o quadro do professor como instrumentos de aula
**Modalidade:** Oficina (formação prática, com laboratórios hands-on)
**Coordenação:** Asafe Tork — IFPA, Campus Bragança · Turma Informática 25
**Área de conhecimento:** Matemática — Ensino Médio Técnico / Ensino Fundamental

| Campo | Preenchimento |
|---|---|
| Carga horária | 4 h (2 encontros de 2 h) · adaptável para 2 h |
| Público-alvo | Professores de Matemática e áreas afins; estudantes de graduação em Matemática |
| Número de vagas | 30 participantes |
| Pré-requisitos | Noções de função, POWER e trigonometria. Nenhum conhecimento de programação ou de software específico. |
| Data e horário | `[preencher]` |
| Local | `[preencher]` |
| Plataforma | Presencial (laboratório com devices) ou híbrido, com acesso a um computador por participante |
| Contato do proponente | `[preencher e-mail]` |

---

## 0. Resumo curto — 200 palavras (para campo de resumo do formulário)

> O *Informal25* é uma plataforma web de Matemática construída para o 2.º e o 3.º ano do Ensino Médio Técnico em Informática do IFPA Campus Bragança, com 21 aulas interativas distribuídas em quatro capítulos — Potenciação, Função Exponencial, Sequências Numéricas e Trigonometria. A plataforma tem duas áreas: a **Área do Aluno**, onde se estuda a teoria com notação matemática renderizada, exemplos resolvidos e um laboratório de fórmulas que transforma qualquer expressão digitada em um gráfico imediato; e a **Área do Professor**, um quadro de gráficos ao vivo com círculo unitário animado, leitura de valores exatos (π/3, √3/2), ferramentas de anotação sobre o canvas e um Modo Aula para TV e projetor.
>
> A oficina proposta é mão na massa: cada participante trabalha no *Informal25* com o próprio dispositivo, do primeiro contato até a construção de uma aula pronta para a sua turma. A plataforma é estática, sem servidor, sem login e sem licença — instala-se como aplicativo, funciona offline e todo o código-fonte é público. A oficina entrega, como produto final, um plano de aula de 1 aula construído pelos próprios participantes com o apoio da equipe.

---

## 1. Justificativa

O material didático de Matemática que chega à sala é, na maioria das vezes, estático: a figura vem pronta, o exercício vem com resposta, e o aluno precisa reconstruir mentalmente a relação entre os dois. Quando a matéria pede *comparar*, *variar um parâmetro* ou *perceber um comportamento*, a página impressa não responde — é o quadro branco, e nem sempre ele é suficiente.

A Base Nacional Comum Curricular organiza parte das habilidades de Matemática em torno da **representação**:-reading de números e dados em diferentes formatos, do gráfico à tabela, da tabela ao símbolo. Representar bem não é um enfeite do conteúdo; é parte dele.

Três limitações recorrentes na prática da disciplina:

1. **O recurso visual é fixo.** A illustration do livro não muda. Para ver o que acontece quando a base da exponencial passa de 2 para 3, ou quando o ângulo do círculo unitário passa de 45° para 135°, é preciso redesenhar tudo à mão.
2. **A precisão fica a cargo do traço.** Um gráfico desenhado no caderno carrega erros de escala, de quadrante e de intercepto — justamente os erros que a disciplina quer identificar.
3. **A infraestrutura é frágil.** Computador com internet, licença e conta em plataforma educacional não são garantidos. Um celular e uma rede instável são a realidade de grande parte das escolas.

O *Informal25* foi construído para responder exatamente a essas três limitações: é um recurso **manipulável**, **matematicamente exato** e **leve de distribuir** (aplicativo web instalável, funciona offline, sem servidor e sem login). Esta oficina existe para formar professores que possam adotar esse tipo de recurso — e, mais do que isso, para que consigam **construir o seu próprio**, porque o código-fonte é aberto e a arquitetura é simples o suficiente para ser estendida.

A proposta se apoia em uma experiência real: a plataforma já é utilizada no IFPA Campus Bragança com a turma Informática 25, e nasce do trabajo direto em sala de aula, não de um exercício de laboratório.

---

## 2. Objetivos

**Objetivo geral**

Formar professores de Matemática no uso de recursos interativos de visualização e raciocínio matemático, por meio de uma plataforma específica (o *Informal25*), capacitando-os a planejar e conduzir uma aula mediada por gráfico dinâmico.

**Objetivos específicos**

1. Compreender a arquitetura funcional de uma ferramenta de visualização matemática (área de estudo × quadro de projeção), distinguindo o que é do aluno e o que é do professor.
2. Operar a Área do Aluno: teoria interativa, exemplos resolvidos, laboratório de fórmulas com parser próprio e círculo unitário animado.
3. Operar a Área do Professor: múltiplos gráficos com cores distintas, círculo unitário sobreposto ao plano cartesiano, leitura de valores exatos, eixo em π, ferramentas de anotação com camadas e undo/redo.
4. Usar o **Modo Aula**, modo de apresentação para TV e projetor: tela cheia, alto contraste, escala ampliada, atalhos de teclado e download do quadro em PNG.
5. Produzir, em duplas, **um plano de aula de 1 aula** (objetivo, sequência de momentos, material do aluno, material do professor, avaliação), usando o *Informal25* como instrumento.
6. Reconhecer as condições de contorno da ferramenta: o que ela resolve, o que ela não resolve, e como evaluar a tecnologia pelo que ela acrescenta ao raciocínio — e não pela sua estética.

---

## 3. A solução proposta: a plataforma *Informal25*

### 3.1 O que é

Aplicação web estática de Matemática, construída do zero para o 2.º e o 3.º ano do Ensino Médio Técnico em Informática do IFPA Campus Bragança, com base no conteúdo do livro didático da disciplina e inspirada em ferramentas como Desmos, GeoGebra, Brilliant e Khan Academy. O foco declarado do projeto é **raciocínio, interpretação e comportamento matemático** — não a entrega de respostas prontas.

### 3.2 As duas áreas

**Área do Aluno** — ambiente de estudo completo, acessível por celular ou computador:

- **Teoria** com notação matemática renderizada em LaTeX (KaTeX), escrita em linguagem acessível.
- **Definições e propriedades** em caixas visuais tipificadas.
- **Exemplos resolvidos** com passo a passo comentado.
- **Laboratório de fórmulas**: caixa universal onde o aluno digita qualquer expressão e vê o gráfico responder em tempo real — `y = 2^x`, `y = sin(x)`, `y = 3 + (x-1)·5`, `y = x^(3/2)`, `y = 1800·(1.03)^x`.
- **Círculo unitário interativo**, com play/pause, rastro do ponto e leitura ao vivo de seno, cosseno e tangente.
- **Progresso de leitura** das 21 aulas, salvo localmente no navegador.

**Área do Professor** — quadro de gráficos ao vivo, feito para uso em sala:

- **Gráfico interativo** com zoom, deslocamento (pan) e múltiplas fórmulas em cores distintas.
- **Círculo unitário** sobreposto ao plano cartesiano, com *snap* nos ângulos notáveis (π/6, π/4, π/3) e suporte a voltas completas (> 360°).
- **Presets prontos** por tema: Exponencial, Sequências, Trigonometria e Álgebra (incluindo comparações como "2ˣ vs ½ˣ", "PA vs PG", "sin + cos").
- **Leitura de valores exatos** — o cursor exibe `x = π/3` em vez de `x = 1.047`, e `y = √3/2` em vez de `y = 0.866`.
- **Eixo em π**, alternável, para leitura de gráficos periódicos.
- **Ferramentas de anotação** sobre o próprio gráfico: marcador, linha vertical, linha horizontal, área sombreada, triângulo, seta, régua e texto — cada uma com cor própria, em camadas, com undo/redo (`Ctrl+Z` / `Ctrl+Shift+Z`) e remoção por clique duplo.
- **Download do quadro em PNG** de alta resolução, para virar material do aluno.
- **Modo Aula**: tela cheia, tema escuro forçado, escala ampliada para leitura a 3–10 m, barras de interface ocultas e atalhos (`F`, `Esc`, `Espaço`).

### 3.3 Por que é relevante para uma oficina

| Característica | Consequência pedagógica |
|---|---|
| Zero servidor, zero login, zero licença | O professor não depende de contrato de plataforma nem de cadastro de BNCC digital. |
| Service worker + PWA instalável | Funciona **offline**; o celular do aluno vira o laboratório, inclusive na rede da escola que cai. |
| Renderização matemática self-hosted (KaTeX) | Não há dependência de CDN: nada quebra no dia da aula por falta de internet. |
| Gráficos e parser próprios (Canvas 2D) | Comportamento previsível e auditável; nada de dependência de terceiros parar de funcionar. |
| Código-fonte público e documentação | O professor pode **adaptar** a ferramenta à sua realidade — e a oficina ensina a fazer isso. |

### 3.4 Números do projeto

| Indicador | Valor |
|---|---|
| Aulas interativas | 21 (4 capítulos) |
| Capítulos | Potenciação · Função Exponencial · Sequências Numéricas · Trigonometria |
| Áreas da plataforma | 2 (aluno e professor) |
| Commits | 105 |
| Linhas de código (JS + CSS) | ~11.200 |
| Dependências de runtime | 0 |
| Licença / custo para o usuário | 0 |
| Testes automatizados | Smoke test (Playwright) sobre as 3 páginas |

*Indicadores verificados no repositório em 21/10/2026.*

### 3.5 Limites declarados com honestidade

- Sem servidor: não há login, não há banco de dados, não há painel de turma nem estatísticas de uso.
- O progresso do aluno é local ao navegador (por dispositivo), não sincronizado.
- Sem correção automática de exercícios nem banco de questões — o foco é a visualização, não o sistema de resposta.
- Sem painel de acompanhamento da turma (a plataforma não substitui nem disputa espaço com a.assignação digital).

Estes limites são discutidos explicitamente na oficina: uma ferramenta honesta sobre o que não faz ensina mais do que uma ferramenta que promete tudo.

---

## 4. Metodologia

A oficina é **prática, não expositiva**. O modelo segue três princípios:

1. **Aprender fazendo, com o dispositivo na mão desde o minuto 10.** Nenhum bloco de mais de 20 minutos sem o participante estar manipulando algo.
2. **Refletir sobre o artefacto.** Cada momento da oficina termina com a pergunta "o que isso faz com o raciocínio do aluno?" — não com "isso é bonito".
3. **Produzir algoLevo.** Não se sai da oficina com anotações; sai-se com um plano de aula pronto, na máquina de quem vai usá-lo.

**Dinâmicas utilizadas:** demonstração conduzida (projeto no projetor, com o quadro do professor como ferramenta central);Laboratório individual com roteiro de 6 tarefas; duplas de produção; roda de-sharing final; questionário de avaliação antes e depois.

### Roteiro (4 h)

| # | Momento | Min | O que acontece |
|---|---|---|---|
| 0 | Abertura e diagnóstico | 20 | Apresentação do problema (material estático × raciocínio dinâmico), aplicação do questionário pré, contrato da oficina. |
| 1 | Bloco 1 — Fundamentos | 45 | Por que visualizar. Conceitos de gráfico, parâmetro e comportamento. Demonstração ao vivo: o mesmo conteúdo, do papel para o quadro. |
| — | Intervalo | 15 | — |
| 2 | Bloco 2 — Área do Aluno | 45 | Tour pela plataforma: teoria, exemplos resolvidos, laboratório de fórmulas (tarefas: exponencial, PA vs PG, `y = x^(3/2)`), círculo unitário animado, marcação de progresso. |
| 3 | Bloco 3 — Área do Professor | 45 | Quadro ao vivo: presets, múltiplos gráficos, círculo unitário sobreposto, leitura de valores exatos, eixo em π, ferramentas de anotação, download em PNG, **Modo Aula** para o projetor. |
| 4 | Bloco 4 — Oficina aberta | 45 | Produção em duplas: cada dupla constrói o plano de uma aula de 1 aula com o *Informal25*, usando um conteúdo do próprio planejamento. |
| 5 | Encerramento e continuidade | 25 | Roda de apresentação dos planos (3 min por dupla), questionário pós, prazos de acompanhamento e comunidade de uso. |
| | **Total** | **240** | |

**Adaptação para 2 h:** Bloco 1 reduzido a 20 min, Bloco 2 a 30 min, Bloco 3 a 35 min, Bloco 4 a 25 min, abertura 10 min, encerramento 10 min.

### Adaptação para o contexto do IFPA

Versão de 2 h para a própria escola, com turmas da Informática 25 como público, os participantes sendo os próprios alunos: a oficina ganha o formato de **aula-experiência**, em que o aluno é o operador do quadro e a construção do plano de aula vira o produto da disciplina.

---

## 5. Conteúdo programático

**Módulo 1 — Fundamentos da visualização matemática (45 min)**
- Gráfico como argumento: o que um gráfico afirma e o que ele esconde.
- Parâmetro, comportamento e conjectura: a curva mudando diante do aluno.
- Os quatroIRA e o erro conceitual como objeto de aula.

**Módulo 2 — A Área do Aluno: estudo dirigido e laboratório (45 min)**
- Estrutura de uma aula interativa: teoria → definição → exemplo resolvido → laboratório → desafio.
- O laboratório de fórmulas como espaço de conjectura: `2^x` vs `(1/2)^x`, `y = 3+(x-1)·5`, `y = 1800·(1.03)^x`.
- Círculo unitário animado e a leitura de seno, cosseno e tangente.
- Progresso de leitura e autonomia.

**Módulo 3 — A Área do Professor: o quadro ao vivo (45 min)**
- Presets por tema e a construção de comparações (PA vs PG, bases > 1).
- Múltiplas fórmulas com cores distintas e leitura de valores exatos.
- O círculo unitário como sobreposição do plano cartesiano.
- Anotações sobre o gráfico: marcador, linha vertical e horizontal, área, triângulo, seta, régua, texto — camadas e undo/redo.
- Exportação em PNG como material impresso.
- Modo Aula: escala, contraste, atalhos e a leitura a 10 metros.

**Módulo 4 — Oficina aberta: construção do seu plano de aula (45 min)**
- Escolha do conteúdo e do objetivo do plano.
- Definição dos momentos da aula e do papel de cada ferramenta.
- Elaboração do material do aluno e do professor.
- Avaliação e registro das decisões.

---

## 6. Avaliação

**Instrumentos**

| Momento | Instrumento | Métrica |
|---|---|---|
| Antes | Questionário de 6 itens (diagnóstico de fluência com gráficos, familiaridade com ferramentas digitais, percepções sobre aula dinâmica) | Escala Likert 1–5 |
| Durante | Observação das duplas durante o Módulo 4 + lista de verificação do roteiro | Binário (concluída / não concluída) |
| Depois | Questionário de 6 itens (mesmos itens + percepção de utilidade e intenção de uso) | Escala Likert 1–5 + 1 item aberto |
| Produto | Plano de aula entregue em arquivo editável | Rubrica de 4 critérios: coerência didática, adequação do recurso, viabilidade com os recursos da escola, clareza do material do aluno |

**Critérios de sucesso da oficina**

1. 100 % dos participantes conclude o roteiro do laboratório.
2. 100 % das duplas entrega um plano de aula.
3. Aumento de, no mínimo, **1 ponto** na média dos itens pré/pós sobre "consigo interpretar e descrever o comportamento de uma função a partir de seu gráfico".
4. Ao menos 60 % dos respondentes declaram intenção de uso da ferramenta na sua turma no semestre seguinte.
5. Nenhum participante relata barreira técnica de instalação como obstáculo à continuidade.

**Acompanhamento pós-oficina**

- Grupo de mensagens para troca de materiais e dúvidas (criado no fim da oficina).
-(repoitório público como espaço deissues e de compartilhamento de planos de aula.
- Check-in em 45 dias: convite para apresentar o que efetivamente foi usado em sala.

---

## 7. Equipe

| Nome | Função na oficina | Vínculo / formação | Responsabilidade |
|---|---|---|---|
| **Asafe Tork** | Coordenação | IFPA — Campus Bragança · Professor de Informática | Concepção e desenvolvimento da plataforma; condução dos Módulos 1 e 3; coordenação geral |
| `[NOME COMPLETO]` | `[FUNÇÃO — ex.: Conteúdo matemático]` | `[VÍNCULO]` | `[RESPONSABILIDADE — ex.: curadoria do conteúdo de Trigonometria e Sequências]` |
| `[NOME COMPLETO]` | `[FUNÇÃO — ex.: Apoio pedagógico]` | `[VÍNCULO]` | `[RESPONSABILIDADE — ex.: tutoria do laboratório e acompanhamento dos grupos]` |
| `[NOME COMPLETO]` | `[FUNÇÃO — ex.: Design / multimídia]` | `[VÍNCULO]` | `[RESPONSABILIDADE — ex.: impressão, slides e registro da oficina]` |

*Preencher a tabela conforme a equipe confirmada. A coordenação se responsabiliza por manter o 비율 entre formadores e participantes em, no máximo, 1 formador para cada 15 participantes durante os módulos hands-on.*

---

## 8. Recursos necessários

**Para o proponente**

- Computador e projetor (ou TV) para a demonstração ao vivo — a tela do professor é parte essencial do método.
- Som e microfone sem fio (opcional, para os 30 participantes).
- Um computador por participante, ou a possibilidade de que cada um use o próprio dispositivo (celular ou notebook).
- Rede com internet **ou** pendrive com uma cópia local da plataforma (funciona offline por design).
- Folha de roteiro do laboratório impressa (1 por participante) e modelo de plano de aula (1 por dupla).

**Para o participante**

- Notebook ou celular com navegador moderno (Chrome, Edge, Firefox ou Safari).
- Nenhum software adicional, nenhuma conta, nenhuma licença.

**Custo estimado aos participantes:** nenhum.

---

## 9. Resultados esperados e impacto

**Immediate (ao fim da oficina)**

- 30 participantes capazes de operar as duas áreas da plataforma de forma autônoma.
- 15 planos de aula prontos (um por dupla), imediatamente aplicáveis.
- Materiais de aula em formato digital e em PNG exportado, prontos para impressão.

**Médio (no semestre seguinte)**

- Adoção da ferramenta por um grupo de professores, com material compartilhado no repositório.
- Início de um banco colaborativo de planos de aula, mantido pela comunidade.

**Longo**

- A plataforma como referência de material didático do Campus Bragança e, por ser de código aberto e sem custos, replicável em qualquer rede pública.
- Possibilidade de Treatise a plataforma como estudo de caso de desenvolvimento de material didático com IA generativa assistindo o professor — prática já adotada no projeto (o código do *Informal25* foi escrito com assistência de IA, sob curadoria do professor).

**Indicadores de alcance** `[preencher com dados do campus]`

| Indicador | Valor |
|---|---|
| Escolas alcançadas na rede | `[preencher]` |
| Professores formados | `[preencher]` |
| Alunos alcançados indiretamente | `[preencher]` |

---

## 10. Sustentabilidade e continuidade

- **Código-fonte público** no repositório da plataforma, com licença livre e histórico de commits completo — ninguém fica dependente de uma fornecedor ou de uma ordem de serviço.
- **Documentação viva**: o repositório contém a especificação técnica, o guia de expansão de conteúdo e as instruções de publicação. A criação de um novo capítulo é uma tarefa de uma tarde, documentada passo a passo.
- **Hospedagem sem custo**: publicação estática em GitHub Pages ou qualquer servidor de arquivos; sem servidor de aplicação, sem banco de dados, sem plano de assinatura.
- **Manutenção distribuída**: o modelo é o da comunidade de usuários — quem precisar de um capítulo novo, o constrói; o material volta para o conjunto.
- **Fim do apoio técnico**: a oficina inclui explicitamente a formação para **publicar uma versão própria** da ferramenta, para que o professor não fique refém da plataforma original.

---

## 11. Referências

BRASIL. Ministério da Educação. *Base Nacional Comum Curricular: Ensino Médio*. Brasília: MEC, 2018.

BRASIL. Ministério da Educação. *Base Nacional Comum Curricular: Ensino Fundamental*. Brasília: MEC, 2018.

IFPA — Instituto Federal do Estado do Pará. *Campus Bragança*. Documento didático da disciplina de Matemática — Ensino Médio Técnico em Informática. `[indicar o título exato e o ano da edição]`

Khan Academy. *Mathematics*. Disponível em: https://www.khanacademy.org. Acesso em: 21 out. 2026.

Desmos Studio. *Graphing Calculator*. Disponível em: https://www.desmos.com/calculator. Acesso em: 21 out. 2026.

GeoGebra. *GeoGebra Classroom*. Disponível em: https://www.geogebra.org/classroom. Acesso em: 21 out. 2026.

BRILLIANT. *Interactive learning platform*. Disponível em: https://brilliant.org. Acesso em: 21 out. 2026.

`Asafe Tork. Informal25 — Plataforma web de Matemática para o Ensino Médio Técnico. IFPA Campus Bragança. Código-fonte: https://github.com/AsafeTork/Infor25-IFPA-Braganca-Matematica.`

---

## 12. Anexos

1. **Demonstração ao vivo:** `[link da demonstração publicada — a publicar antes da submissão]`
2. **Repositório do código-fonte:** https://github.com/AsafeTork/Infor25-IFPA-Braganca-Matematica
3. **Capturas de tela** da Área do Aluno e da Área do Professor `[anexar]`
4. **Roteiro do laboratório** (tarefas práticas por módulo) `[anexar]`
5. **Modelo de plano de aula** entregue no Módulo 4 `[anexar]`

---

## 13. Declaração e assinatura

Declaro que as informações acima são verdadeiras e que a equipe assume o compromisso de conducting a oficina conforme o roteiro apresentado, atendendo aos requisitos de infraestrutura e de acessibilidade descritos.

<br>

| | |
|---|---|
| **Coordenação da proposta** | `[NOME COMPLETO]` |
| **Instituição** | `[INSTITUIÇÃO]` |
| **Local e data** | `[LOCAL]`, `[DIA]` de `[MÊS]` de `[ANO]` |
| **Assinatura** | ______________________________________ |
