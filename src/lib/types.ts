import type { LucideIcon } from "lucide-react";

export interface FloorPlanItemType {
  id: string;
  name: string;
  icon: string;
  defaultWidth?: number; // in meters
  defaultLength?: number; // in meters
  color?: string;
}

export interface PlacedItem {
  id: string;
  name: string;
  type: string;
  icon: LucideIcon;
  x: number;
  y: number;
  status: 'Ativo' | 'Inativo' | 'Manutenção';
  width: number; // in meters
  length: number; // in meters
  sizeU?: number;
  row?: string;
  observations?: string;
  awaitingApproval?: boolean;
  createdBy?: string;
  createdAt?: string;
  color?: string;
}

export interface DeletionLogEntry {
  id: string;
  itemId: string;
  itemName: string;
  itemType: string;
  deletedBy: string;
  deletedAt: string;
  reason: string;
}

// For the main dashboard infrastructure
export interface Room {
  id: string;
  name: string;
  width: number; // in meters
  length: number; // in meters
  tileWidth: number; // in cm
  tileLength: number; // in cm
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
