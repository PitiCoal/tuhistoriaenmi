'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getProfile } from '@/lib/supabase';
import { User, MapPin, Calendar, Quote } from 'lucide-react';
import Link from 'next/link';

export default function PerfilPublicoPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getProfile(id as string).then(p => {
      setProfile(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-text-light">Cargando...</div>;

  if (!profile) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-3">
        <User size={48} className="mx-auto text-text-light" />
        <h1 className="font-heading text-xl font-bold text-primary-dark">Perfil no encontrado</h1>
        <p className="text-text-light text-sm">Este usuario aún no ha completado su perfil.</p>
        <Link href="/comunidad" className="text-primary text-sm hover:underline">Volver a la comunidad</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-card rounded-2xl p-6 md:p-8 border border-gray-200/70 shadow-md text-center space-y-4">
        {profile.photo_url ? (
          <img src={profile.photo_url} alt="" className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-primary/20" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto border-2 border-primary/20">
            <User size={36} className="text-primary" />
          </div>
        )}
        <h1 className="font-heading text-2xl font-bold text-primary-dark">{profile.display_name || 'Usuario'}</h1>

        <div className="flex flex-wrap justify-center gap-3 text-sm text-text-light">
          {profile.country && (
            <span className="inline-flex items-center gap-1"><MapPin size={14} /> {profile.country}</span>
          )}
          {profile.age && (
            <span className="inline-flex items-center gap-1"><Calendar size={14} /> {profile.age} años</span>
          )}
        </div>

        {profile.bio && (
          <div className="bg-primary/5 rounded-xl p-4 space-y-1">
            <Quote size={16} className="text-primary/50" />
            <p className="text-sm text-text leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
