
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, Settings, Plus, Printer, Server, Clock, Expand, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInfra } from '@/components/dashboard/datacenter-switcher';
import type { PlacedItem, FloorPlanItemType } from '@/lib/types';
import { ManageRoomsDialog } from '@/components/dashboard/manage-rooms-dialog';
import { ItemDetailsDialog } from '@/components/dashboard/item-details-dialog';
import { useToast } from '@/hooks/use-toast';
import { RoomSwitcher } from '@/components/dashboard/room-switcher';
import { PrintableLayout } from '@/components/dashboard/printable-layout';
import { Slider } from '@/components/ui/slider';
import { AddItemDialog } from '@/components/dashboard/add-item-dialog';
import { getIconByName } from '@/lib/icon-map';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';


export function FloorPlan() {
    const isMobile = useIsMobile();
    const CELL_SIZE = isMobile ? 50 : 80;

    const [viewTransform, setViewTransform] = useState({ x: 20, y: 20, scale: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const pinchDistanceRef = useRef(0);

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<PlacedItem | null>(null);
    const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
    const floorPlanRef = useRef<HTMLDivElement>(null);
    const [fullscreenContainer, setFullscreenContainer] = useState<HTMLElement | null>(null);
    const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const { 
        buildings,
        selectedBuildingId,
        selectedRoomId,
        itemsByRoom,
        updateItemsForRoom,
        systemSettings,
    } = useInfra();
    const { companyName, companyLogo } = systemSettings;
    const { toast } = useToast();
    
    const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
    const selectedRoom = selectedBuilding?.rooms.find(r => r.id === selectedRoomId);

    const roomWidthM = selectedRoom?.width || 12;
    const roomLengthM = selectedRoom?.length || 12;
    const tileWidthCm = selectedRoom?.tileWidth || 60;
    const tileLengthCm = selectedRoom?.tileLength || 60;
    
    const tileWidthM = tileWidthCm / 100;
    const tileLengthM = tileLengthCm / 100;

    const GRID_COLS = Math.max(1, Math.floor(roomWidthM / tileWidthM));
    const GRID_ROWS = Math.max(1, Math.floor(roomLengthM / tileLengthM));

    const items = selectedRoomId ? itemsByRoom[selectedRoomId] || [] : [];
    const setItemsForCurrentRoom = (newItems: PlacedItem[]) => {
        if (selectedRoomId) {
            updateItemsForRoom(selectedRoomId, newItems);
        }
    };

    const checkCollision = useCallback((testItem: PlacedItem, allItems: PlacedItem[]) => {
        const itemWidthInCells = testItem.width / tileWidthM;
        const itemLengthInCells = testItem.length / tileLengthM;

        if (testItem.x < 0 || testItem.y < 0 || testItem.x + itemWidthInCells > GRID_COLS || testItem.y + itemLengthInCells > GRID_ROWS) {
            return true;
        }

        for (const existingItem of allItems) {
            if (existingItem.id === testItem.id) continue;
            
            const existingItemWidthInCells = existingItem.width / tileWidthM;
            const existingItemLengthInCells = existingItem.length / tileLengthM;
            
            if (
                testItem.x < existingItem.x + existingItemWidthInCells &&
                testItem.x + itemWidthInCells > existingItem.x &&
                testItem.y < existingItem.y + existingItemLengthInCells &&
                testItem.y + itemLengthInCells > existingItem.y
            ) {
                return true;
            }
        }
        return false;
    }, [tileWidthM, tileLengthM, GRID_COLS, GRID_ROWS]);

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
        e.preventDefault();
        panStartRef.current = { x: e.clientX - viewTransform.x, y: e.clientY - viewTransform.y };
        setIsPanning(true);
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPanning) return;
        e.preventDefault();
        const newX = e.clientX - panStartRef.current.x;
        const newY = e.clientY - panStartRef.current.y;
        setViewTransform(prev => ({ ...prev, x: newX, y: newY }));
    };

    const getTouchDistance = (touches: React.TouchList) => {
        const touch1 = touches[0];
        const touch2 = touches[1];
        return Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches.length === 1) { // Pan
            panStartRef.current = { x: e.touches[0].clientX - viewTransform.x, y: e.touches[0].clientY - viewTransform.y };
            setIsPanning(true);
        } else if (e.touches.length === 2) { // Zoom
            pinchDistanceRef.current = getTouchDistance(e.touches);
            setIsPanning(false);
        }
    };
    
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const floorPlanElement = floorPlanRef.current;
        if (!floorPlanElement) return;

        if (e.touches.length === 1 && isPanning) { // Pan
            const newX = e.touches[0].clientX - panStartRef.current.x;
            const newY = e.touches[0].clientY - panStartRef.current.y;
            setViewTransform(prev => ({ ...prev, x: newX, y: newY }));
        } else if (e.touches.length === 2) { // Zoom
            const newPinchDistance = getTouchDistance(e.touches);
            const scaleChange = newPinchDistance / pinchDistanceRef.current;
            const newScale = Math.max(0.2, Math.min(2.5, viewTransform.scale * scaleChange));
            
            const rect = floorPlanElement.getBoundingClientRect();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const centerX = ((touch1.clientX + touch2.clientX) / 2) - rect.left;
            const centerY = ((touch1.clientY + touch2.clientY) / 2) - rect.top;

            const newX = centerX - (centerX - viewTransform.x) * (newScale / viewTransform.scale);
            const newY = centerY - (centerY - viewTransform.y) * (newScale / viewTransform.scale);

            setViewTransform({ x: newX, y: newY, scale: newScale });
            pinchDistanceRef.current = newPinchDistance;
        }
    };

    const handleTouchEnd = () => {
        setIsPanning(false);
        pinchDistanceRef.current = 0;
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

    const handleSelectItemAndAdd = (itemType: FloorPlanItemType) => {
        const itemWidthM = itemType.defaultWidth || tileWidthM;
        const itemLengthM = itemType.defaultLength || tileLengthM;

        const itemWidthInCells = itemWidthM / tileWidthM;
        const itemLengthInCells = itemLengthM / tileLengthM;

        const newItemProto = { id: 'proto', name: 'proto', type: 'proto', icon: 'Server', width: itemWidthM, length: itemLengthM, x:0, y:0, status: 'Ativo' as const };
        
        let newX = -1, newY = -1;
        for (let y = 0; y <= GRID_ROWS - itemLengthInCells; y++) {
            for (let x = 0; x <= GRID_COLS - itemWidthInCells; x++) {
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

        const newItemId = `${itemType.name.toLowerCase().replace(' ', '-')}-${Date.now()}`;
        const newCount = (items.filter(i => i.type === itemType.name).length) + 1;

        const newItem: PlacedItem = {
            id: newItemId,
            name: `${itemType.name}-${String(newCount).padStart(2, '0')}`,
            type: itemType.name,
            icon: itemType.icon,
            x: newX, y: newY, status: 'Ativo', 
            width: itemWidthM,
            length: itemLengthM,
            sizeU: 42,
            row: String.fromCharCode(65 + newX),
            awaitingApproval: true,
            createdBy: "Admin User",
            createdAt: new Date().toLocaleDateString('pt-BR'),
            color: itemType.color,
            // Initialize new fields
            serialNumber: null,
            entryDate: null,
            brand: null,
            tag: null,
            trellisId: null,
            ownerEmail: null,
            isTagEligible: false,
            dataSheetUrl: null,
            imageUrl: null,
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

    useEffect(() => {
        const handleFullscreenChange = () => {
            setFullscreenContainer(document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handlePrint = () => window.print();

    const handleFullscreen = () => {
        const element = floorPlanRef.current;
        if (element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            }
        }
    };
    
    const handleDragLeave = () => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
        }
    };

    const handleContainerDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (!draggingItemId || !floorPlanRef.current) return;
        e.preventDefault();

        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
        }

        const rect = floorPlanRef.current.getBoundingClientRect();
        const { clientX, clientY } = e;
        const scrollSpeed = 15;
        const edgeThreshold = 60; // 60px from the edge

        let dx = 0;
        let dy = 0;

        if (clientX < rect.left + edgeThreshold) dx = scrollSpeed;
        if (clientX > rect.right - edgeThreshold) dx = -scrollSpeed;
        if (clientY < rect.top + edgeThreshold) dy = scrollSpeed;
        if (clientY > rect.bottom - edgeThreshold) dy = -scrollSpeed;

        if (dx !== 0 || dy !== 0) {
            autoScrollIntervalRef.current = setInterval(() => {
                setViewTransform(prev => ({
                    ...prev,
                    x: prev.x + dx,
                    y: prev.y + dy,
                }));
            }, 30);
        }
    };


    const DesktopControls = () => (
        <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddItemDialogOpen(true)}><Plus className="mr-2" /> Adicionar Item</Button>
            <Button variant="outline" onClick={handlePrint}><Printer className="mr-2"/> Exportar Planta (PDF)</Button>
            <Button variant="outline" onClick={handleFullscreen}><Expand className="mr-2" /> Tela Cheia</Button>
        </div>
    );

    const MobileControls = () => (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg">
                    <MoreVertical />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="end">
                <div className="flex flex-col gap-2">
                     <Button onClick={() => setIsAddItemDialogOpen(true)}><Plus className="mr-2" /> Adicionar</Button>
                     <Button variant="outline" onClick={handlePrint}><Printer className="mr-2"/> Exportar</Button>
                     <Button variant="outline" onClick={handleFullscreen}><Expand className="mr-2" /> Tela Cheia</Button>
                </div>
            </PopoverContent>
        </Popover>
    );

    const InteractiveFloorPlan = (
        <div className="relative flex flex-col h-full gap-4 p-2 sm:p-4">
            
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 py-4 border-t">
                <div className="flex items-center gap-2">
                    <RoomSwitcher />
                    <ManageRoomsDialog><Button variant="outline" size="icon"><Settings /></Button></ManageRoomsDialog>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setViewTransform(v => ({...v, scale: Math.max(0.2, v.scale - 0.2)}))}><ZoomOut /></Button>
                    <Slider value={[viewTransform.scale]} onValueChange={([val]) => setViewTransform(v => ({...v, scale: val}))} max={2.5} min={0.2} step={0.1} className="w-32" />
                    <Button variant="outline" size="icon" onClick={() => setViewTransform(v => ({...v, scale: Math.min(2.5, v.scale + 0.2)}))}><ZoomIn /></Button>
                    <Button variant="outline" size="icon" onClick={resetView}><Maximize /></Button>
                </div>
                 <div className="hidden md:flex">
                     <DesktopControls />
                </div>
            </div>

            <div 
                ref={floorPlanRef} 
                className="flex-grow overflow-hidden border rounded-lg bg-card touch-none"
                style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
                onClick={() => setSelectedItemId(null)}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDragOver={handleContainerDragOver}
                onDragLeave={handleDragLeave}
            >
                <div className="relative" style={{ transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`, transformOrigin: 'top left', width: `${(GRID_COLS * CELL_SIZE) + 40}px`, height: `${(GRID_ROWS * CELL_SIZE) + 30}px` }}>
                    <div
                        className="absolute border-4 border-primary/80 pointer-events-none"
                        style={{
                            top: '30px',
                            left: '40px',
                            width: `${GRID_COLS * CELL_SIZE}px`,
                            height: `${GRID_ROWS * CELL_SIZE}px`,
                            zIndex: 1,
                        }}
                    />
                    <div className="grid" style={{ gridTemplateColumns: `40px repeat(${GRID_COLS}, ${CELL_SIZE}px)`, gridTemplateRows: `30px repeat(${GRID_ROWS}, ${CELL_SIZE}px)` }}>
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
                            const itemPixelWidth = (item.width / tileWidthM) * CELL_SIZE;
                            const itemPixelLength = (item.length / tileLengthM) * CELL_SIZE;
                            const gridSpanX = Math.ceil(item.width / tileWidthM);
                            const gridSpanY = Math.ceil(item.length / tileLengthM);
                            
                            const ItemIcon = getIconByName(item.icon) || Server;
                            return (
                                <div
                                    key={item.id}
                                    draggable
                                    onClick={(e) => handleItemClick(e, item.id)}
                                    onDoubleClick={() => handleItemDoubleClick(item)}
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    onDragEnd={handleDragLeave}
                                    style={{
                                        gridColumnStart: item.x + 2,
                                        gridRowStart: item.y + 2,
                                        gridColumnEnd: `span ${gridSpanX}`,
                                        gridRowEnd: `span ${gridSpanY}`,
                                        zIndex: selectedItemId === item.id ? 10 : 5,
                                    }}
                                    className="cursor-grab active:cursor-grabbing"
                                >
                                    <div
                                        style={{
                                            width: `${itemPixelWidth}px`,
                                            height: `${itemPixelLength}px`,
                                            backgroundColor: item.color || '#334155'
                                        }}
                                        className={cn(
                                            "text-white rounded-lg p-2 flex flex-col items-center justify-center shadow-lg relative transition-all",
                                            selectedItemId === item.id && "ring-2 ring-offset-2 ring-primary ring-offset-card",
                                            draggingItemId === item.id && "opacity-50"
                                        )}
                                    >
                                        <ItemIcon className="w-4 h-4 sm:w-6 sm:h-6 mb-1"/>
                                        <p className="text-[8px] sm:text-xs font-bold text-center break-words">{item.name}</p>
                                        {item.awaitingApproval && <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border-2" style={{ borderColor: item.color || '#334155' }}><Clock className="w-3 h-3"/></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                     <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-grid" style={{ backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`, backgroundPosition: '40px 30px' }}></div>
                </div>
            </div>
            { isMobile ? <MobileControls /> : null }
        </div>
    );

    if (!selectedBuilding || !selectedRoom) {
        return (
            <div className="flex flex-col h-full gap-4 p-4 sm:p-8">
                <div className="flex items-center justify-between py-4 border-b">
                     <p className="text-sm text-muted-foreground">Selecione um prédio e uma sala para começar.</p>
                     <ManageRoomsDialog><Button variant="outline"><Settings className="mr-2" /> Gerenciar Salas</Button></ManageRoomsDialog>
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
                    gridCellSize={CELL_SIZE}
                    companyName={companyName}
                    companyLogo={companyLogo}
                />
            </div>
             <ItemDetailsDialog 
                item={editingItem} 
                isOpen={!!editingItem} 
                onOpenChange={(open) => !open && setEditingItem(null)}
                onSave={handleItemSave}
                container={fullscreenContainer}
            />
            <AddItemDialog 
                isOpen={isAddItemDialogOpen}
                onOpenChange={setIsAddItemDialogOpen}
                onSelectItem={handleSelectItemAndAdd}
                container={fullscreenContainer}
            />
        </>
    );
}
