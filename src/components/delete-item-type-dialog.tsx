

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import { deleteItemType } from "@/lib/item-types-actions";
import type { ItemType } from "@/lib/item-types-actions";
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
import { useToast } from "@/hooks/use-toast";

interface DeleteItemTypeDialogProps {
  itemType: ItemType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isParentType: boolean;
}

export function DeleteItemTypeDialog({ itemType, open, onOpenChange, isParentType }: DeleteItemTypeDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteItemType(itemType.id, isParentType);
      toast({
        title: "Sucesso!",
        description: `O tipo de item "${itemType.name}" foi excluído.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error("Falha ao excluir tipo de item:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Excluir",
        description: error.message || "Não foi possível excluir o tipo de item.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o tipo de item
            <span className="font-bold"> {itemType.name}</span>. Se houver algum equipamento
            deste tipo já criado no inventário, a exclusão falhará para proteger a integridade dos dados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Sim, excluir
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
