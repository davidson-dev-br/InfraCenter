import type { LucideIcon } from "lucide-react";

export interface PlacedItem {
  id: string;
  name: string;
  type: string;
  icon: LucideIcon;
  x: number;
  y: number;
  notifications?: number;
  status?: 'Ativo' | 'Inativo' | 'Manutenção';
  width?: number;
  length?: number;
  sizeU?: number;
  row?: string;
  observations?: string;
  awaitingApproval?: boolean;
}

export interface Datacenter {
  id: string;
  name: string;
  location: string;
  status: "Online" | "Offline" | "Maintenance";
}
