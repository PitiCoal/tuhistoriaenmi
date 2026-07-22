-- ============================================================
-- MIGRACIÓN: Comunidades (Grupos de Usuarios)
-- ============================================================

-- 1. TABLA: comunidades
CREATE TABLE IF NOT EXISTS comunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  cover_url TEXT,
  created_by TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  category TEXT,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLA: comunidad_members
CREATE TABLE IF NOT EXISTS comunidad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunidad_id UUID NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comunidad_id, user_id)
);

-- 3. COLUMNA: comunidad_id en muro_posts (opcional)
ALTER TABLE muro_posts ADD COLUMN IF NOT EXISTS comunidad_id UUID REFERENCES comunidades(id) ON DELETE CASCADE;

-- 4. FUNCIONES RPC para conteo de miembros
CREATE OR REPLACE FUNCTION increment_comunidad_member_count(comunidad_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE comunidades SET member_count = member_count + 1, updated_at = now() WHERE id = comunidad_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_comunidad_member_count(comunidad_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE comunidades SET member_count = GREATEST(0, member_count - 1), updated_at = now() WHERE id = comunidad_id;
END;
$$ LANGUAGE plpgsql;

-- 5. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_comunidad_members_user ON comunidad_members(user_id);
CREATE INDEX IF NOT EXISTS idx_comunidad_members_comunidad ON comunidad_members(comunidad_id);
CREATE INDEX IF NOT EXISTS idx_muro_posts_comunidad ON muro_posts(comunidad_id);
CREATE INDEX IF NOT EXISTS idx_comunidades_category ON comunidades(category);

-- 6. RLS (Row Level Security)
ALTER TABLE comunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunidad_members ENABLE ROW LEVEL SECURITY;

-- Políticas: comunidades visibles para todos (las públicas)
CREATE POLICY "comunidades_select_all" ON comunidades FOR SELECT USING (true);
CREATE POLICY "comunidades_insert_auth" ON comunidades FOR INSERT WITH CHECK (true);
CREATE POLICY "comunidades_update_admin" ON comunidades FOR UPDATE USING (true);
CREATE POLICY "comunidades_delete_admin" ON comunidades FOR DELETE USING (true);

-- Políticas: miembros
CREATE POLICY "comunidad_members_select_all" ON comunidad_members FOR SELECT USING (true);
CREATE POLICY "comunidad_members_insert_self" ON comunidad_members FOR INSERT WITH CHECK (true);
CREATE POLICY "comunidad_members_delete_self" ON comunidad_members FOR DELETE USING (true);
CREATE POLICY "comunidad_members_update_admin" ON comunidad_members FOR UPDATE USING (true);
