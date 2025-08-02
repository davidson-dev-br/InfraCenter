
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, signInWithPopup, OAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "@/lib/firebase"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Server, Loader2, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

type LoginFormData = z.infer<typeof loginSchema>;


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
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = getAuth(app);
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

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

  const handleEmailLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        // O AuthProvider cuidará do redirecionamento
    } catch (error: any) {
        handleAuthError(error);
    } finally {
        setIsLoading(false);
    }
  }

  const handleAuthError = (error: any) => {
    console.error("Erro de autenticação:", error);
    if (error.code === 'auth/account-exists-with-different-credential') {
      setError("Uma conta já existe com este e-mail, mas com um método de login diferente.");
    } else if (error.code === 'auth/popup-closed-by-user') {
      setError("A janela de login foi fechada. Por favor, tente novamente.");
    } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password') {
      setError("Credenciais inválidas. Verifique seu e-mail e senha.");
    } else if (error.code === 'auth/user-not-found') {
        setError("Nenhum usuário encontrado com este e-mail.");
    } else {
      setError("Falha ao autenticar. Verifique sua conexão ou tente novamente mais tarde.");
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
                Escolha seu método de login para acessar o painel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="microsoft">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="microsoft">Microsoft</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="register">Registrar</TabsTrigger>
                </TabsList>
                <TabsContent value="microsoft" className="pt-6">
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
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleEmailLogin)} className="space-y-4">
                           <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="seu.email@provedor.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Entrar
                            </Button>
                        </form>
                    </Form>
                </TabsContent>
                <TabsContent value="register" className="pt-6">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Cadastro de Novos Usuários</AlertTitle>
                        <AlertDescription>
                            Para garantir a segurança do sistema, o cadastro de novos usuários é feito manualmente por um administrador através da página de "Usuários".
                        </AlertDescription>
                    </Alert>
                </TabsContent>
            </Tabs>
            {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}
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

    