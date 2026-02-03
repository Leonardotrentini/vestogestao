# 📧 Guia Completo - Configuração de Email para Notificações

## 🎯 Você tem 2 opções. Escolha UMA:

---

## ✅ OPÇÃO 1: Usar RESEND (Mais Fácil - Recomendado)

### Passo 1: Adicionar registros DNS do Resend

1. **No painel do Resend** (onde você viu os registros pendentes):
   - Copie TODOS os registros DNS que estão pendentes
   - Você precisa adicionar:
     - **DKIM**: Registro TXT com nome `resend._domainkey`
     - **SPF**: Registro TXT com nome `send` (ou o domínio que você escolheu)

2. **No painel DNS do seu domínio** (onde você gerencia `vestoco.com.br`):
   - Vá na seção de registros DNS
   - **Adicione os registros do Resend**:
     - Tipo: TXT
     - Nome: `resend._domainkey` (ou o que o Resend pedir)
     - Valor: Cole o conteúdo que o Resend forneceu
     - TTL: Auto (ou 14400)
   
   - **Adicione o registro SPF do Resend**:
     - Tipo: TXT
     - Nome: `send` (ou o domínio que você configurou no Resend)
     - Valor: Cole o conteúdo SPF que o Resend forneceu
     - TTL: Auto

3. **Remover ou desativar os registros do Amazon SES** (se existirem):
   - No painel DNS, encontre os registros relacionados ao Amazon SES
   - Remova ou desative temporariamente:
     - Registros MX que apontam para `amazonses.com`
     - Registros TXT com SPF do Amazon SES

4. **Aguardar verificação** (pode levar de 10 minutos a 48 horas):
   - Volte no painel do Resend
   - Os status devem mudar de "Pendente" para "Verificado" ✅

### Passo 2: Configurar no projeto

1. **Criar/editar arquivo `.env.local`** na raiz do projeto:
   ```env
   # Resend
   RESEND_API_KEY=re_ULxYQX6x_44RuYQkzYn6gqiY9BW4Bsybd
   EMAIL_FROM=noreply@send.vestoco.com.br
   NOTIFICATION_EMAIL=vestocooficial@gmail.com
   ```

2. **Instalar dependência** (já está instalada, mas verifique):
   ```bash
   npm install resend
   ```

3. **Pronto!** O código já está configurado para usar Resend.

---

## ✅ OPÇÃO 2: Usar AMAZON SES (Já está configurado no DNS)

### Passo 1: Obter credenciais SMTP do Amazon SES

1. **Acesse o console do Amazon SES**:
   - Vá em: https://console.aws.amazon.com/ses
   - Faça login na sua conta AWS

2. **Criar credenciais SMTP**:
   - No menu lateral, clique em **"SMTP Settings"** ou **"Configurações SMTP"**
   - Clique em **"Create SMTP credentials"** ou **"Criar credenciais SMTP"**
   - Dê um nome (ex: "vestogestao-notifications")
   - Clique em **"Create"**
   - **IMPORTANTE**: Copie e salve:
     - **SMTP Server Name** (ex: `email-smtp.sa-east-1.amazonaws.com`)
     - **Port** (geralmente `587` ou `465`)
     - **SMTP Username** (ex: `AKIAIOSFODNN7EXAMPLE`)
     - **SMTP Password** (ex: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)

### Passo 2: Verificar domínio no SES (se ainda não fez)

1. **No console do SES**:
   - Vá em **"Verified identities"** ou **"Identidades verificadas"**
   - Clique em **"Create identity"**
   - Escolha **"Domain"**
   - Digite: `send.vestoco.com.br` (ou o domínio que você quer usar)
   - Siga as instruções para verificar

### Passo 3: Configurar no projeto

1. **Criar/editar arquivo `.env.local`** na raiz do projeto:
   ```env
   # Amazon SES (SMTP)
   SMTP_HOST=email-smtp.sa-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=AKIAIOSFODNN7EXAMPLE
   SMTP_PASS=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   EMAIL_FROM=noreply@send.vestoco.com.br
   NOTIFICATION_EMAIL=vestocooficial@gmail.com
   ```
   ⚠️ **Substitua** os valores de exemplo pelos seus valores reais do SES!

2. **Instalar dependência nodemailer**:
   ```bash
   npm install nodemailer
   npm install --save-dev @types/nodemailer
   ```

3. **Implementar código SMTP** (preciso fazer isso no código)

---

## 🤔 Qual opção escolher?

### Escolha RESEND se:
- ✅ Quer algo mais simples e rápido
- ✅ Não quer lidar com AWS
- ✅ Pode esperar a verificação DNS (até 48h)
- ✅ Quer interface visual mais amigável

### Escolha AMAZON SES se:
- ✅ Já tem AWS configurado
- ✅ Já tem os registros DNS do SES funcionando
- ✅ Quer usar o que já está configurado
- ✅ Precisa de mais controle e volume maior

---

## ⚠️ IMPORTANTE

**NÃO use ambos ao mesmo tempo!** Escolha UMA opção e siga os passos dessa opção.

Se escolher RESEND, remova os registros do SES.
Se escolher SES, não configure o Resend.

---

## 📝 Depois de configurar

1. **Reinicie o servidor**:
   ```bash
   # Pare o servidor (Ctrl+C)
   npm run dev
   ```

2. **Teste adicionando um novo lead** na planilha e sincronizando

3. **Verifique os logs** no console para ver se o email foi enviado

---

## 🆘 Precisa de ajuda?

- **Resend**: https://resend.com/docs
- **Amazon SES**: https://docs.aws.amazon.com/ses/
