'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { getIntenciones, createIntencion, updateIntencionEstado, deleteIntencion } from '@/lib/supabase'
import { Plus, X, Trash2, ChevronDown, CheckCircle, Clock, Heart, Sparkles } from 'lucide-react'

const ESTADOS = [
  { value: 'pidiendo', label: '🙏 Pidiendo', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { value: 'en_proceso', label: '🕯️ En proceso', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { value: 'contestada', label: '✅ Contestada', color: 'bg-green-50 text-green-600 border-green-100' },
  { value: 'agradecida', label: '🎉 Agradecida', color: 'bg-purple-50 text-purple-600 border-purple-100' },
] as const

export default function IntencionesManager() {
  const { user } = useAuth()
  const userId = user && user !== 'loading' ? (user as any).uid : null

  const [intenciones, setIntenciones] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [filter, setFilter] = useState<string>('todas')

  useEffect(() => {
    if (userId) loadIntenciones()
  }, [userId])

  async function loadIntenciones() {
    const list = await getIntenciones(userId!)
    setIntenciones(list)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !titulo.trim()) return
    await createIntencion({ user_id: userId, titulo: titulo.trim(), descripcion: descripcion.trim() || undefined })
    setTitulo('')
    setDescripcion('')
    setShowForm(false)
    loadIntenciones()
  }

  async function handleChangeEstado(id: string, estado: string) {
    await updateIntencionEstado(id, userId!, estado)
    loadIntenciones()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta intención?')) return
    await deleteIntencion(id, userId!)
    loadIntenciones()
  }

  const filtered = filter === 'todas' ? intenciones : intenciones.filter((i) => i.estado === filter)

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-gray-200/70 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart size={18} className="text-primary" />
          <h2 className="font-heading font-bold text-primary-dark text-base">Mis Intenciones de Oración</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Plus size={13} /> Nueva
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="¿Por qué o quién deseas orar?"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Detalles (opcional)"
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-text-light hover:text-text">Cancelar</button>
            <button type="submit" disabled={!titulo.trim()} className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 active:scale-95">
              Agregar intención
            </button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { value: 'todas', label: 'Todas' },
          ...ESTADOS.map((e) => ({ value: e.value, label: e.label })),
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all active:scale-95 ${
              filter === f.value ? 'bg-primary text-white border-primary' : 'bg-white text-text-light border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-text-light text-xs py-4">
            {filter === 'todas' ? 'Aún no tienes intenciones. ¡Agrega la primera!' : 'No hay intenciones en este estado'}
          </p>
        )}
        {filtered.map((int) => {
          const estado = ESTADOS.find((e) => e.value === int.estado) || ESTADOS[0]
          return (
            <div key={int.id} className="flex items-start gap-3 bg-gray-50/50 rounded-lg p-3 border border-gray-100/50">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-dark">{int.titulo}</p>
                {int.descripcion && <p className="text-xs text-text-light mt-0.5">{int.descripcion}</p>}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${estado.color}`}>
                    {estado.label}
                  </span>
                  <span className="text-[9px] text-text-light">
                    {new Date(int.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <select
                  value={int.estado}
                  onChange={(e) => handleChangeEstado(int.id, e.target.value)}
                  className="text-[10px] px-1 py-0.5 rounded border border-gray-200 bg-white focus:outline-none"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
                <button onClick={() => handleDelete(int.id)} className="text-text-light hover:text-red-500 transition-colors self-end">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
