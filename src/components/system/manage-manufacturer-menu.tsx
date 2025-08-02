
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
import { Manufacturer } from "@/lib/manufacturer-actions";
import { ManageManufacturerDialog } from "@/components/system/manage-manufacturer-dialog";
import { DeleteManufacturerDialog } from "@/components/system/delete-manufacturer-dialog";

interface ManageManufacturerMenuProps {
  manufacturer: Manufacturer;
}

export function ManageManufacturerMenu({ manufacturer }: ManageManufacturerMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Gerenciar Fabricante</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={(e) => {e.preventDefault(); setIsEditDialogOpen(true)}}>
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
      
       <ManageManufacturerDialog mode="edit" manufacturer={manufacturer} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            {/* O trigger está no DropdownMenuItem, então o children aqui pode ser vazio */}
            <></>
       </ManageManufacturerDialog>

      <DeleteManufacturerDialog
        manufacturer={manufacturer}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
