"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, Settings, Plus, Printer, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from "@/components/ui/slider"
import { DatacenterSwitcher, datacenters, type DatacenterOption, useDatacenter } from './datacenter-switcher';
import type { PlacedItem } from '@/lib/types';
import { ManageRoomsDialog } from './manage-rooms-dialog';
import { ItemDetailsDialog } from './item-details-dialog';

const GRID_SIZE = 20;
const CELL_SIZE = 80;

// In a real app, this would come from an API, keyed by datacenter/room ID
const initialItemsByDatacenter: Record<string, PlacedItem[]> = {
    'dc1': [
        { id: 'rack-3', name: 'Rack-3', type: 'Server Rack', icon: Server, notifications: 1, x: 1, y: 0, status: 'Ativo', width: 0.6, length: 0.6, sizeU: 42, row: 'A', observations: 'Rack principal.', awaitingApproval: true },
        { id: 'rack-2', name: 'Rack-02', type: 'Server Rack', icon: Server, notifications: 0, x: 7, y: 2, status: 'Ativo', width: 0.6, length: 0.8, sizeU: 42, row: 'B', observations: '' },
        { id: 'rack-0', name: 'Rack-00', type: 'Server Rack', icon: Server, notifications: 1, x: 8, y: 2, status: 'Manutenção', width: 0.8, length: 0.8, sizeU: 48, row: 'B', observations: 'Verificar fonte de energia.' },
    ],
    'dc2': [
        { id: 'rack-eu-1', name: 'EU Rack 1', type: 'Server Rack', icon: Server, notifications: 0, x: 3, y: 4, status: 'Ativo', width: 0.6, length: 0.6, sizeU: 42, row: 'C', observations: '' },
    ],
    'dc3': [],
}

