
'use server';

import sql from 'mssql';
import { getDbPool } from './db';
import { _updateUser } from './user-service';

const testUsers = [
    { id: 'user_1722384661021', email: 'manager@example.com', displayName: 'Maria Gerente', photoURL: 'https://placehold.co/100x100.png', role: 'manager', permissions: [], accessibleBuildingIds: ['B1722382574515','B1722382604646'], lastLoginAt: new Date().toISOString(), preferences: {}, isTestData: true },
    { id: 'user_1722384725331', email: 'supervisor@example.com', displayName: 'Carlos Supervisor', photoURL: 'https://placehold.co/100x100.png', role: 'supervisor_1', permissions: [], accessibleBuildingIds: ['B1722382574515'], lastLoginAt: new Date().toISOString(), preferences: {}, isTestData: true },
    { id: 'user_1722384762955', email: 'technician@example.com', displayName: 'Ana Técnica', photoURL: 'https://placehold.co/100x100.png', role: 'technician_1', permissions: [], accessibleBuildingIds: ['B1722382574515'], lastLoginAt: new Date().toISOString(), preferences: {}, isTestData: true }
];

const testBuildings = [
  { id: 'B1722382574515', name: 'Datacenter SP-01', address: 'Rua Principal, 123, São Paulo', isTestData: true },
  { id: 'B1722382604646', name: 'Datacenter RJ-01', address: 'Avenida Atlântica, 456, Rio de Janeiro', isTestData: true }
];

const testRooms = [
    { id: 'R1722382686121', name: 'Sala de Servidores 1A', buildingId: 'B1722382574515', largura: 15, comprimento: 20, tileWidthCm: 60, tileHeightCm: 60, xAxisNaming: 'alpha', yAxisNaming: 'numeric', isTestData: true },
    { id: 'R1722382717387', name: 'Sala de Rede 1B', buildingId: 'B1722382574515', largura: 8, comprimento: 10, tileWidthCm: 60, tileHeightCm: 60, xAxisNaming: 'numeric', yAxisNaming: 'alpha', isTestData: true },
    { id: 'R1722382741544', name: 'Sala de Servidores 2A', buildingId: 'B1722382604646', largura: 25, comprimento: 30, tileWidthCm: 50, tileHeightCm: 50, xAxisNaming: 'alpha', yAxisNaming: 'numeric', isTestData: true }
];

// Tipos para Itens de Planta Baixa (Pais)
const testParentItemTypes = [
    { id: 'type_rack_default', name: 'Rack 42U', category: 'Gabinetes', defaultWidthM: 0.6, defaultHeightM: 1, iconName: 'Server', canHaveChildren: 1, isResizable: 0, status: 'active', isTestData: true, defaultColor: '#3b82f6' },
    { id: 'type_ac_default', name: 'Ar Condicionado', category: 'Climatização', defaultWidthM: 0.8, defaultHeightM: 2, iconName: 'Snowflake', canHaveChildren: 0, isResizable: 1, status: 'active', isTestData: true, defaultColor: '#60a5fa' },
    { id: 'type_qdf_default', name: 'Quadro de Força', category: 'Elétrica', defaultWidthM: 0.8, defaultHeightM: 1.2, iconName: 'Router', canHaveChildren: 0, isResizable: 1, status: 'active', isTestData: true, defaultColor: '#f59e0b' },
    { id: 'type_pdu_default', name: 'PDU de Rack', category: 'Elétrica', defaultWidthM: 0.05, defaultHeightM: 1.8, iconName: 'Power', canHaveChildren: 0, isResizable: 0, status: 'active', isTestData: true, defaultColor: '#facc15' }
];

