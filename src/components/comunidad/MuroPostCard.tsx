'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { createMuroReply, getMuroReplies, deleteMuroReply, toggleReaction, supabase } from '@/lib/supabase'
import { MuroPost, Profile } from '@/lib/database.types'
import { User, Trash2, Reply, Send, LogIn } from 'lucide-react'
import Link from 'next/link'

const MURO_EMOJIS = ['🙏', '❤️', '😊', '✨', '🤗', '🕊️', '💪'] as const

export function renderContentWithBold(content: string): React.ReactNode {
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

interface MuroPostCardProps {
  post: MuroPost
  profiles: Profile[]
  onDelete?: (postId: string) => void
  onReactionUpdate?: (postId: string, counts: Record<string, number>, userReactions: Set<string>) => void
  initialReactionCounts?: Record<string, number>
  initialUserReactions?: Set<string>
}

export default function MuroPostCard({
  post,
  profiles,
  onDelete,
  onReactionUpdate,
  initialReactionCounts = {},
  initialUserReactions = new Set(),
}: MuroPostCardProps) {
  const { user, signIn } = useAuth()
  const userId = user && user !== 'loading' ? (user as any).uid : null

  const [replyText, setReplyText] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [replies, setReplies] = useState<any[]>([])
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(initialReactionCounts)
  const [userReactions, setUserReactions] = useState<Set<string>>(initialUserReactions)

  const profile = post.user_id ? profiles.find((p) => p.user_id === post.user_id) : null
  const authorName = post.author_name || profile?.display_name || 'Anónimo'
  const authorPhoto = profile?.photo_url || null
  const canDelete = userId && post.user_id === userId
  const categoryLabel = getCategoryLabel(post.category)

  function getCategoryLabel(cat: string | null) {
    switch (cat) {
      case 'oracion': return '🙏 Oración'
      case 'reflexion': return '💬 Reflexión'
      case 'gracias': return '💛 Gracias'
      case 'sugerencia': return '🎤 Sugerencia'
      default: return null
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar esta publicación?')) return
    onDelete?.(post.id)
  }

  async function handleReact(emoji: string) {
    if (!userId) { signIn(); return }
    const result = await toggleReaction('muro_post', post.id, userId, emoji)
    if (result !== undefined) {
      const added = result
      const newUserReactions = new Set(userReactions)
      const newCounts = { ...reactionCounts }
      if (added) {
        newUserReactions.add(emoji)
        newCounts[emoji] = (newCounts[emoji] || 0) + 1
      } else {
        newUserReactions.delete(emoji)
        newCounts[emoji] = Math.max(0, (newCounts[emoji] || 0) - 1)
      }
      setUserReactions(newUserReactions)
      setReactionCounts(newCounts)
      onReactionUpdate?.(post.id, newCounts, newUserReactions)
    }
  }

  async function toggleReplies() {
    if (expanded) {
      setExpanded(false)
    } else {
      setExpanded(true)
      const list = await getMuroReplies(post.id)
      setReplies(list)
    }
  }

  async function handleReplySubmit() {
    if (!userId || !replyText.trim()) return
    const { data } = await createMuroReply({
      post_id: post.id,
      user_id: userId,
      content: replyText.trim(),
    })
    if (data) {
      setReplies([...replies, data])
      setReplyText('')

      if (post.user_id && post.user_id !== userId) {
        fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: post.user_id,
            type: 'comments',
            senderName: (user as any)?.displayName || 'Un hermano/a',
            messageText: replyText.trim(),
            postId: post.id,
            title: '💬 Nuevo comentario',
            body: `${(user as any)?.displayName || 'Un hermano/a'} respondió a tu publicación`,
            url: `/comunidad?post=${post.id}`,
          }),
        }).catch(() => {})
      }
    }
  }

  return (
    <div className="bg-card rounded-xl p-4 md:p-5 border border-gray-200/70 shadow-sm space-y-3">
      {/* Author header */}
      <div className="flex items-center gap-2.5">
        {authorPhoto ? (
          <Link href={`/perfil/${post.user_id}`}>
            <img src={authorPhoto} alt="" className="w-8 h-8 rounded-full object-cover border" />
          </Link>
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={14} className="text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={post.user_id ? `/perfil/${post.user_id}` : '#'}
              className="text-xs md:text-sm font-semibold text-primary-dark hover:underline truncate"
            >
              {authorName}
            </Link>
            {post.is_pinned && (
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                📌 Destacado
              </span>
            )}
            {categoryLabel && (
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                post.category === 'oracion' ? 'bg-red-50 text-red-600 border border-red-100' :
                post.category === 'reflexion' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                post.category === 'gracias' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                'bg-green-50 text-green-600 border border-green-100'
              }`}>
                {categoryLabel}
              </span>
            )}
          </div>
          <p className="text-[10px] text-text-light">
            {new Date(post.created_at).toLocaleDateString('es-CL', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        {canDelete && (
          <button onClick={handleDelete} className="p-1.5 text-text-light hover:text-red-500 transition-colors">
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-xs md:text-sm text-text leading-relaxed whitespace-pre-wrap">
        {renderContentWithBold(post.content)}
      </p>

      {post.image_url && (
        <img src={post.image_url} alt="" className="max-h-80 rounded-lg object-cover border w-full sm:w-auto" />
      )}

      {/* Reactions */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-50">
        {MURO_EMOJIS.map((emoji) => {
          const count = reactionCounts[emoji] || 0
          const reacted = userReactions.has(emoji)
          return (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all active:scale-75 ${
                reacted
                  ? 'bg-primary/10 text-primary border border-primary/20 scale-110'
                  : 'bg-gray-100 text-text-light hover:bg-primary/10 hover:text-primary hover:border-primary/20 border border-gray-200'
              }`}
            >
              <span className="text-xs select-none">{emoji}</span>
              <span className="text-[10px]">{count > 0 ? count : ''}</span>
            </button>
          )
        })}
        <button
          onClick={toggleReplies}
          className="inline-flex items-center gap-1 text-xs text-text-light hover:text-primary transition-colors active:scale-90 ml-auto"
        >
          <Reply size={12} />
          {replies.length > 0 ? `${replies.length} respuestas` : 'Responder'}
        </button>
      </div>

      {/* Replies section */}
      {expanded && (
        <div className="pl-4 border-l-2 border-primary/20 space-y-2 mt-3 pt-1">
          {replies.map((reply) => (
            <div key={reply.id} className="text-xs md:text-sm flex flex-col gap-0.5 bg-gray-50/50 p-2 rounded-lg border border-gray-100/50">
              <span className="font-semibold text-primary-dark">
                {reply.author_name || (reply.user_id ? profiles.find((p) => p.user_id === reply.user_id)?.display_name || 'Usuario' : 'Anónimo')}
              </span>
              <span className="text-text">{reply.content}</span>
            </div>
          ))}
          {userId ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Escribe una respuesta..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()}
                maxLength={500}
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleReplySubmit}
                disabled={!replyText.trim()}
                className="p-1.5 bg-primary text-white rounded-lg disabled:opacity-50 active:scale-90"
              >
                <Send size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="text-[11px] text-primary font-medium hover:underline flex items-center gap-1 pt-1"
            >
              <LogIn size={10} /> Inicia sesión para responder
            </button>
          )}
        </div>
      )}
    </div>
  )
}
