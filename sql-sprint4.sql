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

-- 3. Tabla de notificaciones internas (Centro de Notificaciones en App)
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  url         TEXT,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura de notificaciones propias" ON notifications;
DROP POLICY IF EXISTS "Permitir inserción de notificaciones" ON notifications;
DROP POLICY IF EXISTS "Permitir actualización de notificaciones" ON notifications;
CREATE POLICY "Permitir lectura de notificaciones propias" ON notifications FOR SELECT USING (true);
CREATE POLICY "Permitir inserción de notificaciones" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización de notificaciones" ON notifications FOR UPDATE USING (true);

-- 4. Asegurar columna participants en projects y agregar max_participants
ALTER TABLE projects ADD COLUMN IF NOT EXISTS participants INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 0;

-- Recargar el caché de esquema de PostgREST
NOTIFY pgrst, 'reload schema';
