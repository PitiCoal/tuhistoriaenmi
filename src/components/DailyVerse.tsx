'use client';

import { useEffect, useState } from 'react';
import { getVerseOfDay } from '@/lib/verses';

export default function DailyVerse() {
  const [verse, setVerse] = useState<{ verse: string; reference: string }>({ verse: '', reference: '' });

  useEffect(() => {
    setVerse(getVerseOfDay());
  }, []);

  if (!verse.verse) return null;

  return (
    <div className="bg-gold/10 rounded-xl p-6 md:p-8 text-center border border-gold/20">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
        Versículo del Día
      </p>
      <blockquote className="font-heading text-lg md:text-xl italic text-primary leading-relaxed">
        &ldquo;{verse.verse}&rdquo;
      </blockquote>
      <p className="mt-3 text-sm text-secondary font-medium">{verse.reference}</p>
    </div>
  );
}
