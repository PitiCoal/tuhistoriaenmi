'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle } from '@/lib/firebase';
import { Camera, LogIn, ArrowRight, Heart, Users, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ComunidadPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
      <div className="bg-card rounded-xl md:rounded-2xl p-5 md:p-8 border border-gray-200/70 shadow-md text-center">
        <h1 className="font-heading text-xl md:text-3xl font-bold text-primary-dark">Comunidad</h1>
        <p className="text-text-light text-xs md:text-sm mt-1">Tu Historia En Mí es más que un podcast.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <a href="https://instagram.com/tuhistoria.enmi" target="_blank" rel="noopener noreferrer"
          className="bg-card rounded-xl p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200/70">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-instagram flex items-center justify-center mb-3 md:mb-4">
            <Camera size={20} className="text-white" />
          </div>
          <h2 className="font-heading font-bold text-primary-dark text-base md:text-lg mb-1 md:mb-2">Instagram</h2>
          <p className="text-xs md:text-sm text-text-light leading-relaxed mb-3 md:mb-4">Síguenos en Instagram y entérate de nuevas historias.</p>
          <span className="inline-flex items-center gap-1 text-xs md:text-sm font-medium text-instagram hover:underline">Seguir <ArrowRight size={12} /></span>
        </a>

        {user ? (
          <Link href="/participa"
            className="bg-card rounded-xl p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow border border-primary/20 bg-primary/[0.03]">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center mb-3 md:mb-4">
              <Heart size={20} className="text-white" />
            </div>
            <h2 className="font-heading font-bold text-primary-dark text-base md:text-lg mb-1 md:mb-2">Participa</h2>
            <p className="text-xs md:text-sm text-text-light leading-relaxed mb-3 md:mb-4">Comparte oraciones, reflexiones y sé parte del Muro comunitario.</p>
            <span className="inline-flex items-center gap-1 text-xs md:text-sm font-medium text-primary hover:underline">Ir a Participa <ArrowRight size={12} /></span>
          </Link>
        ) : (
          <div className="bg-card rounded-xl p-5 md:p-6 shadow-md border border-gray-200/70">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
              <Users size={20} className="text-primary" />
            </div>
            <h2 className="font-heading font-bold text-primary-dark text-base md:text-lg mb-1 md:mb-2">Sé parte de esta comunidad</h2>
            <p className="text-xs md:text-sm text-text-light leading-relaxed mb-3 md:mb-4">
              Aquí cada historia importa. Crea tu cuenta para compartir oraciones, dejar tus reflexiones, participar en el Muro, conectar con otros que caminan historias similares y ser parte de algo más grande. Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.
            </p>
            <button onClick={() => signInWithGoogle()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
              <LogIn size={14} /> Crear cuenta
            </button>
          </div>
        )}
      </div>

      {user && (
        <div className="space-y-3 md:space-y-4">
          <Link href="/perfil"
            className="block bg-card rounded-xl p-4 md:p-5 border border-gray-200/70 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="font-heading font-bold text-primary-dark text-base md:text-lg">Mi Perfil</h2>
            <p className="text-xs md:text-sm text-text-light mt-1">Edita tu foto, país, edad y bio.</p>
          </Link>

          <a href="https://chat.whatsapp.com/HlF62d1pyiD3Ac98Oe2EKH" target="_blank" rel="noopener noreferrer"
            className="block bg-card rounded-xl p-4 md:p-5 border border-gray-200/70 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-whatsapp flex items-center justify-center shrink-0">
                <MessageCircle size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-primary-dark text-base">Grupo de WhatsApp</h2>
                <p className="text-xs md:text-sm text-text-light">Únete a nuestra comunidad de fe y conversación.</p>
              </div>
              <ArrowRight size={16} className="text-text-light ml-auto shrink-0" />
            </div>
          </a>
        </div>
      )}

      {!user && (
        <div className="bg-card rounded-xl p-4 md:p-5 border border-gray-200/70 shadow-md text-center">
          <p className="text-xs md:text-sm text-text-light">
            ¿Ya tienes cuenta?{' '}
            <button onClick={() => signInWithGoogle()} className="text-primary font-medium hover:underline">Inicia sesión</button>
          </p>
        </div>
      )}

      <div className="bg-card rounded-xl p-5 md:p-6 border border-gray-200/70 shadow-md text-center">
        <p className="font-heading text-base md:text-lg italic text-primary-dark">&ldquo;Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.&rdquo;</p>
      </div>
    </div>
  );
}
