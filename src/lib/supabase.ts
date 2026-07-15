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

// ===== PROFILES =====
export async function getProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
  return data;
}

export async function upsertProfile(profile: {
  user_id: string;
  display_name?: string;
  photo_url?: string;
  email?: string;
  date_of_birth?: string;
  phone?: string;
  country?: string;
  city?: string;
  bio?: string;
  testimonio?: string;
}) {
  return supabase.from('profiles').upsert(profile, { onConflict: 'user_id' });
}

export async function getAllProfiles() {
  const { data } = await supabase.from('profiles').select('*').order('display_name');
  return data || [];
}

// ===== USER ACTIVITIES =====
export async function getUserActivities(userId: string) {
  const { data } = await supabase.from('user_activities').select('activity').eq('user_id', userId);
  return new Set(data?.map(r => r.activity) || []);
}

export async function setUserActivities(userId: string, activities: string[]) {
  await supabase.from('user_activities').delete().eq('user_id', userId);
  if (activities.length > 0) {
    const rows = activities.map(a => ({ user_id: userId, activity: a }));
    return supabase.from('user_activities').insert(rows);
  }
  return { error: null };
}

export async function getAllUserActivities() {
  const { data } = await supabase.from('user_activities').select('user_id, activity');
  return data || [];
}

// ===== PAGE CONTENT (CMS) =====
export async function getPageContent(page: string) {
  const { data } = await supabase.from('page_content').select('section, content').eq('page', page);
  const map: Record<string, string> = {};
  (data || []).forEach(r => { map[r.section] = r.content || ''; });
  return map;
}

export async function upsertPageContent(page: string, section: string, content: string) {
  return supabase.from('page_content').upsert(
    { page, section, content, updated_at: new Date().toISOString() },
    { onConflict: 'page,section' }
  );
}

export async function getAllPagesContent() {
  const { data } = await supabase.from('page_content').select('*').order('page').order('section');
  return data || [];
}

// ===== IMPACT METRICS =====
export async function getImpactMetrics() {
  const { data } = await supabase.from('impact_metrics').select('*').order('sort_order');
  return data || [];
}

export async function createImpactMetric(m: { label: string; value: string; icon?: string; sort_order?: number }) {
  return supabase.from('impact_metrics').insert(m).select().single();
}

export async function updateImpactMetric(id: string, m: { label?: string; value?: string; icon?: string; sort_order?: number }) {
  return supabase.from('impact_metrics').update(m).eq('id', id);
}

export async function deleteImpactMetric(id: string) {
  return supabase.from('impact_metrics').delete().eq('id', id);
}

// ===== COUNTS (for auto-metrics) =====
export async function countProfiles() {
  const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  return count || 0;
}

export async function countEpisodes() {
  const { count } = await supabase.from('episodes').select('*', { count: 'exact', head: true });
  return count || 0;
}

export async function countTestimonios() {
  const { count } = await supabase.from('testimonios').select('*', { count: 'exact', head: true });
  return count || 0;
}

export async function countSponsors() {
  const { count } = await supabase.from('sponsors').select('*', { count: 'exact', head: true });
  return count || 0;
}

// ===== ACTIVITIES (eventos dinámicos) =====
export async function getActivities(onlyActive = false) {
  let q = supabase.from('activities').select('*').order('sort_order');
  if (onlyActive) q = q.eq('active', true);
  const { data } = await q;
  return data || [];
}

export async function getActivitiesWithCounts() {
  const activities = await getActivities(true);
  const { data: userActivities } = await supabase.from('user_activities').select('activity');
  const counts: Record<string, number> = {};
  (userActivities || []).forEach(r => { counts[r.activity] = (counts[r.activity] || 0) + 1; });
  return activities.map(a => ({ ...a, participants: counts[a.name] || 0 }));
}

export async function createActivity(a: { name: string; description?: string; active?: boolean; sort_order?: number }) {
  return supabase.from('activities').insert(a).select().single();
}

export async function updateActivity(id: string, a: { name?: string; description?: string; active?: boolean; sort_order?: number }) {
  return supabase.from('activities').update(a).eq('id', id);
}

