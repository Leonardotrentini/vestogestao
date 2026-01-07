# 🚀 GUIA: Como Criar e Testar o Quadro de Inteligência

## 📋 Passo 1: Aplicar Migration SQL

### No Supabase Dashboard:

1. **Acesse o Supabase Dashboard**
   - Vá em: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New Query**

3. **Cole e Execute esta Migration:**

```sql
-- Migration: 010_add_intelligence_board_type.sql
-- Adicionar tipo 'intelligence' aos boards

ALTER TABLE boards DROP CONSTRAINT IF EXISTS boards_type_check;

ALTER TABLE boards ADD CONSTRAINT boards_type_check 
  CHECK (type IN ('board', 'document', 'mindmap', 'intelligence'));
```

4. **Execute o SQL**
   - Clique em **Run** (ou pressione F5)
   - Deve aparecer: "Success. No rows returned"

✅ **Pronto! O tipo 'intelligence' está disponível**

---

## 📋 Passo 2: Criar um Board de Inteligência

Você tem **2 opções** para criar o board:

### Opção A: Via Interface (Precisa adicionar a opção no formulário)

**Temporariamente, vamos criar direto no banco:**

1. **No SQL Editor do Supabase, execute:**

```sql
-- Substitua 'SEU_WORKSPACE_ID' pelo ID do seu workspace
-- Você pode encontrar o ID na URL quando está no workspace

INSERT INTO boards (name, description, workspace_id, user_id, type)
VALUES (
  'Quadro de Inteligência',
  'Dashboard de Analytics e Performance',
  'SEU_WORKSPACE_ID',  -- SUBSTITUA AQUI
  '00000000-0000-0000-0000-000000000000',  -- ID padrão ou seu user_id
  'intelligence'
)
RETURNING id, name;
```

**O resultado mostrará o ID do board criado. Anote esse ID!**

### Opção B: Adicionar opção no formulário de criação

Vou atualizar o formulário de criação de boards para incluir a opção "Inteligência".

---

## 📋 Passo 3: Acessar e Testar

1. **Acesse o board criado:**
   - URL: `http://localhost:3000/workspaces/SEU_WORKSPACE_ID/boards/ID_DO_BOARD`
   - Ou clique no board na sidebar

2. **Você verá:**
   - Dashboard completo de analytics
   - Cards de métricas (KPIs)
   - Gráficos de performance
   - Painel de insights de IA

3. **Funcionalidades para testar:**
   - ✅ Seletor de período (Hoje, Última Semana, Este Mês, Este Trimestre)
   - ✅ Botão "Recalcular" para atualizar métricas
   - ✅ Botão "Gerar Insight" no painel de IA
   - ✅ Cards mostrando KPIs da empresa

---

## 📋 Passo 4: Verificar se está Funcionando

### Testar API diretamente:

1. **Teste KPIs da Empresa:**
```
GET http://localhost:3000/api/analytics/company-kpis?workspaceId=SEU_WORKSPACE_ID&period=monthly
```

2. **Teste Performance Individual (se tiver userId):**
```
GET http://localhost:3000/api/analytics/user-performance?userId=SEU_USER_ID&period=monthly
```

3. **Teste Insights:**
```
GET http://localhost:3000/api/analytics/insights?workspaceId=SEU_WORKSPACE_ID
```

---

## 🐛 Troubleshooting

### Problema: Board não aparece na sidebar
**Solução:** Recarregue a página ou verifique se o board foi criado corretamente

### Problema: Erro ao carregar métricas
**Solução:** Verifique:
- Se o workspaceId está correto
- Se há dados no banco (tarefas, itens, etc.)
- Console do navegador para ver erros

### Problema: Gráficos não aparecem
**Solução:** Verifique se há dados suficientes. Gráficos aparecem apenas com dados.

### Problema: "Nenhum dado disponível"
**Solução:** Crie algumas tarefas e atribua para usuários para ter dados de teste.

---

## 💡 Dicas

1. **Para ter dados de teste:**
   - Crie alguns boards normais
   - Adicione grupos e itens
   - Atribua tarefas para usuários
   - Use time tracking
   - Mude status das tarefas

2. **Para ver métricas interessantes:**
   - Crie pelo menos 10-20 tarefas
   - Complete algumas tarefas (status = "Finalizado")
   - Registre tempo trabalhado
   - Crie comentários

3. **Cache:**
   - Métricas são cacheadas por 1 hora
   - Use "Recalcular" para forçar atualização

---

## ✅ Checklist de Teste

- [ ] Migration SQL aplicada com sucesso
- [ ] Board criado com type='intelligence'
- [ ] Dashboard carrega sem erros
- [ ] Cards de KPIs aparecem (mesmo que com zeros)
- [ ] Seletor de período funciona
- [ ] Botão "Recalcular" funciona
- [ ] Painel de IA aparece
- [ ] Botão "Gerar Insight" funciona (cria placeholder)

---

## 🎯 Próximos Passos

Depois de testar, você pode:
1. Adicionar mais visualizações
2. Integrar IA real (OpenAI/Anthropic)
3. Criar ranking de usuários
4. Adicionar filtros avançados

---

**Dúvidas? Verifique os logs do console do navegador e do terminal!**

