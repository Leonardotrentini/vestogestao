# 📧🔔 Configuração de Notificações para Novos Leads

Este guia explica como configurar notificações por **Email** e **WhatsApp** quando novos leads chegarem.

## 🎯 Como Funciona

Quando um **novo lead** é detectado durante a sincronização:
1. ✅ O lead é automaticamente adicionado ao grupo "Novos"
2. 📧 Um email é enviado (se configurado)
3. 📱 Uma mensagem é enviada no WhatsApp (se configurado)

## 📧 Configuração de Email

### Opção 1: Resend (Recomendado - Mais Fácil)

1. **Criar conta no Resend:**
   - Acesse: https://resend.com
   - Crie uma conta gratuita
   - Vá em **API Keys** e crie uma nova chave

2. **Adicionar no `.env.local`:**
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=noreply@seudominio.com
   NOTIFICATION_EMAIL=seu-email@exemplo.com,outro-email@exemplo.com
   ```

3. **Instalar dependência:**
   ```bash
   npm install resend
   ```

### Opção 2: SMTP Direto

1. **Adicionar no `.env.local`:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=seu-email@gmail.com
   SMTP_PASS=sua-senha-app
   EMAIL_FROM=seu-email@gmail.com
   NOTIFICATION_EMAIL=destinatario@exemplo.com
   ```

## 📱 Configuração de WhatsApp

### Opção 1: Twilio (Recomendado)

1. **Criar conta no Twilio:**
   - Acesse: https://www.twilio.com
   - Crie uma conta
   - Ative o WhatsApp Sandbox ou configure WhatsApp Business API
   - Pegue: Account SID, Auth Token, e número do WhatsApp

2. **Adicionar no `.env.local`:**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=seu_auth_token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   WHATSAPP_GROUP_ID=120363123456789012@g.us
   ```

3. **Instalar dependência:**
   ```bash
   npm install twilio
   ```

### Opção 2: Evolution API (Para WhatsApp Business)

1. **Configurar Evolution API:**
   - Siga a documentação: https://evolution-api.com
   - Configure uma instância do WhatsApp

2. **Adicionar no `.env.local`:**
   ```env
   EVOLUTION_API_URL=https://sua-evolution-api.com
   EVOLUTION_API_KEY=sua_chave_api
   EVOLUTION_INSTANCE_NAME=nome_da_instancia
   WHATSAPP_GROUP_ID=120363123456789012@g.us
   ```

## 🔧 Variáveis de Ambiente Completas

Adicione no arquivo `.env.local`:

```env
# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@seudominio.com
NOTIFICATION_EMAIL=email1@exemplo.com,email2@exemplo.com

# OU Email (SMTP)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=seu-email@gmail.com
# SMTP_PASS=sua-senha-app

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
WHATSAPP_GROUP_ID=120363123456789012@g.us

# OU WhatsApp (Evolution API)
# EVOLUTION_API_URL=https://sua-evolution-api.com
# EVOLUTION_API_KEY=sua_chave_api
# EVOLUTION_INSTANCE_NAME=nome_da_instancia
```

## 📝 Como Obter o ID do Grupo WhatsApp

### Para Twilio:
- Use o formato: `whatsapp:+5511999999999` (número individual)
- Para grupos, você precisa usar a API do WhatsApp Business

### Para Evolution API:
1. Conecte sua instância do WhatsApp
2. Use o comando para listar grupos
3. O ID do grupo geralmente é: `120363123456789012@g.us`

## ✅ Testando

1. Configure as variáveis de ambiente
2. Adicione um novo lead na planilha do Google Sheets
3. Sincronize os leads
4. Verifique:
   - Email na caixa de entrada
   - Mensagem no grupo do WhatsApp

## 🎨 Personalização

As mensagens podem ser personalizadas editando:
- `lib/notifications/email.ts` - Template de email
- `lib/notifications/whatsapp.ts` - Template de WhatsApp

## ⚠️ Importante

- **Email**: Você precisa verificar seu domínio no Resend ou usar SMTP válido
- **WhatsApp**: Requer conta ativa no Twilio ou Evolution API configurada
- **Grupo WhatsApp**: O bot precisa estar no grupo e ter permissão para enviar mensagens
