import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
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
    const { title, body, url } = await req.json();
    if (!title) {
      return NextResponse.json({ error: 'title es requerido' }, { status: 400 });
    }

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('endpoint, keys');

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: 'No hay suscripciones' }, { status: 404 });
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
