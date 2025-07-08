
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
import type { PlacedItem, Building as BuildingType, Room, FloorPlanItemType, StatusOption, DeletionLogEntry, Equipment, Connection, User } from "@/lib/types";
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
    { id: 'eq-1', hostname: 'SWPSBLM01', type: 'Switch', parentItemId: 'rack-2', positionU: '39', imageUrl: 'https://placehold.co/128x64.png', brand: 'Cisco', model: 'Catalyst 9300', price: 5000, serialNumber: 'SN12345', entryDate: '2023-01-15', tag: 'TAG001', description: 'Switch de acesso', sizeU: '1', trellisId: 'TID1', ownerEmail: 'owner@example.com', isTagEligible: true, isFrontFacing: true, status: 'Ativo', dataSheetUrl: '#' },
    { id: 'eq-2', hostname: 'Swblmsac0101', type: 'Switch', parentItemId: 'rack-2', positionU: '1', imageUrl: 'https://placehold.co/128x64.png', brand: 'Juniper', model: 'EX4300', status: 'Ativo' },
    { id: 'eq-3', hostname: 'Roteador-Central', type: 'Roteador', parentItemId: 'rack-0', positionU: '20-29', imageUrl: 'https://placehold.co/128x64.png', brand: 'HPE', model: 'Aruba 8325', status: 'Aposentado' },
    { id: 'eq-4', hostname: 'Swblmsac0102', type: 'Switch', parentItemId: 'rack-0', positionU: '1', imageUrl: 'https://placehold.co/128x64.png', brand: 'Dell', model: 'PowerSwitch S4148F-ON', status: 'Desativado' },
];

const initialConnections: Connection[] = [
    { id: 'conn-1', sourceEquipmentId: 'eq-1', sourcePort: 'Gi1/0/1', destinationEquipmentId: 'eq-2', destinationPort: 'Gi1/0/24', cableType: 'CAT6 UTP', status: 'Conectado', isActive: true, notes: 'Link de uplink principal.' },
    { id: 'conn-2', sourceEquipmentId: 'eq-3', sourcePort: 'Eth1', destinationEquipmentId: 'eq-4', destinationPort: 'Eth2', cableType: 'Fibra Óptica OM4', status: 'Planejado', isActive: false },
];

