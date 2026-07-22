'use client';

import { useEffect, useState } from 'react';

export function useCelebration() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  function celebrate(msg: string) {
    setMessage(msg);
    setShow(true);
    setTimeout(() => setShow(false), 3000);
  }

  return { show, message, celebrate, setShow };
}

export function CelebrationBanner({ show, message, onClose }: { show: boolean; message: string; onClose?: () => void }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onClose?.(), 3000);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-500">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center space-y-3 max-w-xs mx-4 border border-primary/10 animate-bounce-in pointer-events-auto">
        <div className="text-4xl">🙏</div>
        <p className="font-heading text-lg font-bold text-primary-dark">{message}</p>
        <p className="text-xs text-text-light">Amén</p>
      </div>
    </div>
  );
}
