

"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ItemType } from "@/lib/item-types-actions";
import { DeleteItemTypeDialog } from "./delete-item-type-dialog";
import { EditItemTypeDialog } from "./edit-item-type-dialog";

interface ManageItemTypeMenuProps {
  itemType: ItemType;
  isParentType: boolean;
}

export function ManageItemTypeMenu({ itemType, isParentType }: ManageItemTypeMenuProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Gerenciar Tipo de Item</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
            onSelect={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteItemTypeDialog
        itemType={itemType}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        isParentType={isParentType}
      />
      
      <EditItemTypeDialog
        itemType={itemType}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        isParentType={isParentType}
      />
    </>
  );
}
