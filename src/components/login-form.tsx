"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("davidson.cabista@gmail.com");
  const [password, setPassword] = useState("123456");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!isFirebaseConfigured || !auth) {
      setError("A configuração do Firebase não está disponível. Verifique o arquivo .env.local e reinicie o servidor.");
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Login bem-sucedido!" });
      router.push("/dashboard");
    } catch (err: any)      {
      const errorCode = err.code;
      let friendlyMessage = "Ocorreu um erro ao fazer login. Tente novamente.";
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        friendlyMessage = "Email ou senha incorretos.";
      } else if (errorCode === 'auth/invalid-email') {
        friendlyMessage = "O formato do email é inválido.";
      }
      setError(friendlyMessage);
      setIsLoading(false);
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Building2 className="w-10 h-10 text-destructive" />
          </div>
          <CardTitle>Configuração Incompleta</CardTitle>
          <CardDescription>
            As credenciais do Firebase não foram configuradas corretamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Ação Necessária</AlertTitle>
            <AlertDescription>
              Por favor, abra o arquivo <strong>.env.local</strong> na raiz do projeto, cole as credenciais do seu projeto Firebase e <strong>reinicie o servidor de desenvolvimento</strong>.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm shadow-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Building2 className="w-10 h-10 text-primary" />
        </div>
        <CardTitle className="text-2xl font-headline">InfraCenter Manager</CardTitle>
        <CardDescription>
          Entre com seu email e senha para acessar.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="grid gap-4">
           {error && (
            <Alert variant="destructive">
              <AlertTitle>Erro de Autenticação</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
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
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Entrar"}
          </Button>
           <p className="mt-4 text-xs text-center text-muted-foreground">
            Novos usuários são criados pelos gerentes de projeto.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
