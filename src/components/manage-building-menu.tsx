
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, PlusCircle, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AddRoomDialog } from "./add-room-dialog";
import { DeleteBuildingDialog } from "./delete-building-dialog";
import { EditBuildingDialog } from "./edit-building-dialog";


interface Building {
  id: string;
  name: string;
  address?: string;
}

interface ManageBuildingMenuProps {
  building: Building;
}

export function ManageBuildingMenu({ building }: ManageBuildingMenuProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Gerenciar Prédio</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{building.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsAddRoomDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Sala
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Prédio
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
            onSelect={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Prédio
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddRoomDialog 
        buildingId={building.id} 
        buildingName={building.name}
        open={isAddRoomDialogOpen} 
        onOpenChange={setIsAddRoomDialogOpen} 
      />
      
      <DeleteBuildingDialog
        building={building}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
      
      <EditBuildingDialog
        building={building}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
