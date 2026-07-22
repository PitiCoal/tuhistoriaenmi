'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { isAdminEmail } from '@/lib/adminAuth'
import { useRouter } from 'next/navigation'
import { getAllEpisodes } from '@/lib/episodes'
import {
  loadEpisodes, saveEpisode, deleteEpisode, mergeEpisodesWithDefaults,
  getSponsors, saveSponsor, deleteSponsor,
  getPageContent, upsertPageContent,
  getTestimonios, deleteTestimonio,
  getMuroPosts, deleteMuroPost,
  getPageViewsCount, getEpisodeClicksCount,
  getDevotionals, saveDevotional, deleteDevotional,
  getRecomendaciones, saveRecomendaciones,
  getOracionesGuiadas, saveOracionesGuiadas,
  getRecursosCatolicos, saveRecursosCatolicos,
} from '@/lib/supabase'
import {
  Shield, Mic, Image as ImageIcon, Handshake,
  MessageSquare, BarChart3, ArrowLeft, Save, Trash2,
  Plus, ExternalLink, Eye, Heart, Users, BookOpen, Sparkles, Church, Headphones,
} from 'lucide-react'
import Link from 'next/link'

type AdminTab = 'episodios' | 'auspiciadores' | 'contenido' | 'testimonios' | 'muro' | 'metricas' | 'devocionales' | 'recomendaciones' | 'oraciones' | 'recursos'

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const fbUser = user as any
  const isAdmin = user && user !== 'loading' && isAdminEmail(fbUser?.email)

  const [activeTab, setActiveTab] = useState<AdminTab>('episodios')

  useEffect(() => {
    if (user && user !== 'loading' && !isAdmin) router.push('/')
  }, [user, isAdmin, router])

  if (!user || user === 'loading') return <div className="p-10 text-center text-text-light">Cargando...</div>
  if (!isAdmin) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-primary" />
          <h1 className="font-heading text-2xl font-bold text-primary-dark">Administración</h1>
        </div>
        <Link href="/perfil" className="text-sm text-text-light hover:text-primary flex items-center gap-1">
          <ArrowLeft size={14} /> Volver al perfil
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {[
          { id: 'episodios' as const, label: 'Episodios', icon: Mic },
          { id: 'auspiciadores' as const, label: 'Auspiciadores', icon: Handshake },
          { id: 'contenido' as const, label: 'Contenido', icon: ImageIcon },
          { id: 'testimonios' as const, label: 'Testimonios', icon: MessageSquare },
          { id: 'muro' as const, label: 'Comunidad', icon: Users },
          { id: 'metricas' as const, label: 'Métricas', icon: BarChart3 },
          { id: 'devocionales' as const, label: 'Devocionales', icon: BookOpen },
          { id: 'recomendaciones' as const, label: 'Recomendaciones', icon: Sparkles },
          { id: 'oraciones' as const, label: 'Oraciones', icon: Headphones },
          { id: 'recursos' as const, label: 'Recursos', icon: Church },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-text-light hover:text-primary'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'episodios' && <AdminEpisodios />}
      {activeTab === 'auspiciadores' && <AdminAuspiciadores />}
      {activeTab === 'contenido' && <AdminContenido />}
      {activeTab === 'testimonios' && <AdminTestimonios />}
      {activeTab === 'muro' && <AdminMuro />}
      {activeTab === 'metricas' && <AdminMetricas />}
      {activeTab === 'devocionales' && <AdminDevocionales />}
      {activeTab === 'recomendaciones' && <AdminRecomendaciones />}
      {activeTab === 'oraciones' && <AdminOraciones />}
      {activeTab === 'recursos' && <AdminRecursos />}
    </div>
  )
}

