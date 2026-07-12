'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle } from '@/lib/firebase';
import { Calendar, LogIn, Lightbulb } from 'lucide-react';

type Project = { id: string; title: string; description: string; date: string; status: 'próximo' | 'en curso' | 'completado'; image: string; };
const STORAGE_KEY = 'tm_projects';

function loadProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try { const d = localStorage.getItem(STORAGE_KEY); if (d) return JSON.parse(d); } catch {}
  return [
    { id: 'p1', title: 'Cachipun de la Gratitud', description: 'Intervención urbana: jugamos cachipun en la calle, regalamos dulces y recogemos intenciones de oración.', date: 'Julio 2026', status: 'próximo', image: '/images/logo.png' },
    { id: 'p2', title: 'Merch TM', description: 'Lanzamiento de polerón y polera oficial de Tu Historia en Mí.', date: 'Julio 2026', status: 'en curso', image: '/images/logo.png' },
    { id: 'p3', title: 'App Comunidad TM', description: 'Plataforma web unificada para la comunidad.', date: 'Julio-Agosto 2026', status: 'en curso', image: '/images/logo.png' },
  ];
}

const statusColors: Record<string, string> = {
  próximo: 'bg-blue-100 text-blue-700', 'en curso': 'bg-amber-100 text-amber-700', completado: 'bg-green-100 text-green-700',
};

export default function ProyectosPage() {
  const [user, setUser] = useState<any | null | 'loading'>('loading');
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    setProjects(loadProjects());
    return unsub;
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
          <button onClick={() => signInWithGoogle()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">
            <LogIn size={16} /> Iniciar sesión
          </button>
        </div>
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
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-text-light"><Calendar size={12} /> {p.date}</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[p.status]}`}>{p.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
