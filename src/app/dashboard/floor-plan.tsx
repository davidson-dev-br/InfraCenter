"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, Settings, Plus, Printer, Server, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInfra } from '@/components/dashboard/datacenter-switcher';
import type { PlacedItem } from '@/lib/types';
import { ManageRoomsDialog } from '@/components/dashboard/manage-rooms-dialog';
import { ItemDetailsDialog } from '@/components/dashboard/item-details-dialog';
import { useToast } from '@/hooks/use-toast';
import { RoomSwitcher } from '@/components/dashboard/room-switcher';
import { PrintableLayout } from '@/components/dashboard/printable-layout';
import { Slider } from '@/components/ui/slider';

const CELL_SIZE = 80; // Visual size of a grid cell in pixels

export function FloorPlan() {
    const [viewTransform, setViewTransform] = useState({ x: 20, y: 20, scale: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef({ x: 0, y: 0 });

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<PlacedItem | null>(null);
    const floorPlanRef = useRef<HTMLDivElement>(null);

    const { 
        buildings,
        selectedBuildingId,
        selectedRoomId,
        itemsByRoom,
        updateItemsForRoom
    } = useInfra();
    const { toast } = useToast();
    
    const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
    const selectedRoom = selectedBuilding?.rooms.find(r => r.id === selectedRoomId);

    const roomWidthM = selectedRoom?.width || 12;
    const roomLengthM = selectedRoom?.length || 12;
    const tileWidthCm = selectedRoom?.tileWidth || 60;
    const tileLengthCm = selectedRoom?.tileLength || 60;
    const GRID_COLS = Math.max(1, Math.floor((roomWidthM * 100) / tileWidthCm));
    const GRID_ROWS = Math.max(1, Math.floor((roomLengthM * 100) / tileLengthCm));
    const tileWidthM = tileWidthCm / 100;
    const tileLengthM = tileLengthCm / 100;

    const getItemDimensions = useCallback((item: PlacedItem) => {
        return {
            width: Math.max(1, Math.round((item.width || tileWidthM) / tileWidthM)),
            length: Math.max(1, Math.round((item.length || tileLengthM) / tileLengthM)),
        };
    }, [tileWidthM, tileLengthM]);
    
    const items = selectedRoomId ? itemsByRoom[selectedRoomId] || [] : [];
    const setItemsForCurrentRoom = (newItems: PlacedItem[]) => {
        if (selectedRoomId) {
            updateItemsForRoom(selectedRoomId, newItems);
        }
    };

    const checkCollision = useCallback((testItem: PlacedItem, allItems: PlacedItem[]) => {
        const testDim = getItemDimensions(testItem);

        if (testItem.x < 0 || testItem.y < 0 || testItem.x + testDim.width > GRID_COLS || testItem.y + testDim.length > GRID_ROWS) {
            return true;
        }

        for (const existingItem of allItems) {
            if (existingItem.id === testItem.id) continue;
            const existingDim = getItemDimensions(existingItem);
            if (
                testItem.x < existingItem.x + existingDim.width &&
                testItem.x + testDim.width > existingItem.x &&
                testItem.y < existingItem.y + existingDim.length &&
                testItem.y + testDim.length > existingItem.y
            ) {
                return true;
            }
        }
        return false;
    }, [getItemDimensions, GRID_COLS, GRID_ROWS]);

    const handleWheel = useCallback((e: WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const floorPlanElement = floorPlanRef.current;
            if (!floorPlanElement) return;

            const rect = floorPlanElement.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const newScale = Math.max(0.2, Math.min(2.5, viewTransform.scale - e.deltaY * 0.002));
            
            const newX = mouseX - (mouseX - viewTransform.x) * (newScale / viewTransform.scale);
            const newY = mouseY - (mouseY - viewTransform.y) * (newScale / viewTransform.scale);
            
            setViewTransform({ x: newX, y: newY, scale: newScale });
        }
    }, [viewTransform]);
    
    useEffect(() => {
        const floorPlanElement = floorPlanRef.current;
        if (floorPlanElement) {
            floorPlanElement.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (floorPlanElement) floorPlanElement.removeEventListener('wheel', handleWheel);
        };
    }, [handleWheel]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            e.preventDefault();
            panStartRef.current = { x: e.clientX - viewTransform.x, y: e.clientY - viewTransform.y };
            setIsPanning(true);
        }
    };

    const handleMouseUp = () => setIsPanning(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPanning) return;
        e.preventDefault();
        const newX = e.clientX - panStartRef.current.x;
        const newY = e.clientY - panStartRef.current.y;
        setViewTransform(prev => ({ ...prev, x: newX, y: newY }));
    };

    const handleCellDrop = (x: number, y: number) => {
        if (!draggingItemId) return;

        const itemIndex = items.findIndex(i => i.id === draggingItemId);
        if (itemIndex === -1) return;
        
        const itemToMove = { ...items[itemIndex], x, y, row: String.fromCharCode(65 + x) };
        
        if (checkCollision(itemToMove, items.filter(i => i.id !== draggingItemId))) {
            setDraggingItemId(null);
            return;
        }

        const newItems = [...items];
        newItems[itemIndex] = itemToMove;
        setItemsForCurrentRoom(newItems);
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
            setItemsForCurrentRoom(items.filter(item => item.id !== selectedItemId));
            setSelectedItemId(null);
        } else if (e.key === 'Escape') {
            setSelectedItemId(null);
            setEditingItem(null);
        }
    }, [selectedItemId, items, setItemsForCurrentRoom]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    
    const resetView = () => setViewTransform({ x: 20, y: 20, scale: 1 });

    const handleAddItem = () => {
        const newItemProto = { id: 'proto', name: 'proto', type: 'proto', icon: Server, width: tileWidthM, length: tileLengthM };
        const { width, length } = getItemDimensions(newItemProto);
        
        let newX = -1, newY = -1;
        for (let y = 0; y <= GRID_ROWS - length; y++) {
            for (let x = 0; x <= GRID_COLS - width; x++) {
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
            x: newX, y: newY, status: 'Ativo', width: tileWidthM, length: tileLengthM,
            sizeU: 42, row: String.fromCharCode(65 + newX), observations: '', 
            awaitingApproval: true,
            createdBy: "Admin User",
            createdAt: new Date().toLocaleDateString('pt-BR')
        };
        
        setItemsForCurrentRoom([...items, newItem]);
        setSelectedItemId(newItem.id);
    };

    const handleItemSave = (updatedItem: PlacedItem) => {
        if (checkCollision(updatedItem, items.filter(i => i.id !== updatedItem.id))) {
            toast({ variant: 'destructive', title: 'Erro de Colisão', description: 'A nova dimensão ou posição do item causa uma colisão ou excede os limites da sala.' });
            return;
        }

        const newItems = items.map(item => item.id === updatedItem.id ? updatedItem : item);
        setItemsForCurrentRoom(newItems);
        setEditingItem(null);
        toast({ title: "Item Salvo", description: `O item "${updatedItem.name}" foi atualizado com sucesso.` });
    };
    
    useEffect(() => {
        setSelectedItemId(null);
        setEditingItem(null);
        resetView();
    }, [selectedBuildingId, selectedRoomId]);

    const handlePrint = () => window.print();

    const InteractiveFloorPlan = (
        <div className="flex flex-col h-full gap-4 p-4 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Planta Baixa</h1>
                    <p className="text-muted-foreground">Visualize e organize a disposição física do seu datacenter.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setViewTransform(v => ({...v, scale: Math.max(0.2, v.scale - 0.2)}))}><ZoomOut /></Button>
                    <Slider value={[viewTransform.scale]} onValueChange={([val]) => setViewTransform(v => ({...v, scale: val}))} max={2.5} min={0.2} step={0.1} className="w-32" />
                    <Button variant="outline" size="icon" onClick={() => setViewTransform(v => ({...v, scale: Math.min(2.5, v.scale + 0.2)}))}><ZoomIn /></Button>
                    <Button variant="outline" size="icon" onClick={resetView}><Maximize /></Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 py-4 border-t">
                <div className="flex items-center gap-2">
                    <RoomSwitcher />
                    <ManageRoomsDialog><Button variant="outline" size="icon"><Settings /></Button></ManageRoomsDialog>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleAddItem}><Plus className="mr-2" /> Adicionar Item</Button>
                    <Button variant="outline" onClick={handlePrint}><Printer className="mr-2"/> Exportar Planta (PDF)</Button>
                </div>
            </div>

            <div 
                ref={floorPlanRef} 
                className="flex-grow overflow-hidden border rounded-lg bg-card cursor-grab"
                data-panning={isPanning}
                onClick={() => setSelectedItemId(null)}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div className="relative" style={{ transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`, transformOrigin: 'top left', width: `${(GRID_COLS * CELL_SIZE) + 40}px`, height: `${(GRID_ROWS * CELL_SIZE) + 30}px` }}>
                    <div className="grid border-r border-b" style={{ gridTemplateColumns: `40px repeat(${GRID_COLS}, ${CELL_SIZE}px)`, gridTemplateRows: `30px repeat(${GRID_ROWS}, ${CELL_SIZE}px)` }}>
                        {/* Headers & Grid Cells */}
                        <div style={{ gridColumn: 1, gridRow: 1 }} className="sticky top-0 left-0 z-20 bg-card"></div>
                        {Array.from({ length: GRID_COLS }).map((_, i) => <div key={`col-${i}`} style={{ gridColumn: i + 2, gridRow: 1 }} className="sticky top-0 z-10 flex items-center justify-center font-semibold bg-card text-muted-foreground">{String.fromCharCode(65 + i)}</div>)}
                        {Array.from({ length: GRID_ROWS }).map((_, i) => <div key={`row-${i}`} style={{ gridColumn: 1, gridRow: i + 2 }} className="sticky left-0 z-10 flex items-center justify-center font-semibold bg-card text-muted-foreground">{i + 1}</div>)}
                        {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, index) => {
                            const x = index % GRID_COLS;
                            const y = Math.floor(index / GRID_COLS);
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
            
            <p className="text-sm text-center text-muted-foreground">Use Ctrl + Scroll para zoom. Clique e arraste para mover. Duplo clique para editar. Pressione 'Delete' para remover.</p>
        </div>
    );

    if (!selectedBuilding || !selectedRoom) {
        return (
            <div className="flex flex-col h-full gap-4 p-4 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold font-headline">Planta Baixa</h1>
                        <p className="text-muted-foreground">Selecione um prédio e uma sala para começar.</p>
                    </div>
                     <div className="flex flex-wrap items-center gap-2">
                        <ManageRoomsDialog><Button variant="outline"><Settings className="mr-2" /> Gerenciar Salas</Button></ManageRoomsDialog>
                    </div>
                </div>
                <div className="flex items-center justify-center flex-grow p-4 border-2 border-dashed rounded-lg bg-card/50">
                    <p className="text-muted-foreground">Nenhum prédio ou sala selecionada.</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="print-hidden h-full">
                {InteractiveFloorPlan}
            </div>
            <div className="print-visible hidden">
                <PrintableLayout 
                    building={selectedBuilding}
                    room={selectedRoom}
                    items={items}
                    getItemDimensions={getItemDimensions}
                    gridCellSize={CELL_SIZE}
                />
            </div>
             <ItemDetailsDialog 
                item={editingItem} 
                isOpen={!!editingItem} 
                onOpenChange={(open) => !open && setEditingItem(null)}
                onSave={handleItemSave}
            />
        </>
    );
}
