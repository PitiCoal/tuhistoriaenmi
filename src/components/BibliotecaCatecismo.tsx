'use client';

import { useState } from 'react';
import { searchCatechism, getCatechismBySource } from '@/lib/supabase';
import { Search, BookOpen, ChevronDown, ChevronUp, BookMarked } from 'lucide-react';

const sources = [
  { value: 'catechism', label: 'Catecismo de la Iglesia Católica' },
  { value: 'ycatechism', label: 'YouCat (Jóvenes)' },
  { value: 'compendium', label: 'Compendio del Catecismo' },
];

export default function BibliotecaCatecismo() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<string>('catechism');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    const data = await searchCatechism(query);
    setResults(data);
    setLoading(false);
  }

  async function loadBySource(src: string) {
    setSource(src);
    setLoading(true);
    setHasSearched(true);
    const data = await getCatechismBySource(src);
    setResults(data);
    setQuery('');
    setLoading(false);
  }

  return (
    <div className="bg-card rounded-xl border border-gray-200/70 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/5 px-5 py-4 border-b border-gray-100">
        <h2 className="font-heading font-bold text-primary-dark text-sm flex items-center gap-2">
          <BookMarked size={16} className="text-primary" /> Biblioteca Catecismo
        </h2>
      </div>

      <div className="p-4 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar en el Catecismo..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1"
          >
            <Search size={12} /> Buscar
          </button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {sources.map(s => (
            <button
              key={s.value}
              onClick={() => loadBySource(s.value)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all active:scale-95 ${
                source === s.value && !query ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-gray-100 text-text-light hover:bg-primary/10 border border-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {loading && <p className="text-xs text-text-light text-center">Buscando...</p>}

        {hasSearched && !loading && results.length === 0 && (
          <p className="text-xs text-text-light text-center py-4">No se encontraron resultados.</p>
        )}

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {results.map(entry => {
            const isExpanded = expanded[entry.id];
            return (
              <div key={entry.id} className="border border-gray-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [entry.id]: !isExpanded }))}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-primary-dark block truncate">
                      {entry.source === 'catechism' ? 'CIC' : entry.source === 'ycatechism' ? 'YouCat' : 'Compendio'}
                      {entry.chapter && ` — ${entry.chapter}`}
                      {entry.paragraph && `, §${entry.paragraph}`}
                    </span>
                    <p className="text-[10px] text-text-light line-clamp-1 mt-0.5">
                      {entry.tags?.join(' · ')}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp size={14} className="text-text-light shrink-0" /> : <ChevronDown size={14} className="text-text-light shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-3 pb-3">
                    <p className="text-xs text-text leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                      {entry.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
