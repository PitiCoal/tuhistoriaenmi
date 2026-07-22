-- ============================================
-- FASE 0 — MIGRACIÓN COMPLETA
-- Tu Historia en Mí | Julio 2026
-- ============================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Orden: 1) Tablas faltantes 2) Admin roles 3) RLS 4) Índices 5) Streaks
-- ============================================

-- ============================================
-- 1. TABLAS FALTANTES (existen en supabase.ts, no en schema.sql)
-- ============================================

-- 1.1. DEVOTIONAL REPLIES
CREATE TABLE IF NOT EXISTS devotional_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devotional_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  display_name TEXT,
  answer TEXT NOT NULL,
  shared_to_muro BOOLEAN DEFAULT false,
  anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(devotional_id, user_id)
);
ALTER TABLE devotional_replies ENABLE ROW LEVEL SECURITY;

-- 1.2. PERSONAL JOURNAL
CREATE TABLE IF NOT EXISTS personal_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE personal_journal ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_personal_journal_user ON personal_journal(user_id, created_at DESC);

-- 1.3. NOTIFICATIONS (in-app notification center)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  url TEXT,
  type TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

-- 1.4. PAGE VIEWS
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);

-- 1.5. EPISODE CLICKS
CREATE TABLE IF NOT EXISTS episode_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE episode_clicks ENABLE ROW LEVEL SECURITY;

-- 1.6. FONDO POSTULACIONES
CREATE TABLE IF NOT EXISTS fondo_postulaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  organizacion TEXT,
  telefono TEXT,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT NOT NULL,
  monto_solicitado NUMERIC,
  beneficiarios INTEGER,
  estado TEXT DEFAULT 'pendiente',
  notas_admin TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE fondo_postulaciones ENABLE ROW LEVEL SECURITY;

-- 1.7. ADMIN ROLES (reemplaza ADMIN_EMAILS hardcodeado)
CREATE TABLE IF NOT EXISTS admin_roles (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Insertar admins por defecto
INSERT INTO admin_roles (email, role) VALUES
  ('piti.coal@gmail.com', 'superadmin'),
  ('contacto.tuhistoriaenmi@gmail.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 1.8. ENGAGEMENT DAILY (métricas North Star)
CREATE TABLE IF NOT EXISTS user_engagement_daily (
  user_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  opened_app BOOLEAN DEFAULT false,
  read_devotional BOOLEAN DEFAULT false,
  answered_devotional BOOLEAN DEFAULT false,
  shared_to_muro BOOLEAN DEFAULT false,
  reactions_given INT DEFAULT 0,
  posts_created INT DEFAULT 0,
  replies_given INT DEFAULT 0,
  minutes_in_prayer_mode INT DEFAULT 0,
  streak_day INT DEFAULT 0,
  PRIMARY KEY (user_id, date)
);
ALTER TABLE user_engagement_daily ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. RLS POLICIES REALES (tabla por tabla)
-- ============================================

-- 2.1. PROFILES
DROP POLICY IF EXISTS "Lectura pública perfiles" ON profiles;
DROP POLICY IF EXISTS "Inserción pública perfiles" ON profiles;
DROP POLICY IF EXISTS "Actualización pública perfiles" ON profiles;
CREATE POLICY "Lectura pública perfiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Inserción perfiles" ON profiles FOR INSERT WITH CHECK (
  auth.uid() = user_id OR auth.uid() IS NULL
);
CREATE POLICY "Actualización perfiles" ON profiles FOR UPDATE USING (
  auth.uid() = user_id
) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Eliminación perfiles" ON profiles FOR DELETE USING (
  auth.uid() = user_id
  OR auth.email() IN (SELECT email FROM admin_roles)
);

-- 2.2. MURO POSTS
DROP POLICY IF EXISTS "Lectura pública muro" ON muro_posts;
DROP POLICY IF EXISTS "Inserción pública muro" ON muro_posts;
DROP POLICY IF EXISTS "Eliminación pública muro" ON muro_posts;
CREATE POLICY "Lectura pública muro_posts" ON muro_posts FOR SELECT USING (true);
CREATE POLICY "Inserción muro_posts" ON muro_posts FOR INSERT WITH CHECK (
  user_id = auth.uid() OR user_id IS NULL
);
CREATE POLICY "Actualización muro_posts" ON muro_posts FOR UPDATE USING (
  user_id = auth.uid()
  OR auth.email() IN (SELECT email FROM admin_roles)
);
CREATE POLICY "Eliminación muro_posts" ON muro_posts FOR DELETE USING (
  user_id = auth.uid()
  OR auth.email() IN (SELECT email FROM admin_roles)
);

-- 2.3. MURO REPLIES
DROP POLICY IF EXISTS "Lectura pública replies" ON muro_replies;
DROP POLICY IF EXISTS "Inserción pública replies" ON muro_replies;
DROP POLICY IF EXISTS "Eliminación pública replies" ON muro_replies;
CREATE POLICY "Lectura pública muro_replies" ON muro_replies FOR SELECT USING (true);
CREATE POLICY "Inserción muro_replies" ON muro_replies FOR INSERT WITH CHECK (
  user_id = auth.uid() OR user_id IS NULL
);
CREATE POLICY "Eliminación muro_replies" ON muro_replies FOR DELETE USING (
  user_id = auth.uid()
  OR auth.email() IN (SELECT email FROM admin_roles)
);

-- 2.4. REACTIONS
DROP POLICY IF EXISTS "Lectura pública reactions" ON reactions;
DROP POLICY IF EXISTS "Inserción pública reactions" ON reactions;
DROP POLICY IF EXISTS "Eliminación pública reactions" ON reactions;
CREATE POLICY "Lectura pública reactions" ON reactions FOR SELECT USING (true);
CREATE POLICY "Inserción reactions" ON reactions FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "Eliminación reactions" ON reactions FOR DELETE USING (
  user_id = auth.uid()
);

-- 2.5. DEVOTIONAL REPLIES
DROP POLICY IF EXISTS "Lectura devo_replies" ON devotional_replies;
DROP POLICY IF EXISTS "Inserción devo_replies" ON devotional_replies;
DROP POLICY IF EXISTS "Eliminación devo_replies" ON devotional_replies;
CREATE POLICY "Lectura devo_replies" ON devotional_replies FOR SELECT USING (true);
CREATE POLICY "Inserción devo_replies" ON devotional_replies FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "Eliminación devo_replies" ON devotional_replies FOR DELETE USING (
  user_id = auth.uid()
  OR auth.email() IN (SELECT email FROM admin_roles)
);

-- 2.6. PERSONAL JOURNAL
DROP POLICY IF EXISTS "Lectura journal" ON personal_journal;
DROP POLICY IF EXISTS "Inserción journal" ON personal_journal;
DROP POLICY IF EXISTS "Eliminación journal" ON personal_journal;
CREATE POLICY "Lectura journal" ON personal_journal FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Inserción journal" ON personal_journal FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "Eliminación journal" ON personal_journal FOR DELETE USING (
  user_id = auth.uid()
);

