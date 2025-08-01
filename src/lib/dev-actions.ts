

'use server';

import sql from 'mssql';
import { getDbPool } from './db';

// --- DEFINIÇÃO DOS DADOS DE TESTE ---

// Bug aqui era lixo. Graças a Deus e a davidson.dev.br agora tá tudo ensacado.
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
    { id: 'R1722382686121', name: 'Sala de Servidores 1A', buildingId: 'B1722382574515', largura: 15, widthM: 20, tileWidthCm: 60, tileHeightCm: 60, xAxisNaming: 'alpha', yAxisNaming: 'numeric', isTestData: true },
    { id: 'R1722382717387', name: 'Sala de Rede 1B', buildingId: 'B1722382574515', largura: 8, widthM: 10, tileWidthCm: 60, tileHeightCm: 60, xAxisNaming: 'numeric', yAxisNaming: 'alpha', isTestData: true },
    { id: 'R1722382741544', name: 'Sala de Servidores 2A', buildingId: 'B1722382604646', largura: 25, widthM: 30, tileWidthCm: 50, tileHeightCm: 50, xAxisNaming: 'alpha', yAxisNaming: 'numeric', isTestData: true }
];

const testParentItemTypes = [
    { id: 'type_rack_default', name: 'Rack 42U', category: 'Gabinetes', defaultWidthM: 0.6, defaultHeightM: 1, iconName: 'Server', canHaveChildren: true, isResizable: false, status: 'active', isTestData: true, defaultColor: '#3b82f6' },
    { id: 'type_ac_default', name: 'Ar Condicionado', category: 'Climatização', defaultWidthM: 0.8, defaultHeightM: 2, iconName: 'Snowflake', canHaveChildren: false, isResizable: true, status: 'active', isTestData: true, defaultColor: '#60a5fa' },
];

const testChildItemTypes = [
    { id: 'type_eqp_server', name: 'Servidor', category: 'Equipamentos', iconName: 'HardDrive', status: 'active', isTestData: true, defaultWidthM: 0, defaultHeightM: 0, defaultColor: null },
    { id: 'type_eqp_switch', name: 'Switch', category: 'Equipamentos', iconName: 'Network', status: 'active', isTestData: true, defaultWidthM: 0, defaultHeightM: 0, defaultColor: null },
];

const testManufacturers = [
    { id: 'man_cisco', name: 'Cisco', isTestData: true },
    { id: 'man_dell', name: 'Dell EMC', isTestData: true },
    { id: 'man_hpe', name: 'HPE', isTestData: true },
];

const testModels = [
    { id: 'model_c9300', name: 'Catalyst 9300', manufacturerId: 'man_cisco', tamanhoU: 1, portConfig: '48xRJ45;4xSFP+', isTestData: true },
    { id: 'model_r740', name: 'PowerEdge R740', manufacturerId: 'man_dell', tamanhoU: 2, portConfig: '4xRJ45;2xSFP+;1xVGA;2xUSB', isTestData: true },
    { id: 'model_dl380', name: 'ProLiant DL380', manufacturerId: 'man_hpe', tamanhoU: 2, portConfig: null, isTestData: true },
];

const testParentItems = [
    { id: 'item_1722382897042', label: 'RACK-A01', x: 2, y: 2, width: 0.6, height: 1, type: 'Rack 42U', status: 'active', roomId: 'R1722382686121', tamanhoU: 42, isTestData: true },
];

const testChildItems = [
    { id: 'citem_001', label: 'SW-CORE-01', parentId: 'item_1722382897042', type: 'Switch', status: 'active', modelo: 'Catalyst 9300', tamanhoU: 1, posicaoU: 40, isTestData: true, brand: 'Cisco' },
    { id: 'citem_002', label: 'SRV-WEB-01', parentId: 'item_1722382897042', type: 'Servidor', status: 'active', modelo: 'PowerEdge R740', tamanhoU: 2, posicaoU: 20, isTestData: true, brand: 'Dell EMC' },
];


