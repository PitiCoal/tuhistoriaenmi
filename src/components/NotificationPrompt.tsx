'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function NotificationPrompt() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'granted' | 'denied' | 'default'>('loading');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) { setStatus('denied'); return; }
    setStatus(Notification.permission as any);
    if (Notification.permission === 'default' && user && user !== 'loading') {
      const seen = localStorage.getItem('notif_prompt_seen');
      if (!seen) { setShowPrompt(true); }
    }
  }, [user]);

  async function handleAllow() {
    try {
      const perm = await Notification.requestPermission();
      setStatus(perm as any);
      if (perm === 'granted') {
        localStorage.setItem('notif_prompt_seen', '1');
        setShowPrompt(false);
        registerPush();
      }
    } catch { setStatus('denied'); }
  }

  async function registerPush() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) return;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: { p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))), auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))) },
          user_id: (user as any)?.uid,
        }),
      });
    } catch (err) { console.error('Push registration error:', err); }
  }

  function handleDismiss() {
    setShowPrompt(false);
    localStorage.setItem('notif_prompt_seen', '1');
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:w-80">
      <div className="bg-card rounded-2xl p-4 border border-primary/20 shadow-xl space-y-3 bg-gradient-to-br from-primary/[0.02] to-primary/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            <span className="font-semibold text-sm text-primary-dark">Notificaciones</span>
          </div>
          <button onClick={handleDismiss} className="p-1 text-text-light hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-text-light leading-relaxed">
          Activa las notificaciones para recibir avisos de nuevos episodios, eventos y oraciones.
        </p>
        <button onClick={handleAllow}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors active:scale-95">
          <Bell size={16} /> Activar notificaciones
        </button>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}
