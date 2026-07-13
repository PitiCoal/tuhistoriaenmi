-- ============================================
-- FIX RLS POLICIES FOR FIREBASE AUTH
-- ============================================
-- IMPORTANTE: Esta app usa Firebase Auth, no Supabase Auth.
-- Las policies con auth.uid() o auth.role() no funcionan
-- porque Firebase Auth no setea el usuario de Supabase.
-- Solución: policies públicas (la autorización se maneja desde la app).
-- ============================================

-- PROFILES
DROP POLICY IF EXISTS "Lectura pública perfiles" ON profiles;
DROP POLICY IF EXISTS "Inserción propia perfiles" ON profiles;
DROP POLICY IF EXISTS "Actualización propia perfiles" ON profiles;

CREATE POLICY "Lectura pública perfiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Inserción pública perfiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización pública perfiles" ON profiles FOR UPDATE USING (true);

-- REACTIONS
DROP POLICY IF EXISTS "Inserción autenticada reactions" ON reactions;
DROP POLICY IF EXISTS "Eliminación propia reactions" ON reactions;

CREATE POLICY "Inserción pública reactions" ON reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminación pública reactions" ON reactions FOR DELETE USING (true);

-- MURO POSTS
DROP POLICY IF EXISTS "Inserción autenticada muro" ON muro_posts;
DROP POLICY IF EXISTS "Eliminación propia muro" ON muro_posts;

CREATE POLICY "Inserción pública muro" ON muro_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminación pública muro" ON muro_posts FOR DELETE USING (true);

-- MURO REPLIES
DROP POLICY IF EXISTS "Inserción autenticada replies" ON muro_replies;
DROP POLICY IF EXISTS "Eliminación propia replies" ON muro_replies;

CREATE POLICY "Inserción pública replies" ON muro_replies FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminación pública replies" ON muro_replies FOR DELETE USING (true);

-- STORAGE OBJECTS (profile-photos y muro-images)
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;

CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('profile-photos', 'muro-images'));

-- SPONSORS (escritura)
DROP POLICY IF EXISTS "Escritura autenticada sponsors" ON sponsors;

CREATE POLICY "Escritura pública sponsors" ON sponsors FOR ALL USING (true);
