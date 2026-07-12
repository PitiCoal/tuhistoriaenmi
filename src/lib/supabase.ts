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

// ===== PROFILES =====
export async function getProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
  return data;
}

export async function upsertProfile(profile: { user_id: string; display_name?: string; photo_url?: string; country?: string; age?: number; bio?: string }) {
  return supabase.from('profiles').upsert(profile, { onConflict: 'user_id' });
}

export async function getAllProfiles() {
  const { data } = await supabase.from('profiles').select('*').order('display_name');
  return data || [];
}

// ===== MURO POSTS =====
export async function getMuroPosts() {
  const { data } = await supabase.from('muro_posts').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function createMuroPost(post: { user_id?: string | null; author_name?: string | null; content: string; image_url?: string | null }) {
  return supabase.from('muro_posts').insert(post).select().single();
}

export async function deleteMuroPost(id: string) {
  return supabase.from('muro_posts').delete().eq('id', id);
}

// ===== MURO REPLIES =====
export async function getMuroReplies(postId: string) {
  const { data } = await supabase.from('muro_replies').select('*').eq('post_id', postId).order('created_at', { ascending: true });
  return data || [];
}

export async function createMuroReply(reply: { post_id: string; user_id?: string | null; author_name?: string | null; content: string }) {
  return supabase.from('muro_replies').insert(reply).select().single();
}

export async function deleteMuroReply(id: string) {
  return supabase.from('muro_replies').delete().eq('id', id);
}

// ===== STORAGE UPLOAD =====
// ===== REACTIONS =====
export async function toggleReaction(targetType: string, targetId: string, userId: string) {
  const existing = await supabase.from('reactions').select('id')
    .eq('target_type', targetType).eq('target_id', targetId).eq('user_id', userId)
    .maybeSingle();
  if (existing.data) {
    await supabase.from('reactions').delete().eq('id', existing.data.id);
    return false;
  }
  await supabase.from('reactions').insert({ target_type: targetType, target_id: targetId, user_id: userId });
  return true;
}

export async function getReactionCount(targetType: string, targetId: string) {
  const { count } = await supabase.from('reactions')
    .select('*', { count: 'exact', head: true })
    .eq('target_type', targetType).eq('target_id', targetId);
  return count || 0;
}

export async function getUserReactions(targetType: string, userId: string) {
  const { data } = await supabase.from('reactions')
    .select('target_id').eq('target_type', targetType).eq('user_id', userId);
  return new Set(data?.map(r => r.target_id) || []);
}

// ===== STORAGE UPLOAD =====
export async function uploadFile(bucket: 'profile-photos' | 'muro-images', folder: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) { console.error('Upload error:', error); return null; }
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}
