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

export async function createMuroPost(post: { user_id?: string | null; author_name?: string | null; content: string; image_url?: string | null; category?: string }) {
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

export async function createProject(p: { title: string; description?: string; date?: string; status?: string; image?: string; participants?: number; max_participants?: number }) {
  const { data, error } = await supabase.from('projects').insert(p).select().single();
  if (error) { console.error('createProject error:', error); }
  return { data, error };
}

export async function updateProject(id: string, p: { title?: string; description?: string; date?: string; status?: string; image?: string; participants?: number; max_participants?: number }) {
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

// Approve a testimonio → upsert into testimonios_publicos with approved=true
export async function approveTestimonio(t: { source_id: string; user_id: string; display_name?: string; content: string }) {
  return supabase.from('testimonios_publicos').upsert(
    { user_id: t.user_id, display_name: t.display_name || 'Anónimo', content: t.content, public: true, approved: true, approved_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  ).select().single();
}

// ===== PROJECT PARTICIPANTS =====
export async function joinProject(projectId: string, userId: string) {
  return supabase.from('project_participants').insert({ project_id: projectId, user_id: userId });
}

export async function leaveProject(projectId: string, userId: string) {
  return supabase.from('project_participants').delete().eq('project_id', projectId).eq('user_id', userId);
}

export async function isUserInProject(projectId: string, userId: string): Promise<boolean> {
  const { data } = await supabase.from('project_participants').select('id').eq('project_id', projectId).eq('user_id', userId).maybeSingle();
  return !!data;
}

export async function getProjectParticipantCount(projectId: string): Promise<number> {
  const { count } = await supabase.from('project_participants').select('*', { count: 'exact', head: true }).eq('project_id', projectId);
  return count || 0;
}

export async function getUserProjects(userId: string): Promise<string[]> {
  const { data } = await supabase.from('project_participants').select('project_id').eq('user_id', userId);
  return (data || []).map(r => r.project_id);
}

// Get all projects with real participant count from project_participants
export async function getProjectsWithCounts() {
  const projects = await getProjects();
  const { data: pp } = await supabase.from('project_participants').select('project_id');
  const counts: Record<string, number> = {};
  (pp || []).forEach(r => { counts[r.project_id] = (counts[r.project_id] || 0) + 1; });
  return projects.map((p: any) => ({ ...p, participant_count: counts[p.id] || 0 }));
}

// ===== NOTIFICATION PREFERENCES =====
export async function getNotificationPreferences(userId: string) {
  const { data } = await supabase.from('notification_preferences').select('*').eq('user_id', userId).maybeSingle();
  return data || { daily_verse: true, daily_phrase: true, comments: true, reactions: true, announcements: true };
}

export async function saveNotificationPreferences(userId: string, prefs: {
  daily_verse?: boolean; daily_phrase?: boolean; comments?: boolean; reactions?: boolean; announcements?: boolean;
}) {
  return supabase.from('notification_preferences').upsert(
    { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
}

// ===== USER CONSENT =====
export async function hasUserConsented(userId: string): Promise<boolean> {
  const { data } = await supabase.from('user_consents').select('user_id').eq('user_id', userId).maybeSingle();
  return !!data;
}

export async function saveUserConsent(userId: string) {
  return supabase.from('user_consents').upsert(
    { user_id: userId, accepted_at: new Date().toISOString(), version: '1.0' },
    { onConflict: 'user_id' }
  );
}

// ===== PER-USER QUERIES =====
export async function getMuroPostsByUser(userId: string) {
  const { data } = await supabase.from('muro_posts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
}

export async function getParticipaEntriesByUser(userId: string) {
  const { data } = await supabase.from('participa_entries').select('*').eq('name', userId).order('created_at', { ascending: false });
  return data || [];
}

export async function getTestimoniosByUser(userId: string) {
  const { data } = await supabase.from('testimonios').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
}

// ===== DELETE ALL USER DATA (derecho al olvido) =====
export async function deleteAllUserData(userId: string) {
  await Promise.allSettled([
    supabase.from('muro_posts').delete().eq('user_id', userId),
    supabase.from('muro_replies').delete().eq('user_id', userId),
    supabase.from('reactions').delete().eq('user_id', userId),
    supabase.from('participa_entries').delete().eq('name', userId),
    supabase.from('testimonios').delete().eq('user_id', userId),
    supabase.from('testimonios_publicos').delete().eq('user_id', userId),
    supabase.from('push_subscriptions').delete().eq('user_id', userId),
    supabase.from('notification_preferences').delete().eq('user_id', userId),
    supabase.from('user_consents').delete().eq('user_id', userId),
    supabase.from('user_activities').delete().eq('user_id', userId),
    supabase.from('project_participants').delete().eq('user_id', userId),
    supabase.from('profiles').delete().eq('user_id', userId),
  ]);
}

// ===== METRICS LOGGER =====
export async function logPageView(path: string, userId?: string) {
  return supabase.from('page_views').insert({ path, user_id: userId || null });
}

export async function logEpisodeClick(episodeId: string, platform: string, userId?: string) {
  return supabase.from('episode_clicks').insert({ episode_id: episodeId, platform, user_id: userId || null });
}

export async function getPageViewsCount(): Promise<number> {
  const { count } = await supabase.from('page_views').select('*', { count: 'exact', head: true });
  return count || 0;
}

export async function getEpisodeClicksCount(): Promise<number> {
  const { count } = await supabase.from('episode_clicks').select('*', { count: 'exact', head: true });
  return count || 0;
}

export async function getEpisodeClicksCountByPlatform(): Promise<Record<string, number>> {
  const { data } = await supabase.from('episode_clicks').select('platform');
  const counts: Record<string, number> = {};
  (data || []).forEach(r => { counts[r.platform] = (counts[r.platform] || 0) + 1; });
  return counts;
}

// ===== DEVOCIONALES (DAILY DEVOTIONALS) =====
const FALLBACK_DEVOTIONALS = [
  {
    id: 'fallback-1',
    title: 'Caminando en la Luz',
    verse: 'Si caminamos en la luz, como él está en la luz, tenemos comunión unos con otros.',
    reference: '1 Juan 1:7',
    reflection: 'Caminar en la luz significa vivir con transparencia ante Dios y ante nuestros hermanos. No significa ser perfectos, sino reconocer nuestras debilidades y permitir que la gracia de Dios nos guíe a diario. La comunión con la comunidad nace de esta verdad compartida.',
    question: '¿Qué área de tu vida necesitas rendir hoy a la luz de Dios?',
    prayer: 'Señor, guíame para caminar en verdad y amor. Que mi vida refleje tu luz y que pueda ser un puente de comunión con mis hermanos. Amén.',
    publish_date: null
  },
  {
    id: 'fallback-2',
    title: 'La Paz en la Tormenta',
    verse: 'La paz les dejo, mi paz les doy; no como el mundo la da, yo se la doy.',
    reference: 'Juan 14:27',
    reflection: 'La paz de Dios no es la ausencia de problemas, sino la presencia de Su Espíritu consolándonos en medio de ellos. Mientras el mundo busca seguridad externa, Jesús nos ofrece una paz inquebrantable en el corazón.',
    question: '¿Qué tormenta necesitas entregarle a Jesús hoy para recibir Su paz?',
    prayer: 'Jesús, descanso en tu promesa. Silencia mis temores y llena mi corazón con tu paz que sobrepasa todo entendimiento. Amén.',
    publish_date: null
  }
];

export async function getDailyDevotional() {
  const today = new Date().toISOString().split('T')[0];
  // 1. Intentar buscar programado para hoy
  const { data: scheduled } = await supabase.from('devotionals').select('*').eq('publish_date', today).maybeSingle();
  if (scheduled) return scheduled;

  // 2. Si no hay hoy, buscar rotativos (publish_date is null)
  const { data: rotating } = await supabase.from('devotionals').select('*').is('publish_date', null);
  if (rotating && rotating.length > 0) {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const index = dayOfYear % rotating.length;
    return rotating[index];
  }

  // 3. Fallback estático
  const now = new Date();
  const dayOfYear = now.getDate() + now.getMonth() * 31;
  return FALLBACK_DEVOTIONALS[dayOfYear % FALLBACK_DEVOTIONALS.length];
}

export async function getDevotionalReplies(devotionalId: string) {
  const { data } = await supabase.from('devotional_replies')
    .select('*')
    .eq('devotional_id', devotionalId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getDevotionalReplyByUser(devotionalId: string, userId: string) {
  const { data } = await supabase.from('devotional_replies')
    .select('*')
    .eq('devotional_id', devotionalId)
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

export async function createDevotionalReply(reply: {
  devotional_id: string;
  user_id: string;
  display_name?: string;
  answer: string;
  shared_to_muro: boolean;
  anonymous?: boolean;
}) {
  if (reply.devotional_id.startsWith('fallback')) {
    try {
      const fallbackId = reply.devotional_id;
      const fallback = FALLBACK_DEVOTIONALS.find(d => d.id === fallbackId) || FALLBACK_DEVOTIONALS[0];
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existingDev } = await supabase.from('devotionals').select('id').eq('publish_date', today).eq('title', fallback.title).maybeSingle();
      
      if (existingDev) {
        reply.devotional_id = existingDev.id;
      } else {
        const { data: seeded, error: seedError } = await supabase.from('devotionals').insert({
          title: fallback.title,
          verse: fallback.verse,
          reference: fallback.reference,
          reflection: fallback.reflection,
          question: fallback.question,
          prayer: fallback.prayer,
          publish_date: today
        }).select().single();
        
        if (seeded) {
          reply.devotional_id = seeded.id;
        } else {
          console.error('Error inserting fallback devotional:', seedError);
          return { data: null, error: seedError || { message: 'No se pudo inicializar el devocional en la base de datos.' } };
        }
      }
    } catch (e: any) {
      console.error('Dynamic seeding failed:', e);
      return { data: null, error: { message: 'Error al inicializar devocional: ' + e.message } };
    }
  }
  const { data, error } = await supabase.from('devotional_replies').upsert({
    devotional_id: reply.devotional_id,
    user_id: reply.user_id,
    display_name: reply.display_name,
    answer: reply.answer,
    shared_to_muro: reply.shared_to_muro
  }, { onConflict: 'devotional_id,user_id' }).select().single();
  if (error) return { data: null, error };

  // Si eligió compartir en el muro, creamos un comentario en el post de "Versículo del Día" de hoy
  if (reply.shared_to_muro && data) {
    const { data: dev } = await supabase.from('devotionals').select('title, verse, reference').eq('id', reply.devotional_id).maybeSingle();
    const verseText = dev?.verse || 'El Señor es mi pastor, nada me faltará.';
    const verseRef = dev?.reference || 'Salmo 23,1';
    
    // Obtener o asegurar el MuroPost del versículo de hoy
    const versePost = await ensureDailyVerseMuroPost(verseText, verseRef);
    if (versePost) {
      await createMuroReply({
        post_id: versePost.id,
        user_id: reply.anonymous ? null : reply.user_id,
        author_name: reply.anonymous ? 'Anónimo' : reply.display_name || 'Usuario',
        content: `Reflexión: "${reply.answer}"`
      });
    }
  }

  return { data, error };
}

export async function getDevotionals() {
  const { data } = await supabase.from('devotionals').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function saveDevotional(devotional: any) {
  if (devotional.id) {
    return supabase.from('devotionals').update(devotional).eq('id', devotional.id).select().single();
  }
  return supabase.from('devotionals').insert(devotional).select().single();
}

export async function deleteDevotional(id: string) {
  return supabase.from('devotionals').delete().eq('id', id);
}

export async function getSponsorById(id: string) {
  const { data } = await supabase.from('sponsors').select('*').eq('id', id).maybeSingle();
  return data;
}

// ===== IN-APP NOTIFICATIONS CENTER =====
export async function getUserNotifications(userId: string) {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  return data || [];
}

export async function markNotificationAsRead(id: string) {
  return supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
}

export async function markAllNotificationsAsRead(userId: string) {
  return supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId);
}

export async function getMuroRepliesByUser(userId: string) {
  const { data } = await supabase
    .from('muro_replies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getDevotionalRepliesByUser(userId: string) {
  const { data } = await supabase
    .from('devotional_replies')
    .select('*, devotionals(title, verse, reference)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function deleteDevotionalReply(id: string) {
  return supabase.from('devotional_replies').delete().eq('id', id);
}