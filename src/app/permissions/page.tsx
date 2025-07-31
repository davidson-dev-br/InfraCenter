
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPermissionsByCategory } from "@/lib/permissions-registry";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getRolePermissions, updateRolePermissions } from "@/lib/role-actions";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/components/permissions-provider";
import { USER_ROLES } from "@/components/permissions-provider";

const roleLabels: Record<UserRole, string> = {
  developer: 'Desenvolvedor',
  manager: 'Gerente',
  project_manager: 'Gerente de Projeto',
  supervisor_1: 'Supervisor 1',
  supervisor_2: 'Supervisor 2',
  technician_1: 'Técnico 1',
  technician_2: 'Técnico 2',
  guest: 'Convidado',
};

type RolePermissionsMap = Record<UserRole, string[]>;

export default function PermissionsPage() {
  const [rolePermissions, setRolePermissions] = React.useState<RolePermissionsMap | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    getRolePermissions().then(setRolePermissions).catch(err => {
      console.error("Failed to load permissions:", err);
      toast({
        variant: "destructive",
        title: "Erro Crítico",
        description: "Não foi possível carregar as permissões dos cargos. A página pode não funcionar corretamente.",
      });
    });
  }, [toast]);

  const handlePermissionChange = (role: UserRole, permissionId: string, checked: boolean) => {
    setRolePermissions(prev => {
      if (!prev) return null;
      const newPermissions = { ...prev };
      const currentPermissions = newPermissions[role] || [];
      if (checked) {
        if (!currentPermissions.includes(permissionId)) {
          newPermissions[role] = [...currentPermissions, permissionId];
        }
      } else {
        newPermissions[role] = currentPermissions.filter(id => id !== permissionId);
      }
      return newPermissions;
    });
  };

  const handleSave = async () => {
    if (!rolePermissions) return;
    setIsSubmitting(true);
    try {
      await updateRolePermissions(rolePermissions);
      toast({
        title: "Sucesso!",
        description: "As permissões dos cargos foram atualizadas.",
      });
      router.refresh();
    } catch (error) {
      console.error("Falha ao salvar permissões:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPermission = (role: UserRole, permissionId: string) => {
    if (!rolePermissions) return false;
    const permissions = rolePermissions[role] || [];
    return permissions.includes('*') || permissions.includes(permissionId);
  };
  
  const isCheckboxDisabled = (role: UserRole) => role === 'developer';

  const permissionsByCategory = getPermissionsByCategory();
  const roles = USER_ROLES.filter(r => r !== 'guest'); // Filtra 'guest' para não exibir na matriz.

  if (!rolePermissions) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold font-headline">Gerenciamento de Permissões</h1>
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Controle de Acesso por Cargo</CardTitle>
            <CardDescription>Carregando as configurações de permissões...</CardDescription>
          </CardHeader>
          <CardContent>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline">Gerenciamento de Permissões</h1>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Alterações
            </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Controle de Acesso por Cargo</CardTitle>
          <CardDescription>
            Marque as caixas para conceder ou remover permissões padrão para cada cargo no sistema. O cargo de Desenvolvedor tem acesso total e não pode ser alterado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[350px] font-semibold text-foreground">Permissão</TableHead>
                  {roles.map(role => (
                    <TableHead key={role} className="text-center font-semibold text-foreground">{roleLabels[role]}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <React.Fragment key={category}>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableCell colSpan={roles.length + 1} className="font-bold text-foreground">
                        {category}
                      </TableCell>
                    </TableRow>
                    {permissions.map(permission => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-xs text-muted-foreground">{permission.description}</div>
                        </TableCell>
                        {roles.map(role => (
                          <TableCell key={`${permission.id}-${role}`} className="text-center">
                            <Checkbox
                              checked={hasPermission(role, permission.id)}
                              onCheckedChange={(checked) => handlePermissionChange(role, permission.id, !!checked)}
                              disabled={isCheckboxDisabled(role)}
                              aria-label={`Permissão ${permission.name} para ${roleLabels[role]}`}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
