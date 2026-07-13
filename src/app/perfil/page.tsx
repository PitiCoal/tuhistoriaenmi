'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, signInWithGoogle } from '@/lib/firebase';
import { getProfile, upsertProfile, uploadFile } from '@/lib/supabase';
import { User, Camera, Save, LogIn, Shield, FolderKanban, Mic, Image as ImageIcon, MessageSquare, Handshake, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PerfilPage() {
  const [user, setUser] = useState<FirebaseUser | null | 'loading'>('loading');
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) { setUser(null); return; }
      const p = await getProfile(u.uid);
      if (p) {
        setProfile(p);
        setDisplayName(p.display_name || u.displayName || '');
        setCountry(p.country || '');
        setAge(p.age?.toString() || '');
        setBio(p.bio || '');
      } else {
        setDisplayName(u.displayName || '');
      }
    });
    return unsub;
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user || user === 'loading') return;
    setUploading(true);
    const url = await uploadFile('profile-photos', user.uid, file);
    if (url) {
      setProfile((p: any) => ({ ...p, photo_url: url }));
      await upsertProfile({ user_id: user.uid, photo_url: url });
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!user || user === 'loading') return;
    setSaving(true);
    await upsertProfile({
      user_id: user.uid,
      display_name: displayName.trim() || undefined,
      country: country.trim() || undefined,
      age: age ? parseInt(age) : undefined,
      bio: bio.trim() || undefined,
    });
    setSaving(false);
  }

  if (user === 'loading') return <div className="text-center py-20 text-text-light">Cargando...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <User size={48} className="mx-auto text-text-light" />
        <h1 className="font-heading text-2xl font-bold text-primary-dark">Inicia sesión</h1>
        <p className="text-text-light text-sm">Necesitas iniciar sesión para tener un perfil.</p>
        <button onClick={() => signInWithGoogle()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">
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
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow hover:bg-primary/90 disabled:opacity-50">
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
          {uploading && <p className="text-xs text-text-light">Subiendo imagen...</p>}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-light mb-1">Nombre</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={60}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-light mb-1">País</label>
              <input type="text" value={country} onChange={e => setCountry(e.target.value)} maxLength={50}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Chile" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-light mb-1">Edad</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} min={1} max={120}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="25" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-light mb-1">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={300} rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Cuéntanos de ti..." />
            <p className="text-xs text-text-light/60 mt-1">{bio.length}/300</p>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
          <Save size={16} /> {saving ? 'Guardando...' : 'Guardar perfil'}
        </button>
      </div>

      <div className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm">
        <p className="text-xs text-text-light text-center">
          Tu perfil es visible para otros usuarios de la comunidad.
          <br />Correo: {user.email}
        </p>
      </div>

      {user.email === 'piti.coal@gmail.com' && (
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-primary/20 shadow-md space-y-4 bg-gradient-to-br from-primary/[0.02] to-primary/[0.06]">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            <h2 className="font-heading text-xl font-bold text-primary-dark">Administraci&oacute;n</h2>
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
