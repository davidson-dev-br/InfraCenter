"use client";

import { useInfra } from "@/components/dashboard/datacenter-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLogTable } from "@/components/dashboard/activity-log/activity-log-table";

export default function ActivityLogPage() {
  const { activityLog } = useInfra();

  return (
    <div className="container p-4 mx-auto my-8 sm:p-8">
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Log de Atividades</CardTitle>
          <CardDescription>Visualize o histórico de ações realizadas no sistema para o datacenter selecionado.</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityLogTable data={activityLog} />
        </CardContent>
      </Card>
    </div>
  )
}
