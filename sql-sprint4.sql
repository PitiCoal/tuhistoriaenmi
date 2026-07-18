-- ====================================================
-- TU HISTORIA EN MI — Sprint 4 SQL Migrations
-- Ejecutar en el SQL Editor de Supabase
-- ====================================================

-- 1. Tablas y Columnas faltantes del Sprint 2 (Fail-safe para solucionar consentimiento infinito)
CREATE TABLE IF NOT EXISTS user_consents (
  user_id     TEXT PRIMARY KEY,
  accepted_at TIMESTAMPTZ DEFAULT now(),
  version     TEXT DEFAULT '1.0'
);
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura de consentimientos" ON user_consents;
DROP POLICY IF EXISTS "Permitir inserción de consentimientos" ON user_consents;
CREATE POLICY "Permitir lectura de consentimientos" ON user_consents FOR SELECT USING (true);
CREATE POLICY "Permitir inserción de consentimientos" ON user_consents FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id TEXT PRIMARY KEY,
  daily_verse   BOOLEAN DEFAULT true,
  daily_phrase  BOOLEAN DEFAULT true,
  comments      BOOLEAN DEFAULT true,
  reactions     BOOLEAN DEFAULT true,
  announcements BOOLEAN DEFAULT true,
  updated_at    TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura de preferencias" ON notification_preferences;
DROP POLICY IF EXISTS "Permitir inserción de preferencias" ON notification_preferences;
CREATE POLICY "Permitir lectura de preferencias" ON notification_preferences FOR SELECT USING (true);
CREATE POLICY "Permitir inserción de preferencias" ON notification_preferences FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS project_participants (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL,
  joined_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);
ALTER TABLE project_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read pp" ON project_participants;
DROP POLICY IF EXISTS "Anyone insert pp" ON project_participants;
DROP POLICY IF EXISTS "Anyone delete pp" ON project_participants;
CREATE POLICY "Public read pp" ON project_participants FOR SELECT USING (true);
CREATE POLICY "Anyone insert pp" ON project_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone delete pp" ON project_participants FOR DELETE USING (true);

-- Agregar columna 'public' a testimonios si falta
ALTER TABLE testimonios ADD COLUMN IF NOT EXISTS public BOOLEAN DEFAULT false;

-- 2. Unificación del Muro (Sprint 4): Agregar categoría a las publicaciones
ALTER TABLE muro_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- 3. Tabla de notificaciones internas (Centro de Notificaciones en App)
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  url         TEXT,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura de notificaciones propias" ON notifications;
DROP POLICY IF EXISTS "Permitir inserción de notificaciones" ON notifications;
DROP POLICY IF EXISTS "Permitir actualización de notificaciones" ON notifications;
CREATE POLICY "Permitir lectura de notificaciones propias" ON notifications FOR SELECT USING (true);
CREATE POLICY "Permitir inserción de notificaciones" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización de notificaciones" ON notifications FOR UPDATE USING (true);

-- 4. Asegurar columna participants en projects y agregar max_participants
ALTER TABLE projects ADD COLUMN IF NOT EXISTS participants INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 0;

-- Recargar el caché de esquema de PostgREST
NOTIFY pgrst, 'reload schema';

-- 5. Tabla de diario personal (Personal Journal)
CREATE TABLE IF NOT EXISTS personal_journal (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE personal_journal ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total personal_journal" ON personal_journal;
CREATE POLICY "Acceso total personal_journal" ON personal_journal FOR ALL USING (true) WITH CHECK (true);

-- 6. Asegurar políticas de user_activities para permitir inscripciones
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total user_activities" ON user_activities;
CREATE POLICY "Acceso total user_activities" ON user_activities FOR ALL USING (true) WITH CHECK (true);

-- 7. Tabla de productos (Tienda)
CREATE TABLE IF NOT EXISTS products (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name              TEXT NOT NULL,
  type              TEXT NOT NULL, -- 'polera' | 'poleron'
  phrase            TEXT NOT NULL,
  price             INTEGER NOT NULL,
  colors            JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of {name, hex}
  sizes             JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of strings e.g. ["S", "M", "L"]
  description       TEXT NOT NULL,
  image_placeholder TEXT NOT NULL DEFAULT 'bg-primary-dark/80 text-white',
  created_at        TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso lectura products" ON products;
DROP POLICY IF EXISTS "Acceso total products" ON products;
CREATE POLICY "Acceso lectura products" ON products FOR SELECT USING (true);
CREATE POLICY "Acceso total products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Insertar productos por defecto si no existen
INSERT INTO products (name, type, phrase, price, colors, sizes, description, image_placeholder)
SELECT 'Polera "Atreverse"', 'polera', 'Cuando alguien se atreve a decirlo, otro se atreve a sentirlo', 12990, '[{"name": "Negro", "hex": "#1A1A1A"}, {"name": "Blanco", "hex": "#FFFFFF"}]'::jsonb, '["S", "M", "L", "XL"]'::jsonb, 'Polera de calce clásico unisex confeccionada en 100% Algodón Premium peinado de 180g. Estampa en serigrafía de alta definición con la frase icónica del podcast. Tacto ultrasuave y costuras reforzadas.', 'bg-primary-dark/80 text-white'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Polera "Atreverse"');

INSERT INTO products (name, type, phrase, price, colors, sizes, description, image_placeholder)
SELECT 'Polerón "Eco"', 'poleron', 'Donde tu historia encuentra eco', 24990, '[{"name": "Azul Marino", "hex": "#1C2D42"}, {"name": "Gris Melange", "hex": "#A3A3A3"}]'::jsonb, '["M", "L", "XL"]'::jsonb, 'Polerón de calce relajado con capucha y bolsillo canguro. Interior de felpa perchada premium de 320g para máxima suavidad y abrigo. Frase bordada delicadamente en el centro del pecho.', 'bg-secondary text-white'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Polerón "Eco"');

INSERT INTO products (name, type, phrase, price, colors, sizes, description, image_placeholder)
SELECT 'Polera "Propósito"', 'polera', 'Cada historia tiene un propósito. La tuya también.', 12990, '[{"name": "Blanco", "hex": "#FFFFFF"}, {"name": "Verde Botella", "hex": "#1D3B2F"}]'::jsonb, '["S", "M", "L"]'::jsonb, 'Polera minimalista confeccionada en algodón orgánico. Estampado suave al tacto con una tipografía elegante inspiradora en el pecho. Diseño versátil para el día a día o encuentros de comunidad.', 'bg-primary/80 text-white'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Polera "Propósito"');

-- Recargar el caché de esquema de PostgREST
NOTIFY pgrst, 'reload schema';
