"use client";

import { Building as BuildingType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { DatacenterDialog } from "@/components/dashboard/admin/datacenter-dialog";
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
import { cn } from "@/lib/utils";
import { useInfra } from "../datacenter-switcher";

type DatacentersTableProps = {
  data: BuildingType[];
};

export function DatacentersTable({ data }: DatacentersTableProps) {
  const { deleteBuilding } = useInfra();

  return (
    <div className="border rounded-lg">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="font-semibold">Nome</TableHead>
                    <TableHead className="font-semibold">Localização</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((dc) => (
                    <TableRow key={dc.id}>
                        <TableCell className="font-medium">{dc.name}</TableCell>
                        <TableCell>{dc.location}</TableCell>
                        <TableCell>
                            <Badge variant={dc.status === 'Online' ? 'default' : dc.status === 'Offline' ? 'destructive' : 'secondary'}
                                className={cn(dc.status === 'Online' && 'bg-green-500 hover:bg-green-600', dc.status === 'Maintenance' && 'bg-amber-500 hover:bg-amber-600')}
                            >
                                {dc.status}
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
                                    <DatacenterDialog building={dc}>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                            <Edit className="w-4 h-4 mr-2" /> Editar
                                        </DropdownMenuItem>
                                    </DatacenterDialog>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => deleteBuilding(dc.id)}>
                                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );
}
