'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { getGratitudByDate, upsertGratitud } from '@/lib/supabase'
import { Heart, CheckCircle, Save } from 'lucide-react'

interface GratitudDiariaProps {
  date: string
  onSaved?: () => void
}

export default function GratitudDiaria({ date, onSaved }: GratitudDiariaProps) {
  const { user } = useAuth()
  const userId = user && user !== 'loading' ? (user as any).uid : null

  const [g1, setG1] = useState('')
  const [g2, setG2] = useState('')
  const [g3, setG3] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!userId) return
    getGratitudByDate(userId, date).then((existing) => {
      if (existing) {
        setG1(existing.gratitud_1 || '')
        setG2(existing.gratitud_2 || '')
        setG3(existing.gratitud_3 || '')
      }
    })
  }, [userId, date])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !g1.trim() || saving) return
    setSaving(true)
    const { error } = await upsertGratitud({
      user_id: userId,
      entry_date: date,
      gratitud_1: g1.trim(),
      gratitud_2: g2.trim() || undefined,
      gratitud_3: g3.trim() || undefined,
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
      <div className="flex items-center gap-2 mb-3">
        <Heart size={18} className="text-red-400" />
        <h2 className="font-heading font-bold text-primary-dark text-base">3 Cosas por las que estoy agradecido hoy</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={g1}
          onChange={(e) => setG1(e.target.value)}
          placeholder="1. ..."
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          required
        />
        <input
          value={g2}
          onChange={(e) => setG2(e.target.value)}
          placeholder="2. ..."
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <input
          value={g3}
          onChange={(e) => setG3(e.target.value)}
          placeholder="3. ..."
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !g1.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 active:scale-95 transition-all"
          >
            {saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar gratitud'}
          </button>
        </div>
      </form>
    </div>
  )
}
