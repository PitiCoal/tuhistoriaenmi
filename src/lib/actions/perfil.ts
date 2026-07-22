'use server'

import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getProfile(userId: string) {
  const supabase = await createServerClient()
  const { data } = await (supabase as any).from('profiles').select('*').eq('user_id', userId).maybeSingle()
  return data || null
}

export async function updateProfile(formData: FormData, userId: string) {
  const supabase = await createServerClient()
  const displayName = formData.get('display_name') as string
  const bio = formData.get('bio') as string
  const country = formData.get('country') as string
  const phone = formData.get('phone') as string

  const { error } = await (supabase as any).from('profiles').upsert({
    user_id: userId,
    display_name: displayName || null,
    bio: bio || null,
    country: country || null,
    phone: phone || null,
    updated_at: new Date().toISOString(),
  })

  if (error) return { error: error.message }
  revalidatePath('/perfil')
  return { success: true }
}

export async function getAllProfiles() {
  const supabase = await createServerClient()
  const { data } = await (supabase as any).from('profiles').select('*').order('display_name', { ascending: true })
  return data || []
}

export async function getUserMuroPosts(userId: string) {
  const supabase = await createServerClient()
  const { data } = await (supabase as any).from('muro_posts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  return data || []
}

export async function getUserJournalEntries(userId: string) {
  const supabase = await createServerClient()
  const { data } = await (supabase as any).from('personal_journal').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  return data || []
}


