'use client'

import { useState, useEffect } from 'react'
import { getAllEpisodes } from '@/lib/episodes'
import { loadEpisodesFromSupabase, mergeEpisodesWithDefaults } from '@/lib/supabase'
import { oracionesGuiadas } from '@/lib/oraciones-guiadas'
import EpisodeCard from '@/components/EpisodeCard'
import OracionGuiadaCard from '@/components/formacion/OracionGuiadaCard'
import { Sparkles, Headphones, Mic, BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function FormacionPage() {
  const [episodes, setEpisodes] = useState(getAllEpisodes())
  const [activeSection, setActiveSection] = useState<'podcast' | 'oraciones'>('podcast')

  useEffect(() => {
    loadEpisodesFromSupabase().then(cloud => {
      if (cloud.length > 0) {
        setEpisodes(mergeEpisodesWithDefaults(cloud, getAllEpisodes()))
      }
    })
  }, [])

  const latestEpisodes = episodes.slice(0, 6)
  const latestEpisode = episodes[episodes.length - 1]

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden min-h-[200px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-accent opacity-90" />
        <div className="relative z-10 p-8 md:p-12 text-center w-full">
          <Sparkles size={32} className="mx-auto text-white/80 mb-3" />
          <h1 className="font-heading text-2xl md:text-4xl font-bold text-white">Formación</h1>
          <p className="text-white/80 text-sm md:text-base mt-2 max-w-lg mx-auto">
            Recursos para alimentar tu fe, crecer en el conocimiento de Dios y profundizar tu vida espiritual.
          </p>
        </div>
      </section>

      {/* Secciones tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveSection('podcast')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'podcast' ? 'bg-white text-primary shadow-sm' : 'text-text-light hover:text-primary'
          }`}
        >
          <Mic size={16} /> Podcast
        </button>
        <button
          onClick={() => setActiveSection('oraciones')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'oraciones' ? 'bg-white text-primary shadow-sm' : 'text-text-light hover:text-primary'
          }`}
        >
          <Headphones size={16} /> Oraciones Guiadas
        </button>
      </div>

      {/* Podcast section */}
      {activeSection === 'podcast' && (
        <div className="space-y-6">
          {/* Featured episode */}
          {latestEpisode && (
            <Link
              href={`/episodios/${latestEpisode.id}`}
              className="group block bg-card rounded-2xl border border-gray-200/70 shadow-md hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="md:flex">
                <div className="md:w-2/5 aspect-video md:aspect-auto bg-gray-100 overflow-hidden">
                  <img
                    src={latestEpisode.image}
                    alt={latestEpisode.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5 md:p-6 md:w-3/5 flex flex-col justify-center space-y-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Último episodio</span>
                  <h2 className="font-heading text-lg md:text-xl font-bold text-primary-dark group-hover:text-primary transition-colors">
                    {latestEpisode.title}
                  </h2>
                  <p className="text-sm text-text-light">con {latestEpisode.guest}</p>
                  <p className="text-xs text-text-light/70 line-clamp-2 leading-relaxed">{latestEpisode.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary pt-1">
                    Escuchar episodio <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Episodes grid */}
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-primary-dark">Episodios recientes</h2>
            <Link href="/episodios" className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {latestEpisodes.map(ep => (
              <EpisodeCard key={ep.id} episode={ep} />
            ))}
          </div>
        </div>
      )}

      {/* Oraciones Guiadas section */}
      {activeSection === 'oraciones' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-primary-dark mb-2">Oraciones Guiadas</h2>
            <p className="text-xs text-text-light leading-relaxed">
              Toma un momento para respirar, cerrar los ojos y dejar que Dios hable a tu corazón. Estas oraciones guiadas te acompañan en diferentes momentos y necesidades espirituales.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {oracionesGuiadas.map(o => (
              <OracionGuiadaCard key={o.id} oracion={o} />
            ))}
          </div>

          <div className="bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] rounded-xl p-5 border border-primary/10 text-center">
            <BookOpen size={20} className="mx-auto text-primary mb-2" />
            <p className="text-sm text-text leading-relaxed max-w-md mx-auto">
              &ldquo;Cuando ores, entra en tu cuarto, cierra la puerta y ora a tu Padre, que está en lo secreto.&rdquo;
            </p>
            <span className="text-xs text-text-light/70 mt-1 block">Mateo 6:6</span>
          </div>
        </div>
      )}

      {/* Links a otros pilares */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <Link
          href="/diario"
          className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen size={18} className="text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-primary-dark text-sm">Diario</h3>
            <p className="text-[10px] text-text-light">Escribe con Dios</p>
          </div>
        </Link>
        <Link
          href="/comunidad"
          className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
            <Mic size={18} className="text-secondary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-primary-dark text-sm">Comunidad</h3>
            <p className="text-[10px] text-text-light">Comparte en el muro</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
