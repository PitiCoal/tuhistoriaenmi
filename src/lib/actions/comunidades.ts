'use server'

import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

type ComunidadRow = {
  id: string; name: string; description: string | null; photo_url: string | null
  cover_url: string | null; created_by: string; is_public: boolean; category: string | null
  member_count: number; created_at: string; updated_at: string
}

type ComunidadMemberRow = {
  id: string; comunidad_id: string; user_id: string; role: string; joined_at: string
}

type ProfileRow = {
  user_id: string; display_name: string | null; photo_url: string | null
}

export async function getComunidades() {
  const supabase = await createServerClient()
  const { data } = await (supabase as any).from('comunidades').select('*').order('member_count', { ascending: false })
  return (data || []) as ComunidadRow[]
}

export async function getComunidadById(id: string) {
  const supabase = await createServerClient()
  const { data } = await (supabase as any).from('comunidades').select('*').eq('id', id).single()
  return data as ComunidadRow | null
}

export async function getUserComunidades(userId: string) {
  const supabase = await createServerClient()
  const { data: memberships } = await (supabase as any).from('comunidad_members').select('comunidad_id, role').eq('user_id', userId)

  if (!memberships?.length) return []

  const ids = memberships.map((m: any) => m.comunidad_id)
  const { data: comunidades } = await (supabase as any).from('comunidades').select('*').in('id', ids).order('name')

  return ((comunidades || []) as ComunidadRow[]).map((c) => ({
    ...c,
    role: memberships.find((m: any) => m.comunidad_id === c.id)?.role,
  }))
}

export async function createComunidad(formData: FormData, userId: string) {
  const supabase = await createServerClient()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const isPublic = formData.get('is_public') !== 'false'

  if (!name?.trim()) return { error: 'El nombre es requerido' }

  const { data, error } = await (supabase as any).from('comunidades').insert({
    name: name.trim(),
    description: description?.trim() || null,
    category: category || null,
    is_public: isPublic,
    created_by: userId,
  }).select().single()

  if (error) return { error: error.message }

  await (supabase as any).from('comunidad_members').insert({
    comunidad_id: data.id,
    user_id: userId,
    role: 'admin',
  })

  await (supabase as any).from('comunidades').update({ member_count: 1 }).eq('id', data.id)

  revalidatePath('/comunidades')
  return { data: data as ComunidadRow }
}

export async function joinComunidad(comunidadId: string, userId: string) {
  const supabase = await createServerClient()
  const { data: existing } = await (supabase as any).from('comunidad_members').select('id').eq('comunidad_id', comunidadId).eq('user_id', userId).maybeSingle()

  if (existing) return { error: 'Ya eres miembro' }

  await (supabase as any).from('comunidad_members').insert({ comunidad_id: comunidadId, user_id: userId, role: 'member' })
  await (supabase as any).rpc('increment_comunidad_member_count', { comunidad_id: comunidadId })

  revalidatePath(`/comunidades/${comunidadId}`)
  return { success: true }
}

export async function leaveComunidad(comunidadId: string, userId: string) {
  const supabase = await createServerClient()
  await (supabase as any).from('comunidad_members').delete().eq('comunidad_id', comunidadId).eq('user_id', userId)
  await (supabase as any).rpc('decrement_comunidad_member_count', { comunidad_id: comunidadId })

  revalidatePath('/comunidades')
  return { success: true }
}

export async function getComunidadMembers(comunidadId: string) {
  const supabase = await createServerClient()
  const { data: members } = await (supabase as any).from('comunidad_members').select('user_id, role, joined_at').eq('comunidad_id', comunidadId).order('joined_at', { ascending: true })

  if (!members?.length) return []

  const userIds = members.map((m: any) => m.user_id)
  const { data: profiles } = await (supabase as any).from('profiles').select('user_id, display_name, photo_url').in('user_id', userIds)

  return members.map((m: any) => ({
    ...m,
    profile: profiles?.find((p: any) => p.user_id === m.user_id) || null,
  }))
}

export async function updateMemberRole(comunidadId: string, userId: string, role: string, _actingUserId: string) {
  const supabase = await createServerClient()
  const { error } = await (supabase as any).from('comunidad_members').update({ role }).eq('comunidad_id', comunidadId).eq('user_id', userId)
  if (error) return { error }
  revalidatePath(`/comunidades/${comunidadId}`)
  return { success: true }
}

export async function removeMember(comunidadId: string, userId: string, _actingUserId: string) {
  const supabase = await createServerClient()
  await (supabase as any).from('comunidad_members').delete().eq('comunidad_id', comunidadId).eq('user_id', userId)
  await (supabase as any).rpc('decrement_comunidad_member_count', { comunidad_id: comunidadId })
  revalidatePath(`/comunidades/${comunidadId}`)
  return { success: true }
}
