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
import type { Connection } from "@/lib/types";
import { useInfra } from "../datacenter-switcher";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

const CABLE_TYPES = ['CAT6 UTP', 'CAT6a UTP', 'CAT7 STP', 'Fibra Óptica OM3', 'Fibra Óptica OM4', 'Fibra Óptica OS2', 'DAC (Direct Attach Copper)'];
const CONNECTION_STATUSES: Connection['status'][] = ['Conectado', 'Desconectado', 'Planejado'];

type ConnectionDialogProps = {
  children: React.ReactNode;
  connection?: Connection;
};

export function ConnectionDialog({ children, connection }: ConnectionDialogProps) {
  const { equipment, addConnection, updateConnection } = useInfra();
  const [isOpen, setIsOpen] = useState(false);
  const isEditMode = !!connection;

  const getDefaultFormData = (): Omit<Connection, 'id'> => ({
    sourceEquipmentId: equipment[0]?.id || '',
    sourcePort: '',
    destinationEquipmentId: equipment[1]?.id || '',
    destinationPort: '',
    cableType: CABLE_TYPES[0],
    status: 'Planejado',
    notes: ''
  });

  const [formData, setFormData] = useState(getDefaultFormData());

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && connection) {
        setFormData(connection);
      } else {
        setFormData(getDefaultFormData());
      }
    }
  }, [isOpen, connection, isEditMode, equipment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof Omit<Connection, 'id'>) => (value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && connection) {
      updateConnection({ ...connection, ...formData });
    } else {
      addConnection(formData);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar Conexão' : 'Adicionar Conexão'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da conexão física entre dois equipamentos.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4 pr-4">
              
              <div className="md:col-span-2 font-semibold text-lg pb-2 border-b">Ponto de Origem (A)</div>
              <div className="space-y-2">
                <Label htmlFor="sourceEquipmentId">Equipamento de Origem</Label>
                <Select value={formData.sourceEquipmentId} onValueChange={handleSelectChange('sourceEquipmentId')} required>
                  <SelectTrigger id="sourceEquipmentId"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {equipment.map(eq => (
                      <SelectItem key={eq.id} value={eq.id}>{eq.hostname}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourcePort">Porta de Origem</Label>
                <Input id="sourcePort" value={formData.sourcePort} onChange={handleChange} required placeholder="Ex: Gi1/0/1" />
              </div>

              <div className="md:col-span-2 font-semibold text-lg pt-4 pb-2 border-b">Ponto de Destino (B)</div>
              <div className="space-y-2">
                <Label htmlFor="destinationEquipmentId">Equipamento de Destino</Label>
                <Select value={formData.destinationEquipmentId} onValueChange={handleSelectChange('destinationEquipmentId')} required>
                  <SelectTrigger id="destinationEquipmentId"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {equipment.map(eq => (
                      <SelectItem key={eq.id} value={eq.id}>{eq.hostname}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="destinationPort">Porta de Destino</Label>
                <Input id="destinationPort" value={formData.destinationPort} onChange={handleChange} required placeholder="Ex: Eth2" />
              </div>

              <div className="md:col-span-2 font-semibold text-lg pt-4 pb-2 border-b">Detalhes da Conexão</div>
               <div className="space-y-2">
                <Label htmlFor="cableType">Tipo de Cabo</Label>
                <Select value={formData.cableType} onValueChange={handleSelectChange('cableType')} required>
                  <SelectTrigger id="cableType"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {CABLE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={handleSelectChange('status')} required>
                  <SelectTrigger id="status"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {CONNECTION_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" value={formData.notes || ''} onChange={handleChange} rows={3} />
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
