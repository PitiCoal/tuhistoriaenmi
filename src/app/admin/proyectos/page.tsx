'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser } from '@/lib/firebase';
import { Plus, Pencil, Trash2, LogOut, LogIn, Save, X, FolderKanban, Mic } from 'lucide-react';

type Tab = 'proyectos' | 'episodios';
type Project = { id: string; title: string; description: string; date: string; status: string; image: string; };
type EpisodeData = { id: string; season: number; episode: number; title: string; guest: string; description: string; image: string; youtube: string; spotify: string; apple: string; amazon: string; };

const ADMIN_EMAIL = 'piti.coal@gmail.com';
const STORAGE_PROJECTS = 'tm_projects';
const STORAGE_EPISODES = 'tm_episodes_admin';

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try { const d = localStorage.getItem(key); if (d) return JSON.parse(d); } catch {}
  return fallback;
}

function saveToStorage(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

const emptyProject = { title: '', description: '', date: '', status: 'próximo', image: '' };
const emptyEpisode = { season: 1, episode: 1, title: '', guest: '', description: '', image: '', youtube: '', spotify: '', apple: '', amazon: '' };

export default function AdminProyectosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('proyectos');

  const [projects, setProjects] = useState<Project[]>([]);
  const [pForm, setPForm] = useState(emptyProject);
  const [pEditingId, setPEditingId] = useState<string | null>(null);

  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
  const [eForm, setEForm] = useState(emptyEpisode);
  const [eEditingId, setEEditingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    setProjects(loadFromStorage(STORAGE_PROJECTS, [
      { id: 'p1', title: 'Cachipun de la Gratitud', description: 'Intervención urbana.', date: 'Julio 2026', status: 'próximo', image: '/images/logo.png' },
      { id: 'p2', title: 'Merch TM', description: 'Polerón y polera oficial.', date: 'Julio 2026', status: 'en curso', image: '/images/logo.png' },
      { id: 'p3', title: 'App Comunidad TM', description: 'Plataforma web.', date: 'Julio-Agosto 2026', status: 'en curso', image: '/images/logo.png' },
    ]));
    setEpisodes(loadFromStorage(STORAGE_EPISODES, []));
    return unsub;
  }, []);

  if (loading) return <div className="text-center py-20 text-text-light">Cargando...</div>;
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <h1 className="font-heading text-2xl font-bold text-primary-dark">Acceso restringido</h1>
        <p className="text-text-light">Inicia sesión para administrar.</p>
        <button onClick={signInWithGoogle} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"><LogIn size={16} /> Iniciar sesión con Google</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-primary-dark">Panel Admin</h1>
        <button onClick={signOutUser} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-light hover:text-primary transition-colors"><LogOut size={14} /> Cerrar sesión</button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('proyectos')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'proyectos' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><FolderKanban size={16} /> Proyectos</button>
        <button onClick={() => setTab('episodios')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'episodios' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><Mic size={16} /> Episodios</button>
      </div>

      {tab === 'proyectos' && (
        <ProjectsTab
          projects={projects} setProjects={setProjects} storageKey={STORAGE_PROJECTS}
          form={pForm} setForm={setPForm} editingId={pEditingId} setEditingId={setPEditingId}
        />
      )}

      {tab === 'episodios' && (
        <EpisodesTab
          episodes={episodes} setEpisodes={setEpisodes} storageKey={STORAGE_EPISODES}
          form={eForm} setForm={setEForm} editingId={eEditingId} setEditingId={setEEditingId}
        />
      )}
    </div>
  );
}

