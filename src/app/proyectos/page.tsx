'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Calendar, LogIn, Users, CheckCircle, Loader2, CalendarCheck } from 'lucide-react';
import {
  getProjectsWithCounts, joinProject, leaveProject, isUserInProject,
  getActivitiesWithCounts, getUserActivities, joinActivity, leaveActivity,
} from '@/lib/supabase';

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

type Activity = {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  sort_order?: number;
  participants?: number;
};

const statusColors: Record<string, string> = {
  próximo: 'bg-blue-100 text-blue-700',
  'en curso': 'bg-amber-100 text-amber-700',
  completado: 'bg-green-100 text-green-700',
};

export default function ProyectosPage() {
  const { user, signIn } = useAuth();

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [joining, setJoining] = useState<Record<string, boolean>>({});

  // Activities state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [savingActivity, setSavingActivity] = useState<string | null>(null);

  const userId = user && user !== 'loading' ? (user as any).uid : null;

  // Load projects
  useEffect(() => {
    getProjectsWithCounts()
      .then(data => setProjects(data || []))
      .catch(e => console.error(e))
      .finally(() => setLoadingProjects(false));
  }, []);

  // Load activities
  useEffect(() => {
    getActivitiesWithCounts()
      .then(data => setActivities(data || []))
      .catch(e => console.error(e))
      .finally(() => setLoadingActivities(false));
  }, []);

  // Load user's joined status for projects
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

  // Load user's selected activities
  useEffect(() => {
    if (!userId) return;
    getUserActivities(userId).then(set => setSelectedActivities(set));
  }, [userId]);

  async function handleJoinProject(projectId: string) {
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
        if (project && user && typeof user === 'object' && (user as any).email) {
          fetch('/api/project/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: (user as any).email,
              userName: (user as any).displayName || '',
              projectName: project.title,
              projectDate: project.date,
            }),
          }).catch(() => {});
        }
      }
    } finally {
      setJoining(prev => ({ ...prev, [projectId]: false }));
    }
  }

  async function handleToggleActivity(activityName: string) {
    if (!userId) { signIn(); return; }
    setSavingActivity(activityName);
    const next = new Set(selectedActivities);
    try {
      if (next.has(activityName)) {
        next.delete(activityName);
        setSelectedActivities(next);
        await leaveActivity(userId, activityName);
        setActivities(prev => prev.map(act => act.name === activityName ? { ...act, participants: Math.max(0, (act.participants || 0) - 1) } : act));
      } else {
        next.add(activityName);
        setSelectedActivities(next);
        await joinActivity(userId, activityName);
        setActivities(prev => prev.map(act => act.name === activityName ? { ...act, participants: (act.participants || 0) + 1 } : act));
      }
    } catch (e) {
      console.error('Error toggling activity:', e);
    } finally {
      setSavingActivity(null);
    }
  }

  if (user === 'loading') return <div className="text-center py-20 text-text-light">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hero */}
      <div className="bg-card rounded-2xl p-6 md:p-8 border border-gray-200/70 shadow-md text-center">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark">Proyectos y Actividades</h1>
        <p className="text-text-light text-sm mt-1">Participa en lo que estamos construyendo juntos como comunidad.</p>
        {!userId && (
          <button onClick={() => signIn()} className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all">
            <LogIn size={13} /> Inicia sesión para inscribirte
          </button>
        )}
      </div>

      {/* ===== SECCIÓN: PROYECTOS ===== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <Users className="text-primary" size={18} />
          <h2 className="font-heading text-lg font-bold text-primary-dark">Proyectos Comunitarios</h2>
        </div>

        {loadingProjects ? (
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
                      <span className="flex items-center gap-1 text-primary font-semibold">
                        <Users size={12} />
                        {p.participant_count}
                        {p.max_participants && p.max_participants > 0 ? ` / ${p.max_participants}` : ''}
                        {p.participant_count === 1 ? ' inscrito' : ' inscritos'}
                      </span>
                    </div>

                    {/* Join Button */}
                    {p.status !== 'completado' && (
                      <button
                        onClick={() => handleJoinProject(p.id)}
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

      {/* ===== SECCIÓN: ACTIVIDADES ===== */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <CalendarCheck className="text-primary" size={18} />
          <h2 className="font-heading text-lg font-bold text-primary-dark">Actividades y Eventos</h2>
        </div>

        <div className="bg-card rounded-xl p-4 border border-primary/20 bg-gradient-to-br from-primary/[0.02] to-secondary/[0.03] shadow-sm">
          <p className="text-xs text-text-light leading-relaxed">
            Marca las actividades en las que te gustaría participar. Tu inscripción queda guardada en tu perfil y nos ayuda a planificar.
          </p>
        </div>

        {loadingActivities ? (
          <p className="text-center text-text-light py-8">Cargando actividades...</p>
        ) : activities.length === 0 ? (
          <p className="text-center text-text-light py-8">Aún no hay actividades disponibles.</p>
        ) : (
          <div className="space-y-3">
            {activities.map(a => {
              const isSelected = selectedActivities.has(a.name);
              const isSaving = savingActivity === a.name;
              return (
                <div
                  key={a.id}
                  className={`bg-card rounded-xl p-4 border shadow-sm transition-all ${
                    isSelected ? 'border-primary/30 bg-primary/[0.02]' : 'border-gray-200/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-heading font-bold text-sm ${isSelected ? 'text-primary-dark' : 'text-text'}`}>
                        {a.name}
                      </h3>
                      {a.description && (
                        <p className="text-xs text-text-light mt-0.5 leading-relaxed">{a.description}</p>
                      )}
                      <p className="text-[10px] text-text-light/60 mt-1">
                        <Users size={10} className="inline mr-0.5" />
                        {a.participants || 0} {(a.participants || 0) === 1 ? 'persona inscrita' : 'personas inscritas'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleActivity(a.name)}
                      disabled={isSaving || !userId}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-60 ${
                        isSelected
                          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                          : !userId
                          ? 'bg-gray-100 text-text-light border border-gray-200'
                          : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                      }`}
                    >
                      {isSaving ? (
                        <><Loader2 size={11} className="animate-spin" /> Guardando...</>
                      ) : isSelected ? (
                        <><CheckCircle size={11} /> Inscrito</>
                      ) : !userId ? (
                        <><LogIn size={11} /> Inicia sesión</>
                      ) : (
                        <>Inscribirme</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Nota si no ha iniciado sesión */}
        {!userId && (
          <div className="text-center py-4">
            <button onClick={() => signIn()} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all">
              <LogIn size={13} /> Iniciar sesión para guardar inscripciones
            </button>
          </div>
        )}
      </div>
    </div>
  );
}