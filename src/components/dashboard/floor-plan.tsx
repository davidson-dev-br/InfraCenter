"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, Settings, Plus, Printer, Server, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from "@/components/ui/slider"
import { DatacenterSwitcher, useDatacenter } from './datacenter-switcher';
import type { PlacedItem } from '@/lib/types';
import { ManageRoomsDialog } from './manage-rooms-dialog';
import { ItemDetailsDialog } from './item-details-dialog';
import { useToast } from '@/hooks/use-toast';

const GRID_SIZE = 20;
const CELL_SIZE = 80;
const TILE_SIZE_M = 0.6; // Represents a 60cm x 60cm tile

export function FloorPlan() {
    const [zoom, setZoom] = useState(1);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<PlacedItem | null>(null);
    const floorPlanRef = useRef<HTMLDivElement>(null);
    const { 
        selectedDatacenter, 
        setSelectedDatacenter,
        itemsByDatacenter,
        updateItemsForDatacenter
    } = useDatacenter();
    const { toast } = useToast();
    
    const items = itemsByDatacenter[selectedDatacenter.value] || [];
    const setItemsForCurrentDatacenter = (newItems: PlacedItem[]) => {
        updateItemsForDatacenter(selectedDatacenter.value, newItems);
    };
    
    const getItemDimensions = useCallback((item: PlacedItem) => {
        return {
            width: Math.max(1, Math.round((item.width || TILE_SIZE_M) / TILE_SIZE_M)),
            length: Math.max(1, Math.round((item.length || TILE_SIZE_M) / TILE_SIZE_M)),
        };
    }, []);

    const checkCollision = useCallback((testItem: PlacedItem, allItems: PlacedItem[]) => {
        const testDim = getItemDimensions(testItem);
        for (const existingItem of allItems) {
            if (existingItem.id === testItem.id) continue;
            
            const existingDim = getItemDimensions(existingItem);
            
            if (
                testItem.x < existingItem.x + existingDim.width &&
                testItem.x + testDim.width > existingItem.x &&
                testItem.y < existingItem.y + existingDim.length &&
                testItem.y + testDim.length > existingItem.y
            ) {
                return true; // Collision detected
            }
        }
        return false;
    }, [getItemDimensions]);

    const handleWheel = useCallback((e: WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            setZoom(prevZoom => Math.max(0.2, Math.min(2, prevZoom - e.deltaY * 0.005)));
        }
    }, []);
    
    useEffect(() => {
        const floorPlanElement = floorPlanRef.current;
        if (floorPlanElement) {
            floorPlanElement.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (floorPlanElement) floorPlanElement.removeEventListener('wheel', handleWheel);
        };
    }, [handleWheel]);

    const handleCellDrop = (x: number, y: number) => {
        if (!draggingItemId) return;

        const itemIndex = items.findIndex(i => i.id === draggingItemId);
        if (itemIndex === -1) return;
        
        const itemToMove = { ...items[itemIndex], x, y, row: String.fromCharCode(65 + x) };
        const { width, length } = getItemDimensions(itemToMove);

        if (x + width > GRID_SIZE || y + length > GRID_SIZE || checkCollision(itemToMove, items)) {
            setDraggingItemId(null);
            return;
        }

        const newItems = [...items];
        newItems[itemIndex] = itemToMove;
        setItemsForCurrentDatacenter(newItems);
        setSelectedItemId(itemToMove.id);
        setDraggingItemId(null);
    };

    const handleItemClick = (e: React.MouseEvent, itemId: string) => {
        e.stopPropagation();
        setSelectedItemId(itemId);
    };

    const handleItemDoubleClick = (item: PlacedItem) => {
        setEditingItem(item);
    };

    const handleDragStart = (e: React.DragEvent, item: PlacedItem) => {
        e.dataTransfer.effectAllowed = 'move';
        setDraggingItemId(item.id);
        setSelectedItemId(item.id);
    };
    
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Delete' && selectedItemId) {
            setItemsForCurrentDatacenter(items.filter(item => item.id !== selectedItemId));
            setSelectedItemId(null);
        } else if (e.key === 'Escape') {
            setSelectedItemId(null);
            setEditingItem(null);
        }
    }, [selectedItemId, items, setItemsForCurrentDatacenter]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleAddItem = () => {
        const newItemProto = { id: 'proto', name: 'proto', type: 'proto', icon: Server, width: TILE_SIZE_M, length: TILE_SIZE_M };
        const { width, length } = getItemDimensions(newItemProto);
        
        let newX = -1, newY = -1;
        for (let y = 0; y <= GRID_SIZE - length; y++) {
            for (let x = 0; x <= GRID_SIZE - width; x++) {
                if (!checkCollision({ ...newItemProto, x, y }, items)) {
                    newX = x; newY = y;
                    break;
                }
            }
            if (newX !== -1) break;
        }

        if (newX === -1) {
            toast({ variant: "destructive", title: "Erro", description: "Não há espaço livre para adicionar um novo item." });
            return;
        }

        const newItemId = `rack-${Date.now()}`;
        const newRackNumber = (items.filter(i => i.type === 'Server Rack').length) + 1;
        const newItem: PlacedItem = {
            id: newItemId, name: `Rack-${String(newRackNumber).padStart(2, '0')}`,
            type: 'Server Rack', icon: Server,
            x: newX, y: newY, status: 'Ativo', width: TILE_SIZE_M, length: TILE_SIZE_M,
            sizeU: 42, row: String.fromCharCode(65 + newX), observations: '', 
            awaitingApproval: true,
            createdBy: "Admin User", // Mock user
            createdAt: new Date().toLocaleDateString('pt-BR')
        };
        
        setItemsForCurrentDatacenter([...items, newItem]);
        setSelectedItemId(newItem.id);
    };

    const handleItemSave = (updatedItem: PlacedItem) => {
        const { width, length } = getItemDimensions(updatedItem);

        if (updatedItem.x + width > GRID_SIZE || updatedItem.y + length > GRID_SIZE) {
            toast({ variant: 'destructive', title: 'Erro de Validação', description: 'O item excede os limites da planta.' });
            return;
        }
        if (checkCollision(updatedItem, items)) {
            toast({ variant: 'destructive', title: 'Erro de Colisão', description: 'A nova dimensão ou posição do item causa uma colisão com outro item.' });
            return;
        }

        const newItems = items.map(item => item.id === updatedItem.id ? updatedItem : item);
        setItemsForCurrentDatacenter(newItems);
        setEditingItem(null);
        toast({ title: "Item Salvo", description: `O item "${updatedItem.name}" foi atualizado com sucesso.` });
    };
    
    useEffect(() => {
        setSelectedItemId(null);
        setEditingItem(null);
    }, [selectedDatacenter]);

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Planta Baixa</h1>
                    <p className="text-muted-foreground">Visualize e organize a disposição física do seu datacenter.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}><ZoomOut /></Button>
                    <Slider value={[zoom]} onValueChange={([val]) => setZoom(val)} max={2} min={0.2} step={0.1} className="w-32" />
                    <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.1))}><ZoomIn /></Button>
                    <Button variant="outline" size="icon"><Maximize /></Button>
                    <DatacenterSwitcher selected={selectedDatacenter} onSelectedChange={setSelectedDatacenter} />
                    <ManageRoomsDialog><Button variant="outline" size="icon"><Settings /></Button></ManageRoomsDialog>
                    <Button onClick={handleAddItem}><Plus className="mr-2" /> Adicionar Item</Button>
                    <Button variant="outline"><Printer className="mr-2"/> Exportar Planta (PDF)</Button>
                </div>
            </div>

            <div ref={floorPlanRef} className="flex-grow p-4 overflow-auto border rounded-lg bg-card" onClick={() => setSelectedItemId(null)}>
                <div className="relative transition-transform duration-75" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${(GRID_SIZE * CELL_SIZE) + 40}px`, height: `${(GRID_SIZE * CELL_SIZE) + 30}px` }}>
                    <div className="grid" style={{ gridTemplateColumns: `40px repeat(${GRID_SIZE}, ${CELL_SIZE}px)`, gridTemplateRows: `30px repeat(${GRID_SIZE}, ${CELL_SIZE}px)` }}>
                        {/* Headers & Grid Cells */}
                        <div style={{ gridColumn: 1, gridRow: 1 }} className="sticky top-0 left-0 z-20 bg-card"></div>
                        {Array.from({ length: GRID_SIZE }).map((_, i) => <div key={`col-${i}`} style={{ gridColumn: i + 2, gridRow: 1 }} className="sticky top-0 z-10 flex items-center justify-center font-semibold bg-card text-muted-foreground">{String.fromCharCode(65 + i)}</div>)}
                        {Array.from({ length: GRID_SIZE }).map((_, i) => <div key={`row-${i}`} style={{ gridColumn: 1, gridRow: i + 2 }} className="sticky left-0 z-10 flex items-center justify-center font-semibold bg-card text-muted-foreground">{i + 1}</div>)}
                        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                            const x = index % GRID_SIZE;
                            const y = Math.floor(index / GRID_SIZE);
                            return <div key={`cell-${x}-${y}`} style={{ gridColumn: x + 2, gridRow: y + 2 }} onDrop={() => handleCellDrop(x, y)} onDragOver={(e) => e.preventDefault()} className="border-t border-l" />;
                        })}

                        {/* Placed Items */}
                        {items.map(item => {
                            const { width, length } = getItemDimensions(item);
                            return (
                                <div
                                    key={item.id}
                                    draggable
                                    onClick={(e) => handleItemClick(e, item.id)}
                                    onDoubleClick={() => handleItemDoubleClick(item)}
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    style={{
                                        gridColumnStart: item.x + 2,
                                        gridRowStart: item.y + 2,
                                        gridColumnEnd: `span ${width}`,
                                        gridRowEnd: `span ${length}`,
                                        zIndex: selectedItemId === item.id ? 10 : 5,
                                    }}
                                    className="p-1 cursor-grab active:cursor-grabbing"
                                >
                                    <div
                                        className={cn(
                                            "bg-slate-800 text-white rounded-lg p-2 w-full h-full flex flex-col items-center justify-center shadow-lg relative transition-all",
                                            selectedItemId === item.id && "ring-2 ring-offset-2 ring-primary ring-offset-card",
                                            draggingItemId === item.id && "opacity-50"
                                        )}
                                    >
                                        <item.icon className="w-6 h-6 mb-1"/>
                                        <p className="text-xs font-bold truncate">{item.name}</p>
                                        {item.awaitingApproval && <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border-2 border-slate-800"><Clock className="w-3 h-3"/></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                     <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-grid" style={{ backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`, backgroundPosition: '40px 30px' }}></div>
                </div>
            </div>
            
            <p className="text-sm text-center text-muted-foreground">Use Ctrl + Scroll do mouse para zoom. Clique duplo para editar. Clique e arraste para mover. Pressione 'Delete' para remover.</p>

            <ItemDetailsDialog 
                item={editingItem} 
                isOpen={!!editingItem} 
                onOpenChange={(open) => !open && setEditingItem(null)}
                onSave={handleItemSave}
            />
        </div>
    );
}
