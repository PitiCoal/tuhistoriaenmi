'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
  getProfile, upsertProfile, uploadFile, getUserActivities, setUserActivities, getActivities,
  getNotificationPreferences, saveNotificationPreferences,
  getMuroPostsByUser, getTestimoniosByUser, deleteAllUserData,
  getMuroRepliesByUser, getDevotionalRepliesByUser, deleteDevotionalReply, deleteMuroPost, deleteMuroReply,
  getPersonalJournal, createJournalEntry, deleteJournalEntry,
  joinActivity, leaveActivity,

} from '@/lib/supabase';
import {
  User, Camera, Save, LogIn, Shield, FolderKanban, Mic, Image as ImageIcon,
  MessageSquare, Handshake, ArrowRight, CheckCircle, AlertCircle, MessageCircle,
  Bell, FileText, Trash2, AlertTriangle, Heart, Sparkles, Megaphone, BookOpen,
} from 'lucide-react';

import Link from 'next/link';

type ProfileTab = 'perfil' | 'publicaciones' | 'diario';

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PerfilPage() {
  const { user, signIn, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('perfil');
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [testimonio, setTestimonio] = useState('');
  const [activitiesOptions, setActivitiesOptions] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({ daily_verse: true, daily_phrase: true, comments: true, reactions: true, announcements: true });
  const [savingNotif, setSavingNotif] = useState(false);

  // My publications
  const [muroPosts, setMuroPosts] = useState<any[]>([]);
  const [muroComments, setMuroComments] = useState<any[]>([]);
  const [testimoniosList, setTestimoniosList] = useState<any[]>([]);
  const [loadingPubs, setLoadingPubs] = useState(false);

  const [savingActivity, setSavingActivity] = useState<string | null>(null);


  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // My diary & Personal Journal states
  const [devotionalReplies, setDevotionalReplies] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [journalText, setJournalText] = useState('');
  const [savingJournal, setSavingJournal] = useState(false);
  const [loadingDiario, setLoadingDiario] = useState(false);
  const [diaryFeedback, setDiaryFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const userId = user && user !== 'loading' ? (user as any).uid : null;

  // Load diary/journal data when activeTab becomes 'diario' or user logs in
  useEffect(() => {
    if (activeTab !== 'diario' || !userId) return;

    let localEntries: any[] = [];
    try {
      const saved = localStorage.getItem('tg_local_journal');
      if (saved) localEntries = JSON.parse(saved);
    } catch (e) {
      console.error('Error loading local journal:', e);
    }

    setLoadingDiario(true);
    Promise.all([
      getPersonalJournal(userId),
      getDevotionalRepliesByUser(userId)
    ]).then(([journal, devReplies]) => {
      setJournalEntries([...localEntries, ...journal]);
      setDevotionalReplies(devReplies);
      setLoadingDiario(false);
    }).catch(err => {
      console.error('Error loading diary/journal data:', err);
      setJournalEntries(localEntries);
      setLoadingDiario(false);
    });
  }, [userId, activeTab]);

  async function handleSaveJournalEntry(e: React.FormEvent) {
    e.preventDefault();
    const text = journalText.trim();
    if (!text) return;
    setSavingJournal(true);
    setDiaryFeedback(null);

    if (!userId) {
      try {
        const newEntry = {
          id: 'local_' + Date.now(),
          content: text,
          created_at: new Date().toISOString(),
          is_local: true
        };
        const saved = localStorage.getItem('tg_local_journal');
        const list = saved ? JSON.parse(saved) : [];
        list.unshift(newEntry);
        localStorage.setItem('tg_local_journal', JSON.stringify(list));
        
        setJournalEntries(prev => [newEntry, ...prev]);
        setJournalText('');
        setDiaryFeedback({ ok: true, msg: 'Entrada guardada localmente' });
        setTimeout(() => setDiaryFeedback(null), 3000);
      } catch (err: any) {
        setDiaryFeedback({ ok: false, msg: `Error al guardar localmente: ${err.message}` });
      } finally {
        setSavingJournal(false);
      }
      return;
    }

    try {
      const { data, error } = await createJournalEntry(userId, text);
      if (error) {
        setDiaryFeedback({ ok: false, msg: `Error al guardar en la nube: ${error.message}` });
      } else if (data) {
        setJournalEntries(prev => [data, ...prev]);
        setJournalText('');
        setDiaryFeedback({ ok: true, msg: 'Entrada guardada en tu diario (Nube)' });
        setTimeout(() => setDiaryFeedback(null), 3000);
      }
    } catch (err: any) {
      setDiaryFeedback({ ok: false, msg: `Error: ${err.message}` });
    } finally {
      setSavingJournal(false);
    }
  }

  async function handleDeleteJournalEntry(id: string) {
    if (!confirm('¿Eliminar esta entrada de tu diario personal?')) return;
    if (String(id).startsWith('local_')) {
      try {
        const saved = localStorage.getItem('tg_local_journal');
        if (saved) {
          const list = JSON.parse(saved);
          const filtered = list.filter((item: any) => item.id !== id);
          localStorage.setItem('tg_local_journal', JSON.stringify(filtered));
        }
        setJournalEntries(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error('Error deleting local entry:', err);
      }
      return;
    }

    const { error } = await deleteJournalEntry(id);
    if (error) {
      alert(`Error al eliminar: ${error.message}`);
    } else {
      setJournalEntries(prev => prev.filter(item => item.id !== id));
    }
  }

  async function handleDeleteDiaryEntry(entryId: string) {
    if (!confirm('¿Eliminar esta reflexión de tu diario?')) return;
    const { error } = await deleteDevotionalReply(entryId);
    if (error) {
      alert(`Error al eliminar: ${error.message}`);
    } else {
      setDevotionalReplies(prev => prev.filter(e => e.id !== entryId));
    }
  }

  useEffect(() => {
    if (!userId || !user || user === 'loading') return;
    setEmail((user as any).email || '');
    getProfile(userId).then(p => {
      if (p) {
        setProfile(p);
        setDisplayName(p.display_name || (user as any).displayName || '');
        setDateOfBirth(p.date_of_birth || '');
        setPhone(p.phone || '');
        setCountry(p.country || '');
        setCity(p.city || '');
        setBio(p.bio || '');
        setTestimonio(p.testimonio || '');
      } else {
        setDisplayName((user as any).displayName || '');
      }
    });
    getUserActivities(userId).then(setSelectedActivities);
    getActivities(true).then(list => setActivitiesOptions(list.map((a: any) => a.name)));
    getNotificationPreferences(userId).then(prefs => setNotifPrefs({
      daily_verse: prefs.daily_verse ?? true,
      daily_phrase: prefs.daily_phrase ?? true,
      comments: prefs.comments ?? true,
      reactions: prefs.reactions ?? true,
      announcements: prefs.announcements ?? true,
    }));
  }, [userId]);

  useEffect(() => {
    if (activeTab !== 'publicaciones' || !userId) return;
    setLoadingPubs(true);
    Promise.all([
      getMuroPostsByUser(userId),
      getMuroRepliesByUser(userId),
      getTestimoniosByUser(userId),
    ]).then(([posts, comments, tList]) => {
      setMuroPosts(posts);
      setMuroComments(comments);
      setTestimoniosList(tList);
      setLoadingPubs(false);
    }).catch(err => {
      console.error('Error loading publications:', err);
      setLoadingPubs(false);
    });
  }, [activeTab, userId]);



  async function toggleActivity(a: string) {
    if (!userId) return;
    setSavingActivity(a);
    const next = new Set(selectedActivities);
    if (next.has(a)) {
      next.delete(a);
      setSelectedActivities(next);
      await leaveActivity(userId, a);
    } else {
      next.add(a);
      setSelectedActivities(next);
      await joinActivity(userId, a);
    }
    setSavingActivity(null);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    setFeedback(null);
    const url = await uploadFile('profile-photos', userId, file);
    if (url) {
      setProfile((p: any) => ({ ...p, photo_url: url }));
      const { error } = await upsertProfile({ user_id: userId, photo_url: url });
      setFeedback(error ? { ok: false, msg: 'Error al guardar la foto' } : { ok: true, msg: 'Foto actualizada' });
    } else {
      setFeedback({ ok: false, msg: 'Error al subir la imagen' });
    }
    setUploading(false);
  }

  function validate(): string[] {
    const errors: string[] = [];
    if (!displayName.trim()) errors.push('El nombre es obligatorio');
    if (!dateOfBirth) errors.push('La fecha de nacimiento es obligatoria');
    if (dateOfBirth && calculateAge(dateOfBirth) < 18) errors.push('Debes tener al menos 18 años para usar esta plataforma');
    if (!country.trim()) errors.push('El país es obligatorio');
    if (!city.trim()) errors.push('La ciudad es obligatoria');
    return errors;
  }

  async function handleDeletePost(postId: string) {
    if (!confirm('¿Eliminar esta publicación del muro?')) return;
    await deleteMuroPost(postId);
    setMuroPosts(prev => prev.filter(p => p.id !== postId));
  }

  async function handleDeleteComment(replyId: string) {
    if (!confirm('¿Eliminar este comentario del muro?')) return;
    await deleteMuroReply(replyId);
    setMuroComments(prev => prev.filter(c => c.id !== replyId));
  }



  async function handleSave() {
    if (!userId) return;
    const errors = validate();
    setValidationErrors(errors);
    if (errors.length > 0) return;
    setSaving(true);
    setFeedback(null);
    const { error } = await upsertProfile({
      user_id: userId,
      display_name: displayName.trim(),
      email,
      photo_url: profile?.photo_url || undefined,
      date_of_birth: dateOfBirth || undefined,
      phone: phone.trim() || undefined,
      country: country.trim(),
      city: city.trim(),
      bio: bio.trim() || undefined,
      testimonio: testimonio.trim() || undefined,
    });
    if (error) { setFeedback({ ok: false, msg: 'Error al guardar: ' + error.message }); setSaving(false); return; }
    setFeedback({ ok: true, msg: 'Perfil guardado correctamente' });
    setProfile((p: any) => ({ ...p, display_name: displayName.trim() }));
    setSaving(false);
  }

  async function handleSaveNotif() {
    if (!userId) return;
    setSavingNotif(true);
    await saveNotificationPreferences(userId, notifPrefs);
    setSavingNotif(false);
    setFeedback({ ok: true, msg: 'Preferencias de notificaciones guardadas' });
    setTimeout(() => setFeedback(null), 3000);
  }

  async function handleDeleteAccount() {
    if (!userId) return;
    setDeleting(true);
    await deleteAllUserData(userId);
    await signOut();
    setDeleting(false);
    setShowDeleteModal(false);
  }

  if (user === 'loading') return <div className="text-center py-20 text-text-light">Cargando...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <User size={48} className="mx-auto text-text-light" />
        <h1 className="font-heading text-2xl font-bold text-primary-dark">Inicia sesión</h1>
        <p className="text-text-light text-sm">Necesitas iniciar sesión para tener un perfil.</p>
        <button onClick={() => signIn()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-95">
          <LogIn size={16} /> Iniciar sesión
        </button>
      </div>
    );
  }

  const fbUser = user as any;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 bg-card rounded-xl p-1 border border-gray-200/70 shadow-sm">
        <button onClick={() => setActiveTab('perfil')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'perfil' ? 'bg-primary text-white shadow' : 'text-text-light hover:text-primary'}`}>
          Mi Perfil
        </button>
        <button onClick={() => setActiveTab('diario')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'diario' ? 'bg-primary text-white shadow' : 'text-text-light hover:text-primary'}`}>
          Mi Diario
        </button>
        <button onClick={() => setActiveTab('publicaciones')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'publicaciones' ? 'bg-primary text-white shadow' : 'text-text-light hover:text-primary'}`}>
          Mis Publicaciones
        </button>
      </div>

      {/* Feedback global */}
      {feedback && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${
          feedback.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {feedback.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {feedback.msg}
        </div>
      )}

      {/* ============ TAB: MI PERFIL ============ */}
      {activeTab === 'perfil' && (
        <>
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-gray-200/70 shadow-md space-y-6">
            <h1 className="font-heading text-2xl font-bold text-primary-dark">Mi Perfil</h1>

            {/* Foto */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {profile?.photo_url ? (
                  <img src={profile.photo_url} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-primary/20" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <User size={36} className="text-primary" />
                  </div>
                )}
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow hover:bg-primary/90 disabled:opacity-50 active:scale-90">
                  <Camera size={14} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </div>
              {uploading && <p className="text-xs text-text-light">Subiendo imagen...</p>}
            </div>

            {/* Validation errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2.5 space-y-1">
                {validationErrors.map((e, i) => (
                  <p key={i} className="text-sm flex items-center gap-1.5"><AlertCircle size={14} /> {e}</p>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-light mb-1">Nombre *</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={60}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-light mb-1">Email</label>
                <input type="email" value={email} readOnly
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-text-light cursor-not-allowed" />
                <p className="text-[10px] text-text-light/60 mt-0.5">Sincronizado con tu cuenta de Google</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-light mb-1">Fecha de nacimiento * <span className="text-text-light/60">(+18 años)</span></label>
                  <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-light mb-1">Teléfono</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} maxLength={20}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="+56 9 1234 5678" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-light mb-1">País *</label>
                  <input type="text" value={country} onChange={e => setCountry(e.target.value)} maxLength={50}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Chile" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-light mb-1">Ciudad *</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} maxLength={50}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Santiago" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-light mb-1">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={300} rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Cuéntanos de ti..." />
                <p className="text-xs text-text-light/60 mt-1">{bio.length}/300</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-light mb-1">Tu testimonio <span className="text-text-light/60">(visible en la comunidad)</span></label>
                <textarea value={testimonio} onChange={e => setTestimonio(e.target.value)} maxLength={500} rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="¿Cómo has visto actuar a Dios en tu vida? Tu historia puede inspirar a otros..." />
                <p className="text-xs text-text-light/60 mt-1">{testimonio.length}/500</p>
              </div>


              {/* Actividades */}
              {activitiesOptions.length > 0 && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-text-light mb-0.5">
                      ¿A qué actividades o eventos te gustaría participar?
                    </label>
                    <p className="text-[10px] text-text-light/50">Tu selección se guarda automáticamente al hacer clic.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {activitiesOptions.map(a => {
                      const isSelected = selectedActivities.has(a);
                      const isSaving = savingActivity === a;
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => toggleActivity(a)}
                          disabled={!!savingActivity}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all active:scale-[0.99] text-left ${
                            isSelected
                              ? 'bg-primary/10 border-primary/30 text-primary-dark font-medium'
                              : 'bg-card border-gray-200 text-text-light hover:border-primary/20 hover:bg-primary/5'
                          }`}
                        >
                          <span>{a}</span>
                          <span className={`text-[10px] font-bold ml-2 shrink-0 ${isSelected ? 'text-primary' : 'text-text-light/40'}`}>
                            {isSaving ? '⏳ Guardando...' : isSelected ? '✓ Inscrito' : '+ Inscribirme'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Preferencias de notificaciones */}
              <div className="border-t border-gray-100 pt-5 space-y-4">
                <div className="flex items-center gap-1.5">
                  <Bell size={15} className="text-primary" />
                  <h3 className="text-xs font-semibold text-primary-dark">Preferencias de Alertas</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'daily_verse', label: 'Versículo del día', desc: 'Alertas del versículo matutino' },
                    { key: 'comments', label: 'Comentarios', desc: 'Respuestas a tus posts en el muro' },
                    { key: 'reactions', label: 'Reacciones', desc: 'Notificaciones de corazones o rezos' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between gap-3 py-1 text-xs">
                      <div>
                        <span className="font-semibold text-text-light">{label}</span>
                        <p className="text-[10px] text-text-light/50">{desc}</p>
                      </div>
                      <div
                        onClick={() => setNotifPrefs(p => {
                          const updated = { ...p, [key]: !p[key as keyof typeof p] };
                          saveNotificationPreferences(userId, updated); // Guardar de forma inmediata al hacer clic
                          return updated;
                        })}
                        className={`relative w-8 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${
                          notifPrefs[key as keyof typeof notifPrefs] ? 'bg-primary' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          notifPrefs[key as keyof typeof notifPrefs] ? 'translate-x-3.5' : 'translate-x-0.5'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors active:scale-95">
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar perfil'}
            </button>
          </div>

          {/* ─── Nota privacidad ─── */}
          <div className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm">
            <p className="text-xs text-text-light text-center">
              Tu perfil es visible para otros usuarios de la comunidad.{' '}
              <Link href="/privacidad" className="text-primary underline">Política de Privacidad</Link>
              {' · '}
              <Link href="/terminos" className="text-primary underline">Términos de Uso</Link>
            </p>
          </div>

          {/* ─── Admin shortcut ─── */}
          {['piti.coal@gmail.com', 'contacto.tuhistoriaenmi@gmail.com'].includes(fbUser.email || '') && (
            <div className="bg-card rounded-2xl p-6 md:p-8 border border-primary/20 shadow-md space-y-4 bg-gradient-to-br from-primary/[0.02] to-primary/[0.06]">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-primary" />
                <h2 className="font-heading text-xl font-bold text-primary-dark">Administración</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { href: '/admin/proyectos', icon: FolderKanban, label: 'Proyectos' },
                  { href: '/admin/proyectos', icon: Mic, label: 'Episodios' },
                  { href: '/admin/proyectos', icon: ImageIcon, label: 'Inicio' },
                  { href: '/admin/proyectos', icon: MessageSquare, label: 'Participa' },
                  { href: '/admin/proyectos', icon: Handshake, label: 'Auspiciadores' },
                ].map(({ href, icon: Icon, label }) => (
                  <Link key={label} href={href}
                    className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow space-y-2 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <span className="text-xs font-medium text-primary-dark">{label}</span>
                  </Link>
                ))}
              </div>
              <Link href="/admin/proyectos"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors w-full justify-center">
                Ir al panel completo <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* ─── Zona peligrosa: Eliminar cuenta ─── */}
          <div className="bg-card rounded-xl p-5 border border-red-200/70 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <h3 className="font-semibold text-red-700 text-sm">Zona de riesgo</h3>
            </div>
            <p className="text-xs text-text-light leading-relaxed">
              Eliminar tu cuenta borrará permanentemente tu perfil, publicaciones, reacciones, testimonios y todos tus datos. Esta acción es <strong>irreversible</strong>.
            </p>
            <button onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
              <Trash2 size={14} /> Eliminar mi cuenta y datos
            </button>
          </div>
        </>
      )}



      {/* ============ TAB: MIS PUBLICACIONES ============ */}
      {activeTab === 'publicaciones' && (
        <div className="space-y-6">
          {loadingPubs ? (
            <p className="text-center text-text-light py-10">Cargando publicaciones...</p>
          ) : (
            <>
              {/* Posts del muro */}
              <section className="bg-card rounded-2xl p-5 md:p-6 border border-gray-200/70 shadow-md space-y-4">
                <h2 className="font-heading text-lg font-bold text-primary-dark flex items-center gap-2">
                  <MessageCircle size={18} className="text-primary" /> Mis Publicaciones en el Muro
                </h2>
                {muroPosts.length === 0 ? (
                  <p className="text-xs text-text-light">Aún no has creado publicaciones en el muro.</p>
                ) : (
                  <div className="space-y-3">
                    {muroPosts.map(post => (
                      <div key={post.id} className="bg-gray-50 rounded-xl p-4 border border-gray-150 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-xs md:text-sm text-text leading-relaxed line-clamp-3">{post.content}</p>
                          <p className="text-[10px] text-text-light">
                            {new Date(post.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <button onClick={() => handleDeletePost(post.id)} className="p-1 text-text-light hover:text-red-500 transition-colors shrink-0" title="Eliminar publicación">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Comentarios del muro */}
              <section className="bg-card rounded-2xl p-5 md:p-6 border border-gray-200/70 shadow-md space-y-4">
                <h2 className="font-heading text-lg font-bold text-primary-dark flex items-center gap-2">
                  <MessageSquare size={18} className="text-primary" /> Mis Comentarios en el Muro
                </h2>
                {muroComments.length === 0 ? (
                  <p className="text-xs text-text-light">Aún no has comentado en ninguna publicación.</p>
                ) : (
                  <div className="space-y-3">
                    {muroComments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 rounded-xl p-4 border border-gray-150 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-xs md:text-sm text-text leading-relaxed line-clamp-3">{comment.content}</p>
                          <p className="text-[10px] text-text-light">
                            {new Date(comment.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <button onClick={() => handleDeleteComment(comment.id)} className="p-1 text-text-light hover:text-red-500 transition-colors shrink-0" title="Eliminar comentario">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Testimonios enviados */}
              <section className="bg-card rounded-2xl p-5 md:p-6 border border-gray-200/70 shadow-md space-y-4">
                <h2 className="font-heading text-lg font-bold text-primary-dark flex items-center gap-2">
                  <FileText size={18} className="text-primary" /> Testimonios Enviados
                </h2>
                {testimoniosList.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-text-light">Aún no has enviado ningún testimonio.</p>
                    <Link href="/testimonio" className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                      Compartir mi historia <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testimoniosList.map(t => (
                      <div key={t.id} className="bg-gray-50 rounded-xl p-4 border border-gray-150 space-y-1">
                        <p className="text-xs md:text-sm text-text leading-relaxed line-clamp-3">{t.message}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${t.public ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {t.public ? 'Aprobado' : 'Pendiente de revisión'}
                          </span>
                          <p className="text-xs text-text-light">
                            {new Date(t.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      )}

      {/* ============ TAB: MI DIARIO ============ */}
      {activeTab === 'diario' && (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl p-6 border border-gray-200/70 shadow-md space-y-4 bg-gradient-to-br from-primary/[0.01] to-secondary/[0.03]">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              <h2 className="font-heading text-lg font-bold text-primary-dark">Mi Diario Personal</h2>
            </div>
            <p className="text-xs md:text-sm text-text-light leading-relaxed">
              Este es tu rincón íntimo de intimidad con Dios. Escribe tus pensamientos, oraciones, notas y reflexiones del día. Todo lo que escribas aquí es completamente privado y solo visible para ti.
            </p>

            <form onSubmit={handleSaveJournalEntry} className="space-y-3 pt-2">
              <textarea
                placeholder="Querido Señor, hoy quiero entregarte..."
                value={journalText}
                onChange={e => setJournalText(e.target.value)}
                rows={5}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-xs md:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white shadow-inner leading-relaxed"
                required
              />
              {diaryFeedback && (
                <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  diaryFeedback.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {diaryFeedback.msg}
                </div>
              )}
              <button
                type="submit"
                disabled={savingJournal || !journalText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs md:text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-primary/20"
              >
                <Save size={14} /> {savingJournal ? 'Guardando...' : 'Guardar en mi diario'}
              </button>
            </form>
          </div>

          {loadingDiario ? (
            <div className="text-center py-12 text-xs text-text-light flex flex-col items-center justify-center gap-2">
              <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Cargando tu diario...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bitácora Personal */}
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-primary-dark text-sm flex items-center gap-2 px-1">
                  ✍️ Mis Notas y Oraciones Privadas
                </h3>
                {journalEntries.length === 0 ? (
                  <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-sm text-center">
                    <p className="text-xs text-text-light">Aún no has escrito notas personales. Comienza redactando tu primera entrada arriba.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {journalEntries.map(entry => (
                      <div key={entry.id} className="bg-card rounded-xl p-4 md:p-5 border border-gray-200/70 shadow-sm space-y-2 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            {entry.is_local && (
                              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[8px] font-bold">Local</span>
                            )}
                            {new Date(entry.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button onClick={() => handleDeleteJournalEntry(entry.id)} className="p-1 text-text-light hover:text-red-500 transition-colors shrink-0" title="Eliminar entrada">
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <p className="text-xs md:text-sm text-text leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Devocionales contestados */}
              {devotionalReplies.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-heading font-bold text-primary-dark text-sm flex items-center gap-2 px-1">
                    🕊️ Mis Respuestas a Devocionales
                  </h3>
                  <div className="space-y-3">
                    {devotionalReplies.map(entry => (
                      <div key={entry.id} className="bg-card rounded-xl p-4 md:p-5 border border-gray-200/70 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                              {new Date(entry.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <h4 className="font-heading font-semibold text-primary-dark text-xs md:text-sm">
                              Devocional: {entry.devotionals?.title || 'Devocional Diario'}
                            </h4>
                          </div>
                          <button onClick={() => handleDeleteDiaryEntry(entry.id)} className="p-1 text-text-light hover:text-red-500 transition-colors shrink-0" title="Eliminar reflexión">
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {entry.devotionals?.verse && (
                          <blockquote className="bg-gray-50 border-l-4 border-primary/20 px-3 py-1.5 text-[11px] text-text-light italic rounded-r-lg leading-relaxed">
                            &ldquo;{entry.devotionals.verse}&rdquo;
                            <span className="block text-[9px] font-medium text-text-light/70 mt-0.5">— {entry.devotionals.reference}</span>
                          </blockquote>
                        )}

                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-text-light/60 uppercase tracking-wider">Mi Reflexión</span>
                          <p className="text-xs md:text-sm text-text leading-relaxed whitespace-pre-wrap">{entry.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal eliminar cuenta */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="font-heading text-xl font-bold text-gray-900">¿Eliminar tu cuenta?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Se eliminarán permanentemente tu perfil, publicaciones, reacciones, testimonios y todos tus datos. <strong>Esta acción no se puede deshacer.</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} disabled={deleting}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={handleDeleteAccount} disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                {deleting ? 'Eliminando...' : 'Sí, eliminar todo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
