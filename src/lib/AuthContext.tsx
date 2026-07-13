'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser } from '@/lib/firebase';
import { upsertProfile } from '@/lib/supabase';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null | 'loading'>('loading');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      if (u) upsertProfile({ user_id: u.uid, display_name: u.displayName || undefined }).catch(() => {});
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn: () => signInWithGoogle(), signOut: () => signOutUser() }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
