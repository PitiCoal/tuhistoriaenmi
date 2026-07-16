'use client';

import { Video, Music2, Podcast, Globe } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { logEpisodeClick } from '@/lib/supabase';

type PlatformLinksProps = {
  episodeId: string; // Requiere episodeId para registrar métricas
  youtube?: string;
  spotify?: string;
  apple?: string;
  amazon?: string;
  size?: 'sm' | 'lg';
};

const platforms = [
  { key: 'youtube' as const, icon: Video, label: 'YouTube', color: 'bg-red-600 hover:bg-red-700' },
  { key: 'spotify' as const, icon: Music2, label: 'Spotify', color: 'bg-green-600 hover:bg-green-700' },
  { key: 'apple' as const, icon: Podcast, label: 'Apple Podcasts', color: 'bg-purple-600 hover:bg-purple-700' },
  { key: 'amazon' as const, icon: Globe, label: 'Amazon Music', color: 'bg-orange-600 hover:bg-orange-700' },
];

export default function PlatformLinks({ episodeId, youtube, spotify, apple, amazon, size = 'sm' }: PlatformLinksProps) {
  const { user } = useAuth();
  const links = { youtube, spotify, apple, amazon };
  const isSmall = size === 'sm';

  const userId = user && user !== 'loading' ? (user as any).uid : null;

  const handleClick = (platform: string) => {
    if (!episodeId) return;
    logEpisodeClick(episodeId, platform, userId).catch(err => {
      console.error('Error logging episode platform click:', err);
    });
  };

  return (
    <div className={`flex flex-wrap gap-2 ${isSmall ? '' : 'flex-col'}`}>
      {platforms.map(p => {
        const url = links[p.key];
        if (!url) return null;
        return (
          <a
            key={p.key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick(p.key)}
            className={`inline-flex items-center gap-1.5 text-white font-medium rounded-lg transition-colors
              ${p.color}
              ${isSmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm w-full justify-center'}`}
          >
            <p.icon size={isSmall ? 14 : 18} />
            {p.label}
          </a>
        );
      })}
    </div>
  );
}
