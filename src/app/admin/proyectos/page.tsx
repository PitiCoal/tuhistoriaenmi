'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Pencil, Trash2, LogOut, LogIn, Save, X, FolderKanban, Mic, Image as ImageIcon, MessageSquare, Heart, MessageCircle, Handshake, Users, Search, FileText, BarChart3, Bell, Send, CalendarCheck, CheckCircle, Clock } from 'lucide-react';
import { episodes as defaultEpisodes } from '@/lib/episodes';
import { getSponsors, createSponsor, updateSponsor, deleteSponsor, getAllProfiles, getPageContent, upsertPageContent, getImpactMetrics, createImpactMetric, updateImpactMetric, deleteImpactMetric, countProfiles, countEpisodes, countTestimonios, countSponsors, getAllPushSubscriptions, getPushSubscriptionCount, saveEpisodeToSupabase, loadEpisodesFromSupabase, deleteEpisodeFromSupabase, uploadFile, mergeEpisodesWithDefaults, getActivities, createActivity, updateActivity, deleteActivity, getProjects, createProject, updateProject, deleteProject, getHeroImage, saveHeroImage, getParticipaEntries, createParticipaEntry, deleteParticipaEntry, clearAllParticipaEntries, getMuroPosts, deleteMuroPost, getMuroReplies, deleteMuroReply, getAllReactionCounts, getTotalReactionCount, getTestimonios, approveTestimonio, deleteTestimonioPublico, getPageViewsCount, getEpisodeClicksCount, getEpisodeClicksCountByPlatform, getDevotionals, saveDevotional, deleteDevotional } from '@/lib/supabase';

type Tab = 'proyectos' | 'episodios' | 'inicio' | 'participa' | 'auspiciadores' | 'perfiles' | 'paginas' | 'metricas' | 'notificaciones' | 'actividades' | 'testimonios' | 'devocionales' | 'muro';
type Project = { id: string; title: string; description: string; date: string; status: string; image: string; participants?: number };
type EpisodeData = { id: string; season: number; episode: number; title: string; guest: string; description: string; image: string; image_position: string; youtube: string; spotify: string; apple: string; amazon: string; };

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

const emptyProject = { title: '', description: '', date: '', status: 'próximo', image: '', participants: 0 };
const emptyEpisode = { season: 1, episode: 1, title: '', guest: '', description: '', image: '', image_position: 'center', youtube: '', spotify: '', apple: '', amazon: '' };
const HERO_KEY = 'tm_hero_image';

