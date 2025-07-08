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
import type { PlacedItem, Building as BuildingType, Room, FloorPlanItemType, StatusOption, DeletionLogEntry, Equipment, Connection, User, SystemSettings } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./auth-provider";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, setDoc, writeBatch, getDocs, query, where } from "firebase/firestore";

const initialSystemSettings: SystemSettings = {
    companyName: "InfraCenter Manager",
    companyLogo: null,
    equipmentTypes: [
        { id: '1', name: 'Servidor' },
        { id: '2', name: 'Switch' },
        { id: '3', name: 'Patch Panel' },
        { id: '4', name: 'Storage' },
        { id: '5', name: 'Roteador' },
    ],
    deletionReasons: [
        { id: '1', name: 'Item criado por engano' },
        { id: '2', name: 'Item desativado (decommissioned)' },
        { id: '3', name: 'Substituído por novo item' },
        { id: '4', name: 'Erro de inventário' },
    ],
    datacenterStatuses: [
        { id: '1', name: 'Online', color: '#22c55e' },
        { id: '2', name: 'Offline', color: '#ef4444' },
        { id: '3', name: 'Maintenance', color: '#f59e0b' },
    ],
    equipmentStatuses: [
        { id: '1', name: 'Ativo' },
        { id: '2', name: 'Aposentado' },
        { id: '3', name: 'Em descomissionamento' },
        { id: '4', name: 'Descomissionado' },
        { id: '5', name: 'Desativado' },
    ],
    cableTypes: [
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
    ],
    floorPlanItemTypes: [
        { id: '1', name: 'Rack', icon: 'Server', defaultWidth: 0.6, defaultLength: 1.2, color: '#334155' },
        { id: '2', name: 'Ar Condicionado', icon: 'AirVent', defaultWidth: 0.8, defaultLength: 0.8, color: '#0369a1' },
        { id: '3', name: 'QDF', icon: 'Zap', defaultWidth: 0.6, defaultLength: 0.3, color: '#ca8a04' },
        { id: '4', name: 'Patch Panel', icon: 'Cable', defaultWidth: 0.6, defaultLength: 0.3, color: '#65a30d' },
    ],
};

// --- Context for sharing infrastructure state ---
interface InfraContextType {
    buildings: BuildingType[];
    itemsByRoom: Record<string, PlacedItem[]>;
    equipment: Equipment[];
    connections: Connection[];
    users: User[];
    deletionLog: DeletionLogEntry[];
    systemSettings: SystemSettings;
    
    selectedBuildingId: string | null;
    selectedRoomId: string | null;
    
    setSelectedBuildingId: (buildingId: string) => void;
    setSelectedRoomId: (roomId: string) => void;
    
    setSystemSettings: (settings: Partial<SystemSettings>) => Promise<void>;

    addBuilding: (buildingData: Omit<BuildingType, 'id' | 'rooms'>) => Promise<void>;
    updateBuilding: (updatedBuilding: BuildingType) => Promise<void>;
    deleteBuilding: (buildingId: string) => Promise<void>;
    
    updateItemsForRoom: (roomId: string, items: PlacedItem[]) => Promise<void>;
    approveItem: (itemId: string) => Promise<void>;
    deleteItem: (itemToDelete: PlacedItem, reason: string) => Promise<void>;
    restoreItem: (logId: string) => Promise<void>;
    
    addRoom: (buildingId: string, roomData: Omit<Room, 'id'>) => Promise<void>;
    updateRoom: (buildingId: string, updatedRoom: Room) => Promise<void>;
    deleteRoom: (buildingId: string, roomId: string) => Promise<void>;
    reorderRooms: (buildingId: string, roomId: string, direction: 'up' | 'down') => Promise<void>;

    addEquipment: (equipmentData: Omit<Equipment, 'id'>) => Promise<void>;
    updateEquipment: (updatedEquipment: Equipment) => Promise<void>;
    deleteEquipment: (equipmentId: string) => Promise<void>;

