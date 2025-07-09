
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import type { User, UserRole } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  realUserData: User | null;
  loading: boolean;
  impersonatedRole: UserRole | null;
  setImpersonatedRole: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [realUserData, setRealUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [impersonatedRole, setImpersonatedRole] = useState<UserRole | null>(null);
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
            const userDataFromDb = { id: docSnapshot.id, ...docSnapshot.data() } as User;
            setRealUserData(userDataFromDb);
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
              // Assign 'developer' role to the seed user, otherwise default to 'tecnico'
              role: isSeedUser ? 'developer' : 'tecnico',
              avatarUrl: firebaseUser.photoURL || null,
              signatureUrl: null,
              // datacenterId is left undefined. A manager can assign it later via the UI.
            };

            try {
              await setDoc(userDocRef, newUserProfile);
              // The onSnapshot listener will fire again with the new data,
              // and the `if (docSnapshot.exists())` block will handle setting the user data.
              console.log(`User document for ${firebaseUser.uid} created successfully.`);
            } catch (error) {
              console.error("Error creating user document in Firestore:", error);
              setRealUserData(null); // Explicitly set to null on error
              setLoading(false); // Ensure loading completes even on error
            }
          }
        });

        return () => unsubUser();
      } else {
        setUser(null);
        setRealUserData(null);
        setLoading(false);
        if (pathname.startsWith('/dashboard')) {
          router.push('/');
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const effectiveUserData = useMemo(() => {
    if (realUserData?.role === 'developer' && impersonatedRole) {
        return { ...realUserData, role: impersonatedRole };
    }
    return realUserData;
  }, [realUserData, impersonatedRole]);

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

  return (
    <AuthContext.Provider value={{ user, userData: effectiveUserData, realUserData, loading, impersonatedRole, setImpersonatedRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
