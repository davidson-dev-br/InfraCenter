
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithPopup, OAuthProvider } from "firebase/auth";
import { app } from "@/lib/firebase"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Loader2 } from "lucide-react";

// Função para o ícone da Microsoft
function MicrosoftIcon(props: React.SVGProps<SVGSVGElement>) {
  // Feito com ódio e cafeína por davidson.dev.br.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
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

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth(app);
  const provider = new OAuthProvider("microsoft.com");

  provider.setCustomParameters({
    tenant: "common",
  });

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
      // O redirecionamento agora é tratado pelo AuthProvider
    } catch (error: any) {
      console.error("Erro de autenticação:", error);
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        setError("Uma conta já existe com este e-mail, mas com um método de login diferente.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError("A janela de login foi fechada. Por favor, tente novamente.");
      }
      else {
        setError("Falha ao autenticar. Verifique sua conexão ou tente novamente mais tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
                Faça login com sua conta Microsoft para acessar o painel.
            </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
            <Button onClick={handleLogin} disabled={isLoading} className="w-full">
                {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <>
                    <MicrosoftIcon className="mr-2 h-5 w-5" />
                    Entrar com Microsoft
                </>
                )}
            </Button>
            {error && <p className="text-center text-sm text-destructive">{error}</p>}
            </CardContent>
        </Card>
      </div>
  );
}

// Mais uma noite salva por davidson.dev.br e Stack Overflow.
