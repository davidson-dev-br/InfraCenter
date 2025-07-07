"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { PlacedItem } from "@/lib/types";
import { Clock, CheckCircle2, Trash2 } from "lucide-react";
import React from "react";

type ItemDetailsDialogProps = {
  item: PlacedItem | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function ItemDetailsDialog({ item, isOpen, onOpenChange }: ItemDetailsDialogProps) {
  if (!item) return null;

  const handleClose = () => onOpenChange(false);

  // This is a mock handler. In a real app this would save to a DB.
  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSaveChanges}>
            <DialogHeader>
                <DialogTitle>Detalhes do Item: {item.name}</DialogTitle>
                <DialogDescription>
                    Edite as propriedades do item selecionado.
                </DialogDescription>
            </DialogHeader>

            {item.awaitingApproval && (
                <div className="pt-4">
                    <Badge variant="outline" className="text-amber-600 border-amber-500 bg-amber-50 w-fit font-semibold">
                        <Clock className="w-4 h-4 mr-2" />
                        Aguardando Aprovação
                    </Badge>
                </div>
            )}
            
            <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" defaultValue={item.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select defaultValue={item.status}>
                            <SelectTrigger id="status">
                            <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Ativo">Ativo</SelectItem>
                            <SelectItem value="Inativo">Inativo</SelectItem>
                            <SelectItem value="Manutenção">Manutenção</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="width">Largura (m)</Label>
                        <Input id="width" type="number" step="0.1" defaultValue={item.width} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="length">Comprimento (m)</Label>
                        <Input id="length" type="number" step="0.1" defaultValue={item.length} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sizeU">Tamanho (U)</Label>
                        <Input id="sizeU" type="number" defaultValue={item.sizeU} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="row">Fileira</Label>
                        <Input id="row" defaultValue={item.row} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="observations">Observações</Label>
                    <Textarea id="observations" defaultValue={item.observations} rows={3} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="photo">Foto do Item</Label>
                    <Input id="photo" type="file" />
                </div>
            </div>

            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:w-full">
                <Button variant="destructive" type="button" className="sm:mr-auto"><Trash2 className="mr-2 h-4 w-4"/> Mover para Lixeira</Button>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <Button variant="default" className="text-white bg-green-600 hover:bg-green-700" type="button">
                        <CheckCircle2 className="mr-2 h-4 w-4"/> Aprovar
                    </Button>
                    <Button variant="outline" type="button" onClick={handleClose}>Cancelar</Button>
                    <Button type="submit">Salvar Alterações</Button>
                </div>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
