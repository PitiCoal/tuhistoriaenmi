'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Mic, Send, User } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type Tab = 'oraciones' | 'reflexiones' | 'sugerencias';
type Entry = { id: string; tab: Tab; text: string; name: string | null; createdAt: number; reactions: number; reactedBy: string[]; };

const tabs: { id: Tab; label: string; icon: typeof Heart; placeholder: string; desc: string }[] = [
  { id: 'oraciones', label: 'Oraciones', icon: Heart, placeholder: 'Escribe tu intención...', desc: 'Comparte una intención para que otros oren por ti.' },
  { id: 'reflexiones', label: 'Reflexiones', icon: MessageCircle, placeholder: '¿Qué te quedó dando vuelta?', desc: 'Preguntas o pensamientos.' },
  { id: 'sugerencias', label: 'Sugerencias', icon: Mic, placeholder: '¿Conoces a alguien que debería contar su historia?', desc: 'Propón invitados o temas.' },
];

export default function ParticipaPage() {
  const [activeTab, setActiveTab] = useState<Tab>('oraciones');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [text, setText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    try { const d = localStorage.getItem('tm_participa'); if (d) setEntries(JSON.parse(d)); } catch {}
    const unsub = onAuthStateChanged(auth, u => { if (u?.displayName) setName(u.displayName); });
    return unsub;
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const entry: Entry = { id: Date.now().toString(), tab: activeTab, text: text.trim(), name: anonymous ? null : name.trim() || null, createdAt: Date.now(), reactions: 0, reactedBy: [] };
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem('tm_participa', JSON.stringify(updated));
    setText(''); setName('');
  }

  const filtered = entries.filter(e => e.tab === activeTab);
  const currentTab = tabs.find(t => t.id === activeTab)!;
  const Icon = currentTab.icon;

  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
      <div className="bg-card rounded-xl md:rounded-2xl p-5 md:p-8 border border-gray-200/70 shadow-md text-center">
        <h1 className="font-heading text-xl md:text-3xl font-bold text-primary-dark">Participa</h1>
        <p className="text-text-light text-xs md:text-sm mt-1">Comparte, reflexiona y construye esta comunidad.</p>
      </div>

      <div className="bg-card rounded-xl p-1 border border-gray-200/70 shadow-md flex gap-0.5">
        {tabs.map(t => {
          const Ti = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1 md:gap-1.5 px-2 md:px-3 py-2 md:py-2.5 rounded-lg text-[10px] md:text-sm font-medium transition-all ${
                activeTab === t.id ? 'bg-primary text-white shadow-sm' : 'text-text-light'
              }`}
            ><Ti size={12} /> <span className="hidden sm:inline">{t.label}</span></button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 md:p-6 border border-gray-200/70 shadow-md space-y-3 md:space-y-4">
        <p className="text-xs md:text-sm text-text-light">{currentTab.desc}</p>
        <textarea placeholder={currentTab.placeholder} value={text} onChange={e => setText(e.target.value)} maxLength={500} rows={3}
          className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg border border-gray-200 text-xs md:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" required />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs md:text-sm text-text-light cursor-pointer">
            <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary" /> An&oacute;nimo
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
          className="inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-primary text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
          <Send size={14} /> Publicar
        </button>
      </form>

      {filtered.length === 0 ? (
        <p className="text-center text-text-light py-8 md:py-12 text-xs md:text-sm">Aún no hay nada aqu&iacute;. S&eacute; el primero.</p>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {filtered.map(e => (
            <div key={e.id} className="bg-card rounded-xl p-4 md:p-5 border border-gray-200/70 shadow-sm space-y-1.5 md:space-y-2">
              <p className="text-xs md:text-sm text-text leading-relaxed">{e.text}</p>
              <div className="flex items-center justify-between text-[11px] md:text-sm text-text-light">
                <span className="flex items-center gap-1"><User size={12} /> {e.name || 'An&oacute;nimo'}</span>
                <button onClick={() => {
                  if (localStorage.getItem(`participa_reacted_${e.id}`)) return;
                  const upd = entries.map(ee => ee.id === e.id ? { ...ee, reactions: ee.reactions + 1 } : ee);
                  setEntries(upd);
                  localStorage.setItem('tm_participa', JSON.stringify(upd));
                  localStorage.setItem(`participa_reacted_${e.id}`, 'true');
                }}
                  className="inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-gray-100 hover:bg-primary/10 hover:text-primary transition-colors">
                  <Heart size={10} /> {e.reactions}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
