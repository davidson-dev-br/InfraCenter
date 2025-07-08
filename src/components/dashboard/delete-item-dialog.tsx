"use client";

import React, { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlacedItem } from "@/lib/types";
import { useInfra } from "./datacenter-switcher";
import { AlertTriangle } from "lucide-react";

type DeleteItemDialogProps = {
    children: React.ReactNode;
    item: PlacedItem;
    onDeletionSuccess: () => void;
    container?: HTMLElement | null;
};

export function DeleteItemDialog({ children, item, onDeletionSuccess, container }: DeleteItemDialogProps) {
    const { deleteItem, deletionReasons } = useInfra();
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleDelete = () => {
        if (!reason) {
            setError("Por favor, selecione um motivo para a exclusão.");
            return;
        }
        setError("");
        deleteItem(item, reason);
        setIsOpen(false);
        onDeletionSuccess();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent container={container} className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                        Confirmar Exclusão
                    </DialogTitle>
                    <DialogDescription>
                        Você tem certeza que deseja excluir o item <strong>{item.name}</strong>? Esta ação não pode ser desfeita facilmente.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="deletion-reason">Motivo da Exclusão (obrigatório)</Label>
                    <Select value={reason} onValueChange={setReason}>
                        <SelectTrigger id="deletion-reason">
                            <SelectValue placeholder="Selecione um motivo..." />
                        </SelectTrigger>
                        <SelectContent>
                            {deletionReasons.map(r => (
                                <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter className="sm:justify-between">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>
                    </DialogClose>
                     <Button type="button" variant="destructive" onClick={handleDelete}>
                        Excluir Permanentemente
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
