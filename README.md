# Vestogestao - Sistema de Gestão de Projetos

Sistema de gestão de projetos interno inspirado no Monday.com, desenvolvido para uso interno da agência.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** (PostgreSQL + Auth + Realtime)
- **Tailwind CSS**
- **React DnD Kit** (Drag & Drop)

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- npm ou yarn

## 🔧 Configuração

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd vestogestao
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Vá em Settings > API e copie:
   - Project URL
   - anon/public key

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### 5. Configure o banco de dados

1. No Supabase, vá em SQL Editor
2. Execute o script em `supabase/migrations/001_initial_schema.sql`
3. Isso criará todas as tabelas necessárias

### 6. Configure Realtime no Supabase

No Supabase Dashboard:
1. Vá em Database > Replication
2. Habilite a replicação para as tabelas:
   - `groups`
   - `items`
   - `column_values`
   - `comments`

## 🏃 Rodando o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📦 Estrutura do Projeto

```
vestogestao/
├── app/                    # Páginas Next.js
│   ├── (auth)/            # Login
│   ├── workspaces/        # Workspaces e Boards
│   └── layout.tsx
├── components/            # Componentes React
│   ├── board/            # Componentes do board
│   ├── group/            # Componentes de grupos
│   ├── item/             # Componentes de itens
│   └── column/           # Componentes de colunas
├── lib/                  # Utilitários e configurações
│   ├── supabase/         # Clientes Supabase
│   └── utils.ts          # Funções utilitárias
├── types/                # Tipos TypeScript
├── supabase/
│   └── migrations/       # Migrations SQL
└── package.json
```

## ✨ Funcionalidades

### ✅ Implementadas

- ✅ Workspaces (Áreas de Trabalho)
- ✅ Boards (Quadros)
- ✅ Groups (Grupos) - colapsáveis
- ✅ Items (Itens) - criação e visualização
- ✅ Subitems (Subitens)
- ✅ Colunas customizáveis:
  - Status
  - Pessoa
  - Prioridade
  - Data (Inicio-Finalização)
  - Controle de Tempo (Time Tracking)
- ✅ Modal de detalhes do item
- ✅ Sistema funcionando sem autenticação (para facilitar desenvolvimento inicial)

### 🚧 Em desenvolvimento

- Drag & Drop entre grupos
- Comentários nos itens
- Notificações
- Busca e Filtros
- Timeline visual

## 📝 Como usar

1. **Criar Workspace**: Na página inicial, clique em "Nova Área de Trabalho"
2. **Criar Board**: Dentro do workspace, clique em "Novo Quadro"
3. **Criar Grupo**: No board, clique em "Criar grupo"
4. **Criar Item**: Dentro de um grupo, clique em "Adicionar elemento"
5. **Editar Valores**: Clique nas células das colunas para editar valores
6. **Ver Detalhes**: Clique em um item para abrir o modal com detalhes e subitens
7. **Time Tracking**: Clique no ícone de play na coluna "Controle de tempo" para iniciar/parar

## 🔐 Autenticação

**⚠️ Autenticação desabilitada temporariamente** - O sistema está funcionando sem autenticação para facilitar o desenvolvimento inicial. A autenticação será implementada posteriormente.

## 📄 Licença

Uso interno da agência.

