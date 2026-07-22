'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { getDiarioEntriesByMonth, getDiarioEntryByDate, getNotifPrefs, setNotifPrefs } from '@/lib/supabase'
import DiarioEntryForm from '@/components/diario/DiarioEntryForm'
import GratitudDiaria from '@/components/diario/GratitudDiaria'
import IntencionesManager from '@/components/diario/IntencionesManager'
import ExamenConciencia from '@/components/diario/ExamenConciencia'
import DiarioLock from '@/components/diario/DiarioLock'
import DailyDevotional from '@/components/DailyDevotional'
import { BookOpen, ChevronLeft, ChevronRight, Sparkles, Moon, Heart, Lock, X, Bell, BellOff, Clock } from 'lucide-react'
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
  const [prayerReminder, setPrayerReminder] = useState(false)
  const [reminderHour, setReminderHour] = useState(20)
  const [reminderMinute, setReminderMinute] = useState(0)
  const [showNotifConfig, setShowNotifConfig] = useState(false)
  const [activeTab, setActiveTab] = useState<'escribir' | 'examen'>('escribir')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [monthEntries, setMonthEntries] = useState<{ entry_date: string; estado_animo: string | null }[]>([])

  // Load notification prefs
  useEffect(() => {
    if (!userId) return
    getNotifPrefs(userId).then(prefs => {
      if (prefs) {
        setPrayerReminder(prefs.prayer_reminder)
        setReminderHour(prefs.reminder_hour ?? 20)
        setReminderMinute(prefs.reminder_minute ?? 0)
      }
    }).catch(() => {})
  }, [userId])

  // Schedule notification
  useEffect(() => {
    if (!prayerReminder) return
    const now = new Date()
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), reminderHour, reminderMinute, 0)
    if (target <= now) target.setDate(target.getDate() + 1)
    const ms = target.getTime() - now.getTime()
    const timer = setTimeout(() => {
      if (!('Notification' in window)) return
      if (Notification.permission === 'granted') {
        new Notification('🙏 Hora de orar', {
          body: 'Es momento de encontrarte con Dios. Abre tu diario espiritual.',
          icon: '/images/logo.png',
        })
      }
    }, ms)
    return () => clearTimeout(timer)
  }, [prayerReminder, reminderHour, reminderMinute])

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

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [loadingEntry, setLoadingEntry] = useState(false)

  async function handleDayClick(dateStr: string) {
    if (!userId) return
    setLoadingEntry(true)
    setSelectedDate(dateStr)
    const entry = await getDiarioEntryByDate(userId, dateStr)
    setSelectedEntry(entry)
    setLoadingEntry(false)
  }

  async function toggleReminder() {
    if (!userId) return
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') await Notification.requestPermission()
    const newVal = !prayerReminder
    setPrayerReminder(newVal)
    await setNotifPrefs(userId, {
      prayer_reminder: newVal,
      reminder_hour: reminderHour,
      reminder_minute: reminderMinute,
    }).catch(() => {})
  }

  async function saveReminderTime(h: number, m: number) {
    setReminderHour(h)
    setReminderMinute(m)
    if (userId) {
      await setNotifPrefs(userId, {
        prayer_reminder: prayerReminder,
        reminder_hour: h,
        reminder_minute: m,
      }).catch(() => {})
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 md:space-y-6">
      {/* Header */}
      <div className="bg-card rounded-xl md:rounded-2xl p-5 md:p-8 border border-gray-200/70 shadow-md text-center">
        <h1 className="font-heading text-xl md:text-3xl font-bold text-primary-dark">Mi Diario</h1>
        <p className="text-text-light text-xs md:text-sm mt-1">Tu espacio de encuentro diario con Dios</p>
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
          <button onClick={toggleReminder}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95 ${
              prayerReminder
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-white text-text-light border-gray-200 hover:bg-gray-50'
            }`}
          >
            {prayerReminder ? <Bell size={12} /> : <BellOff size={12} />}
            {prayerReminder ? 'Recordatorio activo' : 'Recordatorio'}
          </button>
          {prayerReminder && (
            <button onClick={() => setShowNotifConfig(!showNotifConfig)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-text-light hover:bg-gray-50 transition-all active:scale-95">
              <Clock size={12} /> {String(reminderHour).padStart(2, '0')}:{String(reminderMinute).padStart(2, '0')}
            </button>
          )}
        </div>
        {showNotifConfig && prayerReminder && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 inline-flex items-center gap-3">
            <span className="text-xs text-text-light">Recordar a las:</span>
            <select value={reminderHour} onChange={e => saveReminderTime(Number(e.target.value), reminderMinute)}
              className="text-xs px-2 py-1 rounded border border-gray-200 bg-white">
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
              ))}
            </select>
            <span className="text-xs text-text-light">:</span>
            <select value={reminderMinute} onChange={e => saveReminderTime(reminderHour, Number(e.target.value))}
              className="text-xs px-2 py-1 rounded border border-gray-200 bg-white">
              {[0, 15, 30, 45].map(m => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        )}
      </div>

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
          {/* 1. INTENCIONES DE ORACIÓN (arriba de todo) */}
          <IntencionesManager />

          {/* 2. EVANGELIO DEL DÍA */}
          <DailyDevotional />

          {/* 3. CALENDARIO */}
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
                const isSelected = selectedDate === dateStr
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDayClick(dateStr)}
                    className={`py-1 rounded text-xs transition-all active:scale-90 ${
                      isSelected && isToday
                        ? 'bg-primary text-white font-bold ring-2 ring-primary ring-offset-1'
                        : isSelected
                          ? 'bg-amber-100 text-amber-700 font-bold ring-2 ring-amber-500 ring-offset-1'
                          : isToday
                            ? 'bg-primary text-white font-bold'
                            : hasEntry
                              ? 'bg-primary/10 text-primary font-medium hover:bg-primary/20'
                              : 'text-text-light hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4. VISOR DE ENTRADA (registros de otros días) */}
          {selectedDate && (
            <div className="bg-card rounded-xl p-4 md:p-5 border border-primary/20 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-primary-dark">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => { setSelectedDate(null); setSelectedEntry(null) }}
                  className="p-1 text-text-light hover:text-primary transition-colors">
                  <X size={16} />
                </button>
              </div>
              {loadingEntry ? (
                <p className="text-xs text-text-light">Cargando entrada...</p>
              ) : selectedEntry ? (
                <div className="space-y-3 text-sm">
                  {selectedEntry.estado_animo && (
                    <div className="flex flex-wrap gap-1">
                      {selectedEntry.estado_animo.split(',').filter(Boolean).map((em: string) => (
                        <span key={em} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-medium">{em}</span>
                      ))}
                    </div>
                  )}
                  {selectedEntry.evangelio && (
                    <div>
                      <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-0.5">Evangelio</p>
                      <p className="text-text leading-relaxed whitespace-pre-wrap">{selectedEntry.evangelio}</p>
                    </div>
                  )}
                  {selectedEntry.reflexion && (
                    <div>
                      <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-0.5">Reflexión</p>
                      <p className="text-text leading-relaxed whitespace-pre-wrap">{selectedEntry.reflexion}</p>
                    </div>
                  )}
                  {selectedEntry.que_me_dice_dios && (
                    <div>
                      <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-0.5">Qué me dice Dios</p>
                      <p className="text-text leading-relaxed whitespace-pre-wrap">{selectedEntry.que_me_dice_dios}</p>
                    </div>
                  )}
                  {selectedEntry.proposito && (
                    <div>
                      <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-0.5">Propósito</p>
                      <p className="text-text leading-relaxed whitespace-pre-wrap">{selectedEntry.proposito}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-text-light">No hay entrada para esta fecha.</p>
              )}
            </div>
          )}

          {/* Tabs: Escribir / Examen */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[
              { id: 'escribir' as const, label: '📝 Escribir', icon: BookOpen },
              { id: 'examen' as const, label: '🌙 Examen', icon: Moon },
            ].map((tab) => {
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
            <p className="text-[10px] text-text-light">Comparte en la comunidad</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
