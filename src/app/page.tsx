'use client';

import DailyVerse from '@/components/DailyVerse';
import IntentDelDia from '@/components/IntentDelDia';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { BookOpen, Users, Heart, Sparkles, LogIn, Download } from 'lucide-react';

export default function HomePage() {
  const { user, signIn } = useAuth();

  return (
    <div className="space-y-6 md:space-y-8">

      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden min-h-[280px] md:min-h-[320px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-accent opacity-90" />
        <div className="relative z-10 p-6 md:p-10 w-full flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="flex-1 text-center md:text-left space-y-3">
            <h1 className="font-heading text-2xl md:text-4xl font-bold text-white leading-tight">
              Tu Historia En Mí
            </h1>
            <p className="text-sm md:text-lg text-white/80 max-w-md mx-auto md:mx-0">
              Un espacio para encontrarte con Dios cada día
            </p>
            <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start">
              <Link href="/diario"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-primary-dark font-semibold rounded-xl text-xs md:text-sm hover:bg-white/90 transition-all active:scale-95 shadow-md">
                <BookOpen size={14} /> Ir a mi diario
              </Link>
              <Link href="/comunidad"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl text-xs md:text-sm border border-white/30 hover:bg-white/30 transition-all active:scale-95 shadow-sm">
                <Users size={14} /> Ir a la comunidad
              </Link>
              {(!user || user === 'loading') && (
                <button onClick={() => signIn()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl text-xs md:text-sm border border-white/30 hover:bg-white/30 transition-all active:scale-95 shadow-sm">
                  <LogIn size={14} /> Iniciar sesión
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
              <img src="/images/logo.png" alt="TM" className="w-20 h-20 md:w-28 md:h-28 brightness-0 invert" />
            </div>
            <button
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-dark font-semibold rounded-xl text-xs md:text-sm hover:bg-white/90 transition-all active:scale-95 shadow-md">
              <Download size={14} /> Descargar app
            </button>
          </div>
        </div>
      </section>

      {/* Versículo del día */}
      <DailyVerse />

      {/* Intención de oración del día */}
      <IntentDelDia />

      {/* Cards de acceso rápido */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/diario"
          className="group bg-white rounded-2xl p-5 flex flex-col items-center gap-2 text-center transition-all hover:shadow-xl hover:-translate-y-0.5 shadow-md border border-gray-100 active:scale-[0.97]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen size={22} className="text-primary" />
          </div>
          <span className="text-sm font-bold text-primary-dark">Diario</span>
          <span className="text-[10px] text-text-light leading-tight">Escribe y reflexiona</span>
        </Link>
        <Link href="/comunidad"
          className="group bg-white rounded-2xl p-5 flex flex-col items-center gap-2 text-center transition-all hover:shadow-xl hover:-translate-y-0.5 shadow-md border border-gray-100 active:scale-[0.97]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users size={22} className="text-secondary" />
          </div>
          <span className="text-sm font-bold text-primary-dark">Comunidad</span>
          <span className="text-[10px] text-text-light leading-tight">Comparte con la comunidad</span>
        </Link>
        <Link href="/formacion"
          className="group bg-white rounded-2xl p-5 flex flex-col items-center gap-2 text-center transition-all hover:shadow-xl hover:-translate-y-0.5 shadow-md border border-gray-100 active:scale-[0.97]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-400/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles size={22} className="text-amber-500" />
          </div>
          <span className="text-sm font-bold text-primary-dark">Formación</span>
          <span className="text-[10px] text-text-light leading-tight">Podcast y recursos</span>
        </Link>
        <Link href="/oracion"
          className="group bg-white rounded-2xl p-5 flex flex-col items-center gap-2 text-center transition-all hover:shadow-xl hover:-translate-y-0.5 shadow-md border border-gray-100 active:scale-[0.97]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400/20 to-rose-400/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Heart size={22} className="text-rose-500" />
          </div>
          <span className="text-sm font-bold text-primary-dark">Oración</span>
          <span className="text-[10px] text-text-light leading-tight">Intenciones y oraciones</span>
        </Link>
      </div>
    </div>
  );
}
