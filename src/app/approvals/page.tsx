
"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApprovalsPage() {

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Aprovações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Solicitações Pendentes</CardTitle>
          <CardDescription>
            Itens que requerem sua aprovação para se tornarem ativos no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Nenhuma solicitação pendente.</p>
            <p className="text-sm text-muted-foreground/80">
              Quando um item for submetido, ele aparecerá aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
