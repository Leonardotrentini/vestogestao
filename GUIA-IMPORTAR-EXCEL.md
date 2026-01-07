# 📊 GUIA: Como Importar Planilha Excel

## ✅ Formato Esperado da Planilha

A planilha Excel deve ter a seguinte estrutura:

### Opção 1: Com Coluna de Grupo (Recomendado)

```
| Grupo         | Nome do Item | Coluna 1 | Coluna 2 | Coluna 3 |
|---------------|--------------|----------|----------|----------|
| Grupo A       | Item 1       | Valor 1  | Valor 2  | Valor 3  |
| Grupo A       | Item 2       | Valor 4  | Valor 5  | Valor 6  |
| Grupo B       | Item 3       | Valor 7  | Valor 8  | Valor 9  |
```

**O que acontece:**
- Primeira coluna = Nome do Grupo
- Segunda coluna = Nome do Item
- Demais colunas = Valores que viram colunas customizadas

### Opção 2: Sem Coluna de Grupo

```
| Nome do Item | Coluna 1 | Coluna 2 | Coluna 3 |
|--------------|----------|----------|----------|
| Item 1       | Valor 1  | Valor 2  | Valor 3  |
| Item 2       | Valor 4  | Valor 5  | Valor 6  |
| Item 3       | Valor 7  | Valor 8  | Valor 9  |
```

**O que acontece:**
- Primeira coluna = Nome do Item
- Todas os itens vão para um grupo chamado "Itens"
- Demais colunas = Valores que viram colunas customizadas

---

## 📋 Exemplo Prático

### Para Campanhas de Marketing:

```
| Campanha              | Status      | Responsável | Orçamento | Data Início |
|-----------------------|-------------|-------------|-----------|-------------|
| Black Friday 2024     | Em andamento| João        | R$ 50.000 | 01/11/2024  |
| Natal 2024            | Planejada   | Maria       | R$ 30.000 | 15/12/2024  |
| Verão 2025            | Planejada   | Pedro       | R$ 40.000 | 01/01/2025  |
```

**Resultado:**
- 3 itens criados
- Grupo: "Itens" (ou crie uma coluna "Grupo" se quiser agrupar)
- 4 colunas: Status, Responsável, Orçamento, Data Início

---

## ⚠️ Regras Importantes

1. **Primeira linha SEMPRE = Cabeçalhos**
   - Não pode estar vazia
   - Cada cabeçalho vira uma coluna

2. **Nome do Item:**
   - Se houver coluna "Grupo": Segunda coluna = Nome do Item
   - Se NÃO houver coluna "Grupo": Primeira coluna = Nome do Item

3. **Linhas vazias são ignoradas**
   - Pode ter linhas em branco, serão puladas

4. **Formato aceito:**
   - `.xlsx` (Excel 2007+)
   - `.xls` (Excel antigo)

---

## 🔧 Como Corrigir Seu Arquivo

### Se você tem campanhas assim:

```
Campanha          Status          Orçamento
Black Friday      Em andamento    R$ 50.000
Natal             Planejada       R$ 30.000
```

### Certifique-se de que:

1. ✅ **Primeira linha tem cabeçalhos** (Campanha, Status, Orçamento)
2. ✅ **Não há linhas completamente vazias no meio**
3. ✅ **Nomes das campanhas não estão vazios**
4. ✅ **Arquivo salvo como .xlsx ou .xls**

---

## 🐛 Problemas Comuns e Soluções

### Erro: "Planilha vazia"
**Solução:** Verifique se há dados abaixo dos cabeçalhos

### Erro: "Formato de arquivo inválido"
**Solução:** 
- Certifique-se que o arquivo é .xlsx ou .xls
- Abra o arquivo no Excel e salve novamente

### Erro: "Não foi possível processar os dados"
**Solução:**
- Verifique se a primeira linha tem cabeçalhos
- Remova fórmulas complexas (substitua por valores)
- Verifique se não há caracteres especiais problemáticos

### Importa mas não aparece nada
**Solução:**
- Verifique se há dados nas linhas (não apenas cabeçalhos)
- Recarregue a página após importar
- Verifique o console do navegador (F12) para erros

---

## 💡 Dicas

1. **Teste com planilha pequena primeiro** (5-10 linhas)
2. **Use cabeçalhos claros** (evite caracteres especiais)
3. **Remova formatação excessiva** antes de importar
4. **Exporte do Excel** (não do Google Sheets direto - salve como .xlsx primeiro)

---

## 📝 Template Exemplo

Crie uma planilha assim para testar:

```
Grupo          | Nome da Tarefa        | Status      | Responsável
--------------|----------------------|-------------|------------
Desenvolvimento| Criar página home    | Em progresso| João
Desenvolvimento| Criar página sobre   | Pendente    | Maria
Marketing      | Campanha Facebook    | Completo    | Pedro
Marketing      | Campanha Instagram   | Em progresso| Ana
```

Salve como `.xlsx` e importe!

---

**Problemas? Verifique o console do navegador (F12) para mais detalhes!**

