'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BookOpen, User } from 'lucide-react';

const tabs = [
  { href: '/', icon: Home, label: 'Hoy' },
  { href: '/comunidad', icon: Users, label: 'Comunidad' },
  { href: '/diario', icon: BookOpen, label: 'Diario' },
  { href: '/perfil', icon: User, label: 'Perfil' },
];

export default function MobileNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200/70 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map(tab => {
          const active = isActive(tab.href);
          return (
            <Link key={tab.href} href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all active:scale-90 relative ${
                active ? 'text-primary' : 'text-text-light hover:text-primary'
              }`}
            >
              <tab.icon size={18} className={active ? 'fill-current' : ''} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {active && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
