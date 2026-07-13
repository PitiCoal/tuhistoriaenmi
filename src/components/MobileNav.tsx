'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Mic, Users, Heart, User, Gift } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const tabs = [
  { href: '/', icon: Home, label: 'Inicio' },
  { href: '/episodios', icon: Mic, label: 'Episodios' },
  { href: '/comunidad', icon: Users, label: 'Comunidad' },
  { href: '/nosotros', icon: Heart, label: 'Nosotros' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200/70 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors active:scale-90 ${
                active ? 'text-primary' : 'text-text-light hover:text-primary'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
        <Link
          href={user ? '/perfil' : '/donar'}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors active:scale-90 ${
            pathname === '/perfil' || pathname === '/donar' ? 'text-primary' : 'text-text-light hover:text-primary'
          }`}
        >
          {user ? <User size={18} /> : <Gift size={18} />}
          <span className="text-[10px] font-medium">{user ? 'Perfil' : 'Donar'}</span>
        </Link>
      </div>
    </nav>
  );
}
