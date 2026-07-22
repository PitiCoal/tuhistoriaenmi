'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { uploadFile, createMuroPost } from '@/lib/supabase'
import { Send, ImageIcon, X } from 'lucide-react'

const CATEGORIES = [
  { id: 'general', label: '📝 General' },
  { id: 'oracion', label: '🙏 Oración' },
  { id: 'reflexion', label: '💬 Reflexión' },
  { id: 'gracias', label: '💛 Gracias' },
  { id: 'sugerencia', label: '🎤 Sugerencia (Pública)' },
] as const

type CategoryId = (typeof CATEGORIES)[number]['id']

interface MuroFormProps {
  onPostCreated?: () => void
  comunidadId?: string
}

export default function MuroForm({ onPostCreated, comunidadId }: MuroFormProps) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [category, setCategory] = useState<CategoryId>('general')
  const [anonymous, setAnonymous] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || user === 'loading' || !text.trim()) return
    setUploading(true)

    let imageUrl: string | null = null
    if (image) {
      imageUrl = await uploadFile('muro-images', 'posts', image)
    }

    const payload: any = {
      user_id: anonymous ? null : (user as any).uid,
      content: text.trim(),
      image_url: imageUrl,
      category,
    }
    if (comunidadId) payload.comunidad_id = comunidadId

    const { data, error } = await createMuroPost(payload)
    if (!error && data) {
      setText('')
      setCategory('general')
      setImage(null)
      setImagePreview(null)
      onPostCreated?.()
    }
    setUploading(false)
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 md:p-5 border border-gray-200/70 shadow-md space-y-4">
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-text-light uppercase tracking-wider">
          ¿Qué deseas compartir hoy?
        </label>
        <textarea
          placeholder="Comparte con tus hermanos lo que Dios ponga en tu corazón..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs md:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-text-light uppercase tracking-wider">
          Tipo de publicación
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95 ${
                category === cat.id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-text-light border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-text-light hover:bg-gray-50 active:scale-95"
        >
          <ImageIcon size={13} />
          {image ? 'Cambiar imagen' : 'Agregar imagen'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-text-light cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            Anónimo
          </label>
          <button
            type="submit"
            disabled={!text.trim() || uploading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors active:scale-95 shadow-sm"
          >
            <Send size={12} />
            {uploading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>

      {imagePreview && (
        <div className="relative inline-block mt-2">
          <img src={imagePreview} alt="" className="h-20 rounded-lg object-cover border" />
          <button
            type="button"
            onClick={() => {
              setImage(null)
              setImagePreview(null)
            }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow shadow-red-500/30"
          >
            <X size={10} />
          </button>
        </div>
      )}
    </form>
  )
}
