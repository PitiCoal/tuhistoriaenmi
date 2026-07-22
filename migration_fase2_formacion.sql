-- ============================================
-- FASE 2 — FORMACIÓN
-- Tu Historia en Mí | Julio 2026
-- ============================================
-- D.1 Planes Lectio Divina
-- D.2 Ejercicios Ignacianos
-- D.3 Biblioteca Catecismo
-- D.4 Buscador Semántico
-- ============================================

-- ============================================
-- D.1 — PLANES LECTIO DIVINA
-- ============================================

CREATE TABLE IF NOT EXISTS devotional_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration INT NOT NULL, -- 7 o 30 días
  cover_image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE devotional_plans ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS plan_devotionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES devotional_plans(id) ON DELETE CASCADE,
  devotional_id TEXT NOT NULL,
  day_number INT NOT NULL,
  UNIQUE(plan_id, day_number)
);
ALTER TABLE plan_devotionals ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS user_plan_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  plan_id UUID NOT NULL REFERENCES devotional_plans(id) ON DELETE CASCADE,
  current_day INT DEFAULT 1,
  completed_days INT[] DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, plan_id)
);
ALTER TABLE user_plan_progress ENABLE ROW LEVEL SECURITY;

-- RLS
CREATE POLICY "Lectura planes" ON devotional_plans FOR SELECT USING (true);
CREATE POLICY "Escritura planes admin" ON devotional_plans FOR ALL USING (
  auth.email() IN (SELECT email FROM admin_roles)
);

CREATE POLICY "Lectura plan_devotionals" ON plan_devotionals FOR SELECT USING (true);
CREATE POLICY "Escritura plan_devotionals admin" ON plan_devotionals FOR ALL USING (
  auth.email() IN (SELECT email FROM admin_roles)
);

CREATE POLICY "Lectura user_plan_progress propia" ON user_plan_progress FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Inserción user_plan_progress" ON user_plan_progress FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "Actualización user_plan_progress" ON user_plan_progress FOR UPDATE USING (
  user_id = auth.uid()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_plan_devotionals_plan ON plan_devotionals(plan_id, day_number);
CREATE INDEX IF NOT EXISTS idx_user_plan_progress_user ON user_plan_progress(user_id);

-- ============================================
-- D.2 — EJERCICIOS IGNACIANOS (usa mismas tablas)
-- ============================================
-- Reutiliza devotional_plans + plan_devotionals
-- Semanas se representan como planes de 7 días cada una

-- ============================================
-- D.3 — BIBLIOTECA CATECISMO
-- ============================================

CREATE TABLE IF NOT EXISTS catechism_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- 'catechism', 'ycatechism', 'compendium'
  chapter TEXT,
  paragraph TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('spanish', content)) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE catechism_entries ENABLE ROW LEVEL SECURITY;

-- Índice de búsqueda de texto completo
CREATE INDEX IF NOT EXISTS idx_catechism_search ON catechism_entries USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_catechism_tags ON catechism_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_catechism_source ON catechism_entries(source);

-- RLS
CREATE POLICY "Lectura catecismo" ON catechism_entries FOR SELECT USING (true);
CREATE POLICY "Escritura catecismo admin" ON catechism_entries FOR ALL USING (
  auth.email() IN (SELECT email FROM admin_roles)
);

-- ============================================
-- SEED DATA — PLANES LECTIO DIVINA
-- ============================================

INSERT INTO devotional_plans (name, description, duration, cover_image) VALUES
  ('Lectio Divina 7 Días', 'Una semana de oración y reflexión con la Palabra de Dios. Ideal para comenzar.', 7, '/images/lectio-7.jpg'),
  ('Lectio Divina 30 Días', 'Un mes de encuentro diario con Dios a través de la Escritura.', 30, '/images/lectio-30.jpg'),
  ('Ejercicios Ignacianos — Semana 1', 'Principio y Fundamento. Descubre para qué fuiste creado.', 7, '/images/ignaciano-1.jpg'),
  ('Ejercicios Ignacianos — Semana 2', 'Pecados y Misericordia. La profundidad del amor de Dios.', 7, '/images/ignaciano-2.jpg'),
  ('Ejercicios Ignacianos — Semana 3', 'Pasión y Cruz. Acompaña a Cristo en su sufrimiento.', 7, '/images/ignaciano-3.jpg'),
  ('Ejercicios Ignacianos — Semana 4', 'Resurrección y Gloria. La alegría de la vida nueva.', 7, '/images/ignaciano-4.jpg')
ON CONFLICT DO NOTHING;
