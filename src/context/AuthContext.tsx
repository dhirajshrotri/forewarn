// context/AuthContext.js
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type AuthProviderProps = { children: React.ReactNode };

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Trigger silent anonymous login
    signInAnonymously(auth).catch((error) => {
      console.error("Anonymous authentication failed:", error);
    });

    // 2. Listen for the authenticated state/UID change
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
