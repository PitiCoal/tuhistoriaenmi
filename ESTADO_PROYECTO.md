# ESTADO DEL PROYECTO — Tu Historia en Mí

> Última actualización: **14 jul 2026** — commit `28c75a9` en `main`
> Para que otro agente retome exactamente donde quedó.

---

## 📋 Descripción del proyecto

**Tu Historia en Mí** es una plataforma PWA cristiana (Next.js 16 + Tailwind v4) que centraliza:
- Podcast de testimonios (episodios con enlaces YouTube/Spotify/Apple/Amazon)
- Versículo del día con reacciones multi-emoji 🙏❤️😊🤗✨
- Muro comunitario (posts, respuestas, reacciones)
- Oraciones / reflexiones / sugerencias (tabs en Comunidad)
- Perfiles con foto, bio, testimonio, preferencias de actividades
- Proyectos comunitarios con contador de participantes + date picker + upload imagen
- Área de administración completa (solo `piti.coal@gmail.com`)
- Notificaciones push (Web Push + VAPID)
- Formulario de testimonios con envío a Gmail

**Host / fundadora**: M. Piedad Correa — hace TODO (podcast, edición, app, comunidad, administración). Trabaja en otro trabajo. Email admin: `piti.coal@gmail.com` (mismo que Gmail para notificaciones/testimonios).

---

## 🏗️ Stack técnico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16.2.10 (App Router) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Auth | Firebase Auth (Google Sign-In popup) |
| Base de datos | Supabase (PostgreSQL) — **solo DB, no Supabase Auth** |
| Email | Nodemailer (Gmail SMTP con App Password) |
| Push | Web Push API + Serwist (service worker) |
| Iconos | lucide-react |
| Fechas | date-fns |
| PWA | Serwist / `@serwist/next` (precaching, install prompt) |
| Hosting | Vercel (env vars: Supabase, Firebase, VAPID, Gmail) |

---

## 📁 Estructura de archivos clave

```
tuhistoriaenmi-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Home: hero, platform links, daily verse, latest episode
│   │   ├── layout.tsx                   # Header, Footer, MobileNav, AuthProvider
│   │   ├── episodios/                   # Listado + detalle (SSG)
│   │   ├── comunidad/page.tsx           # Hub: oraciones/reflexiones/sugerencias/muro
│   │   ├── nosotros/page.tsx            # Quiénes somos + auto-métricas + métricas custom + testimonios públicos
│   │   ├── oracion/page.tsx             # Muro de oraciones (localStorage)
│   │   ├── testimonio/page.tsx          # Formulario → Supabase + email
│   │   ├── proyectos/page.tsx           # Proyectos públicos (Supabase)
│   │   ├── perfil/page.tsx              # Editor perfil + shortcut admin
│   │   ├── perfil/[id]/page.tsx         # Perfil público
│   │   ├── donar/page.tsx               # Enlace externo Ceneka/MercadoPago
│   │   ├── contacto/page.tsx            # Email + mailto
│   │   ├── encuentros/page.tsx          # Encuentros (estático)
│   │   ├── admin/proyectos/page.tsx     # **Panel admin 10 tabs** (solo admin)
│   │   └── api/
│   │       ├── testimonio/route.ts      # POST → email via Nodemailer
│   │       └── notifications/
│   │           ├── subscribe/route.ts   # Guardar suscripción push
│   │           └── send/route.ts        # Enviar push a todos
│   ├── components/
│   │   ├── Header.tsx                   # Nav sticky, auth, admin link
│   │   ├── Footer.tsx                   # Redes, copyright
│   │   ├── MobileNav.tsx                # Bottom nav 4 tabs + perfil/donar
│   │   ├── DailyVerse.tsx               # Versículo día + multi-emoji + share muro
│   │   ├── EpisodeCard.tsx              # Card episodio
│   │   ├── PlatformShowcase.tsx         # Grid YouTube/Spotify/Apple/Amazon
│   │   ├── PlatformLinks.tsx            # Botones plataforma por episodio
│   │   ├── SponsorShowcase.tsx          # Logos sponsors
│   │   ├── UserCounter.tsx              # Usuarios online (Firebase presence)
│   │   ├── InstallPrompt.tsx            # PWA install
│   │   └── NotificationPrompt.tsx       # Permiso push
│   └── lib/
│       ├── supabase.ts                  # **Capa de datos completa** (427 líneas, 20+ tablas)
│       ├── firebase.ts                  # Firebase init, auth, Firestore
│       ├── AuthContext.tsx              # React context auth state
│       ├── episodes.ts                  # 9 episodios hardcoded + merge logic
│       ├── verses.ts                    # 401 versículos hardcoded (día del año)
│       ├── data-service.ts              # Wrapper graceful sin config Supabase
│       └── sw.ts                        # Service worker + push handlers
├── supabase-schema.sql                  # Schema completo (tablas, RLS)
├── supabase-rls-fix.sql                 # Fix RLS para Firebase Auth
├── sql-actualizar.txt                   # Migraciones pendientes
├── AGENTS.md                            # Reglas Next.js 16
├── ESTADO_PROYECTO.md                   # ← ESTE ARCHIVO
└── public/                              # Assets estáticos
```

