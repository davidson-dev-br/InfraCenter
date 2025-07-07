import type { LucideIcon } from "lucide-react";

export interface PlacedItem {
  id: string;
  type: string;
  icon: LucideIcon;
  gridPos: { x: number; y: number };
}

export interface Datacenter {
  id: string;
  name: string;
  location: string;
  status: "Online" | "Offline" | "Maintenance";
}
