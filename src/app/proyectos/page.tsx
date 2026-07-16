'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Calendar, LogIn, Users, CheckCircle, Loader2 } from 'lucide-react';
import { getProjectsWithCounts, joinProject, leaveProject, isUserInProject } from '@/lib/supabase';

type Project = {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'próximo' | 'en curso' | 'completado';
  image: string;
  participant_count: number;
  max_participants?: number;
};

const statusColors: Record<string, string> = {
  próximo: 'bg-blue-100 text-blue-700',
  'en curso': 'bg-amber-100 text-amber-700',
  completado: 'bg-green-100 text-green-700',
};

export default function ProyectosPage() {
  const { user, signIn } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  // Track which projects the user has joined: Record<projectId, boolean>
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [joining, setJoining] = useState<Record<string, boolean>>({});

  const userId = user && user !== 'loading' ? (user as any).uid : null;

  useEffect(() => {
    async function load() {
      try {
        const data = await getProjectsWithCounts();
        setProjects(data || []);
      } catch (e) {
        console.error('Error loading projects:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Once we know the user, check their joined status for each project
  useEffect(() => {
    if (!userId || projects.length === 0) return;
    Promise.all(
      projects.map(p => isUserInProject(p.id, userId).then(v => ({ id: p.id, v })))
    ).then(results => {
      const map: Record<string, boolean> = {};
      results.forEach(r => { map[r.id] = r.v; });
      setJoined(map);
    });
  }, [userId, projects]);

  async function handleJoin(projectId: string) {
    if (!userId) { signIn(); return; }
    setJoining(prev => ({ ...prev, [projectId]: true }));
    try {
      if (joined[projectId]) {
        await leaveProject(projectId, userId);
        setJoined(prev => ({ ...prev, [projectId]: false }));
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, participant_count: Math.max(0, p.participant_count - 1) } : p));
      } else {
        await joinProject(projectId, userId);
        setJoined(prev => ({ ...prev, [projectId]: true }));
        const project = projects.find(p => p.id === projectId);
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, participant_count: p.participant_count + 1 } : p));
        
        // Disparar correo de confirmación
        if (project && user && typeof user === 'object' && user.email) {
          fetch('/api/project/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              userName: user.displayName || '',
              projectName: project.title,
              projectDate: project.date,
            }),
          }).catch(err => console.error('Error triggering join email:', err));
        }
      }
    } finally {
      setJoining(prev => ({ ...prev, [projectId]: false }));
    }
  }

  if (user === 'loading') return <div className="text-center py-20 text-text-light">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md text-center">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark">Proyectos</h1>
        <p className="text-text-light text-sm mt-1">Conoce lo que estamos preparando para la comunidad.</p>
        {!userId && (
          <p className="text-xs text-text-light/70 mt-2">
            Puedes ver todos los proyectos.{' '}
            <button onClick={() => signIn()} className="text-primary underline font-medium">Inicia sesión</button>
            {' '}para inscribirte.
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-center text-text-light py-8">Cargando proyectos...</p>
      ) : projects.length === 0 ? (
        <p className="text-center text-text-light py-8">Aún no hay proyectos publicados.</p>
      ) : (
        <div className="space-y-4">
          {projects.map(p => (
            <div key={p.id} className="bg-card rounded-xl border border-gray-200/70 shadow-md overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="sm:w-40 h-32 bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center shrink-0">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <img src="/images/logo.png" alt="" className="h-20 w-20 object-contain opacity-30" />
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 p-5 space-y-3">
                  <div className="space-y-1">
                    <h2 className="font-heading font-bold text-primary-dark">{p.title}</h2>
                    <p className="text-sm text-text-light leading-relaxed">{p.description}</p>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {p.date && (
                      <span className="flex items-center gap-1 text-text-light">
                        <Calendar size={12} /> {p.date}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                    {/* Contador de inscritos */}
                    <span className="flex items-center gap-1 text-primary font-semibold">
                      <Users size={12} />
                      {p.participant_count}
                      {p.max_participants && p.max_participants > 0 ? ` / ${p.max_participants}` : ''}
                      {p.participant_count === 1 ? ' inscrito' : ' inscritos'}
                    </span>
                  </div>

                  {/* Botón Unirme / Ya inscrito */}
                  {p.status !== 'completado' && (
                    <button
                      onClick={() => handleJoin(p.id)}
                      disabled={joining[p.id] || !!(p.max_participants && p.max_participants > 0 && p.participant_count >= p.max_participants && !joined[p.id])}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-60 ${
                        joined[p.id]
                          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                          : p.max_participants && p.max_participants > 0 && p.participant_count >= p.max_participants
                            ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                      }`}
                    >
                      {joining[p.id] ? (
                        <><Loader2 size={12} className="animate-spin" /> Procesando...</>
                      ) : joined[p.id] ? (
                        <><CheckCircle size={12} /> Ya estoy inscrito</>
                      ) : p.max_participants && p.max_participants > 0 && p.participant_count >= p.max_participants ? (
                        <>Cupos agotados</>
                      ) : !userId ? (
                        <><LogIn size={12} /> Iniciar sesión para unirme</>
                      ) : (
                        <>Unirme al proyecto</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}