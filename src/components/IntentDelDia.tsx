'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getDailyIntention, prayForIntention, getAllReactionCounts } from '@/lib/supabase';
import { Heart, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function IntentDelDia() {
  const { user, signIn } = useAuth();
  const [intention, setIntention] = useState<any>(null);
  const [prayerCount, setPrayerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [praying, setPraying] = useState(false);
  const [prayed, setPrayed] = useState(false);

  const userId = user && user !== 'loading' ? (user as any).uid : null;

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getDailyIntention();
    setIntention(data);
    if (data) {
      const counts = await getAllReactionCounts('muro_post', data.id);
      setPrayerCount(counts['🙏'] || 0);
    }
    setLoading(false);
  }

  async function handlePray() {
    if (!userId) { signIn(); return; }
    if (!intention || prayed) return;
    setPraying(true);
    await prayForIntention(intention.id, userId);
    setPrayed(true);
    setPrayerCount(prev => prev + 1);
    setPraying(false);
  }

  if (loading || !intention) return null;

  return (
    <section className="bg-gradient-to-br from-primary/5 to-gold/5 rounded-xl md:rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
      <div className="p-4 md:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🙏</span>
          <h2 className="font-heading text-sm font-bold text-primary-dark">Intención de oración de hoy</h2>
        </div>

        <blockquote className="text-sm text-text leading-relaxed italic border-l-3 border-primary pl-3 py-1">
          &ldquo;{intention.content}&rdquo;
        </blockquote>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-text-light">
            <Heart size={12} className="text-primary" />
            <span>{prayerCount} {prayerCount === 1 ? 'persona está orando' : 'personas están orando'}</span>
          </div>

          {userId ? (
            <button
              onClick={handlePray}
              disabled={praying || prayed}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                prayed ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
              }`}
            >
              <Heart size={12} className={prayed ? 'fill-current' : ''} />
              {prayed ? 'Orando por esto 🙏' : 'Orar por esto'}
            </button>
          ) : (
            <button
              onClick={() => signIn()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
            >
              <LogIn size={12} /> Unirme para orar
            </button>
          )}
        </div>

        <Link href="/comunidad?filter=oracion" className="block text-[10px] text-primary/70 hover:text-primary transition-colors text-center">
          Ver todas las intenciones de oración →
        </Link>
      </div>
    </section>
  );
}
