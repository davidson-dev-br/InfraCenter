
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
import type { Room } from "@/app/buildings/page";
import { RenameRoomDialog } from "./rename-room-dialog";
import { DeleteRoomDialog } from "./delete-room-dialog";

interface ManageRoomMenuProps {
  room: Room;
}

export function ManageRoomMenu({ room }: ManageRoomMenuProps) {
  const [isRenameOpen, setRenameOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Gerenciar Sala</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Sala
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <RenameRoomDialog
        room={room}
        open={isRenameOpen}
        onOpenChange={setRenameOpen}
      />

      <DeleteRoomDialog
        room={room}
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
