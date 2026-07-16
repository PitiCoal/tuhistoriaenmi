-- ================================================
-- SPRINT 3 — Tu Historia en Mí
-- Ejecutar en Supabase SQL Editor
-- ================================================

-- 1. Visitas a páginas (Métricas)
CREATE TABLE IF NOT EXISTS page_views (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path      TEXT NOT NULL,
  user_id   TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select page_views" ON page_views FOR SELECT USING (true);
CREATE POLICY "Public insert page_views" ON page_views FOR INSERT WITH CHECK (true);

-- 2. Clics en episodios / plataformas (Métricas)
CREATE TABLE IF NOT EXISTS episode_clicks (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id TEXT NOT NULL,
  platform   TEXT NOT NULL, -- 'youtube', 'spotify', 'apple', 'amazon'
  user_id    TEXT,
  clicked_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE episode_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select episode_clicks" ON episode_clicks FOR SELECT USING (true);
CREATE POLICY "Public insert episode_clicks" ON episode_clicks FOR INSERT WITH CHECK (true);

-- 3. Devocionales Diarios
CREATE TABLE IF NOT EXISTS devotionals (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  verse        TEXT NOT NULL,
  reference    TEXT NOT NULL,
  reflection   TEXT NOT NULL,
  question     TEXT NOT NULL,
  prayer       TEXT NOT NULL,
  publish_date DATE UNIQUE, -- Null si es rotativo general
  created_at   TIMESTAMPTZ DEFAULT now(),
  sponsor_id   UUID -- Opcional: enlace a auspiciador de la tabla sponsors
);
ALTER TABLE devotionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select devotionals" ON devotionals FOR SELECT USING (true);
CREATE POLICY "Public all devotionals" ON devotionals FOR ALL USING (true);

-- 4. Respuestas a Devocionales
CREATE TABLE IF NOT EXISTS devotional_replies (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  devotional_id  UUID REFERENCES devotionals(id) ON DELETE CASCADE,
  user_id        TEXT NOT NULL,
  display_name   TEXT,
  answer         TEXT NOT NULL,
  shared_to_muro BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(devotional_id, user_id)
);
ALTER TABLE devotional_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select devotional_replies" ON devotional_replies FOR SELECT USING (true);
CREATE POLICY "Public all devotional_replies" ON devotional_replies FOR ALL USING (true);

-- 5. Agregar sponsor_id a episodios (opcional: patrocinar contenido)
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS sponsor_id UUID;
