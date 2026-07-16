# ESTADO DEL PROYECTO — Tu Historia en Mí

> Última actualización: **16 jul 2026** — Sprint 4 completado y verificado ✅
> Documento de presentación técnica, evaluación de funciones y estado actual del software.

---

## 📋 Descripción del proyecto

**Tu Historia en Mí** es una plataforma web y aplicación progresiva (PWA) cristiana, construida sobre **Next.js 16 (App Router)**, **Tailwind CSS v4** y **Supabase** como motor de datos persistentes. La plataforma sirve como puente de comunión y comunicación de fe.

### Características Principales:
1. **Podcast de Testimonios:** Listado y detalles individuales de episodios con enlaces y métricas de clic hacia plataformas (Spotify, YouTube, Apple Music, Amazon Music).
2. **Devocionales Diarios Interactivos:** Reflexiones y versículos diarios con guardado personal y opción de compartir reflexiones en el Muro de la Comunidad.
3. **Muro Comunitario Unificado:** Tablero de publicaciones públicas segmentadas por categorías (General, Oraciones, Reflexiones, Sugerencias), con soporte de comentarios, reacciones multi-emoji (🙏❤️😊✨) e imágenes.
4. **Proyectos y Actividades:** Calendario de proyectos comunitarios visibles públicamente con contadores reales y botón interactivo para unirse.
5. **Analytics de Tráfico:** Métricas internas de visitas y clics de reproducción con dashboard administrativo de control.
6. **Cumplimiento de Privacidad y Consentimiento:** Modal de aceptación de términos obligatorio en primer ingreso, flujo de correo de bienvenida y botón de borrado de cuenta permanente (derecho al olvido ARCO).

---

## 🏗️ Stack técnico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16.2.10 (App Router) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4 (Responsivo Mobile-First) |
| Auth | Firebase Auth (Google Sign-In) |
| Base de datos | Supabase (PostgreSQL) — Conexión nativa mediante Cliente |
| Email | Nodemailer (Gmail SMTP mediante App Password) |
| Push | Web Push API + Serwist (Service Workers) |
| Iconos | lucide-react |
| Hosting | Vercel (CI/CD conectado a GitHub) |

---

## 📁 Estructura de archivos clave

```
tuhistoriaenmi-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Home: hero, métricas, versículo diario, 3 eps, testimonios destacados
│   │   ├── layout.tsx                   # Layout global, AnalyticsTracker, MobileNav, AuthProvider
│   │   ├── episodios/                   # Listado y detalle de episodios (con OpenGraph dinámico para SEO)
│   │   ├── comunidad/page.tsx           # Hub Comunitario: Muro con categorías y Actividades (Público)
│   │   ├── nosotros/page.tsx            # Quiénes somos, métricas dinámicas, testimonios de la comunidad
│   │   ├── testimonios/page.tsx         # Galería pública de testimonios aprobados
│   │   ├── donar/page.tsx               # Donaciones con barra de progreso de metas dinámicas
│   │   ├── perfil/page.tsx              # Perfil de usuario, borrado de cuenta y preferencias de notificaciones
│   │   ├── admin/proyectos/page.tsx     # Panel admin con 12 pestañas (incluyendo MuroAdminTab)
│   │   └── api/
│   │       ├── welcome/route.ts         # Envío de correo de bienvenida premium con Nodemailer
│   │       ├── notifications/
│   │       │   ├── subscribe/route.ts   # Guardado de suscripciones Push
│   │       │   └── send/route.ts        # Backend de envíos segmentados y masivos con fallback de Email
│   └── lib/
│       ├── supabase.ts                  # Query helper: conexión y lógica SQL completa
│       ├── AuthContext.tsx              # Auth Firebase + Modal de consentimiento de políticas
│       └── verses.ts                    # Biblioteca estática de 401 versículos ordenados por día del año
├── sql-sprint4.sql                      # Migraciones SQL Sprint 4 (EJECUTAR EN SUPABASE)
├── package.json                         # Dependencias y scripts de Next.js
└── TSConfig.json                        # Configuración de TypeScript
```

---

## 📋 Evaluación Precisa de Funcionalidades y Backend

### 1. Sistema de Consentimiento y Registro (Login)
*   **Funcionamiento:** En el primer login mediante Google, se comprueba si el usuario existe en `user_consents`. Si no, se bloquea la navegación con un modal que muestra las políticas de privacidad y términos. Al aceptar, se registra en la base de datos y se dispara un fetch a `/api/welcome` que envía un correo de bienvenida.
*   **Persistencia:** Tabla `user_consents` (almacena `user_id`, `accepted_at` y `version`).
*   **Responsividad:** Modal adaptado a pantallas táctiles y móviles con scroll interno.

