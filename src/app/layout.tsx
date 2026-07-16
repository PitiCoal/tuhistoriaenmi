import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import InstallPrompt from '@/components/InstallPrompt';
import NotificationPrompt from '@/components/NotificationPrompt';
import { AuthProvider } from '@/lib/AuthContext';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Tu Historia En Mí',
  description:
    'Un espacio de escucha y encuentro donde compartimos testimonios reales de vida, fe y superación. Podcast chileno.',
  icons: { icon: '/images/logo.png', apple: '/images/logo.png' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TM',
  },
};

export const viewport: Viewport = {
  themeColor: '#0085C2',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-bg text-text antialiased">
        <AuthProvider>
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          <Header />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 pb-20 md:pb-8">
            {children}
          </main>
          <MobileNav />
          <InstallPrompt />
          <NotificationPrompt />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
