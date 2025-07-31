

"use client";

import { useState } from "react";
import { Loader2, Trash2, Archive } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { GridItem } from "@/types/datacenter";
import { deleteItem } from "@/lib/item-actions";

interface DeleteItemConfirmationDialogProps {
  item: GridItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (hardDelete: boolean) => void;
}

export function DeleteItemConfirmationDialog({ item, open, onOpenChange, onConfirm }: DeleteItemConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleAction = async (hardDelete: boolean) => {
    setIsDeleting(true);
    try {
      await deleteItem({ item: item, hardDelete });
      toast({
        title: "Sucesso!",
        description: `O item "${item.label}" foi ${hardDelete ? 'excluído permanentemente' : 'descomissionado'}.`,
      });
      onConfirm(hardDelete);
      onOpenChange(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido.";
      toast({
        variant: "destructive",
        title: "Erro ao Excluir",
        description: msg,
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const isDraft = item.status === 'draft';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            {isDraft ? (
              <>
                Você está prestes a excluir o rascunho do item <span className="font-bold">{item.label}</span>. 
                Esta ação é irreversível e o item não irá para a lixeira.
              </>
            ) : (
              <>
                Você está prestes a iniciar o processo de descomissionamento para o item <span className="font-bold">{item.label}</span>. 
                O item será movido para a lixeira.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          {isDraft ? (
            <Button
              variant="destructive"
              onClick={() => handleAction(true)}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Sim, excluir permanentemente
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => handleAction(false)}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
              Sim, descomissionar
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
