import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

const sw = self as any;

sw.addEventListener('push', (event: any) => {
  const data = event.data?.json() || { title: 'Tu Historia En Mí', body: 'Nueva actualización' };
  event.waitUntil(sw.registration.showNotification(data.title, {
    body: data.body,
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
  }));
});

sw.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  event.waitUntil(sw.clients.openWindow(event.notification.data?.url || '/'));
});
