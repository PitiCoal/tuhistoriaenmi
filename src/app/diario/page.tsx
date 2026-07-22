'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { getDiarioEntriesByMonth } from '@/lib/supabase'
import DiarioEntryForm from '@/components/diario/DiarioEntryForm'
import GratitudDiaria from '@/components/diario/GratitudDiaria'
import IntencionesManager from '@/components/diario/IntencionesManager'
import ExamenConciencia from '@/components/diario/ExamenConciencia'
import DiarioLock from '@/components/diario/DiarioLock'
import DailyDevotional from '@/components/DailyDevotional'
import { BookOpen, ChevronLeft, ChevronRight, Sparkles, Moon, Heart, Lock } from 'lucide-react'
import Link from 'next/link'

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

function formatMonth(date: Date) {
  return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
}

export default function DiarioPage() {
  const { user, signIn } = useAuth()
  const userId = user && user !== 'loading' ? (user as any).uid : null

  const today = getTodayISO()
  const [unlocked, setUnlocked] = useState(false)
  const [activeTab, setActiveTab] = useState<'escribir' | 'intenciones' | 'examen'>('escribir')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [monthEntries, setMonthEntries] = useState<{ entry_date: string; estado_animo: string | null }[]>([])

  useEffect(() => {
    if (!userId) return
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth() + 1
    getDiarioEntriesByMonth(userId, year, month).then(setMonthEntries)
  }, [userId, currentMonth])

  function handleMonthChange(delta: number) {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() + delta)
    setCurrentMonth(newDate)
  }

  const entryDates = new Set(monthEntries.map((e) => e.entry_date))

  const tabs = [
    { id: 'escribir' as const, label: '📝 Escribir', icon: BookOpen },
    { id: 'intenciones' as const, label: '🙏 Intenciones', icon: Heart },
    { id: 'examen' as const, label: '🌙 Examen', icon: Moon },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-5 md:space-y-6">
      {/* Header */}
      <div className="bg-card rounded-xl md:rounded-2xl p-5 md:p-8 border border-gray-200/70 shadow-md text-center">
        <h1 className="font-heading text-xl md:text-3xl font-bold text-primary-dark">Mi Diario</h1>
        <p className="text-text-light text-xs md:text-sm mt-1">Tu espacio de encuentro diario con Dios</p>
      </div>

      {/* Devocional (público) */}
      <DailyDevotional />

      {/* Usuario no autenticado → login prompt */}
      {!userId && (
        <div className="bg-card rounded-xl p-6 border border-dashed border-gray-200/70 shadow-sm text-center space-y-3">
          <BookOpen size={24} className="mx-auto text-text-light" />
          <p className="text-sm text-text-light">Inicia sesión para escribir en tu diario</p>
          <button
            onClick={() => signIn()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 active:scale-95"
          >
            Iniciar sesión
          </button>
        </div>
      )}

      {/* Usuario autenticado → PIN lock */}
      {userId && !unlocked && (
        <DiarioLock userId={userId} onUnlock={() => setUnlocked(true)} />
      )}

      {/* Contenido del diario (solo cuando está desbloqueado) */}
      {userId && unlocked && (
        <>
          {/* Calendar mini */}
          <div className="bg-card rounded-xl p-3 md:p-4 border border-gray-200/70 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => handleMonthChange(-1)} className="p-1 text-text-light hover:text-primary active:scale-90">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold text-primary-dark capitalize">{formatMonth(currentMonth)}</span>
              <button onClick={() => handleMonthChange(1)} className="p-1 text-text-light hover:text-primary active:scale-90">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
              {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((d) => (
                <span key={d} className="text-text-light font-medium py-1">{d}</span>
              ))}
              {Array.from({ length: 42 }, (_, i) => {
                const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
                const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
                const day = i - firstDay + 1
                if (day < 1 || day > daysInMonth) return <div key={i} />
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const hasEntry = entryDates.has(dateStr)
                const isToday = dateStr === today
                return (
                  <div
                    key={i}
                    className={`py-1 rounded text-xs ${
                      isToday ? 'bg-primary text-white font-bold' : hasEntry ? 'bg-primary/10 text-primary font-medium' : 'text-text-light'
                    }`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {tabs.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                    active ? 'bg-white text-primary shadow-sm' : 'text-text-light hover:text-primary'
                  }`}
                >
                  <tab.icon size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {activeTab === 'escribir' && (
            <div className="space-y-4">
              <DiarioEntryForm date={today} />
              <GratitudDiaria date={today} />
            </div>
          )}

          {activeTab === 'intenciones' && (
            <IntencionesManager />
          )}

          {activeTab === 'examen' && (
            <ExamenConciencia date={today} />
          )}

          {/* Cerrar diario */}
          <div className="text-center">
            <button
              onClick={() => setUnlocked(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-text-light rounded-lg text-xs font-semibold hover:bg-gray-200 active:scale-95 transition-all"
            >
              <Lock size={14} /> Bloquear diario
            </button>
          </div>
        </>
      )}

      {/* Links a formación (siempre visibles) */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link
          href="/episodios"
          className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-primary-dark text-sm">Formación</h3>
            <p className="text-[10px] text-text-light">Podcast y recursos</p>
          </div>
        </Link>
        <Link
          href="/comunidad"
          className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
            <Heart size={18} className="text-secondary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-primary-dark text-sm">Comunidad</h3>
            <p className="text-[10px] text-text-light">Comparte en el muro</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
