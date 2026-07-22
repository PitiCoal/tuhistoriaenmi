'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { getUserComunidades, createComunidad, getComunidades } from '@/lib/actions/comunidades'

import Link from 'next/link'
import { Users, Plus, X, LogIn, Lock, Globe } from 'lucide-react'

export default function ComunidadesPage() {
  const { user, signIn } = useAuth()
  const userId = user && user !== 'loading' ? (user as any).uid : null

  const [allComunidades, setAllComunidades] = useState<any[]>([])
  const [myComunidades, setMyComunidades] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', category: '', is_public: true })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    getComunidades().then(setAllComunidades)
    if (userId) {
      getUserComunidades(userId).then(setMyComunidades)
    }
  }, [userId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !form.name.trim()) return
    setCreating(true)
    const fd = new FormData()
    fd.set('name', form.name)
    fd.set('description', form.description)
    fd.set('category', form.category)
    fd.set('is_public', String(form.is_public))
    const result = await createComunidad(fd, userId)
    if (result.data) {
      setShowCreate(false)
      setForm({ name: '', description: '', category: '', is_public: true })
      const updated = await getComunidades()
      setAllComunidades(updated)
      const mine = await getUserComunidades(userId)
      setMyComunidades(mine)
    }
    setCreating(false)
  }

  const myIds = new Set(myComunidades.map((c) => c.id))

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl md:text-3xl font-bold text-primary-dark">Comunidades</h1>
          <p className="text-text-light text-xs md:text-sm mt-1">Grupos de fe, oración y crecimiento</p>
        </div>
        {userId ? (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all"
          >
            <Plus size={14} /> Nueva Comunidad
          </button>
        ) : (
          <button
            onClick={() => signIn()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 active:scale-95"
          >
            <LogIn size={14} /> Iniciar sesión
          </button>
        )}
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-card rounded-xl p-5 border border-primary/20 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-primary-dark">Crear Comunidad</h2>
            <button type="button" onClick={() => setShowCreate(false)} className="text-text-light hover:text-text">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            <input
              placeholder="Nombre de la comunidad"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-3">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Sin categoría</option>
                <option value="oracion">🙏 Oración</option>
                <option value="estudio">📖 Estudio Bíblico</option>
                <option value="jovenes">🧑‍🤝‍🧑 Jóvenes</option>
                <option value="familia">👪 Familia</option>
                <option value="servicio">🤝 Servicio</option>
                <option value="musica">🎵 Música</option>
              </select>
              <label className="flex items-center gap-2 text-xs text-text-light cursor-pointer px-3 py-2 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={form.is_public}
                  onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                {form.is_public ? <Globe size={14} /> : <Lock size={14} />}
                {form.is_public ? 'Pública' : 'Privada'}
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={creating || !form.name.trim()}
            className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 active:scale-95 transition-all"
          >
            {creating ? 'Creando...' : 'Crear Comunidad'}
          </button>
        </form>
      )}

      {/* My communities */}
      {myComunidades.length > 0 && (
        <section>
          <h2 className="font-heading font-bold text-primary-dark text-sm mb-3">Mis Comunidades</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myComunidades.map((c) => (
              <Link
                key={c.id}
                href={`/comunidades/${c.id}`}
                className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
                  <Users size={20} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-primary-dark text-sm truncate">{c.name}</h3>
                  <p className="text-[10px] text-text-light">
                    {c.member_count || 0} miembros
                    {c.role === 'admin' && ' · Admin'}
                    {c.role === 'moderator' && ' · Moderador'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All communities */}
      <section>
        <h2 className="font-heading font-bold text-primary-dark text-sm mb-3">
          {myComunidades.length > 0 ? 'Todas las Comunidades' : 'Comunidades'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allComunidades.map((c) => (
            <Link
              key={c.id}
              href={`/comunidades/${c.id}`}
              className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 flex items-center justify-center shrink-0">
                <Users size={20} className="text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-primary-dark text-sm truncate">{c.name}</h3>
                  {c.is_public === false && <Lock size={10} className="text-text-light shrink-0" />}
                </div>
                <p className="text-[10px] text-text-light">
                  {c.member_count || 0} miembros
                  {myIds.has(c.id) && ' · Ya eres miembro'}
                </p>
                {c.description && (
                  <p className="text-[10px] text-text-light truncate mt-0.5">{c.description}</p>
                )}
              </div>
            </Link>
          ))}
          {allComunidades.length === 0 && (
            <p className="text-text-light text-xs col-span-2 text-center py-8">
              Aún no hay comunidades. ¡Sé el primero en crear una!
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
