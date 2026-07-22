-- ============================================================
-- MURO V2: Categoría "gracias" + columna is_pinned
-- ============================================================

-- 1. Agregar columna is_pinned para destacar publicaciones
ALTER TABLE muro_posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- 2. Actualizar CHECK constraint para incluir "gracias"
ALTER TABLE muro_posts DROP CONSTRAINT IF EXISTS valid_category;
ALTER TABLE muro_posts ADD CONSTRAINT valid_category CHECK (
  category IN ('general', 'oracion', 'reflexion', 'sugerencia', 'gracias', 'conversaciones', 'formacion')
);

-- 3. Índice para ordenar destacados primero
CREATE INDEX IF NOT EXISTS idx_muro_posts_pinned ON muro_posts(is_pinned DESC, created_at DESC);
