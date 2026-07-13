'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Pencil, Trash2, LogOut, LogIn, Save, X, FolderKanban, Mic, Image as ImageIcon, MessageSquare, Heart, MessageCircle, Handshake, Users, Search, FileText, BarChart3 } from 'lucide-react';
import { episodes as defaultEpisodes } from '@/lib/episodes';
import { saveEpisodeToCloud, deleteEpisodeFromCloud } from '@/lib/data-service';
import { getSponsors, createSponsor, updateSponsor, deleteSponsor, getAllProfiles, getPageContent, upsertPageContent, getImpactMetrics, createImpactMetric, updateImpactMetric, deleteImpactMetric } from '@/lib/supabase';

type Tab = 'proyectos' | 'episodios' | 'inicio' | 'participa' | 'auspiciadores' | 'perfiles' | 'paginas' | 'impacto';
type Project = { id: string; title: string; description: string; date: string; status: string; image: string; };
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

const emptyProject = { title: '', description: '', date: '', status: 'próximo', image: '' };
const emptyEpisode = { season: 1, episode: 1, title: '', guest: '', description: '', image: '', image_position: 'center', youtube: '', spotify: '', apple: '', amazon: '' };
const HERO_KEY = 'tm_hero_image';

export default function AdminProyectosPage() {
  const { user, signIn, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('proyectos');

  const [projects, setProjects] = useState<Project[]>([]);
  const [pForm, setPForm] = useState(emptyProject);
  const [pEditingId, setPEditingId] = useState<string | null>(null);

  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
  const [eForm, setEForm] = useState(emptyEpisode);
  const [eEditingId, setEEditingId] = useState<string | null>(null);

  useEffect(() => {
    setProjects(loadFromStorage(STORAGE_PROJECTS, [
      { id: 'p1', title: 'Cachipun de la Gratitud', description: 'Intervención urbana.', date: 'Julio 2026', status: 'próximo', image: '/images/logo.png' },
      { id: 'p2', title: 'Merch TM', description: 'Polerón y polera oficial.', date: 'Julio 2026', status: 'en curso', image: '/images/logo.png' },
      { id: 'p3', title: 'App Comunidad TM', description: 'Plataforma web.', date: 'Julio-Agosto 2026', status: 'en curso', image: '/images/logo.png' },
    ]));
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

      <div className="flex gap-2">
        <button onClick={() => setTab('proyectos')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'proyectos' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><FolderKanban size={16} /> Proyectos</button>
        <button onClick={() => setTab('episodios')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'episodios' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><Mic size={16} /> Episodios</button>
        <button onClick={() => setTab('inicio')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'inicio' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><ImageIcon size={16} /> Inicio</button>
        <button onClick={() => setTab('participa')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'participa' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><MessageSquare size={16} /> Participa</button>
        <button onClick={() => setTab('auspiciadores')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'auspiciadores' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><Handshake size={16} /> Auspiciadores</button>
        <button onClick={() => setTab('perfiles')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'perfiles' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><Users size={16} /> Perfiles</button>
        <button onClick={() => setTab('paginas')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'paginas' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><FileText size={16} /> Páginas</button>
        <button onClick={() => setTab('impacto')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'impacto' ? 'bg-primary text-white' : 'bg-card border border-gray-200/70 text-text-light hover:bg-gray-50'}`}><BarChart3 size={16} /> Impacto</button>
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

      {tab === 'inicio' && <HeroSettingsTab />}

      {tab === 'participa' && <ParticipaTab />}

      {tab === 'auspiciadores' && <AuspiciadoresTab />}

      {tab === 'perfiles' && <PerfilesTab />}

      {tab === 'paginas' && <PaginasTab />}

      {tab === 'impacto' && <ImpactoTab />}
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
  function getMergedEpisodes(): EpisodeData[] {
    const defaults: EpisodeData[] = defaultEpisodes.map(e => ({
      id: e.id, season: e.season, episode: e.episode,
      title: e.title, guest: e.guest, description: e.description,
      image: e.image, image_position: 'center',
      youtube: e.links.youtube || '', spotify: e.links.spotify || '',
      apple: e.links.apple || '', amazon: e.links.amazon || '',
    }));
    const admin = episodes;
    const merged = [...defaults];
    for (const ae of admin) {
      const idx = merged.findIndex((e: EpisodeData) => e.id === ae.id);
      if (idx >= 0) merged[idx] = ae;
      else merged.push(ae);
    }
    return merged;
  }
  const mergedEpisodes = getMergedEpisodes();

  function save(updated: EpisodeData[]) { setEpisodes(updated); saveToStorage(storageKey, updated); }
  function add() {
    if (!form.title.trim() || !form.guest.trim()) return;
    const newEp = { id: Date.now().toString(), ...form, title: form.title.trim(), guest: form.guest.trim(), description: form.description.trim(), image: form.image.trim(), image_position: form.image_position || 'center', youtube: form.youtube.trim(), spotify: form.spotify.trim(), apple: form.apple.trim(), amazon: form.amazon.trim() };
    save([...episodes, newEp]);
    saveEpisodeToCloud(newEp);
    setForm(emptyEpisode);
  }
  function update() {
    if (!editingId || !form.title.trim()) return;
    const updated = episodes.filter((e: EpisodeData) => e.id !== editingId);
    const updatedEp = { id: editingId, season: form.season, episode: form.episode, title: form.title.trim(), guest: form.guest.trim(), description: form.description.trim(), image: form.image.trim(), image_position: form.image_position || 'center', youtube: form.youtube.trim(), spotify: form.spotify.trim(), apple: form.apple.trim(), amazon: form.amazon.trim() };
    save([...updated, updatedEp]);
    saveEpisodeToCloud(updatedEp);
    setEditingId(null); setForm(emptyEpisode);
  }
  function del(id: string) {
    if (!confirm('¿Eliminar episodio?')) return;
    save(episodes.filter((e: EpisodeData) => e.id !== id));
    deleteEpisodeFromCloud(id);
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
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setForm({ ...form, image: ev.target?.result as string || '' });
                    reader.readAsDataURL(file);
                  }
                }} className="w-full text-sm text-text-light file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-xs file:font-semibold hover:file:bg-primary/90" />
              </label>
              <span className="text-xs text-text-light">o</span>
              <input type="text" placeholder="Pegar URL de imagen" value={form.image.startsWith('data:') ? '' : form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            {form.image && (
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
          return (
            <div key={e.id} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md flex gap-4 items-center">
              <img src={e.image || '/images/logo.png'} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-50" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-primary-dark">{e.title}</h3>
                  {!isAdmin && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-text-light">original</span>}
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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(HERO_KEY);
    if (saved) { setPreview(saved); setHeroImage(saved); }
    else setPreview('/images/hero-bg.png');
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

  function handleSave() {
    if (heroImage) {
      localStorage.setItem(HERO_KEY, heroImage);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  function handleReset() {
    localStorage.removeItem(HERO_KEY);
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
        <button onClick={handleSave} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Save size={14} /> Guardar imagen
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

  useEffect(() => {
    try {
      const data = localStorage.getItem('tm_participa');
      if (data) setEntries(JSON.parse(data));
    } catch {}
  }, []);

  function deleteEntry(id: string) {
    if (!confirm('¿Eliminar esta publicación?')) return;
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('tm_participa', JSON.stringify(updated));
  }

  function clearAll() {
    if (!confirm('¿Eliminar TODAS las publicaciones? Esta acción no se puede deshacer.')) return;
    setEntries([]);
    localStorage.removeItem('tm_participa');
  }

  const filtered = filterTab === 'todas' ? entries : entries.filter(e => e.tab === filterTab);
  const tabLabels: Record<string, string> = { oraciones: 'Oraciones', reflexiones: 'Reflexiones', sugerencias: 'Sugerencias' };

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
                  <span className="text-[10px] text-text-light">{new Date(e.createdAt).toLocaleDateString('es-CL')}</span>
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
    (p.bio?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <h2 className="font-semibold text-primary-dark">Perfiles de la comunidad</h2>
        <p className="text-xs text-text-light">Total: {profiles.length} perfiles registrados</p>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
          <input type="text" placeholder="Buscar por nombre, país o bio..." value={search} onChange={e => setSearch(e.target.value)}
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
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-primary-dark text-sm truncate">{p.display_name || 'Sin nombre'}</h3>
                  {p.country && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-text-light shrink-0">{p.country}</span>}
                  {p.age && <span className="text-[10px] text-text-light shrink-0">{p.age} años</span>}
                </div>
                {p.bio && <p className="text-xs text-text-light truncate mt-0.5">{p.bio}</p>}
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

function ImpactoTab() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [form, setForm] = useState({ label: '', value: '', icon: 'heart' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { loadMetrics(); }, []);

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

  const icons = ['heart', 'users', 'globe', 'book-open', 'message-circle', 'eye', 'star', 'trending-up'];

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <h2 className="font-semibold text-primary-dark">{editingId ? 'Editar métrica' : 'Agregar métrica de impacto'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="text" placeholder="Etiqueta (ej: Personas alcanzadas)" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Valor (ej: 1,000+)" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <select value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            {icons.map(i => <option key={i} value={i}>{i}</option>)}
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
        {metrics.length === 0 && <p className="text-center text-text-light py-8">No hay métricas. Agrega la primera.</p>}
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
