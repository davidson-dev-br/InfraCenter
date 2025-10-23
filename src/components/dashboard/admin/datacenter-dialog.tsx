"use client";

import React, { useState, useEffect } from "react";
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
import { Building as BuildingType } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInfra } from "../datacenter-switcher";

type DatacenterDialogProps = {
    children: React.ReactNode;
    building?: BuildingType;
}

export function DatacenterDialog({ children, building }: DatacenterDialogProps) {
    const { addBuilding, updateBuilding, systemSettings } = useInfra();
    const { datacenterStatuses } = systemSettings;
    const [isOpen, setIsOpen] = useState(false);
    const isEditMode = !!building;

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('Online');

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && building) {
                setName(building.name);
                setLocation(building.location);
                setStatus(building.status);
            } else {
                setName('');
                setLocation('');
                setStatus(datacenterStatuses?.[0]?.name || 'Online');
            }
        }
    }, [isOpen, building, isEditMode, datacenterStatuses]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const buildingData = { name, location, status };
        
        if (isEditMode && building) {
            updateBuilding({ ...building, ...buildingData });
        } else {
            addBuilding(buildingData);
        }
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Editar Datacenter' : 'Criar Datacenter'}</DialogTitle>
                        <DialogDescription>
                            {isEditMode ? "Faça alterações no seu datacenter aqui." : "Adicione um novo datacenter à sua infraestrutura."} Clique em salvar quando terminar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nome
                            </Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="location" className="text-right">
                                Localização
                            </Label>
                            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select value={status} onValueChange={setStatus} required>
                                <SelectTrigger id="status" className="col-span-3">
                                    <SelectValue placeholder="Selecione um status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {datacenterStatuses?.map(statusOption => (
                                        <SelectItem key={statusOption.id} value={statusOption.name}>{statusOption.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">Salvar Alterações</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
