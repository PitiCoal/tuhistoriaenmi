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

  async function handleAccept() {
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
          <p className="text-text-light text-sm leading-relaxed">
            Para continuar, necesitamos que leas y aceptes nuestros documentos legales. Son breves y claros.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 border border-gray-100">
          <p className="text-text leading-relaxed">
            Al usar esta plataforma, confirmas que tienes <strong>18 años o más</strong> y aceptas:
          </p>
          <ul className="space-y-1 pl-4">
            <li className="list-disc text-text-light">
              <Link href="/terminos" target="_blank" className="text-primary underline font-medium">Términos de Uso</Link>
            </li>
            <li className="list-disc text-text-light">
              <Link href="/privacidad" target="_blank" className="text-primary underline font-medium">Política de Privacidad</Link>
            </li>
          </ul>
          <p className="text-xs text-text-light/70">
            Tus datos serán tratados de forma segura y solo para fines del ministerio. Puedes eliminar tu cuenta en cualquier momento desde tu perfil.
          </p>
        </div>

        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 active:scale-95"
        >
          {accepting ? 'Guardando...' : 'Acepto y quiero participar'}
        </button>

        <p className="text-center text-xs text-text-light/60">
          Si no aceptas, por favor cierra sesión.
        </p>
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
