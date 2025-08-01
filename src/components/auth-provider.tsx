
"use client";

import { ReactNode, useEffect, useState, useCallback } from 'react';
import { getAuth, onAuthStateChanged, User as AuthUser, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Skeleton } from './ui/skeleton';
import { PermissionsProvider } from './permissions-provider';
import { updateUser, getUserByEmail } from '@/lib/user-actions';
import type { User as DbUser } from '@/lib/user-service';
import { BuildingProvider } from './building-provider';
import { getBuildingsList } from '@/lib/building-actions';

// Aquele momento de silêncio antes de rodar o código pela primeira vez. Pura fé.

const FullPageLoader = () => (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
        </div>
    </div>
);

type Building = {
    id: string;
    name: string;
};

// Esta função injeta o token de autenticação em todas as requisições fetch.
// Alterar isto é como trocar o pneu do carro em movimento.
const createAuthorizedFetch = (getAuthToken: () => Promise<string | null>) => {
    if (typeof window === 'undefined') return;
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const token = await getAuthToken();
        const headers = new Headers(init?.headers);
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return originalFetch(input, { ...init, headers });
    };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    createAuthorizedFetch(() => auth.currentUser?.getIdToken() ?? Promise.resolve(null));
  }, [auth]);

  const handleUserAuth = useCallback(async (user: AuthUser | null) => {
    if (user && user.email) {
      const userRecord = await getUserByEmail(user.email);

      if (userRecord) {
        // Usuário existe no DB, pode prosseguir
        const [updatedUser, buildingsData] = await Promise.all([
          updateUser({
            id: userRecord.id, // Usar o ID do DB para garantir a atualização correta
            email: user.email.toLowerCase(),
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLoginAt: new Date().toISOString(),
          }),
          getBuildingsList()
        ]);
        setAuthUser(user);
        setDbUser(updatedUser);
        setBuildings(buildingsData);
      } else {
        // Usuário não existe no DB, deslogar e redirecionar
        await signOut(auth);
        setAuthUser(null);
        setDbUser(null);
        router.push('/login?error=unprovisioned');
      }
    } else {
      // Nenhum usuário logado no Firebase
      setAuthUser(null);
      setDbUser(null);
      setBuildings([]);
    }
    setLoading(false);
  }, [auth, router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleUserAuth);
    return () => unsubscribe();
  }, [auth, handleUserAuth]);


  useEffect(() => {
    if (loading) {
      return; 
    }

    const isAuthPage = pathname === '/login';

    if (!authUser && !isAuthPage) {
      router.push('/login');
    } else if (authUser && dbUser && isAuthPage && !searchParams.get('error')) {
      router.push('/datacenter');
    }
  }, [authUser, dbUser, loading, pathname, router, searchParams]);

  if (loading) {
    return <FullPageLoader />;
  }
  
  const isLoginPage = pathname === '/login';
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  if (!authUser && !isLoginPage) {
     return <FullPageLoader />;
  }

  if (authUser && dbUser) {
    return (
      <PermissionsProvider user={dbUser}>
        <BuildingProvider initialBuildings={buildings}>
          <AppLayout>{children}</AppLayout>
        </BuildingProvider>
      </PermissionsProvider>
    );
  }

  return <FullPageLoader />;
}
