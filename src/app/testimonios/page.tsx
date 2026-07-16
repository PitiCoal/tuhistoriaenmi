'use client';

import { useState, useEffect } from 'react';
import { getPublicTestimonios } from '@/lib/supabase';
import { MessageCircle, Quote, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TestimoniosPage() {
  const [testimonios, setTestimonios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicTestimonios().then(data => {
      setTestimonios(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero */}
      <section className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <MessageCircle size={24} className="text-primary" />
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark">
          Testimonios
        </h1>
        <p className="text-text-light text-sm max-w-md mx-auto leading-relaxed">
          Historias reales de personas que han encontrado a Dios en su camino. Cada testimonio es una semilla de fe.
        </p>
        <Link
          href="/testimonio"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm active:scale-95"
        >
          Comparte tu historia <ArrowRight size={14} />
        </Link>
      </section>

      {/* Testimonios */}
      {loading ? (
        <p className="text-center text-text-light py-10">Cargando testimonios...</p>
      ) : testimonios.length === 0 ? (
        <div className="bg-card rounded-2xl p-10 border border-gray-200/70 shadow-md text-center space-y-3">
          <Quote size={36} className="mx-auto text-primary/30" />
          <p className="text-text-light text-sm">
            Aún no hay testimonios publicados. ¡Sé el primero en compartir tu historia!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonios.map((t, idx) => (
            <article
              key={t.id || idx}
              className="bg-card rounded-2xl border border-gray-200/70 shadow-md overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {/* Quote icon */}
                <Quote size={20} className="text-primary/40" />

                {/* Content */}
                <blockquote className="text-text leading-relaxed italic text-base">
                  &ldquo;{t.content}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-heading text-sm font-bold text-primary">
                      {(t.display_name || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary-dark">
                      {t.display_name || 'Anónimo'}
                    </p>
                    <time className="text-xs text-text-light" dateTime={t.created_at}>
                      {new Date(t.created_at).toLocaleDateString('es-CL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* CTA bottom */}
      <section className="bg-primary/5 rounded-2xl p-8 border border-primary/10 text-center space-y-3">
        <p className="font-heading text-base italic text-primary-dark leading-relaxed">
          &ldquo;Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.&rdquo;
        </p>
        <Link
          href="/testimonio"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors active:scale-95"
        >
          <MessageCircle size={14} /> Quiero compartir mi historia
        </Link>
      </section>
    </div>
  );
}
