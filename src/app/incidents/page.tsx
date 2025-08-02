
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AlertTriangle, CheckCircle, Clock, Info } from "lucide-react";

// Este código passou no teste do "confia na call".
// Esta página lida com incidentes, então se ela quebrar, a ironia será deliciosa.
export const dynamic = 'force-dynamic';

const severityStyles: Record<Incident['severity'], string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const statusStyles: Record<Incident['status'], string> = {
    open: "bg-red-500/10 text-red-500",
    investigating: "bg-yellow-500/10 text-yellow-500",
    closed: "bg-green-500/10 text-green-500",
}

const StatusIcon = ({ status }: { status: Incident['status']}) => {
    switch(status) {
        case 'open': return <AlertTriangle className="h-4 w-4 mr-2" />;
        case 'investigating': return <Clock className="h-4 w-4 mr-2" />;
        case 'closed': return <CheckCircle className="h-4 w-4 mr-2" />;
        default: return <Info className="h-4 w-4 mr-2" />;
    }
}

export default async function IncidentsPage() {
  const incidents = await getIncidents();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Central de Incidentes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Incidentes de Integridade do Sistema</CardTitle>
          <CardDescription>
            Acompanhe e gerencie as inconsistências de dados detectadas automaticamente pelo sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Descrição do Incidente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Detectado Em</TableHead>
                    <TableHead>Resolvido Em</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {incidents.length > 0 ? (
                    incidents.map((incident) => (
                        <TableRow key={incident.id}>
                            <TableCell>
                                <p className="font-medium">{incident.description}</p>
                                <p className="text-xs text-muted-foreground font-mono">ID: {incident.id}</p>
                            </TableCell>
                             <TableCell>
                                <Badge variant="outline" className={cn("capitalize", statusStyles[incident.status])}>
                                    <StatusIcon status={incident.status} />
                                    {incident.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={cn("capitalize", severityStyles[incident.severity])}>
                                {incident.severity}
                                </Badge>
                            </TableCell>
                            <TableCell>{new Date(incident.detectedAt).toLocaleString()}</TableCell>
                            <TableCell>
                                {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : <span className="text-muted-foreground/70 italic">-</span>}
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            Nenhum incidente encontrado. A integridade dos dados está ótima!
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
