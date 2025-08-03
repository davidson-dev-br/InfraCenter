
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "@/lib/firebase"; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Server, Loader2, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


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

  const handleLogin = async (e: React.FormEvent) => {
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
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
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
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
            <CardDescription>
                Faça login com seu e-mail e senha para acessar o painel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@timbrasil.com.br"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>
             <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Cadastro de Novos Usuários</AlertTitle>
                <AlertDescription>
                    Para garantir a segurança, o cadastro de novos usuários é feito por um administrador através da página de "Usuários" dentro do sistema.
                </AlertDescription>
            </Alert>
          </CardContent>
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
