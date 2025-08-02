
"use client";

import { ReactNode, useEffect, useState, useCallback } from 'react';
import { getAuth, onAuthStateChanged, User as AuthUser, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionsProvider } from '@/components/permissions-provider';
import { updateUser, getUserByEmail } from '@/lib/user-actions';
import type { User as DbUser } from '@/lib/user-service';
import { BuildingProvider } from '@/components/building-provider';
import { getBuildingsList } from '@/lib/building-actions';
import { AppLayout } from './app-layout';

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
        router.push('/login'); // Removido o parâmetro de erro
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
    } else if (authUser && dbUser && isAuthPage) {
      router.push('/datacenter');
    }
  }, [authUser, dbUser, loading, pathname, router]);

  if (loading) {
    return <FullPageLoader />;
  }
  
  const isLoginPage = pathname === '/login';
  const isPublicPage = isLoginPage || pathname === '/logout';
  
  if (!authUser && !isPublicPage) {
     return <FullPageLoader />;
  }

  // Se for uma página pública (login/logout), renderiza apenas o conteúdo dela, sem layout.
  if(isPublicPage) {
    return <>{children}</>;
  }

  // Se o usuário está autenticado, mas o registro do DB ainda não carregou, espera.
  if (authUser && !dbUser) {
    return <FullPageLoader />;
  }

  // O usuário está autenticado e temos os dados do DB, então renderiza a aplicação com o layout.
  if (authUser && dbUser) {
    return (
      <PermissionsProvider user={dbUser}>
        <BuildingProvider initialBuildings={buildings}>
          <AppLayout>{children}</AppLayout>
        </BuildingProvider>
      </PermissionsProvider>
    );
  }

  // Fallback para qualquer outro caso (ex: usuário deslogado em página não pública)
  return <FullPageLoader />;
}
