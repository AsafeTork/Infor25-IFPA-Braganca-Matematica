# 📋 AUDITORIA COMPLETA - Informática 25

## PROBLEMAS ENCONTRADOS

### 🔴 CRÍTICOS

#### 1. **Professor.html não funciona**
- **Sintoma**: Botões de exemplos não funcionam, não dá pra criar linhas
- **Causa provável**: Erro JavaScript silencioso ou conflito entre async imports
- **Impacto**: Page totalmente não funcional para professor
- **Status**: ❌ NÃO RESOLVIDO

#### 2. **Plot.js _drawUnitCircle() pode ter erro**
- **Linha**: core/plotEngine.js ~225
- **Problema**: Função usa `document.documentElement.getAttribute("data-theme")` que pode não existir
- **Impacto**: Círculo unitário pode não desenhar ou dar erro silencioso
- **Status**: ⚠️ POSSÍVEL

### 🟡 IMPORTANTES

#### 3. **Aluno.css - Cores inconsistentes**
- **Onde**: Caixas pedagógicas (def, box, think, etc)
- **Problema**: Cor laranja `--accent` (#ff6a1a) pode não ser a ideal para a paleta
- **Solicitado**: Mudar para mais amarelado
- **Status**: 🔧 A FAZER

#### 4. **Responsividade de caixas em mobile**
- **Onde**: styles/base.css, styles/explorer.css
- **Problema**: Border-radius ainda pode estar muito redondo em alguns casos
- **Status**: ⚠️ REVISAR

#### 5. **KaTeX renderização ainda pode falhar**
- **Arquivo**: components/katex.js
- **Problema**: `window.katex` pode não estar disponível ainda
- **Status**: ⚠️ MONITORAR

### 🟢 MENORES

#### 6. **Zoom PC não afeta algumas labels**
- **Onde**: aluno.html zoom control
- **Problema**: Labels de botões podem não escalar com zoom
- **Status**: 📌 COSMÉTICO

#### 7. **Sidebar em mobile**
- **Problema**: Pode ficar muito estreita com zoom alto
- **Status**: 📌 COSMÉTICO

---

## ANÁLISE DE DESIGN

### ✅ O QUE ESTÁ LEGAL

1. **Cores laranja** - Elemento destaque (--accent: #ff6a1a)
   - Usado em caixas pedagógicas
   - Botões de ação
   - Muito visível e interessante

2. **Gráfico do professor**
   - Layout bem distribuído
   - Canvas responsivo
   - Leitura clara

3. **Círculo unitário**
   - Conceito bom (sobrepor ao gráfico)
   - Funciona bem em trigonometria

4. **Sidebar colapsável**
   - Mobile-first approach
   - Intuítivo

### ⚠️ O QUE PODE MELHORAR

1. **Cor laranja muito vibrante**
   - Solicitude: Deixar mais amarelado (#ffa500 ou #ffb703)
   - Para harmonizar com paleta da turma

2. **Consistência de spacing**
   - Algumas caixas têm espaçamento inconsistente
   - Título vs conteúdo

3. **Contraste em dark mode**
   - Algumas cores podem ficar muito claras/escuras

4. **Hover states incompletos**
   - Botões de exemplos no professor
   - Links laterais

---

## PALETA DE CORES ATUAL

```css
--accent: #ff6a1a     /* Laranja vibrante */
--accent-2: #ffd23f   /* Amarelo */
--bg: #0a0e27         /* Azul muito escuro (dark) */
--surface: #12182b    /* Azul escuro (dark) */
--text: #e8ecf1       /* Branco azulado */
--border: #2a3549     /* Cinza-azul escuro */
```

**Problema**: --accent (#ff6a1a) é muito laranja puro. Não combina bem com --accent-2 (#ffd23f) que é amarelo.

**Sugestão**: Mudar --accent para algo entre laranja e amarelo:
- #ff9500 (laranja-amarelado)
- #ffab00 (mais amarelado)
- #ffa500 (laranja web standard)

---

## PLANO DE AJUSTES

### PRIORIDADE 1 - CRÍTICO

- [ ] **Debugar professor.html**
  - Adicionar console.log em pontos críticos
  - Verificar se imports estão funcionando
  - Testar cada função separadamente

- [ ] **Revisar _drawUnitCircle() em plotEngine**
  - Adicionar error handling
  - Testar com dark/light mode
  - Garantir que não bloqueia rendering

### PRIORIDADE 2 - IMPORTANTE

- [ ] **Ajustar cores para amarelado**
  - Mudar --accent de #ff6a1a para #ffa500
  - Testar em todos os componentes
  - Revisar contraste

- [ ] **Revisar responsive de caixas**
  - Testar em diferentes tamanhos
  - Ajustar padding/margin se necessário

### PRIORIDADE 3 - COSMÉTICO

- [ ] **Melhorar hover states**
  - Botões de exemplos
  - Links

- [ ] **Testar zoom em todos os tamanhos**
  - Mobile + 200% zoom
  - Desktop + 80% zoom

---

## RECOMENDAÇÕES

1. **Use DevTools do navegador** (F12) para debugar professor
2. **Teste em diferentes conexões** (3G, 4G, WiFi)
3. **Valide HTML/CSS** em w3c.org
4. **Teste acessibilidade** com screen readers
5. **Monitore performance** com Lighthouse

---

