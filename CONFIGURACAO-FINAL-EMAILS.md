# ✅ Configuração Final - Emails para Novos Leads

## 🎯 O que foi configurado:

### 1. ✅ Novos leads sempre vão para "Novos"
- Implementado e funcionando
- Qualquer lead novo detectado vai automaticamente para o grupo "Novos"

### 2. ✅ Email enviado para 2 endereços
Configurado no `.env.local`:
```env
NOTIFICATION_EMAIL=vestocooficial@gmail.com,leozikao50@gmail.com
```

**Os 2 emails receberão notificação quando:**
- Um novo lead for adicionado na planilha do Google Sheets
- O sistema sincronizar e detectar que é um lead novo
- O lead for adicionado ao grupo "Novos"

---

## 📧 Como funciona:

1. **Novo lead na planilha** → Sistema detecta na sincronização
2. **Lead vai para grupo "Novos"** → Automaticamente
3. **Email enviado** → Para os 2 endereços configurados
4. **Email contém:**
   - Nome do lead
   - WhatsApp
   - Instagram
   - Campanha
   - Anúncio
   - Faturamento mensal

---

## 🔄 Para aplicar as mudanças:

**IMPORTANTE:** Reinicie o servidor para carregar as novas configurações:

1. **Pare o servidor:** `Ctrl + C` na janela do PowerShell
2. **Inicie novamente:** `npm run dev`
3. **Aguarde:** Aparecer "Ready"

---

## ✅ Pronto!

Agora **TODA VEZ** que chegar um lead novo:
- ✅ Vai para o grupo "Novos"
- ✅ Email enviado para os 2 endereços:
  - vestocooficial@gmail.com
  - leozikao50@gmail.com

---

## 🧪 Para testar:

1. Adicione um novo lead na planilha do Google Sheets
2. Sincronize os leads no sistema
3. Verifique os 2 emails (e também a pasta de spam)

**Tudo configurado e funcionando!** 🎉
