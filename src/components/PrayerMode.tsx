'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createMuroPost } from '@/lib/supabase';
import { Clock, Play, Pause, X, Heart, BookOpen, Sun, Music, Volume2, VolumeX } from 'lucide-react';

const durations = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
];

export default function PrayerMode() {
  const { user, signIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'praying' | 'done'>('setup');
  const [minutes, setMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wakeLock, setWakeLock] = useState<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const userId = user && user !== 'loading' ? (user as any).uid : null;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (wakeLock) wakeLock.release();
    };
  }, [wakeLock]);

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        const lock = await (navigator as any).wakeLock.request('screen');
        setWakeLock(lock);
      }
    } catch {}
  }

  function startPrayer() {
    setSecondsLeft(minutes * 60);
    setPhase('praying');
    setIsActive(true);
    if (soundEnabled) requestWakeLock();
  }

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) {
      if (secondsLeft === 0 && phase === 'praying') {
        setPhase('done');
        setIsActive(false);
        if (wakeLock) wakeLock.release();
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, secondsLeft, phase, wakeLock]);

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const circumference = 2 * Math.PI * 60;
  const progress = minutes > 0 ? 1 - secondsLeft / (minutes * 60) : 0;

  async function shareIntention() {
    if (!userId) { signIn(); return; }
    await createMuroPost({
      user_id: userId,
      content: 'He terminado mi momento de oración. 🙏 El Señor me ha hablado al corazón.',
      category: 'oracion',
    });
    closeModal();
  }

  function closeModal() {
    setIsOpen(false);
    setPhase('setup');
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (wakeLock) wakeLock.release();
    setWakeLock(null);
    setSecondsLeft(0);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-all active:scale-95"
        title="Modo Oración"
      >
        <Heart size={16} /> Modo Oración
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b from-primary-dark/95 to-primary/90 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 md:p-8 space-y-6 text-center">

        {phase === 'setup' && (
          <>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Heart size={28} className="text-primary" />
              </div>
              <h2 className="font-heading text-xl font-bold text-primary-dark">Modo Oración</h2>
              <p className="text-text-light text-xs">Toma un momento para estar a solas con Dios</p>
            </div>

            <div className="flex justify-center gap-3">
              {durations.map(d => (
                <button
                  key={d.value}
                  onClick={() => setMinutes(d.value)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 border-2 ${
                    minutes === d.value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-text-light hover:border-primary/30'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 text-text-light">
              <button onClick={() => setSoundEnabled(!soundEnabled)} className="flex items-center gap-1 text-xs hover:text-primary transition-colors" title={soundEnabled ? 'Desactivar sonido ambiente' : 'Activar sonido ambiente'}>
                {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                Sonido
              </button>
              <span className="text-xs text-text-light/50">Canto gregoriano</span>
            </div>

            <button
              onClick={startPrayer}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
            >
              <Play size={16} /> Comenzar
            </button>

            <button onClick={closeModal} className="text-xs text-text-light hover:text-primary transition-colors">
              Cancelar
            </button>
          </>
        )}

        {phase === 'praying' && (
          <>
            <div className="relative w-36 h-36 mx-auto">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                <circle
                  cx="70" cy="70" r="60" stroke="#0085C2" strokeWidth="6" fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-dark font-mono">{formatTime(secondsLeft)}</div>
                  <div className="text-[10px] text-text-light">restantes</div>
                </div>
              </div>
            </div>

            <p className="text-text-light text-xs italic">"Venid a mí todos los que estáis cansados..." — Mateo 11:28</p>

            <div className="flex justify-center gap-4">
              <button onClick={() => setIsActive(!isActive)} className="px-6 py-2 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-all active:scale-95 flex items-center gap-2">
                {isActive ? <Pause size={14} /> : <Play size={14} />}
                {isActive ? 'Pausar' : 'Reanudar'}
              </button>
              <button onClick={closeModal} className="px-6 py-2 bg-gray-100 text-text rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all active:scale-95 flex items-center gap-2">
                <X size={14} /> Terminar
              </button>
            </div>

            <div className="flex items-center justify-center gap-1 text-[10px] text-text-light/60">
              <Sun size={10} />
              Pantalla activa (no se apagará)
            </div>
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-bounce-in">
                <Heart size={28} className="text-primary fill-current" />
              </div>
              <h2 className="font-heading text-xl font-bold text-primary-dark">Amén 🙏</h2>
              <p className="text-text-light text-xs">Gracias por este tiempo. Dios está contigo.</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.href = '/perfil'}
                className="w-full py-3 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <BookOpen size={14} /> Escribir en mi diario
              </button>
              <button
                onClick={shareIntention}
                className="w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Heart size={14} /> Compartir intención en la Comunidad
              </button>
              <button onClick={closeModal} className="text-xs text-text-light hover:text-primary transition-colors">
                Cerrar
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
