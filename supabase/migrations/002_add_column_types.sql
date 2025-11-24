-- Migration 002: Adicionar novos tipos de coluna
-- Execute este SQL no Supabase após o 001_initial_schema.sql

-- Atualizar o CHECK constraint para incluir novos tipos
ALTER TABLE columns DROP CONSTRAINT IF EXISTS columns_type_check;

ALTER TABLE columns ADD CONSTRAINT columns_type_check 
CHECK (type IN (
  'text', 
  'status', 
  'person', 
  'priority', 
  'date', 
  'number', 
  'checkbox', 
  'time_tracking',
  'currency',
  'link',
  'long_text'
));

-- Comentários para documentação
COMMENT ON COLUMN columns.type IS 'Tipo de coluna: text, status, person, priority, date, number, checkbox, time_tracking, currency, link, long_text';


