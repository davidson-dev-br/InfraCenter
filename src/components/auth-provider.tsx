
"use client";

import { ReactNode, useEffect, useState, useCallback, Suspense } from 'react';
import { getAuth, onAuthStateChanged, User as AuthUser, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionsProvider } from '@/components/permissions-provider';
import { updateUser, getUserByEmail, ensureDatabaseSchema } from '@/lib/user-actions';
import type { User as DbUser } from '@/lib/user-service';
import { BuildingProvider } from '@/components/building-provider';
import { getBuildingsList } from '@/lib/building-actions';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FullPageLoader = () => (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
        </div>
    </div>
);

const ConnectionErrorScreen = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
     <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <WifiOff className="h-6 w-6 text-destructive" />
                </div>
              <CardTitle className="mt-4 text-2xl">Falha de Conexão</CardTitle>
              <CardDescription>
                Não foi possível conectar ao banco de dados da aplicação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Isso geralmente ocorre por uma regra de firewall bloqueando o acesso. Verifique as configurações de rede do seu servidor SQL.
                </p>
                <div className="rounded-md border bg-muted p-3 text-left text-sm">
                    <p className="font-semibold">Detalhes do Erro:</p>
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-destructive">
                        {error}
                    </pre>
                </div>
              <Button onClick={onRetry}>
                Tentar Novamente
              </Button>
            </CardContent>
        </Card>
    </div>
)


type Building = {
    id: string;
    name: string;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const auth = getAuth(app);
  const router = useRouter();
  const pathname = usePathname();

  const handleUserAuth = useCallback(async (user: AuthUser | null) => {
    setLoading(true);
    setConnectionError(null);
    if (user && user.email) {
      try {
        await ensureDatabaseSchema();
        
        const userRecordInDb = await getUserByEmail(user.email);
        
        let userDataToSync: Partial<DbUser> = {
            id: user.uid,
            email: user.email.toLowerCase(),
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLoginAt: new Date().toISOString(),
        };

        if (userRecordInDb) {
            console.log(`Usuário ${user.email} encontrado no DB. Sincronizando...`);
        } else {
            console.log(`Usuário autenticado ${user.email} não encontrado no DB. Criando novo registro...`);
            userDataToSync.role = 'guest'; 
        }
        
        const [syncedUser, buildingsData] = await Promise.all([
          updateUser(userDataToSync),
          getBuildingsList()
        ]);
        
        setAuthUser(user);
        setDbUser(syncedUser);
        setBuildings(buildingsData);

      } catch (error: any) {
         console.error("Erro de conexão durante a autenticação:", error);
         setConnectionError(error.message || "Erro desconhecido ao conectar ao banco de dados.");
      }
    } else {
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
    if (loading || connectionError) {
      return; 
    }

    const isAuthPage = pathname === '/login';

    if (!authUser && !isAuthPage) {
      router.push('/login');
    } else if (authUser && dbUser && isAuthPage) {
      router.push('/datacenter');
    }
  }, [authUser, dbUser, loading, connectionError, pathname, router]);
  
  if (connectionError) {
      return <ConnectionErrorScreen error={connectionError} onRetry={() => handleUserAuth(auth.currentUser)} />
  }

  if (loading) {
    return <FullPageLoader />;
  }
  
  const isLoginPage = pathname === '/login';
  const isPublicPage = isLoginPage || pathname === '/logout';
  
  if (!authUser && !isPublicPage) {
     return <FullPageLoader />;
  }

  if(isPublicPage) {
    return <>{children}</>;
  }

  if (authUser && !dbUser) {
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
