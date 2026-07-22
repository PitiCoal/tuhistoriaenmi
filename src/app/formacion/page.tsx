'use client'

import { useState, useEffect } from 'react'
import { getAllEpisodes } from '@/lib/episodes'
import { loadEpisodesFromSupabase, mergeEpisodesWithDefaults } from '@/lib/supabase'
import { getRecursosCatolicos } from '@/lib/supabase'
import { oracionesGuiadas } from '@/lib/oraciones-guiadas'
import EpisodeCard from '@/components/EpisodeCard'
import OracionGuiadaCard from '@/components/formacion/OracionGuiadaCard'
import { Sparkles, Headphones, Mic, BookOpen, ArrowRight, ExternalLink, Church } from 'lucide-react'
import Link from 'next/link'

const defaultRecursos = [
  { id: 'r1', title: 'Biblia de Jerusalén', subtitle: 'Textos y comentarios', description: 'La Biblia de Jerusalén online con introducciones y notas.', url: 'https://www.bibliacatolica.com.br', type: 'biblia' },
  { id: 'r2', title: 'Catecismo de la Iglesia Católica', subtitle: 'Compendio de la fe', description: 'El Catecismo completo en español, fuente oficial de la doctrina católica.', url: 'https://www.vatican.va/archive/catechism_sp/index_sp.html', type: 'doctrina' },
  { id: 'r3', title: 'Laudato Si\'', subtitle: 'Encíclica del Papa Francisco', description: 'Sobre el cuidado de la casa común — ecología integral y fe.', url: 'https://www.vatican.va/content/francesco/es/encyclicals/documents/papa-francesco_20150524_enciclica-laudato-si.html', type: 'enciclica' },
  { id: 'r4', title: 'Fratelli Tutti', subtitle: 'Encíclica del Papa Francisco', description: 'Sobre la fraternidad y la amistad social — un llamado a la unidad.', url: 'https://www.vatican.va/content/francesco/es/encyclicals/documents/papa-francesco_20201003_enciclica-fratelli-tutti.html', type: 'enciclica' },
  { id: 'r5', title: 'Evangelii Gaudium', subtitle: 'Exhortación Apostólica', description: 'La alegría del Evangelio — sobre el anuncio del Evangelio en el mundo actual.', url: 'https://www.vatican.va/content/francesco/es/exhortations/documents/papa-francesco_esortazione-ap_20131124_evangelii-gaudium.html', type: 'enciclica' },
  { id: 'r6', title: 'Concilio Vaticano II', subtitle: 'Documentos completos', description: 'Todos los documentos del Concilio Vaticano II: constituciones, decretos y declaraciones.', url: 'https://www.vatican.va/archive/hist_councils/ii_vatican_council/index_sp.htm', type: 'doctrina' },
  { id: 'r7', title: 'Vatican.va', subtitle: 'Portal oficial del Vaticano', description: 'Noticias, documentos, discursos y recursos oficiales de la Santa Sede.', url: 'https://www.vatican.va', type: 'portal' },
  { id: 'r8', title: 'ACI Prensa', subtitle: 'Noticias católicas', description: 'Noticias de la Iglesia, formación, santos, liturgia y actualidad católica.', url: 'https://www.aciprensa.com', type: 'noticias' },
  { id: 'r9', title: 'EWTN Español', subtitle: 'Televisión católica', description: 'Contenido audiovisual católico: programas, documentales, formación y más.', url: 'https://www.ewtn.com/es', type: 'multimedia' },
  { id: 'r10', title: 'YouCat', subtitle: 'Catecismo joven', description: 'El Catecismo de la Iglesia Católica en un lenguaje accesible para jóvenes.', url: 'https://www.youcat.org/es/', type: 'formacion' },
  { id: 'r11', title: 'Magnificat', subtitle: 'Liturgia diaria', description: 'La liturgia de las horas, lecturas diarias y oraciones para cada día.', url: 'https://www.magnificat.com', type: 'liturgia' },
  { id: 'r12', title: 'Corazones.org', subtitle: 'Vida espiritual', description: 'Recursos de espiritualidad católica, vidas de santos, oraciones y formación.', url: 'https://www.corazones.org', type: 'formacion' },
]

const typeLabels: Record<string, string> = {
  biblia: 'Biblias',
  doctrina: 'Doctrina',
  enciclica: 'Encíclicas',
  portal: 'Portales',
  noticias: 'Noticias',
  multimedia: 'Multimedia',
  formacion: 'Formación',
  liturgia: 'Liturgia',
}

export default function FormacionPage() {
  const [episodes, setEpisodes] = useState(getAllEpisodes())
  const [activeSection, setActiveSection] = useState<'oraciones' | 'recursos' | 'podcast'>('oraciones')
  const [recursos, setRecursos] = useState(defaultRecursos)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  useEffect(() => {
    loadEpisodesFromSupabase().then(cloud => {
      if (cloud.length > 0) {
        setEpisodes(mergeEpisodesWithDefaults(cloud, getAllEpisodes()))
      }
    })
    getRecursosCatolicos().then(cloud => {
      if (cloud.length > 0) setRecursos(cloud)
    })
  }, [])

  const latestEpisodes = episodes.slice(0, 6)
  const latestEpisode = episodes[episodes.length - 1]

  const tipos = [...new Set(recursos.map(r => r.type))]
  const filteredRecursos = selectedType ? recursos.filter(r => r.type === selectedType) : recursos

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
          onClick={() => setActiveSection('oraciones')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'oraciones' ? 'bg-white text-primary shadow-sm' : 'text-text-light hover:text-primary'
          }`}
        >
          <Headphones size={16} /> Oraciones Guiadas
        </button>
        <button
          onClick={() => setActiveSection('recursos')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'recursos' ? 'bg-white text-primary shadow-sm' : 'text-text-light hover:text-primary'
          }`}
        >
          <Church size={16} /> Recursos
        </button>
        <button
          onClick={() => setActiveSection('podcast')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'podcast' ? 'bg-white text-primary shadow-sm' : 'text-text-light hover:text-primary'
          }`}
        >
          <Mic size={16} /> Podcast
        </button>
      </div>

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

      {/* Recursos Católicos section */}
      {activeSection === 'recursos' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-primary-dark mb-2">Recursos Católicos</h2>
            <p className="text-xs text-text-light leading-relaxed">
              Biblias, encíclicas, documentos, noticias y portales para profundizar tu fe católica.
            </p>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                !selectedType ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-text-light hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            {tipos.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t === selectedType ? null : t)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all capitalize ${
                  selectedType === t ? 'bg-primary text-white shadow-sm' : 'bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10'
                }`}
              >
                {typeLabels[t] || t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredRecursos.map(r => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group flex flex-col"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Church size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-primary-dark text-sm group-hover:text-primary transition-colors line-clamp-2">
                      {r.title}
                    </h3>
                    {r.subtitle && (
                      <p className="text-[10px] text-text-light mt-0.5">{r.subtitle}</p>
                    )}
                  </div>
                  <ExternalLink size={14} className="text-text-light/40 group-hover:text-primary shrink-0 mt-1 transition-colors" />
                </div>
                {r.description && (
                  <p className="text-xs text-text-light leading-relaxed line-clamp-3 flex-1">{r.description}</p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Podcast section */}
      {activeSection === 'podcast' && (
        <div className="space-y-6">
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