// Tipos para Equipamentos Aninhados (Filhos)
const testChildItemTypes = [
    { id: 'type_eqp_server', name: 'Servidor', category: 'Equipamentos', iconName: 'HardDrive', status: 'active', isTestData: true },
    { id: 'type_eqp_switch', name: 'Switch', category: 'Equipamentos', iconName: 'Network', status: 'active', isTestData: true },
    { id: 'type_eqp_patch', name: 'Patch Panel', category: 'Equipamentos', iconName: 'PanelTop', status: 'active', isTestData: true },
    { id: 'type_eqp_storage', name: 'Storage', category: 'Equipamentos', iconName: 'Database', status: 'active', isTestData: true },
    { id: 'type_eqp_firewall', name: 'Firewall', category: 'Equipamentos', iconName: 'ShieldCheck', status: 'active', isTestData: true }
];

const testManufacturers = [
    { id: 'man_cisco', name: 'Cisco', isTestData: true },
    { id: 'man_dell', name: 'Dell EMC', isTestData: true },
    { id: 'man_hp', name: 'HPE', isTestData: true },
    { id: 'man_juniper', name: 'Juniper', isTestData: true },
    { id: 'man_legrand', name: 'Legrand', isTestData: true },
    { id: 'man_apc', name: 'APC', isTestData: true },
    { id: 'man_furukawa', name: 'Furukawa', isTestData: true },
];

const testModels = [
    // Cisco
    { id: 'model_c9300', name: 'Catalyst 9300', manufacturerId: 'man_cisco', tamanhoU: 1, portConfig: '48xRJ45;4xSFP+', isTestData: true },
    { id: 'model_c2960', name: 'Catalyst 2960', manufacturerId: 'man_cisco', tamanhoU: 1, portConfig: '24xRJ45;2xSFP', isTestData: true },
    // Dell
    { id: 'model_r640', name: 'PowerEdge R640', manufacturerId: 'man_dell', tamanhoU: 1, portConfig: '2xRJ45;2xSFP+;1xVGA', isTestData: true },
    { id: 'model_r740', name: 'PowerEdge R740', manufacturerId: 'man_dell', tamanhoU: 2, portConfig: '4xRJ45;2xSFP+;1xVGA;2xUSB', isTestData: true },
    // HPE
    { id: 'model_dl380', name: 'ProLiant DL380 Gen10', manufacturerId: 'man_hp', tamanhoU: 2, portConfig: '4xRJ45;1xVGA', isTestData: true },
    // APC
    { id: 'model_ap8853', name: 'AP8853', manufacturerId: 'man_apc', tamanhoU: 42, portConfig: '20xC13;4xC19', isTestData: true },
    // Furukawa
    { id: 'model_giga_cat6', name: 'Gigalan CAT6 24P', manufacturerId: 'man_furukawa', tamanhoU: 1, portConfig: '24xRJ45', isTestData: true },
];

