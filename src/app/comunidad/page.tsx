'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { uploadFile, createMuroPost, getMuroPosts, deleteMuroPost, createMuroReply, getMuroReplies, deleteMuroReply, getAllProfiles, toggleReaction, getAllReactionCounts, getUserReactions, ensureDailyVerseMuroPost, getActivities, getActivitiesWithCounts } from '@/lib/supabase';
import { getVerseOfDay } from '@/lib/verses';
import { Heart, MessageCircle, Mic, Grid3X3, Send, User, LogIn, ImageIcon, X, Trash2, Reply, Camera, Users, ArrowRight, MessageCircle as WhatsAppIcon, Smile, Sparkles, HandHeart } from 'lucide-react';
import Link from 'next/link';

type Tab = 'oraciones' | 'reflexiones' | 'sugerencias' | 'muro' | 'actividades';
type Entry = { id: string; tab: Tab; text: string; name: string | null; createdAt: number; reactions: number; reactedBy: string[]; };

const EMOJIS = ['🙏', '❤️', '😊', '🤗', '✨'] as const;
const EMOJI_ICONS: Record<string, React.ReactNode> = {
  '🙏': <HandHeart size={12} />,
  '❤️': <Heart size={12} className="text-red-500 fill-current" />,
  '😊': <Smile size={12} />,
  '🤗': <span role="img" aria-label="abrazo" style={{fontSize:12}}>🤗</span>,
  '✨': <Sparkles size={12} />,
};

const tabs: { id: Tab; label: string; icon: typeof Heart; placeholder?: string; desc: string }[] = [
  { id: 'oraciones', label: 'Oraciones', icon: Heart, placeholder: 'Escribe tu intención...', desc: 'Comparte una intención para que otros oren por ti.' },
  { id: 'reflexiones', label: 'Reflexiones', icon: MessageCircle, placeholder: '¿Qué te quedó dando vuelta?', desc: 'Preguntas o pensamientos.' },
  { id: 'sugerencias', label: 'Sugerencias', icon: Mic, placeholder: '¿Conoces a alguien que debería contar su historia?', desc: 'Propón invitados o temas.' },
  { id: 'muro', label: 'Muro', icon: Grid3X3, desc: 'Comparte algo con la comunidad.' },
  { id: 'actividades', label: 'Actividades', icon: Users, desc: 'Actividades disponibles para inscribirse.' },
];

