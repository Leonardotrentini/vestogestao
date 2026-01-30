# 🚀 Como Colocar o Projeto Online (Vercel)

## 📋 Passo a Passo Rápido

### 1️⃣ Fazer Commit das Correções

Primeiro, vamos salvar as correções que fizemos:

```bash
git add .
git commit -m "fix: Corrige erros de TypeScript e build para deploy"
git push
```

### 2️⃣ Acessar a Vercel

1. Acesse: **https://vercel.com**
2. Faça login com sua conta GitHub (ou crie uma conta)
3. Clique em **"Add New Project"** ou **"Import Project"**

### 3️⃣ Conectar o Repositório

1. Selecione o repositório: **`vestogestao`**
2. A Vercel vai detectar automaticamente que é Next.js
3. **NÃO clique em Deploy ainda!** Primeiro configure as variáveis

### 4️⃣ ⚠️ CONFIGURAR VARIÁVEIS DE AMBIENTE (MUITO IMPORTANTE!)

Antes de fazer deploy, você **DEVE** adicionar as variáveis de ambiente:

1. Na tela de configuração, procure por **"Environment Variables"** ou **"Variáveis de Ambiente"**
2. Clique em **"Add"** e adicione estas 3 variáveis:

#### Variável 1:
- **Nome:** `NEXT_PUBLIC_SUPABASE_URL`
- **Valor:** Sua URL do Supabase (ex: `https://xxxxx.supabase.co`)
- **Ambientes:** Marque todos (Production, Preview, Development)

#### Variável 2:
- **Nome:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Valor:** Sua chave anon/public do Supabase
- **Ambientes:** Marque todos

#### Variável 3 (Opcional - só se usar IA):
- **Nome:** `OPENAI_API_KEY`
- **Valor:** Sua chave da OpenAI (se tiver)
- **Ambientes:** Marque todos

#### Como pegar as credenciais do Supabase:

1. Acesse: **https://app.supabase.com**
2. Entre no seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → vai para `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → vai para `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5️⃣ Fazer o Deploy

1. Depois de adicionar as variáveis, clique em **"Deploy"**
2. Aguarde 2-5 minutos enquanto o build roda
3. Se der erro, veja a seção de troubleshooting abaixo

### 6️⃣ Após o Deploy

1. A Vercel vai te dar uma URL (ex: `vestogestao.vercel.app`)
2. Acesse a URL e teste se funciona
3. Se funcionar, você pode configurar um domínio personalizado depois

---

## ✅ Checklist Antes de Fazer Deploy

- [ ] Commit e push das mudanças feitos
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Migrações SQL executadas no Supabase (se ainda não fez)
- [ ] Build local funciona (`npm run build` - já testamos ✅)

---

## 🐛 Problemas Comuns

### Erro: "Build Failed"
**Solução:** 
- Verifique se as variáveis de ambiente estão configuradas
- Veja os logs de build na Vercel para identificar o erro

### Erro: "Cannot connect to Supabase"
**Solução:**
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` está correto
- Verifique se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correto
- Verifique se o projeto do Supabase está ativo

### Erro: "Table does not exist"
**Solução:**
- Execute as migrações SQL no Supabase Dashboard
- Vá em **SQL Editor** e execute os arquivos em `supabase/migrations/`

---

## 📝 Comandos Rápidos

```bash
# 1. Adicionar mudanças
git add .

# 2. Fazer commit
git commit -m "fix: Corrige erros de build para deploy"

# 3. Enviar para o GitHub
git push

# 4. Depois disso, vá na Vercel e faça o deploy!
```

---

## 🎯 Próximos Passos Após Deploy

1. Testar a aplicação online
2. Verificar se consegue criar workspaces e boards
3. Configurar domínio personalizado (opcional)
4. Configurar notificações (se necessário)

---

**Boa sorte! 🚀**
