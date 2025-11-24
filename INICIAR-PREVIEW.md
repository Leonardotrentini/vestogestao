# 🚀 Iniciar Preview Local

## Servidor de Desenvolvimento Iniciado!

O servidor Next.js está rodando em modo desenvolvimento.

### 📍 Acesse em:

**http://localhost:3000**

## ⚠️ Importante - Antes de testar completamente:

### 1. Configure o Supabase (obrigatório)

Para que o sistema funcione completamente, você precisa:

1. **Criar projeto no Supabase:**
   - Acesse https://supabase.com
   - Crie uma conta gratuita
   - Crie um novo projeto

2. **Configurar variáveis de ambiente:**
   - Crie o arquivo `.env.local` na raiz do projeto
   - Adicione:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
   ```

3. **Criar as tabelas:**
   - No Supabase Dashboard, vá em SQL Editor
   - Execute o script de `supabase/migrations/001_initial_schema.sql`

4. **Reiniciar o servidor:**
   - Pare o servidor (Ctrl+C)
   - Execute novamente: `npm run dev`

## 🎯 O que você pode testar agora:

Mesmo sem o Supabase configurado, você pode ver:
- ✅ Interface completa
- ✅ Layout e design
- ✅ Navegação entre páginas

Para criar workspaces, boards e itens, você precisa configurar o Supabase primeiro.

## 🛑 Parar o servidor:

Pressione `Ctrl + C` no terminal onde está rodando.

## 🔄 Reiniciar o servidor:

```bash
npm run dev
```

## 📝 Ver mais detalhes:

Consulte os arquivos:
- `SETUP.md` - Guia completo de configuração
- `README.md` - Documentação geral


