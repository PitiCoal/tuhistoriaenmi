import { ReactNode } from 'react'

export const MURO_EMOJIS = ['🙏', '❤️', '😊', '✨', '🤗', '🕊️', '💪'] as const

export const EMOJI_ICONS: Record<string, ReactNode> = {
  '🙏': <span className="text-xs select-none">🙏</span>,
  '❤️': <span className="text-xs select-none">❤️</span>,
  '😊': <span className="text-xs select-none">😊</span>,
  '✨': <span className="text-xs select-none">✨</span>,
  '🤗': <span className="text-xs select-none">🤗</span>,
  '🕊️': <span className="text-xs select-none">🕊️</span>,
  '💪': <span className="text-xs select-none">💪</span>,
}

export function renderContentWithBold(content: string): ReactNode {
  if (!content) return ''
  const parts = content.split(/(\*\*[\s\S]*?\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>
    }
    const subparts = part.split(/(\*[\s\S]*?\*)/g)
    return subparts.map((subpart, subindex) => {
      if (subpart.startsWith('*') && subpart.endsWith('*')) {
        return <strong key={`${index}-${subindex}`} className="font-bold">{subpart.slice(1, -1)}</strong>
      }
      return subpart
    })
  })
}

export function getCategoryLabel(cat: string | null) {
  switch (cat) {
    case 'oracion': return '🙏 Oración'
    case 'reflexion': return '💬 Reflexión'
    case 'gracias': return '💛 Gracias'
    case 'sugerencia': return '🎤 Sugerencia'
    default: return null
  }
}

export const CATEGORY_STYLES: Record<string, string> = {
  oracion: 'bg-red-50 text-red-600 border border-red-100',
  reflexion: 'bg-blue-50 text-blue-600 border border-blue-100',
  gracias: 'bg-amber-50 text-amber-600 border border-amber-100',
  sugerencia: 'bg-green-50 text-green-600 border border-green-100',
}
