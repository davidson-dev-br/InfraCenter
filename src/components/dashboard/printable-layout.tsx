"use client";

import type { Building, PlacedItem, Room } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PrintableLayoutProps {
    building: Building;
    room: Room;
    items: PlacedItem[];
    getItemDimensions: (item: PlacedItem) => { width: number; length: number };
    gridCellSize: number;
}

export function PrintableLayout({ building, room, items, getItemDimensions, gridCellSize }: PrintableLayoutProps) {
    if (!room) return null;

    const roomWidthM = room.width;
    const roomLengthM = room.length;
    const tileWidthCm = room.tileWidth;
    const tileLengthCm = room.tileLength;
    const GRID_COLS = Math.max(1, Math.floor((roomWidthM * 100) / tileWidthCm));
    const GRID_ROWS = Math.max(1, Math.floor((roomLengthM * 100) / tileLengthCm));

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
                                const { width, length } = getItemDimensions(item);
                                return (
                                    <div
                                        key={`print-${item.id}`}
                                        style={{
                                            gridColumnStart: item.x + 1,
                                            gridRowStart: item.y + 1,
                                            gridColumnEnd: `span ${width}`,
                                            gridRowEnd: `span ${length}`,
                                        }}
                                        className="flex flex-col items-center justify-center p-1 border-2 border-black bg-gray-200"
                                    >
                                         <p className="text-[8px] font-bold text-center leading-tight">{item.name}</p>
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
                            <div className="flex items-center justify-center w-full h-12 border-r border-black">
                                <span className="text-xs text-gray-500">[LOGO AQUI]</span>
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
                        <p className="mt-2"><span>Escala - Scale:</span> <span className="font-bold">1:100</span></p>
                        <p><span>Document No.</span></p>
                        <p className="font-bold">193 05-IPB 076 9914/11 Upb</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