export default function AdminProyectosPage() {
  const { user, signIn, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('proyectos');

  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
  const [eForm, setEForm] = useState(emptyEpisode);
  const [eEditingId, setEEditingId] = useState<string | null>(null);

  useEffect(() => {
    setEpisodes(loadFromStorage(STORAGE_EPISODES, []));
  }, []);

  if (user === 'loading') return <div className="text-center py-20 text-text-light">Cargando...</div>;
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <h1 className="font-heading text-2xl font-bold text-primary-dark">Acceso restringido</h1>
        <p className="text-text-light">Inicia sesión para administrar.</p>
        <button onClick={() => signIn()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"><LogIn size={16} /> Iniciar sesión con Google</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-primary-dark">Panel Admin</h1>
        <button onClick={() => signOut()} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-light hover:text-primary transition-colors"><LogOut size={14} /> Cerrar sesión</button>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        <button onClick={() => setTab('proyectos')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'proyectos' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><FolderKanban size={16} /> Proyectos</button>
        <button onClick={() => setTab('episodios')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'episodios' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><Mic size={16} /> Episodios</button>
        <button onClick={() => setTab('inicio')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'inicio' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><ImageIcon size={16} /> Inicio</button>
        <button onClick={() => setTab('participa')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'participa' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><MessageSquare size={16} /> Participación</button>
        <button onClick={() => setTab('auspiciadores')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'auspiciadores' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><Handshake size={16} /> Auspiciadores</button>
        <button onClick={() => setTab('perfiles')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'perfiles' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><Users size={16} /> Perfiles</button>
        <button onClick={() => setTab('paginas')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'paginas' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><FileText size={16} /> Páginas</button>
        <button onClick={() => setTab('metricas')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'metricas' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><BarChart3 size={16} /> Métricas</button>
        <button onClick={() => setTab('notificaciones')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'notificaciones' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><Bell size={16} /> Notificaciones</button>
        <button onClick={() => setTab('actividades')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'actividades' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><CalendarCheck size={16} /> Actividades</button>
        <button onClick={() => setTab('testimonios')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'testimonios' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><MessageCircle size={16} /> Testimonios</button>
        <button onClick={() => setTab('devocionales')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'devocionales' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><BookOpen size={16} /> Devocionales</button>
        <button onClick={() => setTab('muro')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'muro' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><MessageSquare size={16} /> Muro</button>
      </div>

      {tab === 'proyectos' && <ProjectsTab />}

      {tab === 'episodios' && (
        <EpisodesTab
          episodes={episodes} setEpisodes={setEpisodes} storageKey={STORAGE_EPISODES}
          form={eForm} setForm={setEForm} editingId={eEditingId} setEditingId={setEEditingId}
        />
      )}

      {tab === 'inicio' && <HeroSettingsTab />}

      {tab === 'participa' && <ParticipaTab />}

      {tab === 'auspiciadores' && <AuspiciadoresTab />}

      {tab === 'perfiles' && <PerfilesTab />}

      {tab === 'paginas' && <PaginasTab />}

      {tab === 'metricas' && <MetricasTab />}

      {tab === 'notificaciones' && <NotificacionesTab />}

      {tab === 'actividades' && <ActividadesTab />}
      {tab === 'testimonios' && <TestimoniosAdminTab />}
      {tab === 'devocionales' && <DevotionalsAdminTab />}
      {tab === 'muro' && <MuroAdminTab />}
    </div>
  );
}

function ProjectsTab() {
  const [projects, setProjects] = useState<any[]>([]);
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setProjects(await getProjects());
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Error cargando proyectos');
      console.error('load projects error:', e);
    }
    setLoading(false);
  }

  function save(updated: any[]) { setProjects(updated); }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await uploadFile('episode-images', 'projects', file);
      if (url) {
        setForm(prev => ({ ...prev, image: url }));
      } else {
        setError('Error subiendo imagen');
      }
    } catch (err: any) {
      setError(err.message || 'Error subiendo imagen');
    } finally {
      setImageUploading(false);
    }
  }

  async function add() {
    if (!form.title.trim()) return;
    setError(null);
    const res = await createProject({ ...form, title: form.title.trim(), description: form.description.trim(), date: form.date.trim(), status: form.status, image: form.image.trim() || '/images/logo.png', participants: form.participants || 0 });
    if (res.error) { setError(res.error.message || 'Error creando proyecto'); return; }
    if (res.data) { save([...projects, res.data]); setForm(emptyProject); }
  }

  async function update() {
    if (!editingId || !form.title.trim()) return;
    setError(null);
    const res = await updateProject(editingId, { ...form, title: form.title.trim(), description: form.description.trim(), date: form.date.trim(), status: form.status, image: form.image.trim() || '/images/logo.png', participants: form.participants || 0 });
    if (res.error) { setError(res.error.message || 'Error actualizando proyecto'); return; }
    if (res.data) { save(projects.map((p: any) => p.id === editingId ? { ...p, ...(res.data as any) } : p)); setEditingId(null); setForm(emptyProject); }
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar?')) return;
    setError(null);
    const res = await deleteProject(id);
    if (res.error) { setError(res.error.message || 'Error eliminando proyecto'); return; }
    save(projects.filter((p: any) => p.id !== id));
  }

  function edit(p: any) { setEditingId(p.id); setForm({ title: p.title, description: p.description, date: p.date, status: p.status, image: p.image, participants: p.participants || 0 }); }

  if (loading) return <p className="text-center text-text-light py-8">Cargando proyectos...</p>;

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error} <button onClick={() => setError(null)} className="ml-2 underline">Cerrar</button></div>}
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <h2 className="font-semibold text-primary-dark">{editingId ? 'Editar proyecto' : 'Agregar proyecto'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-light">Título del proyecto *</label>
            <input type="text" placeholder="Ej: Talleres de oración" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-light">Fecha (ej: 2026-10-15, Pendiente, Por confirmar)</label>
            <input type="text" placeholder="Fecha del proyecto" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <div className="flex gap-1.5 mt-0.5">
              <button type="button" onClick={() => setForm({ ...form, date: 'Pendiente' })} className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-[10px] text-text-light rounded transition-colors">Pendiente</button>
              <button type="button" onClick={() => setForm({ ...form, date: 'Por confirmar' })} className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-[10px] text-text-light rounded transition-colors">Por confirmar</button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-light">Estado</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="próximo">Próximo</option>
              <option value="en curso">En curso</option>
              <option value="completado">Completado</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-light">Participantes (Nº personas inscritas)</label>
            <input type="number" placeholder="Participantes" min="0" value={form.participants || 0} onChange={e => setForm({ ...form, participants: parseInt(e.target.value) || 0 })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div className="col-span-1 sm:col-span-2 space-y-2">
            <label className="text-xs font-medium text-text-light">Imagen del proyecto (No es obligatoria)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-200/50">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-text-light block">Subir imagen:</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={imageUploading}
                  className="w-full text-xs text-text-light file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-[11px] file:font-semibold hover:file:bg-primary/90 cursor-pointer" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-text-light block">O pegar enlace de internet (URL):</span>
                <input type="text" placeholder="https://ejemplo.com/imagen.jpg" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            {imageUploading && <p className="text-xs text-primary">Subiendo imagen...</p>}
            {form.image && !imageUploading && (
              <div className="flex items-center gap-2 mt-1">
                <img src={form.image} alt="Preview" className="h-10 w-10 rounded-lg object-cover border border-gray-200" />
                <button type="button" onClick={() => setForm({ ...form, image: '' })} className="text-xs text-red-500 hover:underline font-medium">Quitar imagen</button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-light">Descripción</label>
          <textarea placeholder="Detalla el proyecto aquí..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-2">
          {editingId ? (
            <><button onClick={update} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"><Save size={14} /> Guardar</button><button onClick={() => { setEditingId(null); setForm(emptyProject); }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"><X size={14} /> Cancelar</button></>
          ) : (
            <button onClick={add} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"><Plus size={14} /> Agregar proyecto</button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {projects.map((p: any) => (
          <div key={p.id} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md flex gap-4">
            <img src={p.image} alt="" className="w-16 h-16 rounded-lg object-contain bg-gray-50" />
            <div className="flex-1 min-w-0"><h3 className="font-semibold text-primary-dark">{p.title}</h3><p className="text-sm text-text-light line-clamp-2">{p.description}</p></div>
            <div className="flex flex-col gap-1.5 items-end">
              {p.participants && p.participants > 0 && <span className="text-sm text-primary font-medium">👥 {p.participants}</span>}
              <button onClick={() => edit(p)} className="p-1.5 text-text-light hover:text-primary"><Pencil size={16} /></button>
              <button onClick={() => del(p.id)} className="p-1.5 text-text-light hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p className="text-center text-text-light py-8">No hay proyectos. Crea el primero.</p>}
      </div>
    </div>
  );
}

function EpisodesTab({ episodes, setEpisodes, storageKey, form, setForm, editingId, setEditingId }: any) {
  const [cloudEpisodes, setCloudEpisodes] = useState<any[]>([]);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    setEpisodes(loadFromStorage(storageKey, []));
    loadEpisodesFromSupabase().then(setCloudEpisodes);
  }, []);

  function getMergedEpisodes(): EpisodeData[] {
    const defaults: EpisodeData[] = defaultEpisodes.map(e => ({
      id: e.id, season: e.season, episode: e.episode,
      title: e.title, guest: e.guest, description: e.description,
      image: e.image, image_position: 'center',
      youtube: e.links.youtube || '', spotify: e.links.spotify || '',
      apple: e.links.apple || '', amazon: e.links.amazon || '',
    }));
    const merged: EpisodeData[] = [...defaults];
    // Override with Supabase data
    for (const ce of cloudEpisodes) {
      const idx = merged.findIndex((e: EpisodeData) => e.id === ce.id);
      const ep: EpisodeData = { id: ce.id, season: ce.season, episode: ce.episode, title: ce.title, guest: ce.guest, description: ce.description || '', image: ce.image || defaults.find((d: any) => d.id === ce.id)?.image || '/images/logo.png', image_position: ce.image_position || 'center', youtube: ce.youtube || '', spotify: ce.spotify || '', apple: ce.apple || '', amazon: ce.amazon || '' };
      if (idx >= 0) merged[idx] = { ...merged[idx], ...ep };
      else merged.push(ep);
    }
    // Override with local edits
    for (const ae of episodes) {
      const idx = merged.findIndex((e: EpisodeData) => e.id === ae.id);
      if (idx >= 0) merged[idx] = ae;
      else merged.push(ae);
    }
    return merged;
  }
  const mergedEpisodes = getMergedEpisodes();

  function save(updated: EpisodeData[]) { setEpisodes(updated); saveToStorage(storageKey, updated); }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const url = await uploadFile('episode-images', 'admin', file);
    if (url) setForm({ ...form, image: url });
    setImageUploading(false);
  }

  async function add() {
    if (!form.title.trim() || !form.guest.trim()) return;
    const newEp = { id: Date.now().toString(), ...form, title: form.title.trim(), guest: form.guest.trim(), description: form.description.trim(), image: form.image.trim(), image_position: form.image_position || 'center', youtube: form.youtube.trim(), spotify: form.spotify.trim(), apple: form.apple.trim(), amazon: form.amazon.trim() };
    save([...episodes, newEp]);
    await saveEpisodeToSupabase(newEp);
    setCloudEpisodes(await loadEpisodesFromSupabase());
    setForm(emptyEpisode);
  }

  async function update() {
    if (!editingId || !form.title.trim()) return;
    const updated = episodes.filter((e: EpisodeData) => e.id !== editingId);
    const updatedEp = { id: editingId, ...form, title: form.title.trim(), guest: form.guest.trim(), description: form.description.trim(), image: form.image.trim(), image_position: form.image_position || 'center', youtube: form.youtube.trim(), spotify: form.spotify.trim(), apple: form.apple.trim(), amazon: form.amazon.trim() };
    save([...updated, updatedEp]);
    await saveEpisodeToSupabase(updatedEp);
    setCloudEpisodes(await loadEpisodesFromSupabase());
    setEditingId(null); setForm(emptyEpisode);
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar episodio?')) return;
    save(episodes.filter((e: EpisodeData) => e.id !== id));
    await deleteEpisodeFromSupabase(id);
    setCloudEpisodes(await loadEpisodesFromSupabase());
  }

  function edit(e: EpisodeData) { setEditingId(e.id); setForm({ season: e.season, episode: e.episode, title: e.title, guest: e.guest, description: e.description, image: e.image, image_position: e.image_position || 'center', youtube: e.youtube, spotify: e.spotify, apple: e.apple, amazon: e.amazon }); }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <h2 className="font-semibold text-primary-dark">{editingId ? 'Editar episodio' : 'Agregar episodio'}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <input type="number" placeholder="Temp" value={form.season} onChange={e => setForm({ ...form, season: parseInt(e.target.value) || 1 })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="number" placeholder="Episodio" value={form.episode} onChange={e => setForm({ ...form, episode: parseInt(e.target.value) || 1 })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="col-span-2 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Invitado" value={form.guest} onChange={e => setForm({ ...form, guest: e.target.value })} className="col-span-2 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <div className="col-span-2 space-y-2">
            <div className="flex items-center gap-3">
              <label className="flex-1">
                <span className="text-xs text-text-light block mb-1">Subir imagen desde tu compu:</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={imageUploading}
                  className="w-full text-sm text-text-light file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-xs file:font-semibold hover:file:bg-primary/90" />
              </label>
              <span className="text-xs text-text-light">o</span>
              <input type="text" placeholder="Pegar URL de imagen" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            {imageUploading && <p className="text-xs text-primary">Subiendo imagen...</p>}
            {form.image && !imageUploading && (
              <div className="flex items-center gap-2">
                <img src={form.image} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-gray-200" />
                <button onClick={() => setForm({ ...form, image: '' })} className="text-xs text-red-500 hover:underline">Quitar imagen</button>
              </div>
            )}
          </div>
          <div className="col-span-2 flex items-center gap-3">
            <span className="text-xs text-text-light whitespace-nowrap">Posición imagen:</span>
            {['superior', 'centro', 'inferior'].map(pos => (
              <button key={pos} onClick={() => setForm({ ...form, image_position: pos === 'superior' ? 'top' : pos === 'centro' ? 'center' : 'bottom' })}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  (pos === 'superior' && form.image_position === 'top') ||
                  (pos === 'centro' && form.image_position === 'center') ||
                  (pos === 'inferior' && form.image_position === 'bottom')
                    ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
                }`}
              >{pos === 'superior' ? '▲ Sup.' : pos === 'centro' ? '⊙ Centro' : '▼ Inf.'}</button>
            ))}
          </div>
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
        {mergedEpisodes.map((e: EpisodeData) => {
          const isAdmin = episodes.some((ae: EpisodeData) => ae.id === e.id);
          const isCloud = cloudEpisodes.some((ce: any) => ce.id === e.id);
          return (
            <div key={e.id} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md flex gap-4 items-center">
              <img src={e.image || '/images/logo.png'} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-50" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-primary-dark">{e.title}</h3>
                  {!isAdmin && !isCloud && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-text-light">original</span>}
                  {isCloud && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">nube</span>}
                </div>
                <p className="text-sm text-text-light">T{e.season} E{e.episode} — con {e.guest}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => edit(e)} className="p-1.5 text-text-light hover:text-primary"><Pencil size={16} /></button>
                <button onClick={() => del(e.id)} className="p-1.5 text-text-light hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          );
        })}
        {mergedEpisodes.length === 0 && <p className="text-center text-text-light py-8">Aún no hay episodios.</p>}
      </div>
    </div>
  );
}

function HeroSettingsTab() {
  const [heroImage, setHeroImage] = useState('');
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getHeroImage().then(url => {
      if (url) { setPreview(url); setHeroImage(url); }
      else setPreview('/images/hero-bg.png');
    });
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = ev.target?.result as string;
        setHeroImage(data);
        setPreview(data);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSave() {
    if (!heroImage) return;
    setSaving(true);
    await saveHeroImage(heroImage);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    setHeroImage('');
    setPreview('/images/hero-bg.png');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
      <h2 className="font-semibold text-primary-dark">Imagen de inicio (Hero)</h2>
      <p className="text-sm text-text-light">Esta imagen aparece en la pantalla principal de la página de inicio.</p>

      <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
        {preview && <img src={preview} alt="Hero preview" className="w-full h-full object-cover" />}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <label className="flex-1">
          <span className="text-xs text-text-light block mb-1">Subir imagen desde tu compu:</span>
          <input type="file" accept="image/*" onChange={handleFile}
            className="w-full text-sm text-text-light file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-xs file:font-semibold hover:file:bg-primary/90" />
        </label>
        <span className="text-xs text-text-light pt-5">o</span>
        <input type="text" placeholder="Pegar URL de imagen" value={heroImage.startsWith('data:') ? '' : heroImage}
          onChange={e => { setHeroImage(e.target.value); setPreview(e.target.value); }}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
          <Save size={14} /> {saving ? 'Guardando...' : 'Guardar imagen'}
        </button>
        <button onClick={handleReset} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors">
          Restaurar imagen original
        </button>
      </div>
      {saved && <p className="text-green-600 text-xs">¡Guardado! Recarga la página de inicio para ver el cambio.</p>}
    </div>
  );
}

function ParticipaTab() {
  const [entries, setEntries] = useState<any[]>([]);
  const [filterTab, setFilterTab] = useState<string>('todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParticipaEntries().then(data => {
      setEntries(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function deleteEntry(id: string) {
    if (!confirm('¿Eliminar esta publicación?')) return;
    await deleteParticipaEntry(id);
    setEntries(entries.filter(e => e.id !== id));
  }

  async function clearAll() {
    if (!confirm('¿Eliminar TODAS las publicaciones? Esta acción no se puede deshacer.')) return;
    await clearAllParticipaEntries();
    setEntries([]);
  }

  const filtered = filterTab === 'todas' ? entries : entries.filter(e => e.tab === filterTab);
  const tabLabels: Record<string, string> = { oraciones: 'Oraciones', reflexiones: 'Reflexiones', sugerencias: 'Sugerencias' };

  if (loading) return <p className="text-center text-text-light py-8">Cargando...</p>;

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-primary-dark">Moderar Participa</h2>
          {entries.length > 0 && (
            <button onClick={clearAll} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 size={12} /> Eliminar todo
            </button>
          )}
        </div>
        <p className="text-xs text-text-light">Total: {entries.length} publicaciones</p>

        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterTab('todas')} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterTab === 'todas' ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'}`}>Todas</button>
          {['oraciones', 'reflexiones', 'sugerencias'].map(t => (
            <button key={t} onClick={() => setFilterTab(t)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterTab === t ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'}`}>{tabLabels[t]}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-text-light py-8">No hay publicaciones.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(e => (
            <div key={e.id} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm flex gap-3 items-start">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    e.tab === 'oraciones' ? 'bg-red-100 text-red-700' :
                    e.tab === 'reflexiones' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {e.tab === 'oraciones' ? '🙏' : e.tab === 'reflexiones' ? '💬' : '🎤'} {tabLabels[e.tab]}
                  </span>
                  <span className="text-[10px] text-text-light">{new Date(e.created_at).toLocaleDateString('es-CL')}</span>
                  <span className="text-[10px] text-text-light">{e.name || 'Anónimo'}</span>
                </div>
                <p className="text-sm text-text">{e.text}</p>
              </div>
              <button onClick={() => deleteEntry(e.id)} className="p-1.5 text-text-light hover:text-red-500 shrink-0 transition-colors" title="Eliminar">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PerfilesTab() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProfiles().then(data => { setProfiles(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = profiles.filter(p =>
    !search || (p.display_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (p.country?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (p.bio?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (p.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (p.testimonio?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <h2 className="font-semibold text-primary-dark">Perfiles de la comunidad</h2>
        <p className="text-xs text-text-light">Total: {profiles.length} perfiles registrados</p>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
          <input type="text" placeholder="Buscar por nombre, país, email, bio o testimonio..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-text-light py-8">Cargando perfiles...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-text-light py-8">{profiles.length === 0 ? 'Aún no hay perfiles registrados.' : 'Ningún perfil coincide con la búsqueda.'}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p.user_id} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm flex items-center gap-4">
              {p.photo_url ? (
                <img src={p.photo_url} alt="" className="w-12 h-12 rounded-full object-cover border" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users size={18} className="text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-primary-dark text-sm truncate">{p.display_name || 'Sin nombre'}</h3>
                  {p.country && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-text-light shrink-0">{p.country}</span>}
                  {p.age && <span className="text-[10px] text-text-light shrink-0">{p.age} años</span>}
                </div>
                {p.bio && <p className="text-xs text-text-light truncate mt-0.5">{p.bio}</p>}
                {p.email && <p className="text-xs text-text-light/60 truncate mt-0.5">📧 {p.email}</p>}
                {p.testimonio && <p className="text-xs text-primary-dark/80 truncate mt-0.5">💬 {p.testimonio}</p>}
                <p className="text-[10px] text-text-light/60 mt-0.5">
                  Creado {new Date(p.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const PAGINAS_SECTIONS: Record<string, { label: string; sections: { key: string; label: string; type: 'text' | 'textarea' | 'image' }[] }> = {
  nosotros: {
    label: 'Nosotros',
    sections: [
      { key: 'hero_title', label: 'Título del hero', type: 'text' },
      { key: 'hero_subtitle', label: 'Subtítulo del hero', type: 'text' },
      { key: 'como_empezo', label: 'Cómo empezó', type: 'textarea' },
      { key: 'que_buscamos', label: 'Qué buscamos', type: 'textarea' },
      { key: 'mision', label: 'Misión', type: 'textarea' },
      { key: 'vision', label: 'Visión', type: 'textarea' },
      { key: 'valores', label: 'Valores', type: 'textarea' },
      { key: 'creadora_bio', label: 'Bio de la creadora', type: 'textarea' },
      { key: 'oracion', label: 'Oración', type: 'textarea' },
    ],
  },
  donation: {
    label: 'Donación (Metas)',
    sections: [
      { key: 'active', label: 'Meta Activa (escribe "true" para activarla o "false" para ocultarla)', type: 'text' },
      { key: 'title', label: 'Título de la meta (ej: Financiamiento de Servidores y Producción)', type: 'text' },
      { key: 'target', label: 'Monto meta (solo números, ej: 500000)', type: 'text' },
      { key: 'current', label: 'Monto recaudado (solo números, ej: 150000)', type: 'text' },
    ],
  },
};

function PaginasTab() {
  const [page, setPage] = useState('nosotros');
  const [content, setContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [page]);

  async function load() {
    const data = await getPageContent(page);
    setContent(data);
  }

  async function handleSave(key: string) {
    setSaving(true);
    await upsertPageContent(page, key, content[key] || '');
    setSaving(false);
  }

  async function handleSaveAll() {
    setSaving(true);
    for (const section of PAGINAS_SECTIONS[page].sections) {
      await upsertPageContent(page, section.key, content[section.key] || '');
    }
    setSaving(false);
  }

  const sections = PAGINAS_SECTIONS[page]?.sections || [];

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-primary-dark">Editor de contenido</h2>
          <select value={page} onChange={e => setPage(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            {Object.entries(PAGINAS_SECTIONS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-text-light">Edita el contenido de cada página. Los cambios se guardan en Supabase.</p>
      </div>

      <div className="space-y-4">
        {sections.map(s => (
          <div key={s.key} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-primary-dark">{s.label}</label>
            </div>
            {s.type === 'text' ? (
              <input type="text" value={content[s.key] || ''} onChange={e => setContent({ ...content, [s.key]: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            ) : s.type === 'textarea' ? (
              <textarea value={content[s.key] || ''} onChange={e => setContent({ ...content, [s.key]: e.target.value })}
                rows={4} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
            ) : null}
            <div className="flex justify-end">
              <button onClick={() => handleSave(s.key)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                <Save size={12} /> Guardar sección
              </button>
            </div>
          </div>
        ))}
      </div>

      {sections.length > 0 && (
        <div className="flex justify-center">
          <button onClick={handleSaveAll} disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save size={14} /> {saving ? 'Guardando...' : 'Guardar todas las secciones'}
          </button>
        </div>
      )}
    </div>
  );
}

function ActividadesTab() {
  const [activities, setActivities] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() { setActivities(await getActivities()); }

  async function add() {
    if (!form.name.trim()) return;
    await createActivity({ name: form.name.trim(), description: form.description.trim(), sort_order: activities.length });
    setForm({ name: '', description: '' }); await load();
  }

  async function update() {
    if (!editingId || !form.name.trim()) return;
    await updateActivity(editingId, { name: form.name.trim(), description: form.description.trim() });
    setEditingId(null); setForm({ name: '', description: '' }); await load();
  }

  async function toggleActive(id: string, current: boolean) {
    await updateActivity(id, { active: !current });
    await load();
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar actividad?')) return;
    await deleteActivity(id); await load();
  }

  function edit(a: any) { setEditingId(a.id); setForm({ name: a.name, description: a.description || '' }); }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <h2 className="font-semibold text-primary-dark">{editingId ? 'Editar actividad' : 'Agregar actividad/evento'}</h2>
        <p className="text-xs text-text-light">Define las actividades y eventos a los que los usuarios podrán inscribirse desde su perfil.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="text" placeholder="Nombre (ej: Encuentro TM)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Descripción (opcional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="col-span-2 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-2">
          {editingId ? (
            <><button onClick={update} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"><Save size={14} /> Guardar</button>
            <button onClick={() => { setEditingId(null); setForm({ name: '', description: '' }); }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300"><X size={14} /> Cancelar</button></>
          ) : (
            <button onClick={add} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"><Plus size={14} /> Agregar actividad</button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {activities.map((a: any) => (
          <div key={a.id} className={`bg-card rounded-xl p-5 border shadow-md flex gap-4 items-center ${a.active ? 'border-gray-200/70' : 'border-gray-200/30 opacity-60'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${a.active ? 'bg-primary/10' : 'bg-gray-100'}`}>
              <CalendarCheck size={18} className={a.active ? 'text-primary' : 'text-text-light'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-primary-dark">{a.name}</h3>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${a.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-text-light'}`}>
                  {a.active ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              {a.description && <p className="text-xs text-text-light mt-0.5">{a.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(a.id, a.active)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${a.active ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                {a.active ? 'Desactivar' : 'Activar'}
              </button>
              <button onClick={() => edit(a)} className="p-1.5 text-text-light hover:text-primary"><Pencil size={16} /></button>
              <button onClick={() => del(a.id)} className="p-1.5 text-text-light hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {activities.length === 0 && <p className="text-center text-text-light py-8">No hay actividades. Crea la primera.</p>}
      </div>
    </div>
  );
}

function NotificacionesTab() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [type, setType] = useState('announcements');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [subCount, setSubCount] = useState(0);

  useEffect(() => { getPushSubscriptionCount().then(setSubCount); }, []);

  async function handleSend() {
    if (!title.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title.trim(), 
          body: body.trim(), 
          url: url.trim() || '/',
          type: type
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, msg: `Enviada a ${data.sent} dispositivos${data.failed > 0 ? ` (${data.failed} fallaron)` : ''}` });
        setTitle(''); setBody('');
      } else {
        setResult({ ok: false, msg: data.error || 'Error al enviar' });
      }
    } catch {
      setResult({ ok: false, msg: 'Error de conexión' });
    }
    setSending(false);
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-primary" />
          <h2 className="font-semibold text-primary-dark">Enviar notificación</h2>
        </div>
        <p className="text-xs text-text-light">{subCount} dispositivos suscritos en total</p>

        {result && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${
            result.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {result.ok ? <Bell size={16} /> : <Send size={16} />} {result.msg}
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-light mb-1">Título *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={50}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Nuevo episodio disponible" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-light mb-1">Segmento / Categoría</label>
              <select value={type} onChange={e => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="announcements">Anuncios y Novedades (General)</option>
                <option value="daily_verse">Versículo del Día</option>
                <option value="daily_phrase">Frase del Día</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-light mb-1">Mensaje</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} maxLength={200} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Ya puedes escuchar el nuevo episodio..." />
            <p className="text-xs text-text-light/60 mt-1">{body.length}/200</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-light mb-1">URL al abrir</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="/" />
          </div>
        </div>

        <button onClick={handleSend} disabled={sending || !title.trim()}
          className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors active:scale-95">
          <Send size={16} /> {sending ? 'Enviando...' : `Enviar a ${subCount} dispositivos`}
        </button>
      </div>
    </div>
  );
}

const ICON_LABELS: Record<string, string> = {
  heart: 'Corazón', users: 'Usuarios', globe: 'Mundo',
  'book-open': 'Libro', 'message-circle': 'Mensajes',
  eye: 'Ojo', star: 'Estrella', 'trending-up': 'Tendencia',
};
const ICONS = Object.keys(ICON_LABELS);

function MetricasTab() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [form, setForm] = useState({ label: '', value: '', icon: 'heart' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [autoMetrics, setAutoMetrics] = useState({
    profiles: 0, episodes: 0, testimonios: 0, sponsors: 0, muroPosts: 0, totalReactions: 0,
    pageViews: 0, episodeClicks: 0
  });
  const [platformClicks, setPlatformClicks] = useState<Record<string, number>>({ youtube: 0, spotify: 0, apple: 0, amazon: 0 });

  useEffect(() => {
    loadMetrics();
    Promise.all([
      countProfiles(),
      countEpisodes(),
      countTestimonios(),
      countSponsors(),
      getMuroPosts().then(posts => posts.length),
      getTotalReactionCount('muro_post'),
      getPageViewsCount(),
      getEpisodeClicksCount(),
      getEpisodeClicksCountByPlatform()
    ]).then(
      ([a, b, c, d, e, f, g, h, i]) => {
        setAutoMetrics({
          profiles: a, episodes: b, testimonios: c, sponsors: d, muroPosts: e, totalReactions: f,
          pageViews: g, episodeClicks: h
        });
        setPlatformClicks(i || { youtube: 0, spotify: 0, apple: 0, amazon: 0 });
      }
    );
  }, []);

  async function loadMetrics() { setMetrics(await getImpactMetrics()); }

  async function add() {
    if (!form.label.trim() || !form.value.trim()) return;
    await createImpactMetric({ label: form.label.trim(), value: form.value.trim(), icon: form.icon, sort_order: metrics.length });
    setForm({ label: '', value: '', icon: 'heart' });
    await loadMetrics();
  }

  async function update() {
    if (!editingId || !form.label.trim() || !form.value.trim()) return;
    await updateImpactMetric(editingId, { label: form.label.trim(), value: form.value.trim(), icon: form.icon });
    setEditingId(null); setForm({ label: '', value: '', icon: 'heart' });
    await loadMetrics();
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar métrica?')) return;
    await deleteImpactMetric(id);
    await loadMetrics();
  }

  function edit(m: any) {
    setEditingId(m.id);
    setForm({ label: m.label, value: m.value, icon: m.icon || 'heart' });
  }

  return (
    <div className="space-y-4">
      {/* Auto-métricas */}
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-6">
        <div>
          <h2 className="font-semibold text-primary-dark mb-1">Métricas de la Plataforma</h2>
          <p className="text-xs text-text-light">Estadísticas calculadas automáticamente desde la base de datos.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-2xl font-bold text-primary">{autoMetrics.pageViews}</p>
            <p className="text-xs font-medium text-text-light">Visitas totales</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-2xl font-bold text-primary">{autoMetrics.episodeClicks}</p>
            <p className="text-xs font-medium text-text-light">Reproducciones (Clics)</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-2xl font-bold text-primary">{autoMetrics.profiles}</p>
            <p className="text-xs font-medium text-text-light">Usuarios registrados</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-2xl font-bold text-primary">{autoMetrics.episodes}</p>
            <p className="text-xs font-medium text-text-light">Episodios publicados</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-2xl font-bold text-primary">{autoMetrics.testimonios}</p>
            <p className="text-xs font-medium text-text-light">Testimonios recibidos</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-2xl font-bold text-primary">{autoMetrics.muroPosts}</p>
            <p className="text-xs font-medium text-text-light">Posts en el Muro</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-2xl font-bold text-primary">{autoMetrics.totalReactions}</p>
            <p className="text-xs font-medium text-text-light">Reacciones en comunidad</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-2xl font-bold text-primary">{autoMetrics.sponsors}</p>
            <p className="text-xs font-medium text-text-light">Auspiciadores</p>
          </div>
        </div>

        {/* Clics por plataforma */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-primary-dark">Escuchas por Plataforma (Clics)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'spotify', label: 'Spotify', color: 'bg-green-500' },
              { key: 'youtube', label: 'YouTube', color: 'bg-red-500' },
              { key: 'apple', label: 'Apple Podcasts', color: 'bg-purple-500' },
              { key: 'amazon', label: 'Amazon Music', color: 'bg-orange-500' },
            ].map(plat => {
              const count = platformClicks[plat.key] || 0;
              const pct = autoMetrics.episodeClicks > 0 ? (count / autoMetrics.episodeClicks) * 100 : 0;
              return (
                <div key={plat.key} className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-text-light">{plat.label}</span>
                    <span className="font-bold text-primary-dark">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className={`${plat.color} h-1.5`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <h2 className="font-semibold text-primary-dark">{editingId ? 'Editar métrica personalizada' : 'Agregar métrica personalizada'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="text" placeholder="Etiqueta (ej: Personas alcanzadas)" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Valor (ej: 1,000+)" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <select value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            {ICONS.map(i => <option key={i} value={i}>{ICON_LABELS[i]}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          {editingId ? (
            <><button onClick={update} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"><Save size={14} /> Guardar</button><button onClick={() => { setEditingId(null); setForm({ label: '', value: '', icon: 'heart' }); }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300"><X size={14} /> Cancelar</button></>
          ) : (
            <button onClick={add} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"><Plus size={14} /> Agregar métrica</button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {metrics.map(m => (
          <div key={m.id} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <BarChart3 size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary-dark">{m.label}</h3>
              <p className="text-2xl font-bold text-primary">{m.value}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => edit(m)} className="p-1.5 text-text-light hover:text-primary"><Pencil size={16} /></button>
              <button onClick={() => del(m.id)} className="p-1.5 text-text-light hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {metrics.length === 0 && <p className="text-center text-text-light py-8">No hay métricas personalizadas. Agrega la primera.</p>}
      </div>
    </div>
  );
}

function AuspiciadoresTab() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', logo_url: '', website_url: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { loadSponsors(); }, []);

  async function loadSponsors() { setSponsors(await getSponsors()); }

  async function add() {
    if (!form.name.trim()) return;
    await createSponsor({ name: form.name.trim(), logo_url: form.logo_url.trim() || undefined, website_url: form.website_url.trim() || undefined });
    setForm({ name: '', logo_url: '', website_url: '' });
    await loadSponsors();
  }

  async function update() {
    if (!editingId || !form.name.trim()) return;
    await updateSponsor(editingId, { name: form.name.trim(), logo_url: form.logo_url.trim() || undefined, website_url: form.website_url.trim() || undefined });
    setEditingId(null); setForm({ name: '', logo_url: '', website_url: '' });
    await loadSponsors();
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar auspiciador?')) return;
    await deleteSponsor(id);
    await loadSponsors();
  }

  function edit(s: any) { setEditingId(s.id); setForm({ name: s.name, logo_url: s.logo_url || '', website_url: s.website_url || '' }); }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <h2 className="font-semibold text-primary-dark">{editingId ? 'Editar auspiciador' : 'Agregar auspiciador'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="text" placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="URL del logo" value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Sitio web (opcional)" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-2">
          {editingId ? (
            <><button onClick={update} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"><Save size={14} /> Guardar</button><button onClick={() => { setEditingId(null); setForm({ name: '', logo_url: '', website_url: '' }); }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300"><X size={14} /> Cancelar</button></>
          ) : (
            <button onClick={add} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"><Plus size={14} /> Agregar auspiciador</button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {sponsors.map(s => (
          <div key={s.id} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md flex gap-4 items-center">
            {s.logo_url ? (
              <img src={s.logo_url} alt="" className="w-16 h-16 rounded-lg object-contain bg-gray-50" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-text-light">{s.name.charAt(0)}</div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary-dark">{s.name}</h3>
              {s.website_url && <p className="text-xs text-text-light truncate">{s.website_url}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => edit(s)} className="p-1.5 text-text-light hover:text-primary"><Pencil size={16} /></button>
              <button onClick={() => del(s.id)} className="p-1.5 text-text-light hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {sponsors.length === 0 && <p className="text-center text-text-light py-8">No hay auspiciadores. Agrega el primero.</p>}
      </div>
    </div>
  );
}

// ===== TESTIMONIOS ADMIN TAB =====
function TestimoniosAdminTab() {
  const [testimonios, setTestimonios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getTestimonios().then(data => { setTestimonios(data); setLoading(false); });
  }, []);

  async function handleApprove(t: any) {
    setApproving(prev => ({ ...prev, [t.id]: true }));
    try {
      const { error } = await approveTestimonio({
        source_id: t.id,
        user_id: t.user_id,
        display_name: t.name || 'Anónimo',
        content: t.message,
      });
      if (error) throw new Error(error.message);
      setMsg({ ok: true, text: `Testimonio de ${t.name} aprobado y publicado.` });
      setTestimonios(prev => prev.map(x => x.id === t.id ? { ...x, public: true } : x));
    } catch (err: any) {
      setMsg({ ok: false, text: 'Error al aprobar: ' + err.message });
    } finally {
      setApproving(prev => ({ ...prev, [t.id]: false }));
      setTimeout(() => setMsg(null), 4000);
    }
  }

  if (loading) return <p className="text-center text-text-light py-8">Cargando testimonios...</p>;

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md">
        <h2 className="font-semibold text-primary-dark mb-1">Testimonios recibidos</h2>
        <p className="text-xs text-text-light">Revisa cada testimonio y apruébalo para que sea visible públicamente en /testimonios.</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.ok ? <CheckCircle size={16} /> : <X size={16} />} {msg.text}
        </div>
      )}

      {testimonios.length === 0 ? (
        <p className="text-center text-text-light py-8">No hay testimonios recibidos aún.</p>
      ) : (
        <div className="space-y-3">
          {testimonios.map(t => (
            <div key={t.id} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="font-semibold text-primary-dark">{t.name}</p>
                  <p className="text-xs text-text-light">{t.email} {t.phone && `· ${t.phone}`}</p>
                  <p className="text-xs text-text-light">
                    {new Date(t.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span className={`shrink-0 text-[10px] px-2 py-1 rounded-full font-medium flex items-center gap-1 ${
                  t.public ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {t.public ? <><CheckCircle size={10} /> Publicado</> : <><Clock size={10} /> Pendiente</>}
                </span>
              </div>
              <p className="text-sm text-text leading-relaxed bg-gray-50 rounded-lg p-3">{t.message}</p>
              {!t.public && (
                <button
                  onClick={() => handleApprove(t)}
                  disabled={approving[t.id]}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  <CheckCircle size={14} />
                  {approving[t.id] ? 'Aprobando...' : 'Aprobar y publicar testimonio'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== DEVOCIONALES ADMIN TAB =====
import { BookOpen, AlertCircle, FileSpreadsheet } from 'lucide-react';

function DevotionalsAdminTab() {
  const [devotionals, setDevotionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Form states
  const emptyDevotional = { title: '', verse: '', reference: '', reflection: '', question: '', prayer: '', publish_date: '' };
  const [form, setForm] = useState(emptyDevotional);
  const [editingId, setEditingId] = useState<string | null>(null);

  // CSV states
  const [csvText, setCsvText] = useState('');
  const [importingCsv, setImportingCsv] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await getDevotionals();
      setDevotionals(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar devocionales');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.verse.trim() || !form.reflection.trim()) return;

    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        verse: form.verse.trim(),
        reference: form.reference.trim(),
        reflection: form.reflection.trim(),
        question: form.question.trim(),
        prayer: form.prayer.trim(),
        publish_date: form.publish_date ? form.publish_date : null
      };

      if (editingId) {
        await saveDevotional({ id: editingId, ...payload });
        setMsg({ ok: true, text: 'Devocional actualizado con éxito' });
      } else {
        await saveDevotional(payload);
        setMsg({ ok: true, text: 'Devocional creado con éxito' });
      }
      setForm(emptyDevotional);
      setEditingId(null);
      await load();
    } catch (err: any) {
      setError(err.message || 'Error al guardar devocional');
    } finally {
      setTimeout(() => setMsg(null), 3000);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este devocional?')) return;
    setError(null);
    try {
      await deleteDevotional(id);
      setMsg({ ok: true, text: 'Devocional eliminado' });
      await load();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar');
    } finally {
      setTimeout(() => setMsg(null), 3000);
    }
  }

  function handleEdit(d: any) {
    setEditingId(d.id);
    setForm({
      title: d.title,
      verse: d.verse,
      reference: d.reference,
      reflection: d.reflection,
      question: d.question,
      prayer: d.prayer,
      publish_date: d.publish_date || ''
    });
  }

  // Parse CSV: title;verse;reference;reflection;question;prayer;publish_date
  async function handleCsvImport() {
    if (!csvText.trim()) return;
    setImportingCsv(true);
    setError(null);
    setMsg(null);

    try {
      const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      let successCount = 0;
      let failCount = 0;

      // Skip header line if it looks like columns
      const firstLine = lines[0].toLowerCase();
      const hasHeader = firstLine.includes('title') || firstLine.includes('título') || firstLine.includes('reflexión') || firstLine.includes('reflection');
      const startIndex = hasHeader ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        // Split by semicolon (recommended) or comma
        const delimiter = line.includes(';') ? ';' : ',';
        
        // Simple custom CSV column split that handles optional wrapping quotes
        const rawFields = line.split(delimiter);
        const fields = rawFields.map(f => f.replace(/^"|"$/g, '').trim());

        if (fields.length >= 6) {
          const payload = {
            title: fields[0],
            verse: fields[1],
            reference: fields[2],
            reflection: fields[3],
            question: fields[4],
            prayer: fields[5],
            publish_date: fields[6] ? fields[6] : null // publish_date is optional
          };

          const { error: saveErr } = await saveDevotional(payload);
          if (saveErr) {
            failCount++;
          } else {
            successCount++;
          }
        } else {
          failCount++;
        }
      }

      setMsg({ ok: true, text: `Importación masiva completada: ${successCount} agregados con éxito, ${failCount} fallidos.` });
      setCsvText('');
      await load();
    } catch (err: any) {
      setError('Error al importar CSV: ' + err.message);
    } finally {
      setImportingCsv(false);
      setTimeout(() => setMsg(null), 5000);
    }
  }

  if (loading) return <p className="text-center text-text-light py-8">Cargando devocionales...</p>;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md">
        <h2 className="font-semibold text-primary-dark mb-1">Administración de Devocionales</h2>
        <p className="text-xs text-text-light">Agrega devocionales diarios o realiza una importación masiva para programar de forma automática.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {msg && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <CheckCircle size={16} /> {msg.text}
        </div>
      )}

      {/* Manual Form */}
      <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <h3 className="font-semibold text-primary-dark text-sm border-b border-gray-100 pb-2">{editingId ? 'Editar devocional' : 'Crear nuevo devocional manualmente'}</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-light">Título *</label>
            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Caminando con Fe" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-light">Fecha de publicación (Opcional, dejar vacío para rotación general)</label>
            <input type="date" value={form.publish_date} onChange={e => setForm({ ...form, publish_date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-text-light">Versículo clave *</label>
            <input type="text" required value={form.verse} onChange={e => setForm({ ...form, verse: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="El Señor es mi pastor, nada me faltará." />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-light">Referencia bíblica *</label>
            <input type="text" required value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Salmo 23:1" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-light">Reflexión diaria *</label>
          <textarea required value={form.reflection} onChange={e => setForm({ ...form, reflection: e.target.value })} rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Escribe la reflexión del devocional aquí..." />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-light">Pregunta de aplicación práctica *</label>
          <input type="text" required value={form.question} onChange={e => setForm({ ...form, question: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="¿En qué áreas de tu vida necesitas confiar hoy la guía del Buen Pastor?" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-light">Oración guiada *</label>
          <textarea required value={form.prayer} onChange={e => setForm({ ...form, prayer: e.target.value })} rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Señor, te entrego mi mañana y mi caminar..." />
        </div>

        <div className="flex gap-2 pt-2">
          {editingId ? (
            <><button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"><Save size={14} /> Guardar Cambios</button><button type="button" onClick={() => { setEditingId(null); setForm(emptyDevotional); }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300"><X size={14} /> Cancelar</button></>
          ) : (
            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"><Plus size={14} /> Agregar Devocional</button>
          )}
        </div>
      </form>

      {/* CSV Import Form */}
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <h3 className="font-semibold text-primary-dark text-sm border-b border-gray-100 pb-2 flex items-center gap-2">
          <FileSpreadsheet size={16} /> Importación Masiva (Excel / CSV)
        </h3>
        
        <div className="space-y-2">
          <p className="text-xs text-text-light leading-relaxed">
            Puedes pegar texto en formato CSV separado por punto y coma (<code>;</code>) o coma (<code>,</code>).
            <br />
            <strong>Formato de columnas (con o sin comillas):</strong>
            <br />
            <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">título;versículo;referencia;reflexión;pregunta;oración;fecha_publicación</code>
          </p>
          <textarea
            placeholder="Pegar líneas CSV aquí...&#10;Título de ejemplo;Texto del versículo;Juan 3:16;Reflexión de ejemplo;Pregunta de ejemplo;Oración de ejemplo;2026-07-16"
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <button
          type="button"
          onClick={handleCsvImport}
          disabled={importingCsv || !csvText.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary text-white rounded-lg text-xs font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-50"
        >
          <FileSpreadsheet size={14} /> {importingCsv ? 'Importando...' : 'Importar líneas de devocionales'}
        </button>
      </div>

      {/* Devotionals List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-primary-dark text-sm">Devocionales Programados / Registrados</h3>
        {devotionals.length === 0 ? (
          <p className="text-center text-text-light py-8">No hay devocionales cargados en el sistema.</p>
        ) : (
          <div className="space-y-3">
            {devotionals.map(d => (
              <div key={d.id} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  <BookOpen size={16} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="font-semibold text-primary-dark truncate text-sm">{d.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      d.publish_date ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {d.publish_date ? `Programado: ${d.publish_date}` : 'Rotación general'}
                    </span>
                  </div>
                  <p className="text-xs text-text-light italic">"{d.verse}" ({d.reference})</p>
                  <p className="text-xs text-text-light line-clamp-2">{d.reflection}</p>
                </div>
                <div className="flex flex-col gap-1.5 items-end justify-center shrink-0">
                  <button onClick={() => handleEdit(d)} className="p-1 text-text-light hover:text-primary transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(d.id)} className="p-1 text-text-light hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== MURO ADMIN TAB =====
function MuroAdminTab() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState<Record<string, any[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getMuroPosts().then(data => {
      setPosts(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function loadReplies(postId: string) {
    if (replies[postId]) return;
    const data = await getMuroReplies(postId);
    setReplies(prev => ({ ...prev, [postId]: data }));
  }

  function toggleReplies(postId: string) {
    if (!expanded[postId]) loadReplies(postId);
    setExpanded(prev => ({ ...prev, [postId]: !prev[postId] }));
  }

  async function handleDeletePost(id: string) {
    if (!confirm('¿Eliminar esta publicación del Muro? Se borrarán también todos sus comentarios.')) return;
    await deleteMuroPost(id);
    setPosts(posts.filter(p => p.id !== id));
  }

  async function handleDeleteReply(postId: string, replyId: string) {
    if (!confirm('¿Eliminar este comentario?')) return;
    await deleteMuroReply(replyId);
    setReplies(prev => ({
      ...prev,
      [postId]: prev[postId].filter(r => r.id !== replyId)
    }));
  }

  if (loading) return <p className="text-center text-text-light py-8">Cargando Muro...</p>;

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md">
        <h2 className="font-semibold text-primary-dark">Moderar Muro Comunitario</h2>
        <p className="text-xs text-text-light mt-1">Total: {posts.length} publicaciones. Elimina publicaciones o comentarios inapropiados.</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-text-light py-8">No hay publicaciones en el Muro.</p>
      ) : (
        <div className="space-y-3">
          {posts.map(p => (
            <div key={p.id} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-text-light mb-1 flex-wrap">
                    <span className="font-semibold text-primary">{p.author_name || 'Anónimo'}</span>
                    <span>&bull;</span>
                    <span>{new Date(p.created_at).toLocaleDateString('es-CL')}</span>
                    {p.category && p.category !== 'general' && (
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        p.category === 'oracion' ? 'bg-red-50 text-red-600 border border-red-100' :
                        p.category === 'reflexion' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        'bg-green-50 text-green-600 border border-green-100'
                      }`}>
                        {p.category === 'oracion' ? '🙏 Oración' :
                         p.category === 'reflexion' ? '💬 Reflexión' :
                         '🎤 Sugerencia'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{p.content}</p>
                  {p.image_url && (
                    <img src={p.image_url} alt="" className="mt-2 rounded-lg max-h-48 w-auto object-cover border border-gray-100" />
                  )}
                </div>
                <button onClick={() => handleDeletePost(p.id)} className="p-1 text-text-light hover:text-red-500 transition-colors" title="Eliminar post">
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Accordion trigger for replies */}
              <div>
                <button
                  onClick={() => toggleReplies(p.id)}
                  className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors font-medium"
                >
                  <MessageSquare size={12} />
                  {expanded[p.id] ? 'Ocultar comentarios' : 'Ver comentarios'}
                </button>

                {expanded[p.id] && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-3">
                    {!replies[p.id] ? (
                      <p className="text-[11px] text-text-light">Cargando comentarios...</p>
                    ) : replies[p.id].length === 0 ? (
                      <p className="text-[11px] text-text-light">Sin comentarios.</p>
                    ) : (
                      replies[p.id].map(r => (
                        <div key={r.id} className="flex justify-between items-start gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100/50">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-text-light mb-0.5">
                              <span className="font-semibold text-secondary">{r.author_name || 'Anónimo'}</span>
                              <span>&bull;</span>
                              <span>{new Date(r.created_at).toLocaleDateString('es-CL')}</span>
                            </div>
                            <p className="text-xs text-text">{r.content}</p>
                          </div>
                          <button onClick={() => handleDeleteReply(p.id, r.id)} className="p-1 text-text-light hover:text-red-500 transition-colors" title="Eliminar comentario">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

