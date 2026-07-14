import { notFound } from 'next/navigation';
import { getAllEpisodes, getEpisodeById } from '@/lib/episodes';
import { createClient } from '@supabase/supabase-js';
import PlatformLinks from '@/components/PlatformLinks';
import Link from 'next/link';
import { ArrowLeft, Share2 } from 'lucide-react';

export function generateStaticParams() {
  return getAllEpisodes().map(e => ({ id: e.id }));
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function EpisodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: cloudEp } = await supabase.from('episodes').select('*').eq('id', id).single();
  const defaultEp = getEpisodeById(id);

  if (!cloudEp && !defaultEp) notFound();

  const episode = {
    id: id,
    season: cloudEp?.season ?? defaultEp!.season,
    episode: cloudEp?.episode ?? defaultEp!.episode,
    title: cloudEp?.title ?? defaultEp!.title,
    guest: cloudEp?.guest ?? defaultEp!.guest,
    description: cloudEp?.description ?? defaultEp!.description,
    image: cloudEp?.image || defaultEp!.image,
    image_position: (cloudEp as any)?.image_position || 'center',
    links: {
      youtube: cloudEp?.youtube || defaultEp!.links.youtube || '',
      spotify: cloudEp?.spotify || defaultEp!.links.spotify || '',
      apple: cloudEp?.apple || defaultEp!.links.apple || '',
      amazon: cloudEp?.amazon || defaultEp!.links.amazon || '',
    },
    tags: defaultEp?.tags || [],
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link href="/episodios" className="inline-flex items-center gap-1 text-sm text-secondary hover:text-accent transition-colors">
        <ArrowLeft size={16} /> Volver a episodios
      </Link>

      <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
        <img src={episode.image} alt={episode.title} className="w-full h-full object-cover" style={{ objectPosition: episode.image_position || 'center' }} />
      </div>

      <div>
        <p className="text-xs font-semibold text-accent uppercase tracking-wide">
          Temporada {episode.season} &bull; Episodio {episode.episode}
        </p>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary mt-1">
          {episode.title}
        </h1>
        <p className="text-lg text-secondary mt-1">con {episode.guest}</p>
      </div>

      <p className="text-text leading-relaxed">{episode.description}</p>

      <div className="space-y-3">
        <h2 className="font-heading font-bold text-primary">Escuchar en</h2>
        <PlatformLinks
          youtube={episode.links.youtube}
          spotify={episode.links.spotify}
          apple={episode.links.apple}
          amazon={episode.links.amazon}
          size="lg"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {episode.tags.map((tag: string) => (
          <span key={tag} className="px-3 py-1 bg-card rounded-full text-xs font-medium text-secondary">
            #{tag}
          </span>
        ))}
      </div>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(`Escucha "${episode.title}" de Tu Historia en Mí ${episode.links.spotify}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
      >
        <Share2 size={16} /> Compartir por WhatsApp
      </a>
    </div>
  );
}
