'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, Users, BookOpen, User, Headphones, ChevronUp } from 'lucide-react';

const tabs = [
  { href: '/', icon: Home, label: 'Hoy' },
  { href: '/comunidad', icon: Users, label: 'Comunidad' },
  { href: '/diario', icon: BookOpen, label: 'Diario' },
  { href: '/perfil', icon: User, label: 'Perfil' },
];

const moreLinks = [
  { href: '/formacion', label: 'Formación' },
  { href: '/episodios', label: 'Podcast' },
  { href: '/oraciones-guiadas', label: 'Oraciones Guiadas' },
  { href: '/recomendaciones', label: 'Recomendaciones' },
  { href: '/el-en-mi', label: 'Él en mí' },
  { href: '/donar', label: 'Donar' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* More links overlay */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200/70 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-2 space-y-0.5">
              {moreLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setShowMore(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.href) ? 'bg-primary/10 text-primary' : 'text-text-light hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

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
          <button onClick={() => setShowMore(!showMore)}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all active:scale-90 ${
              showMore ? 'text-primary' : 'text-text-light hover:text-primary'
            }`}
          >
            <Headphones size={18} />
            <span className="text-[10px] font-medium">Más</span>
            {showMore && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