---

## ✅ Implementado hasta hoy

### Funciones públicas (sin login)
1. **Home** — Hero, platform showcase, daily verse, quick links, latest episode
2. **Episodios** — Listado con búsqueda + filtro temporada; detalle SSG
3. **Nosotros** — CMS dinámico, auto-métricas siempre visibles, métricas custom, bio creadora, sponsors, testimonios públicos
4. **Oración** — Ver intenciones, reaccionar 🙏 (localStorage)
5. **Donar / Contacto / Encuentros** — Páginas estáticas

### Funciones autenticadas (Google Sign-In)
6. **Perfil** — Foto (bucket `profile-photos`), nombre, fecha nac., teléfono, país, ciudad, bio, testimonio, actividades preferidas
7. **Testimonio** — Formulario → Supabase `testimonios` + email Gmail
8. **Comunidad** — 4 tabs:
   - Oraciones / Reflexiones / Sugerencias → localStorage + Supabase `participa_entries` + 🙏
   - **Muro** — Posts con imagen (`muro-images`), multi-emoji 🙏❤️😊🤗✨, respuestas anidadas, perfiles enlazados, borrar propio
 9. **Actividades en Comunidad** — Nueva tab "Actividades" lista actividades activas con contador de inscritos
10. **Proyectos** — Cards desde Supabase `projects`
10. **Perfiles públicos** — Ver perfil de otro usuario por ID

### Panel Admin (`piti.coal@gmail.com`)
11. **Proyectos** — CRUD completo Supabase + campo `participants` + error handling + date picker + upload imagen desde admin
12. **Episodios** — CRUD + subida imagen (`episode-images`), control posición, URLs plataformas; merge: defaults + Supabase + localStorage
13. **Hero Image** — Subir/pegar URL → Supabase `settings`
14. **Participación** — Ver/filtrar/borrar posts oraciones/reflexiones/sugerencias; limpiar todo
15. **Auspiciadores** — CRUD sponsors con logo
16. **Perfiles** — Buscar todos por nombre/país/email/bio/testimonio → muestra email 📧 + testimonio 💬
17. **Páginas (CMS)** — Editar secciones "Nosotros" (hero, historia, misión, visión, valores, bio, oración)
18. **Métricas** — **Auto-métricas** (usuarios, episodios, testimonios, sponsors, posts muro, reacciones totales) + métricas custom CRUD
19. **Notificaciones Push** — Enviar a todos los suscritos; ver contador suscriptores
20. **Actividades** — Definir actividades/eventos para suscripción desde perfil; toggle activo; se muestran en tab "Actividades" de Comunidad con contador de inscritos

### Transversales
21. **Versículo del día** — 401 hardcoded (rotación día del año), multi-emoji persistente, share-to-muro
22. **Multi-emoji reactions** — muro posts, daily verse, participa entries → tabla `reactions` (target_type, target_id, user_id, emoji)
23. **Push notifications** — Ciclo completo: subscribe (SW), persistir (`push_subscriptions`), enviar desde admin, limpiar expirados
24. **Contador usuarios online** — Firebase Realtime Database / Firestore
25. **Mobile bottom nav** — 4 tabs principales + contextual perfil/donar
26. **PWA / Service Worker** — Precaching + runtime caching + push handlers
27. **Subida imágenes** — `uploadFile()` unificado 3 buckets: `profile-photos`, `muro-images`, `episode-images` (incluye projects)

