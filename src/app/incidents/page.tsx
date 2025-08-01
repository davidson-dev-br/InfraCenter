

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getIncidents, Incident } from "@/lib/incident-service";
import { cn } from "@/lib/utils";

// Eu sei que isso parece errado, mas confia no processo.
export const dynamic = 'force-dynamic';

const severityStyles: Record<Incident['severity'], string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export default async function IncidentsPage() {
  const incidents = await getIncidents();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Incidentes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Incidentes Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Detectado Em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-mono text-xs">{incident.id}</TableCell>
                  <TableCell>{incident.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize", severityStyles[incident.severity])}>
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{incident.status}</TableCell>
                  <TableCell>{new Date(incident.detectedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
