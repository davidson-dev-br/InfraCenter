
'use server';

import sql from 'mssql';
import { getDbPool } from './db';
import { _ensureDatabaseSchema } from './user-service';

// --- LÓGICA DE UPSERT (IF/ELSE) ---
// Implementa a lógica "se existe, atualize; senão, insira" de forma explícita.
async function upsertRecord(transaction: sql.Transaction, tableName: string, data: Record<string, any>) {
    const { id } = data;
    if (!id) throw new Error(`Dados para ${tableName} devem conter um 'id'.`);

    const request = new sql.Request(transaction);
    request.input('id', sql.NVarChar, id);

    const result = await request.query(`SELECT COUNT(*) as count FROM ${tableName} WHERE id = @id`);
    const exists = result.recordset[0].count > 0;

    const queryRequest = new sql.Request(transaction);
    queryRequest.input('id', sql.NVarChar, id);
    
    if (exists) { // UPDATE
        const updateClauses = [];
        for (const key in data) {
            if (key !== 'id') {
                updateClauses.push(`${key} = @${key}`);
                queryRequest.input(key, data[key]);
            }
        }
        if (updateClauses.length > 0) {
            await queryRequest.query(`UPDATE ${tableName} SET ${updateClauses.join(', ')} WHERE id = @id`);
        }
    } else { // INSERT
        const columns = Object.keys(data);
        const values = columns.map(key => `@${key}`);
        for (const key in data) {
            queryRequest.input(key, data[key]);
        }
        await queryRequest.query(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')})`);
    }
}


// --- DEFINIÇÃO DOS DADOS DE TESTE ---

const testUsers = [
    { id: 'user_1722384661021', email: 'manager@example.com', displayName: 'Maria Gerente', photoURL: 'https://placehold.co/100x100.png', role: 'manager', permissions: JSON.stringify([]), accessibleBuildingIds: JSON.stringify(['B1722382574515','B1722382604646']), lastLoginAt: new Date().toISOString(), preferences: JSON.stringify({}), isTestData: 1 },
    { id: 'user_1722384725331', email: 'supervisor@example.com', displayName: 'Carlos Supervisor', photoURL: 'https://placehold.co/100x100.png', role: 'supervisor_1', permissions: JSON.stringify([]), accessibleBuildingIds: JSON.stringify(['B1722382574515']), lastLoginAt: new Date().toISOString(), preferences: JSON.stringify({}), isTestData: 1 },
    { id: 'user_1722384762955', email: 'technician@example.com', displayName: 'Ana Técnica', photoURL: 'https://placehold.co/100x100.png', role: 'technician_1', permissions: JSON.stringify([]), accessibleBuildingIds: JSON.stringify(['B1722382574515']), lastLoginAt: new Date().toISOString(), preferences: JSON.stringify({}), isTestData: 1 },
];

const testBuildings = [
  { id: 'B1722382574515', name: 'Datacenter SP-01', address: 'Rua Principal, 123, São Paulo', isTestData: 1 },
  { id: 'B1722382604646', name: 'Datacenter RJ-01', address: 'Avenida Atlântica, 456, Rio de Janeiro', isTestData: 1 }
];

const testRooms = [
    { id: 'R1722382686121', name: 'Sala de Servidores 1A', buildingId: 'B1722382574515', largura: 15, widthM: 20, tileWidthCm: 60, tileHeightCm: 60, xAxisNaming: 'alpha', yAxisNaming: 'numeric', isTestData: 1 },
    { id: 'R1722382717387', name: 'Sala de Rede 1B', buildingId: 'B1722382574515', largura: 8, widthM: 10, tileWidthCm: 60, tileHeightCm: 60, xAxisNaming: 'numeric', yAxisNaming: 'alpha', isTestData: 1 },
    { id: 'R1722382741544', name: 'Sala de Servidores 2A', buildingId: 'B1722382604646', largura: 25, widthM: 30, tileWidthCm: 50, tileHeightCm: 50, xAxisNaming: 'alpha', yAxisNaming: 'numeric', isTestData: 1 }
];

const testParentItems = [
    { id: 'pitem_001', label: 'RACK-A01', x: 2, y: 2, width: 0.6, height: 1, type: 'Rack 42U', status: 'active', roomId: 'R1722382686121', tamanhoU: 42, isTestData: 1 },
    { id: 'pitem_002', label: 'RACK-A02', x: 2, y: 5, width: 0.6, height: 1, type: 'Rack 42U', status: 'active', roomId: 'R1722382686121', tamanhoU: 42, isTestData: 1 },
];

const testChildItems = [
    { id: 'citem_001', label: 'SW-CORE-01', parentId: 'pitem_001', type: 'Switch', status: 'active', modelo: 'Catalyst 9300 48-port', tamanhoU: 1, posicaoU: 40, brand: 'Cisco', isTestData: 1 },
    { id: 'citem_002', label: 'SRV-WEB-01', parentId: 'pitem_001', type: 'Servidor', status: 'active', modelo: 'PowerEdge R740', tamanhoU: 2, posicaoU: 20, brand: 'Dell EMC', isTestData: 1 },
    { id: 'citem_003', label: 'DIO-01-A', parentId: 'pitem_002', type: 'Patch Panel', status: 'active', modelo: 'DIO 24 Fibras LC Duplex', tamanhoU: 1, posicaoU: 41, brand: 'Furukawa', isTestData: 1 },
    { id: 'citem_004', label: 'PDU-01-L', parentId: 'pitem_001', type: 'PDU', status: 'active', modelo: 'Liebert MPH2 Vertical PDU', tamanhoU: 0, posicaoU: 1, brand: 'Vertiv', isTestData: 1 }
];

// --- DADOS ESSENCIAIS ---

const essentialManufacturers = [
    { id: 'man_cisco', name: 'Cisco', isTestData: 0 }, { id: 'man_dell', name: 'Dell EMC', isTestData: 0 }, { id: 'man_hpe', name: 'HPE', isTestData: 0 },
    { id: 'man_huawei', name: 'Huawei', isTestData: 0 }, { id: 'man_vertiv', name: 'Vertiv', isTestData: 0 }, { id: 'man_schneider', name: 'Schneider Electric (APC)', isTestData: 0 },
    { id: 'man_juniper', name: 'Juniper Networks', isTestData: 0 }, { id: 'man_arista', name: 'Arista Networks', isTestData: 0 }, { id: 'man_legrand', name: 'Legrand', isTestData: 0 },
    { id: 'man_furukawa', name: 'Furukawa', isTestData: 0 }, { id: 'man_nokia', name: 'Nokia', isTestData: 0 }, { id: 'man_ericsson', name: 'Ericsson', isTestData: 0 },
    { id: 'man_panduit', name: 'Panduit', isTestData: 0 }, { id: 'man_padtec', name: 'Padtec', isTestData: 0 }, { id: 'man_tellabs', name: 'Tellabs', isTestData: 0 },
];

const essentialModels = [
    { id: 'model_c9300_48', name: 'Catalyst 9300 48-port', manufacturerId: 'man_cisco', tamanhoU: 1, portConfig: '48xRJ45;8xSFP+', isTestData: 0 },
    { id: 'model_r740', name: 'PowerEdge R740', manufacturerId: 'man_dell', tamanhoU: 2, portConfig: '4xRJ45;2xSFP+;1xVGA;2xUSB;1xiDRAC', isTestData: 0 },
    { id: 'model_f_dio24', name: 'DIO 24 Fibras LC Duplex', manufacturerId: 'man_furukawa', tamanhoU: 1, portConfig: '24xLC_Duplex', isTestData: 0 },
    { id: 'model_v_pdu_v', name: 'Liebert MPH2 Vertical PDU', manufacturerId: 'man_vertiv', tamanhoU: 0, portConfig: '24xC13;6xC19', isTestData: 0 },
];

const essentialItemTypes = [
    { id: 'type_rack_default', name: 'Rack 42U', category: 'Gabinetes', defaultWidthM: 0.6, defaultHeightM: 1.2, iconName: 'Server', canHaveChildren: 1, isResizable: 0, status: 'active', isTestData: 0, defaultColor: '#3b82f6' },
    { id: 'type_ac_row', name: 'Ar Condicionado In-Row', category: 'Climatização', defaultWidthM: 0.3, defaultHeightM: 1.2, iconName: 'Snowflake', canHaveChildren: 0, isResizable: 1, status: 'active', isTestData: 0, defaultColor: '#34d399' },
];

const essentialItemTypesEqp = [
    { id: 'type_eqp_server', name: 'Servidor', category: 'Equipamentos', defaultWidthM: 0, defaultHeightM: 0, iconName: 'HardDrive', status: 'active', isTestData: 0, defaultColor: null },
    { id: 'type_eqp_switch', name: 'Switch', category: 'Equipamentos', defaultWidthM: 0, defaultHeightM: 0, iconName: 'Network', status: 'active', isTestData: 0, defaultColor: null },
    { id: 'type_eqp_patch', name: 'Patch Panel', category: 'Equipamentos', defaultWidthM: 0, defaultHeightM: 0, iconName: 'PanelTop', status: 'active', isTestData: 0, defaultColor: null },
];

const essentialPortTypes = [
    { id: 'port_rj45', name: 'RJ45', description: 'Conector de rede padrão para cabos UTP.', isDefault: 1 },
    { id: 'port_sfp+', name: 'SFP+', description: 'Porta 10Gbps SFP.', isDefault: 0 },
    { id: 'port_lc_duplex', name: 'LC_Duplex', description: 'Conector duplo de fibra óptica LC.', isDefault: 0 },
    { id: 'port_c13', name: 'C13', description: 'Conector de energia padrão para PDUs.', isDefault: 0 },
    { id: 'port_c19', name: 'C19', description: 'Conector de energia de alta corrente para PDUs.', isDefault: 0 },
];

const essentialConnectionTypes = [
    { id: 'conn_utp', name: 'Dados UTP', description: 'Conexão de dados via cabo de par trançado.', isDefault: 1 },
    { id: 'conn_fibra', name: 'Fibra Óptica', description: 'Conexão de dados via fibra óptica monomodo ou multimodo.', isDefault: 1 },
];


async function runPopulation(title: string, transaction: sql.Transaction, table: string, data: any[]) {
    console.log(`Populando ${title}...`);
    for (const record of data) {
        await upsertRecord(transaction, table, record);
    }
}

export async function populateEssentialData() {
    await _ensureDatabaseSchema();
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        console.log("Iniciando a população de dados essenciais...");

        await runPopulation("Fabricantes Essenciais", transaction, 'Manufacturers', essentialManufacturers);
        await runPopulation("Tipos de Item (Planta) Essenciais", transaction, 'ItemTypes', essentialItemTypes);
        await runPopulation("Tipos de Item (Equipamento) Essenciais", transaction, 'ItemTypesEqp', essentialItemTypesEqp);
        await runPopulation("Tipos de Porta Essenciais", transaction, 'PortTypes', essentialPortTypes);
        await runPopulation("Tipos de Conexão Essenciais", transaction, 'ConnectionTypes', essentialConnectionTypes);
        await runPopulation("Modelos Essenciais", transaction, 'Models', essentialModels);
        
        await transaction.commit();
        console.log("Banco de dados populado com dados essenciais com sucesso.");
    } catch (error) {
        await transaction.rollback();
        console.error("Erro detalhado ao popular dados essenciais:", error);
        throw new Error("Falha ao popular dados essenciais. Verifique os logs do servidor.");
    }
}

