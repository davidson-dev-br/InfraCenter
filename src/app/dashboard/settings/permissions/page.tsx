
"use client";

import React from 'react';
import Link from 'next/link';
import { useInfra } from '@/components/dashboard/datacenter-switcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { UserRole, RolePermissions } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Lock, ArrowLeft } from 'lucide-react';

const PERMISSION_LABELS: Record<keyof RolePermissions, string> = {
  canSwitchDatacenter: 'Pode trocar de Datacenter',
  canSeeManagementMenu: 'Pode ver o menu de Gerenciamento',
  canAccessApprovalCenter: 'Pode acessar Aprovações',
  canAccessActivityLog: 'Pode acessar Log de Atividades',
  canAccessDeletionLog: 'Pode acessar Log de Exclusões',
  canManageUsers: 'Pode gerenciar Usuários',
  canManageDatacenters: 'Pode gerenciar Datacenters',
  canCreateDatacenters: 'Pode criar Datacenters',
  canAccessSystemSettings: 'Pode acessar Configurações do Sistema',
  canManagePermissions: 'Pode gerenciar Permissões de Cargos',
  canAccessDeveloperPage: 'Pode acessar a página de Desenvolvedor',
};

// Helper to capitalize role names for display
const formatRoleName = (role: string) => {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1);
};


export default function PermissionsPage() {
  const { systemSettings, setSystemSettings } = useInfra();
  const { toast } = useToast();
  const [permissions, setPermissions] = React.useState(systemSettings.rolePermissions);

  React.useEffect(() => {
    setPermissions(systemSettings.rolePermissions);
  }, [systemSettings.rolePermissions]);

  const handlePermissionChange = (role: UserRole, permission: keyof RolePermissions, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: value,
      },
    }));
  };

  const handleSaveChanges = () => {
    setSystemSettings({ rolePermissions: permissions });
    // Toast is handled inside setSystemSettings
  };

  const roles = Object.keys(permissions || {}).sort((a, b) => {
      if (a === 'developer') return 1;
      if (b === 'developer') return -1;
      return a.localeCompare(b);
  }) as UserRole[];

  return (
    <div className="container p-4 mx-auto my-8 sm:p-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-headline">Gerenciamento de Permissões</CardTitle>
              <CardDescription>Defina o que cada cargo de usuário pode ver e fazer no sistema.</CardDescription>
            </div>
            <Button variant="outline" asChild>
                <Link href="/dashboard/settings">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Voltar
                </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {roles.map(role => (
          <Card key={role}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{formatRoleName(role)}</CardTitle>
              {role === 'developer' && <Lock className="w-5 h-5 text-muted-foreground" />}
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(PERMISSION_LABELS).map(key => {
                const permissionKey = key as keyof RolePermissions;
                return (
                  <div key={permissionKey} className="flex items-center justify-between p-3 border rounded-md">
                    <Label htmlFor={`${role}-${permissionKey}`} className="flex-1 cursor-pointer pr-4">{PERMISSION_LABELS[permissionKey]}</Label>
                    <Switch
                      id={`${role}-${permissionKey}`}
                      checked={permissions?.[role]?.[permissionKey] || false}
                      onCheckedChange={(value) => handlePermissionChange(role, permissionKey, value)}
                      disabled={role === 'developer'} // Developer role is always all-powerful
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-end mt-8">
        <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
      </div>
    </div>
  );
}
