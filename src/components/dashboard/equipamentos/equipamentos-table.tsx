"use client";

import Image from "next/image";
import type { Equipment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useInfra } from "../datacenter-switcher";
import { EquipamentoDialog } from "./equipamento-dialog";

type EquipamentosTableProps = {
  data: Equipment[];
};

export function EquipamentosTable({ data }: EquipamentosTableProps) {
  const { itemsByRoom, deleteEquipment } = useInfra();
  const allPlacedItems = Object.values(itemsByRoom).flat();

  const getParentName = (parentItemId: string) => {
    return allPlacedItems.find(p => p.id === parentItemId)?.name || 'N/A';
  };

  return (
    <div className="border rounded-lg">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px]">Imagem</TableHead>
                    <TableHead>Hostname</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Item Pai</TableHead>
                    <TableHead>Pos(U)</TableHead>
                    <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            Nenhum equipamento cadastrado.
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((eq) => (
                        <TableRow key={eq.id}>
                            <TableCell>
                                <Image
                                    src={eq.imageUrl || 'https://placehold.co/64x64.png'}
                                    alt={eq.hostname}
                                    width={64}
                                    height={64}
                                    className="object-cover rounded-md"
                                    data-ai-hint="network hardware"
                                />
                            </TableCell>
                            <TableCell className="font-medium">{eq.hostname}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{eq.type}</Badge>
                            </TableCell>
                            <TableCell>{getParentName(eq.parentItemId)}</TableCell>
                            <TableCell>{eq.positionU}</TableCell>
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
                                        <EquipamentoDialog equipamento={eq}>
                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                              <Edit className="w-4 h-4 mr-2" /> Editar
                                          </DropdownMenuItem>
                                        </EquipamentoDialog>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => deleteEquipment(eq.id)}>
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
