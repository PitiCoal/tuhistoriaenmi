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
  const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function createProject(p: { title: string; description?: string; date?: string; status?: string; image?: string }) {
  return supabase.from('projects').insert(p).select().single();
}

export async function updateProject(id: string, p: { title?: string; description?: string; date?: string; status?: string; image?: string }) {
  return supabase.from('projects').update(p).eq('id', id);
}

export async function deleteProject(id: string) {
  return supabase.from('projects').delete().eq('id', id);
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

// ===== DAILY VERSE REACTIONS =====
export async function toggleDailyVerseReaction(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const existing = await supabase.from('daily_verse_reactions').select('id').eq('user_id', userId).eq('date', today).maybeSingle();
  if (existing.data) {
    await supabase.from('daily_verse_reactions').delete().eq('id', existing.data.id);
    return false;
  }
  await supabase.from('daily_verse_reactions').insert({ user_id: userId, date: today });
  return true;
}

export async function getDailyVerseReactionCount() {
  const today = new Date().toISOString().split('T')[0];
  const { count } = await supabase.from('daily_verse_reactions').select('*', { count: 'exact', head: true }).eq('date', today);
  return count || 0;
}

export async function getUserDailyVerseReaction(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase.from('daily_verse_reactions').select('id').eq('user_id', userId).eq('date', today).maybeSingle();
  return !!data;
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