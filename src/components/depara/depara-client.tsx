
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Cable, HardDrive, Puzzle, Loader2 } from 'lucide-react';
import { getConnectableChildItems, getPortsByChildItemId, EquipmentPort } from '@/lib/connection-actions';
import type { ConnectableItem } from '@/lib/connection-actions';
import { ScrollArea } from '../ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';


// Adicionei uns 'console.log' pra seguir a tradição. Se quebrar, eles te ajudarão (ou não).

interface DeParaClientProps {
    items: ConnectableItem[];
}

const PortList = ({
    ports,
    selectedPortId,
    onPortSelect,
    isLoading,
    side
}: {
    ports: EquipmentPort[];
    selectedPortId: string | null;
    onPortSelect: (portId: string) => void;
    isLoading: boolean;
    side: 'A' | 'B';
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }
    if (ports.length === 0) {
        return (
            <p className="text-center text-muted-foreground text-sm py-8">
                Nenhuma porta encontrada para este equipamento.
            </p>
        );
    }

    return (
        <ScrollArea className="h-56 pr-3">
             <RadioGroup value={selectedPortId || ""} onValueChange={onPortSelect} className="space-y-2">
                {ports.map(port => {
                    const isDisabled = !!port.connectedToPortId;
                    const id = `port-${side}-${port.id}`;
                    return (
                        <div key={id} className="flex items-center">
                            <RadioGroupItem value={port.id} id={id} disabled={isDisabled} />
                             <Label htmlFor={id} className={cn("ml-2 flex justify-between items-center w-full p-2 rounded-md", isDisabled ? "cursor-not-allowed text-muted-foreground/50 bg-muted/20" : "cursor-pointer hover:bg-muted/50")}>
                                <span>{port.label} <span className="text-xs text-muted-foreground">({port.portTypeName})</span></span>
                                {isDisabled && <span className="text-xs text-red-500/70">Ocupada</span>}
                            </Label>
                        </div>
                    )
                })}
            </RadioGroup>
        </ScrollArea>
    )
}

export function DeParaClient({ items }: DeParaClientProps) {
    const [sideA, setSideA] = useState<{ itemId: string | null; portId: string | null; ports: EquipmentPort[]; isLoading: boolean; }>({ itemId: null, portId: null, ports: [], isLoading: false });
    const [sideB, setSideB] = useState<{ itemId: string | null; portId: string | null; ports: EquipmentPort[]; isLoading: boolean; }>({ itemId: null, portId: null, ports: [], isLoading: false });

    useEffect(() => {
        if (sideA.itemId) {
            setSideA(s => ({ ...s, isLoading: true }));
            getPortsByChildItemId(sideA.itemId).then(ports => {
                setSideA(s => ({ ...s, ports, isLoading: false }));
            });
        }
    }, [sideA.itemId]);

    useEffect(() => {
        if (sideB.itemId) {
            setSideB(s => ({ ...s, isLoading: true }));
            getPortsByChildItemId(sideB.itemId).then(ports => {
                setSideB(s => ({ ...s, ports, isLoading: false }));
            });
        }
    }, [sideB.itemId]);


    const handleSelectA = (itemId: string) => {
        setSideA({ ...sideA, itemId, portId: null, ports: [] });
    };

    const handleSelectB = (itemId: string) => {
        setSideB({ ...sideB, itemId, portId: null, ports: [] });
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
                                <div className="p-4 border rounded-md bg-muted/50 min-h-[250px]">
                                   <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                        <HardDrive className="h-4 w-4" />
                                        <span>{selectedItemA.label}</span>
                                        <span className="text-xs">/</span>
                                        <Puzzle className="h-4 w-4" />
                                        <span>{selectedItemA.parentName}</span>
                                   </div>
                                    <PortList 
                                        ports={sideA.ports} 
                                        isLoading={sideA.isLoading} 
                                        selectedPortId={sideA.portId} 
                                        onPortSelect={(portId) => setSideA(s => ({...s, portId}))}
                                        side="A"
                                    />
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
                                <div className="p-4 border rounded-md bg-muted/50 min-h-[250px]">
                                   <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                        <HardDrive className="h-4 w-4" />
                                        <span>{selectedItemB.label}</span>
                                        <span className="text-xs">/</span>
                                        <Puzzle className="h-4 w-4" />
                                        <span>{selectedItemB.parentName}</span>
                                   </div>
                                    <PortList 
                                        ports={sideB.ports} 
                                        isLoading={sideB.isLoading} 
                                        selectedPortId={sideB.portId} 
                                        onPortSelect={(portId) => setSideB(s => ({...s, portId}))}
                                        side="B"
                                    />
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
