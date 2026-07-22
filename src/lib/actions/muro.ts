'use server'

import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getMuroPosts(comunidadId?: string) {
  const supabase = await createServerClient()
  let query = (supabase as any).from('muro_posts').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false })

  if (comunidadId) {
    query = query.eq('comunidad_id', comunidadId)
  } else {
    query = query.is('comunidad_id', null)
  }

  const { data } = await query
  return data || []
}

export async function createMuroPostAction(formData: FormData, userId: string | null) {
  const supabase = await createServerClient()
  const content = formData.get('content') as string
  const category = formData.get('category') as string
  const anonymous = formData.get('anonymous') === 'true'
  const imageUrl = formData.get('image_url') as string | null
  const comunidadId = formData.get('comunidad_id') as string | null

  if (!content?.trim()) return { error: 'El contenido es requerido' }

  const { data, error } = await (supabase as any).from('muro_posts').insert({
    user_id: anonymous ? null : userId,
    content: content.trim(),
    image_url: imageUrl,
    category: category || 'general',
    comunidad_id: comunidadId || null,
  }).select().single()

  if (error) return { error: error.message }
  revalidatePath(comunidadId ? `/comunidades/${comunidadId}` : '/comunidad')
  return { data }
}

export async function deleteMuroPostAction(postId: string, userId: string) {
  const supabase = await createServerClient()
  const { error } = await (supabase as any).from('muro_posts').delete().eq('id', postId).eq('user_id', userId)
  if (error) return { error: error.message }
  revalidatePath('/comunidad')
  return { success: true }
}

export async function toggleReactionAction(targetId: string, emoji: string, userId: string) {
  const supabase = await createServerClient()
  const { data: existing } = await (supabase as any).from('reactions').select('id').eq('target_type', 'muro_post').eq('target_id', targetId).eq('user_id', userId).eq('emoji', emoji).maybeSingle()

  if (existing) {
    await (supabase as any).from('reactions').delete().eq('id', existing.id)
    return { added: false }
  }

  await (supabase as any).from('reactions').insert({ target_type: 'muro_post', target_id: targetId, user_id: userId, emoji })
  return { added: true }
}

export async function getMuroRepliesAction(postId: string) {
  const supabase = await createServerClient()
  const { data } = await (supabase as any).from('muro_replies').select('*').eq('post_id', postId).order('created_at', { ascending: true })
  return data || []
}

export async function createMuroReplyAction(formData: FormData, userId: string) {
  const supabase = await createServerClient()
  const postId = formData.get('post_id') as string
  const content = formData.get('content') as string
  if (!content?.trim() || !postId) return { error: 'Contenido requerido' }

  const { data, error } = await (supabase as any).from('muro_replies').insert({ post_id: postId, user_id: userId, content: content.trim() }).select().single()
  if (error) return { error: error.message }
  revalidatePath('/comunidad')
  return { data }
}

export async function getReactionCountsAction(targetId: string) {
  const supabase = await createServerClient()
  const { data } = await (supabase as any).from('reactions').select('emoji').eq('target_type', 'muro_post').eq('target_id', targetId)
  const counts: Record<string, number> = {}
  ;(data || []).forEach((r: any) => { counts[r.emoji] = (counts[r.emoji] || 0) + 1 })
  return counts
}

export async function getUserReactionsAction(targetId: string, userId: string) {
  const supabase = await createServerClient()
  const { data } = await (supabase as any).from('reactions').select('emoji').eq('target_type', 'muro_post').eq('target_id', targetId).eq('user_id', userId)
  return (data || []).map((r: any) => r.emoji)
}
