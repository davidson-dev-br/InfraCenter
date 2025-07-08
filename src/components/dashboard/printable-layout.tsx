"use client";

import type { Building, PlacedItem, Room } from "@/lib/types";
import { Building2, Server } from "lucide-react";

interface PrintableLayoutProps {
    building: Building;
    room: Room;
    items: PlacedItem[];
    gridCellSize: number;
}

export function PrintableLayout({ building, room, items, gridCellSize }: PrintableLayoutProps) {
    if (!room) return null;

    const roomWidthM = room.width;
    const roomLengthM = room.length;
    const tileWidthCm = room.tileWidth;
    const tileLengthCm = room.tileLength;
    
    const tileWidthM = tileWidthCm / 100;
    const tileLengthM = tileLengthCm / 100;

    const GRID_COLS = Math.max(1, Math.floor(roomWidthM / tileWidthM));
    const GRID_ROWS = Math.max(1, Math.floor(roomLengthM / tileLengthM));

    return (
        <div className="w-full h-full p-2 font-mono text-black bg-white">
            <div className="flex flex-col w-full h-full border-2 border-black">
                <div className="flex-grow p-1">
                    <div className="relative w-full h-full border border-black">
                        {/* Static Grid for Printing */}
                        <div 
                            className="absolute top-0 left-0 grid bg-white" 
                            style={{ 
                                gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`, 
                                gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, index) => (
                                <div key={`print-cell-${index}`} className="border-r border-b border-gray-300"></div>
                            ))}
                        </div>
                        {/* Static Items for Printing */}
                        <div 
                            className="absolute top-0 left-0 grid"
                             style={{ 
                                gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`, 
                                gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            {items.map(item => {
                                const itemWidthInCells = item.width / tileWidthM;
                                const itemLengthInCells = item.length / tileLengthM;
                                const gridSpanX = Math.ceil(itemWidthInCells);
                                const gridSpanY = Math.ceil(itemLengthInCells);
                                const scaleX = itemWidthInCells / gridSpanX;
                                const scaleY = itemLengthInCells / gridSpanY;
                                
                                const ItemIcon = item.icon || Server;
                                return (
                                    <div
                                        key={`print-${item.id}`}
                                        style={{
                                            gridColumnStart: item.x + 1,
                                            gridRowStart: item.y + 1,
                                            gridColumnEnd: `span ${gridSpanX}`,
                                            gridRowEnd: `span ${gridSpanY}`,
                                        }}
                                        className="flex items-start justify-start"
                                    >
                                        <div
                                            style={{
                                                width: `${scaleX * 100}%`,
                                                height: `${scaleY * 100}%`,
                                                backgroundColor: item.color || '#E5E7EB'
                                            }}
                                            className="flex flex-col items-center justify-center p-0.5 border border-black"
                                        >
                                            <ItemIcon className="w-3 h-3 mb-0.5 text-white" />
                                            <p className="text-[6px] font-bold text-center leading-tight break-words text-white">{item.name}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Title Block */}
                <div className="grid grid-cols-[3fr_5fr_4fr] text-[10px] border-t-2 border-black leading-tight">
                    <div className="grid grid-rows-[auto_1fr] border-r-2 border-black">
                        <div className="grid grid-cols-[1fr_auto] p-1 border-b border-black">
                            <div className="flex flex-col items-center justify-center w-full h-12 gap-1 border-r border-black">
                                <Building2 className="w-5 h-5 text-black" />
                                <p className="text-[8px] font-bold">TIM BLMSAC</p>
                            </div>
                            <div className="p-1 w-[80px]">
                                <p><span>Rev.</span></p>
                                <p className="font-bold">PAE1</p>
                                <p className="mt-1"><span>Folha-Sheet</span></p>
                                <p className="font-bold">1(1)</p>
                            </div>
                        </div>
                        <div className="p-1">
                            <p><span>Referências - References</span></p>
                            <p className="mt-1 font-bold">ECS</p>
                        </div>
                    </div>

                    <div className="grid grid-rows-[auto_1fr] border-r-2 border-black">
                        <div className="p-1 text-base font-bold text-center border-b-2 border-black">
                            LOCALIZAÇÃO DE EQUIPAMENTOS
                        </div>
                        <div className="grid grid-cols-2 p-1">
                            <div>
                                <p><span>Executado:</span> <span className="font-bold">EDB/O/B/R/B</span></p>
                                <p><span>Responsável:</span> <span className="font-bold">EGS/JWA</span></p>
                                <p><span>Aprovado:</span> <span className="font-bold">Henrique Santos</span></p>
                            </div>
                            <div className="pl-2">
                                <p><span>Data - Date:</span></p>
                                <p className="font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-2 space-y-1">
                        <p><span>Denominação - Title</span></p>
                        <p className="font-bold">{building?.name}</p>
                        <p className="font-bold">{room?.name}</p>
                        <p className="mt-2"><span>Escala - Scale:</span> <span className="font-bold">N.T.S.</span></p>
                        <p><span>Document No.</span></p>
                        <p className="font-bold">193 05-IPB 076 9914/11 Upb</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
