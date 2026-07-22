'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { getExamenByDate, upsertExamen } from '@/lib/supabase'
import { Moon, Save, CheckCircle } from 'lucide-react'

interface ExamenConcienciaProps {
  date: string
  onSaved?: () => void
}

export default function ExamenConciencia({ date, onSaved }: ExamenConcienciaProps) {
  const { user } = useAuth()
  const userId = user && user !== 'loading' ? (user as any).uid : null

  const [gracias, setGracias] = useState('')
  const [dificultad, setDificultad] = useState('')
  const [perdon, setPerdon] = useState('')
  const [proposito, setProposito] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!userId) return
    getExamenByDate(userId, date).then((existing) => {
      if (existing) {
        setGracias(existing.gracias || '')
        setDificultad(existing.dificultad || '')
        setPerdon(existing.perdon || '')
        setProposito(existing.proposito || '')
      }
    })
  }, [userId, date])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !gracias.trim() || !dificultad.trim() || !perdon.trim() || !proposito.trim() || saving) return
    setSaving(true)
    const { error } = await upsertExamen({
      user_id: userId,
      entry_date: date,
      gracias: gracias.trim(),
      dificultad: dificultad.trim(),
      perdon: perdon.trim(),
      proposito: proposito.trim(),
    })
    setSaving(false)
    if (!error) {
      setSaved(true)
      onSaved?.()
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-gray-200/70 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Moon size={18} className="text-indigo-400" />
        <h2 className="font-heading font-bold text-primary-dark text-base">Examen de Conciencia</h2>
      </div>

      <p className="text-xs text-text-light mb-4 leading-relaxed">
        Antes de terminar el día, tómate un momento para revisar tu jornada con el Señor.
        Deja que el Espíritu Santo ilumine tu corazón.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-light uppercase tracking-wider">🙏 ¿Por qué estoy especialmente agradecido hoy?</label>
          <textarea
            value={gracias}
            onChange={(e) => setGracias(e.target.value)}
            placeholder="Señor, gracias por..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-light uppercase tracking-wider">😓 ¿Qué momento difícil o desafío enfrenté hoy?</label>
          <textarea
            value={dificultad}
            onChange={(e) => setDificultad(e.target.value)}
            placeholder="Hoy fue difícil cuando..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-light uppercase tracking-wider">✝️ ¿Dónde necesito pedir perdón?</label>
          <textarea
            value={perdon}
            onChange={(e) => setPerdon(e.target.value)}
            placeholder="Perdóname, Señor, por..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-light uppercase tracking-wider">🎯 ¿Qué propósito tengo para mañana?</label>
          <textarea
            value={proposito}
            onChange={(e) => setProposito(e.target.value)}
            placeholder="Mañana quiero..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !gracias.trim() || !dificultad.trim() || !perdon.trim() || !proposito.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50 active:scale-95 transition-all shadow-sm"
          >
            {saved ? <CheckCircle size={16} /> : <Save size={16} />}
            {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Finalizar examen'}
          </button>
        </div>
      </form>
    </div>
  )
}
