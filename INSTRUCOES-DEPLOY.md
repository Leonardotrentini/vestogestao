# 🚀 Instruções para Deploy na Vercel

## ✅ Checklist Antes do Deploy

- [x] Código funcionando localmente
- [x] API Key da OpenAI configurada no `.env.local`
- [x] Variáveis do Supabase configuradas

## 📋 Passo a Passo para Deploy

### 1. Fazer Commit das Mudanças (se necessário)

```bash
git add .
git commit -m "feat: Adiciona importação inteligente e visualizações com gráficos"
git push
```

### 2. Deploy na Vercel

#### Opção A: Via Dashboard Vercel
1. Acesse: https://vercel.com
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione as variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL` = sua URL do Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sua chave anon do Supabase
   - `OPENAI_API_KEY` = sua chave da OpenAI (sk-proj-...)
5. Clique em **Deployments** → **Redeploy** (ou push novo commit)

#### Opção B: Via CLI (se tiver instalado)
```bash
vercel --prod
```

### 3. ⚠️ IMPORTANTE: Variáveis de Ambiente na Vercel

**NÃO esqueça de adicionar no Vercel:**

1. Vá em: **Settings** → **Environment Variables**
2. Adicione estas 3 variáveis:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   OPENAI_API_KEY
   ```
3. **Marque para TODOS os ambientes** (Production, Preview, Development)
4. Clique em **Save**

### 4. Após o Deploy

1. Teste a aplicação online
2. Verifique se a importação inteligente funciona
3. Teste os gráficos nos boards

---

## 🐛 Troubleshooting

### Erro: "API Key não configurada"
**Solução:** Verifique se adicionou `OPENAI_API_KEY` nas variáveis de ambiente da Vercel

### Erro: "Cannot connect to Supabase"
**Solução:** Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão configuradas

### Importação não funciona
**Solução:** A versão gratuita (sem IA) funciona sem API key. Se quiser IA, adicione a key no Vercel.

---

## 📝 O Que Foi Implementado Hoje

1. ✅ Importação Inteligente (com e sem IA)
2. ✅ Visualizações com gráficos (pizza, barras)
3. ✅ Botão "Gráficos" no header dos boards
4. ✅ Detecção automática de colunas para visualizações
5. ✅ Versão gratuita (sem necessidade de API key)

---

## 🎯 Próximos Passos (Amanhã)

- [ ] Testar visualizações com dados reais
- [ ] Melhorar detecção de colunas
- [ ] Adicionar mais tipos de gráficos
- [ ] Otimizar performance

---

**Boa sorte com o deploy! 🚀**

