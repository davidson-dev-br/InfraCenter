import type { LucideIcon } from "lucide-react";

export interface ActivityLogEntry {
  id: string;
  timestamp: string; // ISO 8601 format
  user: string;
  action: 'create' | 'update' | 'delete' | 'move' | 'approve' | 'login' | 'logout';
  category: 'Datacenter' | 'Room' | 'Item' | 'Equipment' | 'Connection' | 'User' | 'System';
  details: string;
}

export interface FloorPlanItemType {
  id: string;
  name: string;
  icon: string;
  defaultWidth: number; 
  defaultLength: number;
  color: string;
}

export interface PlacedItem {
  id: string;
  roomId: string; // ID of the room it's in
  name: string;
  type: string;
  icon: string; // Icon name from icon-map.ts
  x: number;
  y: number;
  status: 'Ativo' | 'Inativo' | 'Manutenção';
  width: number;
  length: number;
  sizeU?: number | null;
  row?: string | null;
  description?: string | null;
  awaitingApproval?: boolean;
  createdBy?: string | null;
  createdAt?: string | null;
  color?: string | null;
  // Fields for external system compatibility
  serialNumber?: string | null;
  entryDate?: string | null;
  brand?: string | null;
  tag?: string | null;
  trellisId?: string | null;
  ownerEmail?: string | null;
  isTagEligible?: boolean;
  dataSheetUrl?: string | null;
  imageUrl?: string | null;
}

export interface Equipment {
  id: string;
  hostname: string;
  model: string | null;
  price?: number | null;
  serialNumber: string | null;
  entryDate: string | null;
  type: string;
  brand: string | null;
  tag: string | null;
  description: string | null;
  sizeU: string | null;
  trellisId?: string | null;
  positionU: string | null;
  ownerEmail?: string | null;
  isTagEligible?: boolean;
  isFrontFacing?: boolean;
  status: string | null;
  parentItemId: string | null;
  dataSheetUrl?: string | null;
  imageUrl?: string | null;
}

export interface Connection {
  id: string;
  cableLabel?: string | null;
  sourceEquipmentId: string;
  sourcePort: string;
  destinationEquipmentId: string;
  destinationPort: string;
  cableType: string;
  status: 'Conectado' | 'Desconectado' | 'Planejado';
  isActive: boolean;
  notes?: string | null;
}

export interface DeletionLogEntry {
  id: string;
  itemId: string;
  itemName: string;
  itemType: string;
  deletedBy: string;
  deletedAt: string;
  reason: string;
  roomId: string; 
  itemData: Omit<PlacedItem, 'icon'> & { icon: string }; // Store icon name as string
}

export type UserRole = string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  signatureUrl?: string | null;
  datacenterId?: string | null;
}

export interface Room {
  id: string;
  name: string;
  width: number;
  length: number;
  tileWidth: number;
  tileLength: number;
}

export interface Building {
  id: string;
  name: string;
  location: string;
  status: string;
  rooms: Room[];
}

export interface StatusOption {
  id: string;
  name: string;
  color: string;
}

export interface SelectOption {
    id: string;
    name: string;
}

export interface RolePermissions {
  canSwitchDatacenter: boolean;
  canSeeManagementMenu: boolean;
  canAccessApprovalCenter: boolean;
  canAccessActivityLog: boolean;
  canAccessDeletionLog: boolean;
  canManageUsers: boolean;
  canManageDatacenters: boolean;
  canCreateDatacenters: boolean;
  canAccessSystemSettings: boolean;
  canAccessDeveloperPage: boolean;
}

export interface SystemSettings {
    companyName: string;
    companyLogo: string | null;
    userRoles: SelectOption[];
    equipmentTypes: SelectOption[];
    deletionReasons: SelectOption[];
    datacenterStatuses: StatusOption[];
    equipmentStatuses: SelectOption[];
    cableTypes: SelectOption[];
    floorPlanItemTypes: FloorPlanItemType[];
    rolePermissions: Record<UserRole, RolePermissions>;
}
