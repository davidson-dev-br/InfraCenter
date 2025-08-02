
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Cable, HardDrive, Puzzle, Loader2, Link, Unlink, Camera, ChevronDown } from 'lucide-react';
import { getConnectableChildItems, getPortsByChildItemId, createConnection, EquipmentPort, ConnectionDetail } from '@/lib/connection-actions';
import { getConnectionTypes, ConnectionType } from '@/lib/connection-types-actions';
import type { ConnectableItem } from '@/lib/connection-actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddConnectionDialog } from '@/components/depara/add-connection-dialog';


interface DeParaClientProps {
    items: ConnectableItem[];
    connections: ConnectionDetail[];
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

export function DeParaClient({ items, connections: initialConnections }: DeParaClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [sideA, setSideA] = useState<{ itemId: string | null; portId: string | null; ports: EquipmentPort[]; isLoading: boolean; }>({ itemId: null, portId: null, ports: [], isLoading: false });
    const [sideB, setSideB] = useState<{ itemId: string | null; portId: string | null; ports: EquipmentPort[]; isLoading: boolean; }>({ itemId: null, portId: null, ports: [], isLoading: false });
    const [connectionTypeId, setConnectionTypeId] = useState<string | null>(null);
    const [connectionTypes, setConnectionTypes] = useState<ConnectionType[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);

    useEffect(() => {
        getConnectionTypes().then(setConnectionTypes);
    }, []);


    useEffect(() => {
        if (sideA.itemId) {
            setSideA(s => ({ ...s, isLoading: true, portId: null, ports: [] }));
            getPortsByChildItemId(sideA.itemId).then(ports => {
                setSideA(s => ({ ...s, ports, isLoading: false }));
            });
        }
    }, [sideA.itemId]);

    useEffect(() => {
        if (sideB.itemId) {
            setSideB(s => ({ ...s, isLoading: true, portId: null, ports: [] }));
            getPortsByChildItemId(sideB.itemId).then(ports => {
                setSideB(s => ({ ...s, ports, isLoading: false }));
            });
        }
    }, [sideB.itemId]);


    const handleQuickConnect = async () => {
        if (!sideA.portId || !sideB.portId || !connectionTypeId) return;
        setIsCreating(true);
        try {
            await createConnection({
                portA_id: sideA.portId,
                portB_id: sideB.portId,
                connectionTypeId,
            });
            toast({
                title: 'Sucesso!',
                description: 'A conexão rápida foi estabelecida.',
            });
            resetForm();
            router.refresh(); 
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro ao conectar',
                description: error.message,
            });
        } finally {
            setIsCreating(false);
        }
    };

    const resetForm = () => {
        setSideA({ itemId: null, portId: null, ports: [], isLoading: false });
        setSideB({ itemId: null, portId: null, ports: [], isLoading: false });
        setConnectionTypeId(null);
    }

    const selectedItemA = items.find(i => i.id === sideA.itemId);
    const selectedItemB = items.find(i => i.id === sideB.itemId);
    const canConnect = sideA.portId && sideB.portId && connectionTypeId && !isCreating;

    return (
    <>
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">De/Para de Conexões</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Mapeamento de Conexões Físicas</CardTitle>
                    <CardDescription>
                        Selecione um equipamento em cada lado, suas respectivas portas e o tipo de conexão.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
                    {/* Coluna Lado A (Origem) */}
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Origem (Lado A)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Select onValueChange={(value) => setSideA(s => ({ ...s, itemId: value }))} value={sideA.itemId || ''}>
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

                    {/* Ícone e Seletor de Conexão */}
                    <div className="flex flex-col items-center justify-start pt-16 gap-4">
                         <Button variant="ghost" size="icon" className="h-12 w-12" disabled>
                            <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
                        </Button>
                         <Select onValueChange={setConnectionTypeId} value={connectionTypeId || ''}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Tipo de Conexão..." />
                            </SelectTrigger>
                            <SelectContent>
                                {connectionTypes.map(type => (
                                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Coluna Lado B (Destino) */}
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Destino (Lado B)</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-4">
                            <Select onValueChange={(value) => setSideB(s => ({ ...s, itemId: value }))} value={sideB.itemId || ''}>
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
                    <div className="inline-flex rounded-md shadow-sm">
                        <Button
                            size="lg"
                            onClick={() => setIsAdvancedModalOpen(true)}
                            disabled={!canConnect}
                            className="rounded-r-none"
                        >
                            {isCreating ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Cable className="mr-2 h-5 w-5"/>}
                            Conectar com Evidência
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="lg" variant="outline" className="rounded-l-none px-3" disabled={!canConnect}>
                                    <ChevronDown className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleQuickConnect} disabled={!canConnect}>
                                    Conexão Rápida
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            <Separator className="my-8" />

            <Card>
                <CardHeader>
                    <CardTitle>Conexões Ativas</CardTitle>
                    <CardDescription>
                       Visualize todas as conexões físicas (De/Para) ativas no seu inventário.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Origem (A)</TableHead>
                                    <TableHead>Destino (B)</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialConnections.length > 0 ? (
                                    initialConnections.map(conn => (
                                        <TableRow key={conn.id}>
                                            <TableCell>
                                                <div className="font-medium">{conn.itemA_label}</div>
                                                <div className="text-sm text-muted-foreground">{conn.portA_label}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{conn.itemB_label}</div>
                                                <div className="text-sm text-muted-foreground">{conn.portB_label}</div>
                                            </TableCell>
                                            <TableCell><Badge variant="outline">{conn.connectionType}</Badge></TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="capitalize">{conn.status}</Badge>
                                                    {conn.imageUrl && <Camera className="h-4 w-4 text-muted-foreground" title="Possui evidência fotográfica"/>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" disabled>
                                                    <Unlink className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                           Nenhuma conexão encontrada.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        {canConnect && (
            <AddConnectionDialog
                isOpen={isAdvancedModalOpen}
                onOpenChange={setIsAdvancedModalOpen}
                sideA={{ item: selectedItemA!, port: sideA.ports.find(p => p.id === sideA.portId)! }}
                sideB={{ item: selectedItemB!, port: sideB.ports.find(p => p.id === sideB.portId)! }}
                connectionTypeId={connectionTypeId!}
                connectionTypeName={connectionTypes.find(c => c.id === connectionTypeId)?.name || ''}
                onSuccess={() => {
                    resetForm();
                    router.refresh();
                }}
            />
        )}
    </>
    );
}
