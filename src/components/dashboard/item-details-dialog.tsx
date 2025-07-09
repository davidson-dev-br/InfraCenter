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
import React, { useState, useEffect } from "react";
import { DeleteItemDialog } from "./delete-item-dialog";

type ItemDetailsDialogProps = {
  item: PlacedItem | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (updatedItem: PlacedItem) => void;
  container?: HTMLElement | null;
};

export function ItemDetailsDialog({ item, isOpen, onOpenChange, onSave, container }: ItemDetailsDialogProps) {
  const [formData, setFormData] = useState<Partial<PlacedItem>>({});

  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [id]: isNumber ? parseFloat(value) || 0 : value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as PlacedItem['status'] }));
  };
  
  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
        const sanitizedData = {
            ...formData,
            row: formData.row || null,
            observations: formData.observations || null,
            color: formData.color || null,
        };
        onSave({ ...item, ...sanitizedData } as PlacedItem);
    }
  };

  const handleApprove = () => {
    if (item) {
      const sanitizedData = {
          ...formData,
          awaitingApproval: false,
          row: formData.row || null,
          observations: formData.observations || null,
          color: formData.color || null,
      };
      onSave({ ...item, ...sanitizedData } as PlacedItem);
    }
  }

  const handleDeletionSuccess = () => {
    onOpenChange(false); // Close the details dialog after deletion
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent container={container} className="sm:max-w-2xl">
        <form onSubmit={handleSaveChanges}>
            <DialogHeader>
                <DialogTitle>Detalhes do Item: {formData.name}</DialogTitle>
                <DialogDescription>
                    Edite as propriedades do item selecionado.
                </DialogDescription>
            </DialogHeader>

            {formData.awaitingApproval && (
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
                        <Input id="name" value={formData.name || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={handleSelectChange}>
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
                        <Input id="width" type="number" step="0.1" value={formData.width || 0} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="length">Comprimento (m)</Label>
                        <Input id="length" type="number" step="0.1" value={formData.length || 0} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sizeU">Tamanho (U)</Label>
                        <Input id="sizeU" type="number" value={formData.sizeU || 0} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="row">Fileira</Label>
                        <Input id="row" value={formData.row || ''} onChange={handleChange} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="color">Cor do Item</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="color"
                            type="color"
                            value={formData.color || '#334155'}
                            onChange={handleChange}
                            className="p-1 h-10 w-14"
                        />
                         <Input
                            id="color-text"
                            name="color"
                            type="text"
                            value={formData.color || '#334155'}
                            onChange={handleChange}
                            className="flex-1"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="observations">Observações</Label>
                    <Textarea id="observations" value={formData.observations || ''} onChange={handleChange} rows={3} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="photo">Foto do Item</Label>
                    <Input id="photo" type="file" />
                </div>
            </div>

            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:w-full">
                <DeleteItemDialog item={item} onDeletionSuccess={handleDeletionSuccess} container={container}>
                    <Button variant="destructive" type="button" className="sm:mr-auto"><Trash2 className="mr-2 h-4 w-4"/> Mover para Lixeira</Button>
                </DeleteItemDialog>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    {formData.awaitingApproval && (
                      <Button variant="default" className="text-white bg-green-600 hover:bg-green-700" type="button" onClick={handleApprove}>
                          <CheckCircle2 className="mr-2 h-4 w-4"/> Aprovar
                      </Button>
                    )}
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit">Salvar Alterações</Button>
                </div>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
