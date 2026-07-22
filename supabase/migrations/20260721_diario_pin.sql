-- Add diario_pin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS diario_pin TEXT;
