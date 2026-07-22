-- ============================================================
-- SPRINT 5: Actividades con fecha/hora + Fondo Concursable
-- Ejecutar en: Supabase -> SQL Editor
-- ============================================================

-- 1. Agregar columnas fecha y hora a la tabla activities
ALTER TABLE activities 
  ADD COLUMN IF NOT EXISTS activity_date TEXT,
  ADD COLUMN IF NOT EXISTS activity_time TEXT;

-- 2. Crear tabla fondo_postulaciones
CREATE TABLE IF NOT EXISTS fondo_postulaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  organizacion TEXT,
  telefono TEXT,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'evangelizacion',
  monto_solicitado INTEGER,
  beneficiarios INTEGER,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  notas_admin TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 3. Habilitar RLS en fondo_postulaciones
ALTER TABLE fondo_postulaciones ENABLE ROW LEVEL SECURITY;

-- 4. Politicas RLS
DROP POLICY IF EXISTS "Anyone can create postulacion" ON fondo_postulaciones;
DROP POLICY IF EXISTS "Admin full access postulaciones" ON fondo_postulaciones;

CREATE POLICY "Anyone can create postulacion"
  ON fondo_postulaciones FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin full access postulaciones"
  ON fondo_postulaciones FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Indices
CREATE INDEX IF NOT EXISTS idx_fondo_postulaciones_estado ON fondo_postulaciones(estado);
CREATE INDEX IF NOT EXISTS idx_fondo_postulaciones_created ON fondo_postulaciones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fondo_postulaciones_user ON fondo_postulaciones(user_id);