const initialUsers: User[] = [
    { id: 'u1', name: 'Admin User', email: 'admin@example.com', role: 'Admin', avatarUrl: 'https://placehold.co/40x40.png' },
    { id: 'u2', name: 'Davidson Conceição', email: 'davidson.conceicao@example.com', role: 'Editor', avatarUrl: 'https://placehold.co/40x40.png' },
    { id: 'u3', name: 'Regular Viewer', email: 'viewer@example.com', role: 'Viewer', avatarUrl: 'https://placehold.co/40x40.png' },
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
const initialEquipmentStatuses: SelectOption[] = [
    { id: '1', name: 'Ativo' },
    { id: '2', name: 'Aposentado' },
    { id: '3', name: 'Em descomissionamento' },
    { id: '4', name: 'Descomissionado' },
    { id: '5', name: 'Desativado' },
];

const initialCableTypes: SelectOption[] = [
    { id: '1', name: 'CAT6 UTP' },
    { id: '2', name: 'CAT6a UTP' },
    { id: '3', name: 'CAT7 STP' },
    { id: '4', name: 'Fibra Óptica OM3' },
    { id: '5', name: 'Fibra Óptica OM4' },
    { id: '6', name: 'Fibra Óptica OS2' },
    { id: '7', name: 'DAC (Direct Attach Copper)' },
    { id: '8', name: 'Fibra Óptica LC/UPC' },
    { id: '9', name: 'Fibra Óptica LC/APC' },
    { id: '10', name: 'Fibra Óptica SC/UPC' },
    { id: '11', name: 'Fibra Óptica SC/APC' },
];

const initialDeletionLog: DeletionLogEntry[] = [
    { 
        id: 'del-1', 
        itemId: 'deleted-item-1', 
        itemName: 'Old Server 01', 
        itemType: 'Server Rack', 
        deletedBy: 'Admin User', 
        deletedAt: '01/07/2025', 
        reason: 'Item desativado (decommissioned)',
        roomId: 'r1',
        itemData: {
            id: 'deleted-item-1',
            name: 'Old Server 01',
            type: 'Server Rack',
            icon: Server,
            x: 10, y: 10,
            status: 'Inativo',
            width: 0.6,
            length: 1.2,
            color: '#ef4444',
            awaitingApproval: false,
        }
    }
];


// --- Context for sharing infrastructure state ---
interface InfraContextType {
    buildings: BuildingType[];
    itemsByRoom: Record<string, PlacedItem[]>;
    equipment: Equipment[];
    connections: Connection[];
    floorPlanItemTypes: FloorPlanItemType[];
    selectedBuildingId: string | null;
    selectedRoomId: string | null;
    companyName: string;
    companyLogo: string | null;
    equipmentTypes: SelectOption[];
    deletionReasons: SelectOption[];
    datacenterStatuses: StatusOption[];
    equipmentStatuses: SelectOption[];
    cableTypes: SelectOption[];
    deletionLog: DeletionLogEntry[];
    users: User[];
    
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
    restoreItem: (logId: string) => void;
    
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

    addEquipmentStatus: (name: string) => void;
    deleteEquipmentStatus: (id: string) => void;
    
    addCableType: (name: string) => void;
    deleteCableType: (id: string) => void;

    addEquipment: (equipmentData: Omit<Equipment, 'id'>) => void;
    updateEquipment: (updatedEquipment: Equipment) => void;
    deleteEquipment: (equipmentId: string) => void;

    addConnection: (connectionData: Omit<Connection, 'id'>) => void;
    updateConnection: (updatedConnection: Connection) => void;
    deleteConnection: (connectionId: string) => void;
    
    addUser: (userData: Omit<User, 'id'>) => void;
    updateUser: (updatedUser: User) => void;
    deleteUser: (userId: string) => void;
}

const InfraContext = React.createContext<InfraContextType | undefined>(undefined);

export function InfraProvider({ children }: { children: React.ReactNode }) {
    const [buildings, setBuildings] = React.useState<BuildingType[]>(initialBuildings);
    const [itemsByRoom, setItemsByRoom] = React.useState<Record<string, PlacedItem[]>>(initialItemsByRoom);
    const [equipment, setEquipment] = React.useState<Equipment[]>(initialEquipment);
    const [connections, setConnections] = React.useState<Connection[]>(initialConnections);
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
    const [equipmentStatuses, setEquipmentStatuses] = React.useState<SelectOption[]>(initialEquipmentStatuses);
    const [cableTypes, setCableTypes] = React.useState<SelectOption[]>(initialCableTypes);
    const [deletionLog, setDeletionLog] = React.useState<DeletionLogEntry[]>(initialDeletionLog);
    const [users, setUsers] = React.useState<User[]>(initialUsers);

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
        const findRoomIdForItem = (itemId: string): string | null => {
            for (const roomId in itemsByRoom) {
                if (itemsByRoom[roomId].some(item => item.id === itemId)) {
                    return roomId;
                }
            }
            return null;
        };
        const roomId = findRoomIdForItem(itemToDelete.id);

        if (!roomId) {
            toast({
                variant: "destructive",
                title: "Erro ao Excluir",
                description: "Não foi possível encontrar a sala do item.",
            });
            return;
        }

        setItemsByRoom(prev => {
            const newItemsByRoom = { ...prev };
            if (newItemsByRoom[roomId]) {
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
            roomId: roomId,
            itemData: itemToDelete,
        };
        setDeletionLog(prev => [newLogEntry, ...prev]);

        toast({
            variant: "destructive",
            title: "Item Excluído",
            description: `O item "${itemToDelete.name}" foi movido para o log de exclusões.`,
        });
    };

    const restoreItem = (logId: string) => {
        const logEntry = deletionLog.find(entry => entry.id === logId);
        if (!logEntry) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Entrada de log não encontrada.' });
            return;
        }

        const { itemData, roomId } = logEntry;
        const room = buildings.flatMap(b => b.rooms).find(r => r.id === roomId);

        if (!room) {
            toast({ variant: 'destructive', title: 'Erro', description: `Sala com ID ${roomId} não encontrada.` });
            return;
        }
        
        const itemsInRoom = itemsByRoom[roomId] || [];
        const tileWidthM = (room.tileWidth || 60) / 100;
        const tileLengthM = (room.tileLength || 60) / 100;
        const GRID_COLS = Math.floor(room.width / tileWidthM);
        const GRID_ROWS = Math.floor(room.length / tileLengthM);

        const checkCollision = (testItem: PlacedItem, allItems: PlacedItem[]) => {
            const testItemWidthInCells = testItem.width / tileWidthM;
            const testItemLengthInCells = testItem.length / tileLengthM;

            if (testItem.x < 0 || testItem.y < 0 || testItem.x + testItemWidthInCells > GRID_COLS || testItem.y + testItemLengthInCells > GRID_ROWS) {
                return true;
            }

            for (const existingItem of allItems) {
                if (existingItem.id === testItem.id) continue;
                
                const existingItemWidthInCells = existingItem.width / tileWidthM;
                const existingItemLengthInCells = existingItem.length / tileLengthM;
                
                if (
                    testItem.x < existingItem.x + existingItemWidthInCells &&
                    testItem.x + testItemWidthInCells > existingItem.x &&
                    testItem.y < existingItem.y + existingItemLengthInCells &&
                    testItem.y + testItemLengthInCells > existingItem.y
                ) {
                    return true;
                }
            }
            return false;
        };

        let restoredItem = { ...itemData };
        let wasMoved = false;

        if (checkCollision(restoredItem, itemsInRoom)) {
            wasMoved = true;
            const itemWidthInCells = restoredItem.width / tileWidthM;
            const itemLengthInCells = restoredItem.length / tileLengthM;
            let foundSpot = false;

            for (let y = 0; y <= GRID_ROWS - itemLengthInCells; y++) {
                for (let x = 0; x <= GRID_COLS - itemWidthInCells; x++) {
                    const newPositionItem = { ...restoredItem, x, y };
                    if (!checkCollision(newPositionItem, itemsInRoom)) {
                        restoredItem.x = x;
                        restoredItem.y = y;
                        foundSpot = true;
                        break;
                    }
                }
                if (foundSpot) break;
            }

            if (!foundSpot) {
                toast({ variant: 'destructive', title: 'Restauração Falhou', description: 'Não há espaço livre na sala para restaurar o item.' });
                return;
            }
        }

        setItemsByRoom(prev => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), restoredItem],
        }));

        setDeletionLog(prev => prev.filter(entry => entry.id !== logId));

        toast({
            title: 'Item Restaurado',
            description: `O item "${restoredItem.name}" foi restaurado com sucesso. ${wasMoved ? 'Ele foi movido para o primeiro espaço vago.' : ''}`,
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

    const addEquipmentStatus = (name: string) => {
        const newStatus: SelectOption = { id: Date.now().toString(), name };
        setEquipmentStatuses(prev => [...prev, newStatus]);
    };
    const deleteEquipmentStatus = (id: string) => {
        setEquipmentStatuses(prev => prev.filter(item => item.id !== id));
    };

    const addCableType = (name: string) => {
        const newType: SelectOption = { id: Date.now().toString(), name };
        setCableTypes(prev => [...prev, newType]);
    };
    const deleteCableType = (id: string) => {
        setCableTypes(prev => prev.filter(item => item.id !== id));
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

    // Connection handlers
    const addConnection = (connectionData: Omit<Connection, 'id'>) => {
        const newConnection: Connection = { id: `conn-${Date.now()}`, ...connectionData };
        setConnections(prev => [newConnection, ...prev]);
        toast({ title: "Conexão Adicionada", description: `A conexão foi criada com sucesso.` });
    };

    const updateConnection = (updatedConnection: Connection) => {
        setConnections(prev => prev.map(c => c.id === updatedConnection.id ? updatedConnection : c));
        toast({ title: "Conexão Atualizada", description: `A conexão foi salva.` });
    };

    const deleteConnection = (connectionId: string) => {
        setConnections(prev => prev.filter(c => c.id !== connectionId));
        toast({ variant: "destructive", title: "Conexão Excluída" });
    };

    // User handlers
    const addUser = (userData: Omit<User, 'id'>) => {
        const newUser: User = { id: `u-${Date.now()}`, ...userData };
        setUsers(prev => [newUser, ...prev]);
        toast({ title: "Usuário Adicionado", description: `O usuário "${newUser.name}" foi criado.` });
    };

    const updateUser = (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        toast({ title: "Usuário Atualizado", description: `O usuário "${updatedUser.name}" foi salvo.` });
    };

    const deleteUser = (userId: string) => {
        const userToDelete = users.find(u => u.id === userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast({ variant: "destructive", title: "Usuário Excluído", description: `O usuário "${userToDelete?.name}" foi removido.` });
    };


    return (
        <InfraContext.Provider value={{ 
            buildings, 
            itemsByRoom, 
            equipment,
            connections,
            floorPlanItemTypes,
            selectedBuildingId, 
            selectedRoomId, 
            companyName,
            companyLogo,
            equipmentTypes,
            deletionReasons,
            datacenterStatuses,
            equipmentStatuses,
            cableTypes,
            deletionLog,
            users,
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
            restoreItem,
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
            addEquipmentStatus,
            deleteEquipmentStatus,
            addCableType,
            deleteCableType,
            addEquipment,
            updateEquipment,
            deleteEquipment,
            addConnection,
            updateConnection,
            deleteConnection,
            addUser,
            updateUser,
            deleteUser
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
