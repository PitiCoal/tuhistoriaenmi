# Tu Historia En Mí — Guía de Identidad y Convenciones

## Proyecto

App de acompañamiento espiritual católica chilena. PWA en Next.js 16 + Supabase + Firebase Auth.
"Un espacio para encontrarte con Dios cada día."
"Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo."

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js (App Router) | 16.2.10 | Framework |
| React | 19.2.4 | UI |
| Tailwind CSS | v4 (`@theme` + PostCSS) | Estilos |
| lucide-react | 1.24.0 | Iconos |
| Firebase Auth | 12.16.0 | Login (Google popup) |
| Supabase | 2.110.2 | DB (anon key, RLS abierta) |
| Serwist | 9.5.11 | Service Worker / PWA |
| date-fns | 4.4.0 | Fechas |
| Nodemailer | 9.0.3 | Emails |
| web-push | 3.6.7 | Push notificaciones |

## Arquitectura

- **Auth**: Firebase Auth (onAuthStateChanged), datos de perfil en `profiles` (Supabase)
- **DB**: Supabase PostgreSQL, RLS `USING (true) WITH CHECK (true)` — sin restricciones
- **Admin**: `/admin` con 10 tabs en un solo `page.tsx` (~832 líneas), acceso por `isAdminEmail()`
- **Almacenamiento admin**: `page_content` con `page='...'`, `key='items'`, `value=JSON array`
- **Diario**: Entradas en Supabase + backup localStorage. PIN con backup localStorage (`thm_diario_pin_{userId}`)
- **Push + Email**: Notificaciones vía Web Push, fallback a email por Nodemailer si no hay suscripción

## Convenciones de Código

### Estilo de componentes
- Functional components, `export default function Nombre()`
- `'use client'` en toda página interactiva (100% client-side)
- Nombre archivos: PascalCase para componentes, camelCase para utilerías
- Sin CSS modules, sin CSS-in-JS, sin `*.module.css` — solo Tailwind utility classes

### Imports
- `@/` alias para `./src/`
- Orden: React → contextos/lib → componentes → iconos → CSS
- Iconos: import individual `import { Heart, Send, LogIn } from 'lucide-react'`

### Nombres
- **Rutas**: español (`/comunidad`, `/diario`, `/oracion`, `/formacion`, `/el-en-mi`, `/rosario`)
- **Variables/estado**: camelCase español (`selectedFilter`, `muroText`, `estadosAnimo`, `intenciones`)
- **Tablas DB**: snake_case inglés (`muro_posts`, `user_consents`, `page_content`, `reactions`)
- **Funciones**: camelCase inglés (`createMuroPost`, `getDiarioEntryByDate`, `toggleReaction`)

### CSS
- Solo `globals.css` (Tailwind `@theme`) + `themes.css` (variables CSS manuales, keyframes, overrides)
- NO usar clases custom tipo `bg-primary`, `text-text` — no existen en el build de TW v4
- Usar colores estándar: `bg-white`, `text-gray-600`, `border-gray-200`, `bg-primary/10`, etc.
- `font-heading` para títulos (Georgia, serif), `font-body` para texto (Inter/sans)
- Responsive: mobile-first con `md:` — ej: `rounded-xl md:rounded-2xl`, `text-xs md:text-sm`, `p-4 md:p-6`
- NO agregar clases `bg-bg`, `text-text`, `border-border` — no se compilan
- Para cambios de tema oscuro, el `ThemeContext.tsx` inyecta un `<style>` inline con `!important`

## Paleta de Colores

| Variable | Light | Dark |
|---|---|---|
| `--color-primary` | `#0085C2` | `#38bdf8` |
| `--color-primary-dark` | `#1A3A5C` | `#7dd3fc` |
| `--color-secondary` | `#5BA3A8` | `#6ee7b7` |
| `--color-accent` | `#D4A843` | `#fbbf24` |
| `--color-gold` | `#C4974A` | `#f59e0b` |
| `--color-bg` | `rgba(245,240,235,0.92)` | `#0f172a` |
| `--color-card` | `#FFFFFF` | `#1e293b` |
| `--color-text` | `#1A1A1A` | `#e2e8f0` |
| `--color-text-light` | `#6B6358` | `#94a3b8` |

