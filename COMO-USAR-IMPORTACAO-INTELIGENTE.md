# 🤖 Como Usar a Importação Inteligente com IA

## ⚙️ Configuração Inicial (IMPORTANTE)

### 1. Adicionar API Key

Abra o arquivo `.env.local` na raiz do projeto e adicione:

```env
OPENAI_API_KEY=sua_api_key_aqui
```

**Se o arquivo não existir**, crie um arquivo chamado `.env.local` na raiz com:

```env
# OpenAI
OPENAI_API_KEY=sua_api_key_aqui
```

### 2. Reiniciar o Servidor

Após adicionar a key, **reinicie o servidor**:
1. Pare o servidor (Ctrl+C)
2. Rode novamente: `npm run dev`

---

## 🚀 Como Usar

### Passo 1: Acessar Importação

1. Vá em: **Novo Quadro**
2. Role até a seção **"Ou importe um quadro"**
3. Clique no botão: **"🤖 Importação Inteligente com IA"**

### Passo 2: Enviar Arquivo

1. Clique em **"Clique para selecionar ou arraste o arquivo aqui"**
2. Selecione seu arquivo Excel (`.xlsx` ou `.xls`)

### Passo 3: Descrever o Que Você Quer

No campo de descrição, escreva em texto livre:

**Exemplo:**
```
Tenho campanhas de marketing com:
- Nome da campanha
- Status (ativa, inativa, planejada)
- Orçamento
- Alcance e resultados
- Data de início

Quero ver:
- Gráfico de pizza mostrando status das campanhas
- Gráfico de barras com orçamento por campanha
- Ranking das top 10 campanhas por alcance
- Separar campanhas por tipo
```

### Passo 4: Analisar com IA

1. Clique em **"🤖 Analisar com IA"**
2. Aguarde alguns segundos
3. A IA vai analisar seu arquivo e descrição

### Passo 5: Revisar Briefing

Você verá um briefing detalhado mostrando:

- ✅ **O que foi entendido** - Resumo dos dados
- 📊 **Estrutura sugerida** - Como será organizado
- 📋 **Colunas que serão criadas** - Lista de todas as colunas
- 📈 **Visualizações que serão criadas** - Gráficos e tabelas
- 💡 **Recomendações** - Sugestões da IA

### Passo 6: Confirmar

1. Revise o briefing
2. Se estiver OK, clique em **"✅ Confirmar e Criar"**
3. Se quiser ajustar, clique em **"✏️ Ajustar Descrição"**

### Passo 7: Pronto!

O board será criado automaticamente com:
- ✅ Todos os grupos configurados
- ✅ Todas as colunas criadas
- ✅ Todos os dados importados
- ✅ Visualizações configuradas

---

## 💡 Dicas

### Boa Descrição:
✅ **Específica e detalhada**
```
"Tenho vendas mensais por região com:
- Região (Norte, Sul, etc)
- Valor total
- Quantidade de vendas
- Mês

Quero:
- Gráfico de pizza por região
- Gráfico de linhas mostrando evolução mensal
- Ranking de regiões por valor"
```

### Descrição Ruim:
❌ **Muito genérica**
```
"Dados de vendas"
```

### O Que A IA Entende:

1. **Estrutura dos dados** - Colunas e tipos
2. **Agrupamento** - Como separar em grupos
3. **Visualizações** - Que gráficos fazer
4. **Métricas** - O que é importante medir

---

## 🎯 Exemplos de Uso

### Campanhas de Marketing:
```
"Campanhas com nome, status, orçamento, alcance e resultados.
Quero gráficos de status e ranking de performance."
```

### Vendas:
```
"Vendas por vendedor com data, produto, valor e quantidade.
Separar por mês e mostrar gráfico de evolução."
```

### Clientes:
```
"Clientes com nome, status (ativo/inativo), valor mensal,
data de início. Quero ver distribuição de status e total de receita."
```

---

## 🐛 Troubleshooting

### Erro: "API Key não configurada"
**Solução:** Verifique se adicionou `OPENAI_API_KEY` no `.env.local` e reiniciou o servidor

### Erro: "Erro ao analisar arquivo"
**Solução:** 
- Verifique se o arquivo não está corrompido
- Tente um arquivo menor primeiro
- Verifique se há dados na planilha

### Briefing não faz sentido
**Solução:**
- Melhore a descrição (seja mais específico)
- Clique em "Ajustar Descrição" e tente novamente
- Adicione mais detalhes sobre o que você quer

---

## ✅ Pronto!

Agora você pode importar qualquer planilha e a IA vai criar tudo automaticamente baseado na sua descrição!

