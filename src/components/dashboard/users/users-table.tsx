"use client";

import Image from "next/image";
import type { User } from "@/lib/types";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInfra } from "../datacenter-switcher";
import { UserDialog } from "./user-dialog";

// Helper to capitalize role names for display
const formatRoleName = (role: string) => {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1);
};

type UsersTableProps = {
  data: User[];
};

export function UsersTable({ data }: UsersTableProps) {
  const { deleteUser, buildings } = useInfra();

  const getRoleVariant = (role: User['role']): 'default' | 'secondary' | 'outline' => {
      switch (role) {
          case 'developer':
          case 'manager':
              return 'default';
          case 'supervisor':
              return 'secondary';
          case 'technician':
              return 'outline';
          default:
              return 'secondary';
      }
  }

  const getDatacenterName = (id?: string) => {
    if (!id) return 'N/A';
    return buildings.find(b => b.id === id)?.name || 'Desconhecido';
  }

  return (
    <div className="border rounded-lg">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[64px]">Avatar</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Datacenter</TableHead>
                    <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            Nenhum usuário cadastrado.
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <Avatar>
                                    <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={getRoleVariant(user.role)}>{formatRoleName(user.role)}</Badge>
                            </TableCell>
                            <TableCell>
                                {user.role === 'technician' ? getDatacenterName(user.datacenterId) : 'Todos'}
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
                                        <UserDialog user={user}>
                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                              <Edit className="w-4 h-4 mr-2" /> Editar
                                          </DropdownMenuItem>
                                        </UserDialog>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => deleteUser(user.id)}>
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
