import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Episode } from '@/lib/episodes';

export default function EpisodeCard({ episode }: { episode: Episode }) {
  return (
    <Link
      href={`/episodios/${episode.id}`}
      className="block bg-card rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden group"
    >
      <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center overflow-hidden">
        <img
          src={episode.image}
          alt={episode.title}
          className="w-full h-full object-contain p-6 opacity-40 group-hover:opacity-60 transition-opacity"
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
