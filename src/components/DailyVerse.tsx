'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getVerseOfDay } from '@/lib/verses';
import { getReactionCount, getUserReactions, toggleReaction, createMuroPost } from '@/lib/supabase';
import { Heart, Share2, Check } from 'lucide-react';

export default function DailyVerse() {
  const { user } = useAuth();
  const [verse, setVerse] = useState<{ verse: string; reference: string }>({ verse: '', reference: '' });
  const [reactionCount, setReactionCount] = useState(0);
  const [userReacted, setUserReacted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    setVerse(getVerseOfDay());
  }, []);

  useEffect(() => {
    if (user && user !== 'loading') {
      getReactionCount('daily_verse', 'today').then(setReactionCount);
      getUserReactions('daily_verse', user.uid).then(reactions => setUserReacted(reactions.has('today')));
    }
  }, [user]);

  async function handleReact() {
    if (!user || user === 'loading') return;
    setLoading(true);
    const added = await toggleReaction('daily_verse', 'today', user.uid);
    setUserReacted(added);
    setReactionCount(prev => added ? prev + 1 : prev - 1);
    setLoading(false);
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

      <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={handleReact}
          disabled={loading || !user || user === 'loading'}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors active:scale-95 ${
            userReacted
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-gray-100 text-text-light hover:bg-primary/10 hover:text-primary hover:border-primary/20 border border-gray-200'
          } ${loading ? 'opacity-50 cursor-wait' : ''}`}
        >
          <Heart size={16} className={userReacted ? 'fill-current' : ''} />
          {reactionCount > 0 ? reactionCount : 'Rezar'}
        </button>

        <button
          onClick={handleShareToMuro}
          disabled={!user || user === 'loading'}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-text-light hover:bg-primary/10 hover:text-primary border border-gray-200 transition-colors active:scale-95"
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