'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getVerseOfDay } from '@/lib/verses';
import { getAllReactionCounts, getUserReactions, toggleReaction, createMuroPost } from '@/lib/supabase';
import { Heart, Share2, Check, Smile, Sparkles } from 'lucide-react';

const EMOJIS = ['🙏', '❤️', '😊', '✨'] as const;
const EMOJI_ICONS: Record<string, React.ReactNode> = {
  '🙏': <Heart size={16} />,
  '❤️': <Heart size={16} className="text-red-500 fill-current" />,
  '😊': <Smile size={16} />,
  '✨': <Sparkles size={16} />,
};

export default function DailyVerse() {
  const { user } = useAuth();
  const [verse, setVerse] = useState<{ verse: string; reference: string }>({ verse: '', reference: '' });
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [userReacted, setUserReacted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    setVerse(getVerseOfDay());
  }, []);

  useEffect(() => {
    if (user && user !== 'loading') {
      getAllReactionCounts('daily_verse', 'today').then(setReactionCounts);
      getUserReactions('daily_verse', user.uid).then(reactions => {
        const map: Record<string, boolean> = {};
        EMOJIS.forEach(e => { map[e] = reactions.has(`today:${e}`); });
        setUserReacted(map);
      });
    }
  }, [user]);

  async function handleReact(emoji: string) {
    if (!user || user === 'loading' || loading) return;
    setLoading(emoji);
    const added = await toggleReaction('daily_verse', 'today', user.uid, emoji);
    setUserReacted(prev => ({ ...prev, [emoji]: added }));
    setReactionCounts(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + (added ? 1 : -1) }));
    setLoading(null);
  }

  async function handleShareToMuro() {
    if (!user || user === 'loading') return;
    const today = new Date().toISOString().split('T')[0];
    try {
      await createMuroPost({
        user_id: user.uid,
        author_name: user.displayName || undefined,
        content: `📖 Versículo del día (${today}):\n\n"${verse.verse}"\n\n— ${verse.reference}\n\n¿Qué te dice este versículo hoy? Comparte tu reflexión 👇`,
        image_url: null,
      });
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch (err) {
      console.error('Error sharing to muro:', err);
    }
  }

  if (!verse.verse) return null;

  return (
    <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-8 text-center border border-gray-200/70 shadow-md">
      <p className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-primary mb-2 md:mb-3">
        Versículo del Día
      </p>
      <blockquote className="font-heading text-base md:text-xl italic text-primary-dark leading-relaxed mb-4">
        &ldquo;{verse.verse}&rdquo;
      </blockquote>
      <p className="mt-2 md:mt-3 text-xs md:text-sm text-text-light font-medium">{verse.reference}</p>

      <div className="flex flex-col items-center gap-3 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {EMOJIS.map(emoji => {
            const Icon = EMOJI_ICONS[emoji];
            const count = reactionCounts[emoji] || 0;
            const reacted = userReacted[emoji] || false;
            return (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                disabled={loading !== null || !user || user === 'loading'}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors active:scale-95 ${
                  reacted
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-gray-100 text-text-light hover:bg-primary/10 hover:text-primary hover:border-primary/20 border border-gray-200'
                } ${loading === emoji ? 'opacity-50 cursor-wait' : ''}`}
              >
                {Icon}
                <span className="text-xs">{count > 0 ? count : ''}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleShareToMuro}
          disabled={!user || user === 'loading'}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-text-light hover:bg-primary/10 hover:text-primary border border-gray-200 transition-colors active:scale-95 w-full sm:w-auto"
        >
          <Share2 size={16} /> {shared ? <Check size={16} className="text-green-500" /> : 'Compartir en Muro'}
        </button>
      </div>

      {!user && (
        <p className="text-[10px] text-text-light/60 mt-2">
          Inicia sesión para reaccionar o compartir
        </p>
      )}
    </div>
  );
}