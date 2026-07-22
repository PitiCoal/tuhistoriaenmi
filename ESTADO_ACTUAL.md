# Estado Actual — Tu Historia En Mí

> Generado: Julio 2026
> Producción: https://www.tuhistoriaenmi.cl
> Repo: `/mnt/c/Users/Piedad Correa.DESKTOP-JB3G46D/Desktop/TU HISTORIA EN MI/tuhistoriaenmi-app`

---

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.2.10 (App Router) |
| Lenguaje | TypeScript |
| UI / CSS | Tailwind CSS v4 (CSS-based config con `@theme`) |
| Iconos | lucide-react |
| Autenticación | Firebase Auth |
| Base de datos | Supabase (anon key, RLS `USING(true) WITH CHECK(true)`) |
| Fuentes | Georgia (headings), Inter / system-ui (body) |
| Despliegue | Vercel (producción automática desde CLI) |

---

## Arquitectura

### Layout (`src/app/layout.tsx`)
- `<ThemeProvider>` → `<AuthProvider>` → Header + main + Footer
- MobileNav (fixed bottom, solo móvil)
- InstallPrompt + NotificationPrompt

### Providers
- **`src/lib/ThemeContext.tsx`** — tema (light/dark) + tamaño de letra (sm/md/lg/xl), persistencia localStorage
- **`src/lib/AuthContext.tsx`** — Firebase Auth, onboarding wizard, consentimiento

### Temas visuales
- Definidos en `globals.css` via `@theme` + `[data-theme="dark"]`
- Tokens: `--color-primary`, `--color-card`, `--color-bg`, `--color-text`, `--color-text-light`, etc.
- Header usa `bg-card/95` en vez de `bg-white/95` (se adapta a dark mode)

---

## Páginas y Rutas (38 rutas)

| Ruta | Descripción | Tipo |
|------|-------------|------|
| `/` | Homepage — hero gradiente + logo glow + 4 cards acceso rápido | Static |
| `/admin` | Admin con 10 tabs (ver abajo) | Static |
| `/comunidad` | Muro principal — posts, reacciones, respuestas | Static |
| `/contacto` | Formulario de contacto | Static |
| `/diario` | Diario espiritual — calendario clickeable, PIN, multi-estado ánimo, recordatorio, DailyDevotional | Static |
| `/donar` | Donaciones | Static |
| `/el-en-mi` | Página "Él en mí" | Static |
| `/episodios` | Lista de episodios del podcast | Static |
| `/episodios/[id]` | Detalle de episodio | Dynamic |
| `/formacion` | Formación — 3 tabs: Podcast / Oraciones Guiadas / Recursos Católicos | Static |
| `/nosotros` | Sobre el proyecto | Static |
| `/oracion` | Oración — contiene enlace al Rosario | Static |
| `/oraciones-guiadas` | Oraciones guiadas — filtros por tema funcionales, carga desde page_content | Static |
| `/perfil` | Perfil — 3 secciones: Configuración / Diario / Publicaciones (sin tabs) | Static |
| `/perfil/[id]` | Perfil público de otro usuario | Dynamic |
| `/privacidad` | Política de privacidad | Static |
| `/recomendaciones` | Recomendaciones (retiros, apps, libros) — filtros por tipo | Static |
| `/rosario` | Rosario — modo paso a paso/completo, misterios según día de semana | Static |
| `/terminos` | Términos de uso | Static |
| `/testimonio` | Formulario de testimonio | Static |
| `/testimonios` | Lista de testimonios | Static |
| API routes | `api/notifications/*`, `api/project/join`, `api/testimonio`, `api/usuario`, `api/welcome` | Dynamic |

---

## Admin (`/admin`) — 10 Tabs CRUD

| Tab | Descripción | Almacenamiento |
|-----|-------------|---------------|
| Episodios | CRUD episodios de podcast | Tabla `episodes` |
| Auspiciadores | CRUD sponsors | Tabla `sponsors` |
| Contenido | Editor de páginas (nosotros, donation) | Tabla `page_content` |
| Testimonios | Lista + eliminar | Tabla `testimonios` |
| Muro | Lista + eliminar publicaciones (cascade replies + reactions) | Tablas `muro_posts`, `muro_replies`, `reactions` |
| Métricas | Vistas de página + clics en episodios | Tablas `page_views`, `episode_clicks` |
| Devocionales | CRUD devocionales con fecha rotativa | Tabla `devotionals` |
| **Recomendaciones** | CRUD recomendaciones (retiros, apps, etc.) | `page_content` → JSON `items` |
| **Oraciones** | CRUD oraciones guiadas | `page_content` → JSON `items` |
| **Recursos** | CRUD recursos católicos | `page_content` → JSON `items` |

---

## Características Implementadas

### Persistencia
- Tema oscuro/claro y tamaño de letra: localStorage
- PIN del diario: localStorage
- Preferencias de notificaciones: tabla `notification_preferences`