export async function deleteActivity(id: string) {
  return supabase.from('activities').delete().eq('id', id);
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

// ===== REACTIONS (multi-emoji) =====
export async function toggleReaction(targetType: string, targetId: string, userId: string, emoji: string = '🙏') {
  const existing = await supabase.from('reactions').select('id')
    .eq('target_type', targetType).eq('target_id', targetId).eq('user_id', userId).eq('emoji', emoji)
    .maybeSingle();
  if (existing.data) {
    await supabase.from('reactions').delete().eq('id', existing.data.id);
    return false;
  }
  await supabase.from('reactions').insert({ target_type: targetType, target_id: targetId, user_id: userId, emoji });
  return true;
}

export async function getReactionCount(targetType: string, targetId: string, emoji?: string) {
  let query = supabase.from('reactions')
    .select('*', { count: 'exact', head: true })
    .eq('target_type', targetType).eq('target_id', targetId);
  if (emoji) query = query.eq('emoji', emoji);
  const { count } = await query;
  return count || 0;
}

export async function getUserReactions(targetType: string, userId: string, emoji?: string) {
  let query = supabase.from('reactions')
    .select('target_id, emoji').eq('target_type', targetType).eq('user_id', userId);
  if (emoji) query = query.eq('emoji', emoji);
  const { data } = await query;
  // Return set of "targetId:emoji" for easy checking
  return new Set((data || []).map(r => `${r.target_id}:${r.emoji}`));
}

// Get all reaction counts grouped by emoji for a target
export async function getAllReactionCounts(targetType: string, targetId: string) {
  const { data } = await supabase.from('reactions')
    .select('emoji, count').eq('target_type', targetType).eq('target_id', targetId);
  // Manual count since we can't easily do GROUP BY with supabase-js
  const counts: Record<string, number> = {};
  (data || []).forEach(r => { counts[r.emoji] = (counts[r.emoji] || 0) + 1; });
  return counts;
}

// Get total reaction count for a target type across ALL targets
export async function getTotalReactionCount(targetType: string) {
  const { count } = await supabase.from('reactions')
    .select('*', { count: 'exact', head: true })
    .eq('target_type', targetType);
  return count || 0;
}

// ===== SPONSORS =====
export async function getSponsors() {
  const { data } = await supabase.from('sponsors').select('*').order('sort_order');
  return data || [];
}

export async function createSponsor(sponsor: { name: string; logo_url?: string; website_url?: string; sort_order?: number }) {
  return supabase.from('sponsors').insert(sponsor).select().single();
}

export async function updateSponsor(id: string, sponsor: { name?: string; logo_url?: string; website_url?: string; sort_order?: number }) {
  return supabase.from('sponsors').update(sponsor).eq('id', id);
}

export async function deleteSponsor(id: string) {
  return supabase.from('sponsors').delete().eq('id', id);
}

// ===== TESTIMONIOS =====
export async function saveTestimonio(t: { user_id: string; name: string; email: string; phone?: string; message: string }) {
  return supabase.from('testimonios').insert(t).select().single();
}

export async function getTestimonios() {
  const { data } = await supabase.from('testimonios').select('*').order('created_at', { ascending: false });
  return data || [];
}

// ===== PUSH SUBSCRIPTIONS =====
export async function savePushSubscription(sub: { user_id?: string | null; endpoint: string; keys: Record<string, string> }) {
  return supabase.from('push_subscriptions').upsert(
    { user_id: sub.user_id || null, endpoint: sub.endpoint, keys: sub.keys },
    { onConflict: 'endpoint' }
  );
}

export async function getAllPushSubscriptions() {
  const { data } = await supabase.from('push_subscriptions').select('endpoint, keys');
  return data || [];
}

export async function getPushSubscriptionCount() {
  const { count } = await supabase.from('push_subscriptions').select('*', { count: 'exact', head: true });
  return count || 0;
}

// ===== EPISODES (cloud) =====
export async function saveEpisodeToSupabase(episode: {
  id: string; season: number; episode: number;
  title: string; guest: string; description?: string;
  image?: string; image_position?: string;
  youtube?: string; spotify?: string; apple?: string; amazon?: string;
}) {
  return supabase.from('episodes').upsert(episode, { onConflict: 'id' });
}

export async function loadEpisodesFromSupabase() {
  const { data } = await supabase.from('episodes').select('*').order('season').order('episode');
  return data || [];
}

export async function deleteEpisodeFromSupabase(id: string) {
  return supabase.from('episodes').delete().eq('id', id);
}

// Merge Supabase episodes with hardcoded defaults (Supabase takes precedence)
export function mergeEpisodesWithDefaults(supabaseEpisodes: any[], defaultEpisodes: any[]) {
  const merged = defaultEpisodes.map(d => {
    const cloud = supabaseEpisodes.find((s: any) => s.id === d.id);
    if (cloud) {
      return {
        ...d,
        image: cloud.image || d.image,
        image_position: cloud.image_position || 'center',
        description: cloud.description || d.description,
        links: {
          youtube: cloud.youtube || d.links.youtube,
          spotify: cloud.spotify || d.links.spotify,
          apple: cloud.apple || d.links.apple,
          amazon: cloud.amazon || d.links.amazon,
        },
      };
    }
    return d;
  });
  for (const cloud of supabaseEpisodes) {
    if (!merged.find((m: any) => m.id === cloud.id)) {
      merged.push({
        id: cloud.id,
        season: cloud.season,
        episode: cloud.episode,
        title: cloud.title,
        guest: cloud.guest,
        description: cloud.description || '',
        image: cloud.image || '/images/logo.png',
        links: {
          youtube: cloud.youtube || '',
          spotify: cloud.spotify || '',
          apple: cloud.apple || '',
          amazon: cloud.amazon || '',
        },
        tags: [],
      });
    }
  }
  return merged;
}

// ===== STORAGE UPLOAD =====
export async function uploadFile(bucket: 'profile-photos' | 'muro-images' | 'episode-images', folder: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) { console.error('Upload error:', error); return null; }
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

// ===== PROJECTS =====
export async function getProjects() {
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getProjects error:', error); }
  return data || [];
}

export async function createProject(p: { title: string; description?: string; date?: string; status?: string; image?: string; participants?: number }) {
  const { data, error } = await supabase.from('projects').insert(p).select().single();
  if (error) { console.error('createProject error:', error); }
  return { data, error };
}

export async function updateProject(id: string, p: { title?: string; description?: string; date?: string; status?: string; image?: string; participants?: number }) {
  const { data, error } = await supabase.from('projects').update(p).eq('id', id).select().single();
  if (error) { console.error('updateProject error:', error); }
  return { data, error };
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) { console.error('deleteProject error:', error); }
  return { error };
}

