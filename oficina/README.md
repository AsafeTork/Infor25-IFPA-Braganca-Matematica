# 📄 Oficina — Material de Inscrição

Documentos para inscrição e apresentação da oficina **Matemática Interativa em Sala de Aula**,
baseada na plataforma *Informal25* (IFPA — Campus Bragança · Turma Informática 25).

| Arquivo | Para quê |
|---|---|
| `oficina-proposta.pdf` | **Artefato de submissão.** 15 páginas A4 (inclui o anexo visual com 4 capturas reais da plataforma), pronto para enviar. Gerado em 22/10/2026. |
| `oficina-proposta.html` | Versão viva e editável. Abre offline (fontes embutidas), tem tema claro/escuro e botão de impressão → PDF. |
| `OFICINA_PROPOSTA.md` | Versão em texto puro, para **copiar e colar** em campos de formulário (quando o sistema não aceita PDF) ou editar em outra ferramenta. |
| `CAMPO-PREENCHER.md` | Checklist dos 27 campos que faltam, com a página de cada um. |
| `anexos/` | As 4 capturas de tela da plataforma usadas na seção 13 (também prontas para anexar separadamente). |

---

## Antes de enviar

1. **Preencher os campos `[entre colchetes]`** — data, local, contato, e-mail, indicadores de alcance.
2. **Preencher a tabela da Equipe (seção 07)**: a linha da coordenação e as 2 linhas em branco.
3. **Ajustar a seção 09** (indicadores de alcance) com os números reais da rede.
4. **Anexar** o roteiro do laboratório (anexo 4) e o modelo de plano de aula (anexo 5).
   O anexo 3 (capturas de tela) já está resolvido — seção 13 do documento, arquivos em `anexos/`.
4. **Link da demonstração ao vivo** — já está no ar:
   ```
   https://asafetork.github.io/Infor25-IFPA-Braganca-Matematica/
   ```
   (Publicação automática a cada push na `main`.) A versão do documento da oficina está em
   `/oficina/oficina-proposta.html`.
5. **Anexar** capturas de tela da área do aluno e do professor, o roteiro do laboratório e o modelo de plano de aula.

> O resumo de 200 palavras (seção 00) foi escrito para caber em campo de texto curto do formulário.
> Se o formulário pedir o texto corrido sem formatação, use `OFICINA_PROPOSTA.md`.

---

Ou simplesmente abra `oficina/oficina-proposta.html` e use o botão **Imprimir / PDF** (o CSS de impressão já está configurado para A4).

---

## Regenerar o anexo visual e o PDF

A interface do app vai evoluir — o anexo visual acompanha. Dois comandos:

```bash
./oficina/capturas.sh          # regera as 4 capturas em oficina/anexos/
./oficina/build.sh             # regera o PDF (A4) a partir do HTML
./oficina/build.sh --com-capturas   # os dois de uma vez
```

`capturas.sh` sobe um servidor local, usa o Playwright (já é devDependency do projeto) para esperar o
conteúdo renderizar antes de fotografar, e confere cada imagem — se a tela sair incompleta, repete a
captura até 3 vezes. As capturas referenciam as aulas por âncora (`#pot-inteiro`,
`#trig-movimento-circular`), então continuam válidas enquanto essas aulas existirem.

> Se você mudar o **conteúdo** das telas (não só o visual), ajuste os seletores em
> `oficina/capturar.mjs` — o array `SHOTS` diz o que esperar em cada uma.

---

## Estrutura da proposta

```
00  Resumo — 200 palavras        07  Equipe
01  Justificativa                 08  Recursos necessários
02  Objetivos                     09  Resultados e impacto
03  A solução (a plataforma)      10  Sustentabilidade
04  Metodologia e roteiro         11  Referências
05  Conteúdo programático         12  Anexos
06  Avaliação                     13  Anexo visual
07  Equipe                        14  Declaração e assinatura
```

Os números citados no documento (21 aulas, 105 commits, ~11.200 linhas, 0 dependências de runtime)
foram verificados no repositório em **22/10/2026**.
