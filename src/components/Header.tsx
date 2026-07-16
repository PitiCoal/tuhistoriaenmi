'use client';

import Link from 'next/link';
import { LogIn, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const publicLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/episodios', label: 'Episodios' },
  { href: '/testimonios', label: 'Testimonios' },
  { href: '/comunidad', label: 'Comunidad' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/proyectos', label: 'Proyectos' },
  { href: '/donar', label: 'Donar' },
];

const authLinks = [
  { href: '/perfil', label: 'Mi Perfil' },
];

const ADMIN_EMAIL = 'piti.coal@gmail.com';

export default function Header() {
  const { user, signIn, signOut } = useAuth();

  const isAdmin = typeof user === 'object' && user?.email === ADMIN_EMAIL;
  const fbUser = typeof user === 'object' && user;
  const userLinks = fbUser ? [...publicLinks, ...authLinks] : publicLinks;
  const allLinks = isAdmin
    ? [...userLinks, { href: '/admin/proyectos', label: 'Admin', icon: Shield }]
    : userLinks;

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-200/70 pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-6xl mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0">
          <img src="/images/logo.png" alt="" className="h-8 w-8 md:h-10 md:w-10" />
          <span className="font-heading text-sm md:text-lg font-bold text-primary-dark truncate max-w-[130px] md:max-w-none">
            Tu Historia En Mí
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          {allLinks.map(link => (
            <Link key={link.href} href={link.href}
              className={`transition-colors whitespace-nowrap ${
                link.label === 'Admin'
                  ? 'flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary font-semibold hover:bg-primary/20 text-xs'
                  : 'text-text-light hover:text-primary'
              }`}
            >
              {link.label === 'Admin' && <Shield size={14} />}
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
            {fbUser ? (
              <>
                <span className="text-xs text-text-light truncate max-w-[100px]">{fbUser.displayName || fbUser.email}</span>
                <button onClick={() => signOut()} className="p-1.5 text-text-light hover:text-primary active:scale-90" title="Cerrar sesión"><LogOut size={16} /></button>
              </>
            ) : (
              <button onClick={() => signIn()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm active:scale-90"><LogIn size={14} /> Entrar</button>
            )}
          </div>
        </nav>

        {fbUser ? (
          <div className="md:hidden flex items-center gap-2">
            <span className="text-xs text-text-light truncate max-w-[80px]">{fbUser.displayName || fbUser.email}</span>
            <button onClick={() => signOut()} className="p-1.5 text-text-light active:scale-90" title="Cerrar sesión"><LogOut size={16} /></button>
          </div>
        ) : (
          <button onClick={() => signIn()} className="md:hidden flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg active:scale-90">
            <LogIn size={14} /> Entrar
          </button>
        )}
      </div>
    </header>
  );
}