const testParentItems = [
    { id: 'item_1722382897042', label: 'RACK-A01', x: 2, y: 2, width: 0.6, height: 1, type: 'Rack 42U', status: 'active', roomId: 'R1722382686121', serialNumber: 'SN-RACK-001', brand: 'Dell EMC', tag: 'ASSET-001', isTagEligible: true, ownerEmail: 'infra@example.com', dataSheetUrl: 'http://example.com/rack.pdf', description: 'Rack principal de servidores', imageUrl: 'https://placehold.co/600x400.png', modelo: 'PowerEdge R42', preco: 5000, trellisId: 'TRELLIS-001', tamanhoU: 42, potenciaW: 3000, isTestData: true },
    { id: 'item_1722383020668', label: 'AC-01', x: 0, y: 5, width: 0.8, height: 2, type: 'Ar Condicionado', status: 'active', roomId: 'R1722382686121', serialNumber: 'SN-AC-001', brand: 'Stulz', tag: 'ASSET-002', isTagEligible: false, ownerEmail: 'infra@example.com', dataSheetUrl: 'http://example.com/ac.pdf', description: 'Ar condicionado da fileira A', imageUrl: null, modelo: 'CyberAir 3', preco: 15000, trellisId: 'TRELLIS-002', tamanhoU: null, potenciaW: 10000, isTestData: true },
    { id: 'item_1722383173367', label: 'RACK-B05', x: 5, y: 5, width: 0.6, height: 1, type: 'Rack 42U', status: 'maintenance', roomId: 'R1722382741544', serialNumber: 'SN-RACK-005', brand: 'HPE', tag: 'ASSET-004', isTagEligible: true, ownerEmail: 'infra@example.com', dataSheetUrl: null, description: 'Rack de armazenamento', imageUrl: null, modelo: 'ProLiant DL380', preco: 4500, trellisId: 'TRELLIS-004', tamanhoU: 42, potenciaW: 2800, isTestData: true },
    { id: 'item_1722383173368', label: 'PDU-A01-L', x: 2, y: 3, width: 0.05, height: 1.8, type: 'PDU de Rack', status: 'active', roomId: 'R1722382686121', serialNumber: 'SN-PDU-001', brand: 'APC', tag: 'ASSET-005', isTagEligible: true, ownerEmail: 'infra@example.com', dataSheetUrl: 'http://example.com/pdu.pdf', description: 'PDU Esquerda do Rack A01', imageUrl: 'https://placehold.co/50x180.png', modelo: 'AP8853', preco: 1200, trellisId: 'TRELLIS-005', tamanhoU: null, potenciaW: 17300, isTestData: true }
];

const testChildItems = [
    { id: 'citem_001', label: 'SW-CORE-01', parentId: 'item_1722382897042', type: 'Switch', status: 'active', serialNumber: 'SN-SW-001', brand: 'Cisco', tag: 'ASSET-003', isTagEligible: true, ownerEmail: 'rede@example.com', dataSheetUrl: null, description: 'Switch Core da sala de rede', imageUrl: 'https://placehold.co/480x440.png', modelo: 'Catalyst 9300', preco: 8000, trellisId: 'TRELLIS-003', tamanhoU: 1, posicaoU: 40, isTestData: true },
    { id: 'citem_002', label: 'SRV-WEB-01', parentId: 'item_1722382897042', type: 'Servidor', status: 'active', serialNumber: 'SN-SRV-001', brand: 'Dell EMC', tag: 'ASSET-006', isTagEligible: true, ownerEmail: 'servers@example.com', dataSheetUrl: null, description: 'Servidor Web Principal', imageUrl: 'https://placehold.co/480x88.png', modelo: 'PowerEdge R640', preco: 12000, trellisId: 'TRELLIS-006', tamanhoU: 2, posicaoU: 20, isTestData: true },
    { id: 'citem_003', label: 'PATCH-A01-01', parentId: 'item_1722382897042', type: 'Patch Panel', status: 'draft', serialNumber: 'SN-PATCH-001', brand: 'Furukawa', tag: 'ASSET-007', isTagEligible: false, ownerEmail: 'rede@example.com', dataSheetUrl: null, description: 'Patch Panel para servidores', imageUrl: null, modelo: 'Gigalan Cat6', preco: 500, trellisId: 'TRELLIS-007', tamanhoU: 1, posicaoU: 35, isTestData: true },
];

