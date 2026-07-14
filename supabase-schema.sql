-- ============================================
-- TU HISTORIA EN MI — Supabase Schema
-- ============================================

-- Run this file in Supabase SQL Editor to set up all tables.

-- ============================================
-- EPISODES
-- ============================================
CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  season INTEGER NOT NULL,
  episode INTEGER NOT NULL,
  title TEXT NOT NULL,
  guest TEXT NOT NULL,
  description TEXT,
  image TEXT,
  image_position TEXT DEFAULT 'center',
  youtube TEXT,
  spotify TEXT,
  apple TEXT,
  amazon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARTICIPA (legacy offlines)
-- ============================================
CREATE TABLE IF NOT EXISTS participa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tab TEXT NOT NULL,
  text TEXT NOT NULL,
  name TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE participa ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  display_name TEXT,
  photo_url TEXT,
  email TEXT,
  date_of_birth DATE,
  phone TEXT,
  country TEXT,
  city TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Migrate old age data: if age exists, set date_of_birth roughly
UPDATE profiles SET date_of_birth = (CURRENT_DATE - (age || ' years')::INTERVAL)::DATE WHERE age IS NOT NULL AND date_of_birth IS NULL;

-- Drop old age column
ALTER TABLE profiles DROP COLUMN IF EXISTS age;

-- ============================================
-- USER ACTIVITIES (intereses del usuario)
-- ============================================
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  activity TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, activity)
);

ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PAGE CONTENT (CMS para admin)
-- ============================================
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  content TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page, section)
);

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- ============================================
-- IMPACT METRICS
-- ============================================
CREATE TABLE IF NOT EXISTS impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT DEFAULT 'heart',
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- MURO POSTS
-- ============================================
CREATE TABLE IF NOT EXISTS muro_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  author_name TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE muro_posts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- MURO REPLIES
-- ============================================
CREATE TABLE IF NOT EXISTS muro_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES muro_posts(id) ON DELETE CASCADE,
  user_id TEXT,
  author_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE muro_replies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- REACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(target_type, target_id, user_id)
);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SPONSORS
-- ============================================
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TESTIMONIOS
-- ============================================
CREATE TABLE IF NOT EXISTS testimonios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE testimonios ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Episodios
DROP POLICY IF EXISTS "Lectura pública episodios" ON episodes;
DROP POLICY IF EXISTS "Escritura autenticada episodios" ON episodes;
CREATE POLICY "Lectura pública episodios" ON episodes FOR SELECT USING (true);
CREATE POLICY "Escritura pública episodios" ON episodes FOR ALL USING (true);

-- Participa
DROP POLICY IF EXISTS "Lectura pública participa" ON participa;
DROP POLICY IF EXISTS "Inserción pública participa" ON participa;
DROP POLICY IF EXISTS "Eliminación autenticada participa" ON participa;
CREATE POLICY "Lectura pública participa" ON participa FOR SELECT USING (true);
CREATE POLICY "Inserción pública participa" ON participa FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminación pública participa" ON participa FOR DELETE USING (true);

-- Settings
DROP POLICY IF EXISTS "Lectura pública settings" ON settings;
DROP POLICY IF EXISTS "Escritura autenticada settings" ON settings;
CREATE POLICY "Lectura pública settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Escritura pública settings" ON settings FOR ALL USING (true);

-- Profiles
DROP POLICY IF EXISTS "Lectura pública perfiles" ON profiles;
DROP POLICY IF EXISTS "Inserción pública perfiles" ON profiles;
DROP POLICY IF EXISTS "Actualización pública perfiles" ON profiles;
CREATE POLICY "Lectura pública perfiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Inserción pública perfiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización pública perfiles" ON profiles FOR UPDATE USING (true);