---

## ✅ Acciones realizadas por el usuario

| Acción | Estado |
|--------|--------|
| **Ejecutar SQL** en Supabase (projects.participants, reactions.emoji, profiles.testimonio, etc.) | ✅ **Completado** |
| **Configurar Gmail en Vercel** (`GMAIL_EMAIL`, `GMAIL_APP_PASSWORD`) | ✅ **Completado** |
| **Probar en prod** | ✅ Revisado y funcionando |

---

## 🐛 Bugs detectados y **fixeados** (commit `000104c`)

| # | Archivo:línea | Problema | **Fix aplicado** |
|---|--------------|----------|------------------|
| 1 | `src/app/admin/proyectos/page.tsx:857` | `getAllReactionCounts('muro_post', '')` → busca `target_id=''` → **siempre 0** | Agregada `getTotalReactionCount(targetType)` en `supabase.ts:220` → usa count exacto sin filtrar target_id |
| 2 | `src/app/comunidad/page.tsx:16-18` | `EMOJI_ICONS`: 😊→`MessageCircle`, ✨→`Camera` (incorrectos) | Cambiados a `Smile` y `Sparkles` (importados de lucide-react) como en `DailyVerse.tsx` |
| 3 | `src/app/admin/proyectos/page.tsx:35-41` | `useEffect` padre carga proyectos desde localStorage (muerto) — `ProjectsTab` usa Supabase | Eliminado estado `projects` + `pForm` + `pEditingId` + useEffect localStorage (líneas 35-41, 43-50 originales) |

---

## 🎯 Features acordadas para próximo sprint

### 🟢 Nivel 1 — Bajo esfuerzo, alto impacto

| Feature | Descripción | Archivos a tocar |
|---------|-------------|------------------|
| **Notificaciones admin in-app** | Bell icon en Header/Admin: nuevos testimonios, registros, posts muro, proyectos | `AuthContext`, `Header`, `admin/proyectos`, `supabase.ts` (tabla `notifications_admin` o `push_subscriptions` + flag) |
| **Email bienvenida** | Al registrar primer login → Nodemailer envía plantilla HTML | `AuthContext` (detectar `isNewUser`), `api/notifications/send` o nuevo `api/welcome` |
| **Compartir episodio WhatsApp** | Botón "Compartir" en `/episodios/[id]` → `https://wa.me/?text=...` | `src/app/episodios/[id]/page.tsx` + `PlatformLinks` |
| **Contador visitas/downloads** | Métrica real para documento financiamiento | `supabase.ts` + tabla `page_views` o `episode_stats` + admin Métricas |

### 🟡 Nivel 2 — Esfuerzo medio, muy valioso

| Feature | Descripción | Archivos a tocar |
|---------|-------------|------------------|
| **Devocionales diarios** | Más allá del versículo: reflexión + pregunta aplicación + oración guiada (contenido programable 30-60 días) | Nueva tabla `devocionales`, `DailyVerse.tsx` o componente nuevo, admin CRUD |
| **Comentarios en episodios** | Debate comunidad bajo cada episodio | Tabla `episode_comments`, `/episodios/[id]`, admin moderación |
| **RSVP Encuentros** | Fechas reales, cupos, confirmación email, lista asistentes | Tabla `encuentros` + `encuentro_rsvp`, página `/encuentros` dinámica, admin tab |
| **Retos / Meta del día** | "Escribe 3 cosas por las que agradeces", "Comparte testimonio en muro" — gamificación simple | Tabla `daily_challenges`, UI en Home/Comunidad, streak counter |

---

## 📝 Decisiones de diseño importantes

