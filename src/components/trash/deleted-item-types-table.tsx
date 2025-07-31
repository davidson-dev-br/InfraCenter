

"use client";

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useRouter } from 'next/navigation';
import { Loader2, Trash, Undo, Puzzle } from 'lucide-react';
import { restoreItemType, permanentlyDeleteItemType, ItemType } from '@/lib/item-types-actions';

interface DeletedItemTypesTableProps {
  itemTypes: ItemType[];
}

export function DeletedItemTypesTable({ itemTypes }: DeletedItemTypesTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = React.useState<ItemType | null>(null);

  const handleRestore = async (typeId: string, typeName: string) => {
    setIsProcessing(typeId);
    try {
      await restoreItemType(typeId);
      toast({
        title: "Sucesso!",
        description: `O tipo de item "${typeName}" foi restaurado.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível restaurar o tipo de item.",
      });
    } finally {
      setIsProcessing(null);
    }
  };
  
  const handlePermanentDelete = async () => {
      if (!itemToDelete) return;

      setIsProcessing(itemToDelete.id);
      try {
          await permanentlyDeleteItemType(itemToDelete.id);
          toast({
              title: "Sucesso!",
              description: `O tipo de item "${itemToDelete.name}" foi excluído permanentemente.`,
          });
          setItemToDelete(null);
          router.refresh();
      } catch (error) {
          toast({
              variant: "destructive",
              title: "Erro",
              description: "Não foi possível excluir o tipo de item permanentemente.",
          });
      } finally {
        setIsProcessing(null);
      }
  }

  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itemTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell className="font-medium flex items-center gap-2">
                    <Puzzle className="h-4 w-4 text-muted-foreground"/>
                    {type.name}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{type.category}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                   <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestore(type.id, type.name)}
                    disabled={!!isProcessing}
                  >
                    {isProcessing === type.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Undo className="mr-2 h-4 w-4" />}
                    Restaurar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setItemToDelete(type)}
                    disabled={!!isProcessing}
                  >
                     {isProcessing === type.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
                    Excluir Perm.
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o tipo de item <span className="font-bold">{itemToDelete?.name}</span> do banco de dados.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handlePermanentDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Sim, excluir permanentemente
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
