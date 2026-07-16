# ESTADO DEL PROYECTO — Tu Historia en Mí

> Última actualización: **15 jul 2026** — Sprint 2 completado ✅
> Para que otro agente retome exactamente donde quedó.

---

## 📋 Descripción del proyecto

**Tu Historia en Mí** es una plataforma PWA cristiana (Next.js 16 + Tailwind v4) que centraliza:
- Podcast de testimonios (episodios con enlaces YouTube/Spotify/Apple/Amazon)
- Versículo del día con reacciones multi-emoji 🙏❤️😊🤗✨
- Muro comunitario (posts, respuestas, reacciones)
- Oraciones / reflexiones / sugerencias (tabs en Comunidad)
- Perfiles con foto, bio, testimonio, preferencias de actividades, mis publicaciones
- Proyectos comunitarios con contador de inscritos real + botón "Unirme" + date picker + upload imagen
- **Página pública de Testimonios** (`/testimonios`) con flujo de aprobación admin
- **Impacto en Home** — métricas automáticas visibles en la portada
- **Últimos 3 episodios** en portada (antes solo 1)
- Área de administración completa (solo `piti.coal@gmail.com`)
- **11 tabs en admin**: Proyectos, Episodios, Inicio, Participación, Auspiciadores, Perfiles, Páginas, Métricas, Notificaciones, Actividades, **Testimonios (nuevo)**
- Notificaciones push (Web Push + VAPID) con **preferencias granulares por usuario**
- Formulario de testimonios con envío a Gmail + flujo aprobación
- **Cumplimiento legal**: páginas `/privacidad` y `/terminos` + modal de consentimiento primer login + botón "Eliminar mi cuenta"

