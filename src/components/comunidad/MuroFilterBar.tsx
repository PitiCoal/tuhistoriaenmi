'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'oracion', label: '🙏 Oraciones' },
  { id: 'reflexion', label: '💬 Reflexiones' },
  { id: 'gracias', label: '💛 Gracias' },
  { id: 'sugerencia', label: '🎤 Sugerencias' },
  { id: 'general', label: '📝 General' },
] as const

type FilterId = (typeof FILTERS)[number]['id']

export default function MuroFilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeFilter = (searchParams.get('filter') as FilterId) || 'todos'

  function handleClick(id: FilterId) {
    if (id === 'todos') {
      router.push('/comunidad')
    } else {
      router.push(`/comunidad?filter=${id}`)
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 py-1">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => handleClick(f.id)}
          className={`px-3 py-1 rounded-full text-[11px] md:text-xs font-medium border transition-all active:scale-95 ${
            activeFilter === f.id
              ? 'bg-secondary text-white border-secondary shadow-sm'
              : 'bg-card text-text-light border-gray-200 hover:bg-gray-50'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
