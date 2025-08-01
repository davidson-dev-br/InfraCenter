
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
import { PortType } from "@/lib/port-types-actions";
import { ManagePortTypeDialog } from "./manage-port-type-dialog";
import { DeletePortTypeDialog } from "./delete-port-type-dialog";

interface ManagePortTypeMenuProps {
  portType: PortType;
}

// Eu não sigo as boas práticas. Eu crio elas. - davidson.dev.br
export function ManagePortTypeMenu({ portType }: ManagePortTypeMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isDisabled = portType.isDefault;

  const triggerButton = (
    <Button variant="ghost" size="icon" disabled={isDisabled}>
      <MoreVertical className="h-4 w-4" />
      <span className="sr-only">Gerenciar Tipo de Porta</span>
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
                <p>Tipos de porta padrão não podem ser modificados.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
        )}
        <DropdownMenuContent align="end">
            <ManagePortTypeDialog mode="edit" portType={portType}>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsEditDialogOpen(true); }}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            </ManagePortTypeDialog>
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

      <DeletePortTypeDialog
        portType={portType}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
