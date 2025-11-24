# Como Criar o Usuário Admin no Supabase

## Método 1: Via Supabase Dashboard (MAIS FÁCIL) ✅

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Authentication** > **Users**
4. Clique no botão **"Add User"** (ou "Invite User")
5. Preencha os dados:
   - **Email:** `leozikao50@gmail.com`
   - **Password:** `Vesto@123`
   - **Auto Confirm User:** ✅ (marque esta opção)
   - **User Metadata (opcional):**
     ```json
     {
       "name": "Leonardo",
       "role": "admin"
     }
     ```
6. Clique em **"Create User"**

Pronto! O usuário será criado e já estará confirmado.

---

## Método 2: Via SQL (Usando Service Role Key)

Se você tem acesso à **Service Role Key** do Supabase, pode usar este script:

```sql
-- Este script precisa ser executado com Service Role Key
-- Não funciona com a chave anon key normal

-- Primeiro, você precisa obter a Service Role Key:
-- 1. Supabase Dashboard > Settings > API
-- 2. Copie a "service_role" key (NÃO compartilhe esta chave!)

-- Depois, use este código em uma função server-side ou API route
```

**Código para API Route (app/api/create-admin/route.ts):**

```typescript
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Adicione esta no .env.local

  if (!supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Service Role Key não configurada' },
      { status: 500 }
    )
  }

  const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'leozikao50@gmail.com',
    password: 'Vesto@123',
    email_confirm: true,
    user_metadata: {
      name: 'Leonardo',
      role: 'admin'
    }
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    user: data.user
  })
}
```

**Para usar:**
1. Adicione `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`
2. Acesse: `http://localhost:3000/api/create-admin` (método POST)

---

## Método 3: Via Página Web da Aplicação

1. Acesse: **http://localhost:3000/create-admin**
2. Clique no botão **"Criar Usuário Admin"**
3. O sistema tentará criar o usuário automaticamente

---

## Verificar se o usuário foi criado

Execute este SQL no Supabase SQL Editor:

```sql
-- Verificar usuários (apenas leitura, não cria)
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'role' as role,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'leozikao50@gmail.com';
```

---

## Resumo dos Dados do Admin

- **Nome:** Leonardo
- **Email:** leozikao50@gmail.com
- **Senha:** Vesto@123
- **Role:** admin

---

## ⚠️ Importante

- A tabela `auth.users` é protegida e não pode ser modificada diretamente via SQL normal
- Use o Dashboard ou a API Admin (com Service Role Key)
- Nunca compartilhe a Service Role Key publicamente

