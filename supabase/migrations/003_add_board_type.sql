-- Add type field to boards table
ALTER TABLE boards ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'board' CHECK (type IN ('board', 'document'));

-- Update existing boards to have type 'board'
UPDATE boards SET type = 'board' WHERE type IS NULL;











