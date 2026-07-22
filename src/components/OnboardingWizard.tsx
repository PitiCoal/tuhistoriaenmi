'use client';

import { useState } from 'react';
import { saveNotificationPreferences } from '@/lib/supabase';

const STORAGE_KEY = 'tm_onboarding_done';

export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

function completeOnboarding() {
  localStorage.setItem(STORAGE_KEY, 'true');
}

const reasons = [
  { emoji: '🕊️', label: 'Oración', desc: 'Busco fortalecer mi vida espiritual' },
  { emoji: '❤️', label: 'Comunidad', desc: 'Quiero conectar con otros creyentes' },
  { emoji: '📖', label: 'Reflexión', desc: 'Vengo a aprender y meditar' },
  { emoji: '🎤', label: 'Testimoniar', desc: 'Quiero compartir mi historia' },
];

const moments = [
  { value: 'morning', label: '🌅', desc: 'Mañana' },
  { value: 'afternoon', label: '☀️', desc: 'Mediodía' },
  { value: 'evening', label: '🌆', desc: 'Tarde' },
  { value: 'night', label: '🌙', desc: 'Noche' },
];

interface Props {
  userId: string;
  onComplete: () => void;
}

export default function OnboardingWizard({ userId, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedMoment, setSelectedMoment] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    setSaving(true);
    try {
      await saveNotificationPreferences(userId, {
        comments: true,
        reactions: true,
        announcements: true,
        daily_verse: true,
        daily_phrase: selectedMoment ? true : true,
      });
    } catch {}
    completeOnboarding();
    onComplete();
  }

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl">🕊️</div>
            <h2 className="font-heading text-xl font-bold text-primary-dark">¿Qué te trae por aquí?</h2>
            <p className="text-text-light text-xs md:text-sm">Elige lo que más resuene contigo hoy</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {reasons.map(r => (
              <button
                key={r.label}
                onClick={() => { setSelectedReason(r.label); setStep(2); }}
                className={`p-4 rounded-xl border-2 text-center transition-all active:scale-95 ${
                  selectedReason === r.label ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/30 bg-gray-50/50'
                }`}
              >
                <span className="text-2xl block mb-1">{r.emoji}</span>
                <span className="text-sm font-semibold text-primary-dark block">{r.label}</span>
                <span className="text-[10px] text-text-light mt-1 block">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl">⏰</div>
            <h2 className="font-heading text-xl font-bold text-primary-dark">¿Cuál es tu momento del día?</h2>
            <p className="text-text-light text-xs md:text-sm">¿Cuándo prefieres conectar con Dios?</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {moments.map(m => (
              <button
                key={m.value}
                onClick={() => { setSelectedMoment(m.value); setStep(3); }}
                className={`p-4 rounded-xl border-2 text-center transition-all active:scale-95 ${
                  selectedMoment === m.value ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/30 bg-gray-50/50'
                }`}
              >
                <span className="text-2xl block mb-1">{m.label}</span>
                <span className="text-sm font-semibold text-primary-dark block">{m.desc}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(3)} className="w-full text-xs text-text-light hover:text-primary transition-colors pt-1">
            Saltar este paso
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl">🙏</div>
          <h2 className="font-heading text-xl font-bold text-primary-dark">Todo listo</h2>
          <p className="text-text-light text-xs md:text-sm leading-relaxed">
            Gracias por dar este paso. Hoy comienza algo hermoso.
            <br /><br />
            <strong>Visita el devocional de hoy</strong> para empezar tu camino.
          </p>
        </div>
        <button
          onClick={handleFinish}
          disabled={saving}
          className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
        >
          {saving ? 'Guardando...' : 'Comenzar 🙏'}
        </button>
      </div>
    </div>
  );
}
