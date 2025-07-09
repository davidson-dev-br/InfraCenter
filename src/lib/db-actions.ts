
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
        extractEquipmentDetails: `Você é um assistente especialista em gerenciamento de ativos de TI. Sua tarefa é analisar a imagem fornecida de um equipamento de rede ou servidor.

Examine cuidadosamente a imagem em busca de textos, etiquetas ou logotipos. Identifique o tipo de equipamento, fabricante (marca), nome/número do modelo, número de série, hostname e quaisquer etiquetas de patrimônio.

Extraia essas informações com precisão. Se uma informação específica não estiver visível ou não puder ser identificada, omita esse campo na saída.

Foto: {{media url=photoDataUri}}`,
        extractConnectionDetails: `Você é um assistente especialista em infraestrutura de TI, especializado em ler etiquetas de cabos. Sua tarefa é analisar a imagem fornecida de uma etiqueta de cabo.

A etiqueta geralmente segue o formato DE/PARA (FROM/TO).
- "DE" refere-se ao dispositivo e porta de origem.
- "PARA" refere-se ao dispositivo e porta de destino.

Examine cuidadosamente a imagem em busca de qualquer texto. Identifique o identificador principal da etiqueta (o texto mais proeminente, muitas vezes um ID de patch panel), o hostname e a porta do dispositivo de origem, e o hostname e a porta do dispositivo de destino.

Exemplo de texto da etiqueta:
"P-01-A-01
DE: SW-CORE-01 | Gi1/0/1
PARA: FW-EDGE-02 | PortA"

Para o exemplo acima, você extrairia:
- cableLabel: "P-01-A-01"
- sourceHostname: "SW-CORE-01"
- sourcePort: "Gi1/0/1"
- destinationHostname: "FW-EDGE-02"
- destinationPort: "PortA"

Extraia essas informações com precisão. Se uma informação específica não estiver visível ou não puder ser identificada, omita esse campo na saída.

Foto: {{media url=photoDataUri}}`,
        importFromSpreadsheet: `Você é um assistente especialista em migração de dados para um sistema de gerenciamento de infraestrutura de TI.
Você receberá uma representação JSON de uma planilha contendo dados de inventário.
Sua tarefa é analisar esses dados JSON, mapear inteligentemente as colunas para o esquema de equipamento e retornar uma lista limpa de objetos de equipamento.

Dados JSON da planilha:
\`\`\`json
{{{jsonData}}}
\`\`\`

Heurísticas de Mapeamento:
- 'hostname': Procure por colunas nomeadas 'Hostname', 'Device Name', 'Asset', 'Name', 'Nome do Dispositivo', 'Ativo' ou similar. Este é o identificador primário.
- 'brand': Procure por 'Manufacturer', 'Brand', 'Make', 'Fabricante', 'Marca'.
- 'model': Procure por 'Model', 'Product Name', 'Modelo'.
- 'serialNumber': Procure por 'Serial Number', 'S/N', 'Serial', 'Número de Série'.
- 'type': Procure por 'Type', 'Category', 'Tipo', 'Categoria' (ex: Switch, Server, Roteador).
- 'status': Procure por 'Status', 'Condition', 'Condição'.
- 'positionU': Procure por 'U Position', 'Position', 'Posição U', 'Posição'.
- 'sizeU': Procure por 'Size (U)', 'Height', 'Tamanho (U)', 'Altura'.
- 'tag': Procure por 'Asset Tag', 'TAG', 'Etiqueta de Patrimônio'.
- 'description': Procure por 'Description', 'Notes', 'Descrição', 'Observações'.

Para cada linha no JSON de entrada, crie um objeto de equipamento correspondente na saída. Se você não conseguir encontrar um mapeamento claro para um campo, omita-o do objeto. Não invente dados.
Foque apenas em extrair a lista de equipamentos.
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
