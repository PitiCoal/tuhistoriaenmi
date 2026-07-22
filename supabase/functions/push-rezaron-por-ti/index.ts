// Push C: "Validación social — X rezaron por ti" — Cada 4h
// Schedule: every 4 hours
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async () => {
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

  // 1. Encontrar posts con ≥2 reacciones 🙏 en las últimas 4h
  const { data: reactions } = await supabase
    .from('reactions')
    .select('target_id, user_id')
    .eq('target_type', 'muro_post')
    .eq('emoji', '🙏')
    .gte('created_at', fourHoursAgo);

  if (!reactions || reactions.length < 2) {
    return new Response(JSON.stringify({ ok: true, skipped: 'not enough reactions' }));
  }

  // Agrupar por post
  const postCounts = new Map<string, { count: number; userIds: Set<string> }>();
  for (const r of reactions) {
    if (!postCounts.has(r.target_id)) {
      postCounts.set(r.target_id, { count: 0, userIds: new Set() });
    }
    const entry = postCounts.get(r.target_id)!;
    entry.count++;
    entry.userIds.add(r.user_id);
  }

  // 2. Obtener autores de posts con ≥2 reacciones
  const qualifyingPostIds = Array.from(postCounts.entries())
    .filter(([_, v]) => v.count >= 2)
    .map(([id]) => id);

  if (qualifyingPostIds.length === 0) {
    return new Response(JSON.stringify({ ok: true, skipped: 'no qualifying posts' }));
  }

  const { data: posts } = await supabase
    .from('muro_posts')
    .select('id, user_id')
    .in('id', qualifyingPostIds);

  if (!posts) {
    return new Response(JSON.stringify({ ok: true, skipped: 'no posts found' }));
  }

  // 3. Enviar push a cada autor
  let sent = 0;
  let failed = 0;

  for (const post of posts) {
    if (!post.user_id) continue;
    const count = postCounts.get(post.id)?.count || 0;

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, keys')
      .eq('user_id', post.user_id);

    if (!subs || subs.length === 0) continue;

    const title = `❤️ ¡${count} hermanos rezaron por tu intención!`;
    const body = '¿Cómo estás hoy? Vuelve a la comunidad y comparte.';
    const url = `/comunidad?post=${post.id}`;

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
  }

  return new Response(JSON.stringify({ ok: true, sent, failed }));
});
