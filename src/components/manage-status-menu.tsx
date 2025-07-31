
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
import type { ItemStatus } from "@/lib/status-actions";
import { ManageStatusDialog } from "./manage-status-dialog";
import { DeleteStatusDialog } from "./delete-status-dialog";

interface ManageStatusMenuProps {
  status: ItemStatus;
}

export function ManageStatusMenu({ status }: ManageStatusMenuProps) {
  const [isManageOpen, setManageOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  const isDisabled = status.isDefault;

  const triggerButton = (
    <Button variant="ghost" size="icon" disabled={isDisabled}>
      <MoreVertical className="h-4 w-4" />
      <span className="sr-only">Gerenciar Status</span>
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
                <p>Status padrão não pode ser modificado.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
        )}
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setManageOpen(true)} disabled={isDisabled}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
            onSelect={() => setDeleteOpen(true)}
            disabled={isDisabled}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ManageStatusDialog
        mode="edit"
        status={status}
        open={isManageOpen}
        onOpenChange={setManageOpen}
      />
      
       <DeleteStatusDialog
        status={status}
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
