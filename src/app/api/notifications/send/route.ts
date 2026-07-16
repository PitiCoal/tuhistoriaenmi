import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

webpush.setVapidDetails(
  'mailto:contacto.tuhistoriaenmi@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const payloadJson = await req.json();
    const { 
      title, 
      body, 
      url, 
      userId, 
      type, 
      senderName, 
      messageText, 
      postId 
    } = payloadJson;

    // --- CASE 1: DIRECT NOTIFICATION TO A SPECIFIC USER (Comments or Reactions) ---
    if (userId) {
      // 1. Verify User's Preferences
      // Column names in DB: 'comments', 'reactions', 'announcements', 'daily_verse', 'daily_phrase'
      const preferenceKey = type || 'announcements';
      const { data: pref } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const isEnabled = !pref || pref[preferenceKey] !== false;
      if (!isEnabled) {
        return NextResponse.json({ ok: true, skipped: true, reason: 'User disabled notifications of this type' });
      }

      // Guardar en la tabla de notificaciones internas de la App
      try {
        await supabase.from('notifications').insert({
          user_id: userId,
          title: title || 'Nueva interacción',
          body: body || 'Tienes una nueva notificación en la plataforma.',
          url: url || '/comunidad',
          is_read: false
        });
      } catch (dbErr) {
        console.error('Error writing in-app notification to DB:', dbErr);
      }

      // 2. Fetch Recipient Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, display_name')
        .eq('user_id', userId)
        .maybeSingle();

      // 3. Fetch Push Subscriptions
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('endpoint, keys')
        .eq('user_id', userId);

      let pushSent = 0;
      let pushFailed = 0;

      const pushPayload = JSON.stringify({ 
        title: title || 'Nueva interacción', 
        body: body || 'Alguien interactuó con tu publicación', 
        url: url || '/comunidad' 
      });

      if (subscriptions && subscriptions.length > 0) {
        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification({
              endpoint: sub.endpoint,
              keys: sub.keys as any,
            }, pushPayload);
            pushSent++;
          } catch (err: any) {
            if (err.statusCode === 410 || err.statusCode === 404) {
              await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
            }
            pushFailed++;
          }
        }
      }

      // 4. Fallback: If push notifications were not sent (no subscriptions or all failed), send Email
      let emailSent = false;
      if (pushSent === 0 && profile && profile.email) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_EMAIL,
              pass: process.env.GMAIL_APP_PASSWORD,
            },
          });

          const recipientName = profile.display_name || 'hermano/a';
          let notificationSubject = 'Nueva actividad en Tu Historia En Mí';
          let notificationHtmlMessage = '';
          let preview = '';

          if (type === 'comments') {
            notificationSubject = '💬 ¡Alguien respondió a tu publicación!';
            notificationHtmlMessage = `<strong>${senderName || 'Un usuario'}</strong> respondió a tu publicación en el Muro Comunitario:`;
            preview = messageText || '';
          } else if (type === 'reactions') {
            notificationSubject = '❤️ ¡Alguien reaccionó a tu publicación!';
            const emojiText = messageText ? `con ${messageText}` : '';
            notificationHtmlMessage = `<strong>${senderName || 'Un usuario'}</strong> reaccionó ${emojiText} a tu publicación en el Muro Comunitario.`;
          } else {
            notificationHtmlMessage = body || 'Tienes una nueva interacción pendiente en la plataforma.';
          }

          const actionUrl = url ? `https://tuhistoriaenmi.vercel.app${url}` : 'https://tuhistoriaenmi.vercel.app/comunidad';

          await transporter.sendMail({
            from: `"Tu Historia En Mí" <${process.env.GMAIL_EMAIL}>`,
            to: profile.email,
            subject: notificationSubject,
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #eef2f5; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #ffffff;">
                <div style="background-color: #1A3A5C; padding: 24px; text-align: center; color: #ffffff;">
                  <h2 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">Tu Historia En Mí</h2>
                </div>
                <div style="padding: 32px 24px; color: #333333; line-height: 1.6;">
                  <p style="font-size: 16px; font-weight: 600; color: #1A3A5C; margin-top: 0;">¡Hola, ${recipientName}!</p>
                  <p>${notificationHtmlMessage}</p>
                  ${preview ? `<div style="background-color: #f8fafc; border-left: 4px solid #1A3A5C; padding: 12px; margin: 16px 0; font-style: italic; border-radius: 0 8px 8px 0; color: #555;">"${preview}"</div>` : ''}
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${actionUrl}" style="background-color: #1A3A5C; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(26,58,92,0.15);">
                      Ver en la comunidad
                    </a>
                  </div>
                </div>
                <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #6B6358; border-top: 1px solid #eef2f5;">
                  <p style="margin: 0 0 4px 0;">&copy; ${new Date().getFullYear()} Tu Historia En Mí. Todos los derechos reservados.</p>
                  <p style="margin: 0;">Recibes este correo de respaldo porque tienes activas las notificaciones en tu perfil y no pudimos contactarte por notificación push.</p>
                </div>
              </div>
            `,
          });
          emailSent = true;
        } catch (emailErr) {
          console.error('Fallback email error:', emailErr);
        }
      }

      return NextResponse.json({ ok: true, pushSent, pushFailed, emailSent });
    }

    // --- CASE 2: BROADCAST NOTIFICATION (Mass messaging) ---
    if (!title) {
      return NextResponse.json({ error: 'title es requerido' }, { status: 400 });
    }

    let subscriptionsQuery = supabase.from('push_subscriptions').select('endpoint, keys, user_id');

    // Filter by type preference if specified
    if (type) {
      // Get user IDs with this preference enabled
      const { data: prefUsers } = await (supabase
        .from('notification_preferences') as any)
        .select('user_id')
        .eq(type, true);

      const userIds = (prefUsers || []).map((p: any) => p.user_id);

      if (userIds.length > 0) {
        // Send to users who enabled it, OR anonymous subscribers (user_id IS NULL)
        subscriptionsQuery = subscriptionsQuery.or(`user_id.in.(${userIds.join(',')}),user_id.is.null`);
      } else {
        // Only send to anonymous subscribers if no logged in users have it enabled
        subscriptionsQuery = subscriptionsQuery.is('user_id', null);
      }
    }

    const { data: subscriptions, error: subError } = await subscriptionsQuery;

    if (subError) {
      return NextResponse.json({ error: 'Error fetching subscriptions' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: 'No hay suscripciones activas que coincidan con la preferencia' }, { status: 404 });
    }

    const payload = JSON.stringify({ title, body: body || '', url: url || '/' });
    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: sub.keys as any,
        }, payload);
        sent++;
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
        failed++;
      }
    }

    return NextResponse.json({ ok: true, sent, failed });
  } catch (err) {
    console.error('Send notification error:', err);
    return NextResponse.json({ error: 'Error al enviar notificaciones' }, { status: 500 });
  }
}
