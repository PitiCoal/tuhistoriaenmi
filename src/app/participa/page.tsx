'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Mic, Send, User } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type Tab = 'oraciones' | 'reflexiones' | 'sugerencias';
type Entry = {
  id: string;
  tab: Tab;
  text: string;
  name: string | null;
  createdAt: number;
  reactions: number;
  reactedBy: string[];
};

const STORAGE_KEY = 'tm_participa';

function loadEntries(): Entry[] {
  if (typeof window === 'undefined') return [];
  try { const data = localStorage.getItem(STORAGE_KEY); return data ? JSON.parse(data) : []; }
  catch { return []; }
}

const tabs: { id: Tab; label: string; icon: typeof Heart; placeholder: string; description: string }[] = [
  { id: 'oraciones', label: 'Oraciones', icon: Heart, placeholder: 'Escribe tu intención de oración...', description: 'Comparte una intención para que otros oren por ti.' },
  { id: 'reflexiones', label: 'Reflexiones', icon: MessageCircle, placeholder: '¿Qué te quedó dando vuelta?', description: 'Preguntas, pensamientos o algo que resonó en ti.' },
  { id: 'sugerencias', label: 'Sugerencias', icon: Mic, placeholder: '¿Conoces a alguien que debería contar su historia?', description: 'Propón invitados, temas o historias para el podcast.' },
];

export default function ParticipaPage() {
  const [activeTab, setActiveTab] = useState<Tab>('oraciones');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [text, setText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState('');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    setEntries(loadEntries());
    const unsub = onAuthStateChanged(auth, u => {
      setFirebaseUser(u);
      if (u?.displayName) setName(u.displayName);
    });
    return unsub;
  }, []);

  function saveEntries(updated: Entry[]) {
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const entry: Entry = {
      id: Date.now().toString(), tab: activeTab, text: text.trim(),
      name: anonymous ? null : name.trim() || null, createdAt: Date.now(),
      reactions: 0, reactedBy: [],
    };
    saveEntries([entry, ...entries]);
    setText(''); setName('');
  }

  function handleReact(id: string) {
    if (localStorage.getItem(`participa_reacted_${id}`)) return;
    const updated = entries.map(e => e.id === id ? { ...e, reactions: e.reactions + 1 } : e);
    saveEntries(updated);
    localStorage.setItem(`participa_reacted_${id}`, 'true');
  }

  const filtered = entries.filter(e => e.tab === activeTab);
  const currentTab = tabs.find(t => t.id === activeTab)!;
  const Icon = currentTab.icon;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md text-center">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark">Participa</h1>
        <p className="text-text-light text-sm mt-1">
          Comparte, reflexiona y construye esta comunidad contigo.
        </p>
      </div>

      <div className="bg-card rounded-xl p-1.5 border border-gray-200/70 shadow-md flex gap-1">
        {tabs.map(tab => {
          const TabIcon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-text-light hover:text-primary'
              }`}
            >
              <TabIcon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <p className="text-sm text-text-light">{currentTab.description}</p>
        <textarea placeholder={currentTab.placeholder} value={text}
          onChange={e => setText(e.target.value)} maxLength={500} rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" required
        />
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-text-light cursor-pointer">
            <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary" />
            Publicar como anónimo
          </label>
          {!anonymous && (
            <div className="flex items-center gap-2 flex-1 min-w-[150px]">
              <User size={16} className="text-text-light" />
              <input type="text" placeholder="Tu nombre" value={name}
                onChange={e => setName(e.target.value)} maxLength={50}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}
        </div>
        <button type="submit" disabled={!text.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Send size={16} /> Publicar
        </button>
      </form>

      {filtered.length === 0 ? (
        <p className="text-center text-text-light py-12">Aún no hay nada aquí. ¡Sé el primero!</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => (
            <div key={e.id} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md space-y-2">
              <p className="text-text leading-relaxed">{e.text}</p>
              <div className="flex items-center justify-between text-sm text-text-light">
                <span className="flex items-center gap-1.5"><User size={14} /> {e.name || 'Anónimo'}</span>
                <button onClick={() => handleReact(e.id)}
                  disabled={!!localStorage.getItem(`participa_reacted_${e.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 hover:bg-primary/10 hover:text-primary transition-colors disabled:bg-primary/10 disabled:text-primary"
                >
                  <Heart size={14} fill={localStorage.getItem(`participa_reacted_${e.id}`) ? 'currentColor' : 'none'} />
                  {e.reactions}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
