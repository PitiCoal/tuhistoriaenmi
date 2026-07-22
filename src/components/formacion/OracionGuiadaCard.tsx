'use client'

import { useState } from 'react'
import { Play, Pause, Headphones, Clock } from 'lucide-react'
import type { OracionGuiada } from '@/lib/oraciones-guiadas'

interface Props {
  oracion: OracionGuiada
}

export default function OracionGuiadaCard({ oracion }: Props) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="group bg-card rounded-xl border border-gray-200/70 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <div className="text-center space-y-2 p-4">
          <Headphones size={32} className="mx-auto text-primary/60" />
          <span className="block text-[10px] font-semibold text-primary uppercase tracking-wider">
            {oracion.tema}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="text-white text-xs font-medium bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
            <Clock size={10} /> {oracion.duracion}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-heading font-bold text-primary-dark text-sm leading-snug">{oracion.titulo}</h3>
        <p className="text-[11px] text-text-light/70 line-clamp-2">{oracion.descripcion}</p>

        {oracion.audio_url ? (
          <button
            onClick={() => setPlaying(!playing)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all"
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            {playing ? 'Pausar' : 'Escuchar'}
          </button>
        ) : (
          <div className="px-3 py-2 bg-gray-50 rounded-lg text-[10px] text-text-light text-center border border-dashed border-gray-200">
            Audio disponible próximamente
          </div>
        )}

        <details className="group/details">
          <summary className="text-[10px] text-text-light/60 cursor-pointer hover:text-primary transition-colors font-medium">
            Ver guión de oración
          </summary>
          <p className="text-[11px] text-text leading-relaxed mt-2 italic bg-gray-50 rounded-lg p-3 border border-gray-100">
            &ldquo;{oracion.guion}&rdquo;
          </p>
        </details>
      </div>
    </div>
  )
}
