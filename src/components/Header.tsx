'use client';

import Link from 'next/link';
import { Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser } from '@/lib/firebase';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/episodios', label: 'Episodios' },
  { href: '/participa', label: 'Participa' },
  { href: '/comunidad', label: 'Comunidad' },
  { href: '/proyectos', label: 'Proyectos' },
  { href: '/donar', label: 'Donar' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="Tu Historia En Mí"
            className="h-10 w-10"
          />
          <span className="font-heading text-lg font-bold text-primary-dark hidden sm:inline">
            Tu Historia En Mí
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text-light hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              <span className="text-xs text-text-light truncate max-w-[100px]">
                {user.displayName || user.email}
              </span>
              <button
                onClick={signOutUser}
                className="p-1.5 text-text-light hover:text-primary transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <LogIn size={14} /> Entrar
            </button>
          )}
        </nav>

        <button className="md:hidden text-text-light" onClick={() => setOpen(!open)} aria-label="Menú">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 space-y-2">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2.5 text-sm text-text-light hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-2">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-light">{user.displayName || user.email}</span>
                <button
                  onClick={signOutUser}
                  className="text-xs text-text-light hover:text-primary"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold bg-primary text-white rounded-lg"
              >
                <LogIn size={14} /> Entrar con Google
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
