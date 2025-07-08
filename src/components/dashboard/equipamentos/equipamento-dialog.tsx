"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

type EquipamentoDialogProps = {
  children: React.ReactNode;
  equipamento?: Equipment;
};

const getDefaultFormData = (): Omit<Equipment, 'id'> => ({
  hostname: '',
  model: '',
  price: 0,
  serialNumber: '',
  entryDate: '',
  type: '',
  brand: '',
  tag: '',
  description: '',
  sizeU: '',
  trellisId: '',
  positionU: '',
  ownerEmail: '',
  isTagEligible: false,
  isFrontFacing: false,
  status: '',
  parentItemId: '',
  dataSheetUrl: '',
  imageUrl: '',
});

export function EquipamentoDialog({ children, equipamento }: EquipamentoDialogProps) {
  const {
    buildings,
    itemsByRoom,
    equipmentTypes,
    equipmentStatuses,
    addEquipment,
    updateEquipment
  } = useInfra();
  const [isOpen, setIsOpen] = useState(false);
  const isEditMode = !!equipamento;

  const parentItems = useMemo(() => 
    Object.values(itemsByRoom).flat().filter(item => item.type.toLowerCase().includes('rack')),
    [itemsByRoom]
  );

  const [formData, setFormData] = useState<Omit<Equipment, 'id'>>(getDefaultFormData());

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && equipamento) {
        setFormData({
            ...getDefaultFormData(),
            ...equipamento
        });
      } else {
        setFormData({
            ...getDefaultFormData(),
            type: equipmentTypes.length > 0 ? equipmentTypes[0].name : '',
            status: equipmentStatuses.length > 0 ? equipmentStatuses[0].name : '',
            parentItemId: parentItems.length > 0 ? parentItems[0].id : '',
        });
      }
    }
  }, [isOpen, equipamento, isEditMode, equipmentTypes, equipmentStatuses, parentItems]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [id]: isNumber ? parseFloat(value) : value }));
  };

  const handleSelectChange = (id: 'type' | 'parentItemId' | 'status') => (value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id: 'isTagEligible' | 'isFrontFacing') => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
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

  const dcRoom = useMemo(() => {
    if (!formData.parentItemId) return 'N/A';

    for (const [roomId, items] of Object.entries(itemsByRoom)) {
      if (items.some(item => item.id === formData.parentItemId)) {
        for (const building of buildings) {
          const room = building.rooms.find(r => r.id === roomId);
          if (room) {
            return `${building.name} / ${room.name}`;
          }
        }
      }
    }
    return 'N/A';
  }, [formData.parentItemId, buildings, itemsByRoom]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar Equipamento' : 'Adicionar Equipamento'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do seu ativo de hardware.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[65vh] p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4 pr-4">
              <div className="space-y-2">
                <Label htmlFor="hostname">Hostname</Label>
                <Input id="hostname" value={formData.hostname} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" value={formData.model} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço</Label>
                <Input id="price" type="number" value={formData.price} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial</Label>
                <Input id="serialNumber" value={formData.serialNumber} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entryDate">Data de Entrada</Label>
                <Input id="entryDate" type="date" value={formData.entryDate} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={handleSelectChange('type')}>
                  <SelectTrigger id="type"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {equipmentTypes.map(type => (
                      <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Fabricante</Label>
                <Input id="brand" value={formData.brand} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag">TAG</Label>
                <Input id="tag" value={formData.tag} onChange={handleChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" value={formData.description} onChange={handleChange} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sizeU">Tamanho (U)</Label>
                <Input id="sizeU" value={formData.sizeU} onChange={handleChange} placeholder="Ex: 1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trellisId">Trellis ID</Label>
                <Input id="trellisId" value={formData.trellisId} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="positionU">Posição (U)</Label>
                <Input id="positionU" value={formData.positionU} onChange={handleChange} placeholder="Ex: 39 ou 20-29" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="ownerEmail">Owner (Email)</Label>
                <Input id="ownerEmail" type="email" value={formData.ownerEmail} onChange={handleChange} />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch id="isTagEligible" checked={formData.isTagEligible} onCheckedChange={handleSwitchChange('isTagEligible')} />
                <Label htmlFor="isTagEligible">Elegível TAG</Label>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch id="isFrontFacing" checked={formData.isFrontFacing} onCheckedChange={handleSwitchChange('isFrontFacing')} />
                <Label htmlFor="isFrontFacing">Front Facing</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={handleSelectChange('status')}>
                  <SelectTrigger id="status"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {equipmentStatuses.map(s => (
                      <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentItemId">Cabinet</Label>
                <Select value={formData.parentItemId} onValueChange={handleSelectChange('parentItemId')}>
                  <SelectTrigger id="parentItemId"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {parentItems.map(item => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="dcRoom">Sala de DC</Label>
                <Input id="dcRoom" value={dcRoom} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataSheetUrl">Data Sheet</Label>
                <Input id="dataSheetUrl" value={formData.dataSheetUrl} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="imageUrl">URL da Imagem</Label>
                <Input id="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
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
