"use client";

import type { Connection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useInfra } from "../datacenter-switcher";
import { ConnectionDialog } from "./connection-dialog";

type ConnectionsTableProps = {
  data: Connection[];
};

export function ConnectionsTable({ data }: ConnectionsTableProps) {
  const { equipment, deleteConnection } = useInfra();

  const getEquipmentName = (equipmentId: string) => {
    return equipment.find(e => e.id === equipmentId)?.hostname || 'N/A';
  };

  const getStatusVariant = (status: Connection['status']): 'default' | 'secondary' | 'outline' => {
      switch (status) {
          case 'Conectado':
              return 'default';
          case 'Desconectado':
              return 'secondary';
          case 'Planejado':
              return 'outline';
          default:
              return 'secondary';
      }
  }

  return (
    <div className="border rounded-lg">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Origem</TableHead>
                    <TableHead>Porta</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Porta</TableHead>
                    <TableHead>Tipo de Cabo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                            Nenhuma conexão cadastrada.
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((conn) => (
                        <TableRow key={conn.id}>
                            <TableCell className="font-medium">{getEquipmentName(conn.sourceEquipmentId)}</TableCell>
                            <TableCell>{conn.sourcePort}</TableCell>
                            <TableCell className="font-medium">{getEquipmentName(conn.destinationEquipmentId)}</TableCell>
                            <TableCell>{conn.destinationPort}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{conn.cableType}</Badge>
                            </TableCell>
                            <TableCell>
                               <Badge variant={getStatusVariant(conn.status)}>{conn.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="w-8 h-8 p-0">
                                            <span className="sr-only">Abrir menu</span>
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                        <ConnectionDialog connection={conn}>
                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                              <Edit className="w-4 h-4 mr-2" /> Editar
                                          </DropdownMenuItem>
                                        </ConnectionDialog>
                                        <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => deleteConnection(conn.id)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    </div>
  );
}