// ===== EPISODIOS (CRUD completo) =====
function AdminEpisodios() {
  const [episodes, setEpisodes] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ id: '', season: 1, episode: 1, title: '', guest: '', description: '', image: '', image_position: 'center', youtube: '', spotify: '', apple: '', amazon: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadMerged() }, [])

  async function loadMerged() {
    const cloud = await loadEpisodes()
    const merged = mergeEpisodesWithDefaults(cloud, getAllEpisodes())
    setEpisodes(merged)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await saveEpisode(form)
    setSaving(false)
    setEditing(null)
    setForm({ id: '', season: 1, episode: 1, title: '', guest: '', description: '', image: '', image_position: 'center', youtube: '', spotify: '', apple: '', amazon: '' })
    loadMerged()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este episodio?')) return
    await deleteEpisode(id)
    loadMerged()
  }

  function startEdit(ep: any) {
    setForm({
      id: ep.id || '',
      season: ep.season || 1,
      episode: ep.episode || 1,
      title: ep.title || '',
      guest: ep.guest || '',
      description: ep.description || '',
      image: ep.image || '',
      image_position: ep.image_position || 'center',
      youtube: ep.youtube || ep.links?.youtube || '',
      spotify: ep.spotify || ep.links?.spotify || '',
      apple: ep.apple || ep.links?.apple || '',
      amazon: ep.amazon || ep.links?.amazon || '',
    })
    setEditing(ep.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-primary-dark">Episodios ({episodes.length})</h2>
        <button onClick={() => setEditing('new')} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90">
          <Plus size={14} /> Nuevo
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="ID (ej: t1e1)" value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" required disabled={editing !== 'new'} />
            <input placeholder="Título" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" required />
            <input placeholder="Invitado" value={form.guest} onChange={e => setForm(f => ({ ...f, guest: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Temporada" type="number" value={form.season} onChange={e => setForm(f => ({ ...f, season: +e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Episodio #" type="number" value={form.episode} onChange={e => setForm(f => ({ ...f, episode: +e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Imagen URL" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Posición imagen (top/center/bottom)" value={form.image_position} onChange={e => setForm(f => ({ ...f, image_position: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="YouTube URL" value={form.youtube} onChange={e => setForm(f => ({ ...f, youtube: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Spotify URL" value={form.spotify} onChange={e => setForm(f => ({ ...f, spotify: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Apple URL" value={form.apple} onChange={e => setForm(f => ({ ...f, apple: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Amazon URL" value={form.amazon} onChange={e => setForm(f => ({ ...f, amazon: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
          </div>
          <textarea placeholder="Descripción" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border text-xs resize-none" />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 flex items-center gap-1">
              <Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 text-text-light rounded-lg text-xs font-semibold hover:bg-gray-200">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {episodes.map(ep => (
          <div key={ep.id} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm flex items-start justify-between gap-4 hover:shadow-md transition-shadow">
            {ep.image && (
              <img src={ep.image} alt={ep.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="font-heading font-bold text-primary-dark text-sm">{ep.title}</h3>
              <p className="text-xs text-text-light">S{ep.season}E{ep.episode} · {ep.guest}</p>
              {ep.description && <p className="text-[11px] text-text-light/70 line-clamp-2">{ep.description}</p>}
            </div>
            <div className="flex gap-2 shrink-0 items-start">
              {(ep.youtube || ep.links?.youtube) && <a href={ep.youtube || ep.links?.youtube} target="_blank" rel="noopener noreferrer" className="p-1.5 text-text-light hover:text-primary"><ExternalLink size={14} /></a>}
              <button onClick={() => startEdit(ep)} className="p-1.5 text-text-light hover:text-primary"><Save size={14} /></button>
              <button onClick={() => handleDelete(ep.id)} className="p-1.5 text-text-light hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== AUSPICIADORES (CRUD completo) =====
function AdminAuspiciadores() {
  const [sponsors, setSponsors] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ id: '', name: '', logo_url: '', url: '', sort_order: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => { getSponsors().then(setSponsors) }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, sort_order: Number(form.sort_order) }
    if (!payload.id) payload.id = crypto.randomUUID()
    await saveSponsor(payload)
    setSaving(false)
    setEditing(null)
    setForm({ id: '', name: '', logo_url: '', url: '', sort_order: 0 })
    getSponsors().then(setSponsors)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este auspiciador?')) return
    await deleteSponsor(id)
    getSponsors().then(setSponsors)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-primary-dark">Auspiciadores ({sponsors.length})</h2>
        <button onClick={() => setEditing('new')} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90">
          <Plus size={14} /> Nuevo
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" required />
            <input placeholder="Logo URL" value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Sitio web URL" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Orden" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 flex items-center gap-1">
              <Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 text-text-light rounded-lg text-xs font-semibold hover:bg-gray-200">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {sponsors.map(s => (
          <div key={s.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow">
            {s.logo_url && <img src={s.logo_url} alt={s.name} className="w-10 h-10 rounded object-contain bg-white" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary-dark">{s.name}</p>
              <p className="text-[10px] text-text-light">Orden: {s.sort_order}{s.url ? ` · ${s.url}` : ''}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setForm(s); setEditing(s.id) }} className="p-1.5 text-text-light hover:text-primary"><Save size={14} /></button>
              <button onClick={() => handleDelete(s.id)} className="p-1.5 text-text-light hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== CONTENIDO (editor de páginas) =====
function AdminContenido() {
  const [pages] = useState(['nosotros', 'donation'])
  const [content, setContent] = useState<Record<string, Record<string, string>>>({})
  const [editPage, setEditPage] = useState<string | null>(null)
  const [editKey, setEditKey] = useState('')
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    pages.forEach(async p => {
      const data = await getPageContent(p)
      setContent(prev => ({ ...prev, [p]: data }))
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editPage) return
    setSaving(true)
    await upsertPageContent(editPage, editKey, editValue)
    setSaving(false)
    const data = await getPageContent(editPage)
    setContent(prev => ({ ...prev, [editPage!]: data }))
    setEditPage(null)
    setEditKey('')
    setEditValue('')
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-bold text-primary-dark">Contenido de páginas</h2>

      {editPage && (
        <form onSubmit={handleSave} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm space-y-3">
          <input placeholder="Clave (key)" value={editKey} onChange={e => setEditKey(e.target.value)} className="w-full px-3 py-2 rounded-lg border text-xs" required />
          <textarea placeholder="Valor (value)" value={editValue} onChange={e => setEditValue(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border text-xs resize-none" required />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 flex items-center gap-1">
              <Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setEditPage(null)} className="px-4 py-2 bg-gray-100 text-text-light rounded-lg text-xs font-semibold hover:bg-gray-200">Cancelar</button>
          </div>
        </form>
      )}

      {pages.map(p => (
        <div key={p} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-primary-dark capitalize">{p}</h3>
            <button onClick={() => { setEditPage(p); setEditKey(''); setEditValue('') }} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90">
              <Plus size={14} /> Agregar campo
            </button>
          </div>
          {Object.keys(content[p] || {}).length === 0 ? (
            <p className="text-xs text-text-light">Sin contenido aún</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(content[p] || {}).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-primary-dark uppercase">{key}</p>
                    <p className="text-xs text-text-light line-clamp-2">{value}</p>
                  </div>
                  <button onClick={() => { setEditPage(p); setEditKey(key); setEditValue(value) }} className="p-1 text-text-light hover:text-primary shrink-0">
                    <Save size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ===== TESTIMONIOS (lista + eliminar) =====
function AdminTestimonios() {
  const [testimonios, setTestimonios] = useState<any[]>([])

  useEffect(() => { getTestimonios().then(setTestimonios) }, [])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este testimonio?')) return
    await deleteTestimonio(id)
    getTestimonios().then(setTestimonios)
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-bold text-primary-dark">Testimonios ({testimonios.length})</h2>
      <div className="space-y-2">
        {testimonios.map(t => (
          <div key={t.id} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm flex items-start justify-between gap-4 hover:shadow-md transition-shadow">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold text-primary-dark">{t.name} <span className="text-xs text-text-light font-normal">({t.email})</span></p>
              <p className="text-xs text-text-light leading-relaxed">{t.message}</p>
              <p className="text-[10px] text-text-light/60">{new Date(t.created_at).toLocaleDateString('es-CL')}</p>
            </div>
            <button onClick={() => handleDelete(t.id)} className="p-1.5 text-text-light hover:text-red-500 shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== MURO (lista + eliminar publicaciones) =====
function AdminMuro() {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => { getMuroPosts().then(setPosts) }, [])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta publicación del muro?')) return
    await deleteMuroPost(id)
    getMuroPosts().then(setPosts)
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-bold text-primary-dark">Muro Comunitario ({posts.length})</h2>
      <div className="space-y-2">
        {posts.map(p => (
          <div key={p.id} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm flex items-start justify-between gap-4 hover:shadow-md transition-shadow">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold text-primary-dark">{p.author_name || 'Anónimo'}</p>
              {p.category && <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full">{p.category}</span>}
              <p className="text-xs text-text-light leading-relaxed">{p.content}</p>
              <p className="text-[10px] text-text-light/60">{new Date(p.created_at).toLocaleDateString('es-CL')}</p>
            </div>
            <button onClick={() => handleDelete(p.id)} className="p-1.5 text-text-light hover:text-red-500 shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== DEVOCIONALES (CRUD completo) =====
function AdminDevocionales() {
  const [devotionals, setDevotionals] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ id: '', title: '', verse: '', reference: '', reflection: '', question: '', prayer: '', publish_date: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const list = await getDevotionals()
    setDevotionals(list)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload: any = {
      title: form.title,
      verse: form.verse,
      reference: form.reference,
      reflection: form.reflection,
      question: form.question || null,
      prayer: form.prayer || null,
      publish_date: form.publish_date || null,
    }
    if (form.id) payload.id = form.id
    await saveDevotional(payload)
    setSaving(false)
    setEditing(null)
    setForm({ id: '', title: '', verse: '', reference: '', reflection: '', question: '', prayer: '', publish_date: '' })
    loadAll()
  }

  function handleEdit(d: any) {
    setForm({
      id: d.id,
      title: d.title,
      verse: d.verse,
      reference: d.reference,
      reflection: d.reflection,
      question: d.question || '',
      prayer: d.prayer || '',
      publish_date: d.publish_date || '',
    })
    setEditing(d.id)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este devocional?')) return
    await deleteDevotional(id)
    loadAll()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-primary-dark">Devocionales ({devotionals.length})</h2>
        <button onClick={() => setEditing('new')} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90">
          <Plus size={14} /> Nuevo
        </button>
      </div>

      {(editing) && (
        <form onSubmit={handleSave} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Título" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg border text-xs" required />
            <input placeholder="Versículo" value={form.verse} onChange={e => setForm(f => ({ ...f, verse: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg border text-xs" required />
            <input placeholder="Referencia" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" required />
            <input placeholder="Fecha (YYYY-MM-DD, dejar vacío = rotativo)" value={form.publish_date} onChange={e => setForm(f => ({ ...f, publish_date: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
          </div>
          <textarea placeholder="Reflexión" value={form.reflection} onChange={e => setForm(f => ({ ...f, reflection: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border text-xs resize-none" required />
          <textarea placeholder="Pregunta (opcional)" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border text-xs resize-none" />
          <textarea placeholder="Oración guiada (opcional)" value={form.prayer} onChange={e => setForm(f => ({ ...f, prayer: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border text-xs resize-none" />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 flex items-center gap-1">
              <Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 text-text-light rounded-lg text-xs font-semibold hover:bg-gray-200">Cancelar</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {devotionals.length === 0 && <p className="text-center text-text-light text-xs py-4">No hay devocionales aún.</p>}
        {devotionals.map(d => (
          <div key={d.id} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-primary-dark">{d.title}</h3>
                  {d.publish_date && (
                    <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{d.publish_date}</span>
                  )}
                </div>
                <p className="text-xs text-text-light mt-0.5">{d.reference}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleEdit(d)} className="p-1.5 text-text-light hover:text-primary"><Save size={14} /></button>
                <button onClick={() => handleDelete(d.id)} className="p-1.5 text-text-light hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-xs text-text line-clamp-2">{d.verse}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== RECOMENDACIONES (CRUD completo) =====
function AdminRecomendaciones() {
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ id: '', title: '', subtitle: '', description: '', url: '', type: 'otro' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { getRecomendaciones().then(setItems) }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form }
    if (!payload.id) payload.id = crypto.randomUUID()
    const updated = editing === 'new'
      ? [...items, payload]
      : items.map(i => i.id === payload.id ? payload : i)
    const { error } = await saveRecomendaciones(updated)
    if (error) { alert('Error al guardar: ' + error.message); setSaving(false); return }
    setItems(updated)
    setSaving(false)
    setEditing(null)
    setForm({ id: '', title: '', subtitle: '', description: '', url: '', type: 'otro' })
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta recomendación?')) return
    const updated = items.filter(i => i.id !== id)
    const { error } = await saveRecomendaciones(updated)
    if (error) { alert('Error al eliminar: ' + error.message); return }
    setItems(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-primary-dark">Recomendaciones ({items.length})</h2>
        <button onClick={() => setEditing('new')} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90">
          <Plus size={14} /> Nueva
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Título" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg border text-xs" required />
            <input placeholder="Subtítulo (opcional)" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="URL" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg border text-xs" />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs">
              <option value="retiro">Retiro</option>
              <option value="app">App</option>
              <option value="video">Video</option>
              <option value="libro">Libro</option>
              <option value="comunidad">Comunidad</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <textarea placeholder="Descripción (opcional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border text-xs resize-none" />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 flex items-center gap-1">
              <Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 text-text-light rounded-lg text-xs font-semibold hover:bg-gray-200">Cancelar</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {items.length === 0 && <p className="text-center text-text-light text-xs py-4">No hay recomendaciones aún.</p>}
        {items.map(item => (
          <div key={item.id} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm flex items-start justify-between gap-4 hover:shadow-md transition-shadow">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-primary-dark">{item.title}</h3>
                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full capitalize">{item.type}</span>
              </div>
              {item.subtitle && <p className="text-[10px] text-text-light">{item.subtitle}</p>}
              {item.description && <p className="text-xs text-text-light/70 line-clamp-2">{item.description}</p>}
              {item.url && <p className="text-[10px] text-primary truncate">{item.url}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setForm(item); setEditing(item.id) }} className="p-1.5 text-text-light hover:text-primary"><Save size={14} /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 text-text-light hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== ORACIONES GUIADAS (CRUD completo) =====
function AdminOraciones() {
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ id: '', titulo: '', tema: '', duracion: '', descripcion: '', audio_url: '', guion: '', imagen: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const data = await getOracionesGuiadas()
    setItems(data)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form }
    if (!payload.id) payload.id = crypto.randomUUID()
    if (!payload.imagen) payload.imagen = '/images/logo.png'
    const updated = editing === 'new'
      ? [...items, payload]
      : items.map(i => i.id === payload.id ? payload : i)
    const { error } = await saveOracionesGuiadas(updated)
    if (error) { alert('Error al guardar: ' + error.message); setSaving(false); return }
    setItems(updated)
    setSaving(false)
    setEditing(null)
    setForm({ id: '', titulo: '', tema: '', duracion: '', descripcion: '', audio_url: '', guion: '', imagen: '' })
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta oración?')) return
    const updated = items.filter(i => i.id !== id)
    const { error } = await saveOracionesGuiadas(updated)
    if (error) { alert('Error al eliminar: ' + error.message); return }
    setItems(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-primary-dark">Oraciones Guiadas ({items.length})</h2>
        <button onClick={() => setEditing('new')} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90">
          <Plus size={14} /> Nueva
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Título" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg border text-xs" required />
            <input placeholder="Tema (ej: Confianza, Perdón)" value={form.tema} onChange={e => setForm(f => ({ ...f, tema: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" required />
            <input placeholder="Duración (ej: 5 min)" value={form.duracion} onChange={e => setForm(f => ({ ...f, duracion: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" required />
            <input placeholder="Audio URL (opcional)" value={form.audio_url} onChange={e => setForm(f => ({ ...f, audio_url: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Imagen URL (opcional)" value={form.imagen} onChange={e => setForm(f => ({ ...f, imagen: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg border text-xs" />
          </div>
          <textarea placeholder="Descripción" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border text-xs resize-none" required />
          <textarea placeholder="Guión de la oración" value={form.guion} onChange={e => setForm(f => ({ ...f, guion: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border text-xs resize-none" required />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 flex items-center gap-1">
              <Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 text-text-light rounded-lg text-xs font-semibold hover:bg-gray-200">Cancelar</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {items.length === 0 && <p className="text-center text-text-light text-xs py-4">No hay oraciones aún.</p>}
        {items.map(item => (
          <div key={item.id} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm flex items-start justify-between gap-4 hover:shadow-md transition-shadow">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-primary-dark">{item.titulo}</h3>
                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{item.tema}</span>
                <span className="text-[9px] text-text-light/60">{item.duracion}</span>
              </div>
              <p className="text-xs text-text-light/70 line-clamp-2">{item.descripcion}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setForm(item); setEditing(item.id) }} className="p-1.5 text-text-light hover:text-primary"><Save size={14} /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 text-text-light hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== RECURSOS CATOLICOS (CRUD completo) =====
function AdminRecursos() {
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ id: '', title: '', subtitle: '', description: '', url: '', type: 'portal' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { getRecursosCatolicos().then(setItems) }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form }
    if (!payload.id) payload.id = crypto.randomUUID()
    const updated = editing === 'new'
      ? [...items, payload]
      : items.map(i => i.id === payload.id ? payload : i)
    const { error } = await saveRecursosCatolicos(updated)
    if (error) { alert('Error al guardar: ' + error.message); setSaving(false); return }
    setItems(updated)
    setSaving(false)
    setEditing(null)
    setForm({ id: '', title: '', subtitle: '', description: '', url: '', type: 'portal' })
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este recurso?')) return
    const updated = items.filter(i => i.id !== id)
    const { error } = await saveRecursosCatolicos(updated)
    if (error) { alert('Error al eliminar: ' + error.message); return }
    setItems(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-primary-dark">Recursos Católicos ({items.length})</h2>
        <button onClick={() => setEditing('new')} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90">
          <Plus size={14} /> Nuevo
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Título" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg border text-xs" required />
            <input placeholder="Subtítulo (opcional)" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="URL" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg border text-xs" />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs">
              <option value="biblia">Biblia</option>
              <option value="enciclica">Encíclica</option>
              <option value="doctrina">Doctrina</option>
              <option value="portal">Portal</option>
              <option value="noticias">Noticias</option>
              <option value="multimedia">Multimedia</option>
              <option value="formacion">Formación</option>
              <option value="liturgia">Liturgia</option>
            </select>
          </div>
          <textarea placeholder="Descripción (opcional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border text-xs resize-none" />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 flex items-center gap-1">
              <Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 text-text-light rounded-lg text-xs font-semibold hover:bg-gray-200">Cancelar</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {items.length === 0 && <p className="text-center text-text-light text-xs py-4">No hay recursos aún.</p>}
        {items.map(item => (
          <div key={item.id} className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm flex items-start justify-between gap-4 hover:shadow-md transition-shadow">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-primary-dark">{item.title}</h3>
                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full capitalize">{item.type}</span>
              </div>
              {item.subtitle && <p className="text-[10px] text-text-light">{item.subtitle}</p>}
              {item.description && <p className="text-xs text-text-light/70 line-clamp-2">{item.description}</p>}
              {item.url && <p className="text-[10px] text-primary truncate">{item.url}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setForm(item); setEditing(item.id) }} className="p-1.5 text-text-light hover:text-primary"><Save size={14} /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 text-text-light hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== MÉTRICAS =====
function AdminMetricas() {
  const [views, setViews] = useState(0)
  const [clicks, setClicks] = useState(0)

  useEffect(() => {
    getPageViewsCount().then(setViews)
    getEpisodeClicksCount().then(setClicks)
  }, [])

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-sm text-center space-y-2">
        <Eye size={24} className="mx-auto text-primary" />
        <p className="text-3xl font-bold text-primary">{views}</p>
        <p className="text-xs text-text-light">Vistas de página</p>
      </div>
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-sm text-center space-y-2">
        <Heart size={24} className="mx-auto text-primary" />
        <p className="text-3xl font-bold text-primary">{clicks}</p>
        <p className="text-xs text-text-light">Clics en episodios</p>
      </div>
    </div>
  )
}