-- Muro posts
DROP POLICY IF EXISTS "Lectura pública muro" ON muro_posts;
DROP POLICY IF EXISTS "Inserción pública muro" ON muro_posts;
DROP POLICY IF EXISTS "Eliminación pública muro" ON muro_posts;
CREATE POLICY "Lectura pública muro" ON muro_posts FOR SELECT USING (true);
CREATE POLICY "Inserción pública muro" ON muro_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminación pública muro" ON muro_posts FOR DELETE USING (true);

-- Muro replies
DROP POLICY IF EXISTS "Lectura pública replies" ON muro_replies;
DROP POLICY IF EXISTS "Inserción pública replies" ON muro_replies;
DROP POLICY IF EXISTS "Eliminación pública replies" ON muro_replies;
CREATE POLICY "Lectura pública replies" ON muro_replies FOR SELECT USING (true);
CREATE POLICY "Inserción pública replies" ON muro_replies FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminación pública replies" ON muro_replies FOR DELETE USING (true);

-- Reactions
DROP POLICY IF EXISTS "Lectura pública reactions" ON reactions;
DROP POLICY IF EXISTS "Inserción pública reactions" ON reactions;
DROP POLICY IF EXISTS "Eliminación pública reactions" ON reactions;
CREATE POLICY "Lectura pública reactions" ON reactions FOR SELECT USING (true);
CREATE POLICY "Inserción pública reactions" ON reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminación pública reactions" ON reactions FOR DELETE USING (true);

-- Sponsors
DROP POLICY IF EXISTS "Lectura pública sponsors" ON sponsors;
DROP POLICY IF EXISTS "Escritura pública sponsors" ON sponsors;
CREATE POLICY "Lectura pública sponsors" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Escritura pública sponsors" ON sponsors FOR ALL USING (true);

-- Testimonios
DROP POLICY IF EXISTS "Lectura pública testimonios" ON testimonios;
DROP POLICY IF EXISTS "Inserción pública testimonios" ON testimonios;
CREATE POLICY "Lectura pública testimonios" ON testimonios FOR SELECT USING (true);
CREATE POLICY "Inserción pública testimonios" ON testimonios FOR INSERT WITH CHECK (true);

-- User activities
DROP POLICY IF EXISTS "Lectura pública user_activities" ON user_activities;
DROP POLICY IF EXISTS "Inserción pública user_activities" ON user_activities;
DROP POLICY IF EXISTS "Eliminación pública user_activities" ON user_activities;
CREATE POLICY "Lectura pública user_activities" ON user_activities FOR SELECT USING (true);
CREATE POLICY "Inserción pública user_activities" ON user_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminación pública user_activities" ON user_activities FOR DELETE USING (true);

-- Page content
DROP POLICY IF EXISTS "Lectura pública page_content" ON page_content;
DROP POLICY IF EXISTS "Escritura pública page_content" ON page_content;
CREATE POLICY "Lectura pública page_content" ON page_content FOR SELECT USING (true);
CREATE POLICY "Escritura pública page_content" ON page_content FOR ALL USING (true);

-- Impact metrics
DROP POLICY IF EXISTS "Lectura pública impact_metrics" ON impact_metrics;
DROP POLICY IF EXISTS "Escritura pública impact_metrics" ON impact_metrics;
CREATE POLICY "Lectura pública impact_metrics" ON impact_metrics FOR SELECT USING (true);
CREATE POLICY "Escritura pública impact_metrics" ON impact_metrics FOR ALL USING (true);

-- ============================================
-- PUSH SUBSCRIPTIONS (notificaciones)
-- ============================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  endpoint TEXT UNIQUE NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inserción pública push_subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Escritura pública push_subscriptions" ON push_subscriptions;
CREATE POLICY "Inserción pública push_subscriptions" ON push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Escritura pública push_subscriptions" ON push_subscriptions FOR ALL USING (true);

-- Storage buckets access (profile-photos, muro-images, episode-images)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('profile-photos', 'muro-images', 'episode-images'));
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('profile-photos', 'muro-images', 'episode-images'));
