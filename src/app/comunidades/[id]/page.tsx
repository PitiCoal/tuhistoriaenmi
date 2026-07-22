'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { getComunidadById, joinComunidad, leaveComunidad, getComunidadMembers } from '@/lib/actions/comunidades'
import { getMuroPosts, deleteMuroPost } from '@/lib/supabase'
import { getAllProfiles } from '@/lib/supabase'
import { Comunidad, MuroPost, Profile } from '@/lib/database.types'
import MuroForm from '@/components/comunidad/MuroForm'
import MuroPostCard from '@/components/comunidad/MuroPostCard'
import { Users, ArrowLeft, UserPlus, LogOut, LogIn, Lock, Globe } from 'lucide-react'
import Link from 'next/link'

interface MemberWithProfile {
  user_id: string
  role: string
  joined_at: string
  profile: { display_name: string | null; photo_url: string | null } | null
}

export default function ComunidadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, signIn } = useAuth()
  const userId = user && user !== 'loading' ? (user as any).uid : null

  const [comunidad, setComunidad] = useState<Comunidad | null>(null)
  const [posts, setPosts] = useState<MuroPost[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [isMember, setIsMember] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [c, pfs, mbrs] = await Promise.all([
        getComunidadById(id),
        getAllProfiles(),
        getComunidadMembers(id),
      ])
      setComunidad(c)
      setProfiles(pfs)
      setMembers(mbrs)
      if (userId) {
        const myMembership = mbrs.find((m: any) => m.user_id === userId)
        setIsMember(!!myMembership)
        setUserRole(myMembership?.role || null)
      }
      setLoading(false)
    }
    load()
  }, [id, userId])

  async function loadPosts() {
    const allPosts = await getMuroPosts()
    const comunidadPosts = allPosts.filter((p: MuroPost) => p.comunidad_id === id)
    setPosts(comunidadPosts)
  }

  useEffect(() => {
    if (comunidad) loadPosts()
  }, [comunidad])

  async function handleJoin() {
    if (!userId) { signIn(); return }
    const result = await joinComunidad(id, userId)
    if (result.success) {
      setIsMember(true)
      setUserRole('member')
      const mbrs = await getComunidadMembers(id)
      setMembers(mbrs as any)
      const updated = await getComunidadById(id)
      if (updated) setComunidad(updated)
    }
  }

  async function handleLeave() {
    if (!confirm('¿Salir de esta comunidad?')) return
    const result = await leaveComunidad(id, userId!)
    if (result.success) {
      setIsMember(false)
      setUserRole(null)
      const mbrs = await getComunidadMembers(id)
      setMembers(mbrs as any)
      const updated = await getComunidadById(id)
      if (updated) setComunidad(updated)
    }
  }

  async function handleDeletePost(postId: string) {
    await deleteMuroPost(postId)
    loadPosts()
  }

  if (loading) {
    return <div className="text-center py-20 text-text-light">Cargando...</div>
  }

  if (!comunidad) {
    return (
      <div className="text-center py-20">
        <p className="text-text-light">Comunidad no encontrada</p>
        <Link href="/comunidades" className="text-primary text-sm hover:underline mt-2 inline-block">
          ← Volver a comunidades
        </Link>
      </div>
    )
  }

  const memberCount = members.length

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/comunidades"
        className="inline-flex items-center gap-1 text-xs text-text-light hover:text-primary transition-colors"
      >
        <ArrowLeft size={14} /> Todas las comunidades
      </Link>

      {/* Header */}
      <div className="bg-card rounded-xl md:rounded-2xl p-5 md:p-8 border border-gray-200/70 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shrink-0">
              <Users size={28} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-xl md:text-2xl font-bold text-primary-dark">{comunidad.name}</h1>
                {comunidad.is_public ? (
                  <Globe size={14} className="text-green-600" />
                ) : (
                  <Lock size={14} className="text-amber-600" />
                )}
              </div>
              <p className="text-text-light text-xs md:text-sm mt-1">
                {memberCount} miembro{memberCount !== 1 ? 's' : ''}
                {comunidad.category && ` · ${comunidad.category}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!userId ? (
              <button
                onClick={() => signIn()}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 active:scale-95"
              >
                <LogIn size={13} /> Unirse
              </button>
            ) : isMember ? (
              <button
                onClick={handleLeave}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-text rounded-lg text-xs font-semibold hover:bg-gray-200 active:scale-95"
              >
                <LogOut size={13} /> Salir
              </button>
            ) : (
              <button
                onClick={handleJoin}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 active:scale-95"
              >
                <UserPlus size={13} /> Unirse
              </button>
            )}
          </div>
        </div>
        {comunidad.description && (
          <p className="text-text text-xs md:text-sm mt-4 leading-relaxed">{comunidad.description}</p>
        )}
      </div>

      <div className="md:grid md:grid-cols-3 md:gap-6">
        {/* Posts */}
        <div className="md:col-span-2 space-y-4">
          {isMember && (
            <MuroForm
              onPostCreated={loadPosts}
              comunidadId={id}
            />
          )}

          {posts.length === 0 ? (
            <p className="text-center text-text-light py-8 text-xs md:text-sm">
              {isMember
                ? 'No hay publicaciones aún. ¡Sé el primero en compartir!'
                : 'Únete a esta comunidad para ver y compartir publicaciones.'}
            </p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {posts.map((post) => (
                <MuroPostCard
                  key={post.id}
                  post={post}
                  profiles={profiles}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 mt-4 md:mt-0">
          <div className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm">
            <h3 className="font-heading font-bold text-primary-dark text-sm mb-3">
              Miembros ({memberCount})
            </h3>
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.user_id} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users size={12} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/perfil/${m.user_id}`}
                      className="text-xs font-medium text-primary-dark hover:underline truncate block"
                    >
                      {m.profile?.display_name || 'Usuario'}
                    </Link>
                    {m.role !== 'member' && (
                      <span className="text-[9px] text-text-light uppercase">
                        {m.role === 'admin' ? 'Admin' : 'Moderador'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
