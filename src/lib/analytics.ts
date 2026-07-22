import { supabase } from './supabase';

export type AnalyticsEvent =
  | { type: 'page_view'; path: string }
  | { type: 'devotional_read'; devotional_id: string; time_spent_ms: number }
  | { type: 'devotional_answered'; devotional_id: string }
  | { type: 'muro_post_created'; category: string }
  | { type: 'muro_reaction'; emoji: string }
  | { type: 'episode_click'; episode_id: string; platform: string }
  | { type: 'streak_milestone'; day: number }
  | { type: 'prayer_session'; duration_minutes: number }
  | { type: 'plan_day_completed'; plan_id: string; day: number };

const eventBuffer: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flush();
    flushTimer = null;
  }, 5000);
}

async function flush() {
  if (eventBuffer.length === 0) return;
  const batch = eventBuffer.splice(0, eventBuffer.length);

  // Store in page_views table (DB) for analytics
  try {
    const rows = batch.map(e => ({
      path: e.type === 'page_view' ? e.path : `/event/${e.type}`,
      event_type: e.type,
      event_data: JSON.stringify(e),
    }));
    await supabase.from('page_views').insert(rows);
  } catch {}
}

export function trackEvent(event: AnalyticsEvent) {
  eventBuffer.push(event);
  scheduleFlush();
}

export function trackPageView(path: string) {
  trackEvent({ type: 'page_view', path });
}

export function trackDevotionalRead(devotionalId: string, timeSpentMs: number) {
  trackEvent({ type: 'devotional_read', devotional_id: devotionalId, time_spent_ms: timeSpentMs });
}

export function trackDevotionalAnswered(devotionalId: string) {
  trackEvent({ type: 'devotional_answered', devotional_id: devotionalId });
}

export function trackMuroPost(category: string) {
  trackEvent({ type: 'muro_post_created', category });
}

export function trackReaction(emoji: string) {
  trackEvent({ type: 'muro_reaction', emoji });
}

export function trackEpisodeClick(episodeId: string, platform: string) {
  trackEvent({ type: 'episode_click', episode_id: episodeId, platform });
}

export function trackStreakMilestone(day: number) {
  trackEvent({ type: 'streak_milestone', day });
}

export function trackPrayerSession(durationMinutes: number) {
  trackEvent({ type: 'prayer_session', duration_minutes: durationMinutes });
}

export function trackPlanDayCompleted(planId: string, day: number) {
  trackEvent({ type: 'plan_day_completed', plan_id: planId, day });
}
