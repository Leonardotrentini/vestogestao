# 🔗 Como Conectar com Google Sheets

## 📋 Pré-requisitos

1. **Criar Service Account no Google Cloud**
2. **Compartilhar planilha com o Service Account**
3. **Configurar variáveis de ambiente**

---

## 🚀 Passo a Passo

### 1. Criar Service Account no Google Cloud

1. Acesse: https://console.cloud.google.com
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** → **Credentials**
4. Clique em **Create Credentials** → **Service Account**
5. Preencha:
   - **Name**: `vestogestao-sheets`
   - **Description**: `Service account para conectar com Google Sheets`
6. Clique em **Create and Continue**
7. Pule a etapa de roles (não precisa)
8. Clique em **Done**

### 2. Criar e Baixar a Chave JSON

1. Na lista de Service Accounts, clique no que você criou
2. Vá na aba **Keys**
3. Clique em **Add Key** → **Create new key**
4. Selecione **JSON**
5. Clique em **Create**
6. O arquivo JSON será baixado automaticamente

### 3. Extrair Credenciais do JSON

Abra o arquivo JSON baixado e copie:

- **`client_email`** → vai para `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- **`private_key`** → vai para `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

### 4. Compartilhar Planilha com o Service Account

1. Abra sua planilha do Google Sheets
2. Clique em **Compartilhar** (Share)
3. Cole o email do Service Account (o `client_email` do JSON)
4. Dê permissão de **Visualizador** (Viewer)
5. Clique em **Enviar**

### 5. Configurar Variáveis de Ambiente

#### No `.env.local` (local):

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=seu-service-account@projeto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Importante:** A `private_key` deve estar entre aspas e com `\n` para quebras de linha.

#### Na Vercel (produção):

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `vestogestao`
3. Vá em **Settings** → **Environment Variables**
4. Adicione:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` = email do service account
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` = chave privada (com `\n`)

### 6. Obter o ID da Planilha

1. Abra sua planilha do Google Sheets
2. Olhe a URL:
   ```
   https://docs.google.com/spreadsheets/d/[ID_AQUI]/edit
   ```
3. Copie o `[ID_AQUI]` - esse é o `spreadsheetId`

### 7. Conectar no Dashboard

1. Crie um board do tipo **Dashboard**
2. Clique em **Configurar Metas**
3. Cole o ID da planilha
4. Clique em **Conectar**
5. Pronto! Os dados serão carregados automaticamente

---

## 📊 Estrutura da Planilha

Sua planilha deve ter estas 3 abas:

### Aba `[DB] Leads`
Colunas esperadas:
- `lead_status` - Status do lead
- `qualificado` - SIM/NÃO
- `ad_name` - Nome da campanha
- `created_time` - Data de criação
- `responsavel` - Nome do responsável

### Aba `[INPUT] Investimento`
Colunas esperadas:
- `Data` - Data do investimento
- `Campanha` - Nome da campanha
- `Valor_Investido` - Valor em R$

### Aba `[CONFIG] Metas`
Estrutura:
- Coluna A: Nome da métrica (ex: `Meta_CPL`, `Meta_CPQL`)
- Coluna B: Valor da meta (ex: `15.00`, `45.00`)

---

## ✅ Testar

1. Após configurar, acesse o dashboard
2. Os dados devem ser carregados automaticamente
3. Os filtros devem funcionar
4. As métricas devem ser calculadas em tempo real

---

## 🐛 Problemas Comuns

### Erro: "Permission denied"
**Solução:** Verifique se compartilhou a planilha com o email do Service Account

### Erro: "Invalid credentials"
**Solução:** Verifique se as variáveis de ambiente estão corretas

### Erro: "Spreadsheet not found"
**Solução:** Verifique se o ID da planilha está correto

---

**Pronto! Agora você pode conectar sua planilha do Google Sheets ao dashboard! 🎉**
