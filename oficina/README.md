# 📄 Oficina — Material de Inscrição

Documentos para inscrição e apresentação da oficina **Matemática Interativa em Sala de Aula**,
baseada na plataforma *Informal25* (IFPA — Campus Bragança · Turma Informática 25).

| Arquivo | Para quê |
|---|---|
| `oficina-proposta.pdf` | **Artefato de submissão.** 12 páginas A4, pronto para enviar/colar no sistema de inscrição. Gerado em 21/10/2026. |
| `oficina-proposta.html` | Versão viva e editável. Abre offline (fontes embutidas), tem tema claro/escuro e botão de impressão → PDF. |
| `OFICINA_PROPOSTA.md` | Versão em texto puro, para **copiar e colar** em campos de formulário (quando o sistema não aceita PDF) ou editar em outra ferramenta. |

---

## Antes de enviar

1. **Preencher os campos `[entre colchetes]`** — data, local, contato, e-mail, indicadores de alcance.
2. **Preencher a tabela da Equipe (seção 07)** com os nomes e funções dos integrantes. Há 3 linhas em branco prontas.
3. **Ajustar a seção 09** (indicadores de alcance) com os números reais da rede.
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

## Como regerar o PDF

```bash
# a partir da raiz do repositório
python3 -m http.server 8811 --bind 127.0.0.1 &
/opt/google/chrome/chrome --headless=new --no-sandbox --disable-gpu \
  --virtual-time-budget=8000 --no-pdf-header-footer \
  --print-to-pdf=oficina/oficina-proposta.pdf \
  "http://127.0.0.1:8811/oficina/oficina-proposta.html"
```

Ou simplesmente abra `oficina/oficina-proposta.html` e use o botão **Imprimir / PDF** (o CSS de impressão já está configurado para A4).

---

## Estrutura da proposta

```
00  Resumo — 200 palavras        07  Equipe
01  Justificativa                 08  Recursos necessários
02  Objetivos                     09  Resultados e impacto
03  A solução (a plataforma)      10  Sustentabilidade
04  Metodologia e roteiro         11  Referências
05  Conteúdo programático         12  Anexos
06  Avaliação                     13  Declaração e assinatura
```

Os números citados no documento (21 aulas, 105 commits, ~11.200 linhas, 0 dependências de runtime)
foram verificados no repositório em **21/10/2026**.