async function bulkInsert(pool: sql.ConnectionPool, tableName: string, data: Record<string, any>[]) {
    if (data.length === 0) return;
    
    const table = new sql.Table(tableName);
    
    // Mapeamento de tipos para colunas comuns
    table.columns.add('id', sql.NVarChar, { nullable: false, primary: true });
    if ('name' in data[0]) table.columns.add('name', sql.NVarChar, { nullable: false });
    if ('address' in data[0]) table.columns.add('address', sql.NVarChar, { nullable: true });
    if ('email' in data[0]) table.columns.add('email', sql.NVarChar, { nullable: false });
    if ('displayName' in data[0]) table.columns.add('displayName', sql.NVarChar, { nullable: true });
    if ('photoURL' in data[0]) table.columns.add('photoURL', sql.NVarChar, { nullable: true });
    if ('role' in data[0]) table.columns.add('role', sql.NVarChar, { nullable: false });
    if ('permissions' in data[0]) table.columns.add('permissions', sql.NVarChar, { nullable: true });
    if ('accessibleBuildingIds' in data[0]) table.columns.add('accessibleBuildingIds', sql.NVarChar, { nullable: true });
    if ('lastLoginAt' in data[0]) table.columns.add('lastLoginAt', sql.DateTime2, { nullable: false });
    if ('preferences' in data[0]) table.columns.add('preferences', sql.NVarChar, { nullable: true });
    if ('buildingId' in data[0]) table.columns.add('buildingId', sql.NVarChar, { nullable: false });
    if ('largura' in data[0]) table.columns.add('largura', sql.Float, { nullable: true });
    if ('comprimento' in data[0]) table.columns.add('widthM', sql.Float, { nullable: true });
    if ('tileWidthCm' in data[0]) table.columns.add('tileWidthCm', sql.Float, { nullable: true });
    if ('tileHeightCm' in data[0]) table.columns.add('tileHeightCm', sql.Float, { nullable: true });
    if ('xAxisNaming' in data[0]) table.columns.add('xAxisNaming', sql.NVarChar, { nullable: true });
    if ('yAxisNaming' in data[0]) table.columns.add('yAxisNaming', sql.NVarChar, { nullable: true });
    if ('category' in data[0]) table.columns.add('category', sql.NVarChar, { nullable: false });
    if ('defaultWidthM' in data[0]) table.columns.add('defaultWidthM', sql.Float, { nullable: false });
    if ('defaultHeightM' in data[0]) table.columns.add('defaultHeightM', sql.Float, { nullable: false });
    if ('iconName' in data[0]) table.columns.add('iconName', sql.NVarChar, { nullable: true });
    if ('status' in data[0]) table.columns.add('status', sql.NVarChar, { nullable: false });
    if ('defaultColor' in data[0]) table.columns.add('defaultColor', sql.NVarChar, { nullable: true });
    if ('canHaveChildren' in data[0]) table.columns.add('canHaveChildren', sql.Bit, { nullable: true });
    if ('isResizable' in data[0]) table.columns.add('isResizable', sql.Bit, { nullable: true });
    if ('manufacturerId' in data[0]) table.columns.add('manufacturerId', sql.NVarChar, { nullable: false });
    if ('portConfig' in data[0]) table.columns.add('portConfig', sql.NVarChar, { nullable: true });
    if ('tamanhoU' in data[0]) table.columns.add('tamanhoU', sql.Int, { nullable: true });
    if ('label' in data[0]) table.columns.add('label', sql.NVarChar, { nullable: false });
    if ('x' in data[0]) table.columns.add('x', sql.Int, { nullable: false });
    if ('y' in data[0]) table.columns.add('y', sql.Int, { nullable: false });
    if ('width' in data[0]) table.columns.add('width', sql.Float, { nullable: false });
    if ('height' in data[0]) table.columns.add('height', sql.Float, { nullable: false });
    if ('type' in data[0]) table.columns.add('type', sql.NVarChar, { nullable: false });
    if ('roomId' in data[0]) table.columns.add('roomId', sql.NVarChar, { nullable: false });
    if ('serialNumber' in data[0]) table.columns.add('serialNumber', sql.NVarChar, { nullable: true });
    if ('brand' in data[0]) table.columns.add('brand', sql.NVarChar, { nullable: true });
    if ('tag' in data[0]) table.columns.add('tag', sql.NVarChar, { nullable: true });
    if ('isTagEligible' in data[0]) table.columns.add('isTagEligible', sql.Bit, { nullable: true });
    if ('ownerEmail' in data[0]) table.columns.add('ownerEmail', sql.NVarChar, { nullable: true });
    if ('dataSheetUrl' in data[0]) table.columns.add('dataSheetUrl', sql.NVarChar, { nullable: true });
    if ('description' in data[0]) table.columns.add('description', sql.NVarChar, { nullable: true });
    if ('imageUrl' in data[0]) table.columns.add('imageUrl', sql.NVarChar, { nullable: true });
    if ('modelo' in data[0]) table.columns.add('modelo', sql.NVarChar, { nullable: true });
    if ('preco' in data[0]) table.columns.add('preco', sql.Float, { nullable: true });
    if ('trellisId' in data[0]) table.columns.add('trellisId', sql.NVarChar, { nullable: true });
    if ('potenciaW' in data[0]) table.columns.add('potenciaW', sql.Int, { nullable: true });
    if ('color' in data[0]) table.columns.add('color', sql.NVarChar, { nullable: true });
    if ('parentId' in data[0]) table.columns.add('parentId', sql.NVarChar, { nullable: false });
    if ('posicaoU' in data[0]) table.columns.add('posicaoU', sql.Int, { nullable: true });
    if ('isTestData' in data[0]) table.columns.add('isTestData', sql.Bit, { nullable: true });

    for (const item of data) {
        const row = Object.values(item).map(val => (typeof val === 'object' && val !== null ? JSON.stringify(val) : val));
        table.rows.add(...row);
    }
    
    const request = pool.request();
    await request.bulk(table);
}