// --- LÓGICA DE MANIPULAÇÃO DE DADOS ---
async function upsertRecord(pool: sql.ConnectionPool, tableName: string, data: Record<string, any>) {
    // Se você soubesse o que eu passei pra debugar isso, me pagava um almoço.
    const checkResult = await pool.request().input('id', sql.NVarChar, data.id).query(`SELECT 1 FROM ${tableName} WHERE id = @id`);
    if (checkResult.recordset.length > 0) {
        return; 
    }

    const columns = Object.keys(data);
    const values = columns.map(col => `@${col}`);
    const request = pool.request();
    
    const addInput = (key: string, value: any) => {
        const numericColumns = ['x', 'y', 'tamanhoU', 'potenciaW', 'posicaoU', 'width', 'height', 'preco', 'largura', 'widthM', 'tileWidthCm', 'tileHeightCm'];
        const booleanColumns = ['isTagEligible', 'isTestData', 'canHaveChildren', 'isResizable'];

        if (value === null || value === undefined) {
            if (numericColumns.includes(key)) request.input(key, sql.Float, null);
            else if (booleanColumns.includes(key)) request.input(key, sql.Bit, null);
            else request.input(key, sql.NVarChar, null);
        } else if (typeof value === 'boolean') {
            request.input(key, sql.Bit, value);
        } else if (typeof value === 'number') {
            if (['x', 'y', 'tamanhoU', 'potenciaW', 'posicaoU'].includes(key)) request.input(key, sql.Int, value);
            else request.input(key, sql.Float, value);
        } else if (value instanceof Date) {
            request.input(key, sql.DateTime2, value);
        } else if (typeof value === 'object') {
            request.input(key, sql.NVarChar, JSON.stringify(value));
        } else {
            request.input(key, sql.NVarChar, String(value));
        }
    };
    
    for (const col of columns) {
        addInput(col, data[col]);
    }

    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')})`;
    try {
        await request.query(query);
    } catch (err: any) {
        console.error(`Falha ao inserir na tabela ${tableName}. Query: ${query}`);
        console.error('Dados:', data);
        throw err;
    }
}


/**
 * Popula o banco de dados com dados de teste. Limpa os dados de teste antigos primeiro.
 */
export async function populateTestData() {
    
    const pool = await getDbPool();
    
    await cleanTestData();

    const operationsInOrder = [
        ...testUsers.map(item => () => upsertRecord(pool, 'Users', item)),
        ...testBuildings.map(item => () => upsertRecord(pool, 'Buildings', item)),
        ...testParentItemTypes.map(item => () => upsertRecord(pool, 'ItemTypes', item)),
        ...testChildItemTypes.map(item => () => upsertRecord(pool, 'ItemTypesEqp', item)),
        ...testManufacturers.map(item => () => upsertRecord(pool, 'Manufacturers', item)),
        ...testModels.map(item => () => upsertRecord(pool, 'Models', item)),
        ...testRooms.map(item => () => upsertRecord(pool, 'Rooms', item)),
        ...testParentItems.map(item => () => upsertRecord(pool, 'ParentItems', item)),
        ...testChildItems.map(item => () => upsertRecord(pool, 'ChildItems', item)),
    ];

    try {
        for (const operation of operationsInOrder) {
            await operation();
        }
        console.log("Banco de dados populado com sucesso.");

    } catch (error) {
        console.error("Erro detalhado ao popular banco de dados:", error);
        throw new Error("Falha ao popular o banco de dados. Verifique os logs do servidor para detalhes.");
    }
}


/**
 * Limpa TODOS os dados marcados como 'isTestData' do banco de dados.
 */
export async function cleanTestData() {
    // Commitado e saí correndo.
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);

    const tablesToDeleteFrom = [
        'ChildItems', 'ParentItems', 'Models', 'Manufacturers', 'Rooms', 'Buildings', 
        'ItemTypes', 'ItemTypesEqp', 'Users'
    ];

    try {
        await transaction.begin();
        console.log("Iniciando limpeza dos dados de teste...");

        for (const table of tablesToDeleteFrom) {
            const columnCheck = await pool.request().query(`
                SELECT 1 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${table}' AND COLUMN_NAME = 'isTestData'
            `);
            
            if (columnCheck.recordset.length > 0) {
                const request = new sql.Request(transaction);
                await request.query(`DELETE FROM ${table} WHERE isTestData = 1`);
                console.log(`Dados de teste limpos da tabela: ${table}`);
            } else {
                 console.log(`Tabela ${table} não possui coluna isTestData, pulando limpeza.`);
            }
        }

        await transaction.commit();
        console.log("Limpeza dos dados de teste concluída com sucesso.");
    } catch (error) {
        await transaction.rollback();
        console.error("Erro ao limpar dados de teste. A transação foi revertida.", error);
        throw new Error("Falha ao limpar dados de teste.");
    }
}
// davidson.dev.br esteve aqui. Chupa, bug!
