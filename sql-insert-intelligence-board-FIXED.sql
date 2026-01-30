-- SQL CORRIGIDO para criar Quadro de Inteligência de teste
-- Esta versão NÃO usa a coluna position (que pode não existir)

-- Opção 1: Automático (usa o primeiro workspace encontrado)
INSERT INTO boards (name, description, workspace_id, user_id, type)
SELECT 
  'Quadro de Inteligência - Teste',
  'Dashboard de Analytics e Performance',
  w.id as workspace_id,
  COALESCE(
    (SELECT id FROM app_users LIMIT 1),
    '00000000-0000-0000-0000-000000000000'::uuid
  ) as user_id,
  'intelligence' as type
FROM workspaces w
WHERE w.id = (
  SELECT id FROM workspaces ORDER BY created_at ASC LIMIT 1
)
RETURNING id, name, workspace_id, type;

-- Opção 2: Manual (substitua SEU_WORKSPACE_ID)
/*
INSERT INTO boards (name, description, workspace_id, user_id, type)
VALUES (
  'Quadro de Inteligência - Teste',
  'Dashboard de Analytics e Performance',
  'SEU_WORKSPACE_ID'::uuid,  -- SUBSTITUA AQUI
  COALESCE(
    (SELECT id FROM app_users LIMIT 1),
    '00000000-0000-0000-0000-000000000000'::uuid
  ),
  'intelligence'
)
RETURNING id, name, workspace_id, type;
*/


