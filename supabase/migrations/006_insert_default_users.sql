-- Inserir os 5 usuários padrão na tabela app_users
-- Estes usuários aparecerão no dropdown de responsáveis

INSERT INTO app_users (email, name, auth_user_id) VALUES
  ('raul@vesto.com', 'Raul', NULL),
  ('model@vesto.com', 'Model', NULL),
  ('leo@vesto.com', 'Leo', NULL),
  ('mika@vesto.com', 'Mika', NULL),
  ('gutinho@vesto.com', 'Gutinho', NULL)
ON CONFLICT (email) DO NOTHING;

-- Verificar se foram inseridos
SELECT id, email, name, auth_user_id, created_at 
FROM app_users 
ORDER BY name;