export async function cleanTestData() {
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        console.log("Iniciando limpeza dos dados de teste...");

        // A ordem de exclusão é a inversa da criação para evitar erros de chave estrangeira
        await new sql.Request(transaction).query(`DELETE FROM Connections WHERE isTestData = 1`);
        await new sql.Request(transaction).query(`DELETE FROM EquipmentPorts WHERE childItemId IN (SELECT id FROM ChildItems WHERE isTestData = 1)`);
        await new sql.Request(transaction).query(`DELETE FROM ChildItems WHERE isTestData = 1`);
        await new sql.Request(transaction).query(`DELETE FROM ParentItems WHERE isTestData = 1`);
        await new sql.Request(transaction).query(`DELETE FROM Rooms WHERE isTestData = 1`);
        await new sql.Request(transaction).query(`DELETE FROM Buildings WHERE isTestData = 1`);
        await new sql.Request(transaction).query(`DELETE FROM Users WHERE isTestData = 1`);

        await transaction.commit();
        console.log("Limpeza dos dados de teste concluída com sucesso.");
    } catch (error) {
        await transaction.rollback();
        console.error("Erro ao limpar dados de teste:", error);
        throw new Error("Falha ao limpar dados de teste.");
    }
}

export async function populateBaseEntities() {
    await _ensureDatabaseSchema();
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        await runPopulation("Usuários de Teste", transaction, 'Users', testUsers);
        await runPopulation("Prédios de Teste", transaction, 'Buildings', testBuildings);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error("Erro ao popular entidades base:", error);
        throw error;
    }
}

