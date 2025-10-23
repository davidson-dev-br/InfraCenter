"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInfra } from './datacenter-switcher';
import type { Room } from '@/lib/types';
import { cn } from '@/lib/utils';


export function ManageRoomsDialog({ children }: { children: React.ReactNode }) {
    const { buildings, selectedBuildingId, addRoom, updateRoom, deleteRoom, reorderRooms } = useInfra();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    const defaultFormState = {
        name: '',
        width: 20,
        length: 20,
        tileWidth: 60,
        tileLength: 60,
    };
    const [formData, setFormData] = useState(defaultFormState);
    
    useEffect(() => {
        if (!isDialogOpen) {
            setEditingRoom(null);
        }
    }, [isDialogOpen]);
    
    useEffect(() => {
        if (editingRoom) {
            setFormData({
                name: editingRoom.name,
                width: editingRoom.width,
                length: editingRoom.length,
                tileWidth: editingRoom.tileWidth,
                tileLength: editingRoom.tileLength,
            });
        } else {
            setFormData(defaultFormState);
        }
    }, [editingRoom]);
    

    const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
    const rooms = selectedBuilding?.rooms || [];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({...prev, [id]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBuildingId || !formData.name.trim()) return;

        if (editingRoom) {
            updateRoom(selectedBuildingId, { ...editingRoom, ...formData, name: formData.name.trim() });
        } else {
            addRoom(selectedBuildingId, { ...formData, name: formData.name.trim() });
        }
        setEditingRoom(null);
    };
    
    const handleCancelEdit = () => {
        setEditingRoom(null);
    };
    
    const handleDeleteClick = (roomId: string) => {
        if (selectedBuildingId) {
            if (editingRoom?.id === roomId) {
                setEditingRoom(null);
            }
            deleteRoom(selectedBuildingId, roomId);
        }
    };
    
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-4xl p-0">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-2xl font-bold">Gerenciar Salas</DialogTitle>
                    <DialogDescription>
                        Adicione, edite, exclua ou reordene as salas do prédio selecionado.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 pt-0">
                    <form className="flex flex-col pt-2" onSubmit={handleSubmit}>
                        <h3 className="text-lg font-semibold mb-4">
                             {editingRoom ? `Editando: ${editingRoom.name}` : 'Adicionar Nova Sala'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nome da Sala</Label>
                                <Input 
                                    id="name" 
                                    className="mt-1"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ex: Sala de Baterias"
                                    disabled={!selectedBuilding}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="width">Largura (metros)</Label>
                                    <Input id="width" type="number" className="mt-1" value={formData.width} onChange={handleChange} disabled={!selectedBuilding}/>
                                </div>
                                <div>
                                    <Label htmlFor="length">Comprimento (metros)</Label>
                                    <Input id="length" type="number" className="mt-1" value={formData.length} onChange={handleChange} disabled={!selectedBuilding}/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="tileWidth">Largura da Placa (cm)</Label>
                                    <Input id="tileWidth" type="number" className="mt-1" value={formData.tileWidth} onChange={handleChange} disabled={!selectedBuilding}/>
                                </div>
                                <div>
                                    <Label htmlFor="tileLength">Comprimento da Placa (cm)</Label>
                                    <Input id="tileLength" type="number" className="mt-1" value={formData.tileLength} onChange={handleChange} disabled={!selectedBuilding}/>
                                </div>
                            </div>
                        </div>
                        <div className="flex-grow"></div>
                        <div className="flex justify-end items-center gap-4 mt-8">
                             {editingRoom && (
                                <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                                    Cancelar Edição
                                </Button>
                            )}
                            <Button type="submit" disabled={!selectedBuilding || !formData.name.trim()}>
                                {editingRoom ? 'Salvar Alterações' : 'Adicionar Sala'}
                            </Button>
                        </div>
                    </form>

                    <div className="space-y-4 pt-2">
                        <h3 className="text-lg font-semibold">
                            Salas Existentes em: {selectedBuilding ? `"${selectedBuilding.name}"` : '(Nenhum prédio selecionado)'}
                        </h3>
                        <div className={cn("p-3 border rounded-lg bg-secondary/20", !selectedBuilding && "flex items-center justify-center")}>
                             <ScrollArea className="h-48">
                                <div className="space-y-2 pr-3">
                                    {!selectedBuilding || rooms.length === 0 ? (
                                        <div className="flex items-center justify-center h-48 text-muted-foreground">
                                            {selectedBuilding ? 'Nenhuma sala. Adicione uma nova.' : 'Selecione um prédio'}
                                        </div>
                                    ) : (
                                      <>
                                        <div className="grid grid-cols-[60px_1fr_auto] items-center gap-4 px-2 pb-2 text-sm font-medium text-muted-foreground">
                                            <div>Ordem</div>
                                            <div>Nome</div>
                                            <div className="text-right">Ações</div>
                                        </div>
                                        {rooms.map((room, index) => (
                                            <div key={room.id} className="grid grid-cols-[60px_1fr_auto] items-center gap-4 px-2 py-1 rounded-md bg-background">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => reorderRooms(selectedBuilding.id, room.id, 'up')} disabled={index === 0}>
                                                        <ArrowUp className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => reorderRooms(selectedBuilding.id, room.id, 'down')} disabled={index === rooms.length - 1}>
                                                        <ArrowDown className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div className="font-medium truncate">{room.name}</div>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" className="h-8 px-4" onClick={() => setEditingRoom(room)}>Editar</Button>
                                                    <Button variant="destructive" size="sm" className="h-8 px-4" onClick={() => handleDeleteClick(room.id)}>Excluir</Button>
                                                </div>
                                            </div>
                                        ))}
                                      </>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
