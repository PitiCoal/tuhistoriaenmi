'use client';

import { useEffect, useState } from 'react';
import { Heart, Target, Eye, Sparkles, BarChart3, MessageCircle, Star } from 'lucide-react';
import UserCounter from '@/components/UserCounter';
import SponsorShowcase from '@/components/SponsorShowcase';
import { getPageContent, getImpactMetrics, getPublicTestimonios, countProfiles, countEpisodes, countTestimonios, countSponsors } from '@/lib/supabase';

const FALLBACK: Record<string, string> = {
  hero_title: 'Nuestra Historia',
  hero_subtitle: 'Cómo nació y qué busca esta comunidad.',
  como_empezo: 'Tu Historia En Mí nace del deseo de ser un puente de unión y comunicación de fe. Un espacio donde los testimonios reales de vida se convierten en una invitación a conocer a Dios, a redescubrirlo o simplemente a recordar que nunca es tarde para acercarse a Él.\n\nCada episodio es una conversación íntima, sin guion, sin juicios. Solo una historia contada con verdad, desde el corazón. Porque creemos que al contar una historia, y al escucharla, algo en nosotros se mueve, se comprende o se alivia.',
  que_buscamos: 'Ser un puente que conecte a las personas con Dios a través de historias reales de fe y vida. Buscamos que más personas conozcan a Dios, se acerquen a Él y descubran que en sus luchas nunca están solos. Cada testimonio compartido es una semilla de fe sembrada en quien lo escucha.',
  mision: 'Ser un puente de unión y comunicación de fe, donde testimonios reales acerquen a más personas a Dios, inspirándolas a confiar en Él y a descubrir que cada historia tiene un propósito en Su plan.',
  vision: 'Ser un referente de fe en habla hispana, donde cada episodio sea una puerta abierta para que alguien encuentre a Dios, se reconcilie con Él o fortalezca su camino espiritual.',
  valores: 'Fe, empatía, comunidad, esperanza y superación. Creemos en el poder transformador de una historia compartida con verdad.',
  creadora_bio: 'Host y creadora de Tu Historia En Mí. Convencida de que cada historia tiene un propósito y que al compartirla, alguien encuentra luz en la suya. Este proyecto nace de la fe y del deseo de crear un espacio donde todos se sientan escuchados.',
  oracion: 'Señor, te pedimos que cada persona que llegue a este espacio pueda sentirse acogida, escuchada y amada. Que cada historia compartida sea semilla de esperanza en quien la escucha. Bendice a cada uno de los que confían en Ti y se animan a compartir su vida. Amén.',
};

