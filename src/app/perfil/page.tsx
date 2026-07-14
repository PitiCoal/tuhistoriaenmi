'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getProfile, upsertProfile, uploadFile, getUserActivities, setUserActivities, getActivities } from '@/lib/supabase';
import { User, Camera, Save, LogIn, Shield, FolderKanban, Mic, Image as ImageIcon, MessageSquare, Handshake, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PerfilPage() {
  const { user, signIn } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [activitiesOptions, setActivitiesOptions] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || user === 'loading') return;
    setEmail(user.email || '');
    getProfile(user.uid).then(p => {
      if (p) {
        setProfile(p);
        setDisplayName(p.display_name || user.displayName || '');
        setDateOfBirth(p.date_of_birth || '');
        setPhone(p.phone || '');
        setCountry(p.country || '');
        setCity(p.city || '');
        setBio(p.bio || '');
      } else {
        setDisplayName(user.displayName || '');
      }
    });
    getUserActivities(user.uid).then(setSelectedActivities);
    getActivities(true).then(list => setActivitiesOptions(list.map((a: any) => a.name)));
  }, [user]);

  function toggleActivity(a: string) {
    setSelectedActivities(prev => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a); else next.add(a);
      return next;
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user || user === 'loading') return;
    setUploading(true);
    setFeedback(null);
    const url = await uploadFile('profile-photos', user.uid, file);
    if (url) {
      setProfile((p: any) => ({ ...p, photo_url: url }));
      const { error } = await upsertProfile({ user_id: user.uid, photo_url: url });
      if (error) {
        setFeedback({ ok: false, msg: 'Error al guardar la foto: ' + error.message });
      } else {
        setFeedback({ ok: true, msg: 'Foto actualizada correctamente' });
      }
    } else {
      setFeedback({ ok: false, msg: 'Error al subir la imagen' });
    }
    setUploading(false);
  }

  function validate(): string[] {
    const errors: string[] = [];
    if (!displayName.trim()) errors.push('El nombre es obligatorio');
    if (!dateOfBirth) errors.push('La fecha de nacimiento es obligatoria');
    if (!country.trim()) errors.push('El país es obligatorio');
    if (!city.trim()) errors.push('La ciudad es obligatoria');
    return errors;
  }

  async function handleSave() {
    if (!user || user === 'loading') return;
    const errors = validate();
    setValidationErrors(errors);
    if (errors.length > 0) return;

    setSaving(true);
    setFeedback(null);
    const { error } = await upsertProfile({
      user_id: user.uid,
      display_name: displayName.trim(),
      email: email,
      photo_url: profile?.photo_url || undefined,
      date_of_birth: dateOfBirth || undefined,
      phone: phone.trim() || undefined,
      country: country.trim(),
      city: city.trim(),
      bio: bio.trim() || undefined,
    });
    if (error) {
      setFeedback({ ok: false, msg: 'Error al guardar: ' + error.message });
      setSaving(false);
      return;
    }
    await setUserActivities(user.uid, [...selectedActivities]);
    setFeedback({ ok: true, msg: 'Perfil guardado correctamente' });
    setProfile((p: any) => ({ ...p, display_name: displayName.trim() }));
    setSaving(false);
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

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-card rounded-2xl p-6 md:p-8 border border-gray-200/70 shadow-md space-y-6">
        <h1 className="font-heading text-2xl font-bold text-primary-dark">Mi Perfil</h1>

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

        {feedback && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${
            feedback.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {feedback.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {feedback.msg}
          </div>
        )}

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
            <p className="text-[10px] text-text-light/60 mt-0.5">Correo sincronizado con tu cuenta de Google</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-light mb-1">Fecha de nacimiento *</label>
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

          <div className="border-t border-gray-100 pt-4">
            <label className="block text-xs font-medium text-text-light mb-3">
              ¿A qué actividades o eventos te gustaría participar?
            </label>
            {activitiesOptions.length === 0 ? (
              <p className="text-xs text-text-light/60 italic">El administrador aún no ha definido actividades disponibles.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {activitiesOptions.map(a => (
                  <label key={a}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                      selectedActivities.has(a)
                        ? 'bg-primary/10 border-primary/30 text-primary-dark font-medium'
                        : 'bg-card border-gray-200 text-text-light hover:border-gray-300'
                    }`}>
                    <input type="checkbox" checked={selectedActivities.has(a)} onChange={() => toggleActivity(a)}
                      className="accent-primary" />
                    {a}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors active:scale-95">
          <Save size={16} /> {saving ? 'Guardando...' : 'Guardar perfil'}
        </button>
      </div>

      <div className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm">
        <p className="text-xs text-text-light text-center">
          Tu perfil es visible para otros usuarios de la comunidad.
        </p>
      </div>

      {user.email === 'piti.coal@gmail.com' && (
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-primary/20 shadow-md space-y-4 bg-gradient-to-br from-primary/[0.02] to-primary/[0.06]">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            <h2 className="font-heading text-xl font-bold text-primary-dark">Administración</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/admin/proyectos"
              className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><FolderKanban size={18} className="text-primary" /></div>
              <span className="text-xs font-medium text-primary-dark">Proyectos</span>
            </Link>
            <Link href="/admin/proyectos"
              className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><Mic size={18} className="text-primary" /></div>
              <span className="text-xs font-medium text-primary-dark">Episodios</span>
            </Link>
            <Link href="/admin/proyectos"
              className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><ImageIcon size={18} className="text-primary" /></div>
              <span className="text-xs font-medium text-primary-dark">Inicio</span>
            </Link>
            <Link href="/admin/proyectos"
              className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><MessageSquare size={18} className="text-primary" /></div>
              <span className="text-xs font-medium text-primary-dark">Participa</span>
            </Link>
            <Link href="/admin/proyectos"
              className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><Handshake size={18} className="text-primary" /></div>
              <span className="text-xs font-medium text-primary-dark">Auspiciadores</span>
            </Link>
          </div>

          <Link href="/admin/proyectos"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors w-full justify-center">
            Ir al panel completo <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
