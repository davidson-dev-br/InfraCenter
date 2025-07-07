import type { LucideIcon } from "lucide-react";

export interface PlacedItem {
  id: string;
  name: string;
  type: string;
  icon: LucideIcon;
  x: number;
  y: number;
  status?: 'Ativo' | 'Inativo' | 'Manutenção';
  width?: number;
  length?: number;
  sizeU?: number;
  row?: string;
  observations?: string;
  awaitingApproval?: boolean;
  awaitingDeletion?: boolean;
  createdBy?: string;
  createdAt?: string;
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
  rooms: Room[];
}

// For the admin page (separate mock data)
export interface Datacenter {
  id: string;
  name: string;
  location: string;
  status: "Online" | "Offline" | "Maintenance";
}