export default function ComunidadPage() {
  const { user, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('oraciones');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [text, setText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState('');

  const [muroPosts, setMuroPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [muroText, setMuroText] = useState('');
  const [muroAnonymous, setMuroAnonymous] = useState(false);
  const [muroImage, setMuroImage] = useState<File | null>(null);
  const [muroImagePreview, setMuroImagePreview] = useState<string | null>(null);
  const [muroUploading, setMuroUploading] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [repliesData, setRepliesData] = useState<Record<string, any[]>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  // muro reactions: postId -> { emoji -> count }
  const [muroReactionCounts, setMuroReactionCounts] = useState<Record<string, Record<string, number>>>({});
  // muro user reactions: postId -> Set<emoji>
  const [muroUserReactions, setMuroUserReactions] = useState<Record<string, Set<string>>>({});

  // Swipe state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && tabs.some(t => t.id === hash)) setActiveTab(hash as Tab);
  }, []);

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (user && user !== 'loading') {
      getUserReactions('participa', user.uid).then(setUserReactions).catch(() => {});
      getUserReactions('muro_post', user.uid).then(reactions => {
        // reactions is a Set of "targetId:emoji" strings
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
    try { const d = localStorage.getItem('tm_participa'); if (d) setEntries(JSON.parse(d)); } catch {}
  }, []);

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
    // Load multi-emoji reaction counts for each post
    for (const p of posts) {
      const counts = await getAllReactionCounts('muro_post', p.id);
      setMuroReactionCounts(prev => ({ ...prev, [p.id]: counts }));
    }
    // Load user reactions for muro posts
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
    });
    if (newPost.data) {
      setMuroPosts([newPost.data, ...muroPosts]);
    } else {
      await loadMuro();
    }
    setMuroText('');
    setMuroImage(null);
    setMuroImagePreview(null);
    setMuroUploading(false);
  }

  async function handleDeletePost(postId: string) {
    await deleteMuroPost(postId);
    setMuroPosts(muroPosts.filter(p => p.id !== postId));
  }

  async function handleReply(postId: string) {
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
    }
    setReplyTexts(prev => ({ ...prev, [postId]: '' }));
  }

  async function loadReplies(postId: string) {
    if (repliesData[postId]) return;
    const replies = await getMuroReplies(postId);
    setRepliesData(prev => ({ ...prev, [postId]: replies }));
  }

  function toggleReplies(postId: string) {
    if (!expandedReplies[postId]) loadReplies(postId);
    setExpandedReplies(prev => ({ ...prev, [postId]: !prev[postId] }));
  }

  function handleMuroImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMuroImage(file);
    const reader = new FileReader();
    reader.onload = () => setMuroImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const entry: Entry = { id: Date.now().toString(), tab: activeTab, text: text.trim(), name: anonymous ? null : name.trim() || null, createdAt: Date.now(), reactions: 0, reactedBy: [] };
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem('tm_participa', JSON.stringify(updated));
    setText(''); setName('');
  }

  async function handleReact(entryId: string) {
    if (!user || user === 'loading') return;
    const added = await toggleReaction('participa', entryId, user.uid);
    if (added) {
      setUserReactions(prev => new Set(prev).add(entryId));
      setReactionCounts(prev => ({ ...prev, [entryId]: (prev[entryId] || 0) + 1 }));
    } else {
      setUserReactions(prev => { const n = new Set(prev); n.delete(entryId); return n; });
      setReactionCounts(prev => ({ ...prev, [entryId]: Math.max(0, (prev[entryId] || 0) - 1) }));
    }
  }

  // Emojis for muro reactions
  const MURO_EMOJIS = ['🙏', '❤️', '😊', '✨'] as const;
  const EMOJI_ICONS: Record<string, React.ReactNode> = {
    '🙏': <Heart size={12} />,
    '❤️': <Heart size={12} className="text-red-500 fill-current" />,
    '😊': <span role="img" aria-label="sonrisa">😊</span>,
    '✨': <span role="img" aria-label="brillo">✨</span>,
  };

  async function handleMuroReact(postId: string, emoji: string) {
    if (!user || user === 'loading') return;
    const added = await toggleReaction('muro_post', postId, user.uid, emoji);
    if (added) {
      setMuroUserReactions(prev => ({ ...prev, [postId]: new Set([...(prev[postId] || []), emoji]) }));
      setMuroReactionCounts(prev => ({ ...prev, [postId]: { ...prev[postId], [emoji]: (prev[postId]?.[emoji] || 0) + 1 } }));
    } else {
      setMuroUserReactions(prev => ({ ...prev, [postId]: new Set([...(prev[postId] || new Set())].filter(e => e !== emoji)) }));
      setMuroReactionCounts(prev => ({ ...prev, [postId]: { ...prev[postId], [emoji]: Math.max(0, (prev[postId]?.[emoji] || 0) - 1) } }));
    }
  }

  function handleTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function handleTouchEnd(e: React.TouchEvent) {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    const tabOrder: Tab[] = ['oraciones', 'reflexiones', 'sugerencias', 'muro', 'actividades'];
    const idx = tabOrder.indexOf(activeTab);
    if (Math.abs(diff) > 50) {
      if (diff > 0 && idx < tabOrder.length - 1) setActiveTab(tabOrder[idx + 1]);
      else if (diff < 0 && idx > 0) setActiveTab(tabOrder[idx - 1]);
    }
  }

  if (user === 'loading') return <div className="text-center py-20 text-text-light">Cargando...</div>;

  const filtered = entries.filter(e => e.tab === activeTab);
  const currentTab = tabs.find(t => t.id === activeTab)!;
  const Icon = currentTab.icon;

  const tabBar = (
    <div className="bg-card rounded-xl p-1 border border-gray-200/70 shadow-md flex gap-0.5">
      {tabs.map(t => {
        const Ti = t.icon;
        return (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 md:gap-1.5 px-2 md:px-3 py-2 md:py-2.5 rounded-lg text-[10px] md:text-sm font-medium transition-all active:scale-95 ${
              activeTab === t.id ? 'bg-primary text-white shadow-sm' : 'text-text-light'
            }`}
          ><Ti size={12} /> <span className="hidden sm:inline">{t.label}</span></button>
        );
      })}
    </div>
  );

  const muroContent = (
    <>
      {!user ? (
        <div className="bg-card rounded-xl p-6 md:p-8 border border-gray-200/70 shadow-md text-center space-y-3">
          <User size={48} className="mx-auto text-text-light" />
          <h2 className="font-heading text-lg font-bold text-primary-dark">Inicia sesión</h2>
          <p className="text-sm text-text-light">Necesitas una cuenta para participar en el Muro.</p>
          <button onClick={() => signIn()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-95">
            <LogIn size={16} /> Crear cuenta o iniciar sesión
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={handleMuroSubmit} className="bg-card rounded-xl p-4 md:p-6 border border-gray-200/70 shadow-md space-y-3">
            <textarea placeholder="Comparte algo con la comunidad..." value={muroText} onChange={e => setMuroText(e.target.value)} maxLength={1000} rows={3}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg border border-gray-200 text-xs md:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" required />
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-text-light hover:bg-gray-50 active:scale-95">
                <ImageIcon size={14} /> {muroImage ? 'Cambiar imagen' : 'Agregar imagen'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleMuroImageSelect} />
              <label className="flex items-center gap-1.5 text-xs md:text-sm text-text-light cursor-pointer ml-auto">
                <input type="checkbox" checked={muroAnonymous} onChange={e => setMuroAnonymous(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary" /> Anónimo
              </label>
            </div>
            {muroImagePreview && (
              <div className="relative inline-block">
                <img src={muroImagePreview} alt="" className="h-24 rounded-lg object-cover border" />
                <button type="button" onClick={() => { setMuroImage(null); setMuroImagePreview(null); }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X size={12} />
                </button>
              </div>
            )}
            <button type="submit" disabled={!muroText.trim() || muroUploading}
              className="inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-primary text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors active:scale-95">
              <Send size={14} /> {muroUploading ? 'Publicando...' : 'Publicar'}
            </button>
          </form>

          {muroPosts.length === 0 ? (
            <p className="text-center text-text-light py-8 md:py-12 text-xs md:text-sm">Aún no hay nada aquí. Sé el primero.</p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {muroPosts.map(post => {
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
                        <Link href={post.user_id ? `/perfil/${post.user_id}` : '#'}
                          className="text-sm font-medium text-primary-dark hover:underline truncate block">
                          {authorName}
                        </Link>
                        <p className="text-[11px] text-text-light">
                          {new Date(post.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {canDelete && (
                        <button onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-text-light hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-text leading-relaxed">{post.content}</p>

                    {post.image_url && (
                      <img src={post.image_url} alt="" className="max-h-80 rounded-lg object-cover border" />
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {MURO_EMOJIS.map(emoji => {
                        const count = countsForPost[emoji] || 0;
                        const reacted = userReactionsForPost.has(emoji);
                        const Icon = EMOJI_ICONS[emoji];
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleMuroReact(post.id, emoji)}
                            disabled={!user || typeof user === 'string'}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors active:scale-90 ${
                              reacted ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-gray-100 text-text-light hover:bg-primary/10 hover:text-primary hover:border-primary/20 border border-gray-200'
                            }`}>
                            {Icon}
                            <span className="text-[10px]">{count > 0 ? count : ''}</span>
                          </button>
                        );
                      })}
                      <button onClick={() => toggleReplies(post.id)}
                        className="inline-flex items-center gap-1 text-xs text-text-light hover:text-primary transition-colors active:scale-90">
                        <Reply size={12} /> {replyCount > 0 ? `${replyCount} respuestas` : 'Responder'}
                      </button>
                    </div>

                    {expandedReplies[post.id] && (
                      <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                        {repliesData[post.id]?.map(reply => (
                          <div key={reply.id} className="text-sm">
                            <span className="font-medium text-primary-dark">
                              {reply.author_name || (reply.user_id ? getUserProfile(reply.user_id)?.display_name || 'Usuario' : 'Anónimo')}
                            </span>
                            <span className="text-text ml-1">{reply.content}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-2">
                          <input type="text" placeholder="Escribe una respuesta..." value={replyTexts[post.id] || ''}
                            onChange={e => setReplyTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && handleReply(post.id)}
                            maxLength={500}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
                          <button onClick={() => handleReply(post.id)} disabled={!replyTexts[post.id]?.trim()}
                            className="p-1.5 bg-primary text-white rounded-lg disabled:opacity-50 active:scale-90">
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );

  const participaContent = (activeTab === 'muro' ? muroContent : activeTab === 'actividades' ? (
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
  ) : (
    <>
      {!user ? (
        <div className="bg-card rounded-xl p-6 md:p-8 border border-gray-200/70 shadow-md text-center space-y-3">
          <User size={48} className="mx-auto text-text-light" />
          <h2 className="font-heading text-lg font-bold text-primary-dark">Inicia sesión</h2>
          <p className="text-sm text-text-light">Necesitas una cuenta para compartir oraciones, reflexiones y sugerencias.</p>
          <button onClick={() => signIn()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-95">
            <LogIn size={16} /> Crear cuenta o iniciar sesión
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 md:p-6 border border-gray-200/70 shadow-md space-y-3 md:space-y-4">
            <p className="text-xs md:text-sm text-text-light">{currentTab.desc}</p>
            <textarea placeholder={currentTab.placeholder} value={text} onChange={e => setText(e.target.value)} maxLength={500} rows={3}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg border border-gray-200 text-xs md:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" required />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs md:text-sm text-text-light cursor-pointer">
                <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary" /> Anónimo
              </label>
              {!anonymous && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <User size={14} className="text-text-light shrink-0" />
                  <input type="text" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} maxLength={50}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-lg border border-gray-200 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              )}
            </div>
            <button type="submit" disabled={!text.trim()}
              className="inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-primary text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors active:scale-95">
              <Send size={14} /> Publicar
            </button>
          </form>

          {filtered.length === 0 ? (
            <p className="text-center text-text-light py-8 md:py-12 text-xs md:text-sm">Aún no hay nada aquí. Sé el primero.</p>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {filtered.map(e => {
                const prayed = userReactions.has(e.id);
                const count = reactionCounts[e.id] ?? e.reactions;
                return (
                  <div key={e.id} className="bg-card rounded-xl p-4 md:p-5 border border-gray-200/70 shadow-sm space-y-1.5 md:space-y-2">
                    <p className="text-xs md:text-sm text-text leading-relaxed">{e.text}</p>
                    <div className="flex items-center justify-between text-[11px] md:text-sm text-text-light">
                      <span className="flex items-center gap-1"><User size={12} /> {e.name || 'Anónimo'}</span>
                      <button onClick={() => handleReact(e.id)}
                        className={`inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium transition-colors active:scale-90 ${
                          prayed ? 'bg-primary/10 text-primary' : 'bg-gray-100 hover:bg-primary/10 hover:text-primary'
                        }`}>
                        🙏 {count > 0 ? count : 'Rezar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  ));

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

      {/* User status */}
      {!user ? (
        <div className="bg-card rounded-xl md:rounded-2xl p-6 md:p-10 border border-primary/20 shadow-md text-center space-y-4 bg-gradient-to-br from-primary/[0.03] to-primary/[0.07]">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
            <Users size={28} className="text-white" />
          </div>
          <h2 className="font-heading text-xl md:text-2xl font-bold text-primary-dark">
            Sé parte de esta comunidad
          </h2>
          <p className="text-sm md:text-base text-text-light leading-relaxed max-w-md mx-auto">
            Crea tu cuenta para compartir oraciones, dejar tus reflexiones, participar en el Muro y conectar con otros.
          </p>
          <button onClick={() => signIn()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-colors shadow-md">
            <LogIn size={16} /> Crear cuenta gratis
          </button>
          <p className="text-xs text-text-light/60">Solo con tu correo de Google</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl p-4 md:p-5 border border-primary/20 shadow-sm bg-gradient-to-br from-primary/[0.02] to-primary/[0.06] text-center md:text-left md:flex md:items-center md:justify-between">
          <p className="text-sm text-text-light">
            Bienvenido de vuelta. <span className="font-semibold text-primary-dark">{user.displayName || ''}</span>
          </p>
          <p className="text-xs text-text-light md:text-right">&ldquo;Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.&rdquo;</p>
        </div>
      )}

      {/* Instagram - always visible */}
      {instagramCard}

      {/* Quote when not logged in */}
      {!user && (
        <div className="bg-card rounded-xl p-5 md:p-6 border border-gray-200/70 shadow-md text-center">
          <p className="font-heading text-base md:text-lg italic text-primary-dark">&ldquo;Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.&rdquo;</p>
        </div>
      )}

      {/* Main content: tabs + participa (only if logged in) */}
      {user && (
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-2 space-y-4">
            {tabBar}
            {participaContent}
          </div>

          {/* Desktop sidebar */}
          <div className="hidden md:flex md:flex-col gap-4">
            {whatsappCard}
            {perfilCard}
          </div>
        </div>
      )}

      {/* WhatsApp on mobile - only if logged in */}
      {user && (
        <div className="md:hidden">
          {whatsappCard}
        </div>
      )}
    </div>
  );
}
