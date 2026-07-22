'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getDailyDevotional, createDevotionalReply, getDevotionalReplies, getDevotionalReplyByUser, getSponsorById } from '@/lib/supabase';
import { getAllReactionCounts, getUserReactions, toggleReaction } from '@/lib/supabase';
import { BookOpen, Send, CheckCircle, HelpCircle, Users, ChevronDown, ChevronUp, Lock, Heart, HandHeart, Smile, Sparkles, Share2, Check } from 'lucide-react';
import { useCelebration, CelebrationBanner } from '@/components/Celebration';

const EMOJIS = ['🙏', '❤️', '😊', '🤗', '✨'] as const;
const EMOJI_ICONS: Record<string, React.ReactNode> = {
  '🙏': <HandHeart size={16} />,
  '❤️': <Heart size={16} className="text-red-500 fill-current" />,
  '😊': <Smile size={16} />,
  '🤗': <span role="img" aria-label="abrazo">🤗</span>,
  '✨': <Sparkles size={16} />,
};

export default function DailyDevotional() {
  const { user, signIn } = useAuth();
  const celebration = useCelebration();
  const [devotional, setDevotional] = useState<any>(null);
  const [sponsor, setSponsor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDevotional, setShowDevotional] = useState(false);
  const [answer, setAnswer] = useState('');
  const [shareToMuro, setShareToMuro] = useState(false);
  const [anonymousShare, setAnonymousShare] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [replies, setReplies] = useState<any[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const [showReflection, setShowReflection] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);

  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [userReacted, setUserReacted] = useState<Record<string, boolean>>({});
  const [reactLoading, setReactLoading] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  const userId = user && user !== 'loading' ? (user as any).uid : null;
  const displayName = user && user !== 'loading' ? (user as any).displayName : '';

  const todayKey = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!todayKey) return;
    async function load() {
      try {
        const dev = await getDailyDevotional();
        setDevotional(dev);
        if (dev && dev.sponsor_id) {
          const sp = await getSponsorById(dev.sponsor_id);
          setSponsor(sp);
        }
        if (userId && dev) {
          const userReply = await getDevotionalReplyByUser(dev.id, userId);
          if (userReply) {
            setAnswer(userReply.answer);
            setShareToMuro(userReply.shared_to_muro);
          }
        }
        if (dev && dev.id) {
          getAllReactionCounts('devotional', dev.id).then(setReactionCounts);
          if (userId) {
            getUserReactions('devotional', userId).then(reactions => {
              const map: Record<string, boolean> = {};
              EMOJIS.forEach(e => { map[e] = reactions.has(`${dev.id}:${e}`); });
              setUserReacted(map);
            });
          }
        }
      } catch (err) {
        console.error('Error loading daily devotional:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, todayKey]);

  useEffect(() => {
    if (!devotional || !showReplies) return;
    setLoadingReplies(true);
    getDevotionalReplies(devotional.id).then(data => {
      setReplies(data.filter(r => r.user_id !== userId));
      setLoadingReplies(false);
    });
  }, [devotional, showReplies, userId]);

  async function handleReact(emoji: string) {
    if (!userId || !devotional || reactLoading) return;
    setReactLoading(emoji);
    const added = await toggleReaction('devotional', devotional.id, userId, emoji);
    setUserReacted(prev => ({ ...prev, [emoji]: added }));
    setReactionCounts(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + (added ? 1 : -1) }));
    setReactLoading(null);
  }

  async function handleShareToMuro() {
    if (!userId || !devotional) return;
    try {
      await createDevotionalReply({
        devotional_id: devotional.id,
        user_id: userId,
        display_name: displayName,
        answer: `📖 Evangelio del día:\n\n"${devotional.verse}" — ${devotional.reference}`,
        shared_to_muro: true,
        anonymous: false,
      });
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch (err) {
      console.error('Error sharing to muro:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !devotional || !answer.trim() || saving) return;
    setSaving(true);
    setFeedback(null);

    const { error } = await createDevotionalReply({
      devotional_id: devotional.id,
      user_id: userId,
      display_name: displayName,
      answer: answer.trim(),
      shared_to_muro: shareToMuro,
      anonymous: anonymousShare,
    });

    if (error) {
      setFeedback('Error al guardar: ' + error.message);
    } else {
      setFeedback('Amén 🙏 Has llegado hasta aquí. Dios se alegra de tu perseverancia.');
      celebration.celebrate('¡Amén! 🙏 Dios se alegra de tu perseverancia');
      if (showReplies) {
        const data = await getDevotionalReplies(devotional.id);
        setReplies(data.filter(r => r.user_id !== userId));
      }
      setTimeout(() => setFeedback(null), 3000);
    }
    setSaving(false);
  }

  if (loading) return <div className="text-center py-4 text-text-light text-sm">Cargando evangelio del día...</div>;
  if (!devotional) return null;

  return (
    <section className="bg-card rounded-xl md:rounded-2xl border border-gray-200/70 shadow-md overflow-hidden">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setShowDevotional(!showDevotional)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <BookOpen size={16} className="text-amber-600" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Evangelio del Día</span>
            <h2 className="font-heading font-bold text-primary-dark text-sm md:text-base leading-tight">
              {devotional.title}
            </h2>
          </div>
        </div>
        <span className="text-xs text-text-light bg-gray-100 px-2.5 py-1 rounded-full">
          {showDevotional ? 'ocultar' : 'leer'}
        </span>
      </button>

      {showDevotional && (
        <>
          {/* Header with sponsor */}
          <div className="bg-gradient-to-r from-amber-50/50 to-primary/5 px-5 py-3 border-y border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
                {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            {sponsor && (
              <a href={sponsor.website_url || '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] bg-white px-2.5 py-1 rounded-full shadow-sm text-text-light hover:text-primary transition-colors border border-gray-100">
                <span className="opacity-75">Patrocinado por</span>
                {sponsor.logo_url && <img src={sponsor.logo_url} alt="" className="h-3.5 w-auto object-contain max-w-[50px]" />}
                <span className="font-semibold">{sponsor.name}</span>
              </a>
            )}
          </div>

          <div className="p-5 space-y-4">
            {/* Verse */}
            <div className="bg-amber-50/30 border-l-4 border-amber-400 p-4 rounded-r-lg space-y-1.5">
              <blockquote className="text-text text-sm italic leading-relaxed">
                &ldquo;{devotional.verse}&rdquo;
              </blockquote>
              <cite className="text-xs font-semibold text-amber-700 block not-italic">— {devotional.reference}</cite>
            </div>

            {/* Reactions */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {EMOJIS.map(emoji => {
                  const Icon = EMOJI_ICONS[emoji];
                  const count = reactionCounts[emoji] || 0;
                  const reacted = userReacted[emoji] || false;
                  return (
                    <button key={emoji} onClick={() => handleReact(emoji)}
                      disabled={reactLoading !== null || !userId}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors active:scale-95 ${
                        reacted ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-100 text-text-light hover:bg-amber-50 hover:text-amber-700 border border-gray-200'
                      } ${reactLoading === emoji ? 'opacity-50 cursor-wait' : ''}`}>
                      {Icon}
                      <span className="text-[10px]">{count > 0 ? count : ''}</span>
                    </button>
                  );
                })}
              </div>
              <button onClick={handleShareToMuro} disabled={!userId}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-text-light hover:bg-primary/10 hover:text-primary border border-gray-200 transition-colors active:scale-95">
                <Share2 size={12} /> {shared ? <Check size={12} className="text-green-500" /> : 'Compartir'}
              </button>
            </div>

            {/* Reflection Accordion */}
            <div className="border-t border-gray-100/60 pt-3">
              <button type="button" onClick={() => setShowReflection(!showReflection)}
                className="w-full flex items-center justify-between text-xs font-bold text-primary-dark hover:text-primary transition-colors py-1.5 uppercase tracking-wider focus:outline-none">
                <span>💬 Reflexión de hoy</span>
                <span className="text-[10px] text-text-light font-normal lowercase bg-gray-100 px-2.5 py-0.5 rounded border border-gray-200/50">
                  {showReflection ? 'ocultar' : 'leer reflexión'}
                </span>
              </button>
              {showReflection && (
                <div className="mt-2 text-xs md:text-sm text-text leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-4 rounded-xl border border-gray-100/70">
                  {devotional.reflection}
                </div>
              )}
            </div>

            {/* Guided Prayer */}
            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100/70 space-y-1.5">
              <h3 className="font-semibold text-primary-dark text-xs uppercase tracking-wider">Oración Guiada</h3>
              <p className="text-xs md:text-sm text-text-light leading-relaxed italic">&ldquo;{devotional.prayer}&rdquo;</p>
            </div>

            {/* Question Accordion */}
            <div className="border-t border-gray-100/60 pt-3">
              <button type="button" onClick={() => setShowQuestion(!showQuestion)}
                className="w-full flex items-center justify-between text-xs font-bold text-primary-dark hover:text-primary transition-colors py-1.5 uppercase tracking-wider focus:outline-none">
                <span>❓ Pregunta para reflexionar</span>
                <span className="text-[10px] text-text-light font-normal lowercase bg-gray-100 px-2.5 py-0.5 rounded border border-gray-200/50">
                  {showQuestion ? 'ocultar' : 'responder pregunta'}
                </span>
              </button>
              {showQuestion && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-start gap-2.5 bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                    <HelpCircle size={16} className="text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-primary-dark text-xs uppercase tracking-wider">Pregunta de Aplicación</h4>
                      <p className="text-xs md:text-sm text-text leading-relaxed">{devotional.question}</p>
                    </div>
                  </div>

                  {userId ? (
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <textarea value={answer} onChange={e => setAnswer(e.target.value)}
                        placeholder="Señor, hoy quiero decirte..." maxLength={1000} rows={3}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-xs md:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" required />
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-light">
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={shareToMuro} onChange={e => { setShareToMuro(e.target.checked); if (!e.target.checked) setAnonymousShare(false); }}
                              className="rounded border-gray-300 text-primary focus:ring-primary" />
                            <span>Compartir en la Comunidad</span>
                          </label>
                          {shareToMuro && (
                            <label className="flex items-center gap-1.5 cursor-pointer pl-5 text-[11px] text-text-light/90">
                              <input type="checkbox" checked={anonymousShare} onChange={e => setAnonymousShare(e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary" />
                              <span>Publicar como Anónimo</span>
                            </label>
                          )}
                        </div>
                        <button type="submit" disabled={!answer.trim() || saving}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors active:scale-95 disabled:opacity-50 self-end shadow-sm">
                          <Send size={12} /> {saving ? 'Guardando...' : 'Guardar en mi diario'}
                        </button>
                      </div>
                      {feedback && (
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                          <CheckCircle size={12} /> {feedback}
                        </p>
                      )}
                    </form>
                  ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-center space-y-2">
                      <Lock size={16} className="mx-auto text-text-light" />
                      <p className="text-xs text-text-light">Inicia sesión para responder a la pregunta y ver respuestas de otros.</p>
                      <button onClick={() => signIn()}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors active:scale-95 shadow-sm">
                        Iniciar sesión con Google
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Community Answers */}
            {userId && (
              <div className="border-t border-gray-100 pt-3">
                <button onClick={() => setShowReplies(!showReplies)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-text-light hover:text-primary transition-colors py-1.5">
                  <span className="flex items-center gap-1.5"><Users size={14} /> Respuestas de la comunidad</span>
                  {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showReplies && (
                  <div className="mt-3 space-y-3 pl-2 border-l-2 border-gray-100">
                    {loadingReplies ? (
                      <p className="text-[10px] text-text-light/70 italic">Cargando respuestas...</p>
                    ) : replies.length === 0 ? (
                      <p className="text-[10px] text-text-light/70 italic">Aún no hay respuestas públicas compartidas.</p>
                    ) : (
                      replies.map((reply, idx) => (
                        <div key={reply.id || idx} className="space-y-1 text-xs">
                          <p className="font-semibold text-primary-dark">{reply.display_name || 'Anónimo'}</p>
                          <p className="text-text-light leading-relaxed bg-gray-50 p-2.5 rounded-lg italic">&ldquo;{reply.answer}&rdquo;</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
      <CelebrationBanner show={celebration.show} message={celebration.message} onClose={() => celebration.setShow(false)} />
    </section>
  );
}