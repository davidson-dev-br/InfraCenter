
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Plus,
  RefreshCw,
  LayoutGrid,
  Maximize,
  Circle,
  Info,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useBuilding } from '@/components/building-provider';
import { usePermissions } from '@/components/permissions-provider';
import { useToast } from '@/hooks/use-toast';
import type { Building, Room, GridItem } from '@/types/datacenter';
import { RenameRoomDialog } from './rename-room-dialog';
import { updateItem } from '@/lib/item-actions';
import { ItemDetailDialog } from './item-detail-dialog'; 
import { AddItemDialog } from './add-item-dialog';
import { cn } from '@/lib/utils';
import { statusColors } from '@/lib/status-config';
import { getItemStatuses, ItemStatus } from '@/lib/status-actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from './ui/card';


const colorStyles: Record<typeof statusColors[number], string> = {
    gray: "fill-gray-500", red: "fill-red-500", orange: "fill-orange-500",
    amber: "fill-amber-500", yellow: "fill-yellow-500", lime: "fill-lime-500",
    green: "fill-green-500", emerald: "fill-emerald-500", teal: "fill-teal-500",
    cyan: "fill-cyan-500", sky: "fill-sky-500", blue: "fill-blue-500",
    indigo: "fill-indigo-500", violet: "fill-violet-500", purple: "fill-purple-500",
    fuchsia: "fill-fuchsia-500", pink: "fill-pink-500", rose: "fill-rose-500",
};

const getStatusColor = (statuses: ItemStatus[], statusId: GridItem['status']): string => {
    const status = statuses.find(s => s.id === statusId);
    return status ? colorStyles[status.color] : colorStyles.gray;
}

const itemIcons: Record<string, React.ElementType> = {
  'Rack': LayoutGrid,
  'Ar Condicionado': LayoutGrid,
  'QDF': LayoutGrid,
  'Switch': LayoutGrid,
  'Patch Panel': LayoutGrid,
  'default': LayoutGrid,
};