-- 2.7. NOTIFICATIONS
DROP POLICY IF EXISTS "Lectura notificaciones" ON notifications;
DROP POLICY IF EXISTS "Actualización notificaciones" ON notifications;
CREATE POLICY "Lectura notificaciones" ON notifications FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Actualización notificaciones" ON notifications FOR UPDATE USING (
  user_id = auth.uid()
);

-- 2.8. PROJECT PARTICIPANTS
DROP POLICY IF EXISTS "Public read pp" ON project_participants;
DROP POLICY IF EXISTS "Anyone insert pp" ON project_participants;
DROP POLICY IF EXISTS "Anyone delete pp" ON project_participants;
CREATE POLICY "Lectura project_participants" ON project_participants FOR SELECT USING (true);
CREATE POLICY "Inserción project_participants" ON project_participants FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "Eliminación project_participants" ON project_participants FOR DELETE USING (
  user_id = auth.uid()
  OR auth.email() IN (SELECT email FROM admin_roles)
);

-- 2.9. USER ACTIVITIES
DROP POLICY IF EXISTS "Lectura pública user_activities" ON user_activities;
DROP POLICY IF EXISTS "Inserción pública user_activities" ON user_activities;
DROP POLICY IF EXISTS "Eliminación pública user_activities" ON user_activities;
CREATE POLICY "Lectura user_activities" ON user_activities FOR SELECT USING (true);
CREATE POLICY "Inserción user_activities" ON user_activities FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "Eliminación user_activities" ON user_activities FOR DELETE USING (
  user_id = auth.uid()
);

-- 2.10. PUSH SUBSCRIPTIONS
DROP POLICY IF EXISTS "Inserción pública push_subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Escritura pública push_subscriptions" ON push_subscriptions;
CREATE POLICY "Lectura push_subscriptions" ON push_subscriptions FOR SELECT USING (true);
CREATE POLICY "Inserción push_subscriptions" ON push_subscriptions FOR INSERT WITH CHECK (true);

