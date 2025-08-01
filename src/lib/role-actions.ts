
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { UserRole } from '@/components/permissions-provider';

type RolePermissionsMap = Record<UserRole, string[]>;
type RolesFileStructure = Record<UserRole, { name: string; description: string; permissions: string[] }>;

const rolesFilePath = path.join(process.cwd(), 'roles.json');

// CUIDADO: Terreno minado.
// Esta função lê um arquivo JSON do sistema de arquivos para definir as permissões.
// Se este arquivo for corrompido ou inacessível, a aplicação inteira para.
export async function getRolePermissions(): Promise<RolePermissionsMap> {
  try {
    const fileContent = await fs.readFile(rolesFilePath, 'utf-8');
    const rolesData: RolesFileStructure = JSON.parse(fileContent);
    
    const permissionsMap: RolePermissionsMap = {} as RolePermissionsMap;
    for (const role in rolesData) {
      if (Object.prototype.hasOwnProperty.call(rolesData, role)) {
        permissionsMap[role as UserRole] = rolesData[role as UserRole].permissions;
      }
    }
    return permissionsMap;

  } catch (error) {
    console.error('CRITICAL: Error reading or parsing roles.json. The application may not function correctly.', error);
    // In case of a critical error (e.g., file deleted), we throw to avoid running with invalid permissions.
    throw new Error('Could not load role permissions from roles.json.');
  }
}

export async function updateRolePermissions(newPermissions: RolePermissionsMap): Promise<void> {
  try {
    const fileContent = await fs.readFile(rolesFilePath, 'utf-8');
    const fullRolesData: RolesFileStructure = JSON.parse(fileContent);

    const updatedRolesData = { ...fullRolesData };

    for (const role in newPermissions) {
      if (Object.prototype.hasOwnProperty.call(newPermissions, role)) {
        // Ensure we only update existing roles, preventing accidental additions.
        if (updatedRolesData[role as UserRole]) {
          updatedRolesData[role as UserRole].permissions = newPermissions[role as UserRole];
        }
      }
    }
    
    // Ensure the developer role always has wildcard permissions and cannot be changed.
    if (updatedRolesData.developer) {
        updatedRolesData.developer.permissions = ['*'];
    }
  
    await fs.writeFile(rolesFilePath, JSON.stringify(updatedRolesData, null, 2), 'utf-8');
  } catch (error)
  {
    console.error('Error writing to roles.json:', error);
    throw new Error('Failed to update role permissions.');
  }
}

