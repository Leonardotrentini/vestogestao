-- Adicionar coluna content na tabela boards para armazenar conteúdo de documentos
ALTER TABLE boards ADD COLUMN IF NOT EXISTS content TEXT;






