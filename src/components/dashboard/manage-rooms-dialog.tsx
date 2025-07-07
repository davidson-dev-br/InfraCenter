"use client";

import { useState } from 'react';
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
import { useDatacenter } from './datacenter-switcher';

export function ManageRoomsDialog({ children }: { children: React.ReactNode }) {
    const { datacenters, addDatacenter, deleteDatacenter, reorderDatacenters } = useDatacenter();
    const [newRoomName, setNewRoomName] = useState('');

    const handleAddRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRoomName.trim()) {
            addDatacenter(newRoomName.trim());
            setNewRoomName('');
        }
    };
    
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-4xl p-0">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-2xl font-bold">Gerenciar Salas</DialogTitle>
                    <DialogDescription>
                        Adicione, edite, exclua ou reordene as salas do seu datacenter.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 pt-0">
                    {/* Add New Room Section */}
                    <div className="flex flex-col pt-2">
                        <h3 className="text-lg font-semibold mb-4">Adicionar Nova Sala</h3>
                        <form className="space-y-4 flex-grow flex flex-col" onSubmit={handleAddRoom}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="room-name">Nome da Sala</Label>
                                    <Input 
                                        id="room-name" 
                                        className="mt-1"
                                        value={newRoomName}
                                        onChange={(e) => setNewRoomName(e.target.value)}
                                        placeholder="Ex: Sala de Baterias"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="room-width-m">Largura (metros)</Label>
                                        <Input id="room-width-m" className="mt-1" disabled />
                                    </div>
                                    <div>
                                        <Label htmlFor="room-length-m">Comprimento (metros)</Label>
                                        <Input id="room-length-m" className="mt-1" disabled />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="tile-width-cm">Largura da Placa (cm)</Label>
                                        <Input id="tile-width-cm" defaultValue="60" className="mt-1" disabled />
                                    </div>
                                    <div>
                                        <Label htmlFor="tile-length-cm">Comprimento da Placa (cm)</Label>
                                        <Input id="tile-length-cm" defaultValue="60" className="mt-1" disabled />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-grow"></div>
                            <Button type="submit">Salvar Sala</Button>
                        </form>
                    </div>

                    {/* Existing Rooms Section */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-lg font-semibold">Salas Existentes</h3>
                        <div className="p-3 border rounded-lg bg-secondary/20">
                            <div className="grid grid-cols-[60px_1fr_auto] items-center gap-4 px-2 pb-2 text-sm font-medium text-muted-foreground">
                                <div>Ordem</div>
                                <div>Nome</div>
                                <div className="text-right">Ações</div>
                            </div>
                            <ScrollArea className="h-48">
                                <div className="space-y-2 pr-3">
                                    {datacenters.map((room, index) => (
                                        <div key={room.value} className="grid grid-cols-[60px_1fr_auto] items-center gap-4 px-2 py-1 rounded-md bg-background">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => reorderDatacenters(room.value, 'up')} disabled={index === 0}>
                                                    <ArrowUp className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => reorderDatacenters(room.value, 'down')} disabled={index === datacenters.length - 1}>
                                                    <ArrowDown className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="font-medium truncate">{room.label}</div>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" className="h-8 px-4" disabled>Editar</Button>
                                                <Button variant="destructive" size="sm" className="h-8 px-4" onClick={() => deleteDatacenter(room.value)}>Excluir</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
