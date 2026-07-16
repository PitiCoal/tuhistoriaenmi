'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import DailyVerse from '@/components/DailyVerse';
import DailyDevotional from '@/components/DailyDevotional';
import DonationGoal from '@/components/DonationGoal';
import EpisodeCard from '@/components/EpisodeCard';
import PlatformShowcase from '@/components/PlatformShowcase';
import Link from 'next/link';
import { Heart, MessageCircle, Users, HandHeart, ArrowRight, LogIn, User, BarChart3, Quote } from 'lucide-react';
import { getAllEpisodes } from '@/lib/episodes';
import { countProfiles, countEpisodes, countTestimonios, countSponsors, getPublicTestimonios } from '@/lib/supabase';

const quickLinks = [
  { href: '/comunidad?filter=oracion', icon: Heart, label: 'Muro de Oración', desc: 'Deja tu intención' },
  { href: '/comunidad', icon: Users, label: 'Comunidad', desc: 'WhatsApp + Instagram' },
  { href: '/testimonio', icon: MessageCircle, label: 'Tu Historia', desc: 'Comparte tu testimonio' },
  { href: '/donar', icon: HandHeart, label: 'Aportar', desc: 'Apoya el proyecto' },
];

export default function HomePage() {
  const [heroImage, setHeroImage] = useState('/images/hero-bg.png');
  const { user, signIn } = useAuth();
  const allEpisodes = getAllEpisodes();
  // Últimos 3 episodios, del más reciente al más antiguo
  const latest3 = allEpisodes.slice(-3).reverse();

  const [autoMetrics, setAutoMetrics] = useState({ profiles: 0, episodes: 0, testimonios: 0, sponsors: 0 });
  const [testimonios, setTestimonios] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('tm_hero_image');
    if (saved) setHeroImage(saved);
  }, []);

  useEffect(() => {
    Promise.all([countProfiles(), countEpisodes(), countTestimonios(), countSponsors()]).then(
      ([profiles, episodes, testimoniosCount, sponsors]) =>
        setAutoMetrics({ profiles, episodes, testimonios: testimoniosCount, sponsors })
    );
    getPublicTestimonios().then(data => setTestimonios((data || []).slice(0, 3)));
  }, []);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero */}
      <section className="relative rounded-xl md:rounded-2xl overflow-hidden min-h-[260px] md:min-h-[340px] flex items-center">
        <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />
        <div className="relative z-10 p-5 md:p-12 w-full space-y-3 md:space-y-5">
          <img src="/images/logo.png" alt="" className="h-10 w-10 md:h-14 md:w-14 brightness-0 invert opacity-90" />
          <h1 className="font-heading text-2xl md:text-4xl font-bold text-white leading-tight max-w-lg">Tu Historia En Mí</h1>
          <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-md">Donde tu historia encuentra eco. Testimonios reales de vida, fe y superación.</p>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link href="/episodios" className="inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-primary text-white font-semibold rounded-lg text-xs md:text-sm hover:bg-primary/90 transition-colors shadow-sm active:scale-95">
              Escuchar episodios <ArrowRight size={14} />
            </Link>
            <Link href="/comunidad?filter=oracion" className="inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-white/15 text-white font-semibold rounded-lg text-xs md:text-sm backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-colors active:scale-95">
              Dejar oración <Heart size={14} />
            </Link>
            {user && user !== 'loading' ? (
              <Link href="/comunidad" className="inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-white/15 text-white font-semibold rounded-lg text-xs md:text-sm backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-colors active:scale-95">
                Participar <User size={14} />
              </Link>
            ) : (
              <button onClick={() => signIn()} className="inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-white/15 text-white font-semibold rounded-lg text-xs md:text-sm backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-colors active:scale-95">
                Crear cuenta <LogIn size={14} />
              </button>
            )}
          </div>
        </div>
      </section>

      <PlatformShowcase />
      <DailyVerse />
      <DailyDevotional />
      <DonationGoal />

      {/* Sección Impacto */}
      <section className="bg-card rounded-xl md:rounded-2xl p-5 md:p-8 border border-gray-200/70 shadow-md">
        <div className="flex items-center gap-2 mb-4 md:mb-6">
          <BarChart3 size={18} className="text-primary" />
          <h2 className="font-heading text-base md:text-lg font-bold text-primary-dark">Nuestro Impacto</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="text-center space-y-1">
            <p className="text-2xl md:text-3xl font-bold text-primary">{autoMetrics.profiles}</p>
            <p className="text-xs text-text-light">Personas en la comunidad</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl md:text-3xl font-bold text-primary">{autoMetrics.episodes}</p>
            <p className="text-xs text-text-light">Episodios publicados</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl md:text-3xl font-bold text-primary">{autoMetrics.testimonios}</p>
            <p className="text-xs text-text-light">Testimonios recibidos</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl md:text-3xl font-bold text-primary">{autoMetrics.sponsors}</p>
            <p className="text-xs text-text-light">Auspiciadores</p>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {quickLinks.map(link => (
          <Link key={link.href} href={link.href}
            className="bg-primary text-white rounded-xl p-3 md:p-5 flex flex-col items-center gap-1.5 md:gap-2 text-center transition-all hover:bg-primary/90 hover:scale-[1.02] shadow-lg shadow-primary/20 active:scale-95"
          >
            <link.icon size={20} />
            <span className="text-xs md:text-sm font-semibold leading-tight">{link.label}</span>
            <span className="text-[10px] md:text-xs text-white/60 hidden md:block">{link.desc}</span>
          </Link>
        ))}
      </div>

      {/* Últimos 3 episodios */}
      <section>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="font-heading text-lg md:text-xl font-bold text-primary-dark">Últimos Episodios</h2>
          <Link href="/episodios" className="text-xs md:text-sm text-primary flex items-center gap-1 hover:underline font-medium">Ver todos <ArrowRight size={12} /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {latest3.map(ep => (
            <EpisodeCard key={ep.id} episode={ep} />
          ))}
        </div>
      </section>

      {/* Testimonios destacados */}
      {testimonios.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg md:text-xl font-bold text-primary-dark">Testimonios</h2>
            <Link href="/testimonios" className="text-xs md:text-sm text-primary flex items-center gap-1 hover:underline font-medium">Ver todos <ArrowRight size={12} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {testimonios.map((t, i) => (
              <div key={t.id || i} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md space-y-3">
                <Quote size={16} className="text-primary/40" />
                <blockquote className="text-text text-sm leading-relaxed italic line-clamp-4">
                  &ldquo;{t.content}&rdquo;
                </blockquote>
                <p className="text-xs font-semibold text-primary-dark">{t.display_name || 'Anónimo'}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA compartir */}
      <section className="bg-card rounded-xl md:rounded-2xl p-5 md:p-8 text-center space-y-3 md:space-y-4 border border-gray-200/70 shadow-md">
        <h2 className="font-heading text-lg md:text-xl font-bold text-primary-dark">Comparte tu historia</h2>
        <p className="text-text-light text-sm md:text-base max-w-md mx-auto leading-relaxed">Tu testimonio puede ser la luz que alguien necesita hoy.</p>
        <Link href="/testimonio" className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-primary text-white font-semibold rounded-lg text-xs md:text-sm hover:bg-primary/90 transition-colors shadow-sm active:scale-95">
          <MessageCircle size={14} /> Quiero compartir
        </Link>
      </section>
    </div>
  );
}
