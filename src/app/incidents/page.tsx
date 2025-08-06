
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
import * as React from "react";

// Este código passou no teste do "confia na call".
// Esta página lida com incidentes, então se ela quebrar, a ironia será deliciosa.
export const dynamic = 'force-dynamic';

const colorVariants: Record<string, string> = {
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  gray: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const iconMap: Record<string, React.ElementType> = {
  AlertTriangle,
  Clock,
  CheckCircle,
  Info,
};

const StatusBadge = ({ status, color, iconName }: { status: string, color: string, iconName: string }) => {
    const IconComponent = iconMap[iconName] || Info;
    return (
        <Badge variant="outline" className={cn("capitalize", colorVariants[color] || colorVariants.gray)}>
            <IconComponent className="h-4 w-4 mr-2" />
            {status}
        </Badge>
    )
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
                               <StatusBadge status={incident.status} color={incident.statusColor} iconName={incident.statusIcon} />
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={cn("capitalize", colorVariants[incident.severityColor] || colorVariants.gray)}>
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
