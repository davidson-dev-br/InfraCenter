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
import type { PlacedItem, Building as BuildingType, Room, FloorPlanItemType, StatusOption, DeletionLogEntry, Equipment } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const initialBuildings: BuildingType[] = [
    { 
        id: 'b1', name: 'US-East-1', location: "N. Virginia, USA", status: "Online", rooms: [
            { id: 'r1', name: 'Data Center', width: 25, length: 15, tileWidth: 60, tileLength: 60 },
            { id: 'r2', name: 'Sala de Controle', width: 10, length: 15, tileWidth: 60, tileLength: 60 },
        ]
    },
    { 
        id: 'b2', name: 'EU-West-2', location: "London, UK", status: "Online", rooms: [
            { id: 'r3', name: 'Sala de Baterias', width: 12, length: 8, tileWidth: 60, tileLength: 60 },
        ]
    },
    { id: 'b3', name: 'AP-South-1', location: "Mumbai, India", status: "Maintenance", rooms: [] },
    { id: 'b4', name: 'US-West-2', location: "Oregon, USA", status: "Offline", rooms: [] },
];

const initialItemsByRoom: Record<string, PlacedItem[]> = {
    'r1': [
        { id: 'rack-3', name: 'Rack-3', type: 'Server Rack', icon: Server, x: 1, y: 0, status: 'Ativo', width: 0.6, length: 0.6, sizeU: 42, row: 'A', observations: 'Rack principal.', awaitingApproval: false, createdBy: 'Admin User', createdAt: '05/07/2025', color: '#334155' },
        { id: 'rack-2', name: 'Rack-02', type: 'Server Rack', icon: Server, x: 7, y: 2, status: 'Ativo', width: 0.6, length: 1.2, sizeU: 42, row: 'B', observations: '', awaitingApproval: false, createdBy: 'Admin User', createdAt: '05/07/2025', color: '#334155' },
        { id: 'rack-0', name: 'Rack-00', type: 'rack', icon: Server, x: 8, y: 2, status: 'Manutenção', width: 0.8, length: 0.8, sizeU: 48, row: 'B', observations: 'Verificar fonte de energia.', awaitingApproval: true, createdBy: 'Davidson Santos Conceição', createdAt: '06/07/2025', color: '#334155' },
        { id: 'qdf-1', name: 'QDF-1', type: 'qdf', icon: Server, x: 5, y: 5, status: 'Ativo', width: 0.6, length: 0.6, sizeU: 42, row: 'F', observations: '', awaitingApproval: true, createdBy: 'Davidson Santos Conceição', createdAt: '05/07/2025', color: '#ca8a04' },
    ],
    'r2': [],
    'r3': [],
};

const initialEquipment: Equipment[] = [
    { id: 'eq-1', hostname: 'SWPSBLM01', type: 'Switch', parentItemId: 'rack-2', positionU: '39', imageUrl: 'https://placehold.co/128x64.png', brand: 'Cisco', model: 'Catalyst 9300' },
    { id: 'eq-2', hostname: 'Swblmsac0101', type: 'Switch', parentItemId: 'rack-2', positionU: '1', imageUrl: 'https://placehold.co/128x64.png', brand: 'Juniper', model: 'EX4300' },
    { id: 'eq-3', hostname: 'Roteador-Central', type: 'Roteador', parentItemId: 'rack-0', positionU: '20-29', imageUrl: 'https://placehold.co/128x64.png', brand: 'HPE', model: 'Aruba 8325' },
    { id: 'eq-4', hostname: 'Swblmsac0102', type: 'Switch', parentItemId: 'rack-0', positionU: '1', imageUrl: 'https://placehold.co/128x64.png', brand: 'Dell', model: 'PowerSwitch S4148F-ON' },
];


const initialFloorPlanItemTypes: FloorPlanItemType[] = [
    { id: '1', name: 'Rack', icon: 'Server', defaultWidth: 0.6, defaultLength: 1.2, color: '#334155' },
    { id: '2', name: 'Ar Condicionado', icon: 'AirVent', defaultWidth: 0.8, defaultLength: 0.8, color: '#0369a1' },
    { id: '3', name: 'QDF', icon: 'Zap', defaultWidth: 0.6, defaultLength: 0.3, color: '#ca8a04' },
    { id: '4', name: 'Patch Panel', icon: 'Cable', defaultWidth: 0.6, defaultLength: 0.3, color: '#65a30d' },
];