**Host / fundadora**: M. Piedad Correa. Email admin: `piti.coal@gmail.com`. Plataforma solo para **mayores de 18 años**.

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
│   │   ├── page.tsx                     # Home: hero, impacto, versículo, 3 últimos eps, testimonios
│   │   ├── layout.tsx                   # Header, Footer, MobileNav, AuthProvider
│   │   ├── episodios/                   # Listado + detalle (SSG)
│   │   ├── comunidad/page.tsx           # Hub: oraciones/reflexiones/sugerencias/muro
│   │   ├── nosotros/page.tsx            # Quiénes somos + auto-métricas + métricas custom + testimonios
│   │   ├── testimonios/page.tsx         # ★ NUEVO: Galería pública de testimonios aprobados
│   │   ├── privacidad/page.tsx          # ★ NUEVO: Política de Privacidad (Ley 19.628/21.719)
│   │   ├── terminos/page.tsx            # ★ NUEVO: Términos de Uso
│   │   ├── oracion/page.tsx             # Muro de oraciones (localStorage)
│   │   ├── testimonio/page.tsx          # Formulario → Supabase + email
│   │   ├── proyectos/page.tsx           # ★ ACTUALIZADO: visible sin login, botón Unirme, contador real
│   │   ├── perfil/page.tsx              # ★ ACTUALIZADO: tabs, +18, notif. granulares, mis pubs, borrar cuenta
│   │   ├── perfil/[id]/page.tsx         # Perfil público
│   │   ├── donar/page.tsx               # Enlace externo Ceneka/MercadoPago
│   │   ├── contacto/page.tsx            # Email + mailto
│   │   ├── encuentros/page.tsx          # Encuentros (estático)
│   │   ├── admin/proyectos/page.tsx     # Panel admin 11 tabs (incluye Testimonios nuevo)
│   │   └── api/
│   │       ├── testimonio/route.ts      # POST → email via Nodemailer
│   │       ├── usuario/route.ts         # ★ NUEVO: DELETE → eliminar todos los datos (ARCO)
│   │       └── notifications/
│   │           ├── subscribe/route.ts   # Guardar suscripción push
│   │           └── send/route.ts        # Enviar push a todos
│   ├── components/
│   │   ├── Header.tsx                   # ★ ACTUALIZADO: Nav sticky + link Testimonios
│   │   ├── Footer.tsx                   # ★ ACTUALIZADO: Testimonios + Privacidad + Términos
│   │   ├── MobileNav.tsx                # ★ ACTUALIZADO: SVG manos rezando para Oración
│   │   ├── DailyVerse.tsx               # Versículo día + multi-emoji + share muro
│   │   ├── EpisodeCard.tsx              # Card episodio
│   │   ├── PlatformShowcase.tsx         # Grid YouTube/Spotify/Apple/Amazon
│   │   ├── PlatformLinks.tsx            # Botones plataforma por episodio
│   │   ├── SponsorShowcase.tsx          # Logos sponsors
│   │   ├── UserCounter.tsx              # Usuarios online (Firebase presence)
│   │   ├── InstallPrompt.tsx            # PWA install
│   │   └── NotificationPrompt.tsx       # Permiso push
│   └── lib/
│       ├── supabase.ts                  # ★ ACTUALIZADO: +20 funciones nuevas Sprint 2
│       ├── firebase.ts                  # Firebase init, auth, Firestore
│       ├── AuthContext.tsx              # ★ ACTUALIZADO: modal consentimiento primer login
│       ├── episodes.ts                  # 9 episodios hardcoded + merge logic
│       ├── verses.ts                    # 401 versículos hardcoded (día del año)
│       ├── data-service.ts              # Wrapper graceful sin config Supabase
│       └── sw.ts                        # Service worker + push handlers
├── supabase-schema.sql                  # Schema completo original
├── supabase-rls-fix.sql                 # Fix RLS para Firebase Auth
├── sql-actualizar.txt                   # Migraciones Sprint 1 (ya ejecutadas)
├── sql-sprint2.sql                      # ★ NUEVO: Migraciones Sprint 2 (EJECUTAR EN SUPABASE)
├── AGENTS.md                            # Reglas Next.js 16
└── ESTADO_PROYECTO.md                   # ← ESTE ARCHIVO
```

---

## ✅ Implementado hasta hoy

### Sprint 1 (funciones base)
1. **Home** — Hero, platform showcase, daily verse, quick links, latest episode
2. **Episodios** — Listado con búsqueda + filtro temporada; detalle SSG
3. **Nosotros** — CMS dinámico, auto-métricas, bio creadora, sponsors, testimonios públicos
4. **Oración** — Ver intenciones, reaccionar 🙏 (localStorage)
5. **Donar / Contacto / Encuentros** — Páginas estáticas
6. **Perfil** — Foto, nombre, fecha nac., teléfono, país, ciudad, bio, testimonio, actividades
7. **Testimonio** — Formulario → Supabase `testimonios` + email Gmail
8. **Comunidad** — 4 tabs (Oraciones/Reflexiones/Sugerencias/Muro)
9. **Actividades** — Tab "Actividades" con contador de inscritos
10. **Proyectos** — Cards desde Supabase `projects`
11. **Panel Admin** — 10 tabs: Proyectos, Episodios, Inicio, Participación, Auspiciadores, Perfiles, Páginas, Métricas, Notificaciones, Actividades

### Sprint 2 (15 jul 2026) ★
12. **Home mejorado** — Sección "Nuestro Impacto" (4 métricas auto), testimonios destacados, últimos 3 episodios
13. **Proyectos abiertos** — Visible sin login; botón "Unirme" con auth gate; contador real desde `project_participants`
14. **Página /testimonios** — Galería pública con testimonios aprobados por admin; visible sin login
15. **Flujo aprobación testimonios** — Admin tab "Testimonios": ve todos, aprueba → publica en `testimonios_publicos`
16. **Perfil mejorado** — Tabs "Mi Perfil" / "Mis Publicaciones"; validación +18 años; preferencias de notificaciones (5 toggles); botón "Eliminar mi cuenta" con modal de confirmación
17. **Notificaciones granulares** — Tabla `notification_preferences`; toggles por tipo: versículo, frase, comentarios, reacciones, anuncios
18. **AuthContext con consentimiento** — Modal primer login: acepta Términos + Privacidad → guarda en `user_consents`
19. **Páginas legales** — `/privacidad` (Ley 19.628/21.719 Chile) + `/terminos`
20. **Footer actualizado** — Links: Testimonios, Privacidad, Términos
21. **Header actualizado** — Link "Testimonios" en nav desktop
22. **MobileNav** — SVG inline manos rezando para tab Oración
23. **API DELETE /api/usuario** — Elimina todos los datos del usuario (derecho al olvido ARCO)
24. **Admin tab Testimonios** — CRUD + aprobación para publicación pública

---

## ⚠️ ACCIÓN REQUERIDA: SQL a ejecutar en Supabase

Ejecutar el archivo `sql-sprint2.sql` en el SQL Editor de Supabase antes de usar las nuevas funciones:

```sql
-- Crea: notification_preferences, project_participants, user_consents
-- Altera: testimonios (columna public), testimonios_publicos (columnas approved, approved_at)
```

---

## 🐛 Bugs detectados y fixeados

| # | Archivo | Problema | Fix |
|---|---------|----------|-----|
| 1 | `admin/proyectos` | `getAllReactionCounts('muro_post', '')` → siempre 0 | `getTotalReactionCount()` sin filtrar target_id |
| 2 | `comunidad` | EMOJI_ICONS incorrectos | Smile y Sparkles |
| 3 | `admin/proyectos` | localStorage muerto en proyectos | Eliminado |

---

## 📝 Decisiones de diseño importantes

1. **Auth híbrida**: Firebase Auth (Google) = identidad. Supabase = solo base de datos. RLS 100% público.
2. **Episodios — merge 3 capas**: (1) defaults hardcoded, (2) Supabase overrides, (3) localStorage admin.
3. **Reacciones multi-emoji**: Tabla única `reactions` con UNIQUE(target_type, target_id, user_id, emoji).
4. **Testimonios — flujo aprobación**: `testimonios` (privado) → admin aprueba → `testimonios_publicos` (público).
5. **Proyectos — inscripción**: tabla `project_participants`; conteo real; visible sin auth.
6. **Consentimiento legal**: `user_consents` tabla; modal en primer login; versión 1.0.
7. **Edad mínima**: 18 años — validación en perfil al guardar fecha de nacimiento.
8. **Build**: `npm run build` → TypeScript + Turbopack (warning serwist ignorado). Deploy automático Vercel en push a `main`.

---

## 🔄 Historial reciente (últimos commits)

| Commit | Mensaje | Qué cambió |
|--------|---------|------------|
| (pendiente push) | **Sprint 2 completo** | Home mejorado, proyectos abiertos, /testimonios, /privacidad, /terminos, perfil con tabs+18+notif+borrar, admin tab testimonios, AuthContext consent, Footer/Header/MobileNav actualizados, 20+ funciones supabase.ts, API DELETE /api/usuario |
| `28c75a9` | Features & fixes v3 | Reacciones 5 emojis, proyectos admin, tab Actividades |
| `000104c` | Fix 3 bugs | EMOJI_ICONS, localStorage muerto, totalReactions |

---

## 🚀 Próximos pasos sugeridos

### Inmediato (hacer ahora)
1. **Ejecutar `sql-sprint2.sql`** en Supabase SQL Editor
2. **Hacer git commit y push** → Vercel despliega automáticamente
3. **Probar en producción** el flujo completo

### Nivel 1 (pendientes del plan original)
- **Email bienvenida** — Al registrar primer login → Nodemailer envía plantilla HTML
- **Compartir episodio WhatsApp** — Botón en `/episodios/[id]`
- **Contador de visitas** — Tabla `page_views` o `episode_stats` para métricas reales

### Nivel 2 (futuro)
- **Devocionales diarios** — Más allá del versículo: reflexión + pregunta + oración guiada
- **Comentarios en episodios** — Debate comunidad bajo cada episodio
- **RSVP Encuentros** — Fechas reales, cupos, confirmación email

---

## 💡 Notas para el siguiente agente

- El admin **solo** detecta `piti.coal@gmail.com` (hardcoded en `ADMIN_EMAIL`).
- `verses.ts` tiene 401 versículos — no necesitan BD, rotan por `day of year`.
- `episodes.ts` tiene 9 defaults (S1: 3, S2: 6) — el admin edita en Supabase.
- `toggleReaction()` en `supabase.ts` devuelve `true` si agregó, `false` si quitó.
- **Sprint 2 SQL**: ejecutar `sql-sprint2.sql` antes de usar `project_participants`, `notification_preferences`, `user_consents`.
- `deleteAllUserData(userId)` usa `Promise.allSettled` — borra de todas las tablas en paralelo.
- `approveTestimonio()` hace upsert en `testimonios_publicos` por `user_id` (onConflict).
- `getProjectsWithCounts()` une `getProjects()` + conteo de `project_participants`.
- Modal consentimiento en `AuthContext.tsx` — se muestra si `hasUserConsented()` retorna false.
- Push notifications: VAPID keys en `.env` + `public/vapid-public-key` para el SW.
- Si algo falla en build: `npm run build` → revisa TypeScript errors.

---

**¡Sprint 2 completado! Build: ✅ 0 errores — 31 páginas** 🎯