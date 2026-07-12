'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser } from '@/lib/firebase';
import { Plus, Pencil, Trash2, LogOut, LogIn, Save, X } from 'lucide-react';

type Project = {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'próximo' | 'en curso' | 'completado';
  image: string;
};

const ADMIN_EMAIL = 'piti.coal@gmail.com';
const STORAGE_KEY = 'tm_projects';

function loadProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return [
    { id: 'p1', title: 'Cachipun de la Gratitud', description: 'Intervención urbana: jugamos cachipun en la calle, regalamos dulces y recogemos intenciones de oración.', date: 'Julio 2026', status: 'próximo', image: '/images/logo.png' },
    { id: 'p2', title: 'Merch TM', description: 'Lanzamiento de polerón y polera oficial de Tu Historia en Mí.', date: 'Julio 2026', status: 'en curso', image: '/images/logo.png' },
    { id: 'p3', title: 'App Comunidad TM', description: 'Plataforma web unificada con versículo diario, episodios, muro de oración, comunidad y donaciones.', date: 'Julio-Agosto 2026', status: 'en curso', image: '/images/logo.png' },
  ];
}

const emptyForm = { title: '', description: '', date: '', status: 'próximo' as 'próximo' | 'en curso' | 'completado', image: '' };

export default function AdminProyectosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    setProjects(loadProjects());
    return unsub;
  }, []);

  function saveProjects(updated: Project[]) {
    setProjects(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function handleAdd() {
    if (!form.title.trim()) return;
    const newProject: Project = {
      id: Date.now().toString(),
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date.trim(),
      status: form.status,
      image: form.image.trim() || '/images/logo.png',
    };
    saveProjects([...projects, newProject]);
    setForm(emptyForm);
  }

  function handleEdit(project: Project) {
    setEditingId(project.id);
    setForm({ title: project.title, description: project.description, date: project.date, status: project.status as 'próximo' | 'en curso' | 'completado', image: project.image });
  }

  function handleUpdate() {
    if (!editingId || !form.title.trim()) return;
    const updated = projects.map(p =>
      p.id === editingId
        ? { ...p, title: form.title.trim(), description: form.description.trim(), date: form.date.trim(), status: form.status, image: form.image.trim() || '/images/logo.png' }
        : p
    );
    saveProjects(updated);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleDelete(id: string) {
    if (confirm('¿Eliminar este proyecto?')) {
      saveProjects(projects.filter(p => p.id !== id));
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  if (loading) {
    return <div className="text-center py-20 text-text-light">Cargando...</div>;
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <h1 className="font-heading text-2xl font-bold text-primary-dark">Acceso restringido</h1>
        <p className="text-text-light">Inicia sesión con tu cuenta de Google para administrar los proyectos.</p>
        <button
          onClick={signInWithGoogle}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <LogIn size={16} /> Iniciar sesión con Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-primary-dark">Admin - Proyectos</h1>
        <button
          onClick={signOutUser}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-light hover:text-primary transition-colors"
        >
          <LogOut size={14} /> Cerrar sesión
        </button>
      </div>

      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <h2 className="font-semibold text-primary-dark">
          {editingId ? 'Editar proyecto' : 'Agregar proyecto'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Título"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="text"
            placeholder="Fecha (ej: Julio 2026)"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value as 'próximo' | 'en curso' | 'completado' })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="próximo">Próximo</option>
            <option value="en curso">En curso</option>
            <option value="completado">Completado</option>
          </select>
          <input
            type="text"
            placeholder="URL de imagen (opcional)"
            value={form.image}
            onChange={e => setForm({ ...form, image: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <textarea
          placeholder="Descripción"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex gap-2">
          {editingId ? (
            <>
              <button onClick={handleUpdate} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                <Save size={14} /> Guardar cambios
              </button>
              <button onClick={cancelEdit} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors">
                <X size={14} /> Cancelar
              </button>
            </>
          ) : (
            <button onClick={handleAdd} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
              <Plus size={14} /> Agregar proyecto
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {projects.map(p => (
          <div key={p.id} className="bg-card rounded-xl p-5 border border-gray-100 shadow-sm flex gap-4">
            <img src={p.image} alt="" className="w-16 h-16 rounded-lg object-contain bg-gray-50" />
            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="font-semibold text-primary-dark">{p.title}</h3>
              <p className="text-sm text-text-light line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-2 text-xs text-text-light">
                <span>{p.date}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  p.status === 'próximo' ? 'bg-blue-100 text-blue-700' :
                  p.status === 'en curso' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>{p.status}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => handleEdit(p)} className="p-1.5 text-text-light hover:text-primary transition-colors" title="Editar">
                <Pencil size={16} />
              </button>
              <button onClick={() => handleDelete(p.id)} className="p-1.5 text-text-light hover:text-red-500 transition-colors" title="Eliminar">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
