'use client';

import { useEffect, useState } from 'react';
import DailyVerse from '@/components/DailyVerse';
import IntentDelDia from '@/components/IntentDelDia';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { BookOpen, Users, ArrowRight, LogIn } from 'lucide-react';

export default function HomePage() {
  const [heroImage] = useState('/images/hero-bg.png');
  const { user, signIn } = useAuth();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero minimal */}
      <section className="relative rounded-xl md:rounded-2xl overflow-hidden min-h-[200px] md:min-h-[260px] flex items-center">
        <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />
        <div className="relative z-10 p-5 md:p-10 w-full space-y-3">
          <img src="/images/logo.png" alt="" className="h-10 w-10 md:h-12 md:w-12 brightness-0 invert opacity-90" />
          <h1 className="font-heading text-xl md:text-3xl font-bold text-white leading-tight max-w-lg">Tu Historia En Mí</h1>
          <div className="flex flex-wrap gap-2">
            <Link href="/diario" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-semibold rounded-lg text-xs md:text-sm hover:bg-primary/90 transition-colors active:scale-95">
              <BookOpen size={14} /> Ir a mi diario
            </Link>
            <Link href="/comunidad" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 text-white font-semibold rounded-lg text-xs md:text-sm backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-colors active:scale-95">
              <Users size={14} /> Ir a la comunidad
            </Link>
            {(!user || user === 'loading') && (
              <button onClick={() => signIn()} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 text-white font-semibold rounded-lg text-xs md:text-sm backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-colors active:scale-95">
                <LogIn size={14} /> Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Frase del día */}
      <DailyVerse />

      {/* Intención de oración del día */}
      <IntentDelDia />

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/diario"
          className="bg-primary text-white rounded-xl p-5 flex flex-col items-center gap-2 text-center transition-all hover:bg-primary/90 hover:scale-[1.02] shadow-lg shadow-primary/20 active:scale-95"
        >
          <BookOpen size={24} />
          <span className="text-sm font-semibold">Escribir en mi diario</span>
          <span className="text-[10px] text-white/60">Reflexiona y escribe</span>
        </Link>
        <Link href="/comunidad"
          className="bg-secondary text-white rounded-xl p-5 flex flex-col items-center gap-2 text-center transition-all hover:bg-secondary/90 hover:scale-[1.02] shadow-lg shadow-secondary/20 active:scale-95"
        >
          <Users size={24} />
          <span className="text-sm font-semibold">Ir al muro</span>
          <span className="text-[10px] text-white/60">Comparte con la comunidad</span>
        </Link>
      </div>
    </div>
  );
}
