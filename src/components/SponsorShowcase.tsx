'use client';

import { useState, useEffect } from 'react';
import { getSponsors } from '@/lib/supabase';
import { Heart } from 'lucide-react';

export default function SponsorShowcase() {
  const [sponsors, setSponsors] = useState<any[]>([]);

  useEffect(() => {
    getSponsors().then(setSponsors).catch(() => {});
  }, []);

  return (
    <div className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md text-center space-y-6">
      <div className="flex items-center justify-center gap-2">
        <Heart size={18} className="text-primary" />
        <h2 className="font-heading text-xl font-bold text-primary-dark">Agradecimientos</h2>
      </div>

      {sponsors.length === 0 ? (
        <p className="text-sm text-text-light italic">
          Pr&oacute;ximamente — Auspiciadores que hacen posible esta comunidad.
        </p>
      ) : (
        <div className="flex flex-wrap justify-center items-center gap-8">
          {sponsors.map(s => (
            <a key={s.id} href={s.website_url || '#'} target="_blank" rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2">
              {s.logo_url ? (
                <img src={s.logo_url} alt={s.name}
                  className="h-16 md:h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300" />
              ) : (
                <div className="h-16 w-32 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-text-light">
                  {s.name}
                </div>
              )}
              <span className="text-xs text-text-light/60 group-hover:text-text-light transition-colors">{s.name}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
