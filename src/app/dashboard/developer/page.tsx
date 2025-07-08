"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { useInfra } from "@/components/dashboard/datacenter-switcher";


export default function DeveloperSettingsPage() {
    const {
        equipmentTypes, addEquipmentType, deleteEquipmentType,
        deletionReasons, addDeletionReason, deleteDeletionReason,
        datacenterStatuses, addDatacenterStatus, deleteDatacenterStatus,
    } = useInfra();

    const [newEquipmentType, setNewEquipmentType] = useState("");
    const [newDeletionReason, setNewDeletionReason] = useState("");
    const [newDatacenterStatus, setNewDatacenterStatus] = useState("");


    const handleAddEquipmentType = () => {
        if (newEquipmentType.trim()) {
            addEquipmentType(newEquipmentType.trim());
            setNewEquipmentType("");
        }
    };

    const handleAddDeletionReason = () => {
        if (newDeletionReason.trim()) {
            addDeletionReason(newDeletionReason.trim());
            setNewDeletionReason("");
        }
    };

    const handleAddDatacenterStatus = () => {
        if (newDatacenterStatus.trim()) {
            addDatacenterStatus(newDatacenterStatus.trim());
            setNewDatacenterStatus("");
        }
    };

    return (
        <div className="container p-4 mx-auto my-8 sm:p-8">
            <Card className="mb-8 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Configurações de Desenvolvedor</CardTitle>
                    <CardDescription>Gerencie opções e seletores utilizados em todo o sistema. As alterações aqui podem afetar a operação da aplicação.</CardDescription>
                </CardHeader>
            </Card>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                                onKeyDown={(e) => e.key === 'Enter' && handleAddEquipmentType()}
                            />
                            <Button onClick={handleAddEquipmentType}>
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar
                            </Button>
                        </div>
                        <ScrollArea className="h-72">
                            <div className="pr-4 space-y-2">
                                {equipmentTypes.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-2.5 border rounded-md bg-background hover:bg-muted/50">
                                        <span className="font-medium">{item.name}</span>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => deleteEquipmentType(item.id)}>
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
                                onKeyDown={(e) => e.key === 'Enter' && handleAddDeletionReason()}
                            />
                            <Button onClick={handleAddDeletionReason}>
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar
                            </Button>
                        </div>
                        <ScrollArea className="h-72">
                            <div className="pr-4 space-y-2">
                                {deletionReasons.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-2.5 border rounded-md bg-background hover:bg-muted/50">
                                        <span className="font-medium">{item.name}</span>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => deleteDeletionReason(item.id)}>
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
                        <CardTitle className="text-xl font-headline">Status do Datacenter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Input
                                placeholder="Adicionar novo..."
                                value={newDatacenterStatus}
                                onChange={(e) => setNewDatacenterStatus(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddDatacenterStatus()}
                            />
                            <Button onClick={handleAddDatacenterStatus}>
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar
                            </Button>
                        </div>
                        <ScrollArea className="h-72">
                            <div className="pr-4 space-y-2">
                                {datacenterStatuses.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-2.5 border rounded-md bg-background hover:bg-muted/50">
                                        <span className="font-medium">{item.name}</span>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => deleteDatacenterStatus(item.id)}>
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
