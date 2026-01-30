-- Remover constraint antiga se existir
ALTER TABLE boards DROP CONSTRAINT IF EXISTS boards_type_check;

-- Adicionar nova constraint que inclui todos os tipos
ALTER TABLE boards ADD CONSTRAINT boards_type_check 
  CHECK (type IN ('board', 'document', 'intelligence', 'dashboard', 'mindmap'));

-- Se a coluna type não existir, adicionar
ALTER TABLE boards ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'board';

-- Atualizar valores NULL para 'board'
UPDATE boards SET type = 'board' WHERE type IS NULL;
