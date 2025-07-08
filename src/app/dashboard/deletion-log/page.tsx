"use client";

import { useInfra } from "@/components/dashboard/datacenter-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeletionLogTable } from "@/components/dashboard/deletion-log/deletion-log-table";

export default function DeletionLogPage() {
  const { deletionLog } = useInfra();

  return (
    <div className="container p-4 mx-auto my-8 sm:p-8">
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Log de Exclusões</CardTitle>
          <CardDescription>Visualize o histórico de todos os itens que foram removidos da planta baixa.</CardDescription>
        </CardHeader>
        <CardContent>
          <DeletionLogTable data={deletionLog} />
        </CardContent>
      </Card>
    </div>
  )
}
