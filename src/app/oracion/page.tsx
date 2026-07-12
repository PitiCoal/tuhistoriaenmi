'use client';

import { useState, useEffect } from 'react';
import { Heart, Send } from 'lucide-react';

type Intention = {
  id: string;
  text: string;
  name: string | null;
  createdAt: number;
  reactions: number;
  prayedBy: string[];
};

const STORAGE_KEY = 'tm_intentions';

function loadIntentions(): Intention[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export default function OracionPage() {
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [text, setText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    setIntentions(loadIntentions());
  }, []);

  function saveIntentions(newIntentions: Intention[]) {
    setIntentions(newIntentions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newIntentions));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const intention: Intention = {
      id: Date.now().toString(),
      text: text.trim(),
      name: anonymous ? null : name.trim() || null,
      createdAt: Date.now(),
      reactions: 0,
      prayedBy: [],
    };
    saveIntentions([intention, ...intentions]);
    setText('');
    setName('');
  }

  function handleReact(id: string) {
    const reacted = localStorage.getItem(`reacted_${id}`);
    if (reacted) return;
    const updated = intentions.map(i =>
      i.id === id ? { ...i, reactions: i.reactions + 1 } : i
    );
    saveIntentions(updated);
    localStorage.setItem(`reacted_${id}`, 'true');
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">Muro de Oración</h1>
        <p className="text-secondary text-sm mt-1">
          Deja tu intención para que otros oren por ti, y ora por las intenciones de los demás.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 space-y-4 shadow-sm">
        <textarea
          placeholder="Escribe tu intención de oración..."
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
          required
        />

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={e => setAnonymous(e.target.checked)}
              className="rounded border-gray-300 text-accent focus:ring-accent"
            />
            Publicar como anónimo
          </label>

          {!anonymous && (
            <input
              type="text"
              placeholder="Tu nombre (opcional)"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={50}
              className="flex-1 min-w-[150px] px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={!text.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Send size={16} /> Publicar
        </button>
      </form>

      {intentions.length === 0 ? (
        <p className="text-center text-secondary py-12">
          Aún no hay intenciones. ¡Sé el primero en compartir!
        </p>
      ) : (
        <div className="space-y-3">
          {intentions.map(i => {
            const alreadyReacted = typeof window !== 'undefined' && localStorage.getItem(`reacted_${i.id}`);
            return (
              <div key={i.id} className="bg-card rounded-xl p-5 shadow-sm space-y-2">
                <p className="text-text leading-relaxed">{i.text}</p>
                <div className="flex items-center justify-between text-sm text-secondary">
                  <span>{i.name || 'Anónimo'}</span>
                  <button
                    onClick={() => handleReact(i.id)}
                    disabled={!!alreadyReacted}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      alreadyReacted
                        ? 'bg-accent/10 text-accent'
                        : 'bg-gray-100 hover:bg-accent/10 hover:text-accent'
                    }`}
                  >
                    <Heart size={14} fill={alreadyReacted ? 'currentColor' : 'none'} /> {i.reactions}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
