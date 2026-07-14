'use client';

import { useState, useEffect } from 'react';
import { getAllEpisodes } from '@/lib/episodes';
import { loadEpisodesFromSupabase, mergeEpisodesWithDefaults } from '@/lib/supabase';
import EpisodeCard from '@/components/EpisodeCard';
import { Search } from 'lucide-react';

export default function EpisodiosPage() {
  const [episodes, setEpisodes] = useState(getAllEpisodes());
  const [search, setSearch] = useState('');
  const [season, setSeason] = useState<number | 'all'>('all');

  useEffect(() => {
    loadEpisodesFromSupabase().then(cloud => {
      if (cloud.length > 0) {
        setEpisodes(mergeEpisodesWithDefaults(cloud, getAllEpisodes()));
      }
    });
  }, []);

  const filtered = episodes.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.guest.toLowerCase().includes(search.toLowerCase());
    const matchSeason = season === 'all' || e.season === season;
    return matchSearch && matchSeason;
  });

  const seasons = [...new Set(episodes.map(e => e.season))];

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl md:rounded-2xl p-5 md:p-8 border border-gray-200/70 shadow-md text-center">
        <h1 className="font-heading text-xl md:text-3xl font-bold text-primary-dark">Episodios</h1>
        <p className="text-text-light text-xs md:text-sm mt-1">{episodes.length} episodios publicados</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
          <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-card text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
          />
        </div>
      </div>

      <div className="flex gap-1.5 md:gap-2 flex-wrap">
        <button onClick={() => setSeason('all')}
          className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[11px] md:text-sm font-medium transition-colors shadow-sm ${
            season === 'all' ? 'bg-primary text-white' : 'bg-card text-text-light border border-gray-200/70'
          }`}>Todas</button>
        {seasons.map(s => (
          <button key={s} onClick={() => setSeason(s)}
            className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[11px] md:text-sm font-medium transition-colors shadow-sm ${
              season === s ? 'bg-primary text-white' : 'bg-card text-text-light border border-gray-200/70'
            }`}>Temporada {s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-text-light py-8 md:py-12 text-xs md:text-sm bg-card rounded-xl border border-gray-200/70 shadow-md">No se encontraron episodios.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {filtered.map(ep => <EpisodeCard key={ep.id} episode={ep} />)}
        </div>
      )}
    </div>
  );
}