export async function populateRooms() {
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        await runPopulation("Salas de Teste", transaction, 'Rooms', testRooms);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error("Erro ao popular salas:", error);
        throw error;
    }
}

export async function populateParentItems() {
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        await runPopulation("Itens Pais de Teste", transaction, 'ParentItems', testParentItems);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error("Erro ao popular itens pais:", error);
        throw error;
    }
}

export async function populateChildItems() {
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        await runPopulation("Itens Filhos de Teste", transaction, 'ChildItems', testChildItems);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error("Erro ao popular itens filhos:", error);
        throw error;
    }
}

export async function populatePortsAndConnections() {
    await _ensureDatabaseSchema();
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        console.log("Limpando portas antigas de itens de teste...");
        await new sql.Request(transaction).query(`DELETE FROM EquipmentPorts WHERE childItemId IN (SELECT id FROM ChildItems WHERE isTestData = 1)`);

        console.log("Populando portas para itens filhos de teste...");
        for (const child of testChildItems) {
            const modelResult = await new sql.Request(transaction).input('modelName', sql.NVarChar, child.modelo).query`SELECT portConfig FROM Models WHERE name = @modelName`;
            if (modelResult.recordset.length > 0 && modelResult.recordset[0].portConfig) {
                const portConfig = modelResult.recordset[0].portConfig;
                const portTypesResult = await new sql.Request(transaction).query`SELECT id, name FROM PortTypes`;
                const portTypesMap = new Map(portTypesResult.recordset.map(pt => [pt.name.toUpperCase(), pt.id]));
                let portCounter = 1;

                const portGroups = portConfig.split(';').filter(Boolean);
                for (const group of portGroups) {
                    const parts = group.toLowerCase().split('x');
                    if (parts.length !== 2) continue;
                    const quantity = parseInt(parts[0], 10);
                    const typeName = parts[1].toUpperCase();
                    if (isNaN(quantity) || !portTypesMap.has(typeName)) continue;
                    const portTypeId = portTypesMap.get(typeName);

                    for (let i = 0; i < quantity; i++) {
                        const portId = `eport_${child.id}_${portCounter}`;
                        const portLabel = `${typeName.replace(/[^A-Z0-9]/g, '')}-${i + 1}`;
                        const portData = {
                            id: portId,
                            childItemId: child.id,
                            portTypeId: portTypeId,
                            label: portLabel,
                            status: 'down'
                        };
                        await upsertRecord(transaction, 'EquipmentPorts', portData);
                        portCounter++;
                    }
                }
            }
        }
        
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error("Erro ao popular portas e conexões:", error);
        throw error;
    }
}