### 2. Muro Comunitario Unificado
*   **Funcionamiento:** Centraliza todas las intenciones de oración, reflexiones, sugerencias y posts generales en un solo feed cronológico. El formulario permite seleccionar la categoría mediante pastillas (General, Oración, Reflexión, Sugerencia). Los usuarios pueden dar reacciones emoji e interactuar con respuestas en forma de acordeón.
*   **Persistencia:** Tablas `muro_posts`, `muro_replies`, `reactions` (con target `muro_post`).
*   **Filtros:** Barra de filtros rápidos en cabecera del feed para leer solo categorías específicas.
*   **Acceso Público:** Los visitantes no registrados pueden leer todo el Muro; la ventana de login se activa solo si intentan publicar, reaccionar o responder.

### 3. Calendario de Proyectos y Actividades
*   **Funcionamiento:** Los administradores crean actividades y proyectos. Los usuarios registrados pueden inscribirse haciendo clic en "Unirme".
*   **Persistencia:** Tablas `projects`, `project_participants` y `activities`.
*   **Flexibilidad en Fechas:** El formulario de creación en el panel admin admite texto libre en fechas (p. ej. "Pendiente" o "Por confirmar") con botones rápidos para evitar inputs estrictos de fecha.
*   **Subida Opcional:** El selector de archivos para subir imágenes está optimizado con Tailwind para evitar desbordes y aclara explícitamente que la carga es opcional.

### 4. Canal de Notificaciones Inteligentes (Push + Email Fallback)
*   **Funcionamiento:** Cuando un usuario recibe un comentario o una reacción en su post, el backend comprueba sus preferencias (`notification_preferences`). Si tiene el tipo de notificación activado:
    1. Si tiene suscripciones activas en `push_subscriptions`, se envía una notificación Web Push.
    2. Si no tiene suscripciones push activas, se envía un correo electrónico premium de aviso a su casilla Gmail.
*   **Notificaciones Masivas:** En el panel admin se puede enviar un broadcast masivo segmentado por tipo (`announcements`, `daily_verse`, `daily_phrase`).

---

## 🛠️ Panel de Administración Completo (Pestañas)

El panel admin es accesible únicamente por el correo de administración de Piedad (`piti.coal@gmail.com`) y consta de **12 pestañas funcionales**:

1.  **Proyectos:** CRUD de proyectos comunitarios. Edición de título, descripción, fecha flexible, estado, número de participantes e imagen (subir archivo o pegar URL).
2.  **Episodios:** CRUD de episodios del podcast. Vinculación de enlaces a Spotify, YouTube, Apple y Amazon Music, número de temporada y episodio.
3.  **Inicio:** Cambiar la imagen principal (Hero) de la página de portada y editar título/subtítulo.
4.  **Muro (Nuevo):** Moderación del Muro Comunitario. Permite listar todas las publicaciones de la comunidad, abrir sus comentarios y eliminar publicaciones o respuestas inapropiadas con un botón.
5.  **Auspiciadores:** CRUD de auspiciadores (patrocinadores) vinculados por ID a los episodios y devocionales.
6.  **Perfiles:** Tabla de administración con todos los perfiles de usuario registrados en la base de datos.
7.  **Páginas:** Editor de contenido dinámico para las secciones fijas de la página de "Nosotros" y de la barra de progreso de metas en la página de "Donar".
8.  **Métricas:** Dashboard de visitas totales (tráfico del sitio) y clics de reproducción detallados por plataforma de streaming.
9.  **Notificaciones:** Formulario de envío de notificaciones de broadcast con selector de categoría para segmentación.
10. **Actividades:** CRUD de talleres y actividades en las que los usuarios pueden inscribirse.
11. **Testimonios:** Flujo de moderación y aprobación de testimonios de la comunidad para publicarlos en la galería de `/testimonios`.
12. **Devocionales:** CRUD y subida masiva de devocionales por archivo CSV.

---

## ⚠️ Migración SQL Sprint 4 a ejecutar en Supabase

Es **obligatorio** ejecutar la siguiente consulta en el **SQL Editor** de Supabase para que las tablas de consentimiento, preferencias, participantes y categorías de posts funcionen correctamente:

```sql
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
```

---

## 🏁 Estado de Compilación
*   **Build de Next.js:** Compilado a producción exitosamente (`npm run build`).
*   **Advertencias:** Cero warnings o errores de compilación TypeScript.
*   **Despliegue:** Integrado con Vercel. Se despliega automáticamente al subir cambios a la rama principal (`main`).