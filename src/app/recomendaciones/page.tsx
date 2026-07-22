'use client'

import { useState, useEffect } from 'react'
import { getRecomendaciones } from '@/lib/supabase'
import { ExternalLink, Sparkles, BookOpen, Video, Heart, Users, Globe } from 'lucide-react'

const typeIcons: Record<string, any> = {
  retiro: Sparkles,
  app: BookOpen,
  video: Video,
  libro: BookOpen,
  comunidad: Users,
  otro: Globe,
}

const typeColors: Record<string, string> = {
  retiro: 'bg-purple-100 text-purple-700',
  app: 'bg-blue-100 text-blue-700',
  video: 'bg-red-100 text-red-700',
  libro: 'bg-amber-100 text-amber-700',
  comunidad: 'bg-green-100 text-green-700',
  otro: 'bg-gray-100 text-gray-700',
}

export default function RecomendacionesPage() {
  const [items, setItems] = useState<any[]>([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    getRecomendaciones().then(setItems)
  }, [])

  const tipos = [...new Set(items.map(i => i.type || 'otro'))]
  const filtered = filter ? items.filter(i => (i.type || 'otro') === filter) : items

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-xl md:text-3xl font-bold text-primary-dark">Recomendaciones</h1>
        <p className="text-text-light text-xs md:text-sm">
          Retiros, apps, libros y recursos para tu camino de fe
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            !filter ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        {tipos.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${
              filter === t ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
            }`}
          >
            {t === 'retiro' ? 'Retiros' :
             t === 'app' ? 'Apps' :
             t === 'video' ? 'Videos' :
             t === 'libro' ? 'Libros' :
             t === 'comunidad' ? 'Comunidades' : 'Otros'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, i) => {
          const Icon = typeIcons[item.type] || Globe
          const colorClass = typeColors[item.type] || 'bg-gray-100 text-gray-700'
          return (
            <a
              key={item.id || i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group flex flex-col"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center shrink-0`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-primary-dark text-sm group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-[10px] text-text-light mt-0.5">{item.subtitle}</p>
                  )}
                </div>
                <ExternalLink size={14} className="text-text-light/40 group-hover:text-primary shrink-0 mt-1 transition-colors" />
              </div>
              {item.description && (
                <p className="text-xs text-text-light leading-relaxed line-clamp-3 flex-1">{item.description}</p>
              )}
            </a>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-light text-sm py-12">
          {items.length === 0
            ? 'No hay recomendaciones aún. ¡Vuelve pronto!'
            : 'No hay recomendaciones de esta categoría.'}
        </p>
      )}
    </div>
  )
}
