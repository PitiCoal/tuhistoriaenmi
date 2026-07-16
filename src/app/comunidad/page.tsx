'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { uploadFile, createMuroPost, getMuroPosts, deleteMuroPost, createMuroReply, getMuroReplies, deleteMuroReply, getAllProfiles, toggleReaction, getAllReactionCounts, getUserReactions, ensureDailyVerseMuroPost, getActivitiesWithCounts } from '@/lib/supabase';
import { getVerseOfDay } from '@/lib/verses';
import { Heart, MessageCircle, Mic, Grid3X3, Send, User, LogIn, ImageIcon, X, Trash2, Reply, Camera, Users, ArrowRight, MessageCircle as WhatsAppIcon, Smile, Sparkles, HandHeart } from 'lucide-react';
import Link from 'next/link';

type Tab = 'muro' | 'actividades';

const MURO_EMOJIS = ['🙏', '❤️', '😊', '✨'] as const;
const EMOJI_ICONS: Record<string, React.ReactNode> = {
  '🙏': <span className="text-xs select-none">🙏</span>,
  '❤️': <Heart size={12} className="text-red-500 fill-current" />,
  '😊': <Smile size={12} />,
  '✨': <Sparkles size={12} />,
};

const tabs: { id: Tab; label: string; icon: typeof Heart; desc: string }[] = [
  { id: 'muro', label: 'Muro Comunitario', icon: Grid3X3, desc: 'Comparte intenciones, oraciones, reflexiones y sugerencias.' },
  { id: 'actividades', label: 'Proyectos y Actividades', icon: Users, desc: 'Actividades disponibles para inscribirse.' },
];

export function renderContentWithBold(content: string) {
  if (!content) return '';
  // Primero dividimos por doble asterisco ** (negrita fuerte) soportando saltos de línea
  const parts = content.split(/(\*\*[\s\S]*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    // Para las partes sin **, soportamos también asterisco simple * para negrita
    const subparts = part.split(/(\*[\s\S]*?\*)/g);
    return subparts.map((subpart, subindex) => {
      if (subpart.startsWith('*') && subpart.endsWith('*')) {
        return <strong key={`${index}-${subindex}`} className="font-bold">{subpart.slice(1, -1)}</strong>;
      }
      return subpart;
    });
  });
}

