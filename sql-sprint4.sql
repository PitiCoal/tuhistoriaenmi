-- ====================================================
-- TU HISTORIA EN MI — Sprint 4 SQL Migrations
-- Ejecutar en el SQL Editor de Supabase
-- ====================================================

-- 1. Tablas y Columnas faltantes del Sprint 2 (Fail-safe para solucionar consentimiento infinito)
CREATE TABLE IF NOT EXISTS user_consents (
  user_id     TEXT PRIMARY KEY,
  accepted_at TIMESTAMPTZ DEFAULT now(),
  version     TEXT DEFAULT '1.0'
);
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura de consentimientos" ON user_consents;
DROP POLICY IF EXISTS "Permitir inserción de consentimientos" ON user_consents;
CREATE POLICY "Permitir lectura de consentimientos" ON user_consents FOR SELECT USING (true);
CREATE POLICY "Permitir inserción de consentimientos" ON user_consents FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id TEXT PRIMARY KEY,
  daily_verse   BOOLEAN DEFAULT true,
  daily_phrase  BOOLEAN DEFAULT true,
  comments      BOOLEAN DEFAULT true,
  reactions     BOOLEAN DEFAULT true,
  announcements BOOLEAN DEFAULT true,
  updated_at    TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura de preferencias" ON notification_preferences;
DROP POLICY IF EXISTS "Permitir inserción de preferencias" ON notification_preferences;
CREATE POLICY "Permitir lectura de preferencias" ON notification_preferences FOR SELECT USING (true);
CREATE POLICY "Permitir inserción de preferencias" ON notification_preferences FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS project_participants (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL,
  joined_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);
ALTER TABLE project_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read pp" ON project_participants;
DROP POLICY IF EXISTS "Anyone insert pp" ON project_participants;
DROP POLICY IF EXISTS "Anyone delete pp" ON project_participants;
CREATE POLICY "Public read pp" ON project_participants FOR SELECT USING (true);
CREATE POLICY "Anyone insert pp" ON project_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone delete pp" ON project_participants FOR DELETE USING (true);

-- Agregar columna 'public' a testimonios si falta
ALTER TABLE testimonios ADD COLUMN IF NOT EXISTS public BOOLEAN DEFAULT false;

-- 2. Unificación del Muro (Sprint 4): Agregar categoría a las publicaciones
ALTER TABLE muro_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
