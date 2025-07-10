
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { Connection } from "@/lib/types";
import { useInfra } from "../datacenter-switcher";
import { AlertTriangle, Edit } from 'lucide-react';

type AlertType = 'all' | 'missing_source' | 'missing_destination' | 'missing_both';

const getAlertType = (connection: Connection): AlertType | null => {
    const missingSource = !connection.sourceEquipmentId;
    const missingDest = !connection.destinationEquipmentId;
    if (missingSource && missingDest) return 'missing_both';
    if (missingSource) return 'missing_source';
    if (missingDest) return 'missing_destination';
    return null;
}

type AlertCenterDialogProps = {
  children: React.ReactNode;
  connections: Connection[];
  onEditConnection: (connection: Connection) => void;
};

export function AlertCenterDialog({ children, connections, onEditConnection }: AlertCenterDialogProps) {
  const [filter, setFilter] = useState<AlertType>('all');
  const [isOpen, setIsOpen] = useState(false);
  const { equipment } = useInfra();

  const filteredConnections = useMemo(() => {
    if (filter === 'all') return connections;
    return connections.filter(c => getAlertType(c) === filter);
  }, [filter, connections]);

  const handleEditClick = (connection: Connection) => {
    setIsOpen(false);
    onEditConnection(connection);
  };

  const getEquipmentName = (equipmentId: string) => {
    return equipment.find(e => e.id === equipmentId)?.hostname || <span className="italic text-muted-foreground">Não especificado</span>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive" />
            Central de Alertas de Conexão
          </DialogTitle>
          <DialogDescription>
            Revise as conexões que requerem atenção. Clique em uma linha para editar e corrigir.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 py-4">
            <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>Todos ({connections.length})</Button>
            <Button variant={filter === 'missing_source' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('missing_source')}>Falta Origem</Button>
            <Button variant={filter === 'missing_destination' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('missing_destination')}>Falta Destino</Button>
            <Button variant={filter === 'missing_both' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('missing_both')}>Falta Ambos</Button>
        </div>

        <ScrollArea className="h-[50vh]">
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Etiqueta / Alerta</TableHead>
                            <TableHead>Origem</TableHead>
                            <TableHead>Destino</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredConnections.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    Nenhuma conexão encontrada para este filtro.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredConnections.map(conn => (
                                <TableRow key={conn.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEditClick(conn)}>
                                    <TableCell>
                                        <div className="font-medium">{conn.cableLabel || <span className="italic text-muted-foreground">Sem Etiqueta</span>}</div>
                                        <div className="text-xs text-destructive">{conn.alert}</div>
                                    </TableCell>
                                    <TableCell>{getEquipmentName(conn.sourceEquipmentId)}:{conn.sourcePort}</TableCell>
                                    <TableCell>{getEquipmentName(conn.destinationEquipmentId)}:{conn.destinationPort}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4 mr-2" /> Corrigir
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </ScrollArea>

      </DialogContent>
    </Dialog>
  );
}