export default function ComunidadPage() {
  const { user, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('muro');

  const [muroPosts, setMuroPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [muroText, setMuroText] = useState('');
  const [muroAnonymous, setMuroAnonymous] = useState(false);
  const [muroCategory, setMuroCategory] = useState<'general' | 'oracion' | 'reflexion' | 'sugerencia'>('general');
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'general' | 'oracion' | 'reflexion' | 'sugerencia'>('todos');
  const [muroImage, setMuroImage] = useState<File | null>(null);
  const [muroImagePreview, setMuroImagePreview] = useState<string | null>(null);
  const [muroUploading, setMuroUploading] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [repliesData, setRepliesData] = useState<Record<string, any[]>>({});
  const [muroReactionCounts, setMuroReactionCounts] = useState<Record<string, Record<string, number>>>({});
  const [muroUserReactions, setMuroUserReactions] = useState<Record<string, Set<string>>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // Swipe state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get('filter');
    const hash = window.location.hash.replace('#', '');
    const target = filter || hash;
    
    if (target === 'actividades') {
      setActiveTab('actividades');
    } else if (['oracion', 'reflexion', 'sugerencia', 'general'].includes(target)) {
      setActiveTab('muro');
      setSelectedFilter(target as any);
    }
  }, []);

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (user && user !== 'loading') {
      getUserReactions('muro_post', user.uid).then(reactions => {
        const map: Record<string, Set<string>> = {};
        muroPosts.forEach(p => {
          const emojis = new Set<string>();
          reactions.forEach(key => {
            if (key.startsWith(`${p.id}:`)) {
              emojis.add(key.split(':')[1]);
            }
          });
          map[p.id] = emojis;
        });
        setMuroUserReactions(map);
      }).catch(() => {});
    }
  }, [user, muroPosts]);

  useEffect(() => {
    if (activeTab === 'muro') loadMuro();
  }, [activeTab]);

  useEffect(() => {
    getActivitiesWithCounts().then(list => {
      setActivities(list);
      setActivitiesLoading(false);
    }).catch(() => setActivitiesLoading(false));
  }, []);

  async function loadMuro() {
    const verse = getVerseOfDay();
    if (verse?.verse) {
      await ensureDailyVerseMuroPost(verse.verse, verse.reference);
    }
    const posts = await getMuroPosts();
    setMuroPosts(posts);
    const all = await getAllProfiles();
    setProfiles(all);
    for (const p of posts) {
      const counts = await getAllReactionCounts('muro_post', p.id);
      setMuroReactionCounts(prev => ({ ...prev, [p.id]: counts }));
    }
    // Load reactions for guest too (empty map) or logged user
    if (user && user !== 'loading') {
      const reactions = await getUserReactions('muro_post', user.uid);
      const map: Record<string, Set<string>> = {};
      posts.forEach(p => {
        const emojis = new Set<string>();
        reactions.forEach(key => {
          if (key.startsWith(`${p.id}:`)) {
            emojis.add(key.split(':')[1]);
          }
        });
        map[p.id] = emojis;
      });
      setMuroUserReactions(map);
    }
  }

  function getUserProfile(userId: string | null) {
    if (!userId) return null;
    return profiles.find((p: any) => p.user_id === userId);
  }

  function getAuthorName(post: any) {
    if (post.author_name) return post.author_name;
    if (post.user_id) {
      const p = getUserProfile(post.user_id);
      return p?.display_name || 'Usuario';
    }
    return 'Anónimo';
  }

  function getAuthorPhoto(post: any) {
    if (post.user_id) {
      const p = getUserProfile(post.user_id);
      return p?.photo_url || null;
    }
    return null;
  }

  async function handleMuroSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || user === 'loading') return;
    if (!muroText.trim()) return;
    setMuroUploading(true);
    let imageUrl: string | null = null;
    if (muroImage) {
      imageUrl = await uploadFile('muro-images', 'posts', muroImage);
    }
    const newPost = await createMuroPost({
      user_id: muroAnonymous ? null : (user as any)?.uid || null,
      author_name: muroAnonymous ? null : null,
      content: muroText.trim(),
      image_url: imageUrl,
      category: muroCategory,
    });
    if (newPost.data) {
      setMuroPosts([newPost.data, ...muroPosts]);
    } else {
      await loadMuro();
    }
    setMuroText('');
    setMuroCategory('general');
    setMuroImage(null);
    setMuroImagePreview(null);
    setMuroUploading(false);
  }

  async function handleDeletePost(postId: string) {
    if (!confirm('¿Eliminar esta publicación?')) return;
    await deleteMuroPost(postId);
    setMuroPosts(muroPosts.filter(p => p.id !== postId));
  }

  async function handleReply(postId: string) {
    if (!user || user === 'loading') return;
    const text = replyTexts[postId]?.trim();
    if (!text) return;
    const reply = await createMuroReply({
      post_id: postId,
      user_id: (user as any)?.uid || null,
      content: text,
    });
    if (reply.data) {
      setRepliesData(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), reply.data],
      }));

      // Trigger push/email notification to post author
      const post = muroPosts.find(p => p.id === postId);
      if (post && post.user_id && post.user_id !== (user as any)?.uid) {
        fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: post.user_id,
            type: 'comments',
            senderName: (user as any)?.displayName || 'Un hermano/a',
            messageText: text,
            postId: postId,
            title: '💬 Nuevo comentario',
            body: `${(user as any)?.displayName || 'Un hermano/a'} respondió a tu publicación`,
            url: `/comunidad?post=${postId}`
          })
        }).catch(err => console.error('Error sending comment push:', err));
      }
    }
    setReplyTexts(prev => ({ ...prev, [postId]: '' }));
  }

  async function toggleReplies(postId: string) {
    if (expandedReplies[postId]) {
      setExpandedReplies(prev => ({ ...prev, [postId]: false }));
    } else {
      setExpandedReplies(prev => ({ ...prev, [postId]: true }));
      const list = await getMuroReplies(postId);
      setRepliesData(prev => ({ ...prev, [postId]: list }));
    }
  }

  async function handleMuroReact(postId: string, emoji: string) {
    if (!user || user === 'loading') {
      signIn();
      return;
    }
    const added = await toggleReaction('muro_post', postId, user.uid, emoji);
    if (added) {
      setMuroUserReactions(prev => ({ ...prev, [postId]: new Set([...(prev[postId] || []), emoji]) }));
      setMuroReactionCounts(prev => ({ ...prev, [postId]: { ...prev[postId], [emoji]: (prev[postId]?.[emoji] || 0) + 1 } }));

      // Trigger push/email notification to post author
      const post = muroPosts.find(p => p.id === postId);
      if (post && post.user_id && post.user_id !== user.uid) {
        fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: post.user_id,
            type: 'reactions',
            senderName: user.displayName || 'Un hermano/a',
            messageText: emoji,
            postId: postId,
            title: '❤️ Nueva reacción',
            body: `${user.displayName || 'Un hermano/a'} reaccionó con ${emoji} a tu publicación`,
            url: `/comunidad?post=${postId}`
          })
        }).catch(err => console.error('Error sending reaction push:', err));
      }
    } else {
      setMuroUserReactions(prev => ({ ...prev, [postId]: new Set([...(prev[postId] || new Set())].filter(e => e !== emoji)) }));
      setMuroReactionCounts(prev => ({ ...prev, [postId]: { ...prev[postId], [emoji]: Math.max(0, (prev[postId]?.[emoji] || 0) - 1) } }));
    }
  }

  function handleMuroImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setMuroImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setMuroImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function handleTouchEnd(e: React.TouchEvent) {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    const tabOrder: Tab[] = ['muro', 'actividades'];
    const idx = tabOrder.indexOf(activeTab);
    if (Math.abs(diff) > 50) {
      if (diff > 0 && idx < tabOrder.length - 1) setActiveTab(tabOrder[idx + 1]);
      else if (diff < 0 && idx > 0) setActiveTab(tabOrder[idx - 1]);
    }
  }

  if (user === 'loading') return <div className="text-center py-20 text-text-light">Cargando...</div>;

  const filteredMuroPosts = selectedFilter === 'todos'
    ? muroPosts
    : muroPosts.filter(p => (p.category || 'general') === selectedFilter);

  const tabBar = (
    <div className="bg-card rounded-xl p-1 border border-gray-200/70 shadow-md flex gap-0.5">
      {tabs.map(t => {
        const Ti = t.icon;
        return (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all active:scale-95 ${
              activeTab === t.id ? 'bg-primary text-white shadow-sm' : 'text-text-light hover:bg-gray-50'
            }`}
          ><Ti size={14} /> <span>{t.label}</span></button>
        );
      })}
    </div>
  );

  const muroContent = (
    <>
      {/* If Guest, show welcoming Call To Action box */}
      {!user ? (
        <div className="bg-card rounded-xl p-5 md:p-6 border border-primary/20 shadow-md text-center space-y-3 bg-gradient-to-br from-primary/[0.01] to-primary/[0.04]">
          <HandHeart size={32} className="mx-auto text-primary" />
          <h2 className="font-heading font-semibold text-primary-dark text-base">Únete a la conversación</h2>
          <p className="text-xs text-text-light max-w-md mx-auto leading-relaxed">
            Inicia sesión para compartir intenciones de oración, reflexionar con hermanos, sugerir invitados y participar activamente.
          </p>
          <button onClick={() => signIn()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm">
            <LogIn size={13} /> Iniciar sesión
          </button>
        </div>
      ) : (
        <form onSubmit={handleMuroSubmit} className="bg-card rounded-xl p-4 md:p-5 border border-gray-200/70 shadow-md space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-text-light uppercase tracking-wider">¿Qué deseas compartir hoy?</label>
            <textarea placeholder="Escribe tu oración, reflexión, sugerencia o saludo..." value={muroText} onChange={e => setMuroText(e.target.value)} maxLength={1000} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs md:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" required />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-text-light uppercase tracking-wider">Tipo de publicación</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'general', label: '📝 General' },
                { id: 'oracion', label: '🙏 Oración' },
                { id: 'reflexion', label: '💬 Reflexión' },
                { id: 'sugerencia', label: '🎤 Sugerencia (Pública)' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setMuroCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95 ${
                    muroCategory === cat.id
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
            <button type="button" onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-text-light hover:bg-gray-50 active:scale-95">
              <ImageIcon size={13} /> {muroImage ? 'Cambiar imagen' : 'Agregar imagen'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleMuroImageSelect} />
            
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-text-light cursor-pointer">
                <input type="checkbox" checked={muroAnonymous} onChange={e => setMuroAnonymous(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary" /> Anónimo
              </label>
              <button type="submit" disabled={!muroText.trim() || muroUploading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors active:scale-95 shadow-sm">
                <Send size={12} /> {muroUploading ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
          
          {muroImagePreview && (
            <div className="relative inline-block mt-2">
              <img src={muroImagePreview} alt="" className="h-20 rounded-lg object-cover border" />
              <button type="button" onClick={() => { setMuroImage(null); setMuroImagePreview(null); }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow shadow-red-500/30">
                <X size={10} />
              </button>
            </div>
          )}
        </form>
      )}

      {/* Filter pills bar */}
      <div className="flex flex-wrap gap-1.5 py-1">
        {[
          { id: 'todos', label: 'Todos' },
          { id: 'oracion', label: '🙏 Oraciones' },
          { id: 'reflexion', label: '💬 Reflexiones' },
          { id: 'sugerencia', label: '🎤 Sugerencias' },
          { id: 'general', label: '📝 General' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id as any)}
            className={`px-3 py-1 rounded-full text-[11px] md:text-xs font-medium border transition-all active:scale-95 ${
              selectedFilter === f.id
                ? 'bg-secondary text-white border-secondary shadow-sm'
                : 'bg-card text-text-light border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredMuroPosts.length === 0 ? (
        <p className="text-center text-text-light py-8 text-xs md:text-sm">Aún no hay publicaciones en esta categoría. Sé el primero.</p>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredMuroPosts.map(post => {
            const authorPhoto = getAuthorPhoto(post);
            const authorName = getAuthorName(post);
            const canDelete = (user as any)?.uid && post.user_id === (user as any).uid;
            const replyCount = repliesData[post.id]?.length || 0;
            const userReactionsForPost = muroUserReactions[post.id] || new Set();
            const countsForPost = muroReactionCounts[post.id] || {};

            return (
              <div key={post.id} className="bg-card rounded-xl p-4 md:p-5 border border-gray-200/70 shadow-sm space-y-3">
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
                      <Link href={post.user_id ? `/perfil/${post.user_id}` : '#'}
                        className="text-xs md:text-sm font-semibold text-primary-dark hover:underline truncate">
                        {authorName}
                      </Link>
                      {post.category && post.category !== 'general' && (
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          post.category === 'oracion' ? 'bg-red-50 text-red-600 border border-red-100' :
                          post.category === 'reflexion' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          'bg-green-50 text-green-600 border border-green-100'
                        }`}>
                          {post.category === 'oracion' ? '🙏 Oración' :
                           post.category === 'reflexion' ? '💬 Reflexión' :
                           '🎤 Sugerencia'}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-light">
                      {new Date(post.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {canDelete && (
                    <button onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 text-text-light hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <p className="text-xs md:text-sm text-text leading-relaxed whitespace-pre-wrap">{renderContentWithBold(post.content)}</p>

                {post.image_url && (
                  <img src={post.image_url} alt="" className="max-h-80 rounded-lg object-cover border w-full sm:w-auto" />
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-50">
                  {MURO_EMOJIS.map(emoji => {
                    const count = countsForPost[emoji] || 0;
                    const reacted = userReactionsForPost.has(emoji);
                    const Icon = EMOJI_ICONS[emoji];
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleMuroReact(post.id, emoji)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors active:scale-90 ${
                          reacted ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-gray-100 text-text-light hover:bg-primary/10 hover:text-primary hover:border-primary/20 border border-gray-200'
                        }`}>
                        {Icon}
                        <span className="text-[10px]">{count > 0 ? count : ''}</span>
                      </button>
                    );
                  })}
                  <button onClick={() => toggleReplies(post.id)}
                    className="inline-flex items-center gap-1 text-xs text-text-light hover:text-primary transition-colors active:scale-90 ml-auto">
                    <Reply size={12} /> {replyCount > 0 ? `${replyCount} respuestas` : 'Responder'}
                  </button>
                </div>

                {expandedReplies[post.id] && (
                  <div className="pl-4 border-l-2 border-primary/20 space-y-2 mt-3 pt-1">
                    {repliesData[post.id]?.map(reply => (
                      <div key={reply.id} className="text-xs md:text-sm flex flex-col gap-0.5 bg-gray-50/50 p-2 rounded-lg border border-gray-100/50">
                        <span className="font-semibold text-primary-dark">
                          {reply.author_name || (reply.user_id ? getUserProfile(reply.user_id)?.display_name || 'Usuario' : 'Anónimo')}
                        </span>
                        <span className="text-text">{reply.content}</span>
                      </div>
                    ))}
                    {user ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input type="text" placeholder="Escribe una respuesta..." value={replyTexts[post.id] || ''}
                          onChange={e => setReplyTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleReply(post.id)}
                          maxLength={500}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <button onClick={() => handleReply(post.id)} disabled={!replyTexts[post.id]?.trim()}
                          className="p-1.5 bg-primary text-white rounded-lg disabled:opacity-50 active:scale-90">
                          <Send size={12} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => signIn()} className="text-[11px] text-primary font-medium hover:underline flex items-center gap-1 pt-1">
                        <LogIn size={10} /> Inicia sesión para responder
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  const instagramCard = (
    <div className="bg-card rounded-xl overflow-hidden border border-gray-200/70 shadow-sm">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-32 h-24 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center">
          <Camera size={24} className="text-white/80" />
        </div>
        <div className="flex-1 p-3 flex items-center justify-between gap-2">
          <div>
            <h3 className="font-heading font-bold text-primary-dark text-sm">@tuhistoria.enmi</h3>
            <p className="text-xs text-text-light">Síguenos en Instagram</p>
          </div>
          <a href="https://instagram.com/tuhistoria.enmi" target="_blank" rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-instagram text-white rounded-lg text-xs font-semibold hover:opacity-90 active:scale-95 transition-all">
            <Camera size={12} /> Seguir
          </a>
        </div>
      </div>
    </div>
  );

  const whatsappCard = (
    <a href="https://chat.whatsapp.com/HlF62d1pyiD3Ac98Oe2EKH" target="_blank" rel="noopener noreferrer"
      className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow block active:scale-[0.98]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-whatsapp/20 flex items-center justify-center shrink-0">
          <WhatsAppIcon size={18} className="text-whatsapp" />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading font-bold text-primary-dark text-sm">WhatsApp</h3>
          <p className="text-xs text-text-light">Grupo de la comunidad</p>
        </div>
        <ArrowRight size={14} className="ml-auto text-text-light shrink-0" />
      </div>
    </a>
  );

  const perfilCard = (
    <Link href="/perfil"
      className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow block active:scale-[0.98]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User size={18} className="text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading font-bold text-primary-dark text-sm">Mi Perfil</h3>
          <p className="text-xs text-text-light">Foto, país, edad, bio</p>
        </div>
        <ArrowRight size={14} className="ml-auto text-text-light shrink-0" />
      </div>
    </Link>
  );

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Hero */}
      <div className="bg-card rounded-xl md:rounded-2xl p-5 md:p-8 border border-gray-200/70 shadow-md text-center">
        <h1 className="font-heading text-xl md:text-3xl font-bold text-primary-dark">Comunidad</h1>
        <p className="text-text-light text-xs md:text-sm mt-1">Comparte, reflexiona y construye este espacio.</p>
      </div>

      {/* User status banner */}
      {user && (
        <div className="bg-card rounded-xl p-4 md:p-5 border border-primary/20 shadow-sm bg-gradient-to-br from-primary/[0.01] to-primary/[0.04] text-center md:text-left md:flex md:items-center md:justify-between">
          <p className="text-sm text-text-light">
            Bienvenido de vuelta, <span className="font-semibold text-primary-dark">{user.displayName || ''}</span>.
          </p>
          <p className="text-xs text-text-light md:text-right italic mt-1 md:mt-0">&ldquo;Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.&rdquo;</p>
        </div>
      )}

      {/* Instagram - always visible */}
      {instagramCard}

      {/* Quote when not logged in */}
      {!user && (
        <div className="bg-card rounded-xl p-4 md:p-5 border border-gray-200/70 shadow-md text-center">
          <p className="font-heading text-sm md:text-base italic text-primary-dark">&ldquo;Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.&rdquo;</p>
        </div>
      )}

      {/* Main content: tabs + participa (Visible to everyone!) */}
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-2 space-y-4">
          {tabBar}
          
          {activeTab === 'muro' ? muroContent : (
            <div className="space-y-3">
              {activitiesLoading ? (
                <div className="text-center py-8 text-text-light">Cargando actividades...</div>
              ) : activities.length === 0 ? (
                <div className="bg-card rounded-xl p-6 md:p-8 border border-gray-200/70 shadow-md text-center space-y-3">
                  <Users size={48} className="mx-auto text-text-light" />
                  <h2 className="font-heading text-lg font-bold text-primary-dark">Sin actividades disponibles</h2>
                  <p className="text-sm text-text-light">El administrador aún no ha creado actividades.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-text-light mb-2">Actividades disponibles para inscribirse desde tu perfil</p>
                  <div className="space-y-3">
                    {activities.map(a => (
                      <div key={a.id} className="bg-card rounded-xl p-4 md:p-5 border border-gray-200/70 shadow-sm flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-primary-dark">{a.name}</h3>
                          {a.description && <p className="text-sm text-text-light line-clamp-2 mt-1">{a.description}</p>}
                          <p className="text-xs text-primary mt-1 flex items-center gap-1">
                            <Users size={10} /> {a.participants || 0} personas inscritas
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            👥 {a.participants || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Desktop sidebar */}
        <div className="hidden md:flex md:flex-col gap-4">
          {whatsappCard}
          {user && perfilCard}
        </div>
      </div>

      {/* WhatsApp on mobile */}
      <div className="md:hidden">
        {whatsappCard}
      </div>
    </div>
  );
}
