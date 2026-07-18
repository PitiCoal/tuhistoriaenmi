'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser } from '@/lib/firebase';
import { upsertProfile, hasUserConsented, saveUserConsent } from '@/lib/supabase';
import Link from 'next/link';

interface AuthContextType {
  user: FirebaseUser | null | 'loading';
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: () => {},
  signOut: () => {},
});

/** Modal de consentimiento (primera vez) */
function ConsentModal({ userId, name, email, onAccept }: { userId: string; name: string; email: string; onAccept: () => void }) {
  const [accepting, setAccepting] = useState(false);
  const [checked, setChecked] = useState(false);

  async function handleAccept() {
    if (!checked) return;
    setAccepting(true);
    await saveUserConsent(userId);
    try {
      await fetch('/api/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
    } catch (e) {
      console.error('Error sending welcome email:', e);
    }
    onAccept();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <img src="/images/logo.png" alt="" className="h-8 w-8" />
          </div>
          <h2 className="font-heading text-xl font-bold text-primary-dark">Bienvenida/o a Tu Historia en Mí</h2>
          <p className="text-text-light text-xs md:text-sm leading-relaxed">
            Para continuar y crear tu cuenta de comunidad, necesitamos que leas y aceptes explícitamente nuestros términos legales.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-3 border border-gray-100">
          <p className="text-text leading-relaxed text-xs">
            Al registrarte en esta plataforma, tus datos de perfil (nombre y país) se utilizarán exclusivamente para identificarte dentro del muro comunitario, proyectos y actividades. Tu diario íntimo y reflexiones personales son de carácter estrictamente privado y seguro.
          </p>
          
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="consent-check"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="w-4.5 h-4.5 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary/30 cursor-pointer"
            />
            <label htmlFor="consent-check" className="text-xs text-text leading-snug cursor-pointer select-none">
              Confirmo que tengo <strong>18 años o más</strong> y acepto de manera obligatoria la <Link href="/privacidad" target="_blank" className="text-primary underline font-semibold">Política de Privacidad</Link> y los <Link href="/terminos" target="_blank" className="text-primary underline font-semibold">Términos de Uso</Link> del sitio.
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleAccept}
            disabled={accepting || !checked}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95 shadow-sm"
          >
            {accepting ? 'Guardando...' : 'Acepto y quiero participar'}
          </button>
          
          <button
            type="button"
            onClick={() => signOutUser()}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-text font-semibold rounded-xl transition-colors active:scale-95 text-xs"
          >
            No acepto, cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null | 'loading'>('loading');
  const [showConsent, setShowConsent] = useState(false);
  const [pendingConsentUserId, setPendingConsentUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Sync profile
        upsertProfile({ user_id: u.uid, display_name: u.displayName || undefined, email: u.email || undefined }).catch(() => {});
        // Check consent
        const consented = await hasUserConsented(u.uid).catch(() => true); // fail-safe: true = no mostrar modal
        if (!consented) {
          setPendingConsentUserId(u.uid);
          setShowConsent(true);
        }
      } else {
        setShowConsent(false);
        setPendingConsentUserId(null);
      }
    });
    return unsub;
  }, []);

  const fbUser = typeof user === 'object' && user ? user : null;

  return (
    <AuthContext.Provider value={{ user, signIn: () => signInWithGoogle(), signOut: () => signOutUser() }}>
      {children}
      {showConsent && pendingConsentUserId && fbUser && (
        <ConsentModal
          userId={pendingConsentUserId}
          name={fbUser.displayName || ''}
          email={fbUser.email || ''}
          onAccept={() => { setShowConsent(false); setPendingConsentUserId(null); }}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
