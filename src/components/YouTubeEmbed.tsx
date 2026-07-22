'use client'

import { useState } from 'react'
import { Play, AlertCircle } from 'lucide-react'

interface YouTubeEmbedProps {
  url: string
  title: string
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export default function YouTubeEmbed({ url, title }: YouTubeEmbedProps) {
  const [show, setShow] = useState(false)
  const videoId = extractYouTubeId(url)

  if (!videoId) return null

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 group cursor-pointer"
      >
        <img
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-black/30">
            <Play size={28} className="text-white ml-1" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-xs font-medium">{title}</p>
        </div>
      </button>
    )
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}