export function FloorPlan() {
    const [zoom, setZoom] = useState(1);
    const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
    const [draggingItem, setDraggingItem] = useState<{ key: string; item: PlacedItem } | null>(null);
    const [editingItem, setEditingItem] = useState<PlacedItem | null>(null);
    const floorPlanRef = useRef<HTMLDivElement>(null);
    const { selectedDatacenter, setSelectedDatacenter } = useDatacenter();
    
    const [itemsByDatacenter, setItemsByDatacenter] = useState<Record<string, Map<string, PlacedItem>>>(() => {
        const initialMap: Record<string, Map<string, PlacedItem>> = {};
        for (const dc of datacenters) {
            const itemsList = initialItemsByDatacenter[dc.value] || [];
            initialMap[dc.value] = new Map(itemsList.map(item => [`${item.x}-${item.y}`, item]));
        }
        return initialMap;
    });

    const items = itemsByDatacenter[selectedDatacenter.value] || new Map();
    const setItemsForCurrentDatacenter = (newItems: Map<string, PlacedItem>) => {
        setItemsByDatacenter(prev => ({
            ...prev,
            [selectedDatacenter.value]: newItems,
        }));
    };

    const handleWheel = useCallback((e: WheelEvent) => {
        if (e.ctrlKey) { // Use Ctrl + scroll for zoom to avoid hijacking normal scroll
            e.preventDefault();
            setZoom(prevZoom => {
                const newZoom = prevZoom - e.deltaY * 0.005;
                return Math.max(0.2, Math.min(2, newZoom)); // Clamp zoom level
            });
        }
    }, []);
    
    useEffect(() => {
        const floorPlanElement = floorPlanRef.current;
        if (floorPlanElement) {
            floorPlanElement.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (floorPlanElement) {
                floorPlanElement.removeEventListener('wheel', handleWheel);
            }
        };
    }, [handleWheel]);

    const handleCellDrop = (x: number, y: number) => {
        if (!draggingItem) return;

        const newKey = `${x}-${y}`;
        if (items.has(newKey)) {
            setDraggingItem(null);
            return;
        }

        const newItems = new Map(items);
        newItems.delete(draggingItem.key);
        newItems.set(newKey, { ...draggingItem.item, x, y, row: String.fromCharCode(65 + x) });
        setItemsForCurrentDatacenter(newItems);
        setSelectedItemKey(newKey);
        setDraggingItem(null);
    };

    const handleItemClick = (e: React.MouseEvent, key: string) => {
        e.stopPropagation();
        setSelectedItemKey(key);
    };

    const handleItemDoubleClick = (item: PlacedItem) => {
        setEditingItem(item);
    };

    const handleDragStart = (e: React.DragEvent, key: string, item: PlacedItem) => {
        e.dataTransfer.effectAllowed = 'move';
        setDraggingItem({ key, item });
        setSelectedItemKey(key);
    };
    
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Delete' && selectedItemKey) {
            const newItems = new Map(items);
            newItems.delete(selectedItemKey);
            setItemsForCurrentDatacenter(newItems);
            setSelectedItemKey(null);
        } else if (e.key === 'Escape') {
            setSelectedItemKey(null);
            setEditingItem(null);
        }
    }, [selectedItemKey, items, setItemsForCurrentDatacenter]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const handleAddItem = () => {
        let newX = -1, newY = -1;
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (!items.has(`${x}-${y}`)) {
                    newX = x;
                    newY = y;
                    break;
                }
            }
            if (newX !== -1) break;
        }

        if (newX === -1) {
            // In a real app, use a toast to notify the user.
            alert("Não há espaço livre para adicionar um novo item.");
            return;
        }

        const newItems = new Map(items);
        const newItemId = `rack-${Date.now()}`;
        const newRackNumber = (Array.from(newItems.values()).filter(i => i.type === 'Server Rack').length) + 1;
        const newItem: PlacedItem = {
            id: newItemId,
            name: `Rack-${String(newRackNumber).padStart(2, '0')}`,
            type: 'Server Rack',
            icon: Server,
            notifications: 0,
            x: newX,
            y: newY,
            status: 'Ativo',
            width: 0.6,
            length: 0.8,
            sizeU: 42,
            row: String.fromCharCode(65 + newX),
            observations: '',
            awaitingApproval: true
        };
        newItems.set(`${newX}-${newY}`, newItem);
        setItemsForCurrentDatacenter(newItems);
        setSelectedItemKey(`${newX}-${newY}`);
    };
    
    // Reset selection when changing datacenter
    useEffect(() => {
        setSelectedItemKey(null);
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
                    <ManageRoomsDialog>
                        <Button variant="outline" size="icon"><Settings /></Button>
                    </ManageRoomsDialog>
                    <Button onClick={handleAddItem}><Plus className="mr-2" /> Adicionar Item</Button>
                    <Button variant="outline"><Printer className="mr-2"/> Exportar Planta (PDF)</Button>
                </div>
            </div>

            <div ref={floorPlanRef} className="flex-grow p-4 overflow-auto border rounded-lg bg-card" onClick={() => setSelectedItemKey(null)}>
                <div className="relative transition-transform duration-75" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${(GRID_SIZE * CELL_SIZE) + 40}px` }}>
                    <div className="grid" style={{ gridTemplateColumns: `40px repeat(${GRID_SIZE}, ${CELL_SIZE}px)`, gridTemplateRows: `30px repeat(${GRID_SIZE}, ${CELL_SIZE}px)` }}>
                        {/* Top-left empty cell */}
                        <div className="sticky top-0 z-10 bg-card"></div>

                        {/* Column Headers */}
                        {Array.from({ length: GRID_SIZE }).map((_, i) => (
                            <div key={i} className="sticky top-0 z-10 flex items-center justify-center font-semibold bg-card text-muted-foreground">
                                {String.fromCharCode(65 + i)}
                            </div>
                        ))}

                        {/* Rows */}
                        {Array.from({ length: GRID_SIZE }).map((_, y) => (
                            <React.Fragment key={y}>
                                {/* Row Header */}
                                <div className="sticky left-0 z-10 flex items-center justify-center font-semibold bg-card text-muted-foreground">
                                    {y + 1}
                                </div>
                                {/* Grid Cells */}
                                {Array.from({ length: GRID_SIZE }).map((_, x) => {
                                    const key = `${x}-${y}`;
                                    const item = items.get(key);
                                    
                                    return (
                                        <div
                                            key={key}
                                            onClick={(e) => item && handleItemClick(e, key)}
                                            onDoubleClick={() => item && handleItemDoubleClick(item)}
                                            onDrop={() => handleCellDrop(x, y)}
                                            onDragOver={(e) => e.preventDefault()}
                                            className={cn("border-t border-l flex items-center justify-center p-1 transition-colors", draggingItem && !item ? "bg-accent/20" : "")}
                                        >
                                            {item && (
                                                <div
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, key, item)}
                                                    className={cn(
                                                        "bg-slate-800 text-white rounded-lg p-2 w-full h-full flex flex-col items-center justify-center shadow-lg relative cursor-grab active:cursor-grabbing transition-all",
                                                        selectedItemKey === key && "ring-2 ring-offset-2 ring-primary ring-offset-card"
                                                    )}
                                                >
                                                    <item.icon className="w-6 h-6 mb-1"/>
                                                    <p className="text-xs font-bold truncate">{item.name}</p>

                                                    {item.notifications > 0 && (
                                                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border-2 border-slate-800">
                                                            {item.notifications}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                     <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-grid" style={{ backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`, backgroundPosition: '40px 30px' }}></div>
                </div>
            </div>
            
            <p className="text-sm text-center text-muted-foreground">Use Ctrl + Scroll do mouse para zoom. Clique duplo para editar. Clique e arraste para mover. Pressione 'Delete' para remover.</p>

            <ItemDetailsDialog 
                item={editingItem} 
                isOpen={!!editingItem} 
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingItem(null);
                    }
                }}
            />
        </div>
    );
}