function ProjectsTab({ projects, setProjects, storageKey, form, setForm, editingId, setEditingId }: any) {
  function save(updated: Project[]) { setProjects(updated); saveToStorage(storageKey, updated); }
  function add() {
    if (!form.title.trim()) return;
    save([...projects, { id: Date.now().toString(), title: form.title.trim(), description: form.description.trim(), date: form.date.trim(), status: form.status, image: form.image.trim() || '/images/logo.png' }]);
    setForm(emptyProject);
  }
  function update() {
    if (!editingId || !form.title.trim()) return;
    save(projects.map((p: Project) => p.id === editingId ? { ...p, title: form.title.trim(), description: form.description.trim(), date: form.date.trim(), status: form.status, image: form.image.trim() || '/images/logo.png' } : p));
    setEditingId(null); setForm(emptyProject);
  }
  function del(id: string) { if (confirm('¿Eliminar?')) save(projects.filter((p: Project) => p.id !== id)); }
  function edit(p: Project) { setEditingId(p.id); setForm({ title: p.title, description: p.description, date: p.date, status: p.status, image: p.image }); }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <h2 className="font-semibold text-primary-dark">{editingId ? 'Editar proyecto' : 'Agregar proyecto'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" placeholder="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Fecha" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="próximo">Próximo</option><option value="en curso">En curso</option><option value="completado">Completado</option>
          </select>
          <input type="text" placeholder="URL imagen" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <textarea placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <div className="flex gap-2">
          {editingId ? (
            <><button onClick={update} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"><Save size={14} /> Guardar</button><button onClick={() => { setEditingId(null); setForm(emptyProject); }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"><X size={14} /> Cancelar</button></>
          ) : (
            <button onClick={add} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"><Plus size={14} /> Agregar proyecto</button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {projects.map((p: Project) => (
          <div key={p.id} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md flex gap-4">
            <img src={p.image} alt="" className="w-16 h-16 rounded-lg object-contain bg-gray-50" />
            <div className="flex-1 min-w-0"><h3 className="font-semibold text-primary-dark">{p.title}</h3><p className="text-sm text-text-light line-clamp-2">{p.description}</p></div>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => edit(p)} className="p-1.5 text-text-light hover:text-primary"><Pencil size={16} /></button>
              <button onClick={() => del(p.id)} className="p-1.5 text-text-light hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EpisodesTab({ episodes, setEpisodes, storageKey, form, setForm, editingId, setEditingId }: any) {
  function save(updated: EpisodeData[]) { setEpisodes(updated); saveToStorage(storageKey, updated); }
  function add() {
    if (!form.title.trim() || !form.guest.trim()) return;
    save([...episodes, { id: Date.now().toString(), ...form, title: form.title.trim(), guest: form.guest.trim(), description: form.description.trim(), image: form.image.trim(), youtube: form.youtube.trim(), spotify: form.spotify.trim(), apple: form.apple.trim(), amazon: form.amazon.trim() }]);
    setForm(emptyEpisode);
  }
  function update() {
    if (!editingId || !form.title.trim()) return;
    save(episodes.map((e: EpisodeData) => e.id === editingId ? { ...e, ...form, title: form.title.trim(), guest: form.guest.trim(), description: form.description.trim() } : e));
    setEditingId(null); setForm(emptyEpisode);
  }
  function del(id: string) { if (confirm('¿Eliminar episodio?')) save(episodes.filter((e: EpisodeData) => e.id !== id)); }
  function edit(e: EpisodeData) { setEditingId(e.id); setForm({ season: e.season, episode: e.episode, title: e.title, guest: e.guest, description: e.description, image: e.image, youtube: e.youtube, spotify: e.spotify, apple: e.apple, amazon: e.amazon }); }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <h2 className="font-semibold text-primary-dark">{editingId ? 'Editar episodio' : 'Agregar episodio'}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <input type="number" placeholder="Temp" value={form.season} onChange={e => setForm({ ...form, season: parseInt(e.target.value) || 1 })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="number" placeholder="Episodio" value={form.episode} onChange={e => setForm({ ...form, episode: parseInt(e.target.value) || 1 })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="col-span-2 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Invitado" value={form.guest} onChange={e => setForm({ ...form, guest: e.target.value })} className="col-span-2 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="URL imagen" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="col-span-2 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="YouTube URL" value={form.youtube} onChange={e => setForm({ ...form, youtube: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Spotify URL" value={form.spotify} onChange={e => setForm({ ...form, spotify: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Apple URL" value={form.apple} onChange={e => setForm({ ...form, apple: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Amazon URL" value={form.amazon} onChange={e => setForm({ ...form, amazon: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <textarea placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <div className="flex gap-2">
          {editingId ? (
            <><button onClick={update} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"><Save size={14} /> Guardar</button><button onClick={() => { setEditingId(null); setForm(emptyEpisode); }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"><X size={14} /> Cancelar</button></>
          ) : (
            <button onClick={add} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"><Plus size={14} /> Agregar episodio</button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {episodes.map((e: EpisodeData) => (
          <div key={e.id} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md flex gap-4 items-center">
            <img src={e.image || '/images/logo.png'} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-50" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary-dark">{e.title}</h3>
              <p className="text-sm text-text-light">T{e.season} E{e.episode} — con {e.guest}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => edit(e)} className="p-1.5 text-text-light hover:text-primary"><Pencil size={16} /></button>
              <button onClick={() => del(e.id)} className="p-1.5 text-text-light hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {episodes.length === 0 && <p className="text-center text-text-light py-8">Aún no hay episodios. Agrega el primero.</p>}
      </div>
    </div>
  );
}
