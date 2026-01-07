-- SQL para criar um Quadro de Inteligência de teste
-- Este script busca automaticamente o primeiro workspace disponível

-- VERSÃO SIMPLIFICADA (sem coluna position)
-- Use esta versão se a coluna position ainda não foi adicionada

INSERT INTO boards (name, description, workspace_id, user_id, type)
SELECT 
  'Quadro de Inteligência - Teste',
  'Dashboard de Analytics e Performance - Criado para testes',
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

-- Se você já souber o workspace_id, use este SQL mais simples:
/*
INSERT INTO boards (name, description, workspace_id, user_id, type, position)
VALUES (
  'Quadro de Inteligência - Teste',
  'Dashboard de Analytics e Performance',
  'SEU_WORKSPACE_ID_AQUI'::uuid,  -- SUBSTITUA pelo ID do seu workspace
  COALESCE(
    (SELECT id FROM app_users LIMIT 1),
    '00000000-0000-0000-0000-000000000000'::uuid
  ),
  'intelligence',
  COALESCE(
    (SELECT MAX(position) FROM boards WHERE workspace_id = 'SEU_WORKSPACE_ID_AQUI'::uuid),
    -1
  ) + 1
)
RETURNING id, name, workspace_id, type;
*/

