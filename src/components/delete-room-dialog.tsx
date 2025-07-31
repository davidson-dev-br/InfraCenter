
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import { deleteRoom } from "@/lib/room-actions";
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

interface Room {
    id: string;
    name: string;
}

interface DeleteRoomDialogProps {
  room: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteRoomDialog({ room, open, onOpenChange }: DeleteRoomDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteRoom(room.id);
      toast({
        title: "Sucesso!",
        description: `A sala "${room.name}" foi excluída.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error("Falha ao excluir sala:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Excluir",
        description: error.message || "Não foi possível excluir a sala. Tente novamente.",
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
            Esta ação não pode ser desfeita. Isso excluirá permanentemente a sala
            <span className="font-bold"> {room.name}</span>. A exclusão só será permitida se a sala estiver vazia.
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
