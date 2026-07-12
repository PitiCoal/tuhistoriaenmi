'use client';

import { useState, useEffect } from 'react';
import { Heart, Send } from 'lucide-react';

type Intention = { id: string; text: string; name: string | null; createdAt: number; reactions: number; prayedBy: string[] };
const STORAGE_KEY = 'tm_intentions';

function load(): Intention[] {
  if (typeof window === 'undefined') return [];
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : []; } catch { return []; }
}

export default function OracionPage() {
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [text, setText] = useState(''); const [anonymous, setAnonymous] = useState(false); const [name, setName] = useState('');
  useEffect(() => { setIntentions(load()); }, []);

  function save(n: Intention[]) { setIntentions(n); localStorage.setItem(STORAGE_KEY, JSON.stringify(n)); }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    save([{ id: Date.now().toString(), text: text.trim(), name: anonymous ? null : name.trim() || null, createdAt: Date.now(), reactions: 0, prayedBy: [] }, ...intentions]);
    setText(''); setName('');
  }
  function handleReact(id: string) {
    if (localStorage.getItem(`reacted_${id}`)) return;
    save(intentions.map(i => i.id === id ? { ...i, reactions: i.reactions + 1 } : i));
    localStorage.setItem(`reacted_${id}`, 'true');
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md text-center">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark">Muro de Oración</h1>
        <p className="text-text-light text-sm mt-1">Deja tu intención para que otros oren por ti.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <textarea placeholder="Escribe tu intención de oración..." value={text} onChange={e => setText(e.target.value)}
          maxLength={500} rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" required />
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-text-light cursor-pointer">
            <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary" /> Anónimo
          </label>
          {!anonymous && <input type="text" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)}
            maxLength={50} className="flex-1 min-w-[150px] px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />}
        </div>
        <button type="submit" disabled={!text.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
          <Send size={16} /> Publicar
        </button>
      </form>

      {intentions.length === 0 ? (
        <p className="text-center text-text-light py-12 bg-card rounded-xl border border-gray-200/70 shadow-md">Aún no hay intenciones. ¡Sé el primero!</p>
      ) : (
        <div className="space-y-3">
          {intentions.map(i => (
            <div key={i.id} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md space-y-2">
              <p className="text-text leading-relaxed">{i.text}</p>
              <div className="flex items-center justify-between text-sm text-text-light">
                <span>{i.name || 'Anónimo'}</span>
                <button onClick={() => handleReact(i.id)} disabled={!!localStorage.getItem(`reacted_${i.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 hover:bg-primary/10 hover:text-primary transition-colors disabled:bg-primary/10 disabled:text-primary">
                  <Heart size={14} fill={localStorage.getItem(`reacted_${i.id}`) ? 'currentColor' : 'none'} /> {i.reactions}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