export async function populateTestData() {
    try {
        await cleanTestData();
        const pool = await getDbPool();

        // Nível 1: Entidades sem dependências
        await bulkInsert(pool, 'Users', testUsers.map(u => ({...u, permissions: JSON.stringify(u.permissions), accessibleBuildingIds: JSON.stringify(u.accessibleBuildingIds), preferences: JSON.stringify(u.preferences) })));
        await bulkInsert(pool, 'Buildings', testBuildings);
        await bulkInsert(pool, 'ItemTypes', testParentItemTypes);
        await bulkInsert(pool, 'ItemTypesEqp', testChildItemTypes);
        await bulkInsert(pool, 'Manufacturers', testManufacturers);
        
        // Nível 2: Entidades com dependências de Nível 1
        await bulkInsert(pool, 'Rooms', testRooms.map(r => ({...r, widthM: r.comprimento})));
        await bulkInsert(pool, 'Models', testModels);
        
        // Nível 3: Itens que dependem de Nível 2
        await bulkInsert(pool, 'ParentItems', testParentItems);
        
        // Nível 4: Itens que dependem de Nível 3
        await bulkInsert(pool, 'ChildItems', testChildItems);
        
        console.log("Banco de dados populado com dados de teste.");
    } catch (error) {
        console.error("Erro ao popular banco de dados:", error);
        throw new Error("Falha ao popular o banco de dados.");
    }
}

export async function cleanTestData() {
    try {
        const pool = await getDbPool();
        // A ordem de exclusão é importante por causa das chaves estrangeiras.
        await pool.request().query("DELETE FROM ChildItems WHERE isTestData = 1");
        await pool.request().query("DELETE FROM ParentItems WHERE isTestData = 1");
        await pool.request().query("DELETE FROM Rooms WHERE isTestData = 1");
        await pool.request().query("DELETE FROM Buildings WHERE isTestData = 1");
        await pool.request().query("DELETE FROM ItemTypes WHERE isTestData = 1");
        await pool.request().query("DELETE FROM ItemTypesEqp WHERE isTestData = 1");
        await pool.request().query("DELETE FROM Models WHERE isTestData = 1");
        await pool.request().query("DELETE FROM Manufacturers WHERE isTestData = 1");
        await pool.request().query("DELETE FROM Users WHERE isTestData = 1");

        console.log("Dados de teste removidos do banco de dados.");
    } catch (error) {
        console.error("Erro ao limpar dados de teste:", error);
        throw new Error("Falha ao limpar dados de teste.");
    }
}

    