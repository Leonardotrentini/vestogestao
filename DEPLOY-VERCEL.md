# 🚀 Guia Completo de Deploy na Vercel

## 📋 Configuração Passo a Passo

### 1. **Configurações Básicas do Projeto**

Na tela de configuração do projeto na Vercel:

- ✅ **Framework Preset:** `Next.js` (já está correto)
- ✅ **Root Directory:** `./` (já está correto)
- ✅ **Build Command:** Deixe em branco (usa o padrão do Next.js)
- ✅ **Output Directory:** Deixe em branco (usa o padrão do Next.js)
- ✅ **Install Command:** Deixe em branco (usa `npm install` por padrão)

### 2. **Variáveis de Ambiente (CRÍTICO)**

Clique em **"Variáveis de ambiente"** e adicione:

#### Variáveis Obrigatórias:

```
NEXT_PUBLIC_SUPABASE_URL
```
**Valor:** Sua URL do Supabase (ex: `https://xxxxx.supabase.co`)

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
**Valor:** Sua chave anon/public do Supabase

#### Como pegar essas variáveis:

1. Acesse o **Supabase Dashboard**
2. Vá em **Settings > API**
3. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. **Configurações de Build (Opcional mas Recomendado)**

Clique em **"Configurações de compilação e saída"**:

- **Node.js Version:** `18.x` ou `20.x` (recomendado)
- **Build Command:** Deixe padrão (`next build`)
- **Output Directory:** Deixe padrão (`.next`)

### 4. **Antes de Fazer o Deploy**

#### ✅ Verificar se o banco está configurado:

1. No Supabase Dashboard, vá em **SQL Editor**
2. Execute todas as migrações na ordem:
   - `001_initial_schema.sql`
   - `002_add_notifications.sql` (se existir)
   - `003_add_board_type.sql`
   - `004_create_admin_user.sql` (se necessário)
   - `005_create_app_users.sql` (se necessário)

#### ✅ Verificar se o Realtime está habilitado:

1. No Supabase Dashboard, vá em **Database > Replication**
2. Habilite replicação para:
   - `groups`
   - `items`
   - `column_values`
   - `comments`
   - `notifications` (se existir)

### 5. **Fazer o Deploy**

1. Clique em **"Implantar"**
2. Aguarde o build completar (2-5 minutos)
3. Se houver erros, verifique:
   - Se as variáveis de ambiente estão corretas
   - Se o build está passando localmente (`npm run build`)
   - Console de erros na Vercel

### 6. **Após o Deploy**

1. Acesse a URL fornecida pela Vercel
2. Teste se a aplicação carrega
3. Verifique se consegue criar workspaces e boards

## ⚠️ Problemas Comuns e Soluções

### Erro: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Solução:** Verifique se adicionou as variáveis de ambiente na Vercel

### Erro: "Failed to fetch" ou erros de conexão

**Solução:** 
- Verifique se a URL do Supabase está correta
- Verifique se o projeto do Supabase está ativo
- Verifique se as políticas RLS (Row Level Security) estão configuradas

### Erro: "Table does not exist"

**Solução:** Execute as migrações SQL no Supabase

### Build falha

**Solução:**
1. Teste localmente: `npm run build`
2. Verifique se todas as dependências estão no `package.json`
3. Verifique se não há erros de TypeScript

## 📝 Checklist Final

Antes de fazer deploy, confirme:

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Migrações SQL executadas no Supabase
- [ ] Realtime habilitado no Supabase
- [ ] Build local funciona (`npm run build`)
- [ ] Não há erros de lint (`npm run lint`)

## 🔗 Links Úteis

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **Documentação Next.js:** https://nextjs.org/docs
- **Documentação Supabase:** https://supabase.com/docs










