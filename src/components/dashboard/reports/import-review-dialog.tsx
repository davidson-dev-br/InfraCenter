
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Loader2, Save, Trash2, Check } from "lucide-react";
import type { ImportedEquipment } from '@/ai/schemas';
import { cn } from '@/lib/utils';

type ImportReviewDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  equipmentList: ImportedEquipment[];
  onConfirmImport: (finalList: ImportedEquipment[]) => Promise<void>;
};

export function ImportReviewDialog({
  isOpen,
  onOpenChange,
  equipmentList,
  onConfirmImport,
}: ImportReviewDialogProps) {
  const [editedEquipment, setEditedEquipment] = useState<Record<number, ImportedEquipment>>({});
  const [discardedIndices, setDiscardedIndices] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialEdits = equipmentList.reduce((acc, equip, index) => {
        acc[index] = equip;
        return acc;
      }, {} as Record<number, ImportedEquipment>);
      setEditedEquipment(initialEdits);
      setDiscardedIndices(new Set());
    }
  }, [isOpen, equipmentList]);

  const handleFieldChange = (index: number, field: keyof ImportedEquipment, value: string) => {
    setEditedEquipment(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value,
      },
    }));
  };

  const toggleDiscard = (index: number) => {
    setDiscardedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleConfirmClick = async () => {
    setIsSaving(true);
    const finalList = Object.entries(editedEquipment)
      .filter(([index]) => !discardedIndices.has(Number(index)))
      .map(([, data]) => data);

    await onConfirmImport(finalList);
    setIsSaving(false);
    onOpenChange(false);
  };
  
  const headers: { key: keyof ImportedEquipment, label: string }[] = [
      { key: 'hostname', label: 'Hostname' },
      { key: 'type', label: 'Tipo' },
      { key: 'brand', label: 'Fabricante' },
      { key: 'model', label: 'Modelo' },
      { key: 'serialNumber', label: 'Serial' },
      { key: 'status', label: 'Status' },
      { key: 'positionU', label: 'Pos(U)' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-6 h-6" />
            Revisar Equipamentos para Importação
          </DialogTitle>
          <DialogDescription>
            Verifique e corrija os dados extraídos da planilha. Marque os itens para descartá-los antes de confirmar a importação.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-12">
                   <Checkbox
                        checked={discardedIndices.size === equipmentList.length}
                        onCheckedChange={(checked) => {
                            const newSet = new Set<number>();
                            if (checked) {
                                equipmentList.forEach((_, index) => newSet.add(index));
                            }
                            setDiscardedIndices(newSet);
                        }}
                        aria-label="Selecionar todos para descarte"
                    />
                </TableHead>
                {headers.map(h => <TableHead key={h.key}>{h.label}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipmentList.map((equip, index) => {
                const isDiscarded = discardedIndices.has(index);
                const currentData = editedEquipment[index] || {};
                return (
                  <TableRow key={index} className={cn(isDiscarded && "opacity-50 bg-muted/50")}>
                    <TableCell>
                      <Checkbox
                        checked={isDiscarded}
                        onCheckedChange={() => toggleDiscard(index)}
                        aria-label="Descartar item"
                      />
                    </TableCell>
                    {headers.map(header => (
                         <TableCell key={header.key}>
                            <Input
                                value={currentData[header.key] || ''}
                                onChange={(e) => handleFieldChange(index, header.key, e.target.value)}
                                disabled={isDiscarded}
                                className="h-8 text-xs"
                            />
                        </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmClick} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Confirmar e Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
