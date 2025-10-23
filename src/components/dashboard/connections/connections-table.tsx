
"use client";

import type { Connection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MoreHorizontal, Edit, Trash2, AlertTriangle } from "lucide-react";
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

type ConnectionsTableProps = {
  data: Connection[];
  onEdit: (connection: Connection) => void;
};

export function ConnectionsTable({ data, onEdit }: ConnectionsTableProps) {
  const { equipment, deleteConnection } = useInfra();

  const getEquipmentName = (equipmentId: string) => {
    return equipment.find(e => e.id === equipmentId)?.hostname || <span className="text-muted-foreground">N/A</span>;
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
        <TooltipProvider>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Alerta</TableHead>
                        <TableHead>Origem</TableHead>
                        <TableHead>Porta</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Porta</TableHead>
                        <TableHead>Tipo de Cabo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ativa</TableHead>
                        <TableHead><span className="sr-only">Ações</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                Nenhuma conexão cadastrada.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((conn) => (
                            <TableRow key={conn.id} className={conn.alert ? 'bg-yellow-500/10' : ''}>
                                <TableCell>
                                    {conn.alert && (
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{conn.alert}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </TableCell>
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
                                <TableCell>
                                    <Badge variant={conn.isActive ? 'default' : 'secondary'}>
                                        {conn.isActive ? 'Sim' : 'Não'}
                                    </Badge>
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
                                            <DropdownMenuItem onSelect={() => onEdit(conn)} className="cursor-pointer">
                                                <Edit className="w-4 h-4 mr-2" /> Editar
                                            </DropdownMenuItem>
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
        </TooltipProvider>
    </div>
  );
}
