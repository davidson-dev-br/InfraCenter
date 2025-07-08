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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FloorPlanItemType } from "@/lib/types";
import { ICON_NAMES, getIconByName } from "@/lib/icon-map";
import React, { useState, useEffect } from "react";
import { useInfra } from "./datacenter-switcher";

type AddFloorPlanItemTypeDialogProps = {
    children: React.ReactNode;
    item?: FloorPlanItemType;
};

export function AddFloorPlanItemTypeDialog({ children, item }: AddFloorPlanItemTypeDialogProps) {
    const { addFloorPlanItemType, updateFloorPlanItemType } = useInfra();
    const [isOpen, setIsOpen] = useState(false);
    const isEditMode = !!item;

    const [name, setName] = useState("");
    const [icon, setIcon] = useState("Box");
    const [defaultWidth, setDefaultWidth] = useState(0.6);
    const [defaultLength, setDefaultLength] = useState(0.6);
    const [color, setColor] = useState("#334155");


    useEffect(() => {
        if (isOpen) {
            setName(item?.name || "");
            setIcon(item?.icon || "Box");
            setDefaultWidth(item?.defaultWidth || 0.6);
            setDefaultLength(item?.defaultLength || 0.6);
            setColor(item?.color || "#334155");
        }
    }, [isOpen, item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const itemData = { 
            name: name.trim(), 
            icon,
            defaultWidth,
            defaultLength,
            color
        };

        if (isEditMode && item) {
            updateFloorPlanItemType({ ...item, ...itemData });
        } else {
            addFloorPlanItemType(itemData);
        }
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Editar Tipo de Item' : 'Adicionar Novo Tipo de Item'}</DialogTitle>
                         <DialogDescription>
                            Configure o nome, ícone e dimensões padrão para este tipo de item.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="item-name">Nome do Tipo</Label>
                            <Input
                                id="item-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Servidor de Aplicação"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="item-icon">Ícone</Label>
                             <Select value={icon} onValueChange={setIcon}>
                                <SelectTrigger id="item-icon">
                                    <SelectValue placeholder="Selecione um ícone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="h-64">
                                        {ICON_NAMES.map(iconName => {
                                            const IconComponent = getIconByName(iconName);
                                            return (
                                                <SelectItem key={iconName} value={iconName}>
                                                    <div className="flex items-center gap-2">
                                                        <IconComponent className="w-4 h-4" />
                                                        <span>{iconName}</span>
                                                    </div>
                                                </SelectItem>
                                            )
                                        })}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="item-default-width">Largura Padrão (m)</Label>
                                <Input
                                    id="item-default-width"
                                    type="number"
                                    step="0.1"
                                    value={defaultWidth}
                                    onChange={(e) => setDefaultWidth(parseFloat(e.target.value) || 0)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="item-default-length">Comprimento Padrão (m)</Label>
                                <Input
                                    id="item-default-length"
                                    type="number"
                                    step="0.1"
                                    value={defaultLength}
                                    onChange={(e) => setDefaultLength(parseFloat(e.target.value) || 0)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="item-color">Cor do Item</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="item-color-picker"
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="p-1 h-10 w-14"
                                />
                                <Input
                                    id="item-color-text"
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    placeholder="#334155"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                             <Button type="button" variant="outline">Cancelar</Button>
                         </DialogClose>
                        <Button type="submit">{isEditMode ? 'Salvar Alterações' : 'Adicionar Item'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
