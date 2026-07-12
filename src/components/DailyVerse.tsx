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
    <div className="bg-card rounded-xl md:rounded-2xl p-4 md:p-8 text-center border border-gray-200/70 shadow-md">
      <p className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-primary mb-2 md:mb-3">
        Versículo del Día
      </p>
      <blockquote className="font-heading text-base md:text-xl italic text-primary-dark leading-relaxed">
        &ldquo;{verse.verse}&rdquo;
      </blockquote>
      <p className="mt-2 md:mt-3 text-xs md:text-sm text-text-light font-medium">{verse.reference}</p>
    </div>
  );
}
