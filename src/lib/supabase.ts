import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function loadEpisodes() {
  const { data } = await supabase.from('episodes').select('*').order('season').order('episode');
  return data || [];
}

export async function saveEpisode(episode: any) {
  const existing = await supabase.from('episodes').select('id').eq('id', episode.id).single();
  if (existing.data) {
    return supabase.from('episodes').update(episode).eq('id', episode.id);
  }
  return supabase.from('episodes').insert(episode);
}

export async function deleteEpisode(id: string) {
  return supabase.from('episodes').delete().eq('id', id);
}

export async function loadHeroImage() {
  const { data } = await supabase.from('settings').select('value').eq('key', 'hero_image').single();
  return data?.value || null;
}

export async function saveHeroImage(url: string) {
  const existing = await supabase.from('settings').select('id').eq('key', 'hero_image').single();
  if (existing.data) {
    return supabase.from('settings').update({ value: url }).eq('key', 'hero_image');
  }
  return supabase.from('settings').insert({ key: 'hero_image', value: url });
}

export async function loadParticipaEntries() {
  const { data } = await supabase.from('participa').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function saveParticipaEntry(entry: any) {
  return supabase.from('participa').insert(entry);
}

export async function deleteParticipaEntry(id: string) {
  return supabase.from('participa').delete().eq('id', id);
}
