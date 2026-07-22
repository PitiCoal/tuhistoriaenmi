'use client'

import { useState, useEffect, useRef } from 'react'
import { Lock, Eye, ShieldAlert, KeyRound, Copy, Check } from 'lucide-react'
import { getDiarioPin, setDiarioPin } from '@/lib/supabase'

const LS_PIN_KEY = 'thm_diario_pin'

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function getLocalPin(userId: string): string | null {
  try {
    const raw = localStorage.getItem(`${LS_PIN_KEY}_${userId}`)
    return raw || null
  } catch { return null }
}

function setLocalPin(userId: string, pin: string) {
  try { localStorage.setItem(`${LS_PIN_KEY}_${userId}`, pin) } catch {}
}

interface DiarioLockProps {
  userId: string
  onUnlock: () => void
}

export default function DiarioLock({ userId, onUnlock }: DiarioLockProps) {
  const [pin, setPin] = useState<string | null>(null)
  const [inputPin, setInputPin] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newPin, setNewPin] = useState('')
  const [copied, setCopied] = useState(false)
  const [confirmPin, setConfirmPin] = useState('')
  const [step, setStep] = useState<'check' | 'first' | 'unlocked'>('check')
  const [pinMode, setPinMode] = useState<'generated' | 'custom'>('generated')
  const [customPin, setCustomPin] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const customInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getDiarioPin(userId).then(dbPin => {
      const localPin = getLocalPin(userId)
      const existing = dbPin || localPin
      if (existing) {
        setPin(existing)
        setStep('check')
      } else {
        const generated = generatePin()
        setNewPin(generated)
        setStep('first')
      }
      setLoading(false)
    }).catch(() => {
      const localPin = getLocalPin(userId)
      if (localPin) {
        setPin(localPin)
        setStep('check')
      } else {
        const generated = generatePin()
        setNewPin(generated)
        setStep('first')
      }
      setLoading(false)
    })
  }, [userId])

  useEffect(() => {
    if (step === 'check') inputRef.current?.focus()
  }, [step])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (inputPin === pin) {
      onUnlock()
      setStep('unlocked')
    } else {
      setError(true)
      setInputPin('')
      setTimeout(() => setError(false), 2000)
    }
  }

  async function handleSetPin() {
    const finalPin = pinMode === 'custom' ? customPin : newPin
    if (pinMode === 'custom') {
      if (customPin.length !== 4 || confirmPin !== customPin) return
    } else {
      if (confirmPin !== newPin) return
    }
    try {
      await setDiarioPin(userId, finalPin)
    } catch {}
    setLocalPin(userId, finalPin)
    setPin(finalPin)
    onUnlock()
    setStep('unlocked')
  }

  function handleCopy() {
    navigator.clipboard.writeText(newPin)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-8 border border-gray-200/70 shadow-sm text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  // First access: define PIN (auto-generated or custom)
  if (step === 'first') {
    return (
      <div className="max-w-md mx-auto space-y-5">
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-primary/20 shadow-md text-center space-y-4 bg-gradient-to-br from-primary/[0.02] to-primary/[0.06]">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <KeyRound size={28} className="text-primary" />
          </div>
          <h2 className="font-heading text-xl font-bold text-primary-dark">Tu Código de Acceso Personal</h2>
          <p className="text-sm text-text-light">
            Crea un código de 4 dígitos para proteger tu diario. Lo necesitarás cada vez que quieras acceder.
            <strong className="block text-primary-dark mt-1">No podrás recuperarlo si lo pierdes.</strong>
          </p>

          {/* Toggle between generated and custom */}
          <div className="flex bg-gray-100 rounded-xl p-1 max-w-[280px] mx-auto">
            <button
              onClick={() => { setPinMode('generated'); setShowCustomInput(false); setConfirmPin('') }}
              className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${pinMode === 'generated' ? 'bg-white text-primary shadow-sm' : 'text-text-light'}`}
            >
              Generar código
            </button>
            <button
              onClick={() => { setPinMode('custom'); setShowCustomInput(true) }}
              className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${pinMode === 'custom' ? 'bg-white text-primary shadow-sm' : 'text-text-light'}`}
            >
              Definir propio
            </button>
          </div>

          {pinMode === 'generated' && (
            <>
              <div className="bg-white rounded-xl p-4 border-2 border-primary/30 shadow-inner">
                <p className="text-4xl font-bold tracking-[0.3em] text-primary font-mono">{newPin}</p>
              </div>
              <div className="flex gap-2 justify-center">
                <button onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copiado' : 'Copiar código'}
                </button>
              </div>
              <div className="space-y-3 pt-2">
                <p className="text-xs text-text-light">Confirma tu código escribiéndolo aquí abajo:</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ingresa tu código de nuevo"
                  className="w-full max-w-[200px] mx-auto px-4 py-3 rounded-xl border text-center text-2xl font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex gap-2 justify-center">
                  <button onClick={handleSetPin}
                    disabled={confirmPin !== newPin}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 active:scale-95 transition-all shadow-md shadow-primary/20">
                    <Lock size={16} /> Activar mi código
                  </button>
                  <button onClick={() => { const g = generatePin(); setNewPin(g); setConfirmPin('') }}
                    className="px-4 py-2.5 bg-gray-100 text-text-light rounded-xl text-sm font-semibold hover:bg-gray-200 active:scale-95 transition-all">
                    Generar otro
                  </button>
                </div>
              </div>
            </>
          )}

          {pinMode === 'custom' && (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-text-light">Elige un código de 4 dígitos que sea fácil de recordar para ti:</p>
              <input
                ref={customInputRef}
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={customPin}
                onChange={e => { setCustomPin(e.target.value.replace(/\D/g, '')); setConfirmPin('') }}
                placeholder="• • • •"
                className="w-full max-w-[200px] mx-auto px-4 py-3 rounded-xl border text-center text-2xl font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {customPin.length === 4 && (
                <>
                  <p className="text-xs text-text-light">Confírmalo escribiéndolo de nuevo:</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • •"
                    className="w-full max-w-[200px] mx-auto px-4 py-3 rounded-xl border text-center text-2xl font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button onClick={handleSetPin}
                    disabled={confirmPin !== customPin}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 active:scale-95 transition-all shadow-md shadow-primary/20">
                    <Lock size={16} /> Activar mi código
                  </button>
                </>
              )}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
            <p className="text-[11px] text-amber-800 flex items-start gap-2">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>Este código es <strong>irrecuperable</strong>. Si lo pierdes, no podremos restablecerlo. Guárdalo en un lugar seguro. Es tu llave personal para tu conversación íntima con Dios.</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // PIN challenge
  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-card rounded-2xl p-6 md:p-8 border border-gray-200/70 shadow-md text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
          <Lock size={24} className="text-primary/60" />
        </div>
        <h2 className="font-heading text-lg font-bold text-primary-dark">Diario bloqueado</h2>
        <p className="text-xs text-text-light">Ingresa tu código personal para acceder</p>

        <form onSubmit={handleVerify} className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={inputPin}
            onChange={e => { setInputPin(e.target.value.replace(/\D/g, '')); setError(false) }}
            placeholder="• • • •"
            className={`w-full max-w-[160px] mx-auto px-4 py-3 rounded-xl border text-center text-2xl font-mono tracking-[0.3em] focus:outline-none focus:ring-2 transition-all ${
              error ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-200 focus:ring-primary/30'
            }`}
            autoFocus
          />
          {error && <p className="text-[11px] text-red-500 font-medium">Código incorrecto. Intenta de nuevo.</p>}
          <button
            type="submit"
            disabled={inputPin.length !== 4}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 active:scale-95 transition-all shadow-md shadow-primary/20"
          >
            <Eye size={16} /> Desbloquear
          </button>
        </form>
      </div>
    </div>
  )
}
