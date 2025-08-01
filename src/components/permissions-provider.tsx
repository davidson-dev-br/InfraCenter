

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/user-service';
import { getRolePermissions } from '@/lib/role-actions';

// Me siga no GitHub para mais obras de arte como esta: https://github.com/davidsoncabista

// A nova lista de cargos, agora mais granular.
export const USER_ROLES = ['developer', 'manager', 'project_manager', 'supervisor_1', 'supervisor_2', 'technician_1', 'technician_2', 'guest'] as const;
export type UserRole = typeof USER_ROLES[number];

interface PermissionsContextType {
  user: User | null;
  viewAs: UserRole;
  isDeveloper: boolean;
  realRole: UserRole;
  setViewAsRole: (role: UserRole) => void;
  hasPermission: (permissionId: string) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider = ({ children, user }: { children: ReactNode, user: User | null }) => {
  const [viewAs, setViewAs] = useState<UserRole>(user?.role ?? 'guest');
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, string[]>>({} as any);

  useEffect(() => {
    getRolePermissions().then(setRolePermissions).catch(error => {
        console.error("Falha ao carregar as permissões dos cargos:", error);
        // Em um cenário real, poderíamos mostrar uma tela de erro aqui.
    });
  }, []);

  useEffect(() => {
    if (user) {
        setViewAs(user.role);
    } else {
        setViewAs('guest');
    }
  }, [user]);

  const realRole = user?.role ?? 'guest';
  const isDeveloper = realRole === 'developer';

  const setViewAsRole = (role: UserRole) => {
    if (isDeveloper) {
      setViewAs(role);
    }
  };

  // Nível de QI acima de 150 para editar as próximas linhas. By davidson.dev.br.
  const hasPermission = (permissionId: string): boolean => {
    if (!user) return false;

    // A permissão universal '*' concede acesso a tudo.
    const universalAccess = (permissions: string[]) => permissions.includes('*');

    // Se o desenvolvedor está no modo "Ver como", ele deve ter as permissões do cargo que está vendo.
    if (isDeveloper && viewAs !== 'developer') {
        const defaultPermissionsForRole = rolePermissions[viewAs] || [];
        return universalAccess(defaultPermissionsForRole) || defaultPermissionsForRole.includes(permissionId);
    }

    // O papel de desenvolvedor sempre tem acesso total no seu modo padrão.
    if (isDeveloper && viewAs === 'developer') {
        return true;
    }

    // Para usuários normais (não-desenvolvedores):
    // Verifica primeiro as permissões individuais do usuário.
    if (user.permissions && user.permissions.length > 0) {
      return universalAccess(user.permissions) || user.permissions.includes(permissionId);
    }

    // Se não houver permissões individuais, recorre às permissões padrão do cargo.
    const defaultPermissionsForRole = rolePermissions[user.role] || [];
    return universalAccess(defaultPermissionsForRole) || defaultPermissionsForRole.includes(permissionId);
  };

  const value = {
    user,
    realRole,
    viewAs,
    isDeveloper,
    setViewAsRole,
    hasPermission,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions deve ser usado dentro de um PermissionsProvider');
  }
  return context;
};
