-- SQL para ejecutar en Supabase SQL Editor
-- Ve a https://supabase.com > SQL Editor > pega y ejecuta

-- ============================================
-- TABLAS EXISTENTES
-- ============================================
CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  season INTEGER NOT NULL,
  episode INTEGER NOT NULL,
  title TEXT NOT NULL,
  guest TEXT NOT NULL,
  description TEXT,
  image TEXT,
  youtube TEXT,
  spotify TEXT,
  apple TEXT,
  amazon TEXT,
  image_position TEXT DEFAULT 'center',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS participa (
  id TEXT PRIMARY KEY,
  tab TEXT NOT NULL CHECK (tab IN ('oraciones', 'reflexiones', 'sugerencias')),
  text TEXT NOT NULL,
  name TEXT,
  user_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  reactions INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- NUEVAS TABLAS: perfiles y muro
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  country TEXT,
  age INTEGER,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS muro_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  author_name TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS muro_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES muro_posts(id) ON DELETE CASCADE,
  user_id TEXT,
  author_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- BUCKETS DE STORAGE
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('muro-images', 'muro-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- EPISODIOS POR DEFECTO
-- ============================================
INSERT INTO episodes (id, season, episode, title, guest, description, image) VALUES
('t1e1', 1, 1, 'No Comprendo', 'Flo Ramírez', 'Flo nos comparte su historia de fe y preguntas sin respuesta.', '/images/episodios/t1e1.png'),
('t1e2', 1, 2, 'Cuando aceptar no es resignación ni rendirse', 'Piedad Alcalde', 'Piedad nos habla sobre la diferencia entre aceptar y rendirse.', '/images/episodios/t1e2.jpg'),
('t1e3', 1, 3, 'Ver con el Corazón', 'Rosario Rivera', 'Rosario nos invita a mirar más allá de lo visible.', '/images/episodios/t1e3.jpg'),
('t1e4', 1, 4, 'Un Punto seguido en mi historia', 'Berni Daniels', 'Berni nos recuerda que cada historia tiene un punto seguido.', '/images/episodios/t1e4.jpg'),
('t1e5', 1, 5, 'Kilómetros de Historia', 'Santiago Cruzat', 'Santiago nos lleva por un viaje de kilómetros recorridos.', '/images/episodios/t1e5.jpg'),
('t1e6', 1, 6, 'Historia del Corazón de Rodrigo', 'Rodrigo Bello', 'Rodrigo abre su corazón y comparte su historia.', '/images/episodios/t1e6.jpg'),
('t2e7', 2, 7, 'Aunque no tengas Fe', 'Xime Vallejos', 'Xime nos habla de la fe en medio de la duda.', '/images/episodios/t2e7.png'),
('t2e8', 2, 8, 'Del abandono al propósito', 'Kristian Brione', 'Kristian comparte cómo pasó del abandono a encontrar su propósito.', '/images/episodios/t2e8.png'),
('t2e9', 2, 9, 'Del vacío a la libertad', 'Benja Ramírez', 'Benja nos cuenta cómo encontró libertad donde solo había vacío.', '/images/episodios/t2e9.jpg')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RLS
-- ============================================
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE participa ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE muro_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE muro_replies ENABLE ROW LEVEL SECURITY;

-- Episodios
CREATE POLICY IF NOT EXISTS "Lectura pública episodios" ON episodes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Escritura autenticada episodios" ON episodes FOR ALL USING (auth.role() = 'authenticated');

-- Participa
CREATE POLICY IF NOT EXISTS "Lectura pública participa" ON participa FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Inserción pública participa" ON participa FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Eliminación autenticada participa" ON participa FOR DELETE USING (auth.role() = 'authenticated');

-- Settings
CREATE POLICY IF NOT EXISTS "Lectura pública settings" ON settings FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Escritura autenticada settings" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- Profiles
CREATE POLICY IF NOT EXISTS "Lectura pública perfiles" ON profiles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Inserción propia perfiles" ON profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY IF NOT EXISTS "Actualización propia perfiles" ON profiles FOR UPDATE USING (auth.uid()::text = user_id);

-- Muro posts
CREATE POLICY IF NOT EXISTS "Lectura pública muro" ON muro_posts FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Inserción autenticada muro" ON muro_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Eliminación propia muro" ON muro_posts FOR DELETE USING (auth.uid()::text = user_id);

-- Muro replies
CREATE POLICY IF NOT EXISTS "Lectura pública replies" ON muro_replies FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Inserción autenticada replies" ON muro_replies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Eliminación propia replies" ON muro_replies FOR DELETE USING (auth.uid()::text = user_id);

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

DROP POLICY IF EXISTS "Lectura pública reactions" ON reactions;
CREATE POLICY "Lectura pública reactions" ON reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserción autenticada reactions" ON reactions;
CREATE POLICY "Inserción autenticada reactions" ON reactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Eliminación propia reactions" ON reactions;
CREATE POLICY "Eliminación propia reactions" ON reactions FOR DELETE USING (auth.uid()::text = user_id);

-- Storage public access
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

DROP POLICY IF EXISTS "Lectura pública sponsors" ON sponsors;
CREATE POLICY "Lectura pública sponsors" ON sponsors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Escritura autenticada sponsors" ON sponsors;
CREATE POLICY "Escritura autenticada sponsors" ON sponsors FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('profile-photos', 'muro-images'));

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
