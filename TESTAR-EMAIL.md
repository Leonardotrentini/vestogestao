# 🧪 Como Testar o Email

## Opção 1: Via Navegador (Mais Fácil)

1. **Certifique-se que o servidor está rodando:**
   ```bash
   npm run dev
   ```

2. **Abra no navegador:**
   ```
   http://localhost:3000/api/test-email
   ```

3. **Você verá uma resposta JSON:**
   - Se funcionou: `{"success": true, "message": "✅ Email de teste enviado com sucesso!"}`
   - Se deu erro: `{"success": false, "message": "❌ Erro..."}`

4. **Verifique sua caixa de entrada** em `vestocooficial@gmail.com`

---

## Opção 2: Via Terminal

```bash
curl http://localhost:3000/api/test-email
```

---

## ⚠️ Se der erro:

1. **Verifique se o `.env.local` existe e tem:**
   ```env
   RESEND_API_KEY=re_ULxYQX6x_44RuYQkzYn6gqiY9BW4Bsybd
   EMAIL_FROM=noreply@vestoco.com.br
   NOTIFICATION_EMAIL=vestocooficial@gmail.com
   ```

2. **Reinicie o servidor:**
   ```bash
   # Pare (Ctrl+C) e rode novamente:
   npm run dev
   ```

3. **Verifique os logs** no terminal para ver o erro específico

---

## 📧 O email de teste terá:

- **Assunto:** 🆕 Novo Lead: João Silva (TESTE)
- **Conteúdo:** Um lead fictício com todos os dados formatados