-- 2.11. TESTIMONIOS
DROP POLICY IF EXISTS "Lectura pública testimonios" ON testimonios;
DROP POLICY IF EXISTS "Inserción pública testimonios" ON testimonios;
CREATE POLICY "Lectura testimonios" ON testimonios FOR SELECT USING (true);
CREATE POLICY "Inserción testimonios" ON testimonios FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- 2.12. TESTIMONIOS PUBLICOS
DROP POLICY IF EXISTS "Lectura test_publicos" ON testimonios_publicos;
DROP POLICY IF EXISTS "Inserción test_publicos" ON testimonios_publicos;
DROP POLICY IF EXISTS "Actualización test_publicos" ON testimonios_publicos;
DROP POLICY IF EXISTS "Eliminación test_publicos" ON testimonios_publicos;
CREATE POLICY "Lectura test_publicos" ON testimonios_publicos FOR SELECT USING (public = true);
CREATE POLICY "Inserción test_publicos" ON testimonios_publicos FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "Actualización test_publicos" ON testimonios_publicos FOR UPDATE USING (
  auth.email() IN (SELECT email FROM admin_roles)
);
CREATE POLICY "Eliminación test_publicos" ON testimonios_publicos FOR DELETE USING (
  auth.email() IN (SELECT email FROM admin_roles)
);

-- 2.13. USER CONSENTS
DROP POLICY IF EXISTS "Permitir lectura de consentimientos" ON user_consents;
DROP POLICY IF EXISTS "Permitir inserción de consentimientos" ON user_consents;
CREATE POLICY "Lectura user_consents" ON user_consents FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Inserción user_consents" ON user_consents FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- 2.14. NOTIFICATION PREFERENCES
DROP POLICY IF EXISTS "Permitir lectura de preferencias" ON notification_preferences;
DROP POLICY IF EXISTS "Permitir inserción de preferencias" ON notification_preferences;
CREATE POLICY "Lectura notif_prefs" ON notification_preferences FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Inserción notif_prefs" ON notification_preferences FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- 2.15. EPISODES (público lectura, admin escritura)
DROP POLICY IF EXISTS "Lectura pública episodios" ON episodes;
DROP POLICY IF EXISTS "Escritura autenticada episodios" ON episodes;
CREATE POLICY "Lectura episodios" ON episodes FOR SELECT USING (true);
CREATE POLICY "Escritura episodios" ON episodes FOR ALL USING (
  auth.email() IN (SELECT email FROM admin_roles)
);

-- 2.16. SPONSORS
DROP POLICY IF EXISTS "Lectura pública sponsors" ON sponsors;
DROP POLICY IF EXISTS "Escritura pública sponsors" ON sponsors;
CREATE POLICY "Lectura sponsors" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Escritura sponsors" ON sponsors FOR ALL USING (
  auth.email() IN (SELECT email FROM admin_roles)
);

-- 2.17. SETTINGS
DROP POLICY IF EXISTS "Lectura pública settings" ON settings;
DROP POLICY IF EXISTS "Escritura pública settings" ON settings;
CREATE POLICY "Lectura settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Escritura settings" ON settings FOR ALL USING (
  auth.email() IN (SELECT email FROM admin_roles)
);

-- 2.18. PROJECTS
DROP POLICY IF EXISTS "Lectura projects" ON projects;
DROP POLICY IF EXISTS "Escritura projects" ON projects;
CREATE POLICY "Lectura projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Escritura projects" ON projects FOR ALL USING (
  auth.email() IN (SELECT email FROM admin_roles)
);

-- 2.19. ACTIVITIES
DROP POLICY IF EXISTS "Lectura pública activities" ON activities;
DROP POLICY IF EXISTS "Escritura pública activities" ON activities;
CREATE POLICY "Lectura activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Escritura activities" ON activities FOR ALL USING (
  auth.email() IN (SELECT email FROM admin_roles)
);

-- 2.20. IMPACT METRICS
DROP POLICY IF EXISTS "Lectura pública impact_metrics" ON impact_metrics;
DROP POLICY IF EXISTS "Escritura pública impact_metrics" ON impact_metrics;
CREATE POLICY "Lectura impact_metrics" ON impact_metrics FOR SELECT USING (true);
CREATE POLICY "Escritura impact_metrics" ON impact_metrics FOR ALL USING (
  auth.email() IN (SELECT email FROM admin_roles)
);

