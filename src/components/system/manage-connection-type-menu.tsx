
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConnectionType } from "@/lib/connection-types-actions";
import { ManageConnectionTypeDialog } from "./manage-connection-type-dialog";
import { DeleteConnectionTypeDialog } from "./delete-connection-type-dialog";

interface ManageConnectionTypeMenuProps {
  connectionType: ConnectionType;
}

export function ManageConnectionTypeMenu({ connectionType }: ManageConnectionTypeMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isDisabled = connectionType.isDefault;

  const triggerButton = (
    <Button variant="ghost" size="icon" disabled={isDisabled}>
      <MoreVertical className="h-4 w-4" />
      <span className="sr-only">Gerenciar Tipo de Conexão</span>
    </Button>
  );

  return (
    <>
      <DropdownMenu>
        {isDisabled ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{triggerButton}</TooltipTrigger>
              <TooltipContent>
                <p>Tipos de conexão padrão não podem ser modificados.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
        )}
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)} disabled={isDisabled}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
            onSelect={() => setIsDeleteDialogOpen(true)}
            disabled={isDisabled}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ManageConnectionTypeDialog mode="edit" connectionType={connectionType}>
          <div data-state={isEditDialogOpen ? 'open' : 'closed'} onPointerDownOutside={() => setIsEditDialogOpen(false)} />
      </ManageConnectionTypeDialog>

      <DeleteConnectionTypeDialog
        connectionType={connectionType}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
