'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:w-80">
      <div className="bg-card rounded-2xl p-4 border border-primary/20 shadow-xl space-y-3 bg-gradient-to-br from-primary/[0.02] to-primary/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="" className="w-8 h-8 rounded-lg" />
            <span className="font-semibold text-sm text-primary-dark">Tu Historia En Mí</span>
          </div>
          <button onClick={() => setShow(false)} className="p-1 text-text-light hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-text-light leading-relaxed">
          Instala esta app en tu celular para acceder más rápido.
        </p>
        <button onClick={handleInstall}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors active:scale-95">
          <Download size={16} /> Instalar app
        </button>
      </div>
    </div>
  );
}
