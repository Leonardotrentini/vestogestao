# ✅ Domínio Verificado! Próximos Passos

## 🎉 Parabéns!

Seu domínio `vestoco.com.br` está **verificado** no Resend! ✅

---

## 📝 Agora configure no projeto:

### Passo 1: Criar arquivo `.env.local`

Na **raiz do projeto** (mesma pasta onde está o `package.json`), crie um arquivo chamado `.env.local` com:

```env
# Resend - Email
RESEND_API_KEY=re_ULxYQX6x_44RuYQkzYn6gqiY9BW4Bsybd
EMAIL_FROM=noreply@vestoco.com.br
NOTIFICATION_EMAIL=vestocooficial@gmail.com
```

**Importante:**
- `EMAIL_FROM` deve ser do domínio verificado: `@vestoco.com.br`
- Você pode usar: `noreply@vestoco.com.br`, `contato@vestoco.com.br`, etc.
- `NOTIFICATION_EMAIL` é onde você quer receber as notificações de novos leads

### Passo 2: Reiniciar o servidor

```bash
# Pare o servidor se estiver rodando (Ctrl+C)
npm run dev
```

### Passo 3: Testar

1. Adicione um **novo lead** na planilha do Google Sheets
2. Sincronize os leads no sistema
3. Verifique se recebeu o email em `vestocooficial@gmail.com`

---

## ⚠️ Observação sobre o subdomínio `send`

Vejo que os registros SPF/MX do subdomínio `send.vestoco.com.br` ainda apontam para Amazon SES. 

**Isso não é problema se você usar o domínio principal:**
- ✅ Use: `noreply@vestoco.com.br` (domínio principal verificado)
- ❌ Não use: `noreply@send.vestoco.com.br` (ainda aponta para SES)

---

## 🎯 Resumo da Configuração

```env
RESEND_API_KEY=re_ULxYQX6x_44RuYQkzYn6gqiY9BW4Bsybd
EMAIL_FROM=noreply@vestoco.com.br
NOTIFICATION_EMAIL=vestocooficial@gmail.com
```

**Pronto!** Agora quando um novo lead chegar, você receberá um email automaticamente! 📧
