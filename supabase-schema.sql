-- SQL para ejecutar en Supabase SQL Editor
-- Ve a https://supabase.com > SQL Editor > pega y ejecuta

CREATE TABLE episodes (
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

CREATE TABLE participa (
  id TEXT PRIMARY KEY,
  tab TEXT NOT NULL CHECK (tab IN ('oraciones', 'reflexiones', 'sugerencias')),
  text TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  reactions INTEGER DEFAULT 0
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar episodios por defecto
INSERT INTO episodes (id, season, episode, title, guest, description, image) VALUES
('t1e1', 1, 1, 'No Comprendo', 'Flo Ramírez', 'Flo nos comparte su historia de fe y preguntas sin respuesta.', '/images/episodios/t1e1.png'),
('t1e2', 1, 2, 'Cuando aceptar no es resignación ni rendirse', 'Piedad Alcalde', 'Piedad nos habla sobre la diferencia entre aceptar y rendirse.', '/images/episodios/t1e2.jpg'),
('t1e3', 1, 3, 'Ver con el Corazón', 'Rosario Rivera', 'Rosario nos invita a mirar más allá de lo visible.', '/images/episodios/t1e3.jpg'),
('t1e4', 1, 4, 'Un Punto seguido en mi historia', 'Berni Daniels', 'Berni nos recuerda que cada historia tiene un punto seguido.', '/images/episodios/t1e4.jpg'),
('t1e5', 1, 5, 'Kilómetros de Historia', 'Santiago Cruzat', 'Santiago nos lleva por un viaje de kilómetros recorridos.', '/images/episodios/t1e5.jpg'),
('t1e6', 1, 6, 'Historia del Corazón de Rodrigo', 'Rodrigo Bello', 'Rodrigo abre su corazón y comparte su historia.', '/images/episodios/t1e6.jpg'),
('t2e7', 2, 7, 'Aunque no tengas Fe', 'Xime Vallejos', 'Xime nos habla de la fe en medio de la duda.', '/images/episodios/t2e7.png'),
('t2e8', 2, 8, 'Del abandono al propósito', 'Kristian Brione', 'Kristian comparte cómo pasó del abandono a encontrar su propósito.', '/images/episodios/t2e8.png'),
('t2e9', 2, 9, 'Del vacío a la libertad', 'Benja Ramírez', 'Benja nos cuenta cómo encontró libertad donde solo había vacío.', '/images/episodios/t2e9.jpg');

-- Habilitar RLS (seguridad)
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE participa ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Permitir lectura anónima y escritura con límites
CREATE POLICY "Lectura pública episodios" ON episodes FOR SELECT USING (true);
CREATE POLICY "Escritura autenticada episodios" ON episodes FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Lectura pública participa" ON participa FOR SELECT USING (true);
CREATE POLICY "Inserción pública participa" ON participa FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminación autenticada participa" ON participa FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Lectura pública settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Escritura autenticada settings" ON settings FOR ALL USING (auth.role() = 'authenticated');
