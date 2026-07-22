'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { upsertDiarioEntry, getDiarioEntryByDate } from '@/lib/supabase'
import { getFixedPrompts, getCurrentSeason, getPromptEstacional } from '@/lib/calendario-liturgico'
import { useRouter } from 'next/navigation'
import { BookOpen, Save, CheckCircle } from 'lucide-react'

const ESTADOS_ANIMO = ['😊 Feliz', '🙏 En paz', '😢 Triste', '😟 Preocupado', '😤 Estresado', '❤️ Agradecido', '🤔 Reflexivo']

interface DiarioEntryFormProps {
  date: string
  onSaved?: () => void
}

export default function DiarioEntryForm({ date, onSaved }: DiarioEntryFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const userId = user && user !== 'loading' ? (user as any).uid : null

  const [evangelio, setEvangelio] = useState('')
  const [reflexion, setReflexion] = useState('')
  const [queMeDiceDios, setQueMeDiceDios] = useState('')
  const [proposito, setProposito] = useState('')
  const [estadosAnimo, setEstadosAnimo] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasExisting, setHasExisting] = useState(false)

  const season = getCurrentSeason()
  const fixedPrompts = getFixedPrompts()
  const promptingEstacional = getPromptEstacional()

  useEffect(() => {
    if (!userId) return
    getDiarioEntryByDate(userId, date).then((existing) => {
      if (existing) {
        setEvangelio(existing.evangelio || '')
        setReflexion(existing.reflexion || '')
        setQueMeDiceDios(existing.que_me_dice_dios || '')
        setProposito(existing.proposito || '')
        setEstadosAnimo(existing.estado_animo ? existing.estado_animo.split(',').filter(Boolean) : [])
        setHasExisting(true)
      }
    })
  }, [userId, date])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || saving) return
    setSaving(true)
    const { error } = await upsertDiarioEntry({
      user_id: userId,
      entry_date: date,
      evangelio: evangelio.trim() || undefined,
      reflexion: reflexion.trim() || undefined,
      que_me_dice_dios: queMeDiceDios.trim() || undefined,
      proposito: proposito.trim() || undefined,
      estado_animo: estadosAnimo.length > 0 ? estadosAnimo.join(',') : undefined,
    })
    setSaving(false)
    if (!error) {
      setSaved(true)
      onSaved?.()
      setEvangelio('')
      setReflexion('')
      setQueMeDiceDios('')
      setProposito('')
      setEstadosAnimo([])
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (!userId) {
    return (
      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-sm text-center">
        <p className="text-text-light text-sm">Inicia sesión para escribir en tu diario</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 md:p-6 border border-gray-200/70 shadow-sm space-y-5">
      {/* Header estacional */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-primary" />
          <h2 className="font-heading font-bold text-primary-dark text-base">
            {hasExisting ? '✏️ Editar entrada' : '📝 Escribir en mi diario'}
          </h2>
        </div>
        <span className="text-xs text-text-light bg-gray-100 px-2 py-1 rounded-full">
          {season.icon} {season.label}
        </span>
      </div>

      {/* Prompt estacional */}
      {promptingEstacional && (
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
          <p className="text-sm text-primary-dark font-medium">{season.icon} Prompts de {season.label}</p>
          <p className="text-xs text-text mt-1">{season.pregunta_reflexion}</p>
          {promptingEstacional && (
            <p className="text-xs text-text mt-1 italic">{promptingEstacional}</p>
          )}
        </div>
      )}

      {/* Prompts fijos */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-light uppercase tracking-wider">{fixedPrompts[0].label}</label>
          <textarea
            value={evangelio}
            onChange={(e) => setEvangelio(e.target.value)}
            placeholder={fixedPrompts[0].placeholder}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-light uppercase tracking-wider">{fixedPrompts[1].label}</label>
          <textarea
            value={reflexion}
            onChange={(e) => setReflexion(e.target.value)}
            placeholder={fixedPrompts[1].placeholder}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-light uppercase tracking-wider">{fixedPrompts[2].label}</label>
          <textarea
            value={queMeDiceDios}
            onChange={(e) => setQueMeDiceDios(e.target.value)}
            placeholder={fixedPrompts[2].placeholder}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-light uppercase tracking-wider">{fixedPrompts[3].label}</label>
          <textarea
            value={proposito}
            onChange={(e) => setProposito(e.target.value)}
            placeholder={fixedPrompts[3].placeholder}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Estado de ánimo (multiselección) */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-text-light uppercase tracking-wider">¿Cómo está tu corazón hoy? <span className="font-normal normal-case text-text-light/60">(elige una o más)</span></label>
        <div className="flex flex-wrap gap-2">
          {ESTADOS_ANIMO.map((em) => {
            const isSelected = estadosAnimo.includes(em)
            return (
              <button
                key={em}
                type="button"
                onClick={() => setEstadosAnimo(prev =>
                  isSelected ? prev.filter(e => e !== em) : [...prev, em]
                )}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-text-light border-gray-200 hover:bg-gray-50'
                }`}
              >
                {em}
              </button>
            )
          })}
        </div>
        {estadosAnimo.length > 0 && (
          <p className="text-[10px] text-text-light/60">{estadosAnimo.length} seleccionado{estadosAnimo.length > 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-[10px] text-text-light">
          {new Date(date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 active:scale-95 transition-all shadow-sm"
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
