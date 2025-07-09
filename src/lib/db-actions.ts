
'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc, setDoc } from 'firebase/firestore';
import type { Building, Room, PlacedItem, Equipment, Connection, SystemSettings, UserRole, RolePermissions } from '@/lib/types';

const initialRolePermissions: Record<UserRole, RolePermissions> = {
  tecnico: {
    canSwitchDatacenter: false,
    canSeeManagementMenu: false,
    canAccessApprovalCenter: false,
    canAccessActivityLog: false,
    canAccessDeletionLog: false,
    canManageUsers: false,
    canManageDatacenters: false,
    canCreateDatacenters: false,
    canAccessSystemSettings: false,
    canManagePermissions: false,
    canRequestDeletion: false,
    canApproveDeletion: false,
    canAccessDeveloperPage: false,
  },
  supervisor: {
    canSwitchDatacenter: true,
    canSeeManagementMenu: true,
    canAccessApprovalCenter: true,
    canAccessActivityLog: true,
    canAccessDeletionLog: true,
    canManageUsers: false,
    canManageDatacenters: false,
    canCreateDatacenters: false,
    canAccessSystemSettings: false,
    canManagePermissions: false,
    canRequestDeletion: true,
    canApproveDeletion: false,
    canAccessDeveloperPage: false,
  },
  gerente: {
    canSwitchDatacenter: true,
    canSeeManagementMenu: true,
    canAccessApprovalCenter: true,
    canAccessActivityLog: true,
    canAccessDeletionLog: true,
    canManageUsers: true,
    canManageDatacenters: true,
    canCreateDatacenters: true,
    canAccessSystemSettings: true,
    canManagePermissions: true,
    canRequestDeletion: false,
    canApproveDeletion: true,
    canAccessDeveloperPage: false,
  },
  developer: {
    canSwitchDatacenter: true,
    canSeeManagementMenu: true,
    canAccessApprovalCenter: true,
    canAccessActivityLog: true,
    canAccessDeletionLog: true,
    canManageUsers: true,
    canManageDatacenters: true,
    canCreateDatacenters: true,
    canAccessSystemSettings: true,
    canManagePermissions: true,
    canRequestDeletion: true,
    canApproveDeletion: true,
    canAccessDeveloperPage: true,
  },
};

// This is the structure from datacenter-switcher.
const initialSystemSettings: SystemSettings = {
    companyName: "InfraCenter Manager",
    companyLogo: null,
    userRoles: [
        { id: 'tecnico', name: 'tecnico' },
        { id: 'supervisor', name: 'supervisor' },
        { id: 'gerente', name: 'gerente' },
        { id: 'developer', name: 'developer' },
    ],
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
    rolePermissions: initialRolePermissions,
    prompts: {
        extractEquipmentDetails: `You are an expert IT asset management assistant. Your task is to analyze the provided image of a piece of network or server hardware.

Carefully examine the image for any text, labels, or logos. Identify the equipment type, manufacturer (brand), model name/number, serial number, hostname, and any asset tags.

Extract this information accurately. If a specific piece of information is not visible or cannot be identified, omit that field from the output.

Photo: {{media url=photoDataUri}}`,
        extractConnectionDetails: `You are an expert IT infrastructure assistant specializing in reading cable labels. Your task is to analyze the provided image of a cable label.

The label typically follows a DE/PARA (FROM/TO) format.
- "DE" refers to the source device and port.
- "PARA" refers to the destination device and port.

Carefully examine the image for any text. Identify the main label identifier (the most prominent text, often a patch panel ID), the source device hostname and port, and the destination device hostname and port.

Example label text:
"P-01-A-01
DE: SW-CORE-01 | Gi1/0/1
PARA: FW-EDGE-02 | PortA"

For the example above, you would extract:
- cableLabel: "P-01-A-01"
- sourceHostname: "SW-CORE-01"
- sourcePort: "Gi1/0/1"
- destinationHostname: "FW-EDGE-02"
- destinationPort: "PortA"

Extract this information accurately. If a specific piece of information is not visible or cannot be identified, omit that field from the output.

Photo: {{media url=photoDataUri}}`,
        importFromSpreadsheet: `You are an expert data migration assistant for an IT infrastructure management system.
You will be provided with a JSON representation of a spreadsheet containing inventory data.
Your task is to analyze this JSON data, intelligently map the columns to the equipment schema, and return a clean list of equipment objects.

Spreadsheet JSON data:
\`\`\`json
{{{jsonData}}}
\`\`\`

Mapping Heuristics:
- 'hostname': Look for columns named 'Hostname', 'Device Name', 'Asset', 'Name', or similar. This is the primary identifier.
- 'brand': Look for 'Manufacturer', 'Brand', 'Make', 'Fabricante'.
- 'model': Look for 'Model', 'Product Name', 'Modelo'.
- 'serialNumber': Look for 'Serial Number', 'S/N', 'Serial', 'Número de Série'.
- 'type': Look for 'Type', 'Category', 'Tipo', 'Categoria' (e.g., Switch, Server, Router).
- 'status': Look for 'Status', 'Condition'.
- 'positionU': Look for 'U Position', 'Position', 'Posição'.
- 'sizeU': Look for 'Size (U)', 'Height', 'Tamanho (U)'.
- 'tag': Look for 'Asset Tag', 'TAG'.
- 'description': Look for 'Description', 'Notes', 'Descrição'.

For each row in the input JSON, create a corresponding equipment object in the output. If you cannot find a clear mapping for a field, omit it from the object. Do not invent data.
Focus only on extracting the equipment list.
`,
    },
};