// Developer settings options
type SelectOption = { id: string; name: string };
const initialEquipmentTypes: SelectOption[] = [
    { id: '1', name: 'Servidor' },
    { id: '2', name: 'Switch' },
    { id: '3', name: 'Patch Panel' },
    { id: '4', name: 'Storage' },
    { id: '5', name: 'Roteador' },
];
const initialDeletionReasons: SelectOption[] = [
    { id: '1', name: 'Item criado por engano' },
    { id: '2', name: 'Item desativado (decommissioned)' },
    { id: '3', name: 'Substituído por novo item' },
    { id: '4', name: 'Erro de inventário' },
];
const initialDatacenterStatuses: StatusOption[] = [
    { id: '1', name: 'Online', color: '#22c55e' },
    { id: '2', name: 'Offline', color: '#ef4444' },
    { id: '3', name: 'Maintenance', color: '#f59e0b' },
];

const initialDeletionLog: DeletionLogEntry[] = [
    { id: 'del-1', itemId: 'deleted-item-1', itemName: 'Old Server 01', itemType: 'Server Rack', deletedBy: 'Admin User', deletedAt: '01/07/2025', reason: 'Item desativado (decommissioned)' }
];


// --- Context for sharing infrastructure state ---
interface InfraContextType {
    buildings: BuildingType[];
    itemsByRoom: Record<string, PlacedItem[]>;
    equipment: Equipment[];
    floorPlanItemTypes: FloorPlanItemType[];
    selectedBuildingId: string | null;
    selectedRoomId: string | null;
    companyName: string;
    companyLogo: string | null;
    equipmentTypes: SelectOption[];
    deletionReasons: SelectOption[];
    datacenterStatuses: StatusOption[];
    deletionLog: DeletionLogEntry[];
    
    setSelectedBuildingId: (buildingId: string) => void;
    setSelectedRoomId: (roomId: string) => void;
    setCompanyName: (name: string) => void;
    setCompanyLogo: (logo: string | null) => void;

    addBuilding: (buildingData: Omit<BuildingType, 'id' | 'rooms'>) => void;
    updateBuilding: (updatedBuilding: BuildingType) => void;
    deleteBuilding: (buildingId: string) => void;
    
    updateItemsForRoom: (roomId: string, items: PlacedItem[]) => void;
    approveItem: (itemId: string) => void;
    deleteItem: (itemToDelete: PlacedItem, reason: string) => void;
    
    addRoom: (buildingId: string, roomData: Omit<Room, 'id'>) => void;
    updateRoom: (buildingId: string, updatedRoom: Room) => void;
    deleteRoom: (buildingId: string, roomId: string) => void;
    reorderRooms: (buildingId: string, roomId: string, direction: 'up' | 'down') => void;

    addFloorPlanItemType: (item: Omit<FloorPlanItemType, 'id'>) => void;
    updateFloorPlanItemType: (item: FloorPlanItemType) => void;
    deleteFloorPlanItemType: (id: string) => void;

    addEquipmentType: (name: string) => void;
    deleteEquipmentType: (id: string) => void;
    addDeletionReason: (name: string) => void;
    deleteDeletionReason: (id: string) => void;

    addDatacenterStatus: (statusData: Omit<StatusOption, 'id'>) => void;
    updateDatacenterStatus: (status: StatusOption) => void;
    deleteDatacenterStatus: (id: string) => void;

    addEquipment: (equipmentData: Omit<Equipment, 'id'>) => void;
    updateEquipment: (updatedEquipment: Equipment) => void;
    deleteEquipment: (equipmentId: string) => void;
}

const InfraContext = React.createContext<InfraContextType | undefined>(undefined);

