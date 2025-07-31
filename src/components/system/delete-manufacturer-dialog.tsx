
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import { deleteManufacturer, Manufacturer } from "@/lib/manufacturer-actions";
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

interface DeleteManufacturerDialogProps {
  manufacturer: Manufacturer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteManufacturerDialog({ manufacturer, open, onOpenChange }: DeleteManufacturerDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteManufacturer(manufacturer.id);
      toast({
        title: "Sucesso!",
        description: `O fabricante "${manufacturer.name}" foi excluído.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao Excluir",
        description: error.message || "Não foi possível excluir o fabricante. Verifique se ele não está em uso.",
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
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o fabricante
            <span className="font-bold"> {manufacturer.name}</span>. Se algum equipamento estiver usando este fabricante, a exclusão pode falhar.
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
