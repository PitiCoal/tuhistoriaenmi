const SUPABASE_CONFIGURED =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'TU_SUPABASE_URL';

// ===== EPISODES =====
export async function saveEpisodeToCloud(episode: any) {
  if (!SUPABASE_CONFIGURED) return;
  try {
    const { supabase } = await import('./supabase');
    await supabase.from('episodes').upsert(episode, { onConflict: 'id' });
  } catch {}
}

export async function loadEpisodesFromCloud(): Promise<any[] | null> {
  if (!SUPABASE_CONFIGURED) return null;
  try {
    const { supabase } = await import('./supabase');
    const { data } = await supabase.from('episodes').select('*').order('season').order('episode');
    return data || null;
  } catch { return null; }
}

export async function deleteEpisodeFromCloud(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  try {
    const { supabase } = await import('./supabase');
    await supabase.from('episodes').delete().eq('id', id);
  } catch {}
}

// ===== HERO IMAGE =====
export async function saveHeroToCloud(url: string) {
  if (!SUPABASE_CONFIGURED) return;
  try {
    const { supabase } = await import('./supabase');
    const existing = await supabase.from('settings').select('key').eq('key', 'hero_image').maybeSingle();
    if (existing.data) await supabase.from('settings').update({ value: url }).eq('key', 'hero_image');
    else await supabase.from('settings').insert({ key: 'hero_image', value: url });
  } catch {}
}

export async function loadHeroFromCloud(): Promise<string | null> {
  if (!SUPABASE_CONFIGURED) return null;
  try {
    const { supabase } = await import('./supabase');
    const { data } = await supabase.from('settings').select('value').eq('key', 'hero_image').maybeSingle();
    return data?.value || null;
  } catch { return null; }
}

// ===== PARTICIPA =====
export async function saveParticipaToCloud(entry: any) {
  if (!SUPABASE_CONFIGURED) return;
  try {
    const { supabase } = await import('./supabase');
    await supabase.from('participa').insert({
      id: entry.id,
      tab: entry.tab,
      text: entry.text,
      name: entry.name || null,
      created_at: new Date(entry.createdAt).toISOString(),
      reactions: entry.reactions || 0,
    });
  } catch {}
}

export async function loadParticipaFromCloud(): Promise<any[] | null> {
  if (!SUPABASE_CONFIGURED) return null;
  try {
    const { supabase } = await import('./supabase');
    const { data } = await supabase.from('participa').select('*').order('created_at', { ascending: false });
    return data || null;
  } catch { return null; }
}

export async function deleteParticipaFromCloud(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  try {
    const { supabase } = await import('./supabase');
    await supabase.from('participa').delete().eq('id', id);
  } catch {}
}
