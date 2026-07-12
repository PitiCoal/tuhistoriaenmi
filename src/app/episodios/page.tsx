'use client';

import { useState } from 'react';
import { episodes } from '@/lib/episodes';
import EpisodeCard from '@/components/EpisodeCard';
import { Search } from 'lucide-react';

export default function EpisodiosPage() {
  const [search, setSearch] = useState('');
  const [season, setSeason] = useState<number | 'all'>('all');

  const filtered = episodes.filter(e => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.guest.toLowerCase().includes(search.toLowerCase());
    const matchSeason = season === 'all' || e.season === season;
    return matchSearch && matchSeason;
  });

  const seasons = [...new Set(episodes.map(e => e.season))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">Episodios</h1>
        <p className="text-secondary text-sm mt-1">{episodes.length} episodios publicados</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por invitado o título..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSeason('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            season === 'all' ? 'bg-primary text-white' : 'bg-card text-secondary hover:bg-gray-100'
          }`}
        >
          Todas
        </button>
        {seasons.map(s => (
          <button
            key={s}
            onClick={() => setSeason(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              season === s ? 'bg-primary text-white' : 'bg-card text-secondary hover:bg-gray-100'
            }`}
          >
            Temporada {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-secondary py-12">No se encontraron episodios.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map(ep => (
            <EpisodeCard key={ep.id} episode={ep} />
          ))}
        </div>
      )}
    </div>
  );
}
