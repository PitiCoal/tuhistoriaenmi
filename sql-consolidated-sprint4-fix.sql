-- ====================================================
-- TU HISTORIA EN MI — SOLUCIÓN CONSOLIDADA (SPRINT 4)
-- Ejecutar en el SQL Editor de Supabase
-- ====================================================

-- 1. Tabla de Diario Personal (personal_journal)
CREATE TABLE IF NOT EXISTS public.personal_journal (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.personal_journal ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total personal_journal" ON public.personal_journal;
CREATE POLICY "Acceso total personal_journal" ON public.personal_journal FOR ALL USING (true) WITH CHECK (true);


-- 2. Tabla de Inscripción a Actividades (user_activities)
CREATE TABLE IF NOT EXISTS public.user_activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  activity    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_activities_user_id_activity_key UNIQUE (user_id, activity)
);

ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total user_activities" ON public.user_activities;
DROP POLICY IF EXISTS "Lectura pública user_activities" ON public.user_activities;
DROP POLICY IF EXISTS "Inserción pública user_activities" ON public.user_activities;
DROP POLICY IF EXISTS "Eliminación pública user_activities" ON public.user_activities;
DROP POLICY IF EXISTS "Modificación pública user_activities" ON public.user_activities;

CREATE POLICY "Lectura pública user_activities" ON public.user_activities FOR SELECT USING (true);
CREATE POLICY "Inserción pública user_activities" ON public.user_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminación pública user_activities" ON public.user_activities FOR DELETE USING (true);
CREATE POLICY "Modificación pública user_activities" ON public.user_activities FOR UPDATE USING (true) WITH CHECK (true);


-- 3. Tabla de Productos (products)
CREATE TABLE IF NOT EXISTS public.products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  type              TEXT NOT NULL,
  phrase            TEXT NOT NULL,
  price             INTEGER NOT NULL,
  colors            JSONB NOT NULL DEFAULT '[]'::jsonb,
  sizes             JSONB NOT NULL DEFAULT '[]'::jsonb,
  description       TEXT NOT NULL,
  image_placeholder TEXT NOT NULL DEFAULT 'bg-primary-dark/80 text-white',
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso lectura products" ON public.products;
DROP POLICY IF EXISTS "Acceso total products" ON public.products;
CREATE POLICY "Acceso lectura products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Acceso total products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Insertar productos base si no existen
INSERT INTO public.products (name, type, phrase, price, colors, sizes, description, image_placeholder)
SELECT 'Polera "Atreverse"', 'polera', 'Cuando alguien se atreve a decirlo, otro se atreve a sentirlo', 12990, '[{"name": "Negro", "hex": "#1A1A1A"}, {"name": "Blanco", "hex": "#FFFFFF"}]'::jsonb, '["S", "M", "L", "XL"]'::jsonb, 'Polera de calce clásico unisex confeccionada en 100% Algodón Premium peinado. Estampa en serigrafía de alta definición con la frase icónica del podcast.', 'bg-primary-dark/80 text-white'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Polera "Atreverse"');


-- 4. Asegurar campos en Proyectos (projects)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS participants INTEGER DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 0;


-- 5. Recargar la caché del esquema de Supabase
NOTIFY pgrst, 'reload schema';
