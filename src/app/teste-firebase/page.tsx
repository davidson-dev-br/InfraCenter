
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, PlayCircle } from 'lucide-react';
import { testFirebaseAdminInit } from '@/lib/debug-actions';

interface TestResult {
    success: boolean;
    message: string;
    details?: string;
}

export default function TesteFirebasePage() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    setResult(null);
    const testResult = await testFirebaseAdminInit();
    setResult(testResult);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Diagnóstico do Firebase Admin</h1>
      <Card>
        <CardHeader>
          <CardTitle>Teste de Inicialização do Admin SDK</CardTitle>
          <CardDescription>
            Clique no botão abaixo para tentar inicializar o Firebase Admin SDK no servidor e verificar o status da conexão. Isso ajuda a diagnosticar problemas de credenciais ou permissões.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleTest} disabled={isLoading} size="lg">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-5 w-5" />
            )}
            Executar Teste de Conexão
          </Button>

          {result && (
            result.success ? (
              <Alert variant="default" className="bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300 [&>svg]:text-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Sucesso!</AlertTitle>
                <AlertDescription>
                  <p className="font-semibold">{result.message}</p>
                  {result.details && (
                    <pre className="mt-2 p-2 bg-black/10 rounded-md text-xs font-mono">
                        {result.details}
                    </pre>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Falha na Inicialização</AlertTitle>
                <AlertDescription>
                   <p className="font-semibold">{result.message}</p>
                   {result.details && (
                    <pre className="mt-2 p-2 bg-destructive/10 rounded-md text-xs font-mono whitespace-pre-wrap">
                        {result.details}
                    </pre>
                  )}
                </AlertDescription>
              </Alert>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
