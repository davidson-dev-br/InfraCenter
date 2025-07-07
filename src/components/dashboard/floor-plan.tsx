"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Move, Trash2, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFloorPlan } from './floor-plan-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const GRID_SIZE = 20;

type GridItem = {
    id: string;
    type: string;
    icon: LucideIcon;
};

export function FloorPlan() {
    const [zoom, setZoom] = useState(1);
    const [gridItems, setGridItems] = useState<Map<string, GridItem>>(new Map());
    const [draggingItemKey, setDraggingItemKey] = useState<string | null>(null);
    const { selectedEquipment, setSelectedEquipment } = useFloorPlan();

    const handleCellClick = useCallback((x: number, y: number) => {
        const key = `${x}-${y}`;
        if (draggingItemKey) {
            const itemToMove = gridItems.get(draggingItemKey);
            if (itemToMove && !gridItems.has(key)) {
                const newGridItems = new Map(gridItems);
                newGridItems.delete(draggingItemKey);
                newGridItems.set(key, itemToMove);
                setGridItems(newGridItems);
            }
            setDraggingItemKey(null);
        } else if (selectedEquipment) {
            if (!gridItems.has(key)) {
                const newGridItems = new Map(gridItems);
                newGridItems.set(key, { id: key, type: selectedEquipment.name, icon: selectedEquipment.icon });
                setGridItems(newGridItems);
            }
            setSelectedEquipment(null);
        }
    }, [draggingItemKey, gridItems, selectedEquipment, setSelectedEquipment]);

    const startDrag = useCallback((e: React.MouseEvent, key: string) => {
        e.stopPropagation();
        setDraggingItemKey(key);
        setSelectedEquipment(null);
    }, [setSelectedEquipment]);

    const removeItem = useCallback((e: React.MouseEvent, key: string) => {
        e.stopPropagation();
        const newGridItems = new Map(gridItems);
        newGridItems.delete(key);
        setGridItems(newGridItems);
    }, [gridItems]);

    return (
        <Card className="h-full shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Floor Plan: US-East-1</CardTitle>
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                       <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}>
                                    <ZoomOut className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Zoom Out</p></TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
                                    <ZoomIn className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Zoom In</p></TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => setZoom(1)}>
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Reset Zoom</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardHeader>
            <CardContent className="h-[70vh] overflow-auto bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                <div 
                    className="relative transition-transform duration-300" 
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                >
                    <div 
                        className="grid bg-card border-r border-b"
                        style={{
                            gridTemplateColumns: `repeat(${GRID_SIZE}, 60px)`,
                            gridTemplateRows: `repeat(${GRID_SIZE}, 60px)`,
                            width: `${GRID_SIZE * 60}px`
                        }}
                    >
                        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                            const x = i % GRID_SIZE;
                            const y = Math.floor(i / GRID_SIZE);
                            const key = `${x}-${y}`;
                            const item = gridItems.get(key);
                            const isDraggingOver = draggingItemKey && item?.id === draggingItemKey;
                            const canPlace = selectedEquipment || draggingItemKey;

                            return (
                                <div
                                    key={key}
                                    onClick={() => handleCellClick(x, y)}
                                    className={cn(
                                        "w-[60px] h-[60px] border-l border-t flex items-center justify-center transition-colors",
                                        canPlace && !item && "hover:bg-accent/20 cursor-pointer",
                                        draggingItemKey && !item && "cursor-grabbing",
                                        item && "cursor-not-allowed"
                                    )}
                                >
                                    {item && (
                                        <div
                                            className="relative group p-2 text-primary bg-background rounded-md shadow-lg w-12 h-12 flex items-center justify-center"
                                        >
                                            <item.icon className="w-7 h-7" />
                                            <div className="absolute -top-2 -right-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <Button variant="outline" size="icon" className="w-6 h-6 mr-1" onClick={(e) => startDrag(e, key)}>
                                                    <Move className="w-3 h-3"/>
                                                </Button>
                                                <Button variant="destructive" size="icon" className="w-6 h-6" onClick={(e) => removeItem(e, key)}>
                                                    <Trash2 className="w-3 h-3"/>
                                                </Button>
                                            </div>
                                            {isDraggingOver && (
                                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 rounded-md">
                                                    <Move className="w-6 h-6 text-white animate-pulse" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
