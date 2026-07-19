# Handover & Technical Documentation (Para Futuros Desarrolladores o Agentes IA)

Este documento contiene toda la información de arquitectura, base de datos, credenciales, cambios recientes y próximos pasos para la continuación del desarrollo de **Tu Historia En Mí**.

---

## 🗺️ Visión General del Proyecto
**Tu Historia En Mí** es una plataforma web y aplicación móvil (PWA) de acompañamiento espiritual, testimonios de fe y comunidad. Cuenta con diario de reflexiones privado, muro de intenciones público, reproducción de podcast, inscripción en proyectos solidarios e interactividad comunitaria.

* **URL de Producción:** `https://tuhistoriaenmi.vercel.app`
* **Repositorio GitHub:** `https://github.com/PitiCoal/tuhistoriaenmi.git`

---

## 🛠️ Stack Tecnológico
1. **Frontend:** React, Next.js 16.2 (App Router con TypeScript).
2. **Estilos:** TailwindCSS.
3. **PWA (Progressive Web App):** `@serwist/next` (Manejo de Service Worker y caché en `src/lib/sw.ts` y `public/sw.js`).
4. **Base de Datos y Backend-as-a-Service:**
   * **Supabase:** Gestión de base de datos PostgreSQL, Storage (imágenes), y lógica de negocio en `src/lib/supabase.ts`.
   * **Firebase Auth:** Autenticación de usuarios por Google (OAuth) en `src/lib/firebase.ts`.
5. **Correos Automatizados:** API en `/api/welcome` que despacha correos vía SMTP de Gmail utilizando `nodemailer`.

---

## 🔐 Cuentas Administradoras Oficiales
El panel de administración `/admin/proyectos` y las funciones de edición de metas en pantalla (*Admin Inline Edit*) están habilitadas para los siguientes correos:
1. **`piti.coal@gmail.com`**
2. **`contacto.tuhistoriaenmi@gmail.com`**

Cualquier cambio de roles o nuevos administradores debe agregarse a la constante `ADMIN_EMAILS` en los siguientes archivos:
* `src/components/Header.tsx`
* `src/components/DonationGoal.tsx`
* `src/app/admin/proyectos/page.tsx`
* `src/app/perfil/page.tsx`

---

## 📧 Envío de Correos (API de Bienvenida)
La ruta `/api/welcome` lee las siguientes variables de entorno de producción en Vercel para despachar los mails:
* `GMAIL_EMAIL`: `contacto.tuhistoriaenmi@gmail.com`
* `GMAIL_APP_PASSWORD`: `yuhykrfcijbfnrgf` (Contraseña de aplicación de 16 letras generada en la consola de seguridad de Google).

---

## 📁 Estructura del Proyecto y Archivos Clave
* `src/lib/supabase.ts`: Funciones cliente de Supabase (consultas, inserciones, métricas y contadores automáticos).
* `src/lib/AuthContext.tsx`: Contexto de autenticación. Aquí reside el `ConsentModal` que obliga a los nuevos usuarios a marcar explícitamente el checkbox de aceptación de la Política de Privacidad y los Términos de Uso antes de participar.
* `src/components/DonationGoal.tsx`: Tarjeta de meta de recaudación interactiva. Cuenta con edición directa (*lápiz ✏️*) en pantalla si el usuario tiene rol de administrador.
* `documentos_fundacion/`: Carpeta física en la raíz que contiene la documentación legal y financiera para la constitución de la fundación sin fines de lucro en Las Condes:
  * `1_informe_presentacion_impacto.md` (Costos operativos en USD/CLP e infraestructura).
  * `2_propuesta_auspiciadores_financiamiento.md` (Propuesta de auspicios comerciales).
  * `3_guia_pasos_constitucion_chile.md` (Pasos legales ante Municipalidad y SII).
  * `4_borrador_estatutos_fundacion.md` (Minuta para notaría).
  * `5_acta_constitutiva_fundacion.md` (Borrador del acta inicial).

---

## 💾 Tablas Clave en Supabase (Base de Datos)
* `settings`: Contiene configuraciones dinámicas de la plataforma (ej. `donation_active`, `donation_target`, `donation_current`, `donation_title`, `hero_image`).
* `muro_posts`: Publicaciones del muro comunitario.
* `muro_replies`: Respuestas a publicaciones del muro.
* `user_consents`: Registro de usuarios que aceptaron la política de privacidad y términos (se guarda `user_id`, `accepted_at` y `version`).
* `activities` / `projects`: Actividades de voluntariado e inscripción comunitaria.
* `testimonios` / `testimonios_publicos`: Testimonios privados e historias de fe aprobadas para visualización pública.

---

## 🚀 Cambios Recientes (Preparación de Marcha Blanca)
1. **Privacidad Obligatoria:** Agregado el checkbox requerido al modal de inicio para cumplir normativas de privacidad (Ley 19.628 de Chile). Si el usuario no acepta, el botón de ingreso se deshabilita y se ofrece un botón claro para "No aceptar y cerrar sesión".
2. **Sembrado del Muro:** Insertados 3 posts iniciales (Bienvenida, Oración y Reflexión) para evitar muro vacío.
3. **Actividad de Prueba:** Insertada la actividad `"Encuentro Virtual y Bienvenida (Marcha Blanca)"` en la tabla `activities` para testeo de inscripciones.
4. **Vínculo Local-Nube (Vercel):** El repositorio local quedó enlazado al proyecto oficial en Vercel (`tuhistoriaenmi-app`) y autenticado. Las variables de entorno de producción fueron modificadas directamente desde la terminal.

---

## 🔮 Sugerencias para el Siguiente Agente o Desarrollador
* **Prueba de Notificaciones Push:** Si los usuarios de marcha blanca reportan fallos con las alertas, revisar la configuración de las claves VAPID en `src/lib/supabase.ts` y el registro de suscripciones en la tabla `push_subscriptions`.
* **Monitoreo de Límites de Supabase (Free Tier):** Mantener un ojo en el tamaño de imágenes en el bucket `muro-images` para no exceder el límite gratuito de 1 GB.
* **Integración del Botón de WhatsApp:** En el futuro, se podría requerir un enlace directo flotante de contacto de WhatsApp para soporte durante la marcha blanca.
