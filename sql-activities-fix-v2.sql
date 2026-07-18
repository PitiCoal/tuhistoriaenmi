-- ====================================================
-- FIX USER ACTIVITIES TABLE & SECURITY POLICIES (V2)
-- Ejecutar en el SQL Editor de Supabase
-- ====================================================

-- 1. Crear la tabla si no existe con la estructura y el UNIQUE constraint correcto
CREATE TABLE IF NOT EXISTS public.user_activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  activity    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_activities_user_id_activity_key UNIQUE (user_id, activity)
);

-- 2. Habilitar RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- 3. Limpiar políticas antiguas
DROP POLICY IF EXISTS "Lectura pública user_activities" ON public.user_activities;
DROP POLICY IF EXISTS "Inserción pública user_activities" ON public.user_activities;
DROP POLICY IF EXISTS "Eliminación pública user_activities" ON public.user_activities;
DROP POLICY IF EXISTS "Acceso total user_activities" ON public.user_activities;
DROP POLICY IF EXISTS "Read user_activities" ON public.user_activities;
DROP POLICY IF EXISTS "Insert user_activities" ON public.user_activities;
DROP POLICY IF EXISTS "Delete user_activities" ON public.user_activities;
DROP POLICY IF EXISTS "Modificación pública user_activities" ON public.user_activities;

-- 4. Crear políticas 100% permisivas para evitar errores de RLS
CREATE POLICY "Lectura pública user_activities" ON public.user_activities FOR SELECT USING (true);
CREATE POLICY "Inserción pública user_activities" ON public.user_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminación pública user_activities" ON public.user_activities FOR DELETE USING (true);
CREATE POLICY "Modificación pública user_activities" ON public.user_activities FOR UPDATE USING (true) WITH CHECK (true);

-- 5. Recargar la caché del esquema de Supabase
NOTIFY pgrst, 'reload schema';
