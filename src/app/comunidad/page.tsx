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

      {!user ? (
        <div className="bg-card rounded-xl md:rounded-2xl p-6 md:p-10 border border-primary/20 shadow-md text-center space-y-4 bg-gradient-to-br from-primary/[0.03] to-primary/[0.07]">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
            <Users size={28} className="text-white" />
          </div>
          <h2 className="font-heading text-xl md:text-2xl font-bold text-primary-dark">
            Sé parte de esta comunidad
          </h2>
          <p className="text-sm md:text-base text-text-light leading-relaxed max-w-md mx-auto">
            Aquí cada historia importa. Crea tu cuenta para compartir oraciones, dejar tus reflexiones, 
            participar en el Muro, conectar con otros que caminan historias similares y ser parte de 
            algo más grande. Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.
          </p>
          <button onClick={() => signInWithGoogle()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md">
            <LogIn size={16} /> Crear cuenta gratis
          </button>
          <p className="text-xs text-text-light/60">Solo con tu correo de Google</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl md:rounded-2xl p-6 md:p-8 border border-primary/20 shadow-md text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Heart size={24} className="text-primary" />
          </div>
          <h2 className="font-heading text-xl font-bold text-primary-dark">Bienvenido de vuelta</h2>
          <p className="text-sm text-text-light">Explora todo lo que la comunidad tiene para ti.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/participa"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">
              Ir a Participa <ArrowRight size={14} />
            </Link>
            <Link href="/perfil"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-card text-primary rounded-lg text-sm font-semibold border border-primary/30 hover:bg-primary/5">
              Mi Perfil
            </Link>
          </div>
        </div>
      )}

      {/* Instagram preview */}
      <div className="bg-card rounded-xl overflow-hidden border border-gray-200/70 shadow-md">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-48 h-40 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center relative">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/50">
              <Camera size={32} className="text-white" />
            </div>
          </div>
          <div className="flex-1 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-instagram flex items-center justify-center shrink-0">
                <Camera size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-primary-dark">@tuhistoria.enmi</h3>
                <p className="text-xs text-text-light">Instagram</p>
              </div>
            </div>
            <p className="text-sm text-text-light leading-relaxed">
              Testimonios reales de vida, fe y superación. Cada historia importa. 
              &ldquo;Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.&rdquo;
            </p>
            <a href="https://instagram.com/tuhistoria.enmi" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-instagram text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm">
              <Camera size={14} /> Seguir en Instagram <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </div>

      {user && (
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
      )}

      <div className="bg-card rounded-xl p-5 md:p-6 border border-gray-200/70 shadow-md text-center">
        <p className="font-heading text-base md:text-lg italic text-primary-dark">&ldquo;Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.&rdquo;</p>
      </div>
    </div>
  );
}
