"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type IAEquipamentoDialogProps = {
  children: React.ReactNode;
};

export function IAEquipamentoDialog({ children }: IAEquipamentoDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Equipamento com Foto (IA)</DialogTitle>
          <DialogDescription>
            Envie uma foto do seu equipamento e nossa IA tentará preencher os detalhes automaticamente. Esta funcionalidade está em desenvolvimento.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ia-photo">Foto do Equipamento</Label>
            <Input id="ia-photo" type="file" disabled />
          </div>
          <p className="text-sm text-center text-muted-foreground font-semibold py-2 px-4 bg-yellow-100/50 border border-yellow-200 rounded-md">
            Funcionalidade em breve!
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Fechar</Button>
          </DialogClose>
          <Button type="button" disabled>
            Analisar Foto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
