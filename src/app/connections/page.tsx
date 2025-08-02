

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
import { HardDrive, Server, Cable, WifiOff } from "lucide-react";
import { getAllEquipmentPorts, EquipmentPortDetail } from "@/lib/connection-actions";
import { cn } from "@/lib/utils";

// Aqui é onde o spaghetti de cabos se transforma em uma lasanha organizada.

export const dynamic = 'force-dynamic';

const statusStyles: Record<EquipmentPortDetail['status'], string> = {
  up: "text-green-500",
  down: "text-red-500",
  disabled: "text-gray-500",
};

const statusDotStyles: Record<EquipmentPortDetail['status'], string> = {
  up: "bg-green-500",
  down: "bg-red-500",
  disabled: "bg-gray-500",
};


export default async function ConnectionsPage() {
  const ports: EquipmentPortDetail[] = await getAllEquipmentPorts();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Inventário de Portas</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento Central de Portas</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as portas de equipamentos do seu inventário, conectadas ou não.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipamento</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Porta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Conectado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ports.length > 0 ? (
                ports.map(port => (
                  <TableRow key={port.id}>
                    <TableCell>
                      <div className="font-medium flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground"/>
                        {port.equipmentName}
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Server className="h-4 w-4"/>
                        {port.locationName}
                       </div>
                    </TableCell>
                     <TableCell>
                       {port.label}
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline">{port.portTypeName}</Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                           <span className={cn("h-2 w-2 rounded-full", statusDotStyles[port.status])} />
                           <span className={cn("capitalize font-medium", statusStyles[port.status])}>{port.status}</span>
                        </div>
                    </TableCell>
                     <TableCell>
                      {port.connectedToEquipmentName && port.connectedToPortLabel ? (
                         <div className="text-sm">
                           <span className="font-semibold">{port.connectedToEquipmentName}</span>
                           <span className="text-muted-foreground"> / {port.connectedToPortLabel}</span>
                         </div>
                      ) : (
                         <span className="text-xs text-muted-foreground italic">Não conectado</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <WifiOff className="h-12 w-12 text-muted-foreground/50" />
                        <p className="font-semibold text-muted-foreground">Nenhuma porta de equipamento encontrada.</p>
                        <p className="text-sm text-muted-foreground/80">
                         Adicione modelos com configuração de portas e equipamentos aninhados para começar.
                        </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
