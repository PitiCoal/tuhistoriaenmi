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
    <header className="bg-primary text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold">
          <span>Tu Historia En Mí</span>
        </Link>

        <nav className="hidden md:flex gap-6 text-sm font-medium">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="hover:text-gold transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menú">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-primary border-t border-white/10 px-4 pb-4">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm hover:text-gold transition-colors"
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
