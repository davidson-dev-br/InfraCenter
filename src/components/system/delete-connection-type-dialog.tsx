
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import { deleteConnectionType, ConnectionType } from "@/lib/connection-types-actions";
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

interface DeleteConnectionTypeDialogProps {
  connectionType: ConnectionType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteConnectionTypeDialog({ connectionType, open, onOpenChange }: DeleteConnectionTypeDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteConnectionType(connectionType.id);
      toast({
        title: "Sucesso!",
        description: `O tipo de conexão "${connectionType.name}" foi excluído.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao Excluir",
        description: error.message || "Não foi possível excluir o tipo de conexão. Verifique se ele não está em uso.",
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
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o tipo de conexão
            <span className="font-bold"> {connectionType.name}</span>. Se este tipo estiver sendo usado por alguma conexão, a exclusão pode falhar.
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
