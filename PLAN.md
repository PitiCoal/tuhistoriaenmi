# Plan de Acción — Tu Historia En Mí

## 1. Tema Oscuro / Claro
**Archivos:** `src/lib/ThemeContext.tsx` (nuevo), `globals.css`, `layout.tsx`, `Header.tsx`
- Crear ThemeProvider con toggle y localStorage
- Variables CSS para dark mode en `[data-theme="dark"]`
- Botón Sun/Moon en Header
- Editable por admin: NO (preferencia personal del usuario)

## 2. Tamaño de Letra
**Archivos:** `ThemeContext.tsx` (añadir), `globals.css`, opcional control en Perfil
- Niveles: sm / md / lg / xl
- CSS variable `--font-size-multiplier` aplicada al `<html>`
- Editable por admin: NO (preferencia personal del usuario)

## 3. Formación — Recursos Católicos
**Archivos:** `src/app/formacion/page.tsx` (nueva sección/tab), `src/app/admin/page.tsx` (AdminRecursosCatolicos), `src/lib/supabase.ts` (CRUD)
- Nueva sección "Recursos Católicos" con enlaces a: Encíclicas, Biblia de Jerusalén, Catecismo, Vaticano II, etc.
- **Almacenamiento:** `page_content` con page='recursos_catolicos' (mismo patrón que recomendaciones)
- **Admin:** CRUD completo en pestaña "Recursos" del admin
- Editable por admin: ✅ SÍ — mismo patrón que AdminRecomendaciones

## 4. Header — "Episodios (Podcast)" → "Podcast"
**Archivos:** `src/components/Header.tsx`
- Cambiar label en línea 14
- Editable por admin: ❌ NO (fijo en código)

## 5. Oraciones Guiadas — Filtros Funcionales + Admin
**Archivos:** `src/app/oraciones-guiadas/page.tsx`, `src/lib/oraciones-guiadas.ts`, `src/lib/supabase.ts`, `src/app/admin/page.tsx` (AdminOraciones)
- Convertir `<span>` temas en `<button>` con estado de filtro
- **Migrar datos:** de archivo estático `oraciones-guiadas.ts` a `page_content` (page='oraciones_guiadas')
- **Admin:** CRUD completo en pestaña "Oraciones" del admin
- Editable por admin: ✅ SÍ — admin puede crear/editar/eliminar oraciones guiadas

---

**Resumen admin:** 2 nuevos paneles CRUD en `/admin`:
1. **Recursos** — gestionar enlaces católicos de la sección Formación
2. **Oraciones** — gestionar oraciones guiadas (título, tema, contenido, audio URL)

**Carga total:** ~10h