export default function NosotrosPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [metrics, setMetrics] = useState<any[]>([]);
  const [testimonios, setTestimonios] = useState<any[]>([]);
  const [autoMetrics, setAutoMetrics] = useState({ profiles: 0, episodes: 0, testimonios: 0, sponsors: 0 });

  useEffect(() => {
    getPageContent('nosotros').then(data => setContent(data));
    getImpactMetrics().then(setMetrics);
    getPublicTestimonios().then(setTestimonios);
    Promise.all([countProfiles(), countEpisodes(), countTestimonios(), countSponsors()]).then(
      ([a, b, c, d]) => setAutoMetrics({ profiles: a, episodes: b, testimonios: c, sponsors: d })
    );
  }, []);

  const c = (key: string) => content[key] || FALLBACK[key] || '';

  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      <section className="relative rounded-2xl overflow-hidden min-h-[200px] flex items-center">
        <img
          src="/images/fondo-podcast.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="relative z-10 p-8 md:p-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
            {c('hero_title')}
          </h1>
          <p className="text-white/70 mt-2 text-lg">
            {c('hero_subtitle')}
          </p>
        </div>
      </section>

      <section className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles size={20} className="text-primary" />
          <h2 className="font-heading text-xl font-bold text-primary-dark">
            Cómo empezó
          </h2>
        </div>
        {c('como_empezo').split('\n').map((p, i) => (
          <p key={i} className="text-text leading-relaxed">{p}</p>
        ))}
      </section>

      <section className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md space-y-4">
        <div className="flex items-center gap-3">
          <Heart size={20} className="text-primary" />
          <h2 className="font-heading text-xl font-bold text-primary-dark">
            Qué buscamos
          </h2>
        </div>
        <p className="text-text leading-relaxed">{c('que_buscamos')}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Target size={20} className="text-primary" />
          </div>
          <h3 className="font-heading font-bold text-primary-dark">Misión</h3>
          <p className="text-sm text-text-light leading-relaxed">{c('mision')}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Eye size={20} className="text-primary" />
          </div>
          <h3 className="font-heading font-bold text-primary-dark">Visión</h3>
          <p className="text-sm text-text-light leading-relaxed">{c('vision')}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart size={20} className="text-primary" />
          </div>
          <h3 className="font-heading font-bold text-primary-dark">Valores</h3>
          <p className="text-sm text-text-light leading-relaxed">{c('valores')}</p>
        </div>
      </div>

      {/* Auto-métricas de impacto - siempre visibles */}
      <section className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={20} className="text-primary" />
          <h2 className="font-heading text-xl font-bold text-primary-dark">Impacto</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center space-y-1">
            <p className="text-3xl font-bold text-primary">{autoMetrics.profiles}</p>
            <p className="text-xs text-text-light">Usuarios registrados</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-bold text-primary">{autoMetrics.episodes}</p>
            <p className="text-xs text-text-light">Episodios publicados</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-bold text-primary">{autoMetrics.testimonios}</p>
            <p className="text-xs text-text-light">Testimonios recibidos</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-bold text-primary">{autoMetrics.sponsors}</p>
            <p className="text-xs text-text-light">Auspiciadores</p>
          </div>
        </div>
        <p className="text-[10px] text-text-light/60 mt-2">Estas métricas se actualizan automáticamente desde la base de datos.</p>
      </section>

      {/* Métricas personalizadas (si existen) */}
      {metrics.length > 0 && (
        <section className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
          <div className="flex items-center gap-2 mb-6">
            <Star size={20} className="text-primary" />
            <h2 className="font-heading text-xl font-bold text-primary-dark">Métricas destacadas</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map(m => (
              <div key={m.id} className="text-center space-y-1">
                <p className="text-3xl font-bold text-primary">{m.value}</p>
                <p className="text-xs text-text-light">{m.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <UserCounter />

      <section className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md space-y-4">
        <h2 className="font-heading text-xl font-bold text-primary-dark">Creadora</h2>
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="font-heading text-2xl font-bold text-primary">MC</span>
          </div>
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-primary-dark text-lg">
              M. Piedad Correa
            </h3>
            <p className="text-sm text-text-light leading-relaxed">{c('creadora_bio')}</p>
            <p className="text-sm text-text-light/70">
              contacto.tuhistoriaenmi@gmail.com
            </p>
          </div>
        </div>
      </section>

      <section className="bg-primary/5 rounded-2xl p-8 border border-primary/10 text-center space-y-4">
        <p className="font-heading text-lg italic text-primary-dark leading-relaxed">
          &ldquo;Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.&rdquo;
        </p>
        <div className="w-12 h-0.5 bg-primary/30 mx-auto" />
        <p className="text-sm text-text-light leading-relaxed max-w-lg mx-auto italic">
          {c('oracion')}
        </p>
        <p className="text-xs text-text-light">— Oración de Tu Historia En Mí</p>
      </section>

      <SponsorShowcase />

      {testimonios.length > 0 && (
        <section className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md space-y-6">
          <div className="flex items-center gap-3">
            <MessageCircle size={20} className="text-primary" />
            <h2 className="font-heading text-xl font-bold text-primary-dark">
              Testimonios de la comunidad
            </h2>
          </div>
          <p className="text-sm text-text-light">
            Historias reales de personas que han encontrado a Dios en su camino.
          </p>
          <div className="space-y-4">
            {testimonios.map(t => (
              <div key={t.id} className="bg-primary/5 rounded-xl p-5 border border-primary/10 space-y-2">
                <blockquote className="text-text leading-relaxed italic">"{t.content}"</blockquote>
                <div className="flex items-center gap-2 text-sm text-text-light">
                  {t.display_name && (
                    <span className="font-medium text-primary-dark">{t.display_name}</span>
                  )}
                  <span className="text-xs">·</span>
                  <time dateTime={t.created_at}>
                    {new Date(t.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </time>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}