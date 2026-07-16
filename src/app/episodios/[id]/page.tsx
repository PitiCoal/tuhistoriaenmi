import { notFound } from 'next/navigation';
import { getAllEpisodes, getEpisodeById } from '@/lib/episodes';
import { createClient } from '@supabase/supabase-js';
import PlatformLinks from '@/components/PlatformLinks';
import Link from 'next/link';
import { ArrowLeft, Share2, Handshake } from 'lucide-react';
import type { Metadata } from 'next';
import { getSponsorById } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateStaticParams() {
  return getAllEpisodes().map(e => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: cloudEp } = await supabase.from('episodes').select('*').eq('id', id).single();
  const defaultEp = getEpisodeById(id);

  if (!cloudEp && !defaultEp) return {};

  const title = cloudEp?.title ?? defaultEp!.title;
  const guest = cloudEp?.guest ?? defaultEp!.guest;
  const description = cloudEp?.description ?? defaultEp!.description;
  const image = cloudEp?.image || defaultEp!.image;

  return {
    title: `${title} con ${guest} — Tu Historia En Mí`,
    description: description,
    openGraph: {
      title: `${title} con ${guest}`,
      description: description,
      images: [
        {
          url: image,
          alt: title,
        },
      ],
      type: 'video.episode',
    },
  };
}

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
    sponsor_id: cloudEp?.sponsor_id || null,
  };

  const sponsor = episode.sponsor_id ? await getSponsorById(episode.sponsor_id).catch(() => null) : null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link href="/episodios" className="inline-flex items-center gap-1 text-sm text-secondary hover:text-accent transition-colors">
        <ArrowLeft size={16} /> Volver a episodios
      </Link>

      <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
        <img src={episode.image} alt={episode.title} className="w-full h-full object-cover" style={{ objectPosition: episode.image_position || 'center' }} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-accent uppercase tracking-wide">
            Temporada {episode.season} &bull; Episodio {episode.episode}
          </p>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary mt-1">
            {episode.title}
          </h1>
          <p className="text-lg text-secondary mt-1">con {episode.guest}</p>
        </div>

        {sponsor && (
          <a
            href={sponsor.website_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-card border border-gray-200 text-xs font-semibold text-text-light hover:text-primary transition-all rounded-xl shadow-sm self-start sm:self-center"
          >
            <Handshake size={14} className="text-primary" />
            <div className="text-left leading-tight">
              <span className="block text-[9px] uppercase tracking-wider text-text-light/60 font-bold">Patrocinado por</span>
              <span className="block text-primary-dark">{sponsor.name}</span>
            </div>
            {sponsor.logo_url && <img src={sponsor.logo_url} alt="" className="h-6 w-auto object-contain ml-1" />}
          </a>
        )}
      </div>

      <p className="text-text leading-relaxed">{episode.description}</p>

      <div className="space-y-3">
        <h2 className="font-heading font-bold text-primary">Escuchar en</h2>
        <PlatformLinks
          episodeId={episode.id}
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
