"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
import type { Equipment } from "@/lib/types";
import { useInfra } from "../datacenter-switcher";

type EquipamentoDialogProps = {
  children: React.ReactNode;
  equipamento?: Equipment;
};

export function EquipamentoDialog({ children, equipamento }: EquipamentoDialogProps) {
  const {
    itemsByRoom,
    equipmentTypes,
    addEquipment,
    updateEquipment
  } = useInfra();
  const [isOpen, setIsOpen] = useState(false);
  const isEditMode = !!equipamento;

  const parentItems = Object.values(itemsByRoom).flat().filter(item => item.type.toLowerCase().includes('rack'));

  const [formData, setFormData] = useState<Omit<Equipment, 'id'>>({
    hostname: '',
    type: '',
    parentItemId: '',
    positionU: '',
    imageUrl: '',
    brand: '',
    model: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && equipamento) {
        setFormData(equipamento);
      } else {
        setFormData({
          hostname: '',
          type: equipmentTypes.length > 0 ? equipmentTypes[0].name : '',
          parentItemId: parentItems.length > 0 ? parentItems[0].id : '',
          positionU: '',
          imageUrl: '',
          brand: '',
          model: ''
        });
      }
    }
  }, [isOpen, equipamento, isEditMode, equipmentTypes, parentItems]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelectChange = (id: 'type' | 'parentItemId') => (value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && equipamento) {
      updateEquipment({ ...equipamento, ...formData });
    } else {
      addEquipment(formData);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar Equipamento' : 'Adicionar Equipamento'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do seu ativo de hardware.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="hostname">Hostname</Label>
              <Input id="hostname" value={formData.hostname} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={handleSelectChange('type')}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentTypes.map(type => (
                    <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" value={formData.brand} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input id="model" value={formData.model} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentItemId">Item Pai</Label>
              <Select value={formData.parentItemId} onValueChange={handleSelectChange('parentItemId')}>
                <SelectTrigger id="parentItemId">
                  <SelectValue placeholder="Selecione o item pai" />
                </SelectTrigger>
                <SelectContent>
                  {parentItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="positionU">Posição (U)</Label>
              <Input id="positionU" value={formData.positionU} onChange={handleChange} placeholder="Ex: 39 ou 20-29" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="imageUrl">URL da Imagem</Label>
              <Input id="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">{isEditMode ? 'Salvar Alterações' : 'Adicionar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
