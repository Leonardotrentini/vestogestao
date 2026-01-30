-- Adicionar coluna position na tabela boards se não existir
ALTER TABLE boards ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_boards_position ON boards(workspace_id, position);

-- Atualizar posições existentes
UPDATE boards 
SET position = COALESCE(position, 0)
WHERE position IS NULL;
