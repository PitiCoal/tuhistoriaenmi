import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Episode } from '@/lib/episodes';

export default function EpisodeCard({ episode }: { episode: Episode }) {
  return (
    <Link
      href={`/episodios/${episode.id}`}
      className="block bg-card rounded-xl border border-gray-200/70 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden group"
    >
      <div className="aspect-video bg-gray-100 overflow-hidden">
        <img
          src={episode.image}
          alt={episode.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          style={{ objectPosition: (episode as any).image_position || 'center' }}
        />
      </div>
      <div className="p-4 space-y-1.5">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide">
          T{episode.season} &bull; Episodio {episode.episode}
        </p>
        <h3 className="font-heading font-bold text-primary-dark leading-snug group-hover:text-primary transition-colors">
          {episode.title}
        </h3>
        <p className="text-sm text-text-light">con {episode.guest}</p>
        <p className="text-xs text-text-light/70 line-clamp-2">{episode.description}</p>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary pt-1 group-hover:gap-1.5 transition-all">
          Escuchar <ChevronRight size={12} />
        </span>
      </div>
    </Link>
  );
}
