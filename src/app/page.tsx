import DailyVerse from '@/components/DailyVerse';
import EpisodeCard from '@/components/EpisodeCard';
import Link from 'next/link';
import { Heart, MessageCircle, Users, HandHeart, ArrowRight } from 'lucide-react';
import { episodes } from '@/lib/episodes';

const quickLinks = [
  { href: '/donar', icon: HandHeart, label: 'Aportar', color: 'bg-accent hover:bg-accent/90' },
  { href: '/oracion', icon: Heart, label: 'Muro de Oración', color: 'bg-gold/80 hover:bg-gold text-primary' },
  { href: '/testimonio', icon: MessageCircle, label: 'Dar Testimonio', color: 'bg-primary hover:bg-primary/90' },
  { href: '/comunidad', icon: Users, label: 'Comunidad', color: 'bg-secondary hover:bg-secondary/90' },
];

export default function HomePage() {
  const latest = episodes[episodes.length - 1];

  return (
    <div className="space-y-8">
      <section className="text-center space-y-4">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary">
          Tu Historia en Mí
        </h1>
        <p className="text-secondary max-w-xl mx-auto leading-relaxed">
          Donde tu historia encuentra eco. Un espacio de testimonios reales de vida, fe y superaci&oacute;n.
        </p>
      </section>

      <DailyVerse />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`${link.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-colors`}
          >
            <link.icon size={24} />
            <span className="text-xs font-semibold">{link.label}</span>
          </Link>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold text-primary">Último Episodio</h2>
          <Link href="/episodios" className="text-sm text-accent flex items-center gap-1 hover:underline">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <div className="max-w-sm">
          <EpisodeCard episode={latest} />
        </div>
      </section>
    </div>
  );
}
