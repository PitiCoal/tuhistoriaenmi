import DailyVerse from '@/components/DailyVerse';
import EpisodeCard from '@/components/EpisodeCard';
import Link from 'next/link';
import { Heart, MessageCircle, Users, HandHeart, ArrowRight } from 'lucide-react';
import { episodes } from '@/lib/episodes';

const quickLinks = [
  { href: '/oracion', icon: Heart, label: 'Muro de Oración', color: 'bg-accent hover:bg-accent/90' },
  { href: '/testimonio', icon: MessageCircle, label: 'Dar Testimonio', color: 'bg-primary hover:bg-primary/90' },
  { href: '/comunidad', icon: Users, label: 'Comunidad', color: 'bg-secondary hover:bg-secondary/90' },
  { href: '/donar', icon: HandHeart, label: 'Aportar', color: 'bg-primary-light hover:bg-primary-light/90' },
];

export default function HomePage() {
  const latest = episodes[episodes.length - 1];

  return (
    <div className="space-y-10">
      <section
        className="relative rounded-2xl overflow-hidden min-h-[320px] flex items-center"
      >
        <img
          src="/images/fondo-podcast.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" />
        <div className="relative z-10 p-8 md:p-12 max-w-xl space-y-4">
          <img
            src="/images/logo.png"
            alt="Tu Historia En Mí"
            className="h-16 w-16 brightness-0 invert opacity-90"
          />
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white leading-tight">
            Tu Historia En Mí
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Donde tu historia encuentra eco. Un espacio de testimonios reales de vida, fe y superaci&oacute;n.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/episodios"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-primary font-semibold rounded-lg text-sm hover:bg-white/90 transition-colors"
            >
              Escuchar episodios <ArrowRight size={16} />
            </Link>
            <Link
              href="/oracion"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white/20 text-white font-semibold rounded-lg text-sm backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              Dejar una oraci&oacute;n <Heart size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section>
        <DailyVerse />
      </section>

      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`${link.color} text-white rounded-xl p-5 flex flex-col items-center gap-2.5 text-center transition-all hover:scale-[1.02] shadow-sm`}
            >
              <link.icon size={26} />
              <span className="text-sm font-semibold">{link.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl font-bold text-primary">Último Episodio</h2>
          <Link
            href="/episodios"
            className="text-sm text-accent flex items-center gap-1 hover:underline font-medium"
          >
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <div className="max-w-sm">
          <EpisodeCard episode={latest} />
        </div>
      </section>

      <section className="bg-primary/5 rounded-2xl p-8 text-center space-y-3">
        <h2 className="font-heading text-xl font-bold text-primary">Comparte tu historia</h2>
        <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
          &iquest;Tienes un testimonio que contar? Tu historia puede ser la luz que alguien necesita hoy.
        </p>
        <Link
          href="/testimonio"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white font-semibold rounded-lg text-sm hover:bg-accent/90 transition-colors"
        >
          <MessageCircle size={16} /> Quiero compartir
        </Link>
      </section>
    </div>
  );
}
