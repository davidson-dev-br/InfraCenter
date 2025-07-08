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
                    Por favor, abra o arquivo <code className="p-1 font-mono text-sm rounded-md bg-muted text-muted-foreground">.env</code> na raiz do projeto, cole as credenciais do seu projeto Firebase e reinicie o servidor de desenvolvimento.
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
