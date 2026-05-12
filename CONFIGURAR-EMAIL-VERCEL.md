# 📧 Configurar Email na Vercel - Passo a Passo

## 🎯 Você já está na tela certa!

Você está vendo a seção **"Environment Variables"** na Vercel. Perfeito!

---

## ✅ Passo a Passo - Adicionar Variáveis de Email

### 1. Clique no botão "Add Environment Variable"

No canto superior direito da seção "Environment Variables", clique em **"Add Environment Variable"**.

---

### 2. Adicione a primeira variável: `RESEND_API_KEY`

**Nome da variável:**
```
RESEND_API_KEY
```

**Valor:**
```
re_ULxYQX6x_44RuYQkzYn6gqiY9BW4Bsybd
```

**Environment:**
- Selecione **"Production, Preview, Development"** (ou apenas **"Production"** se preferir)

Clique em **"Save"**.

---

### 3. Adicione a segunda variável: `EMAIL_FROM`

Clique novamente em **"Add Environment Variable"**.

**Nome da variável:**
```
EMAIL_FROM
```

**Valor:**
```
noreply@vestoco.com.br
```

**Environment:**
- Selecione **"Production, Preview, Development"** (ou apenas **"Production"**)

Clique em **"Save"**.

---

### 4. Adicione a variável `NOTIFICATION_EMAIL` (destinatários dos leads)

Clique novamente em **"Add Environment Variable"**.

**Nome da variável:**
```
NOTIFICATION_EMAIL
```

**Valor:**
```
vestocooficial@gmail.com,leozikao50@gmail.com
```

**⚠️ IMPORTANTE:** Os emails separados por vírgula, **SEM espaços** entre eles.

**Environment:**
- Selecione **"Production, Preview, Development"** (ou apenas **"Production"**)

Clique em **"Save"**.

---

## ✅ Resultado Final

Você deve ter **5 variáveis** no total:

1. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (já existe)
2. ✅ `NEXT_PUBLIC_SUPABASE_URL` (já existe)
3. ✅ `RESEND_API_KEY` (nova - adicione)
4. ✅ `EMAIL_FROM` (nova - adicione)
5. ✅ `NOTIFICATION_EMAIL` (nova - adicione)

---

## 🔄 Aplicar as Mudanças

Depois de adicionar as 3 variáveis de email:

1. **Vá na aba "Deployments"** (ou clique no menu lateral)
2. **Encontre o último deploy**
3. **Clique nos 3 pontinhos** (menu) do deploy
4. **Clique em "Redeploy"**
5. **Aguarde** o deploy completar (2-3 minutos)

**OU**

1. Faça um **novo commit** no GitHub
2. A Vercel vai fazer deploy automaticamente

---

## ✅ Pronto!

Depois do redeploy, quando um novo lead chegar:
- ✅ Vai para o grupo "Novos"
- ✅ Email enviado para os 2 endereços:
  - vestocooficial@gmail.com
  - leozikao50@gmail.com

---

## 🧪 Para testar depois do deploy:

1. Adicione um novo lead na planilha do Google Sheets
2. Sincronize os leads no sistema
3. Verifique os 2 emails (e também a pasta de spam)

---

## ⚠️ Dica

Se quiser testar sem fazer um novo commit, use o **"Redeploy"** que aplica as novas variáveis imediatamente!
