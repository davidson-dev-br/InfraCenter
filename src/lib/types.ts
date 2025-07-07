import type { LucideIcon } from "lucide-react";

export interface PlacedItem {
  id: string;
  name: string;
  type: string;
  icon: LucideIcon;
  x: number;
  y: number;
  notifications?: number;
}

export interface Datacenter {
  id: string;
  name: string;
  location: string;
  status: "Online" | "Offline" | "Maintenance";
}
