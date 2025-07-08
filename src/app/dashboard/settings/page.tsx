
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";

// Mock data based on the image
const initialEquipmentTypes = [
    { id: '1', name: 'Servidor' },
    { id: '2', name: 'Switch' },
    { id: '3', name: 'Patch Panel' },
    { id: '4', name: 'Storage' },
    { id: '5', name: 'Roteador' },
];

const initialDeletionReasons = [
    { id: '1', name: 'Item criado por engano' },
    { id: '2', name: 'Item desativado (decommissioned)' },
    { id: '3', name: 'Substituído por novo item' },
    { id: '4', name: 'Erro de inventário' },
];

const initialFloorPlanItems = [
    { id: '1', name: 'Rack' },
    { id: '2', name: 'Ar Condicionado' },
    { id: '3', name: 'QDF' },
    { id: '4', name: 'Patch Panel' },
];


export default function SystemSettingsPage() {
    const [equipmentTypes, setEquipmentTypes] = useState(initialEquipmentTypes);
    const [newEquipmentType, setNewEquipmentType] = useState("");
    const [deletionReasons, setDeletionReasons] = useState(initialDeletionReasons);
    const [newDeletionReason, setNewDeletionReason] = useState("");
    const [floorPlanItems, setFloorPlanItems] = useState(initialFloorPlanItems);
    const [newFloorPlanItem, setNewFloorPlanItem] = useState("");

    const handleAddEquipmentType = () => {
        if (newEquipmentType.trim()) {
            setEquipmentTypes(prev => [...prev, { id: Date.now().toString(), name: newEquipmentType.trim() }]);
            setNewEquipmentType("");
        }
    };

    const handleDeleteEquipmentType = (id: string) => {
        setEquipmentTypes(prev => prev.filter(item => item.id !== id));
    };

    const handleAddDeletionReason = () => {
        if (newDeletionReason.trim()) {
            setDeletionReasons(prev => [...prev, { id: Date.now().toString(), name: newDeletionReason.trim() }]);
            setNewDeletionReason("");
        }
    };

    const handleDeleteDeletionReason = (id: string) => {
        setDeletionReasons(prev => prev.filter(item => item.id !== id));
    };

    const handleAddFloorPlanItem = () => {
        if (newFloorPlanItem.trim()) {
            setFloorPlanItems(prev => [...prev, { id: Date.now().toString(), name: newFloorPlanItem.trim() }]);
            setNewFloorPlanItem("");
        }
    };

    const handleDeleteFloorPlanItem = (id: string) => {
        setFloorPlanItems(prev => prev.filter(item => item.id !== id));
    };
    
    return (
        <div className="container p-4 mx-auto my-8 sm:p-8">
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
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteEquipmentType(item.id)}>
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
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDeletionReason(item.id)}>
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
                        <CardTitle className="text-xl font-headline">Items da Planta Baixa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Input
                                placeholder="Adicionar novo..."
                                value={newFloorPlanItem}
                                onChange={(e) => setNewFloorPlanItem(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddFloorPlanItem()}
                            />
                            <Button onClick={handleAddFloorPlanItem}>
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar
                            </Button>
                        </div>
                        <ScrollArea className="h-72">
                            <div className="pr-4 space-y-2">
                                {floorPlanItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-2.5 border rounded-md bg-background hover:bg-muted/50">
                                        <span className="font-medium">{item.name}</span>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteFloorPlanItem(item.id)}>
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
