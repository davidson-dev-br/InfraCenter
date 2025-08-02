
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Cable, HardDrive, Puzzle } from 'lucide-react';
import type { ConnectableItem } from '@/lib/connection-actions';

// Adicionei uns 'console.log' pra seguir a tradição. Se quebrar, eles te ajudarão (ou não).

interface DeParaClientProps {
    items: ConnectableItem[];
}

export function DeParaClient({ items }: DeParaClientProps) {
    const [sideA, setSideA] = useState<{ itemId: string | null; portId: string | null }>({ itemId: null, portId: null });
    const [sideB, setSideB] = useState<{ itemId: string | null; portId: string | null }>({ itemId: null, portId: null });

    const handleSelectA = (itemId: string) => {
        setSideA({ itemId, portId: null });
    };

    const handleSelectB = (itemId: string) => {
        setSideB({ itemId, portId: null });
    };

    const selectedItemA = items.find(i => i.id === sideA.itemId);
    const selectedItemB = items.find(i => i.id === sideB.itemId);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">De/Para de Conexões</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Mapeamento de Conexões Físicas</CardTitle>
                    <CardDescription>
                        Selecione um equipamento em cada lado para visualizar suas portas e estabelecer uma conexão entre eles.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
                    {/* Coluna Lado A (Origem) */}
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Origem (Lado A)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Select onValueChange={handleSelectA}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o equipamento de origem..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {items.map(item => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {item.label} ({item.parentName})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            {selectedItemA && (
                                <div className="p-4 border rounded-md bg-muted/50 min-h-[200px]">
                                   <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                        <HardDrive className="h-4 w-4" />
                                        <span>{selectedItemA.label}</span>
                                        <span className="text-xs">/</span>
                                        <Puzzle className="h-4 w-4" />
                                        <span>{selectedItemA.parentName}</span>
                                   </div>
                                    <p className="text-center text-muted-foreground text-sm py-8">
                                        (Lista de portas aparecerá aqui)
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Ícone de Conexão */}
                    <div className="flex items-center justify-center pt-16">
                         <Button variant="ghost" size="icon" className="h-12 w-12" disabled>
                            <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
                        </Button>
                    </div>

                    {/* Coluna Lado B (Destino) */}
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Destino (Lado B)</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-4">
                            <Select onValueChange={handleSelectB}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o equipamento de destino..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {items.map(item => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {item.label} ({item.parentName})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                             {selectedItemB && (
                                <div className="p-4 border rounded-md bg-muted/50 min-h-[200px]">
                                   <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                        <HardDrive className="h-4 w-4" />
                                        <span>{selectedItemB.label}</span>
                                        <span className="text-xs">/</span>
                                        <Puzzle className="h-4 w-4" />
                                        <span>{selectedItemB.parentName}</span>
                                   </div>
                                    <p className="text-center text-muted-foreground text-sm py-8">
                                        (Lista de portas aparecerá aqui)
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </CardContent>
                <CardContent className="flex justify-center border-t pt-6">
                    <Button size="lg" disabled>
                        <Cable className="mr-2 h-5 w-5"/>
                        Estabelecer Conexão
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
