# Guia Rápido de Setup - Vestogestao

## Passos para colocar no ar hoje

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar conta no Supabase

1. Acesse https://supabase.com
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Aguarde o projeto ser criado (2-3 minutos)

### 3. Configurar variáveis de ambiente

1. No Supabase Dashboard, vá em **Settings > API**
2. Copie:
   - **Project URL** (ex: https://xxxxx.supabase.co)
   - **anon public** key

3. Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 4. Criar as tabelas no banco

1. No Supabase Dashboard, vá em **SQL Editor**
2. Abra o arquivo `supabase/migrations/001_initial_schema.sql`
3. Copie todo o conteúdo do arquivo
4. Cole no SQL Editor do Supabase
5. Clique em **Run** (ou F5)

### 5. Habilitar Realtime (opcional, mas recomendado)

1. No Supabase Dashboard, vá em **Database > Replication**
2. Habilite replicação para:
   - `groups`
   - `items`
   - `column_values`
   - `comments`

Isso permite atualizações em tempo real quando outros usuários fazem mudanças.

### 6. Rodar o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

### 7. Primeiro login

1. Na tela de login, digite seu email e senha
2. O sistema criará seu usuário automaticamente na primeira vez
3. Depois você poderá fazer login normalmente

## Estrutura criada

- ✅ Workspaces (Áreas de Trabalho)
- ✅ Boards (Quadros) 
- ✅ Groups (Grupos) - colapsáveis
- ✅ Items (Itens)
- ✅ Subitems (Subitens)
- ✅ Colunas customizáveis (Status, Pessoa, Prioridade, Data, Time Tracking)
- ✅ Modal de detalhes do item
- ✅ Time Tracking funcional

## Próximos passos (opcionais)

- Drag & Drop entre grupos
- Comentários nos itens
- Notificações
- Busca e Filtros
- Timeline visual

## Deploy para produção

### Vercel (recomendado)

1. Conecte seu repositório no GitHub
2. No Vercel, importe o projeto
3. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

O Vercel detecta automaticamente que é um projeto Next.js.

## Problemas comuns

### Erro de autenticação
- Verifique se as variáveis de ambiente estão corretas
- Verifique se o projeto Supabase está ativo

### Erro ao criar tabelas
- Certifique-se de que está executando o SQL no editor correto
- Verifique se não há erros de sintaxe SQL

### Não atualiza em tempo real
- Verifique se habilitou a replicação no Supabase
- Verifique se as tabelas estão na lista de replicação


