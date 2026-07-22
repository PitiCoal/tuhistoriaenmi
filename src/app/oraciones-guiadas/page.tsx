'use client'

import { oracionesGuiadas } from '@/lib/oraciones-guiadas'
import OracionGuiadaCard from '@/components/formacion/OracionGuiadaCard'
import { Headphones, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function OracionesGuiadasPage() {
  const temas = [...new Set(oracionesGuiadas.map(o => o.tema))]

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
        {temas.map(tema => (
          <span key={tema} className="px-3 py-1 bg-primary/5 text-primary rounded-full text-[11px] font-medium border border-primary/10">
            {tema}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {oracionesGuiadas.map(o => (
          <OracionGuiadaCard key={o.id} oracion={o} />
        ))}
      </div>

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
