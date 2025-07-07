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

// Mock data for existing rooms
const initialRooms = [
    { id: 'room-1', name: 'Data Center' },
    { id: 'room-2', name: 'Sala de Controle' },
];

export function ManageRoomsDialog({ children }: { children: React.ReactNode }) {
    const [rooms, setRooms] = useState(initialRooms);

    const handleMoveUp = (id: string) => {
        const index = rooms.findIndex(r => r.id === id);
        if (index > 0) {
            const newRooms = [...rooms];
            [newRooms[index - 1], newRooms[index]] = [newRooms[index], newRooms[index - 1]];
            setRooms(newRooms);
        }
    };

    const handleMoveDown = (id: string) => {
        const index = rooms.findIndex(r => r.id === id);
        if (index < rooms.length - 1) {
            const newRooms = [...rooms];
            [newRooms[index], newRooms[index + 1]] = [newRooms[index + 1], newRooms[index]];
            setRooms(newRooms);
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
                        <form className="space-y-4 flex-grow flex flex-col" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="room-name">Nome da Sala</Label>
                                    <Input id="room-name" className="mt-1" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="room-width-m">Largura (metros)</Label>
                                        <Input id="room-width-m" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="room-length-m">Comprimento (metros)</Label>
                                        <Input id="room-length-m" className="mt-1" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="tile-width-cm">Largura da Placa (cm)</Label>
                                        <Input id="tile-width-cm" defaultValue="60" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="tile-length-cm">Comprimento da Placa (cm)</Label>
                                        <Input id="tile-length-cm" defaultValue="60" className="mt-1" />
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
                                    {rooms.map((room, index) => (
                                        <div key={room.id} className="grid grid-cols-[60px_1fr_auto] items-center gap-4 px-2 py-1 rounded-md bg-background">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => handleMoveUp(room.id)} disabled={index === 0}>
                                                    <ArrowUp className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => handleMoveDown(room.id)} disabled={index === rooms.length - 1}>
                                                    <ArrowDown className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="font-medium truncate">{room.name}</div>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" className="h-8 px-4">Editar</Button>
                                                <Button variant="destructive" size="sm" className="h-8 px-4">Excluir</Button>
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