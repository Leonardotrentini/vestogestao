# ⚠️ INSTRUÇÕES IMPORTANTES - Executar no Supabase

## 🚨 ANTES DE CONTINUAR - Execute os SQLs abaixo

Você precisa executar **2 arquivos SQL** no Supabase na ordem correta:

---

## 📋 PASSO 1: Executar Migration 001 (Se ainda não executou)

1. Acesse: https://supabase.com/dashboard
2. Vá no seu projeto
3. Clique em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Abra o arquivo: `supabase/migrations/001_initial_schema.sql`
6. Copie **TODO** o conteúdo
7. Cole no SQL Editor
8. Clique em **Run** (ou pressione F5)
9. Aguarde a mensagem de sucesso

---

## 📋 PASSO 2: Executar Migration 002 (NOVO - IMPORTANTE!)

Este SQL adiciona os novos tipos de coluna necessários para os quadros:

1. No mesmo **SQL Editor** do Supabase
2. Clique em **New Query** (ou limpe o editor)
3. Abra o arquivo: `supabase/migrations/002_add_column_types.sql`
4. Copie **TODO** o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** (ou pressione F5)
7. Aguarde a mensagem de sucesso

Este SQL adiciona os tipos:
- `currency` - Para valores monetários (R$)
- `link` - Para URLs e links
- `long_text` - Para textos longos (feedback)

---

## ✅ Verificar se funcionou

Após executar ambos os SQLs, você deve ter:
- Todas as tabelas criadas
- Tipos de coluna expandidos

---

## 🚀 Depois de executar os SQLs

1. **Reinicie o servidor** (se estiver rodando):
   ```powershell
   # Pare com Ctrl+C
   npm run dev
   ```

2. **Teste criar uma área de trabalho** - Agora deve funcionar!

3. **Os quadros serão criados automaticamente** com os dados de exemplo quando você acessar a aplicação pela primeira vez.

---

## ❓ Problemas?

Se der erro ao executar os SQLs:
- Verifique se está no projeto correto do Supabase
- Verifique se a Migration 001 foi executada primeiro
- Copie e cole o erro aqui para eu ajudar

---

**Execute os 2 SQLs e me avise quando terminar!** 🎯


