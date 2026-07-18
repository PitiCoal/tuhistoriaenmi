-- ====================================================
-- Fix user_activities: unique constraint + RLS correcto
-- Ejecutar en el SQL Editor de Supabase
-- ====================================================

-- Aseguramos que la tabla existe con estructura correcta
CREATE TABLE IF NOT EXISTS user_activities (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    TEXT NOT NULL,
  activity   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agregar constraint único si no existe (necesario para UPSERT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_activities_user_id_activity_key'
  ) THEN
    ALTER TABLE user_activities ADD CONSTRAINT user_activities_user_id_activity_key UNIQUE (user_id, activity);
  END IF;
END$$;

-- Habilitar RLS
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas anteriores y crear una permisiva
DROP POLICY IF EXISTS "Acceso total user_activities" ON user_activities;
DROP POLICY IF EXISTS "Read user_activities" ON user_activities;
DROP POLICY IF EXISTS "Insert user_activities" ON user_activities;
DROP POLICY IF EXISTS "Delete user_activities" ON user_activities;

-- Política permisiva para todos (anon + authenticated)
CREATE POLICY "Acceso total user_activities" ON user_activities
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Recargar schema cache
NOTIFY pgrst, 'reload schema';
