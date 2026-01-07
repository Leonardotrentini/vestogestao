-- Adicionar tipo 'intelligence' aos boards
ALTER TABLE boards DROP CONSTRAINT IF EXISTS boards_type_check;

ALTER TABLE boards ADD CONSTRAINT boards_type_check 
  CHECK (type IN ('board', 'document', 'mindmap', 'intelligence'));

