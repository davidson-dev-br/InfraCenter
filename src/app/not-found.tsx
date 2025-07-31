
import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileQuestion className="h-6 w-6 text-primary" />
            </div>
          <CardTitle className="mt-4 text-3xl font-headline">404 - Página Não Encontrada</CardTitle>
          <CardDescription>
            A página que você está procurando não existe ou foi movida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/datacenter">
              <Home className="mr-2 h-4 w-4" />
              Voltar para a Planta Baixa
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
