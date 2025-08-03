
"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, OAuthProvider, linkWithCredential, EmailAuthProvider, fetchSignInMethodsForEmail } from "firebase/auth";
import { app } from "@/lib/firebase"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { LinkAccountDialog } from "./link-account-dialog";

// Ícone da Microsoft
function MicrosoftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="10.5" height="10.5" x="1.5" y="1.5" fill="#f25022" strokeWidth="0" />
      <rect width="10.5" height="10.5" x="12" y="1.5" fill="#7fba00" strokeWidth="0" />
      <rect width="10.5" height="10.5" x="1.5" y="12" fill="#00a4ef" strokeWidth="0" />
      <rect width="10.5" height="10.5" x="12" y="12" fill="#ffb900" strokeWidth="0" />
    </svg>
  );
}

// Este é um componente de teste e não deve ser usado em produção ainda.
export function TestLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para o fluxo de vinculação de contas
  const [isLinking, setIsLinking] = useState(false);
  const [pendingCredential, setPendingCredential] = useState<any>(null);
  const [linkingEmail, setLinkingEmail] = useState('');

  const auth = getAuth(app);
  
  const handleAuthError = async (error: any, pendingCred?: any) => {
    console.error("Erro de autenticação:", error);
    if (error.code === 'auth/account-exists-with-different-credential') {
        const emailForLinking = error.customData?.email;
        if (emailForLinking) {
            setLinkingEmail(emailForLinking);
            setPendingCredential(pendingCred || error.credential);
            setIsLinking(true);
            setError(null);
        }
    } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      setError("E-mail ou senha inválidos. Verifique suas credenciais.");
    } else if (error.code === 'auth/popup-closed-by-user') {
        setError("A janela de login foi fechada. Tente novamente.");
    } else {
      setError("Falha na autenticação. Verifique sua conexão ou tente novamente mais tarde.");
    }
  }

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new OAuthProvider("microsoft.com");
    provider.setCustomParameters({ tenant: "common" });

    try {
      await signInWithPopup(auth, provider);
      // O AuthProvider cuidará do redirecionamento
    } catch (error: any) {
      handleAuthError(error, error.credential);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O AuthProvider cuidará do redirecionamento
    } catch (error: any) {
      // Se o usuário não existe, vamos criá-lo
      if (error.code === 'auth/user-not-found') {
          // Lógica de criação será adicionada em um passo futuro
          setError("Usuário não encontrado. O fluxo de criação ainda será implementado.")
      } else {
        handleAuthError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
            <CardTitle className="text-2xl">Login de Teste</CardTitle>
            <CardDescription>
                Use Microsoft ou E-mail para testar a vinculação.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="microsoft">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="microsoft">Microsoft</TabsTrigger>
                        <TabsTrigger value="email">Email</TabsTrigger>
                    </TabsList>
                    <TabsContent value="microsoft" className="pt-4">
                        <Button onClick={handleMicrosoftLogin} disabled={isLoading} className="w-full">
                            {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                            <MicrosoftIcon className="mr-2 h-5 w-5" />
                            )}
                            Entrar com Microsoft
                        </Button>
                    </TabsContent>
                    <TabsContent value="email" className="pt-4">
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
                            Entrar / Criar
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}
            </CardContent>
        </Card>
        
        <LinkAccountDialog
            isOpen={isLinking}
            onOpenChange={setIsLinking}
            email={linkingEmail}
            pendingCredential={pendingCredential}
        />
    </>
  );
}