// ===== HERO IMAGE =====
export async function getHeroImage() {
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

// ===== PARTICIPA ENTRIES =====
export async function getParticipaEntries() {
  const { data } = await supabase.from('participa_entries').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function createParticipaEntry(entry: { tab: string; text: string; name?: string | null; anonymous: boolean }) {
  return supabase.from('participa_entries').insert(entry).select().single();
}

export async function deleteParticipaEntry(id: string) {
  return supabase.from('participa_entries').delete().eq('id', id);
}

export async function clearAllParticipaEntries() {
  return supabase.from('participa_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

// ===== DAILY VERSE MURO POST =====
export async function ensureDailyVerseMuroPost(verse: string, reference: string) {
  const today = new Date().toISOString().split('T')[0];
  const existing = await supabase.from('muro_posts').select('id').eq('author_name', 'Versículo del Día').gte('created_at', `${today}T00:00:00`).lte('created_at', `${today}T23:59:59`).maybeSingle();
  if (existing.data) return existing.data;
  
  const content = `📖 **Versículo del Día**\n\n"${verse}"\n\n— ${reference}\n\n¿Qué te dice Dios hoy a través de esta palabra? Comparte tu reflexión en los comentarios 👇\n\n#VersículoDelDía #TuHistoriaEnMí`;
  
  const { data } = await createMuroPost({
    user_id: null,
    author_name: 'Versículo del Día',
    content,
    image_url: null,
  });
  return data;
}

// ===== TESTIMONIOS PUBLICOS =====
export async function getPublicTestimonios() {
  const { data } = await supabase.from('testimonios_publicos').select('*').eq('public', true).order('created_at', { ascending: false });
  return data || [];
}

export async function createTestimonioPublico(t: { user_id: string; display_name?: string; content: string; public?: boolean }) {
  return supabase.from('testimonios_publicos').insert({ ...t, public: t.public ?? true }).select().single();
}

export async function updateTestimonioPublico(id: string, t: { content?: string; public?: boolean }) {
  return supabase.from('testimonios_publicos').update(t).eq('id', id);
}

export async function deleteTestimonioPublico(id: string) {
  return supabase.from('testimonios_publicos').delete().eq('id', id);
}