
'use server';

import sql from 'mssql';
import { getDbPool } from './db';
import { _ensureDatabaseSchema } from './user-service';

// ====================================================================
// FUNÇÃO UPSERT ROBUSTA (BASEADA EM IF/ELSE)
// ====================================================================
// Esta é a implementação correta da lógica "se existe, atualize; senão, insira".
// Usa um único objeto de requisição para evitar conflitos de parâmetros.
async function upsertRecord(transaction: sql.Transaction, tableName: string, data: Record<string, any>) {
    const { id } = data;
    if (!id) throw new Error(`Dados para a tabela ${tableName} devem conter um 'id'.`);

    const request = transaction.request(); 

    // 1. Verifica se o registro existe
    const checkRequest = transaction.request(); // Nova requisição para o select
    checkRequest.input('id_check', sql.NVarChar, id);
    const result = await checkRequest.query(`SELECT COUNT(*) as count FROM ${tableName} WHERE id = @id_check`);
    const exists = result.recordset[0].count > 0;
    
    // 2. Prepara e executa a query de INSERT ou UPDATE
    const columns = Object.keys(data);
    columns.forEach(key => {
        const value = data[key];
        if (typeof value === 'boolean') {
            request.input(key, sql.Bit, value);
        } else if (typeof value === 'number') {
            // Distingue entre INT e FLOAT
            if (Number.isInteger(value)) {
                request.input(key, sql.Int, value);
            } else {
                request.input(key, sql.Float, value);
            }
        }
        else {
            request.input(key, sql.NVarChar, value);
        }
    });
    
    if (exists) {
        const updateClauses = columns
            .filter(key => key !== 'id')
            .map(key => `${key} = @${key}`);
        if (updateClauses.length > 0) {
            await request.query(`UPDATE ${tableName} SET ${updateClauses.join(', ')} WHERE id = @id`);
        }
    } else {
        const valuePlaceholders = columns.map(key => `@${key}`);
        await request.query(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${valuePlaceholders.join(', ')})`);
    }
}


// --- DADOS ESSENCIAIS ---
const essentialManufacturers = [
    { id: 'man_cisco', name: 'Cisco' }, { id: 'man_dell', name: 'Dell EMC' }, { id: 'man_hpe', name: 'HPE' },
    { id: 'man_huawei', name: 'Huawei' }, { id: 'man_vertiv', name: 'Vertiv' }, { id: 'man_schneider', name: 'Schneider Electric (APC)' },
    { id: 'man_juniper', name: 'Juniper Networks' }, { id: 'man_arista', name: 'Arista Networks' }, { id: 'man_legrand', name: 'Legrand' },
    { id: 'man_furukawa', name: 'Furukawa' }, { id: 'man_nokia', name: 'Nokia' }, { id: 'man_ericsson', name: 'Ericsson' },
    { id: 'man_panduit', name: 'Panduit' }, { id: 'man_padtec', name: 'Padtec' }, { id: 'man_tellabs', name: 'Tellabs' },
];
const essentialModels = [
    { id: 'model_c9300_48', name: 'Catalyst 9300 48-port', manufacturerId: 'man_cisco', tamanhoU: 1, portConfig: '48xRJ45;8xSFP+' },
    { id: 'model_r740', name: 'PowerEdge R740', manufacturerId: 'man_dell', tamanhoU: 2, portConfig: '4xRJ45;2xSFP+;1xVGA;2xUSB;1xiDRAC' },
    { id: 'model_f_dio24', name: 'DIO 24 Fibras LC Duplex', manufacturerId: 'man_furukawa', tamanhoU: 1, portConfig: '24xLC_Duplex' },
    { id: 'model_v_pdu_v', name: 'Liebert MPH2 Vertical PDU', manufacturerId: 'man_vertiv', tamanhoU: 0, portConfig: '24xC13;6xC19' },
];
const essentialItemTypes = [
    { id: 'type_rack_default', name: 'Rack 42U', category: 'Gabinetes', defaultWidthM: 0.6, defaultHeightM: 1.2, iconName: 'Server', canHaveChildren: 1, isResizable: 0, status: 'active', defaultColor: '#3b82f6' },
    { id: 'type_ac_row', name: 'Ar Condicionado In-Row', category: 'Climatização', defaultWidthM: 0.3, defaultHeightM: 1.2, iconName: 'Snowflake', canHaveChildren: 0, isResizable: 1, status: 'active', defaultColor: '#34d399' },
];
const essentialItemTypesEqp = [
    { id: 'type_eqp_server', name: 'Servidor', category: 'Equipamentos', defaultWidthM: 0, defaultHeightM: 0, iconName: 'HardDrive', status: 'active', defaultColor: null },
    { id: 'type_eqp_switch', name: 'Switch', category: 'Equipamentos', defaultWidthM: 0, defaultHeightM: 0, iconName: 'Network', status: 'active', defaultColor: null },
    { id: 'type_eqp_patch', name: 'Patch Panel', category: 'Equipamentos', defaultWidthM: 0, defaultHeightM: 0, iconName: 'PanelTop', status: 'active', defaultColor: null },
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


// --- DADOS DE TESTE CONSISTENTES ---
const testBuildings = [
  { id: 'B1722382574515', name: 'Datacenter SP-01', address: 'Rua Principal, 123, São Paulo', isTestData: 1 },
  { id: 'B1722382604646', name: 'Datacenter RJ-01', address: 'Avenida Atlântica, 456, Rio de Janeiro', isTestData: 1 }
];
const testUsers = [
    { id: 'user_1722384661021', email: 'manager@example.com', displayName: 'Maria Gerente', photoURL: 'https://placehold.co/100x100.png', role: 'manager', permissions: JSON.stringify([]), accessibleBuildingIds: JSON.stringify(['B1722382574515','B1722382604646']), lastLoginAt: new Date().toISOString(), preferences: JSON.stringify({}), isTestData: 1 },
    { id: 'user_1722384725331', email: 'supervisor@example.com', displayName: 'Carlos Supervisor', photoURL: 'https://placehold.co/100x100.png', role: 'supervisor_1', permissions: JSON.stringify([]), accessibleBuildingIds: JSON.stringify(['B1722382574515']), lastLoginAt: new Date().toISOString(), preferences: JSON.stringify({}), isTestData: 1 },
    { id: 'user_1722384762955', email: 'technician@example.com', displayName: 'Ana Técnica', photoURL: 'https://placehold.co/100x100.png', role: 'technician_1', permissions: JSON.stringify([]), accessibleBuildingIds: JSON.stringify(['B1722382574515']), lastLoginAt: new Date().toISOString(), preferences: JSON.stringify({}), isTestData: 1 },
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

        // A ordem de inserção é crucial aqui
        await runPopulation("Fabricantes Essenciais", transaction, 'Manufacturers', essentialManufacturers);
        await runPopulation("Tipos de Item (Planta) Essenciais", transaction, 'ItemTypes', essentialItemTypes);
        await runPopulation("Tipos de Item (Equipamento) Essenciais", transaction, 'ItemTypesEqp', essentialItemTypesEqp);
        await runPopulation("Tipos de Porta Essenciais", transaction, 'PortTypes', essentialPortTypes);
        await runPopulation("Tipos de Conexão Essenciais", transaction, 'ConnectionTypes', essentialConnectionTypes);
        // Modelos dependem de Fabricantes, então vêm por último
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
        const request = transaction.request();
        await request.query(`DELETE FROM Connections WHERE isTestData = 1`);
        await request.query(`DELETE FROM EquipmentPorts WHERE childItemId IN (SELECT id FROM ChildItems WHERE isTestData = 1)`);
        await request.query(`DELETE FROM ChildItems WHERE isTestData = 1`);
        await request.query(`DELETE FROM ParentItems WHERE isTestData = 1`);
        await request.query(`DELETE FROM Rooms WHERE isTestData = 1`);
        await request.query(`DELETE FROM Buildings WHERE isTestData = 1`);
        await request.query(`DELETE FROM Users WHERE isTestData = 1`);

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
        // Limpa antes de inserir para ser re-executável
        await transaction.request().query(`DELETE FROM Buildings WHERE isTestData = 1`);
        await transaction.request().query(`DELETE FROM Users WHERE isTestData = 1`);

        await runPopulation("Prédios de Teste", transaction, 'Buildings', testBuildings);
        await runPopulation("Usuários de Teste", transaction, 'Users', testUsers);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error("Erro ao popular entidades base:", error);
        throw error;
    }
}

export async function populateRooms() {
    await _ensureDatabaseSchema();
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        await transaction.request().query(`DELETE FROM Rooms WHERE isTestData = 1`);
        await runPopulation("Salas de Teste", transaction, 'Rooms', testRooms);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error(`Erro ao popular Salas:`, error);
        throw error;
    }
}

export async function populateParentItems() {
    await _ensureDatabaseSchema();
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        await transaction.request().query(`DELETE FROM ParentItems WHERE isTestData = 1`);
        await runPopulation("Itens Pais de Teste", transaction, 'ParentItems', testParentItems);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error(`Erro ao popular Itens Pais:`, error);
        throw error;
    }
}

export async function populateChildItems() {
    await _ensureDatabaseSchema();
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        await transaction.request().query(`DELETE FROM ChildItems WHERE isTestData = 1`);
        await runPopulation("Itens Filhos de Teste", transaction, 'ChildItems', testChildItems);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error(`Erro ao popular Itens Filhos:`, error);
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
        await transaction.request().query(`DELETE FROM EquipmentPorts WHERE childItemId IN (SELECT id FROM ChildItems WHERE isTestData = 1)`);

        console.log("Populando portas para itens filhos de teste...");
        for (const child of testChildItems) {
            const modelResult = await transaction.request().input('modelName', sql.NVarChar, child.modelo).query`SELECT portConfig FROM Models WHERE name = @modelName`;
            if (modelResult.recordset.length > 0 && modelResult.recordset[0].portConfig) {
                const portConfig = modelResult.recordset[0].portConfig;
                const portTypesResult = await transaction.request().query`SELECT id, name FROM PortTypes`;
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
