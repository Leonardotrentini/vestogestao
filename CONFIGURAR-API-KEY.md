# 🔑 Como Configurar API Key da OpenAI

## ⚠️ IMPORTANTE

A API key fornecida precisa ser adicionada ao arquivo `.env.local` para funcionar.

## 📋 Passos

1. **Crie o arquivo `.env.local` na raiz do projeto** (se não existir)

2. **Adicione a linha:**
```env
OPENAI_API_KEY=sua_api_key_aqui
```

3. **Reinicie o servidor** (pare e rode `npm run dev` novamente)

## ✅ Verificar se está funcionando

Após configurar, ao usar a "Importação Inteligente", você verá:
- ✅ IA analisa o arquivo e retorna briefing
- ❌ Se não estiver configurada: erro "API Key não configurada"

## 🔒 Segurança

⚠️ **NUNCA commite a API key no git!**

O arquivo `.env.local` já está no `.gitignore`, então está seguro.

---

**Após adicionar a key, reinicie o servidor e teste a importação inteligente!**

