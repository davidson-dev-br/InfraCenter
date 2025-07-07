"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, Settings, Plus, Printer, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from "@/components/ui/slider"
import { DatacenterSwitcher } from './datacenter-switcher';
import type { PlacedItem } from '@/lib/types';

const GRID_SIZE = 20;
const CELL_SIZE = 80;

// In a real app, this would come from an API
const initialItems: PlacedItem[] = [
    { id: 'rack-3', name: 'Rack-3', type: 'Server Rack', icon: Server, notifications: 1, x: 1, y: 0 },
    { id: 'rack-2', name: 'Rack-02', type: 'Server Rack', icon: Server, notifications: 0, x: 7, y: 2 },
    { id: 'rack-0', name: 'Rack-00', type: 'Server Rack', icon: Server, notifications: 1, x: 8, y: 2 },
]

export function FloorPlan() {
    const [zoom, setZoom] = useState(1);
    const [items, setItems] = useState<Map<string, PlacedItem>>(
        new Map(initialItems.map(item => [`${item.x}-${item.y}`, item]))
    );
    const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
    const [draggingItem, setDraggingItem] = useState<{ key: string; item: PlacedItem } | null>(null);

    const handleCellDrop = (x: number, y: number) => {
        if (!draggingItem) return;

        const newKey = `${x}-${y}`;
        if (items.has(newKey)) {
            // Can't drop on an existing item
            setDraggingItem(null);
            return;
        }

        const newItems = new Map(items);
        newItems.delete(draggingItem.key);
        newItems.set(newKey, { ...draggingItem.item, x, y });
        setItems(newItems);
        setSelectedItemKey(newKey);
        setDraggingItem(null);
    };

    const handleItemClick = (e: React.MouseEvent, key: string) => {
        e.stopPropagation();
        setSelectedItemKey(key);
    };

    const handleDragStart = (e: React.DragEvent, key: string, item: PlacedItem) => {
        e.dataTransfer.effectAllowed = 'move';
        // You can set drag data if needed, but for this simple case, state is enough
        // e.dataTransfer.setData('text/plain', key);
        setDraggingItem({ key, item });
        setSelectedItemKey(key);
    };
    
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Delete' && selectedItemKey) {
            const newItems = new Map(items);
            newItems.delete(selectedItemKey);
            setItems(newItems);
            setSelectedItemKey(null);
        } else if (e.key === 'Escape') {
            setSelectedItemKey(null);
        }
    }, [selectedItemKey, items]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Planta Baixa</h1>
                    <p className="text-muted-foreground">Visualize e organize a disposição física do seu datacenter.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}><ZoomOut /></Button>
                    <Slider defaultValue={[1]} value={[zoom]} onValueChange={([val]) => setZoom(val)} max={2} min={0.2} step={0.1} className="w-32" />
                    <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.1))}><ZoomIn /></Button>
                    <Button variant="outline" size="icon"><Maximize /></Button>
                    <DatacenterSwitcher />
                    <Button variant="outline" size="icon"><Settings /></Button>
                    <Button><Plus className="mr-2" /> Adicionar Item</Button>
                    <Button variant="outline"><Printer className="mr-2"/> Exportar Planta (PDF)</Button>
                </div>
            </div>

            <div className="flex-grow p-4 overflow-auto border rounded-lg bg-card" onClick={() => setSelectedItemKey(null)}>
                <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${(GRID_SIZE * CELL_SIZE) + 40}px` }}>
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
                                            onDrop={() => handleCellDrop(x, y)}
                                            onDragOver={(e) => e.preventDefault()}
                                            className={cn("border-t border-l flex items-center justify-center p-1", draggingItem && !item ? "bg-accent/20" : "")}
                                        >
                                            {item && (
                                                <div
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, key, item)}
                                                    className={cn(
                                                        "bg-slate-800 text-white rounded-lg p-2 w-full h-full flex flex-col items-center justify-center shadow-lg relative cursor-grab active:cursor-grabbing transition-all",
                                                        selectedItemKey === key && "ring-2 ring-offset-2 ring-yellow-400 ring-offset-card"
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
                     <div className="absolute top-0 left-0 w-full h-full bg-grid" style={{ backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`, backgroundPosition: '40px 30px' }}></div>
                </div>
            </div>
            
            <p className="text-sm text-center text-muted-foreground">* Dê um clique duplo em um item para editar. Clique e arraste para mover. Pressione 'Delete' para remover o item selecionado.</p>
        </div>
    );
}

