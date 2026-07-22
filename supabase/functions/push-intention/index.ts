// Push A: "Intención del día" — Se ejecuta 09:00 AM (cron)
// Schedule: every day 09:00
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface Notification {
  user_id: string;
  endpoint: string;
  keys: any;
  title: string;
  body: string;
  url: string;
}

Deno.serve(async () => {
  // 1. Obtener una intención de oración aleatoria del muro
  const { data: intention } = await supabase
    .from('muro_posts')
    .select('content, author_name, user_id')
    .eq('category', 'oracion')
    .order('created_at', { ascending: false })
    .limit(20);

  if (!intention || intention.length === 0) {
    return new Response(JSON.stringify({ ok: true, skipped: 'no intentions' }));
  }

  const randomIntention = intention[Math.floor(Math.random() * intention.length)];
  const truncated = randomIntention.content.slice(0, 80);
  const authorName = randomIntention.author_name || 'Un hermano/a';

  // 2. Obtener usuarios con daily_verse=true y push subscriptions
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, keys, user_id');

  if (!subs || subs.length === 0) {
    return new Response(JSON.stringify({ ok: true, skipped: 'no subscriptions' }));
  }

  const title = `🙏 ${authorName} pide oración por:`;
  const body = `${truncated}...`;
  const url = '/comunidad?filter=oracion';

  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      await fetch(sub.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, url }),
      });
      sent++;
    } catch {
      failed++;
    }
  }

  return new Response(JSON.stringify({ ok: true, sent, failed }));
});