Plataformas: YT `#FF0000`, Spotify `#1DB954`, Apple `#6C3FE7`, Amazon `#FF9900`, WhatsApp `#25D366`, Instagram `#E4405F`.

## Diseño

- **Esquinas**: siempre redondeadas — `rounded-xl` cards, `rounded-2xl` hero/modales, `rounded-lg` botones, `rounded-full` avatares
- **Sombras**: `shadow-sm` sutil, `shadow-md` principal, `shadow-lg` hover. En dark se vuelven negro
- **Gradientes**: hero usa `bg-gradient-to-br from-primary-dark via-primary to-accent`
- **Background**: imagen fija `/images/fondo-podcast.jpg` con cover/fixed. Dark: overlay negro semitransparente
- **Logo**: `/images/logo.png` con `brightness-0 invert` para fondo oscuro, `drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]` en hero
- **Animaciones**: `fadeSlideUp` en entrada de páginas, `active:scale-95` en botones, `hover:-translate-y-0.5` en cards, `bounceIn` en elementos especiales. `prefers-reduced-motion` respetado
- **Tamaño fuente**: configurable (sm 14px / md 16px / lg 18px / xl 20px) en `<html>` via `ThemeContext`
- **Touch**: `min-height: 44px` en todos los elementos interactivos (WCAG AA + Apple HIG)

## Modo Oscuro

**LEARNED: `themes.css` SÍ se compila correctamente (`[data-theme="dark"]` selectores aparecen en el CSS build).**  
El problema NO era el build — era que `data-theme` se seteaba en React useEffect (post-hydration), causando flash y potencialmente no funcionando si el bundle no se cargaba a tiempo.

**Estrategia actual (funciona):**

1. `themes.css` (import estático) tiene `:root { --color-*}`, `[data-theme="dark"] { --color-* }`, y todos los overrides de dark mode
2. `layout.tsx` inyecta inline `<script>` como primer hijo de `<body>` que lee localStorage y setea `data-theme` + `fontSize` en `<html>` **antes del primer paint**
3. `ThemeContext.tsx` solo maneja toggle de estado y persistencia — NO inyecta CSS (es redundante)

## Lecciones Aprendidas (NO repetir errores)

1. **Tailwind v4 `@theme` no genera utilidades confiables en build** → las clases `bg-primary`, `text-text`, `border-border`, `bg-card` NO existen en el CSS compilado. Usar colores estándar (`bg-white`, `text-gray-800`) + variables CSS directas (`var(--color-primary)`) en inline styles si es necesario.

2. **`@import "tailwindcss"` dropea TODO el CSS posterior en el mismo archivo**, pero un CSS IMPORTADO (`./themes.css`) SÍ se compila y aparece en el build. El problema de drop solo ocurre dentro del mismo archivo después de `@import "tailwindcss"`, no para CSS importados separadamente.

3. **`next export` está deprecado** → usar `output: 'export'` en next.config o deploy directo a Vercel.

4. **lucide-react 1.24+ tiene estructura `.mjs`** y los nombres de iconos pueden diferir. Verificar existencia del archivo antes de importar. `HandHeart`, `Handshake`, `Bird`, `Flame` existen; `Dumbbell`, `HandFist`, `Muscle` no.

5. **EMOJI_ICONS requiere entrada para cada emoji en MURO_EMOJIS** — si falta un mapeo, el botón de reacción se renderiza vacío.

6. **Firebase `user` puede ser `'loading'`** — siempre verificar `user && user !== 'loading'` antes de acceder a `user.uid` o `user.displayName`.

7. **Las cards de acceso rápido en homepage** usan `bg-white` fijo (no variable), igual que muchos componentes. Si se cambia a dark, se sobrescribe vía `[data-theme="dark"] .bg-white { background-color: var(--color-card) !important; }`.

8. **El hero de homepage** usa `brightness-0 invert` en el logo para hacerlo blanco sobre el gradient. Para versión TM con colores, quitar esas clases.

9. **Los datos de admin** se guardan en `page_content(page='...', key='items', value=JSON array)` — NO crear tablas nuevas para contenido admin.

10. **Preferir emoji text (`<span>🙏</span>`) sobre lucide icons** para reacciones y labels pequeños — es más liviano, nunca falta, y no requiere import.