const StatusLegend = () => {
    const [statuses, setStatuses] = React.useState<ItemStatus[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        getItemStatuses()
            .then(data => setStatuses(data.filter(s => !s.isArchived))) // Only show non-archived statuses in legend
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <Card className="absolute bottom-4 left-4 z-10 w-64 shadow-lg">
            <Accordion type="single" collapsible>
                <AccordionItem value="legend" className="border-b-0">
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                        <div className="flex items-center gap-2">
                           <Info className="h-4 w-4" />
                           <span className="text-sm font-semibold">Legenda de Status</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                        {isLoading ? (
                            <p className="text-xs text-muted-foreground">Carregando...</p>
                        ) : (
                            <ul className="space-y-2">
                                {statuses.map(status => (
                                    <li key={status.id} className="flex items-center gap-2">
                                        <Circle className={cn("h-3 w-3", colorStyles[status.color] || colorStyles.gray)} />
                                        <span className="text-sm">{status.name}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );
};


export function DatacenterClient({ initialData }: { initialData: Building[] }) {
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const { activeBuildingId } = useBuilding();
  const [activeRoomId, setActiveRoomId] = React.useState<string | null>(null);
  const [gridItems, setGridItems] = React.useState<GridItem[]>([]);
  const [isEditRoomOpen, setIsEditRoomOpen] = React.useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = React.useState(false);
  
  const [editingItem, setEditingItem] = React.useState<GridItem | null>(null);

  const [viewTransform, setViewTransform] = React.useState({ x: 50, y: 50, scale: 1 });
  const [isPanning, setIsPanning] = React.useState(false);
  const panStartRef = React.useRef({ x: 0, y: 0 });

  const [draggingItem, setDraggingItem] = React.useState<{ id: string; offsetX: number; offsetY: number; originalX: number; originalY: number } | null>(null);

  const [cellSize, setCellSize] = React.useState(50);
  const [statuses, setStatuses] = React.useState<ItemStatus[]>([]);

  const floorPlanRef = React.useRef<HTMLDivElement>(null);

  const currentBuilding = React.useMemo(() => 
    initialData.find(b => b.id === activeBuildingId),
  [initialData, activeBuildingId]);

  const availableRooms = React.useMemo(() => currentBuilding?.rooms || [], [currentBuilding]);

  const activeRoom = React.useMemo(() => availableRooms.find(r => r.id === activeRoomId), [availableRooms, activeRoomId]);

  const roomDimensions = React.useMemo(() => ({
    widthM: activeRoom?.widthM || 20,
    heightM: activeRoom?.heightM || 20,
  }), [activeRoom]);

  const tileDimensions = React.useMemo(() => ({
      widthCm: activeRoom?.tileWidthCm || 60,
      heightCm: activeRoom?.tileHeightCm || 60,
  }), [activeRoom]);

  const gridNaming = React.useMemo(() => ({
    x: activeRoom?.xAxisNaming || 'alpha',
    y: activeRoom?.yAxisNaming || 'numeric',
  }), [activeRoom]);

  React.useEffect(() => {
    getItemStatuses().then(setStatuses);
  }, []);

  React.useEffect(() => {
    if (availableRooms.length > 0 && !availableRooms.some(r => r.id === activeRoomId)) {
        setActiveRoomId(availableRooms[0].id);
    } else if (availableRooms.length === 0) {
        setActiveRoomId(null);
    }
  }, [availableRooms, activeRoomId]);

  React.useEffect(() => {
    setGridItems(activeRoom?.items || []);
  }, [activeRoom]);


  const GRID_COLS = Math.floor((roomDimensions.widthM * 100) / tileDimensions.widthCm);
  const GRID_ROWS = Math.floor((roomDimensions.heightM * 100) / tileDimensions.heightCm);

  const getAxisLabel = (type: 'x' | 'y', index: number): string => {
    const naming = type === 'x' ? gridNaming.x : gridNaming.y;
    if (naming === 'alpha') {
      let label = '';
      let tempIndex = index;
      while (tempIndex >= 0) {
        label = String.fromCharCode(65 + (tempIndex % 26)) + label;
        tempIndex = Math.floor(tempIndex / 26) - 1;
      }
      return label;
    }
    return String(index + 1);
  };
  
  const getCellLabel = (x: number, y: number): string => {
      const xLabel = getAxisLabel('x', x);
      const yLabel = getAxisLabel('y', y);
      return `${xLabel}${yLabel}`;
  };


  const handleWheel = (e: React.WheelEvent) => {
    if (!floorPlanRef.current) return;
    e.preventDefault();
    const rect = floorPlanRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const newScale = Math.max(0.2, Math.min(2.5, viewTransform.scale - e.deltaY * 0.001));
    
    const newX = mouseX - (mouseX - viewTransform.x) * (newScale / viewTransform.scale);
    const newY = mouseY - (mouseY - viewTransform.y) * (newScale / viewTransform.scale);
    
    setViewTransform({ x: newX, y: newY, scale: newScale });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    panStartRef.current = { x: e.clientX - viewTransform.x, y: e.clientY - viewTransform.y };
    setIsPanning(true);
    e.currentTarget.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingItem) {
      handleItemDrag(e.clientX, e.clientY);
    } else if (isPanning) {
      const newX = e.clientX - panStartRef.current.x;
      const newY = e.clientY - panStartRef.current.y;
      setViewTransform({ ...viewTransform, x: newX, y: newY });
    }
  };

  const handleMouseUp = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      e.currentTarget.style.cursor = 'grab';
    }
    if (draggingItem) {
      const draggedItem = gridItems.find(item => item.id === draggingItem.id);
      if (draggedItem && (draggedItem.x !== draggingItem.originalX || draggedItem.y !== draggingItem.originalY)) {
        try {
          await updateItem({ id: draggedItem.id, x: draggedItem.x, y: draggedItem.y });
          toast({
            title: "Posição Atualizada",
            description: `A nova posição de ${draggedItem.label} foi salva.`,
          });
        } catch (error) {
          console.error("Falha ao salvar a nova posição:", error);
          toast({
            variant: "destructive",
            title: "Erro ao Salvar",
            description: `Não foi possível salvar a nova posição de ${draggedItem.label}.`,
          });
          // Reverte para a posição original em caso de erro
          setGridItems(items => items.map(item =>
            item.id === draggingItem!.id ? { ...item, x: draggingItem!.originalX, y: draggingItem!.originalY } : item
          ));
        }
      }
      setDraggingItem(null);
    }
  };


  const handleItemMouseDown = (e: React.MouseEvent, item: GridItem) => {
      e.stopPropagation();
      
      if (e.detail === 2) { 
        setEditingItem(item);
        return;
      }
      
      if (!floorPlanRef.current) return;
      
      const rect = floorPlanRef.current.getBoundingClientRect();
      const itemScreenX = item.x * cellSize * viewTransform.scale + viewTransform.x + rect.left;
      const itemScreenY = item.y * cellSize * viewTransform.scale + viewTransform.y + rect.top;

      const offsetX = e.clientX - itemScreenX;
      const offsetY = e.clientY - itemScreenY;
      
      setDraggingItem({ id: item.id, offsetX, offsetY, originalX: item.x, originalY: item.y });
  };

  const handleItemDrag = (clientX: number, clientY: number) => {
    if (!draggingItem || !floorPlanRef.current) return;

    const rect = floorPlanRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const newGridX = (mouseX - viewTransform.x - draggingItem.offsetX) / (cellSize * viewTransform.scale);
    const newGridY = (mouseY - viewTransform.y - draggingItem.offsetY) / (cellSize * viewTransform.scale);

    const newCellX = Math.round(newGridX);
    const newCellY = Math.round(newGridY);
    
    setGridItems(items => items.map(item => {
      if (item.id === draggingItem.id) {
        const clampedX = Math.max(0, Math.min(newCellX, GRID_COLS - 1));
        const clampedY = Math.max(0, Math.min(newCellY, GRID_ROWS - 1));
        return { ...item, x: clampedX, y: clampedY };
      }
      return item;
    }));
  };

  const handleItemUpdate = (updatedItem: GridItem) => {
    setGridItems(prevItems =>
      prevItems.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
  };
  
  const handleItemAdded = (newItem: GridItem) => {
    setGridItems(prevItems => [...prevItems, newItem]);
  };

  const handleItemDelete = (itemId: string) => {
    setGridItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };


  const resetView = () => setViewTransform({ x: 50, y: 50, scale: 1 });

  const GridItemComponent = ({ item }: { item: GridItem }) => {
    if (!tileDimensions.widthCm || !tileDimensions.heightCm) return null;
    const itemPixelWidth = (item.width / (tileDimensions.widthCm / 100)) * cellSize;
    const itemPixelHeight = (item.height / (tileDimensions.heightCm / 100)) * cellSize;
    const Icon = itemIcons[item.type] || itemIcons.default;
    
    const indicatorColorClass = getStatusColor(statuses, item.status);
    
    // Prioriza a cor do item, depois a cor do tipo de item, e por fim a cor padrão.
    const itemBackgroundColor = item.color || item.itemTypeColor || undefined;

    return (
      <div
        className={cn(
            "absolute text-card-foreground rounded-md p-2 flex flex-col items-center justify-center shadow-lg active:cursor-grabbing border-2 transition-colors",
            "border-transparent hover:border-primary"
        )}
        style={{
          left: item.x * cellSize,
          top: item.y * cellSize,
          width: itemPixelWidth,
          height: itemPixelHeight,
          cursor: isPanning ? 'grabbing' : 'grab',
          transformOrigin: 'top left',
          boxSizing: 'border-box',
          backgroundColor: itemBackgroundColor,
          color: itemBackgroundColor ? 'white' : undefined,
          ...(!itemBackgroundColor && { backgroundColor: 'hsl(var(--card))' })
        }}
        onMouseDown={(e) => handleItemMouseDown(e, item)}
      >
        <Icon className="w-4 h-4 mb-1" />
        <p className="text-xs font-bold text-center break-words">{item.label}</p>
         <div 
          className="absolute inset-0 flex items-center justify-center text-muted-foreground/10 text-2xl font-bold select-none pointer-events-none"
          style={{ fontSize: Math.min(itemPixelWidth, itemPixelHeight) / 2 }}
        >
          {getCellLabel(item.x, item.y)}
        </div>
        <Circle className={cn("absolute top-1.5 right-1.5 h-3 w-3 animate-status-pulse", indicatorColorClass)} />
      </div>
    );
  };
  
  const toggleFullScreen = () => {
    if (!floorPlanRef.current) return;
    if (!document.fullscreenElement) {
      floorPlanRef.current.requestFullscreen().catch((err) => {
        toast({
          title: "Erro ao entrar em tela cheia",
          description: err.message,
          variant: "destructive",
        });
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="flex-shrink-0 p-4 bg-card border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Planta Baixa</h1>
          <div className="flex items-center gap-2">
            <Select value={activeRoomId ?? ''} onValueChange={setActiveRoomId} disabled={availableRooms.length === 0}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={availableRooms.length > 0 ? "Selecione uma sala" : "Nenhuma sala disponível"} />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeRoom && hasPermission('page:buildings:view') && (
              <Button variant="ghost" size="icon" onClick={() => setIsEditRoomOpen(true)}>
                <Settings className="h-4 w-4" />
                <span className="sr-only">Editar Sala</span>
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Slider
              value={[viewTransform.scale]}
              onValueChange={([val]) => setViewTransform(v => ({ ...v, scale: val }))}
              max={2.5}
              min={0.2}
              step={0.1}
              className="w-32"
            />
            <Button variant="outline" size="icon" onClick={resetView} title="Resetar Visualização"><RefreshCw/></Button>
            <Button variant="outline" size="icon" onClick={toggleFullScreen} title="Tela Cheia"><Maximize /></Button>
            <Button onClick={() => setIsAddItemOpen(true)} disabled={!activeRoom}>
                <Plus className="mr-2"/>Adicionar Item
            </Button>
        </div>
      </div>

      <div 
        ref={floorPlanRef}
        className="flex-grow w-full overflow-hidden bg-muted/20 touch-none relative"
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="absolute top-0 left-0"
          style={{ transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`, transformOrigin: 'top left' }}
        >
             <div className="relative border-4 border-primary/30 pointer-events-none" style={{ width: GRID_COLS * cellSize, height: GRID_ROWS * cellSize }}>
                {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, index) => {
                    const x = index % GRID_COLS;
                    const y = Math.floor(index / GRID_COLS);
                    return (
                        <div key={`cell-${x}-${y}`} className="absolute border-t border-l border-border/20 box-border" style={{ left: x * cellSize, top: y * cellSize, width: cellSize, height: cellSize }}>
                           <div className="text-muted-foreground/20 text-xs select-none p-1">{getCellLabel(x, y)}</div>
                        </div>
                    );
                })}
                {Array.from({ length: GRID_COLS }).map((_, i) => <div key={`col-label-${i}`} className="absolute text-center font-bold text-muted-foreground/50" style={{ left: i * cellSize, top: -30, width: cellSize }}>{getAxisLabel('x', i)}</div>)}
                {Array.from({ length: GRID_ROWS }).map((_, i) => <div key={`row-label-${i}`} className="absolute text-center font-bold text-muted-foreground/50" style={{ top: i * cellSize, left: -40, height: cellSize, writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getAxisLabel('y', i)}</div>)}
            </div>

            {gridItems.map(item => <GridItemComponent key={item.id} item={item} />)}
        </div>
        <StatusLegend />
      </div>
      
       {editingItem && (
        <ItemDetailDialog
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onItemUpdate={handleItemUpdate}
          onItemDelete={handleItemDelete}
          fullItemContext={{
            currentBuilding: currentBuilding,
            availableRooms: availableRooms,
            activeRoomId: activeRoomId,
            allItems: initialData.flatMap(b => b.rooms).flatMap(r => r.items),
          }}
        />
      )}

      {activeRoom && (
        <AddItemDialog
          room={activeRoom}
          open={isAddItemOpen}
          onOpenChange={setIsAddItemOpen}
          onItemAdded={handleItemAdded}
        />
      )}
      
      {activeRoom && (
        <RenameRoomDialog
          room={activeRoom}
          open={isEditRoomOpen}
          onOpenChange={setIsEditRoomOpen}
        />
      )}
    </div>
  );
}
