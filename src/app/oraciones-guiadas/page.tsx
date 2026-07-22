'use client'

import { useState, useEffect } from 'react'
import { getOracionesGuiadas } from '@/lib/supabase'
import { oracionesGuiadas as fallbackOraciones } from '@/lib/oraciones-guiadas'
import OracionGuiadaCard from '@/components/formacion/OracionGuiadaCard'
import { Headphones, BookOpen, X } from 'lucide-react'
import Link from 'next/link'

export default function OracionesGuiadasPage() {
  const [items, setItems] = useState<any[]>([])
  const [selectedTema, setSelectedTema] = useState<string | null>(null)

  useEffect(() => {
    getOracionesGuiadas().then(cloud => {
      if (cloud.length > 0) {
        setItems(cloud)
      } else {
        setItems(fallbackOraciones)
      }
    })
  }, [])

  const temas = [...new Set(items.map(o => o.tema))]
  const filtered = selectedTema ? items.filter(o => o.tema === selectedTema) : items

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden min-h-[180px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-accent opacity-90" />
        <div className="relative z-10 p-8 md:p-12 text-center w-full">
          <Headphones size={28} className="mx-auto text-white/80 mb-3" />
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">Oraciones Guiadas</h1>
          <p className="text-white/80 text-sm md:text-base mt-2 max-w-lg mx-auto">
            Detente un momento. Respira. Deja que Dios hable a tu corazón.
          </p>
        </div>
      </section>

      <div className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-sm">
        <p className="text-sm text-text leading-relaxed">
          Las oraciones guiadas son espacios de encuentro personal con Dios. Elige la que resuene con tu momento interior,
          ponte cómodo, cierra los ojos y permite que el Espíritu Santo ore en ti.
        </p>
      </div>

      {/* Filter by theme */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setSelectedTema(null)}
          className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
            !selectedTema
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 text-text-light hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        {temas.map(tema => (
          <button
            key={tema}
            onClick={() => setSelectedTema(tema === selectedTema ? null : tema)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
              selectedTema === tema
                ? 'bg-primary text-white shadow-sm'
                : 'bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10'
            }`}
          >
            {tema}
            {selectedTema === tema && <X size={10} />}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(o => (
          <OracionGuiadaCard key={o.id} oracion={o} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-light text-sm py-8">No hay oraciones de este tema.</p>
      )}

      {/* Link a diario */}
      <div className="text-center pt-4">
        <Link
          href="/diario"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20"
        >
          <BookOpen size={16} /> Continuar en mi diario
        </Link>
      </div>
    </div>
  )
}
