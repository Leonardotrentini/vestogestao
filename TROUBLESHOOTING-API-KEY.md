# 🔧 Troubleshooting - API Key OpenAI

## ❌ Erro: "Erro ao analisar importação" (500)

### Causa Mais Comum: Servidor não reiniciado

Após adicionar a API key no `.env.local`, você **DEVE reiniciar o servidor** para que as variáveis de ambiente sejam carregadas.

### ✅ Solução:

1. **Pare o servidor atual:**
   - No terminal onde está rodando `npm run dev`
   - Pressione `Ctrl + C`

2. **Inicie novamente:**
   ```bash
   npm run dev
   ```

3. **Teste novamente** a importação inteligente

---

## 🔍 Outros Problemas Comuns

### Erro: "API Key não configurada"

**Verifique:**

1. O arquivo `.env.local` existe na **raiz do projeto** (mesmo nível do `package.json`)
2. A linha está correta:
   ```env
   OPENAI_API_KEY=sk-proj-...
   ```
3. **Não há espaços** antes ou depois do `=`
4. **Não há aspas** envolvendo a key

### Erro: "API Key inválida" ou 401

- Verifique se a key está correta
- Verifique se a key não expirou
- Gere uma nova key no site da OpenAI se necessário

### Erro: "Rate limit exceeded" ou 429

- Você atingiu o limite de requisições da sua conta OpenAI
- Aguarde alguns minutos e tente novamente
- Verifique seus limites no dashboard da OpenAI

---

## ✅ Verificar se está funcionando

Após reiniciar o servidor, os logs devem mostrar:

```
✓ Ready in Xms
```

Se ainda houver erro, verifique:

1. **Logs do servidor** no terminal - devem mostrar o erro específico
2. **Console do navegador** (F12) - mostra detalhes do erro
3. **Network tab** - verifique a resposta do erro na requisição

---

## 📝 Verificar Variável no Servidor

Para debugar, você pode adicionar temporariamente no código (apenas para teste):

```typescript
// Em lib/ai/openai-client.ts
console.log('API Key configurada?', !!process.env.OPENAI_API_KEY)
```

**⚠️ NUNCA faça commit com logs de debug que mostrem a API key!**

