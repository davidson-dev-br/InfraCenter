"use client"; // Componentes de erro devem ser Componentes do Cliente

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Em um ambiente de produção, você poderia logar o erro em um serviço de monitoramento.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          <CardTitle className="mt-4 text-2xl">Oops! Algo Deu Errado</CardTitle>
          <CardDescription>
            Não foi possível carregar a página solicitada. Isso pode ser um problema temporário.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="rounded-md border bg-muted p-3 text-left text-sm">
                <p className="font-semibold">Detalhes do Erro:</p>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-destructive">
                    {error.message || 'Ocorreu um erro desconhecido.'}
                </pre>
            </div>
          <Button
            onClick={
              // Tenta se recuperar renderizando o segmento novamente
              () => reset()
            }
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