-- 2.21. FONDO POSTULACIONES
DROP POLICY IF EXISTS "Lectura fondo" ON fondo_postulaciones;
DROP POLICY IF EXISTS "Inserción fondo" ON fondo_postulaciones;
CREATE POLICY "Lectura fondo" ON fondo_postulaciones FOR SELECT USING (
  auth.email() IN (SELECT email FROM admin_roles)
);
CREATE POLICY "Inserción fondo" ON fondo_postulaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización fondo" ON fondo_postulaciones FOR UPDATE USING (
  auth.email() IN (SELECT email FROM admin_roles)
);
CREATE POLICY "Eliminación fondo" ON fondo_postulaciones FOR DELETE USING (
  auth.email() IN (SELECT email FROM admin_roles)
);

-- 2.22. ADMIN ROLES
DROP POLICY IF EXISTS "Lectura admin_roles" ON admin_roles;
CREATE POLICY "Lectura admin_roles" ON admin_roles FOR SELECT USING (true);
CREATE POLICY "Escritura admin_roles" ON admin_roles FOR ALL USING (
  auth.email() IN (SELECT email FROM admin_roles WHERE role = 'superadmin')
);

-- 2.23. USER ENGAGEMENT DAILY
DROP POLICY IF EXISTS "Lectura engagement" ON user_engagement_daily;
DROP POLICY IF EXISTS "Inserción engagement" ON user_engagement_daily;
CREATE POLICY "Lectura engagement" ON user_engagement_daily FOR SELECT USING (
  user_id = auth.uid() OR auth.email() IN (SELECT email FROM admin_roles)
);
CREATE POLICY "Inserción engagement" ON user_engagement_daily FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "Actualización engagement" ON user_engagement_daily FOR UPDATE USING (
  user_id = auth.uid()
);

-- ============================================
-- 3. ÍNDICES DE PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_muro_posts_created_at ON muro_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_muro_posts_category ON muro_posts(category);
CREATE INDEX IF NOT EXISTS idx_muro_posts_user ON muro_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_muro_replies_post_id ON muro_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_devotional_replies_devotional ON devotional_replies(devotional_id);
CREATE INDEX IF NOT EXISTS idx_devotional_replies_user ON devotional_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_count ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_episode_clicks_episode ON episode_clicks(episode_id);
CREATE INDEX IF NOT EXISTS idx_devotionals_date ON devotionals(publish_date);
CREATE INDEX IF NOT EXISTS idx_devotionals_rotation ON devotionals(publish_date) WHERE publish_date IS NULL;

-- ============================================
-- 4. TABLA USER STREAKS (Fase 1 — Rachas)
-- ============================================

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id TEXT PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  grace_day_used_this_week BOOLEAN DEFAULT false,
  week_start DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura streaks" ON user_streaks;
DROP POLICY IF EXISTS "Inserción streaks" ON user_streaks;
DROP POLICY IF EXISTS "Actualización streaks" ON user_streaks;
CREATE POLICY "Lectura streaks" ON user_streaks FOR SELECT USING (
  user_id = auth.uid() OR auth.email() IN (SELECT email FROM admin_roles)
);
CREATE POLICY "Inserción streaks" ON user_streaks FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "Actualización streaks" ON user_streaks FOR UPDATE USING (
  user_id = auth.uid()
);

-- ============================================
-- 5. ALMACENAMIENTO — POLÍTICAS DE SEGURIDAD
-- ============================================

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Lectura storage" ON storage.objects FOR SELECT USING (
  bucket_id IN ('profile-photos', 'muro-images', 'episode-images', 'testimonio-videos')
);
CREATE POLICY "Subida storage" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('profile-photos', 'muro-images', 'episode-images', 'testimonio-videos')
);
CREATE POLICY "Eliminación storage propia" ON storage.objects FOR DELETE USING (
  auth.uid() = (storage.foldername(name))[1]
  OR auth.email() IN (SELECT email FROM admin_roles)
);

-- ============================================
-- 6. NUEVA CATEGORÍA PARA MURO (Conversaciones)
-- ============================================

-- Añadir check constraint para categorías si no existe
ALTER TABLE muro_posts DROP CONSTRAINT IF EXISTS valid_category;
ALTER TABLE muro_posts ADD CONSTRAINT valid_category CHECK (
  category IN ('general', 'oracion', 'reflexion', 'sugerencia', 'conversaciones', 'formacion')
);

-- Columna featured para intenciones destacadas
ALTER TABLE muro_posts ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE muro_posts ADD COLUMN IF NOT EXISTS featured_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_muro_posts_featured ON muro_posts(featured, featured_at DESC) WHERE featured = true;
