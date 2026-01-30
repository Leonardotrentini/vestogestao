# 🔗 Como Conectar com Google Sheets (Método Simples)

## ✅ Solução Implementada

Agora você pode simplesmente **colar a URL completa da planilha** e o sistema vai:
- ✅ Extrair o ID automaticamente
- ✅ Conectar sem precisar de Service Account
- ✅ Atualizar dados em tempo real (a cada 30 segundos)

---

## 🚀 Como Usar

### Passo 1: Compartilhar a Planilha

1. Abra sua planilha do Google Sheets
2. Clique no botão **"Compartilhar"** (canto superior direito)
3. Clique em **"Alterar para qualquer pessoa com o link"**
4. Selecione **"Visualizador"**
5. Clique em **"Concluído"**

### Passo 2: Conectar no Dashboard

1. Crie um board do tipo **"Dashboard"**
2. Clique no botão **"Configurar Metas"** (canto superior direito)
3. Cole a **URL completa** da planilha:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   ```
4. Clique em **"Conectar"**
5. Pronto! Os dados serão carregados automaticamente

---

## 📊 Estrutura da Planilha

Sua planilha deve ter estas 3 abas (com ou sem colchetes):

### Aba `[DB] Leads` ou `DB Leads`
Colunas esperadas:
- `lead_status` - Status do lead
- `qualificado` - SIM/NÃO
- `ad_name` - Nome da campanha
- `created_time` - Data de criação
- `responsavel` - Nome do responsável

### Aba `[INPUT] Investimento` ou `INPUT Investimento`
Colunas esperadas:
- `Data` - Data do investimento
- `Campanha` - Nome da campanha
- `Valor_Investido` - Valor em R$

### Aba `[CONFIG] Metas` ou `CONFIG Metas`
Estrutura:
- Coluna A: Nome da métrica (ex: `Meta_CPL`, `Meta_CPQL`)
- Coluna B: Valor da meta (ex: `15.00`, `45.00`)

---

## ⚡ Atualização em Tempo Real

O dashboard atualiza automaticamente a cada **30 segundos** quando uma planilha está conectada.

Você também pode:
- Usar os **filtros** (data, campanha, responsável) para atualizar os dados
- Clicar em **"Configurar Metas"** novamente para reconectar

---

## ✅ Vantagens Desta Solução

- ✅ **Sem configuração complexa** - não precisa de Service Account
- ✅ **URL completa** - só colar e funcionar
- ✅ **Tempo real** - atualiza automaticamente
- ✅ **Fácil de usar** - qualquer pessoa consegue conectar

---

## 🐛 Problemas Comuns

### Erro: "Não foi possível acessar a planilha"
**Solução:** 
- Verifique se a planilha está compartilhada com "Qualquer pessoa com o link"
- Verifique se a URL está correta

### Erro: "Aba não encontrada"
**Solução:**
- Verifique se as abas têm os nomes corretos: `[DB] Leads`, `[INPUT] Investimento`, `[CONFIG] Metas`
- Ou sem colchetes: `DB Leads`, `INPUT Investimento`, `CONFIG Metas`

### Dados não atualizam
**Solução:**
- Aguarde 30 segundos (atualização automática)
- Ou altere algum filtro para forçar atualização

---

**Pronto! Agora é só colar a URL e usar! 🎉**
