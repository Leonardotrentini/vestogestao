-- ============================================
-- SCRIPT PARA CRIAR USUÁRIO ADMIN
-- ============================================
-- IMPORTANTE: O Supabase não permite criar usuários diretamente via SQL
-- na tabela auth.users por questões de segurança.
--
-- SOLUÇÃO: Use o Supabase Dashboard (método mais fácil e recomendado)
-- ============================================

-- PASSO 1: Acesse o Supabase Dashboard
-- https://supabase.com/dashboard > Seu Projeto > Authentication > Users

-- PASSO 2: Clique em "Add User" e preencha:
--   Email: leozikao50@gmail.com
--   Password: Vesto@123
--   Auto Confirm User: ✅ (marcar)
--   User Metadata (opcional):
--     {
--       "name": "Leonardo",
--       "role": "admin"
--     }

-- PASSO 3: Clique em "Create User"

-- ============================================
-- FUNÇÃO AUXILIAR: Verificar dados do admin
-- ============================================

CREATE OR REPLACE FUNCTION get_admin_user_info()
RETURNS TABLE (
  email TEXT,
  name TEXT,
  password TEXT,
  role TEXT,
  instructions TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'leozikao50@gmail.com'::TEXT as email,
    'Leonardo'::TEXT as name,
    'Vesto@123'::TEXT as password,
    'admin'::TEXT as role,
    'Crie este usuário via Dashboard: Authentication > Users > Add User'::TEXT as instructions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar para ver as informações do admin que precisa ser criado
SELECT * FROM get_admin_user_info();

-- ============================================
-- VERIFICAR SE O USUÁRIO JÁ EXISTE
-- ============================================
-- Execute este SELECT para verificar se o usuário já foi criado:

SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'role' as role,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'leozikao50@gmail.com';

-- Se retornar uma linha, o usuário já existe!
-- Se não retornar nada, você precisa criar via Dashboard.
