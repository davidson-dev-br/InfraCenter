"use client";

import { LoginForm } from "@/components/login-form";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

function MissingFirebaseConfig() {
    return (
      <main className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader className="text-center">
             <div className="flex justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-headline">Configuração Incompleta</CardTitle>
          </CardHeader>
          <CardContent>
             <CardDescription className="text-center text-lg space-y-4">
                <p>As credenciais do Firebase não foram configuradas corretamente.</p>
                <p>
                    Por favor, abra o arquivo <code className="p-1 font-mono text-sm rounded-md bg-muted text-muted-foreground">.env</code> na raiz do projeto, cole as credenciais do seu projeto Firebase e <strong className="text-destructive">reinicie o servidor de desenvolvimento.</strong>
                </p>

                <div className="text-xs text-muted-foreground pt-4 bg-slate-800 text-white p-3 rounded-md !mt-6 text-left">
                    <p className="font-bold text-base mb-2">Informação para depuração:</p>
                    <p>Valor lido para a variável de ambiente:</p>
                    <p className="font-mono break-all bg-slate-900 p-2 rounded-md mt-1">NEXT_PUBLIC_FIREBASE_API_KEY='{process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'NÃO ENCONTRADO'}'</p>
                    <p className="text-xs text-slate-400 mt-2">Se o valor acima for 'NÃO ENCONTRADO', é 100% certo que o servidor precisa ser reiniciado para carregar as novas credenciais.</p>
                </div>

                 <p className="text-sm text-muted-foreground pt-2">
                    Este passo é crucial para que as novas credenciais sejam carregadas.
                </p>
             </CardDescription>
          </CardContent>
        </Card>
      </main>
    );
}


export default function LoginPage() {
  if (!isFirebaseConfigured) {
    return <MissingFirebaseConfig />;
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4">
      <LoginForm />
    </main>
  );
}
