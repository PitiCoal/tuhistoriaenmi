// Push B: "Hora de tu cita con Dios" — Se ejecuta cada hora
// Schedule: every hour
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async () => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. Obtener usuarios que no han abierto la app hoy (no tienen actividad hoy)
  const { data: inactiveUsers } = await supabase
    .from('user_engagement_daily')
    .select('user_id')
    .eq('date', todayStr)
    .eq('opened_app', false);

  if (!inactiveUsers || inactiveUsers.length === 0) {
    return new Response(JSON.stringify({ ok: true, skipped: 'all active today' }));
  }

  const inactiveIds = inactiveUsers.map(u => u.user_id);

  // 2. Obtener push subscriptions de estos usuarios
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, keys, user_id')
    .in('user_id', inactiveIds);

  if (!subs || subs.length === 0) {
    return new Response(JSON.stringify({ ok: true, skipped: 'no subscriptions for inactive' }));
  }

  // 3. Obtener perfiles para personalizar
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name')
    .in('user_id', inactiveIds);

  const nameMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    const name = nameMap.get(sub.user_id) || 'hermano/a';
    const title = `🕊️ ${name}, Dios te espera`;
    const body = 'Tómate 5 minutos. Tu devocional te aguarda.';
    const url = '/';

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
