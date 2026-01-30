# 🚀 Como Executar as Migrações no Supabase

## ⚠️ PROBLEMA ATUAL
A aplicação está dando erro porque as tabelas não existem no banco de dados do Supabase.

## ✅ SOLUÇÃO: Executar as Migrações SQL

### Passo 1: Acessar o SQL Editor do Supabase

1. Acesse: **https://app.supabase.com**
2. Entre no seu projeto
3. No menu lateral esquerdo, clique em **"SQL Editor"**
4. Clique em **"New Query"** (Nova Consulta)

### Passo 2: Executar a Migração Principal

1. Abra o arquivo: `supabase/migrations/001_initial_schema.sql` no seu computador
2. **Copie TODO o conteúdo** do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (ou pressione **F5**)
5. Aguarde a mensagem de sucesso ✅

### Passo 3: Executar as Outras Migrações (na ordem)

Execute cada arquivo SQL na ordem abaixo:

#### 2. `002_add_column_types.sql`
- Copie o conteúdo
- Cole no SQL Editor
- Clique em **Run**

#### 3. `003_add_board_type.sql`
- Copie o conteúdo
- Cole no SQL Editor
- Clique em **Run**

#### 4. `004_create_admin_user.sql` (opcional)
- Só execute se precisar criar usuário admin

#### 5. `005_create_app_users.sql` (opcional)
- Só execute se precisar criar usuários padrão

#### 6. `006_insert_default_users.sql` (opcional)
- Só execute se precisar inserir usuários padrão

#### 7. `007_add_board_content.sql`
- Execute este

#### 8. `008_add_board_position.sql`
- Execute este

#### 9. `010_add_intelligence_board_type.sql`
- Execute este

### Passo 4: Verificar se Funcionou

1. No Supabase Dashboard, vá em **"Table Editor"** (Editor de Tabelas)
2. Você deve ver as tabelas:
   - ✅ `workspaces`
   - ✅ `boards`
   - ✅ `groups`
   - ✅ `items`
   - ✅ `columns`
   - ✅ `column_values`
   - E outras...

### Passo 5: Testar a Aplicação

1. Volte para: **https://vestogestao.vercel.app**
2. Recarregue a página (F5)
3. Agora deve funcionar! 🎉

---

## 🎯 Migrações Mínimas Necessárias

Se quiser fazer rápido, execute pelo menos estas 3:

1. ✅ `001_initial_schema.sql` - **OBRIGATÓRIO**
2. ✅ `002_add_column_types.sql` - **OBRIGATÓRIO**
3. ✅ `003_add_board_type.sql` - **OBRIGATÓRIO**

As outras são opcionais, mas recomendadas.

---

## ❓ Problemas?

### Erro: "relation already exists"
**Solução:** A tabela já existe. Pule essa migração ou use `DROP TABLE IF EXISTS` antes.

### Erro: "permission denied"
**Solução:** Verifique se você tem permissões de administrador no projeto.

### Erro: "syntax error"
**Solução:** Verifique se copiou o arquivo completo, sem cortar nada.

---

**Depois de executar as migrações, a aplicação deve funcionar! 🚀**
