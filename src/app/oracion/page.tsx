'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link'
import { Heart, Send, LogIn, User, BookOpen } from 'lucide-react';

type Intention = { id: string; text: string; name: string | null; createdAt: number; reactions: number; prayedCount?: number; prayedBy: string[]; };

export default function OracionPage() {
  const { user, signIn } = useAuth();
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [text, setText] = useState(''); const [anonymous, setAnonymous] = useState(false); const [name, setName] = useState('');

  useEffect(() => {
    if (user && user !== 'loading' && user.displayName) setName(user.displayName);
    try { const d = localStorage.getItem('tm_intentions'); if (d) setIntentions(JSON.parse(d)); } catch {}
  }, [user]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const updated = [{ id: Date.now().toString(), text: text.trim(), name: anonymous ? null : name.trim() || null, createdAt: Date.now(), reactions: 0, prayedBy: [] }, ...intentions];
    setIntentions(updated);
    localStorage.setItem('tm_intentions', JSON.stringify(updated));
    setText(''); setName('');
  }

  if (user === 'loading') return <div className="text-center py-20 text-text-light">Cargando...</div>;

  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
      <div className="bg-card rounded-xl md:rounded-2xl p-5 md:p-8 border border-gray-200/70 shadow-md text-center">
        <h1 className="font-heading text-xl md:text-3xl font-bold text-primary-dark">Muro de Oración</h1>
        <p className="text-text-light text-xs md:text-sm mt-1">Deja tu intención para que otros oren por ti.</p>
      </div>

      {/* Link al Rosario */}
      <Link href="/rosario"
        className="block bg-card rounded-xl p-4 md:p-5 border border-primary/20 shadow-sm hover:shadow-md transition-all active:scale-[0.98] bg-gradient-to-r from-primary/[0.03] to-secondary/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading font-bold text-primary-dark text-sm md:text-base">Santo Rosario</h2>
            <p className="text-[10px] md:text-xs text-text-light">Medita los misterios de la vida de Cristo</p>
          </div>
          <BookOpen size={16} className="text-primary shrink-0" />
        </div>
      </Link>

      {!user ? (
        <div className="bg-card rounded-xl p-6 md:p-8 border border-gray-200/70 shadow-md text-center space-y-3">
          <Heart size={48} className="mx-auto text-text-light" />
          <h2 className="font-heading text-lg font-bold text-primary-dark">Inicia sesión</h2>
          <p className="text-sm text-text-light">Necesitas una cuenta para dejar tus intenciones de oración.</p>
          <button onClick={() => signIn()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-95">
            <LogIn size={16} /> Iniciar sesión
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 md:p-6 border border-gray-200/70 shadow-md space-y-3 md:space-y-4">
            <textarea placeholder="Escribe tu intención..." value={text} onChange={e => setText(e.target.value)} maxLength={500} rows={3}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg border border-gray-200 text-xs md:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" required />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs md:text-sm text-text-light cursor-pointer">
                <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary" /> Anónimo
              </label>
              {!anonymous && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <User size={14} className="text-text-light shrink-0" />
                  <input type="text" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} maxLength={50}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-lg border border-gray-200 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              )}
            </div>
            <button type="submit" disabled={!text.trim()}
              className="inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-primary text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors active:scale-95">
              <Send size={14} /> Publicar
            </button>
          </form>

          {intentions.length === 0 ? (
            <p className="text-center text-text-light py-8 md:py-12 text-xs md:text-sm bg-card rounded-xl border border-gray-200/70 shadow-md">Aún no hay intenciones.</p>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {intentions.map(i => (
                <div key={i.id} className="bg-card rounded-xl p-4 md:p-5 border border-gray-200/70 shadow-sm space-y-1.5 md:space-y-2 animate-in fade-in">
                  <p className="text-xs md:text-sm text-text leading-relaxed">{i.text}</p>
                  <div className="flex items-center justify-between text-[11px] md:text-sm text-text-light">
                    <span className="flex items-center gap-1"><User size={12} /> {i.name || 'Anónimo'}</span>
                    
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => {
                        if (localStorage.getItem(`reacted_${i.id}`)) return;
                        const upd = intentions.map(ii => ii.id === i.id ? { ...ii, reactions: ii.reactions + 1 } : ii);
                        setIntentions(upd);
                        localStorage.setItem('tm_intentions', JSON.stringify(upd));
                        localStorage.setItem(`reacted_${i.id}`, 'true');
                      }}
                        className="inline-flex items-center gap-1 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-gray-100 hover:bg-red-50 hover:text-red-500 border border-gray-200 hover:border-red-200 transition-colors active:scale-90">
                        <Heart size={10} className="fill-current text-red-500" /> {i.reactions}
                      </button>

                      <button onClick={() => {
                        if (localStorage.getItem(`prayed_${i.id}`)) return;
                        const upd = intentions.map(ii => ii.id === i.id ? { ...ii, prayedCount: (ii.prayedCount || 0) + 1 } : ii);
                        setIntentions(upd);
                        localStorage.setItem('tm_intentions', JSON.stringify(upd));
                        localStorage.setItem(`prayed_${i.id}`, 'true');
                      }}
                        className="inline-flex items-center gap-1 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-gray-100 hover:bg-primary/10 hover:text-primary border border-gray-200 hover:border-primary/20 transition-colors active:scale-90">
                        🙏 {(i as any).prayedCount || 0}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
