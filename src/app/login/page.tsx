
"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, signInWithPopup, OAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "@/lib/firebase"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Server, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Função para o ícone da Microsoft
function MicrosoftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="10.5" height="10.5" x="1.5" y="1.5" fill="#f25022" strokeWidth="0" />
      <rect width="10.5" height="10.5" x="12" y="1.5" fill="#7fba00" strokeWidth="0" />
      <rect width="10.5" height="10.5" x="1.5" y="12" fill="#00a4ef" strokeWidth="0" />
      <rect width="10.5" height="10.5" x="12" y="12" fill="#ffb900" strokeWidth="0" />
    </svg>
  );
}

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = getAuth(app);
  
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unprovisioned') {
        setError("Sua conta foi autenticada, mas não está liberada no sistema. Fale com um administrador.");
    }
  }, [searchParams]);

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new OAuthProvider("microsoft.com");
    provider.setCustomParameters({ tenant: "common" });

    try {
      await signInWithPopup(auth, provider);
      // O AuthProvider cuidará do redirecionamento
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O AuthProvider cuidará do redirecionamento
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error: any) => {
    console.error("Erro de autenticação:", error);
    if (error.code === 'auth/account-exists-with-different-credential') {
      setError("Uma conta já existe com este e-mail, mas com um método de login diferente.");
    } else if (error.code === 'auth/popup-closed-by-user') {
      setError("A janela de login foi fechada. Tente novamente.");
    } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      setError("E-mail ou senha inválidos. Verifique suas credenciais.");
    } else {
      setError("Falha na autenticação. Verifique sua conexão ou tente novamente mais tarde.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute top-8 left-8 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary">
              <Server className="text-primary-foreground size-6" />
          </div>
          <h1 className="text-xl font-headline font-semibold text-primary">InfraVision</h1>
      </div>
      <Card className="w-full max-w-sm">
        <Tabs defaultValue="microsoft">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="microsoft">Microsoft</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>
          <TabsContent value="microsoft">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
              <CardDescription>
                Faça login com sua conta Microsoft para acessar o painel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleMicrosoftLogin} disabled={isLoading} className="w-full">
                 {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <MicrosoftIcon className="mr-2 h-5 w-5" /> )}
                Entrar com Microsoft
              </Button>
            </CardContent>
          </TabsContent>
          <TabsContent value="email">
             <CardHeader className="text-center">
              <CardTitle className="text-2xl">Acesso por Email</CardTitle>
              <CardDescription>
                Use seu e-mail e senha cadastrados para entrar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="seu.email@empresa.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </form>
            </CardContent>
          </TabsContent>
        </Tabs>
        {error && <p className="p-4 text-center text-sm text-destructive">{error}</p>}
      </Card>
    </div>
  );
}

const LoginPageSkeleton = () => (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <Skeleton className="h-8 w-48 mt-4" />
        <Skeleton className="h-4 w-64 mt-2" />
        <Skeleton className="h-10 w-full max-w-sm mt-6" />
    </div>
);

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginPageSkeleton />}>
            <LoginContent />
        </Suspense>
    )
}
