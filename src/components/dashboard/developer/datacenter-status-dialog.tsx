"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StatusOption } from "@/lib/types";
import React, { useState, useEffect } from "react";
import { useInfra } from "@/components/dashboard/datacenter-switcher";

type DatacenterStatusDialogProps = {
    children: React.ReactNode;
    status?: StatusOption;
};

export function DatacenterStatusDialog({ children, status }: DatacenterStatusDialogProps) {
    const { systemSettings, setSystemSettings } = useInfra();
    const [isOpen, setIsOpen] = useState(false);
    const isEditMode = !!status;

    const [name, setName] = useState("");
    const [color, setColor] = useState("#334155");

    useEffect(() => {
        if (isOpen) {
            setName(status?.name || "");
            setColor(status?.color || "#334155");
        }
    }, [isOpen, status]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const statusData = { 
            name: name.trim(), 
            color
        };

        if (isEditMode && status) {
            const updatedStatuses = systemSettings.datacenterStatuses.map(s => 
                s.id === status.id ? { ...s, ...statusData } : s
            );
            setSystemSettings({ datacenterStatuses: updatedStatuses });
        } else {
            const newStatus = { ...statusData, id: Date.now().toString() };
            setSystemSettings({ 
                datacenterStatuses: [...systemSettings.datacenterStatuses, newStatus] 
            });
        }
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Editar Status' : 'Adicionar Novo Status'}</DialogTitle>
                         <DialogDescription>
                            Configure o nome e a cor para o status do datacenter.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="status-name">Nome do Status</Label>
                            <Input
                                id="status-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Online"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status-color">Cor do Status</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="status-color-picker"
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="p-1 h-10 w-14"
                                />
                                <Input
                                    id="status-color-text"
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    placeholder="#22c55e"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                             <Button type="button" variant="outline">Cancelar</Button>
                         </DialogClose>
                        <Button type="submit">{isEditMode ? 'Salvar Alterações' : 'Adicionar Status'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