export function InfraProvider({ children }: { children: React.ReactNode }) {
    const [buildings, setBuildings] = React.useState<BuildingType[]>(initialBuildings);
    const [itemsByRoom, setItemsByRoom] = React.useState<Record<string, PlacedItem[]>>(initialItemsByRoom);
    const [equipment, setEquipment] = React.useState<Equipment[]>(initialEquipment);
    const [floorPlanItemTypes, setFloorPlanItemTypes] = React.useState<FloorPlanItemType[]>(initialFloorPlanItemTypes);
    const [selectedBuildingId, _setSelectedBuildingId] = React.useState<string | null>(initialBuildings[0]?.id || null);
    const [selectedRoomId, setSelectedRoomId] = React.useState<string | null>(initialBuildings[0]?.rooms[0]?.id || null);
    const [companyName, setCompanyName] = React.useState<string>("InfraCenter Manager");
    const [companyLogo, setCompanyLogo] = React.useState<string | null>(null);
    const { toast } = useToast();

    // Developer settings states
    const [equipmentTypes, setEquipmentTypes] = React.useState<SelectOption[]>(initialEquipmentTypes);
    const [deletionReasons, setDeletionReasons] = React.useState<SelectOption[]>(initialDeletionReasons);
    const [datacenterStatuses, setDatacenterStatuses] = React.useState<StatusOption[]>(initialDatacenterStatuses);
    const [deletionLog, setDeletionLog] = React.useState<DeletionLogEntry[]>(initialDeletionLog);

    const setSelectedBuildingId = (buildingId: string) => {
        _setSelectedBuildingId(buildingId);
        const building = buildings.find(b => b.id === buildingId);
        setSelectedRoomId(building?.rooms[0]?.id || null); 
    };

    const addBuilding = (buildingData: Omit<BuildingType, 'id' | 'rooms'>) => {
        const newBuilding: BuildingType = { 
            id: `b-${Date.now()}`, 
            ...buildingData, 
            rooms: [] 
        };
        setBuildings(prev => [...prev, newBuilding]);
        toast({ title: "Datacenter Criado", description: `O datacenter "${newBuilding.name}" foi criado com sucesso.` });
    };

    const updateBuilding = (updatedBuilding: BuildingType) => {
        setBuildings(prev => prev.map(b => b.id === updatedBuilding.id ? updatedBuilding : b));
        toast({ title: "Datacenter Atualizado", description: `O datacenter "${updatedBuilding.name}" foi salvo com sucesso.` });
    };

    const deleteBuilding = (buildingId: string) => {
        const buildingToDelete = buildings.find(b => b.id === buildingId);
        setBuildings(prev => prev.filter(b => b.id !== buildingId));
        if (selectedBuildingId === buildingId) {
            _setSelectedBuildingId(initialBuildings[0]?.id || null);
            setSelectedRoomId(initialBuildings[0]?.rooms[0]?.id || null);
        }
        toast({ variant: "destructive", title: "Datacenter Excluído", description: `O datacenter "${buildingToDelete?.name}" foi excluído.` });
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

    const deleteItem = (itemToDelete: PlacedItem, reason: string) => {
        setItemsByRoom(prev => {
            const newItemsByRoom = { ...prev };
            for (const roomId in newItemsByRoom) {
                newItemsByRoom[roomId] = newItemsByRoom[roomId].filter(item => item.id !== itemToDelete.id);
            }
            return newItemsByRoom;
        });

        const newLogEntry: DeletionLogEntry = {
            id: `del-${Date.now()}`,
            itemId: itemToDelete.id,
            itemName: itemToDelete.name,
            itemType: itemToDelete.type,
            deletedBy: 'Admin User',
            deletedAt: new Date().toLocaleDateString('pt-BR'),
            reason: reason,
        };
        setDeletionLog(prev => [newLogEntry, ...prev]);

        toast({
            variant: "destructive",
            title: "Item Excluído",
            description: `O item "${itemToDelete.name}" foi movido para o log de exclusões.`,
        });
    };

    const addRoom = (buildingId: string, roomData: Omit<Room, 'id'>) => {
        const newRoom: Room = { id: `r-${Date.now()}`, ...roomData };
        setBuildings(prev => prev.map(b => 
            b.id === buildingId ? { ...b, rooms: [...b.rooms, newRoom] } : b
        ));
        setItemsByRoom(prev => ({ ...prev, [newRoom.id]: [] }));
        toast({ title: "Sala Adicionada", description: `A sala "${newRoom.name}" foi criada.` });
    };
    
    const updateRoom = (buildingId: string, updatedRoom: Room) => {
        setBuildings(prev => prev.map(b => {
            if (b.id !== buildingId) return b;
            const newRooms = b.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
            return { ...b, rooms: newRooms };
        }));
        toast({
            title: "Sala atualizada",
            description: `A sala "${updatedRoom.name}" foi salva com sucesso.`,
        });
    };

    const deleteRoom = (buildingId: string, roomId: string) => {
        let roomName = '';
        setBuildings(prev => prev.map(b => {
            if (b.id !== buildingId) return b;
            const roomToDelete = b.rooms.find(r => r.id === roomId);
            if (roomToDelete) roomName = roomToDelete.name;

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
        toast({ variant: "destructive", title: "Sala Excluída", description: `A sala "${roomName}" foi excluída.` });
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
        
        toast({
            title: "Ordem das salas atualizada",
            description: "A nova ordem foi salva.",
        });
    };

    const addFloorPlanItemType = (itemData: Omit<FloorPlanItemType, 'id'>) => {
        const newItemType: FloorPlanItemType = { id: Date.now().toString(), ...itemData };
        setFloorPlanItemTypes(prev => [...prev, newItemType]);
        toast({ title: "Tipo de Item Adicionado", description: `"${newItemType.name}" foi adicionado à lista.`});
    };

    const updateFloorPlanItemType = (updatedItem: FloorPlanItemType) => {
        setFloorPlanItemTypes(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        toast({ title: "Tipo de Item Atualizado", description: `"${updatedItem.name}" foi salvo.`});
    };

    const deleteFloorPlanItemType = (id: string) => {
        setFloorPlanItemTypes(prev => prev.filter(item => item.id !== id));
        toast({ variant: "destructive", title: "Tipo de Item Removido" });
    };
    
    // Developer options handlers
    const addEquipmentType = (name: string) => {
        const newType: SelectOption = { id: Date.now().toString(), name };
        setEquipmentTypes(prev => [...prev, newType]);
    };
    const deleteEquipmentType = (id: string) => {
        setEquipmentTypes(prev => prev.filter(item => item.id !== id));
    };

    const addDeletionReason = (name: string) => {
        const newReason: SelectOption = { id: Date.now().toString(), name };
        setDeletionReasons(prev => [...prev, newReason]);
    };
    const deleteDeletionReason = (id: string) => {
        setDeletionReasons(prev => prev.filter(item => item.id !== id));
    };

    const addDatacenterStatus = (statusData: Omit<StatusOption, 'id'>) => {
        const newStatus: StatusOption = { id: Date.now().toString(), ...statusData };
        setDatacenterStatuses(prev => [...prev, newStatus]);
    };
    const updateDatacenterStatus = (updatedStatus: StatusOption) => {
        setDatacenterStatuses(prev => prev.map(s => s.id === updatedStatus.id ? updatedStatus : s));
        toast({ title: "Status Atualizado", description: `O status "${updatedStatus.name}" foi salvo.`});
    };
    const deleteDatacenterStatus = (id: string) => {
        setDatacenterStatuses(prev => prev.filter(item => item.id !== id));
    };

    // Equipment handlers
    const addEquipment = (equipmentData: Omit<Equipment, 'id'>) => {
        const newEquipment: Equipment = { id: `eq-${Date.now()}`, ...equipmentData };
        setEquipment(prev => [newEquipment, ...prev]);
        toast({ title: "Equipamento Adicionado", description: `O equipamento "${newEquipment.hostname}" foi adicionado com sucesso.` });
    };

    const updateEquipment = (updatedEquipment: Equipment) => {
        setEquipment(prev => prev.map(eq => eq.id === updatedEquipment.id ? updatedEquipment : eq));
        toast({ title: "Equipamento Atualizado", description: `O equipamento "${updatedEquipment.hostname}" foi salvo.` });
    };

    const deleteEquipment = (equipmentId: string) => {
        const eqToDelete = equipment.find(eq => eq.id === equipmentId);
        setEquipment(prev => prev.filter(eq => eq.id !== equipmentId));
        toast({ variant: "destructive", title: "Equipamento Excluído", description: `O equipamento "${eqToDelete?.hostname}" foi excluído.` });
    };


    return (
        <InfraContext.Provider value={{ 
            buildings, 
            itemsByRoom, 
            equipment,
            floorPlanItemTypes,
            selectedBuildingId, 
            selectedRoomId, 
            companyName,
            companyLogo,
            equipmentTypes,
            deletionReasons,
            datacenterStatuses,
            deletionLog,
            setSelectedBuildingId, 
            setSelectedRoomId,
            setCompanyName,
            setCompanyLogo,
            addBuilding,
            updateBuilding,
            deleteBuilding,
            updateItemsForRoom, 
            approveItem, 
            deleteItem,
            addRoom, 
            updateRoom, 
            deleteRoom, 
            reorderRooms,
            addFloorPlanItemType,
            updateFloorPlanItemType,
            deleteFloorPlanItemType,
            addEquipmentType,
            deleteEquipmentType,
            addDeletionReason,
            deleteDeletionReason,
            addDatacenterStatus,
            updateDatacenterStatus,
            deleteDatacenterStatus,
            addEquipment,
            updateEquipment,
            deleteEquipment
         }}>
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
