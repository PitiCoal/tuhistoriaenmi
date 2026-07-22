import type { Metadata, Viewport } from 'next';
import './globals.css';
import './themes.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import InstallPrompt from '@/components/InstallPrompt';
import NotificationPrompt from '@/components/NotificationPrompt';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
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
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('theme'),f=localStorage.getItem('fontSize');if(t)document.documentElement.setAttribute('data-theme',t);if(f)document.documentElement.style.fontSize=({sm:'14px',md:'16px',lg:'18px',xl:'20px',xxl:'24px'})[f]||'16px'}catch(e){}})()`
        }} />
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <AnalyticsTracker />
            </Suspense>
            <Header />
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 pb-20 md:pb-8">
              {children}
            </main>
            <Suspense fallback={null}>
              <MobileNav />
            </Suspense>
            <InstallPrompt />
            <NotificationPrompt />
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
