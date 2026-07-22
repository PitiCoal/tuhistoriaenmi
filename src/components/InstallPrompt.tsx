'use client';

import { useEffect, useState } from 'react';
import { Download, X, Share2, Smartphone } from 'lucide-react';

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function isInStandaloneMode() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const ios = isIOS();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (ios) {
      const seen = localStorage.getItem('pwa_ios_hint');
      if (!seen) { setShow(true); localStorage.setItem('pwa_ios_hint', '1'); }
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).__installPrompt = e;
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [ios]);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShow(false);
    setDismissed(true);
  }

  if (!show || dismissed) return null;

  if (ios) {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:w-80">
        <div className="bg-card rounded-2xl p-4 border border-primary/20 shadow-xl space-y-3 bg-gradient-to-br from-primary/[0.02] to-primary/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone size={18} className="text-primary" />
              <span className="font-semibold text-sm text-primary-dark">Instalar en iPhone</span>
            </div>
            <button onClick={handleDismiss} className="p-1 text-text-light hover:text-primary transition-colors">
              <X size={16} />
            </button>
          </div>
          <ol className="text-xs text-text-light space-y-1.5 list-decimal list-inside">
            <li>Toca <Share2 size={12} className="inline" /> <strong>Compartir</strong></li>
            <li>Desplázate y toca <strong>&quot;Agregar a pantalla de inicio&quot;</strong></li>
            <li>Toca <strong>&quot;Agregar&quot;</strong></li>
          </ol>
          <p className="text-[10px] text-text-light/60">
            La app se abrirá como una aplicación independiente, sin navegador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:w-80">
      <div className="bg-card rounded-2xl p-4 border border-primary/20 shadow-xl space-y-3 bg-gradient-to-br from-primary/[0.02] to-primary/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="" className="w-8 h-8 rounded-lg" />
            <span className="font-semibold text-sm text-primary-dark">Tu Historia En Mí</span>
          </div>
          <button onClick={handleDismiss} className="p-1 text-text-light hover:text-primary transition-colors">
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
