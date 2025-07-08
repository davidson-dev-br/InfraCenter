"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Edit } from "lucide-react";
import { useInfra } from "@/components/dashboard/datacenter-switcher";
import { DatacenterStatusDialog } from "@/components/dashboard/developer/datacenter-status-dialog";
import { DbActionsCard } from "@/components/dashboard/developer/db-actions-card";


export default function DeveloperSettingsPage() {
    const { systemSettings, setSystemSettings } = useInfra();
    const { equipmentTypes, deletionReasons, datacenterStatuses, equipmentStatuses, cableTypes } = systemSettings;

    const [newEquipmentType, setNewEquipmentType] = useState("");
    const [newDeletionReason, setNewDeletionReason] = useState("");
    const [newEquipmentStatus, setNewEquipmentStatus] = useState("");
    const [newCableType, setNewCableType] = useState("");

    const handleAdd = (field: keyof typeof systemSettings, value: string, setValue: (s:string)=>void) => {
        if (value.trim()) {
            const currentList = systemSettings[field] as { id: string, name: string }[];
            const updatedList = [...currentList, { id: Date.now().toString(), name: value.trim() }];
            setSystemSettings({ [field]: updatedList });
            setValue("");
        }
    }

    const handleDelete = (field: keyof typeof systemSettings, id: string) => {
        const currentList = systemSettings[field] as { id: string, name: string }[];
        const updatedList = currentList.filter(item => item.id !== id);
        setSystemSettings({ [field]: updatedList });
    }

    return (
        <div className="container p-4 mx-auto my-8 sm:p-8">
            <Card className="mb-8 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Configurações de Desenvolvedor</CardTitle>
                    <CardDescription>Gerencie opções e seletores utilizados em todo o sistema. As alterações aqui podem afetar a operação da aplicação.</CardDescription>
                </CardHeader>
            </Card>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <DbActionsCard />
                
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">Tipos de Equipamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Input
                                placeholder="Adicionar novo..."
                                value={newEquipmentType}
                                onChange={(e) => setNewEquipmentType(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd('equipmentTypes', newEquipmentType, setNewEquipmentType)}
                            />
                            <Button onClick={() => handleAdd('equipmentTypes', newEquipmentType, setNewEquipmentType)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar
                            </Button>
                        </div>
                        <ScrollArea className="h-72">
                            <div className="pr-4 space-y-2">
                                {equipmentTypes.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-2.5 border rounded-md bg-background hover:bg-muted/50">
                                        <span className="font-medium">{item.name}</span>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete('equipmentTypes', item.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">Motivos de Exclusão</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Input
                                placeholder="Adicionar novo..."
                                value={newDeletionReason}
                                onChange={(e) => setNewDeletionReason(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd('deletionReasons', newDeletionReason, setNewDeletionReason)}
                            />
                            <Button onClick={() => handleAdd('deletionReasons', newDeletionReason, setNewDeletionReason)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar
                            </Button>
                        </div>
                        <ScrollArea className="h-72">
                            <div className="pr-4 space-y-2">
                                {deletionReasons.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-2.5 border rounded-md bg-background hover:bg-muted/50">
                                        <span className="font-medium">{item.name}</span>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete('deletionReasons', item.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">Tipos de Cabo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Input
                                placeholder="Adicionar novo..."
                                value={newCableType}
                                onChange={(e) => setNewCableType(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd('cableTypes', newCableType, setNewCableType)}
                            />
                            <Button onClick={() => handleAdd('cableTypes', newCableType, setNewCableType)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar
                            </Button>
                        </div>
                        <ScrollArea className="h-72">
                            <div className="pr-4 space-y-2">
                                {cableTypes.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-2.5 border rounded-md bg-background hover:bg-muted/50">
                                        <span className="font-medium">{item.name}</span>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete('cableTypes', item.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-headline">Status do Datacenter</CardTitle>
                         <DatacenterStatusDialog>
                             <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar
                            </Button>
                        </DatacenterStatusDialog>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-72">
                            <div className="pr-4 space-y-2">
                                {datacenterStatuses.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-2.5 border rounded-md bg-background hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <span style={{ backgroundColor: item.color }} className="block w-4 h-4 border rounded-full" />
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <DatacenterStatusDialog status={item}>
                                                <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-muted/80">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </DatacenterStatusDialog>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete('datacenterStatuses', item.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
                
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">Status de Equipamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Input
                                placeholder="Adicionar novo..."
                                value={newEquipmentStatus}
                                onChange={(e) => setNewEquipmentStatus(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd('equipmentStatuses', newEquipmentStatus, setNewEquipmentStatus)}
                            />
                            <Button onClick={() => handleAdd('equipmentStatuses', newEquipmentStatus, setNewEquipmentStatus)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar
                            </Button>
                        </div>
                        <ScrollArea className="h-72">
                            <div className="pr-4 space-y-2">
                                {equipmentStatuses.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-2.5 border rounded-md bg-background hover:bg-muted/50">
                                        <span className="font-medium">{item.name}</span>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete('equipmentStatuses', item.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