    addConnection: (connectionData: Omit<Connection, 'id'>) => Promise<void>;
    updateConnection: (updatedConnection: Connection) => Promise<void>;
    deleteConnection: (connectionId: string) => Promise<void>;
    
    addUser: (userData: Omit<User, 'id'>, userId?: string) => Promise<void>;
    updateUser: (updatedUser: User) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
}

const InfraContext = React.createContext<InfraContextType | undefined>(undefined);

export function InfraProvider({ children }: { children: React.ReactNode }) {
    const { user: authUser, userData } = useAuth();
    const { toast } = useToast();

    // Overall state
    const [buildings, setBuildings] = React.useState<BuildingType[]>([]);
    const [users, setUsers] = React.useState<User[]>([]);
    const [systemSettings, setSystemSettingsState] = React.useState<SystemSettings>(initialSystemSettings);
    
    // State dependent on selected building
    const [itemsByRoom, setItemsByRoom] = React.useState<Record<string, PlacedItem[]>>({});
    const [equipment, setEquipment] = React.useState<Equipment[]>([]);
    const [connections, setConnections] = React.useState<Connection[]>([]);
    const [deletionLog, setDeletionLog] = React.useState<DeletionLogEntry[]>([]);
    
    // Selection state
    const [selectedBuildingId, _setSelectedBuildingId] = React.useState<string | null>(null);
    const [selectedRoomId, setSelectedRoomId] = React.useState<string | null>(null);


    // --- Firebase Listeners ---
    
    // System-wide listeners (users, datacenters, settings)
    React.useEffect(() => {
        if (!userData || !isFirebaseConfigured || !db) return;

        // Listen to system settings
        const settingsDocRef = doc(db, 'system', 'settings');
        const unsubSettings = onSnapshot(settingsDocRef, (doc) => {
            if (doc.exists()) {
                setSystemSettingsState(doc.data() as SystemSettings);
            } else {
                setDoc(settingsDocRef, initialSystemSettings);
            }
        });

        // Listen to users collection
        const usersColRef = collection(db, 'users');
        const unsubUsers = onSnapshot(usersColRef, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(usersData);
        });

        const seedInitialData = async () => {
            if (!db) return;
            console.log("Database is empty. Seeding initial data...");
        
            const batch = writeBatch(db);
        
            // 1. Seed Datacenter
            const buildingData: Omit<BuildingType, 'id'> = { 
                name: 'Datacenter Principal', 
                location: 'Localização Principal', 
                status: 'Online',
                rooms: [{
                    id: `r-${Date.now()}`,
                    name: 'Sala Principal',
                    width: 20,
                    length: 20,
                    tileWidth: 60,
                    tileLength: 60,
                }]
            };
            const newBuildingRef = doc(collection(db, 'datacenters'));
            batch.set(newBuildingRef, buildingData);

            await batch.commit();

            toast({
              title: "Bem-vindo ao InfraCenter!",
              description: "Criamos um datacenter de exemplo para você começar.",
            });
        };

        // Listen to datacenters (buildings) collection
        const datacentersColRef = collection(db, 'datacenters');
        const unsubDatacenters = onSnapshot(datacentersColRef, (snapshot) => {
            if (snapshot.empty) {
                seedInitialData();
                return;
            }
            
            const buildingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuildingType));
            setBuildings(buildingsData);

            if (!selectedBuildingId && buildingsData.length > 0) {
              _setSelectedBuildingId(buildingsData[0].id);
            } else if (selectedBuildingId && !buildingsData.some(b => b.id === selectedBuildingId)) {
              _setSelectedBuildingId(buildingsData[0]?.id || null);
            }
        });

        return () => {
            unsubSettings();
            unsubUsers();
            unsubDatacenters();
        };
    }, [userData, selectedBuildingId]);
    
    // Listeners for data within the selected datacenter
    React.useEffect(() => {
        if (!selectedBuildingId || !isFirebaseConfigured || !db) {
            setItemsByRoom({});
            setEquipment([]);
            setConnections([]);
            setDeletionLog([]);
            return;
        };

        const buildingRef = doc(db, 'datacenters', selectedBuildingId);
        
        const unsubItems = onSnapshot(collection(buildingRef, 'items'), (snapshot) => {
            const itemsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PlacedItem));
            const newItemsByRoom = itemsData.reduce((acc, item) => {
                const roomId = item.roomId || 'unassigned';
                if (!acc[roomId]) {
                    acc[roomId] = [];
                }
                acc[roomId].push(item);
                return acc;
            }, {} as Record<string, PlacedItem[]>);
            setItemsByRoom(newItemsByRoom);
        });

        const unsubEquipment = onSnapshot(collection(buildingRef, 'equipment'), (snapshot) => {
            setEquipment(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Equipment)));
        });

        const unsubConnections = onSnapshot(collection(buildingRef, 'connections'), (snapshot) => {
            setConnections(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Connection)));
        });

        const unsubDeletionLog = onSnapshot(collection(buildingRef, 'deletion_log'), (snapshot) => {
            setDeletionLog(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DeletionLogEntry)));
        });

        return () => {
            unsubItems();
            unsubEquipment();
            unsubConnections();
            unsubDeletionLog();
        };

    }, [selectedBuildingId]);


    // --- Context Actions ---

    const setSelectedBuildingId = (buildingId: string) => {
        _setSelectedBuildingId(buildingId);
        const building = buildings.find(b => b.id === buildingId);
        setSelectedRoomId(building?.rooms?.[0]?.id || null); 
    };
    
    const setSystemSettings = async (settings: Partial<SystemSettings>) => {
        if (!db) return;
        try {
            await updateDoc(doc(db, 'system', 'settings'), settings);
            toast({ title: 'Configurações Salvas!' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erro ao salvar configurações.' });
        }
    };

    const addBuilding = async (buildingData: Omit<BuildingType, 'id' | 'rooms'>) => {
        if (!db) return;
        try {
            const newBuilding = { ...buildingData, rooms: [] };
            await addDoc(collection(db, 'datacenters'), newBuilding);
            toast({ title: "Datacenter Criado", description: `O datacenter "${newBuilding.name}" foi criado com sucesso.` });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erro ao criar datacenter.' });
        }
    };
    
    const updateBuilding = async (updatedBuilding: BuildingType) => {
        if (!db) return;
        try {
            const { id, ...data } = updatedBuilding;
            await updateDoc(doc(db, 'datacenters', id), data);
            toast({ title: "Datacenter Atualizado", description: `O datacenter "${updatedBuilding.name}" foi salvo com sucesso.` });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erro ao atualizar datacenter.' });
        }
    };
    
    const deleteBuilding = async (buildingId: string) => {
        if (!db) return;
        const buildingToDelete = buildings.find(b => b.id === buildingId);
        try {
            // This is a simple delete. A real app might want to delete all subcollections too.
            await deleteDoc(doc(db, 'datacenters', buildingId));
            toast({ variant: "destructive", title: "Datacenter Excluído", description: `O datacenter "${buildingToDelete?.name}" foi excluído.` });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erro ao excluir datacenter.' });
        }
    };
    
    const updateItemsForRoom = async (roomId: string, items: PlacedItem[]) => {
        if (!selectedBuildingId || !db) return;

        const updatedItem = items.find(i => {
            const originalRoomItems = itemsByRoom[roomId] || [];
            const originalItem = originalRoomItems.find(oi => oi.id === i.id);
            return JSON.stringify(i) !== JSON.stringify(originalItem);
        });

        if (updatedItem) {
            try {
                const { id, ...data } = updatedItem;
                await setDoc(doc(db, 'datacenters', selectedBuildingId, 'items', id), data);
            } catch(error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'Erro ao mover item.' });
            }
        }
    };
    
    // --- More Complex Actions ---
    const approveItem = async (itemId: string) => {
      if (!selectedBuildingId || !db) return;
      try {
        await updateDoc(doc(db, 'datacenters', selectedBuildingId, 'items', itemId), { awaitingApproval: false });
        toast({ title: "Item Aprovado!" });
      } catch (error) {
        toast({ variant: "destructive", title: "Erro ao aprovar item." });
      }
    };
    
    const deleteItem = async (itemToDelete: PlacedItem, reason: string) => {
      if (!selectedBuildingId || !db) return;
      
      const newLogEntry: Omit<DeletionLogEntry, 'id'> = {
          itemId: itemToDelete.id,
          itemName: itemToDelete.name,
          itemType: itemToDelete.type,
          deletedBy: userData?.name || 'unknown',
          deletedAt: new Date().toISOString(),
          reason: reason,
          roomId: itemToDelete.roomId,
          itemData: { ...itemToDelete, icon: '' }, // Can't store function in Firestore
      };

      try {
          const batch = writeBatch(db);
          batch.set(doc(collection(db, 'datacenters', selectedBuildingId, 'deletion_log')), newLogEntry);
          batch.delete(doc(db, 'datacenters', selectedBuildingId, 'items', itemToDelete.id));
          await batch.commit();
          toast({ variant: 'destructive', title: 'Item Excluído', description: `O item "${itemToDelete.name}" foi movido para o log.` });
      } catch (error) {
          console.error(error);
          toast({ variant: 'destructive', title: 'Erro ao excluir item.' });
      }
    };
    
    const restoreItem = async (logId: string) => {
      if (!selectedBuildingId || !db) return;
      const logEntry = deletionLog.find(entry => entry.id === logId);
      if (!logEntry) return;
      
      try {
        const { itemData } = logEntry;
        await setDoc(doc(db, 'datacenters', selectedBuildingId, 'items', itemData.id), itemData);
        await deleteDoc(doc(db, 'datacenters', selectedBuildingId, 'deletion_log', logId));
        toast({ title: 'Item Restaurado!' });
      } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Erro ao restaurar item.' });
      }
    };

    const addRoom = async (buildingId: string, roomData: Omit<Room, 'id'>) => {
        if (!db) return;
        const building = buildings.find(b => b.id === buildingId);
        if (!building) return;
        const newRoom = { ...roomData, id: `r-${Date.now()}` };
        const updatedRooms = [...(building.rooms || []), newRoom];
        await updateBuilding({ ...building, rooms: updatedRooms });
        toast({ title: "Sala Adicionada" });
    };

    const updateRoom = async (buildingId: string, updatedRoom: Room) => {
        if (!db) return;
        const building = buildings.find(b => b.id === buildingId);
        if (!building) return;
        const updatedRooms = (building.rooms || []).map(r => r.id === updatedRoom.id ? updatedRoom : r);
        await updateBuilding({ ...building, rooms: updatedRooms });
        toast({ title: "Sala Atualizada" });
    };

    const deleteRoom = async (buildingId: string, roomId: string) => {
        if (!db) return;
        const building = buildings.find(b => b.id === buildingId);
        if (!building) return;
        const updatedRooms = (building.rooms || []).filter(r => r.id !== roomId);
        const itemsToDelete = await getDocs(query(collection(db, 'datacenters', buildingId, 'items'), where('roomId', '==', roomId)));
        const batch = writeBatch(db);
        itemsToDelete.forEach(doc => batch.delete(doc.ref));
        batch.update(doc(db, 'datacenters', buildingId), { rooms: updatedRooms });
        await batch.commit();
        toast({ variant: 'destructive', title: "Sala Excluída" });
    };

    const reorderRooms = async (buildingId: string, roomId: string, direction: 'up' | 'down') => {
        if (!db) return;
        const building = buildings.find(b => b.id === buildingId);
        if (!building || !building.rooms) return;
        const index = building.rooms.findIndex(r => r.id === roomId);
        if (index === -1) return;
        
        const newRooms = [...building.rooms];
        if (direction === 'up' && index > 0) {
            [newRooms[index - 1], newRooms[index]] = [newRooms[index], newRooms[index - 1]];
        }
        if (direction === 'down' && index < newRooms.length - 1) {
            [newRooms[index], newRooms[index + 1]] = [newRooms[index + 1], newRooms[index]];
        }
        await updateBuilding({ ...building, rooms: newRooms });
    };

    const addEquipment = async (equipmentData: Omit<Equipment, 'id'>) => {
      if(!selectedBuildingId || !db) return;
      await addDoc(collection(db, 'datacenters', selectedBuildingId, 'equipment'), equipmentData);
      toast({ title: 'Equipamento Adicionado!' });
    };
    const updateEquipment = async (updatedEquipment: Equipment) => {
        if(!selectedBuildingId || !db) return;
        const { id, ...data } = updatedEquipment;
        await setDoc(doc(db, 'datacenters', selectedBuildingId, 'equipment', id), data);
        toast({ title: 'Equipamento Atualizado!' });
    };
    const deleteEquipment = async (equipmentId: string) => {
        if(!selectedBuildingId || !db) return;
        await deleteDoc(doc(db, 'datacenters', selectedBuildingId, 'equipment', equipmentId));
        toast({ variant: 'destructive', title: 'Equipamento Excluído!' });
    };
    
    const addConnection = async (connectionData: Omit<Connection, 'id'>) => {
        if(!selectedBuildingId || !db) return;
        await addDoc(collection(db, 'datacenters', selectedBuildingId, 'connections'), connectionData);
        toast({ title: 'Conexão Adicionada!' });
    };
    const updateConnection = async (updatedConnection: Connection) => {
        if(!selectedBuildingId || !db) return;
        const { id, ...data } = updatedConnection;
        await setDoc(doc(db, 'datacenters', selectedBuildingId, 'connections', id), data);
        toast({ title: 'Conexão Atualizada!' });
    };
    const deleteConnection = async (connectionId: string) => {
        if(!selectedBuildingId || !db) return;
        await deleteDoc(doc(db, 'datacenters', selectedBuildingId, 'connections', connectionId));
        toast({ variant: 'destructive', title: 'Conexão Excluída!' });
    };

    const addUser = async (userData: Omit<User, 'id'>, userId?: string) => {
        if (!db) return;
        try {
            if (userId) {
                await setDoc(doc(db, 'users', userId), userData);
            } else {
                await addDoc(collection(db, 'users'), userData);
            }
            toast({ title: 'Usuário Salvo!' });
        } catch(error) {
            console.error("Error adding/updating user:", error);
            toast({ variant: 'destructive', title: 'Erro ao salvar usuário.'});
        }
    };
    const updateUser = async (updatedUser: User) => {
        if (!db) return;
        const { id, ...data } = updatedUser;
        await setDoc(doc(db, 'users', id), data);
        toast({ title: 'Usuário Atualizado!' });
    };
    const deleteUser = async (userId: string) => {
        if (!db) return;
        await deleteDoc(doc(db, 'users', userId));
        toast({ variant: 'destructive', title: 'Usuário Excluído!' });
    };


    return (
        <InfraContext.Provider value={{
            buildings, itemsByRoom, equipment, connections, users, deletionLog, systemSettings,
            selectedBuildingId, selectedRoomId,
            setSelectedBuildingId, setSelectedRoomId,
            setSystemSettings, addBuilding, updateBuilding, deleteBuilding,
            updateItemsForRoom, approveItem, deleteItem, restoreItem,
            addRoom, updateRoom, deleteRoom, reorderRooms,
            addEquipment, updateEquipment, deleteEquipment,
            addConnection, updateConnection, deleteConnection,
            addUser, updateUser, deleteUser
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
          disabled={!isFirebaseConfigured || buildings.length === 0}
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
