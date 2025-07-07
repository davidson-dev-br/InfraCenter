"use client";

import { Datacenter } from "@/lib/types";
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

type DatacentersTableProps = {
  data: Datacenter[];
};

export function DatacentersTable({ data }: DatacentersTableProps) {
  return (
    <div className="border rounded-lg">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
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
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DatacenterDialog datacenter={dc}>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                            <Edit className="w-4 h-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                    </DatacenterDialog>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive cursor-pointer">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
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
