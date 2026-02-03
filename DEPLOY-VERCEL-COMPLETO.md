# 🚀 Guia Completo de Deploy na Vercel

## 📋 Passo a Passo Completo

### 1. **Preparar o Projeto**

#### 1.1. Verificar se o build funciona localmente:

```bash
npm run build
```

Se der erro, corrija antes de fazer deploy.

---

### 2. **Conectar com a Vercel**

#### 2.1. Criar conta na Vercel:
- Acesse: https://vercel.com
- Faça login com GitHub (recomendado)

#### 2.2. Importar projeto:
1. Clique em **"Add New Project"**
2. Conecte seu repositório do GitHub
3. Selecione o repositório `vestogestao`
4. Clique em **"Import"**

---

### 3. **Configurar Variáveis de Ambiente (CRÍTICO)**

Na tela de configuração do projeto, clique em **"Environment Variables"** e adicione:

#### 3.1. **Variáveis do Supabase (Obrigatórias):**

```
NEXT_PUBLIC_SUPABASE_URL
```
**Valor:** Sua URL do Supabase  
**Exemplo:** `https://vdaquwghrifnuwvlnglj.supabase.co`

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
**Valor:** Sua chave anon/public do Supabase  
**Exemplo:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Como pegar:**
1. Acesse: https://app.supabase.com
2. Vá em **Settings > API**
3. Copie **Project URL** e **anon public key**

---

#### 3.2. **Variáveis do Resend (Email - Obrigatórias):**

```
RESEND_API_KEY
```
**Valor:** Sua chave API do Resend  
**Exemplo:** `re_ULxYQX6x_44RuYQkzYn6gqiY9BW4Bsybd`

**Como pegar:**
1. Acesse: https://resend.com
2. Vá em **API Keys**
3. Copie sua chave (ou crie uma nova)

```
EMAIL_FROM
```
**Valor:** Email remetente (deve ser do domínio verificado)  
**Exemplo:** `noreply@vestoco.com.br`

```
NOTIFICATION_EMAIL
```
**Valor:** Emails que receberão notificações (separados por vírgula)  
**Exemplo:** `vestocooficial@gmail.com,leozikao50@gmail.com,model.gustavoo@gmail.com`

---

#### 3.3. **Variáveis Opcionais (se estiver usando):**

```
OPENAI_API_KEY
```
**Valor:** Sua chave da OpenAI (se usar funcionalidades de IA)

```
GEMINI_API_KEY
```
**Valor:** Sua chave do Google Gemini (se usar)

---

#### 3.4. **Variáveis de WhatsApp (Opcional - se configurar depois):**

```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_FROM
WHATSAPP_GROUP_ID
```

**OU**

```
EVOLUTION_API_URL
EVOLUTION_API_KEY
EVOLUTION_INSTANCE_NAME
WHATSAPP_GROUP_ID
```

---

### 4. **Configurações do Projeto na Vercel**

#### 4.1. Framework Preset:
- ✅ **Next.js** (detectado automaticamente)

#### 4.2. Build Settings:
- **Build Command:** Deixe em branco (usa `next build` por padrão)
- **Output Directory:** Deixe em branco (usa `.next` por padrão)
- **Install Command:** Deixe em branco (usa `npm install` por padrão)

#### 4.3. Root Directory:
- Deixe em branco (raiz do projeto)

---

### 5. **Deploy**

1. Clique em **"Deploy"**
2. Aguarde o build completar (2-5 minutos)
3. Acompanhe os logs em tempo real

---

### 6. **Após o Deploy**

#### 6.1. Verificar se funcionou:
- Acesse a URL fornecida pela Vercel
- Teste se a aplicação carrega
- Teste criar um workspace/board

#### 6.2. Verificar emails:
- Adicione um novo lead na planilha
- Sincronize os leads
- Verifique se os emails foram enviados

---

## 📋 Checklist Completo

Antes de fazer deploy, confirme:

### Variáveis de Ambiente:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `RESEND_API_KEY` configurada
- [ ] `EMAIL_FROM` configurada (domínio verificado)
- [ ] `NOTIFICATION_EMAIL` configurada (3 emails separados por vírgula)

### Banco de Dados:
- [ ] Migrações SQL executadas no Supabase
- [ ] Realtime habilitado no Supabase (opcional mas recomendado)

### Build:
- [ ] Build local funciona (`npm run build`)
- [ ] Sem erros de TypeScript
- [ ] Sem erros de lint (`npm run lint`)

---

## ⚠️ Problemas Comuns e Soluções

### Erro: "NEXT_PUBLIC_SUPABASE_URL is not defined"
**Solução:** Adicione a variável de ambiente na Vercel

### Erro: "Failed to fetch" ou erros de conexão
**Solução:**
- Verifique se a URL do Supabase está correta
- Verifique se o projeto do Supabase está ativo
- Verifique se as políticas RLS estão configuradas

### Erro: "Table does not exist"
**Solução:** Execute as migrações SQL no Supabase

### Erro: "Email não foi enviado"
**Solução:**
- Verifique se `RESEND_API_KEY` está configurada
- Verifique se `EMAIL_FROM` usa domínio verificado
- Verifique se o domínio está verificado no Resend

### Build falha
**Solução:**
1. Teste localmente: `npm run build`
2. Verifique se todas as dependências estão no `package.json`
3. Verifique se não há erros de TypeScript
4. Verifique os logs de build na Vercel

---

## 🔄 Atualizar Variáveis de Ambiente

Se precisar atualizar variáveis depois do deploy:

1. Vá em **Settings > Environment Variables**
2. Edite ou adicione as variáveis
3. Clique em **"Redeploy"** para aplicar as mudanças

---

## 📝 Resumo das Variáveis Obrigatórias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@vestoco.com.br
NOTIFICATION_EMAIL=vestocooficial@gmail.com,leozikao50@gmail.com,model.gustavoo@gmail.com
```

---

## 🔗 Links Úteis

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **Resend Dashboard:** https://resend.com
- **Documentação Next.js:** https://nextjs.org/docs
- **Documentação Vercel:** https://vercel.com/docs

---

## ✅ Pronto!

Depois de configurar tudo, seu sistema estará online e funcionando! 🎉
