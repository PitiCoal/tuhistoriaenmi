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
    <div className="bg-card rounded-2xl p-6 md:p-8 text-center border border-gray-200/70 shadow-md">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
        Versículo del Día
      </p>
      <blockquote className="font-heading text-lg md:text-xl italic text-primary-dark leading-relaxed">
        &ldquo;{verse.verse}&rdquo;
      </blockquote>
      <p className="mt-3 text-sm text-text-light font-medium">{verse.reference}</p>
    </div>
  );
}
