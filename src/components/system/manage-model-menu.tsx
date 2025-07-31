
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
import { Model, deleteModel } from "@/lib/models-actions";
import { ManageModelDialog } from "./manage-model-dialog";
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
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ManageModelMenuProps {
  model: Model;
}

export function ManageModelMenu({ model }: ManageModelMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        await deleteModel(model.id);
        toast({ title: "Sucesso!", description: "Modelo excluído." });
        setIsDeleteDialogOpen(false);
        router.refresh();
    } catch (error: any) {
        toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
        setIsDeleting(false);
    }
  };


  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Gerenciar Modelo</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
            onSelect={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

       <ManageModelDialog mode="edit" model={model}>
          {/* Este Dialog é aberto programaticamente, então o trigger é um fragmento vazio */}
          <div data-state={isEditDialogOpen ? 'open' : 'closed'} onPointerDownOutside={() => setIsEditDialogOpen(false)} />
       </ManageModelDialog>
      
      {/* Dialog de Edição */}
      {isEditDialogOpen && (
        <ManageModelDialog mode="edit" model={model}>
          <div/>
        </ManageModelDialog>
      )}


      {/* Dialog de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta ação não pode ser desfeita e excluirá permanentemente o modelo <span className="font-bold">{model.name}</span>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                     {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sim, excluir
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
