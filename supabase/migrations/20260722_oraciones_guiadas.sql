-- Oraciones Guiadas table (opcional — los datos están precargados en oraciones-guiadas.ts)
CREATE TABLE IF NOT EXISTS oraciones_guiadas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  tema TEXT NOT NULL,
  duracion TEXT NOT NULL,
  descripcion TEXT,
  audio_url TEXT,
  imagen TEXT,
  guion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE oraciones_guiadas ENABLE ROW LEVEL SECURITY;

-- Mismo patrón que el resto del proyecto (Firebase Auth + anon key)
CREATE POLICY "oraciones_guiadas_all" ON oraciones_guiadas USING (true) WITH CHECK (true);
