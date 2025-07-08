"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If firebase is not configured, don't do anything auth-related.
    if (!isFirebaseConfigured || !auth || !db) {
        setLoading(false);
        // If user tries to access dashboard while not configured, redirect them.
        if (pathname.startsWith('/dashboard')) {
          router.push('/');
        }
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);

        const unsubUser = onSnapshot(userDocRef, async (docSnapshot) => {
          if (docSnapshot.exists()) {
            setUserData({ id: docSnapshot.id, ...docSnapshot.data() } as User);
            setLoading(false);
          } else {
            // User is authenticated but doesn't have a document in Firestore.
            // This can happen on first login after manual account creation in Firebase Auth.
            // We'll create the user document now.
            console.log(`User document for ${firebaseUser.uid} not found. Creating...`);
            
            const isSeedUser = firebaseUser.email === 'davidson.cabista@gmail.com';
            
            const newUserProfile: Omit<User, 'id'> = {
              name: firebaseUser.displayName || firebaseUser.email || 'Novo Usuário',
              email: firebaseUser.email!,
              // Assign 'developer' role to the seed user, otherwise default to 'technician'
              role: isSeedUser ? 'developer' : 'technician',
              avatarUrl: firebaseUser.photoURL || `https://placehold.co/40x40.png`,
              // datacenterId is left undefined. A manager can assign it later via the UI.
            };

            try {
              await setDoc(userDocRef, newUserProfile);
              // The onSnapshot listener will fire again with the new data,
              // and the `if (docSnapshot.exists())` block will handle setting the user data.
              console.log(`User document for ${firebaseUser.uid} created successfully.`);
            } catch (error) {
              console.error("Error creating user document in Firestore:", error);
              setUserData(null); // Explicitly set to null on error
              setLoading(false); // Ensure loading completes even on error
            }
          }
        });

        return () => unsubUser();
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
        if (pathname.startsWith('/dashboard')) {
          router.push('/');
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-16 h-16 animate-spin" />
      </div>
    );
  }
  
  if (!user && pathname.startsWith('/dashboard')) {
     return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-16 h-16 animate-spin" />
        <p className="ml-4">Redirecionando para o login...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, userData, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
