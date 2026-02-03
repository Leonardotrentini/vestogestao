# 📧 Passo a Passo - Configurar Resend (O que você está fazendo agora)

## 🎯 Situação Atual

Você está na tela do Resend que pede para adicionar registros DNS. Vejo que:
- ✅ Você já tem registros DNS do Amazon SES configurados
- ⚠️ O Resend precisa dos próprios registros DNS
- ❓ Você precisa adicionar os registros do Resend

---

## ✅ O QUE FAZER AGORA (Passo a Passo)

### Passo 1: Copiar os registros DNS do Resend

Na tela do Resend que você está vendo, você tem:

1. **Verificação de domínio (DKIM)**:
   - Tipo: TXT
   - Nome: `resend._domainkey`
   - Conteúdo: (um texto longo que começa com `p=MIGfMA0GCSqGSIb3DQEB...`)
   - Status: Pendente

2. **Ativar envio (SPF)**:
   - Registro 1:
     - Tipo: MX
     - Nome: `send`
     - Conteúdo: `feedback-smtp.sa-east-...`
     - Prioridade: 10
   - Registro 2:
     - Tipo: TXT
     - Nome: `send`
     - Conteúdo: `v=spf1 include:amazons...`

**COPIE TODOS ESSES VALORES!**

---

### Passo 2: Adicionar no painel DNS do seu domínio

1. **Acesse o painel DNS** onde você gerencia `vestoco.com.br`

2. **Adicionar registro DKIM do Resend**:
   - Clique em "Adicionar registro" ou "Novo registro"
   - Tipo: **TXT**
   - Nome: `resend._domainkey` (ou `resend._domainkey.send.vestoco.com.br` - depende do seu painel)
   - Valor/Conteúdo: Cole o texto completo que o Resend forneceu
   - TTL: Auto (ou 14400)
   - Salvar

3. **Adicionar registro MX do Resend** (se o Resend pedir):
   - Tipo: **MX**
   - Nome: `send` (ou `send.vestoco.com.br`)
   - Prioridade: **10**
   - Valor/Destino: Cole o valor que o Resend forneceu (provavelmente algo como `feedback-smtp.sa-east-1.amazonses.com`)
   - Salvar

4. **Adicionar registro TXT SPF do Resend**:
   - Tipo: **TXT**
   - Nome: `send` (ou `send.vestoco.com.br`)
   - Valor/Conteúdo: Cole o texto SPF que o Resend forneceu (começa com `v=spf1 include:...`)
   - Salvar

---

### Passo 3: O que fazer com os registros do Amazon SES?

**IMPORTANTE**: Você tem 2 opções:

#### Opção A: Remover os registros do SES (Recomendado)
- Se você vai usar **APENAS Resend**, remova os registros do Amazon SES
- Isso evita conflitos

#### Opção B: Manter ambos (Avançado)
- Você pode manter ambos, mas precisa garantir que não há conflito
- O SPF pode ter múltiplos includes, mas é mais complexo

**Para começar, recomendo a Opção A** (remover SES se não estiver usando)

---

### Passo 4: Aguardar verificação

1. **Salve todos os registros DNS**
2. **Aguarde de 10 minutos a 48 horas** para propagação DNS
3. **Volte no Resend** e verifique se os status mudaram de "Pendente" para "Verificado" ✅

---

### Passo 5: Configurar no projeto

Depois que o Resend verificar o domínio:

1. **Criar/editar `.env.local`** na raiz do projeto:
   ```env
   RESEND_API_KEY=re_ULxYQX6x_44RuYQkzYn6gqiY9BW4Bsybd
   EMAIL_FROM=noreply@send.vestoco.com.br
   NOTIFICATION_EMAIL=vestocooficial@gmail.com
   ```

2. **Pronto!** O código já está configurado.

---

## ⚠️ DÚVIDAS COMUNS

### "Onde adiciono os registros?"
- No mesmo painel DNS onde você viu os registros do Amazon SES
- Provavelmente no seu provedor de domínio (Registro.br, GoDaddy, etc.)

### "Preciso remover os registros do SES?"
- Se não está usando SES, sim, remova para evitar conflito
- Se está usando SES, pode manter, mas é mais complexo

### "Quanto tempo demora?"
- DNS pode levar de 10 minutos a 48 horas
- Geralmente leva 1-2 horas

### "Como sei se funcionou?"
- No Resend, os status vão mudar de "Pendente" (amarelo) para "Verificado" (verde) ✅

---

## 🆘 Precisa de ajuda?

Se tiver dúvida sobre:
- Onde adicionar os registros → Me mostre a tela do seu painel DNS
- Qual valor colar → Me mostre a tela do Resend novamente
- Se está certo → Me mostre como ficou depois de adicionar
