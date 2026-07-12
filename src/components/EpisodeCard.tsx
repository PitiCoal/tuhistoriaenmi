import Link from 'next/link';
import { Play, ChevronRight } from 'lucide-react';
import type { Episode } from '@/lib/episodes';

export default function EpisodeCard({ episode }: { episode: Episode }) {
  return (
    <Link
      href={`/episodios/${episode.id}`}
      className="block bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="aspect-video bg-primary/10 flex items-center justify-center">
        <Play size={32} className="text-accent/40" />
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold text-accent uppercase tracking-wide">
          T{episode.season} &bull; Episodio {episode.episode}
        </p>
        <h3 className="font-heading font-bold text-primary mt-1 leading-snug">
          {episode.title}
        </h3>
        <p className="text-sm text-secondary mt-1">con {episode.guest}</p>
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{episode.description}</p>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-accent mt-3">
          Escuchar <ChevronRight size={14} />
        </span>
      </div>
    </Link>
  );
}
