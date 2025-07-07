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

export interface Datacenter {
  id: string;
  name: string;
  location: string;
  status: "Online" | "Offline" | "Maintenance";
}
