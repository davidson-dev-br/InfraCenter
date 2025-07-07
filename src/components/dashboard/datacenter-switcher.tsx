"use client";

import * as React from "react";
import { ChevronsUpDown, Building, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { PlacedItem, Building as BuildingType, Room } from "@/lib/types";

const initialBuildings: BuildingType[] = [
    { id: 'b1', name: 'Datacenter Principal', rooms: [
        { id: 'r1', name: 'Data Center' },
        { id: 'r2', name: 'Sala de Controle' },
    ]},
    { id: 'b2', name: 'Prédio Anexo', rooms: [
        { id: 'r3', name: 'Sala de Baterias' },
    ]}
];

const initialItemsByRoom: Record<string, PlacedItem[]> = {
    'r1': [
        { id: 'rack-3', name: 'Rack-3', type: 'Server Rack', icon: Server, x: 1, y: 0, status: 'Ativo', width: 0.6, length: 0.6, sizeU: 42, row: 'A', observations: 'Rack principal.', awaitingApproval: false, createdBy: 'Admin User', createdAt: '05/07/2025' },
        { id: 'rack-2', name: 'Rack-02', type: 'Server Rack', icon: Server, x: 7, y: 2, status: 'Ativo', width: 0.6, length: 1.2, sizeU: 42, row: 'B', observations: '', awaitingApproval: false, createdBy: 'Admin User', createdAt: '05/07/2025' },
        { id: 'rack-0', name: 'Rack-00', type: 'rack', icon: Server, x: 8, y: 2, status: 'Manutenção', width: 0.8, length: 0.8, sizeU: 48, row: 'B', observations: 'Verificar fonte de energia.', awaitingApproval: true, createdBy: 'Davidson Santos Conceição', createdAt: '06/07/2025' },
        { id: 'qdf-1', name: 'QDF-1', type: 'qdf', icon: Server, x: 5, y: 5, status: 'Ativo', width: 0.6, length: 0.6, sizeU: 42, row: 'F', observations: '', awaitingApproval: true, createdBy: 'Davidson Santos Conceição', createdAt: '05/07/2025' },
    ],
    'r2': [],
    'r3': [],
};


// --- Context for sharing infrastructure state ---
interface InfraContextType {
    buildings: BuildingType[];
    itemsByRoom: Record<string, PlacedItem[]>;
    selectedBuildingId: string | null;
    selectedRoomId: string | null;
    
    setSelectedBuildingId: (buildingId: string) => void;
    setSelectedRoomId: (roomId: string) => void;
    
    updateItemsForRoom: (roomId: string, items: PlacedItem[]) => void;
    approveItem: (itemId: string) => void;
    
    addRoom: (buildingId: string, roomName: string) => void;
    deleteRoom: (buildingId: string, roomId: string) => void;
    reorderRooms: (buildingId: string, roomId: string, direction: 'up' | 'down') => void;
}

const InfraContext = React.createContext<InfraContextType | undefined>(undefined);

export function InfraProvider({ children }: { children: React.ReactNode }) {
    const [buildings, setBuildings] = React.useState<BuildingType[]>(initialBuildings);
    const [itemsByRoom, setItemsByRoom] = React.useState<Record<string, PlacedItem[]>>(initialItemsByRoom);
    const [selectedBuildingId, _setSelectedBuildingId] = React.useState<string | null>(initialBuildings[0]?.id || null);
    const [selectedRoomId, setSelectedRoomId] = React.useState<string | null>(initialBuildings[0]?.rooms[0]?.id || null);

    const setSelectedBuildingId = (buildingId: string) => {
        _setSelectedBuildingId(buildingId);
        const building = buildings.find(b => b.id === buildingId);
        setSelectedRoomId(building?.rooms[0]?.id || null); 
    };
    
    const updateItemsForRoom = (roomId: string, items: PlacedItem[]) => {
        setItemsByRoom(prev => ({ ...prev, [roomId]: items }));
    };

    const approveItem = (itemId: string) => {
        setItemsByRoom(prev => {
            const newItemsByRoom = { ...prev };
            for (const roomId in newItemsByRoom) {
                newItemsByRoom[roomId] = newItemsByRoom[roomId].map(item =>
                    item.id === itemId ? { ...item, awaitingApproval: false } : item
                );
            }
            return newItemsByRoom;
        });
    };

    const addRoom = (buildingId: string, roomName: string) => {
        const newRoom: Room = { id: `r-${Date.now()}`, name: roomName };
        setBuildings(prev => prev.map(b => 
            b.id === buildingId ? { ...b, rooms: [...b.rooms, newRoom] } : b
        ));
        setItemsByRoom(prev => ({ ...prev, [newRoom.id]: [] }));
    };

    const deleteRoom = (buildingId: string, roomId: string) => {
        setBuildings(prev => prev.map(b => {
            if (b.id !== buildingId) return b;
            const newRooms = b.rooms.filter(r => r.id !== roomId);
            if (selectedRoomId === roomId) {
                setSelectedRoomId(newRooms[0]?.id || null);
            }
            return { ...b, rooms: newRooms };
        }));

        setItemsByRoom(prev => {
            const newItems = { ...prev };
            delete newItems[roomId];
            return newItems;
        });
    };

    const reorderRooms = (buildingId: string, roomId: string, direction: 'up' | 'down') => {
        setBuildings(prev => prev.map(b => {
            if (b.id !== buildingId) return b;
            
            const index = b.rooms.findIndex(r => r.id === roomId);
            if (index === -1) return b;

            const newRooms = [...b.rooms];
            if (direction === 'up' && index > 0) {
                [newRooms[index - 1], newRooms[index]] = [newRooms[index], newRooms[index - 1]];
            }
            if (direction === 'down' && index < newRooms.length - 1) {
                [newRooms[index], newRooms[index + 1]] = [newRooms[index + 1], newRooms[index]];
            }
            return { ...b, rooms: newRooms };
        }));
    };
    
    return (
        <InfraContext.Provider value={{ buildings, itemsByRoom, selectedBuildingId, selectedRoomId, setSelectedBuildingId, setSelectedRoomId, updateItemsForRoom, approveItem, addRoom, deleteRoom, reorderRooms }}>
            {children}
        </InfraContext.Provider>
    );
}

export function useInfra() {
    const context = React.useContext(InfraContext);
    if (context === undefined) {
        throw new Error('useInfra must be used within a InfraProvider');
    }
    return context;
}
// --- End Context ---

export function DatacenterSwitcher() {
  const [open, setOpen] = React.useState(false);
  const { buildings, selectedBuildingId, setSelectedBuildingId } = useInfra();

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-[200px]"
        >
          <Building className="w-4 h-4 mr-2" />
          {selectedBuilding ? selectedBuilding.name : "Selecione o Prédio"}
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Buscar prédio..." />
            <CommandEmpty>Nenhum prédio encontrado.</CommandEmpty>
            <CommandGroup>
              {buildings.map((b) => (
                <CommandItem
                  key={b.id}
                  onSelect={() => {
                    setSelectedBuildingId(b.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Building className="w-4 h-4 mr-2" />
                  {b.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
