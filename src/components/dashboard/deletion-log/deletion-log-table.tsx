"use client";

import type { DeletionLogEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, History } from "lucide-react";
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

type DeletionLogTableProps = {
  data: DeletionLogEntry[];
};

export function DeletionLogTable({ data }: DeletionLogTableProps) {
  const { restoreItem } = useInfra();

  return (
    <div className="border rounded-lg">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Item Excluído</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Excluído por</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            Nenhum item no log de exclusão.
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.itemName}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{entry.itemType}</Badge>
                            </TableCell>
                            <TableCell>{entry.reason}</TableCell>
                            <TableCell>{entry.deletedBy}</TableCell>
                            <TableCell>{entry.deletedAt}</TableCell>
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
                                        <DropdownMenuItem onClick={() => restoreItem(entry.id)} className="cursor-pointer">
                                            <History className="w-4 h-4 mr-2" /> Restaurar Item
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
