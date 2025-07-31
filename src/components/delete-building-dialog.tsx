
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import { deleteBuilding } from "@/lib/building-actions";
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

interface DeleteBuildingDialogProps {
  building: {
    id: string;
    name: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteBuildingDialog({ building, open, onOpenChange }: DeleteBuildingDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBuilding(building.id);
      toast({
        title: "Sucesso!",
        description: `O prédio "${building.name}" e todas as suas salas foram excluídos.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Falha ao excluir prédio:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Excluir",
        description: "Não foi possível excluir o prédio. Tente novamente.",
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
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o prédio
            <span className="font-bold"> {building.name} </span>
            e todas as salas e itens contidos nele.
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
