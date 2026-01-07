# ⚡ Quick Start - Preview Local

## 🎯 Servidor Rodando!

O servidor de desenvolvimento Next.js foi iniciado.

### 🌐 Acesse agora:

**http://localhost:3000**

O servidor está rodando em segundo plano. Abra seu navegador e acesse a URL acima.

---

## ⚠️ ATENÇÃO - Configuração Necessária

Para testar todas as funcionalidades (criar workspaces, boards, itens), você precisa configurar o Supabase primeiro:

### Passo 1: Criar projeto no Supabase
1. Acesse: https://supabase.com
2. Crie conta gratuita (se não tiver)
3. Clique em "New Project"
4. Preencha nome e senha do banco
5. Aguarde ~2 minutos para criação

### Passo 2: Pegar credenciais
1. No Supabase Dashboard, vá em **Settings > API**
2. Copie:
   - **Project URL** (ex: https://xxxxx.supabase.co)
   - **anon public key**

### Passo 3: Criar arquivo .env.local
Na raiz do projeto, crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### Passo 4: Criar tabelas no banco
1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New Query**
3. Abra o arquivo: `supabase/migrations/001_initial_schema.sql`
4. Copie TODO o conteúdo e cole no SQL Editor
5. Clique em **Run** (ou pressione F5)

### Passo 5: Reiniciar servidor
1. Pare o servidor atual (Ctrl+C no terminal)
2. Execute novamente:
   ```bash
   npm run dev
   ```

---

## ✅ Pronto!

Agora você pode:
- ✅ Criar Workspaces
- ✅ Criar Boards
- ✅ Criar Grupos
- ✅ Criar Itens
- ✅ Editar colunas (Status, Prioridade, etc.)
- ✅ Usar Time Tracking
- ✅ Adicionar Subitens

---

## 🛑 Parar o Servidor

Para parar o servidor, pressione `Ctrl + C` no terminal.

## 🔄 Comandos Úteis

```bash
# Iniciar servidor
npm run dev

# Instalar dependências (se necessário)
npm install

# Verificar se está tudo ok
npm run lint
```

---

**Dúvidas?** Consulte `SETUP.md` para guia completo ou `README.md` para documentação geral.










