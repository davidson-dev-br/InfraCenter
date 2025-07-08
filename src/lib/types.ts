import type { LucideIcon } from "lucide-react";

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
  icon: LucideIcon | string; // Allow string for serialization
  x: number;
  y: number;
  status: 'Ativo' | 'Inativo' | 'Manutenção';
  width: number;
  length: number;
  sizeU?: number;
  row?: string;
  observations?: string;
  awaitingApproval?: boolean;
  createdBy?: string;
  createdAt?: string;
  color?: string;
}

export interface Equipment {
  id: string;
  hostname: string;
  type: string;
  parentItemId: string; // Cabinet ID
  positionU: string;
  imageUrl?: string;
  brand?: string;
  model?: string;
  price?: number;
  serialNumber?: string;
  entryDate?: string;
  tag?: string;
  description?: string;
  sizeU?: string;
  trellisId?: string;
  ownerEmail?: string;
  isTagEligible?: boolean;
  isFrontFacing?: boolean;
  status?: string;
  dataSheetUrl?: string;
}

export interface Connection {
  id: string;
  cableLabel?: string;
  sourceEquipmentId: string;
  sourcePort: string;
  destinationEquipmentId: string;
  destinationPort: string;
  cableType: string;
  status: 'Conectado' | 'Desconectado' | 'Planejado';
  isActive: boolean;
  notes?: string;
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

export type UserRole = 'technician' | 'supervisor' | 'manager' | 'developer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  datacenterId?: string; // ID of the datacenter for technicians
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

export interface SystemSettings {
    companyName: string;
    companyLogo: string | null;
    equipmentTypes: SelectOption[];
    deletionReasons: SelectOption[];
    datacenterStatuses: StatusOption[];
    equipmentStatuses: SelectOption[];
    cableTypes: SelectOption[];
    floorPlanItemTypes: FloorPlanItemType[];
}
