-- ================================================
-- SPRINT 2 — Tu Historia en Mí
-- Ejecutar en Supabase SQL Editor
-- ================================================

-- 1. Preferencias de notificaciones por usuario
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id TEXT PRIMARY KEY,
  daily_verse   BOOLEAN DEFAULT true,
  daily_phrase  BOOLEAN DEFAULT true,
  comments      BOOLEAN DEFAULT true,
  reactions     BOOLEAN DEFAULT true,
  announcements BOOLEAN DEFAULT true,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Participantes de proyectos
CREATE TABLE IF NOT EXISTS project_participants (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL,
  joined_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);
ALTER TABLE project_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read pp"    ON project_participants FOR SELECT USING (true);
CREATE POLICY "Anyone insert pp"  ON project_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone delete pp"  ON project_participants FOR DELETE USING (true);

-- 3. Consentimientos de usuario (legal)
CREATE TABLE IF NOT EXISTS user_consents (
  user_id     TEXT PRIMARY KEY,
  accepted_at TIMESTAMPTZ DEFAULT now(),
  version     TEXT DEFAULT '1.0'
);

-- 4. Campo public en testimonios (aprobación admin)
ALTER TABLE testimonios ADD COLUMN IF NOT EXISTS public BOOLEAN DEFAULT false;

-- 5. Campo approved en testimonios_publicos
ALTER TABLE testimonios_publicos ADD COLUMN IF NOT EXISTS approved     BOOLEAN DEFAULT false;
ALTER TABLE testimonios_publicos ADD COLUMN IF NOT EXISTS approved_at  TIMESTAMPTZ;
