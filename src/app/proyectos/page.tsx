'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Calendar, LogIn, Lightbulb, Users } from 'lucide-react';
import { getProjects } from '@/lib/supabase';

type Project = { id: string; title: string; description: string; date: string; status: 'próximo' | 'en curso' | 'completado'; image: string; participants?: number };

const statusColors: Record<string, string> = {
  próximo: 'bg-blue-100 text-blue-700', 'en curso': 'bg-amber-100 text-amber-700', completado: 'bg-green-100 text-green-700',
};

export default function ProyectosPage() {
  const { user, signIn } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProjects();
        setProjects(data || []);
      } catch (e) {
        console.error('Error loading projects:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (user === 'loading') return <div className="text-center py-20 text-text-light">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md text-center">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark">Proyectos</h1>
        <p className="text-text-light text-sm mt-1">Conoce lo que estamos preparando para la comunidad.</p>
      </div>

      {!user ? (
        <div className="bg-card rounded-xl p-8 border border-gray-200/70 shadow-md text-center space-y-3">
          <Lightbulb size={48} className="mx-auto text-text-light" />
          <h2 className="font-heading text-lg font-bold text-primary-dark">Inicia sesión</h2>
          <p className="text-sm text-text-light">Necesitas una cuenta para ver y ser parte de los proyectos comunitarios.</p>
          <button onClick={() => signIn()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-95">
            <LogIn size={16} /> Iniciar sesión
          </button>
        </div>
      ) : (
        loading ? (
          <p className="text-center text-text-light py-8">Cargando proyectos...</p>
        ) : projects.length === 0 ? (
          <p className="text-center text-text-light py-8">Aún no hay proyectos publicados.</p>
        ) : (
          <div className="space-y-4">
            {projects.map(p => (
              <div key={p.id} className="bg-card rounded-xl border border-gray-200/70 shadow-md overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-40 h-32 bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                    <img src={p.image} alt="" className="h-20 w-20 object-contain opacity-50" />
                  </div>
                  <div className="flex-1 p-5 space-y-2">
                    <h2 className="font-heading font-bold text-primary-dark">{p.title}</h2>
                    <p className="text-sm text-text-light leading-relaxed">{p.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-text-light"><Calendar size={12} /> {p.date}</span>
                      <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[p.status]}`}>{p.status}</span>
                      {p.participants && p.participants > 0 && (
                        <span className="flex items-center gap-1 text-primary font-medium"><Users size={12} /> {p.participants}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}