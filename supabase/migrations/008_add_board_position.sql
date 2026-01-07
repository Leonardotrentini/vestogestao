-- Adicionar coluna position na tabela boards para ordenação customizada
ALTER TABLE boards ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Criar índice para melhor performance ao ordenar
CREATE INDEX IF NOT EXISTS idx_boards_position ON boards(workspace_id, position);

-- Atualizar posições existentes baseado na ordem de criação (mais recente = maior position)
UPDATE boards 
SET position = subquery.new_position
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY workspace_id ORDER BY created_at DESC) - 1 AS new_position
  FROM boards
) AS subquery
WHERE boards.id = subquery.id;

