'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Mic, Users, User, Gift } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

// SVG inline para manos rezando (emoji 🙏 como SVG propio ya que lucide no lo tiene)
function HandsPrayingIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 L9 8 L6 14 L8 18 L12 22" />
      <path d="M12 2 L15 8 L18 14 L16 18 L12 22" />
      <path d="M9 8 Q12 10 15 8" />
      <path d="M8 18 Q12 20 16 18" />
    </svg>
  );
}

const tabs = [
  { href: '/', icon: Home, label: 'Inicio', useCustomIcon: false },
  { href: '/episodios', icon: Mic, label: 'Episodios', useCustomIcon: false },
  { href: '/comunidad', icon: Users, label: 'Comunidad', useCustomIcon: false },
  { href: '/comunidad?filter=oracion', icon: null, label: 'Oración', useCustomIcon: true },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const loggedIn = user && user !== 'loading';
  const [isPrayerActive, setIsPrayerActive] = useState(false);

  useEffect(() => {
    setIsPrayerActive(window.location.search.includes('filter=oracion'));
  }, [pathname]);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200/70 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map(tab => {
          const active = tab.href.includes('?filter=oracion')
            ? (pathname === '/comunidad' && isPrayerActive)
            : (pathname === tab.href && !isPrayerActive);
          return (
            <Link key={tab.href} href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors active:scale-90 ${
                active ? 'text-primary' : 'text-text-light hover:text-primary'
              }`}
            >
              {tab.useCustomIcon
                ? <HandsPrayingIcon size={18} />
                : tab.icon && <tab.icon size={18} />}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
        <Link
          href={loggedIn ? '/perfil' : '/donar'}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors active:scale-90 ${
            pathname === '/perfil' || pathname === '/donar' ? 'text-primary' : 'text-text-light hover:text-primary'
          }`}
        >
          {loggedIn ? <User size={18} /> : <Gift size={18} />}
          <span className="text-[10px] font-medium">{loggedIn ? 'Perfil' : 'Donar'}</span>
        </Link>
      </div>
    </nav>
  );
}
