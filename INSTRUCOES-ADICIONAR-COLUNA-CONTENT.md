# 🔧 INSTRUÇÕES: Adicionar Coluna 'content' no Supabase

## ❌ ERRO ATUAL
```
Could not find the 'content' column of 'boards' in the schema cache
```

## ✅ SOLUÇÃO

A coluna `content` precisa ser adicionada na tabela `boards` do Supabase. Existe uma migration para isso, mas ela precisa ser executada.

---

## 📋 MÉTODO 1: Executar Migration Individual (RECOMENDADO)

### Passo 1: Acessar Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)

### Passo 2: Executar Migration
1. Clique em **New Query**
2. Copie e cole o seguinte SQL:

```sql
-- Adicionar coluna content na tabela boards para armazenar conteúdo de documentos
ALTER TABLE boards ADD COLUMN IF NOT EXISTS content TEXT;
```

3. Clique em **Run** (ou pressione Ctrl+Enter / Cmd+Enter)
4. Aguarde a mensagem de sucesso: "Success. No rows returned"

### Passo 3: Verificar
1. Vá em **Table Editor** → **boards**
2. Verifique se a coluna `content` aparece na lista de colunas
3. Ou execute no SQL Editor:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'boards' 
AND column_name = 'content';
```

Se retornar uma linha com `content` e `text`, está correto! ✅

---

## 📋 MÉTODO 2: Verificar Todas as Migrations

Se quiser garantir que todas as migrations estão aplicadas, execute todas em ordem:

### Migration 003: Adicionar tipo
```sql
-- Add type field to boards table
ALTER TABLE boards ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'board' CHECK (type IN ('board', 'document'));

-- Update existing boards to have type 'board'
UPDATE boards SET type = 'board' WHERE type IS NULL;
```

### Migration 007: Adicionar content
```sql
-- Adicionar coluna content na tabela boards para armazenar conteúdo de documentos
ALTER TABLE boards ADD COLUMN IF NOT EXISTS content TEXT;
```

---

## 🚨 IMPORTANTE

- O comando usa `IF NOT EXISTS`, então é seguro executar mesmo se a coluna já existir
- Não haverá perda de dados
- Após executar, o erro deve desaparecer e você poderá criar quadros do tipo "documento"

---

## ✅ DEPOIS DE EXECUTAR

1. Recarregue a aplicação
2. Tente criar um novo quadro tipo "DOCUMENTO"
3. O erro não deve mais aparecer
4. O quadro deve ser criado com sucesso e abrir o editor de texto

---

## 🆘 SE AINDA DER ERRO

1. Verifique se você está no projeto correto do Supabase
2. Verifique se tem permissões de administrador
3. Tente fazer refresh do schema cache (geralmente é automático, mas pode levar alguns segundos)
4. Execute novamente a query de verificação


