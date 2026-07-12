'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/episodios', label: 'Episodios' },
  { href: '/oracion', label: 'Muro de Oración' },
  { href: '/comunidad', label: 'Comunidad' },
  { href: '/proyectos', label: 'Proyectos' },
  { href: '/donar', label: 'Donar' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

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

        <nav className="hidden md:flex gap-6 text-sm font-medium">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text-light hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button className="md:hidden text-text-light" onClick={() => setOpen(!open)} aria-label="Menú">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
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
        </div>
      )}
    </header>
  );
}