### Funcionalidades clave
- **Dark/Light mode + font size**: ThemeContext, toggle en Header, 4 niveles de texto
- **Multi estado de ánimo**: Array `estadosAnimo[]`, guarda como CSV en `estado_animo`
- **Calendario clickeable**: días como botones, visor de entrada al hacer clic
- **DailyDevotional**: colapsable, reacciones emoji, compartir al muro, acordeones reflexión/pregunta
- **Intenciones públicas**: toggles is_public / is_anonymous + badges
- **Rosario**: paso a paso/completo, misterios según día de la semana
- **Recomendaciones**: CRUD admin, filtros por tipo en página pública
- **Recursos Católicos**: 12 recursos por defecto, filtros por tipo, CRUD admin
- **Oraciones Guiadas**: filtros funcionales, datos desde page_content con fallback estático

### Admin
- Panel completo con 10 tabs CRUD
- Todos los contenidos editables por admin

---

## Archivos Relevantes (src/)

### Core
- `src/lib/ThemeContext.tsx` — tema + tamaño letra
- `src/lib/AuthContext.tsx` — Firebase Auth
- `src/lib/supabase.ts` — todas las funciones de base de datos
- `src/lib/supabase-server.ts` — cliente Supabase server-side
- `src/lib/database.types.ts` — tipos de TypeScript
- `src/lib/adminAuth.ts` — verificación de admin por email
- `src/app/globals.css` — estilos globales + dark mode
- `src/app/layout.tsx` — layout raíz

### Componentes globales
- `src/components/Header.tsx` — nav desktop con dropdowns + toggle tema/fuente
- `src/components/MobileNav.tsx` — nav mobile fijo abajo
- `src/components/Footer.tsx` — footer con enlaces

### Páginas principales
- `src/app/page.tsx` — homepage
- `src/app/admin/page.tsx` — admin con 10 tabs CRUD
- `src/app/diario/page.tsx` — diario espiritual
- `src/app/formacion/page.tsx` — formación (3 tabs)
- `src/app/oraciones-guiadas/page.tsx` — oraciones guiadas con filtros
- `src/app/recomendaciones/page.tsx` — recomendaciones
- `src/app/rosario/page.tsx` — rosario
- `src/app/comunidad/page.tsx` — muro

### Componentes específicos
- `src/components/DailyDevotional.tsx` — devocional diario colapsable
- `src/components/diario/DiarioEntryForm.tsx` — formulario de entrada con multi-ánimo
- `src/components/diario/IntencionesManager.tsx` — intenciones con toggles público/anónimo
- `src/components/comunidad/MuroForm.tsx` — formulario de publicación
- `src/components/comunidad/MuroPostCard.tsx` — tarjeta de publicación
- `src/components/formacion/OracionGuiadaCard.tsx` — tarjeta de oración guiada
- `src/components/EpisodeCard.tsx` — tarjeta de episodio

### Datos estáticos (fallback)
- `src/lib/oraciones-guiadas.ts` — 6 oraciones por defecto (se sobreescribe desde page_content)
- `src/lib/episodes.ts` — episodios por defecto
- `src/lib/verses.ts` — versículos bíblicos

---

## Historial de Cambios Recientes (Sprint)

### Último despliegue
| Cambio | Descripción |
|--------|-------------|
| Dark/Light mode | ThemeContext + CSS variables + toggle en Header |
| Tamaño de letra | 4 niveles en panel de preferencias |
| Header | "Episodios (Podcast)" → "Podcast", bg-card/95 para dark mode |
| Formación | 3ra pestaña "Recursos Católicos" con 12 enlaces + filtros |
| Oraciones Guiadas | Filtros funcionales, carga desde page_content con fallback |
| Admin | 2 nuevos CRUD: Oraciones + Recursos |
| Delete muro posts | Cascade elimina replies + reactions antes del post |

### Sprint anterior
| Cambio | Descripción |
|--------|-------------|
| Comunidades eliminado | Páginas `/comunidades` + acciones server + funciones supabase eliminadas |
| Recomendaciones | Nueva página + CRUD admin |
| Perfil sin tabs | 3 secciones: Configuración, Diario, Publicaciones |
| Homepage | Hero gradiente + logo glow + 4 cards |
| Multi estado ánimo | Array toggle en lugar de string único |
| Rosario | Página completa con misterios según día |
| Admin Devocionales | Nuevo tab CRUD |

---

## Próximos Pasos Posibles

1. **Empaquetar como app nativa** — Usar Capacitor (Ionic) para publicar en App Store / Google Play
2. **Notificaciones push reales** — Mejorar el sistema actual con service workers más robustos
3. **Traducciones** — i18n para inglés/portugués
4. **Comunidades virtuales** — Si se quiere recuperar la funcionalidad de grupos eliminada
5. **Modo offline** — Service worker con caché de contenido estático
6. **Analytics avanzados** — Dashboard admin con gráficos
7. **Compartir redes sociales** — OG images dinámicas para cada página
8. **Buscar en el sitio** — Búsqueda global de contenido