1. **Auth híbrida**: Firebase Auth (Google) = identidad. Supabase = solo base de datos. **RLS 100% público** en todas las tablas porque la autorización la maneja la app (no Supabase Auth).
2. **Episodios — merge 3 capas**: (1) `episodes.ts` hardcoded defaults, (2) Supabase `episodes` cloud overrides, (3) localStorage admin edits. `mergeEpisodesWithDefaults()` en `supabase.ts`.
3. **Perfiles sincronizados**: `AuthContext` → `upsertProfile()` en login crea/actualiza `profiles` con `user_id = uid`.
4. **Reacciones multi-emoji**: Tabla única `reactions` con `UNIQUE(target_type, target_id, user_id, emoji)` → un usuario puede reaccionar con **cada emoji** una vez por target.
5. **Storage buckets públicos**: `profile-photos`, `muro-images`, `episode-images` — policies `SELECT/INSERT` públicas.
6. **Build**: `npm run build` → TypeScript + Turbopack (warning serwist ignorado en dev). Deploy automático Vercel en push a `main`.

---

## 🔄 Historial reciente (últimos commits)

| Commit | Mensaje | Qué cambió |
|--------|---------|------------|
| `28c75a9` | **Features & fixes v3** | 1) Reacciones: 🙏❤️😊🤗✨ (5 emojis) en DailyVerse + Muro 2) Proyectos admin: date picker, upload imagen, label participantes 3) Nueva tab "Actividades" en Comunidad con contador de inscritos 4) Testimonios ya existía en /nosotros |
| `000104c` | **Fix 3 bugs** | 1) comunidad: EMOJI_ICONS correctos (😊→Smile, ✨→Sparkles) 2) admin/proyectos: elimina localStorage muerto projects 3) admin/metricas: totalReactions usa getTotalReactionCount('muro_post') + supabase.ts agrega getTotalReactionCount() |
| `36906c4` | Features & fixes | Multi-emoji, projects participants, perfiles email+testimonio, Impacto→Métricas, auto-metrics nosostros, proyectos Supabase, asteriscos fix, SQL actualizado |
| `5ac468a` | Fix bugs + features | (ver git log) |
| `7f9e08f` | Actividades dinámicas | Tabla `activities`, admin CRUD, perfil carga desde Supabase |
| `d3cebd6` | Episodios en Supabase | Admin sube imágenes a Storage, públicas leen de nube |
| `9812733` | Notificaciones push | SW, API suscribir/enviar, admin tab, VAPID keys |

---

## 📄 Documentos de referencia

| Archivo | Qué contiene |
|---------|--------------|
| `sql-actualizar.txt` | Migraciones — **ya ejecutadas por el usuario** en Supabase SQL Editor |
| `supabase-schema.sql` | Schema completo original (tablas, RLS) |
| `supabase-rls-fix.sql` | Fix RLS para compatibilidad Firebase Auth |
| `Presentacion_Proyecto_TuHistoriaEnMi_v2.md` | Documento corregido para financiamiento ($3M/mes) — datos reales, sin actividades callejeras/CM/retiros |
| `AGENTS.md` | Reglas Next.js 16 (breaking changes) |

---

## 🚀 Próximos pasos sugeridos (orden)

1. **Implementar Nivel 1** (notif admin + email bienvenida + share WA + contador visitas) — dan métricas reales para el documento de financiamiento
2. **Implementar Nivel 2** (devocionales + comentarios episodios + RSVP encuentros + retos) — engagement real

---

## 💡 Notas para el siguiente agente

- El admin **solo** detecta `piti.coal@gmail.com` (hardcoded en `ADMIN_EMAIL`).
- `verses.ts` tiene 401 versículos — no necesitan BD, rotan por `day of year`.
- `episodes.ts` tiene 9 defaults (S1: 3, S2: 6) — el admin edita en Supabase.
- `toggleReaction()` en `supabase.ts:179` devuelve `true` si agregó, `false` si quitó.
- `getAllReactionCounts(targetType, targetId)` **requiere targetId** — no cuenta global por tipo (bug #1).
- Push notifications: VAPID keys en `.env` + `public/vapid-public-key` para el SW.
- Si algo falla en build: `npm run build` → revisa TypeScript errors (suelen ser imports o tipos).

---

**¡Listo para continuar!** 🎯