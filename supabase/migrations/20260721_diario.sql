-- ============================================================
-- MIGRACIÓN: Diario (Pilar 1) — Nuevas tablas
-- ============================================================

-- 1. TABLA: diario_entries (entrada diaria principal)
CREATE TABLE IF NOT EXISTS diario_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  entry_date DATE NOT NULL,
  evangelio TEXT,
  reflexion TEXT,
  que_me_dice_dios TEXT,
  proposito TEXT,
  estado_animo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

-- 2. TABLA: diario_intenciones (tracking de intenciones)
CREATE TABLE IF NOT EXISTS diario_intenciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'pidiendo' CHECK (estado IN ('pidiendo', 'en_proceso', 'contestada', 'agradecida')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA: diario_gratitud (3 cosas por agradecer diariamente)
CREATE TABLE IF NOT EXISTS diario_gratitud (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  entry_date DATE NOT NULL,
  gratitud_1 TEXT NOT NULL,
  gratitud_2 TEXT,
  gratitud_3 TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

-- 4. TABLA: diario_examen (examen de conciencia diario)
CREATE TABLE IF NOT EXISTS diario_examen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  entry_date DATE NOT NULL,
  gracias TEXT NOT NULL,
  dificultad TEXT NOT NULL,
  perdon TEXT NOT NULL,
  proposito TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_diario_entries_user_date ON diario_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_diario_intenciones_user ON diario_intenciones(user_id, estado);
CREATE INDEX IF NOT EXISTS idx_diario_gratitud_user_date ON diario_gratitud(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_diario_examen_user_date ON diario_examen(user_id, entry_date);

-- RLS
ALTER TABLE diario_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_intenciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_gratitud ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_examen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diario_entries_all" ON diario_entries USING (true) WITH CHECK (true);
CREATE POLICY "diario_intenciones_all" ON diario_intenciones USING (true) WITH CHECK (true);
CREATE POLICY "diario_gratitud_all" ON diario_gratitud USING (true) WITH CHECK (true);
CREATE POLICY "diario_examen_all" ON diario_examen USING (true) WITH CHECK (true);
