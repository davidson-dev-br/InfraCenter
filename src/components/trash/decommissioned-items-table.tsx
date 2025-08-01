

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
import { Loader2, Trash, Undo, HardDrive, Puzzle } from 'lucide-react';
import { deleteItem, restoreItem } from '@/lib/item-actions';
import type { GridItem } from '@/types/datacenter';

// A luz no fim do túnel era só um print() que eu esqueci de tirar.

interface DecommissionedItemsTableProps {
  items: GridItem[];
}

export function DecommissionedItemsTable({ items }: DecommissionedItemsTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = React.useState<GridItem | null>(null);

  const handleRestore = async (item: GridItem) => {
    setIsProcessing(item.id);
    try {
      await restoreItem(item);
      toast({
        title: "Sucesso!",
        description: `O item "${item.label}" foi restaurado.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível restaurar o item.",
      });
    } finally {
      setIsProcessing(null);
    }
  };
  
  const handlePermanentDelete = async () => {
      if (!itemToDelete) return;

      setIsProcessing(itemToDelete.id);
      try {
          await deleteItem({ item: itemToDelete, hardDelete: true });
          toast({
              title: "Sucesso!",
              description: `O item "${itemToDelete.label}" foi excluído permanentemente.`,
          });
          setItemToDelete(null);
          router.refresh();
      } catch (error) {
          toast({
              variant: "destructive",
              title: "Erro",
              description: "Não foi possível excluir o item permanentemente.",
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
              <TableHead>Tipo</TableHead>
              <TableHead>Localização / Item Pai</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium flex items-center gap-2">
                    {item.parentId ? <HardDrive className="h-4 w-4 text-muted-foreground"/> : <Puzzle className="h-4 w-4 text-muted-foreground"/>}
                    {item.label}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.type}</Badge>
                </TableCell>
                <TableCell>
                  {item.parentName ? `Aninhado em: ${item.parentName}` : item.buildingName ? `${item.buildingName} / ${item.roomName}` : 'Sem localização'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                   <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestore(item)}
                    disabled={!!isProcessing}
                  >
                    {isProcessing === item.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Undo className="mr-2 h-4 w-4" />}
                    Restaurar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setItemToDelete(item)}
                    disabled={!!isProcessing}
                  >
                     {isProcessing === item.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
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
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o item <span className="font-bold">{itemToDelete?.label}</span> do banco de dados.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={!!isProcessing}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handlePermanentDelete} disabled={!!isProcessing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sim, excluir permanentemente
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
