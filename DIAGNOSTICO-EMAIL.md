# 🔍 Diagnóstico de Email - Passo a Passo

## ❌ Erro: "Email não foi enviado"

Vamos diagnosticar o problema passo a passo:

---

## ✅ Passo 1: Verificar se o `.env.local` existe e está correto

1. **Abra o arquivo `.env.local`** na raiz do projeto
2. **Verifique se tem estas linhas EXATAS:**

```env
RESEND_API_KEY=re_ULxYQX6x_44RuYQkzYn6gqiY9BW4Bsybd
EMAIL_FROM=noreply@vestoco.com.br
NOTIFICATION_EMAIL=vestocooficial@gmail.com
```

**⚠️ IMPORTANTE:**
- Não pode ter espaços antes ou depois do `=`
- Não pode ter aspas nas variáveis
- A API key deve começar com `re_`

---

## ✅ Passo 2: Reiniciar o servidor (OBRIGATÓRIO)

O Next.js só lê o `.env.local` quando o servidor inicia!

1. **Pare o servidor:**
   - Vá no terminal onde está rodando
   - Pressione `Ctrl + C`

2. **Inicie novamente:**
   ```bash
   npm run dev
   ```

3. **Aguarde** até aparecer "Ready" no terminal

---

## ✅ Passo 3: Testar novamente

1. **Abra no navegador:**
   ```
   http://localhost:3000/api/test-email
   ```

2. **Agora você verá mais detalhes:**
   - Se está configurado ou não
   - Qual serviço está sendo usado
   - Erros específicos

---

## 🔍 Possíveis Problemas e Soluções

### Problema 1: "Nenhum serviço de email configurado"

**Causa:** O `.env.local` não tem as variáveis ou o servidor não foi reiniciado

**Solução:**
1. Verifique o `.env.local`
2. Reinicie o servidor
3. Teste novamente

---

### Problema 2: "Erro ao enviar email via Resend"

**Causa:** API key inválida ou domínio não verificado

**Solução:**
1. Verifique se a API key está correta no Resend
2. Verifique se o domínio está verificado (status verde)
3. Verifique se o `EMAIL_FROM` usa o domínio verificado (`@vestoco.com.br`)

---

### Problema 3: Email enviado mas não chega

**Causa:** Pode estar na pasta de spam

**Solução:**
1. Verifique a pasta de spam/lixo eletrônico
2. Verifique se o email está correto em `NOTIFICATION_EMAIL`

---

## 📋 Checklist Rápido

- [ ] Arquivo `.env.local` existe na raiz do projeto
- [ ] `RESEND_API_KEY` está configurado (começa com `re_`)
- [ ] `EMAIL_FROM` usa `@vestoco.com.br` (domínio verificado)
- [ ] `NOTIFICATION_EMAIL` está correto
- [ ] Servidor foi reiniciado após configurar `.env.local`
- [ ] Domínio está verificado no Resend (status verde)
- [ ] Testou novamente após reiniciar

---

## 🆘 Ainda não funciona?

1. **Verifique os logs do servidor** no terminal
2. **Teste novamente** e me mostre a resposta JSON completa
3. **Verifique o console do Resend** para ver se há erros lá