async function deleteCollection(collectionPath: string, batch: ReturnType<typeof writeBatch>) {
    if (!db) return;
    const collectionRef = collection(db, collectionPath);
    const querySnapshot = await getDocs(collectionRef);
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
}

export async function clearDatabase() {
    if (!isFirebaseConfigured || !db) return { success: false, error: "Firebase não configurado." };
    
    try {
        const batch = writeBatch(db);
        const datacentersSnapshot = await getDocs(collection(db, 'datacenters'));

        for (const dcDoc of datacentersSnapshot.docs) {
            const dcId = dcDoc.id;
            // Recursively delete subcollections
            await deleteCollection(`datacenters/${dcId}/items`, batch);
            await deleteCollection(`datacenters/${dcId}/equipment`, batch);
            await deleteCollection(`datacenters/${dcId}/connections`, batch);
            await deleteCollection(`datacenters/${dcId}/deletion_log`, batch);
            await deleteCollection(`datacenters/${dcId}/activity_log`, batch);
            
            // Delete the datacenter doc itself
            batch.delete(dcDoc.ref);
        }

        // To be safe, also delete the system settings so seed can recreate it.
        batch.delete(doc(db, 'system', 'settings'));
        
        // NOTE: This function intentionally DOES NOT clear the 'users' collection
        // to prevent accidental deletion of user accounts.

        await batch.commit();
        return { success: true, message: "Infraestrutura do banco de dados (exceto usuários) limpa com sucesso." };
    } catch (error) {
        console.error("Erro ao limpar o banco de dados:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function seedDatabase() {
    if (!isFirebaseConfigured || !db) return { success: false, error: "Firebase não configurado." };

    try {
        // First, clear existing infra data to prevent duplicates
        await clearDatabase();
        
        const batch = writeBatch(db);

        // 1. Seed System Settings
        const settingsRef = doc(db, 'system', 'settings');
        batch.set(settingsRef, initialSystemSettings);

        // 2. Seed Datacenter and Rooms
        const buildingRef = doc(collection(db, 'datacenters'));
        const buildingId = buildingRef.id;
        const roomA: Room = { id: 'room-a-1', name: 'Sala de Servidores A', width: 20, length: 15, tileWidth: 60, tileLength: 60 };
        const roomB: Room = { id: 'room-b-1', name: 'Sala de Redes B', width: 10, length: 10, tileWidth: 60, tileLength: 60 };
        const buildingData: Omit<Building, 'id'> = { name: 'Datacenter Principal (Teste)', location: 'Ambiente de Teste', status: 'Online', rooms: [roomA, roomB] };
        batch.set(buildingRef, buildingData);

        // 3. Seed Racks (PlacedItems)
        const rackType = initialSystemSettings.floorPlanItemTypes.find(t => t.name === 'Rack')!;
        const itemsCollectionRef = collection(db, `datacenters/${buildingId}/items`);

        const rackA1: Omit<PlacedItem, 'id' | 'icon'> = { roomId: roomA.id, name: 'Rack-A1', type: 'Rack', x: 2, y: 2, status: 'Ativo', width: rackType.defaultWidth, length: rackType.defaultLength, color: rackType.color };
        const rackA2: Omit<PlacedItem, 'id' | 'icon'> = { roomId: roomA.id, name: 'Rack-A2', type: 'Rack', x: 2, y: 5, status: 'Ativo', width: rackType.defaultWidth, length: rackType.defaultLength, color: rackType.color };
        const rackB1: Omit<PlacedItem, 'id' | 'icon'> = { roomId: roomB.id, name: 'Rack-B1', type: 'Rack', x: 1, y: 1, status: 'Ativo', width: rackType.defaultWidth, length: rackType.defaultLength, color: rackType.color };
        
        const rackA1Ref = doc(itemsCollectionRef); const rackA1Id = rackA1Ref.id;
        const rackA2Ref = doc(itemsCollectionRef); const rackA2Id = rackA2Ref.id;
        const rackB1Ref = doc(itemsCollectionRef); const rackB1Id = rackB1Ref.id;
        
        batch.set(rackA1Ref, { ...rackA1, id: rackA1Id, icon: "Server" });
        batch.set(rackA2Ref, { ...rackA2, id: rackA2Id, icon: "Server" });
        batch.set(rackB1Ref, { ...rackB1, id: rackB1Id, icon: "Server" });

        // 4. Seed Equipment
        const equipmentCollectionRef = collection(db, `datacenters/${buildingId}/equipment`);
        
        const eq1: Omit<Equipment, 'id'> = { hostname: 'SRV-WEB-01', type: 'Servidor', parentItemId: rackA1Id, positionU: '10-11', brand: 'Dell', model: 'PowerEdge R740', status: 'Ativo' };
        const eq2: Omit<Equipment, 'id'> = { hostname: 'SW-CORE-01', type: 'Switch', parentItemId: rackB1Id, positionU: '40', brand: 'Cisco', model: 'Catalyst 9300', status: 'Ativo' };
        const eq3: Omit<Equipment, 'id'> = { hostname: 'SW-CORE-02', type: 'Switch', parentItemId: rackB1Id, positionU: '38', brand: 'Cisco', model: 'Catalyst 9300', status: 'Ativo' };
        const eq4: Omit<Equipment, 'id'> = { hostname: 'SRV-DB-01', type: 'Servidor', parentItemId: rackA2Id, positionU: '20-21', brand: 'HPE', model: 'ProLiant DL380', status: 'Ativo' };

        const eq1Ref = doc(equipmentCollectionRef); const eq1Id = eq1Ref.id;
        const eq2Ref = doc(equipmentCollectionRef); const eq2Id = eq2Ref.id;
        const eq3Ref = doc(equipmentCollectionRef); const eq3Id = eq3Ref.id;
        const eq4Ref = doc(equipmentCollectionRef); const eq4Id = eq4Ref.id;
        
        batch.set(eq1Ref, eq1);
        batch.set(eq2Ref, eq2);
        batch.set(eq3Ref, eq3);
        batch.set(eq4Ref, eq4);

        // 5. Seed Connections
        const connectionsCollectionRef = collection(db, `datacenters/${buildingId}/connections`);
        
        const conn1: Omit<Connection, 'id'> = { sourceEquipmentId: eq2Id, sourcePort: 'Gi1/0/1', destinationEquipmentId: eq1Id, destinationPort: 'eth0', cableType: 'CAT6a UTP', status: 'Conectado', isActive: true };
        const conn2: Omit<Connection, 'id'> = { sourceEquipmentId: eq3Id, sourcePort: 'Gi1/0/1', destinationEquipmentId: eq4Id, destinationPort: 'eth0', cableType: 'CAT6a UTP', status: 'Conectado', isActive: true };

        batch.set(doc(connectionsCollectionRef), conn1);
        batch.set(doc(connectionsCollectionRef), conn2);

        await batch.commit();
        return { success: true, message: "Banco de dados populado com dados de teste." };

    } catch (error) {
        console.error("Erro ao popular o banco de dados:", error);
        return { success: false, error: (error as Error).message };
    }
}
