import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Episode } from '@/lib/episodes';

export default function EpisodeCard({ episode }: { episode: Episode }) {
  return (
    <Link href={`/episodios/${episode.id}`}
      className="block bg-card rounded-xl border border-gray-200/70 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden group"
    >
      <div className="aspect-video bg-gray-100 overflow-hidden">
        <img src={episode.image} alt={episode.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          style={{ objectPosition: (episode as any).image_position || 'center' }}
        />
      </div>
      <div className="p-3 md:p-4 space-y-1 md:space-y-1.5">
        <p className="text-[10px] md:text-xs font-semibold text-primary uppercase tracking-wide">
          T{episode.season} &bull; E{episode.episode}
        </p>
        <h3 className="font-heading font-bold text-primary-dark leading-snug group-hover:text-primary transition-colors text-sm md:text-base">
          {episode.title}
        </h3>
        <p className="text-xs md:text-sm text-text-light">con {episode.guest}</p>
        <p className="text-[11px] md:text-xs text-text-light/70 line-clamp-2">{episode.description}</p>
        <span className="inline-flex items-center gap-1 text-[11px] md:text-xs font-semibold text-primary pt-1 group-hover:gap-1.5 transition-all">
          Escuchar <ChevronRight size={10} />
        </span>
      </div>
    </Link>
  );
}
