'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { isAdminEmail } from '@/lib/adminAuth'
import { useRouter } from 'next/navigation'
import {
  loadEpisodes, saveEpisode, deleteEpisode,
  getSponsors, getPageContent, getTestimonios,
  getPageViewsCount, getEpisodeClicksCount,
} from '@/lib/supabase'
import {
  Shield, Mic, Image as ImageIcon, Handshake,
  MessageSquare, BarChart3, ArrowLeft, Save, Trash2,
  Plus, ExternalLink, Hash, Eye, Heart,
} from 'lucide-react'
import Link from 'next/link'

type AdminTab = 'episodios' | 'auspiciadores' | 'contenido' | 'testimonios' | 'metricas'

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
          { id: 'metricas' as const, label: 'Métricas', icon: BarChart3 },
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
      {activeTab === 'metricas' && <AdminMetricas />}
    </div>
  )
}

function AdminEpisodios() {
  const [episodes, setEpisodes] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ id: '', season: 1, episode: 1, title: '', guest: '', description: '', youtube: '', spotify: '', apple: '', amazon: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadEpisodes().then(setEpisodes)
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await saveEpisode(form)
    setSaving(false)
    setEditing(null)
    setForm({ id: '', season: 1, episode: 1, title: '', guest: '', description: '', youtube: '', spotify: '', apple: '', amazon: '' })
    loadEpisodes().then(setEpisodes)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este episodio?')) return
    await deleteEpisode(id)
    loadEpisodes().then(setEpisodes)
  }

  function startEdit(ep: any) {
    setForm({
      id: ep.id || '',
      season: ep.season || 1,
      episode: ep.episode || 1,
      title: ep.title || '',
      guest: ep.guest || '',
      description: ep.description || '',
      youtube: ep.links?.youtube || '',
      spotify: ep.links?.spotify || '',
      apple: ep.links?.apple || '',
      amazon: ep.links?.amazon || '',
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
            <input placeholder="ID" value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" required disabled={editing !== 'new'} />
            <input placeholder="Título" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" required />
            <input placeholder="Invitado" value={form.guest} onChange={e => setForm(f => ({ ...f, guest: e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Temporada" type="number" value={form.season} onChange={e => setForm(f => ({ ...f, season: +e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
            <input placeholder="Episodio #" type="number" value={form.episode} onChange={e => setForm(f => ({ ...f, episode: +e.target.value }))} className="px-3 py-2 rounded-lg border text-xs" />
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
            <div className="min-w-0 space-y-1">
              <h3 className="font-heading font-bold text-primary-dark text-sm">{ep.title}</h3>
              <p className="text-xs text-text-light">S{ep.season}E{ep.episode} · {ep.guest}</p>
              {ep.description && <p className="text-[11px] text-text-light/70 line-clamp-2">{ep.description}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              {ep.links?.youtube && <a href={ep.links.youtube} target="_blank" rel="noopener noreferrer" className="p-1.5 text-text-light hover:text-primary"><ExternalLink size={14} /></a>}
              <button onClick={() => startEdit(ep)} className="p-1.5 text-text-light hover:text-primary"><Save size={14} /></button>
              <button onClick={() => handleDelete(ep.id)} className="p-1.5 text-text-light hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminAuspiciadores() {
  const [sponsors, setSponsors] = useState<any[]>([])

  useEffect(() => {
    getSponsors().then(setSponsors)
  }, [])

  return (
    <div className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm">
      <h2 className="font-heading font-bold text-primary-dark mb-4">Auspiciadores ({sponsors.length})</h2>
      <div className="space-y-2">
        {sponsors.map(s => (
          <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {s.logo_url && <img src={s.logo_url} alt={s.name} className="w-10 h-10 rounded object-contain bg-white" />}
            <div>
              <p className="text-sm font-semibold text-primary-dark">{s.name}</p>
              <p className="text-[10px] text-text-light">Orden: {s.sort_order}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminContenido() {
  const [pages, setPages] = useState<string[]>(['nosotros', 'donation'])
  const [content, setContent] = useState<Record<string, Record<string, string>>>({})

  useEffect(() => {
    pages.forEach(async p => {
      const data = await getPageContent(p)
      setContent(prev => ({ ...prev, [p]: data }))
    })
  }, [])

  return (
    <div className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm">
      <h2 className="font-heading font-bold text-primary-dark mb-4">Contenido de páginas</h2>
      {pages.map(p => (
        <div key={p} className="mb-4">
          <h3 className="text-sm font-semibold text-primary-dark capitalize mb-2">{p}</h3>
          <pre className="text-xs text-text-light bg-gray-50 p-3 rounded-lg overflow-x-auto">
            {JSON.stringify(content[p] || {}, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  )
}

function AdminTestimonios() {
  const [testimonios, setTestimonios] = useState<any[]>([])

  useEffect(() => {
    getTestimonios().then(setTestimonios)
  }, [])

  return (
    <div className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm">
      <h2 className="font-heading font-bold text-primary-dark mb-4">Testimonios ({testimonios.length})</h2>
      <div className="space-y-2">
        {testimonios.map(t => (
          <div key={t.id} className="p-3 bg-gray-50 rounded-lg space-y-1">
            <p className="text-xs font-semibold text-primary-dark">{t.name} ({t.email})</p>
            <p className="text-[11px] text-text-light line-clamp-3">{t.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

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
