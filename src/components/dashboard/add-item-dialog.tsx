"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInfra } from "./datacenter-switcher";
import { getIconByName } from "@/lib/icon-map";
import type { FloorPlanItemType } from "@/lib/types";
import { ScrollArea } from "../ui/scroll-area";

type AddItemDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectItem: (itemType: FloorPlanItemType) => void;
  container?: HTMLElement | null;
};

export function AddItemDialog({ isOpen, onOpenChange, onSelectItem, container }: AddItemDialogProps) {
  const { systemSettings } = useInfra();
  const { floorPlanItemTypes } = systemSettings;

  const handleSelect = (itemType: FloorPlanItemType) => {
    onSelectItem(itemType);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent container={container} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Item</DialogTitle>
          <DialogDescription>
            Selecione o tipo de item que você deseja adicionar à planta baixa.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72">
            <div className="grid grid-cols-2 gap-4 p-1">
            {floorPlanItemTypes.map((itemType) => {
                const Icon = getIconByName(itemType.icon);
                return (
                <Button
                    key={itemType.id}
                    variant="outline"
                    className="flex-col h-24 gap-2"
                    onClick={() => handleSelect(itemType)}
                >
                    <Icon className="w-8 h-8 text-primary" />
                    <span className="font-medium text-sm">{itemType.name}</span>
                </Button>
                );
            })}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
