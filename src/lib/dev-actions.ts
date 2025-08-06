
'use server';

import sql from 'mssql';
import { getDbPool } from './db';
import { _ensureDatabaseSchema } from './user-service';

// --- DEFINIÇÃO DOS DADOS DE TESTE ---

const testUsers = [
    { id: 'user_1722384661021', email: 'manager@example.com', displayName: 'Maria Gerente', photoURL: 'https://placehold.co/100x100.png', role: 'manager', permissions: [], accessibleBuildingIds: ['B1722382574515','B1722382604646'], lastLoginAt: new Date().toISOString(), preferences: {} },
    { id: 'user_1722384725331', email: 'supervisor@example.com', displayName: 'Carlos Supervisor', photoURL: 'https://placehold.co/100x100.png', role: 'supervisor_1', permissions: [], accessibleBuildingIds: ['B1722382574515'], lastLoginAt: new Date().toISOString(), preferences: {} },
    { id: 'user_1722384762955', email: 'technician@example.com', displayName: 'Ana Técnica', photoURL: 'https://placehold.co/100x100.png', role: 'technician_1', permissions: [], accessibleBuildingIds: ['B1722382574515'], lastLoginAt: new Date().toISOString(), preferences: {} },
];

const testBuildings = [
  { id: 'B1722382574515', name: 'Datacenter SP-01', address: 'Rua Principal, 123, São Paulo' },
  { id: 'B1722382604646', name: 'Datacenter RJ-01', address: 'Avenida Atlântica, 456, Rio de Janeiro' }
];

const testRooms = [
    { id: 'R1722382686121', name: 'Sala de Servidores 1A', buildingId: 'B1722382574515', largura: 15, widthM: 20, tileWidthCm: 60, tileHeightCm: 60, xAxisNaming: 'alpha', yAxisNaming: 'numeric' },
    { id: 'R1722382717387', name: 'Sala de Rede 1B', buildingId: 'B1722382574515', largura: 8, widthM: 10, tileWidthCm: 60, tileHeightCm: 60, xAxisNaming: 'numeric', yAxisNaming: 'alpha' },
    { id: 'R1722382741544', name: 'Sala de Servidores 2A', buildingId: 'B1722382604646', largura: 25, widthM: 30, tileWidthCm: 50, tileHeightCm: 50, xAxisNaming: 'alpha', yAxisNaming: 'numeric' }
];

const testParentItems = [
    { id: 'pitem_001', label: 'RACK-A01', x: 2, y: 2, width: 0.6, height: 1, type: 'Rack 42U', status: 'active', roomId: 'R1722382686121', tamanhoU: 42 },
    { id: 'pitem_002', label: 'RACK-A02', x: 2, y: 5, width: 0.6, height: 1, type: 'Rack 42U', status: 'active', roomId: 'R1722382686121', tamanhoU: 42 },
];

const testChildItems = [
    { id: 'citem_001', label: 'SW-CORE-01', parentId: 'pitem_001', type: 'Switch', status: 'active', modelo: 'Catalyst 9300 48-port', tamanhoU: 1, posicaoU: 40, brand: 'Cisco' },
    { id: 'citem_002', label: 'SRV-WEB-01', parentId: 'pitem_001', type: 'Servidor', status: 'active', modelo: 'PowerEdge R740', tamanhoU: 2, posicaoU: 20, brand: 'Dell EMC' },
    { id: 'citem_003', label: 'DIO-01-A', parentId: 'pitem_002', type: 'Patch Panel', status: 'active', modelo: 'DIO 24 Fibras LC Duplex', tamanhoU: 1, posicaoU: 41, brand: 'Furukawa'},
    { id: 'citem_004', label: 'PDU-01-L', parentId: 'pitem_001', type: 'PDU', status: 'active', modelo: 'Liebert MPH2 Vertical PDU', tamanhoU: 0, posicaoU: 1, brand: 'Vertiv' }
];

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
    { id: 'model_c3850_24', name: 'Catalyst 3850 24-port', manufacturerId: 'man_cisco', tamanhoU: 1, portConfig: '24xRJ45;4xSFP+' },
    { id: 'model_c9500_32', name: 'Catalyst 9500 32-port 100G', manufacturerId: 'man_cisco', tamanhoU: 1, portConfig: '32xQSFP28' },
    { id: 'model_n9k_c93', name: 'Nexus 93180YC-EX', manufacturerId: 'man_cisco', tamanhoU: 1, portConfig: '48xSFP+;6xQSFP+' },
    { id: 'model_cisco_ncs2k6', name: 'NCS 2006 Chassis', manufacturerId: 'man_cisco', tamanhoU: 14, portConfig: '6xService_Slot;2xController_Slot' },
    { id: 'model_asr9k', name: 'ASR 9000 Series', manufacturerId: 'man_cisco', tamanhoU: 22, portConfig: '8xService_Slot;2xRSP_Slot' },
    { id: 'model_hw_ce6865', name: 'CloudEngine 6865', manufacturerId: 'man_huawei', tamanhoU: 1, portConfig: '48xSFP28;8xQSFP28' },
    { id: 'model_hw_ce12800', name: 'CloudEngine 12800', manufacturerId: 'man_huawei', tamanhoU: 16, portConfig: '8xService_Slot;4xSwitchFabric_Slot' },
    { id: 'model_ex4300', name: 'EX4300', manufacturerId: 'man_juniper', tamanhoU: 1, portConfig: '48xRJ45;4xQSFP+' },
    { id: 'model_juniper_mx960', name: 'MX960 Chassis', manufacturerId: 'man_juniper', tamanhoU: 21, portConfig: '12xService_Slot;2xRoutingEngine_Slot;3xSFB_Slot' },
    { id: 'model_a7050', name: '7050SX-64', manufacturerId: 'man_arista', tamanhoU: 1, portConfig: '48xSFP+;4xQSFP+' },
    { id: 'model_nokia_7750', name: '7750 Service Router', manufacturerId: 'man_nokia', tamanhoU: 14, portConfig: '12xService_Slot' },
    { id: 'model_ericsson_6000', name: 'Router 6000 Series', manufacturerId: 'man_ericsson', tamanhoU: 4, portConfig: '4xInterface_Module' },
    { id: 'model_ericsson_rtnxmc2', name: 'RTN XMC-2', manufacturerId: 'man_ericsson', tamanhoU: 2, portConfig: 'Multiple_RF_Ports' },
    { id: 'model_r740', name: 'PowerEdge R740', manufacturerId: 'man_dell', tamanhoU: 2, portConfig: '4xRJ45;2xSFP+;1xVGA;2xUSB;1xiDRAC' },
    { id: 'model_r640', name: 'PowerEdge R640', manufacturerId: 'man_dell', tamanhoU: 1, portConfig: '4xRJ45;2xSFP+;1xVGA;2xUSB;1xiDRAC' },
    { id: 'model_mx7000', name: 'PowerEdge MX7000', manufacturerId: 'man_dell', tamanhoU: 7, portConfig: '8xPSU_Slot;4xFAN_Slot;8xBlade_Slot' },
    { id: 'model_dl380g10', name: 'ProLiant DL380 Gen10', manufacturerId: 'man_hpe', tamanhoU: 2, portConfig: '4xRJ45;1xiLO' },
    { id: 'model_c7000', name: 'BladeSystem c7000', manufacturerId: 'man_hpe', tamanhoU: 10, portConfig: '10xFAN_Slot;6xPSU_Slot;16xBlade_Slot' },
    { id: 'model_l_pp24', name: 'Patch Panel 24 Portas Cat6', manufacturerId: 'man_legrand', tamanhoU: 1, portConfig: '24xRJ45_Keystone' },
    { id: 'model_l_pp48', name: 'Patch Panel 48 Portas Cat6', manufacturerId: 'man_legrand', tamanhoU: 2, portConfig: '48xRJ45_Keystone' },
    { id: 'model_f_dio24', name: 'DIO 24 Fibras LC Duplex', manufacturerId: 'man_furukawa', tamanhoU: 1, portConfig: '24xLC_Duplex' },
    { id: 'model_f_dio48', name: 'DIO 48 Fibras LC Duplex', manufacturerId: 'man_furukawa', tamanhoU: 2, portConfig: '48xLC_Duplex' },
    { id: 'model_panduit_netaccess', name: 'Net-Access Cabinet', manufacturerId: 'man_panduit', tamanhoU: 42, portConfig: 'Rack_Space' },
    { id: 'model_padtec_i6400g', name: 'LightPad i6400G', manufacturerId: 'man_padtec', tamanhoU: 14, portConfig: '16xService_Slot;2xController_Slot' },
    { id: 'model_tellabs_olt1150', name: 'OLT1150', manufacturerId: 'man_tellabs', tamanhoU: 8, portConfig: '14xPON_Card_Slot;2xUplink_Slot' },
    { id: 'model_v_pdu_v', name: 'Liebert MPH2 Vertical PDU', manufacturerId: 'man_vertiv', tamanhoU: 0, portConfig: '24xC13;6xC19' },
    { id: 'model_apc_srt5000', name: 'APC Smart-UPS SRT 5000VA', manufacturerId: 'man_schneider', tamanhoU: 3, portConfig: '8xTomada_20A' }
];

const essentialItemTypes = [
    { id: 'type_rack_default', name: 'Rack 42U', category: 'Gabinetes', defaultWidthM: 0.6, defaultHeightM: 1.2, iconName: 'Server', canHaveChildren: true, isResizable: false, status: 'active', isParent: true, defaultColor: '#3b82f6' },
    { id: 'type_rack_open', name: 'Rack Aberto', category: 'Gabinetes', defaultWidthM: 0.6, defaultHeightM: 0.6, iconName: 'Server', canHaveChildren: true, isResizable: false, status: 'active', isParent: true, defaultColor: '#60a5fa' },
    { id: 'type_ac_row', name: 'Ar Condicionado In-Row', category: 'Climatização', defaultWidthM: 0.3, defaultHeightM: 1.2, iconName: 'Snowflake', canHaveChildren: false, isResizable: true, status: 'active', isParent: true, defaultColor: '#34d399' },
    { id: 'type_qdf', name: 'QDF', category: 'Distribuição', defaultWidthM: 0.8, defaultHeightM: 2.2, iconName: 'Network', canHaveChildren: true, isResizable: false, status: 'active', isParent: true, defaultColor: '#f59e0b' },
    { id: 'type_ups', name: 'UPS/Nobreak', category: 'Energia', defaultWidthM: 0.6, defaultHeightM: 1.2, iconName: 'Power', canHaveChildren: false, isResizable: true, status: 'active', isParent: true, defaultColor: '#ef4444' },
    { id: 'type_roteador_borda', name: 'Roteador de Borda', category: 'Rede Core', defaultWidthM: 0.6, defaultHeightM: 1.2, iconName: 'Router', canHaveChildren: true, isResizable: false, status: 'active', isParent: true, defaultColor: '#8b5cf6' },
    { id: 'type_eqp_server', name: 'Servidor', category: 'Equipamentos', iconName: 'HardDrive', status: 'active', isParent: false, defaultWidthM: 0, defaultHeightM: 0, defaultColor: null },
    { id: 'type_eqp_switch', name: 'Switch', category: 'Equipamentos', iconName: 'Network', status: 'active', isParent: false, defaultWidthM: 0, defaultHeightM: 0, defaultColor: null },
    { id: 'type_eqp_patch', name: 'Patch Panel', category: 'Equipamentos', iconName: 'PanelTop', status: 'active', isParent: false, defaultWidthM: 0, defaultHeightM: 0, defaultColor: null },
    { id: 'type_eqp_storage', name: 'Storage Array', category: 'Equipamentos', iconName: 'Database', status: 'active', isParent: false, defaultWidthM: 0, defaultHeightM: 0, defaultColor: null },
    { id: 'type_eqp_blade', name: 'Servidor Blade', category: 'Equipamentos', iconName: 'Server', status: 'active', isParent: false, defaultWidthM: 0, defaultHeightM: 0, defaultColor: null },
    { id: 'type_eqp_roteador', name: 'Roteador', category: 'Equipamentos', iconName: 'Router', status: 'active', isParent: false, defaultWidthM: 0, defaultHeightM: 0, defaultColor: null },
];

const essentialPortTypes = [
    { id: 'port_rj45', name: 'RJ45', description: 'Conector de rede padrão para cabos UTP.', isDefault: true }, { id: 'port_sfp+', name: 'SFP+', description: 'Porta 10Gbps SFP.', isDefault: false },
    { id: 'port_lc_duplex', name: 'LC_Duplex', description: 'Conector duplo de fibra óptica LC.', isDefault: false }, { id: 'port_sc', name: 'SC', description: 'Conector de fibra óptica (Subscriber Connector).', isDefault: false },
    { id: 'port_qsfp+', name: 'QSFP+', description: 'Porta 40Gbps QSFP.', isDefault: false }, { id: 'port_sfp28', name: 'SFP28', description: 'Porta 25Gbps SFP.', isDefault: false },
    { id: 'port_qsfp28', name: 'QSFP28', description: 'Porta 100Gbps QSFP.', isDefault: false }, { id: 'port_idrac', name: 'iDRAC', description: 'Porta de gerenciamento Dell.', isDefault: false },
    { id: 'port_ilo', name: 'iLO', description: 'Porta de gerenciamento HPE.', isDefault: false }, { id: 'port_rj45_keystone', name: 'RJ45_Keystone', description: 'Conector fêmea para patch panels.', isDefault: false },
    { id: 'port_tomada_20a', name: 'Tomada_20A', description: 'Tomada de energia padrão NBR 14136 de 20A.', isDefault: false }, { id: 'port_c13', name: 'C13', description: 'Conector de energia padrão para PDUs.', isDefault: false },
    { id: 'port_c19', name: 'C19', description: 'Conector de energia de alta corrente para PDUs.', isDefault: false }, { id: 'port_service_slot', name: 'Service_Slot', description: 'Slot genérico para placa de serviço.', isDefault: false },
    { id: 'port_rsp_slot', name: 'RSP_Slot', description: 'Slot para processador de roteamento.', isDefault: false }, { id: 'port_controller_slot', name: 'Controller_Slot', description: 'Slot para placa controladora.', isDefault: false },
    { id: 'port_switchfabric_slot', name: 'SwitchFabric_Slot', description: 'Slot para malha de comutação.', isDefault: false },
    { id: 'port_psu_slot', name: 'PSU_Slot', description: 'Slot para fonte de alimentação.', isDefault: false }, { id: 'port_fan_slot', name: 'FAN_Slot', description: 'Slot para módulo de ventilação.', isDefault: false },
    { id: 'port_blade_slot', name: 'Blade_Slot', description: 'Slot para servidor blade.', isDefault: false },
    { id: 'port_routingengine_slot', name: 'RoutingEngine_Slot', description: 'Slot para motor de roteamento Juniper.', isDefault: false },
    { id: 'port_sfb_slot', name: 'SFB_Slot', description: 'Slot para Switch Fabric Board Juniper.', isDefault: false },
    { id: 'port_interface_module', name: 'Interface_Module', description: 'Módulo de interface genérico.', isDefault: false },
    { id: 'port_multiple_rf_ports', name: 'Multiple_RF_Ports', description: 'Múltiplas portas de rádio frequência.', isDefault: false },
    { id: 'port_rack_space', name: 'Rack_Space', description: 'Espaço utilizável dentro de um rack.', isDefault: false },
    { id: 'port_pon_card_slot', name: 'PON_Card_Slot', description: 'Slot para placa de rede óptica passiva.', isDefault: false },
    { id: 'port_uplink_slot', name: 'Uplink_Slot', description: 'Slot para placa de uplink.', isDefault: false },
    { id: 'port_vga', name: 'VGA', description: 'Conector de vídeo analógico.', isDefault: false },
    { id: 'port_usb', name: 'USB', description: 'Porta USB para periféricos.', isDefault: false },
    { id: 'port_console', name: 'Console', description: 'Porta serial de console para gerenciamento.', isDefault: false },
];

const essentialConnectionTypes = [
    { id: 'conn_utp', name: 'Dados UTP', description: 'Conexão de dados via cabo de par trançado.', isDefault: true },
    { id: 'conn_fibra', name: 'Fibra Óptica', description: 'Conexão de dados via fibra óptica monomodo ou multimodo.', isDefault: true },
    { id: 'conn_power_ac', name: 'Energia AC', description: 'Cabo de alimentação de corrente alternada.', isDefault: false },
    { id: 'conn_power_dc', name: 'Energia DC', description: 'Cabo de alimentação de corrente contínua (-48V).', isDefault: false },
    { id: 'conn_dac', name: 'Direct Attach Copper (DAC)', description: 'Cabo de cobre de alta velocidade para conexões curtas.', isDefault: false },
];

/**
 * Populates the database with essential configuration data using MERGE for idempotency.
 * The order of operations is crucial to respect foreign key constraints.
 */
export async function populateEssentialData() {
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        console.log("Iniciando a população de dados essenciais...");

        // 1. Entidades sem dependências diretas (ou cujas dependências são controladas internamente)
        for (const man of essentialManufacturers) {
            await new sql.Request(transaction).input('id', man.id).input('name', man.name)
                .query(`MERGE INTO Manufacturers AS T USING (SELECT @id AS id, @name AS name) AS S ON T.id = S.id WHEN MATCHED THEN UPDATE SET T.name = S.name WHEN NOT MATCHED THEN INSERT (id, name, isTestData) VALUES (S.id, S.name, 0);`);
        }
        for (const ptype of essentialPortTypes) {
            await new sql.Request(transaction).input('id', ptype.id).input('name', ptype.name).input('description', ptype.description).input('isDefault', ptype.isDefault)
                .query(`MERGE INTO PortTypes AS T USING(SELECT @id, @name, @description, @isDefault) AS S(id,name,description,isDefault) ON T.id=S.id WHEN MATCHED THEN UPDATE SET T.name=S.name,T.description=S.description,T.isDefault=S.isDefault WHEN NOT MATCHED THEN INSERT(id,name,description,isDefault)VALUES(S.id,S.name,S.description,S.isDefault);`);
        }
        for (const ctype of essentialConnectionTypes) {
            await new sql.Request(transaction).input('id', ctype.id).input('name', ctype.name).input('description', ctype.description).input('isDefault', ctype.isDefault)
                .query(`MERGE INTO ConnectionTypes AS T USING(SELECT @id,@name,@description,@isDefault) AS S(id,name,description,isDefault) ON T.id=S.id WHEN MATCHED THEN UPDATE SET T.name=S.name,T.description=S.description,T.isDefault=S.isDefault WHEN NOT MATCHED THEN INSERT(id,name,description,isDefault)VALUES(S.id,S.name,S.description,S.isDefault);`);
        }
        for (const itype of essentialItemTypes.filter(it => it.isParent)) {
            await new sql.Request(transaction).input('id', itype.id).input('name', itype.name).input('category', itype.category).input('defaultWidthM', itype.defaultWidthM).input('defaultHeightM', itype.defaultHeightM).input('iconName', itype.iconName).input('canHaveChildren', itype.canHaveChildren).input('isResizable', itype.isResizable).input('status', itype.status).input('defaultColor', itype.defaultColor)
                .query(`MERGE INTO ItemTypes AS T USING(SELECT @id,@name,@category,@defaultWidthM,@defaultHeightM,@iconName,@canHaveChildren,@isResizable,@status,@defaultColor) AS S(id,name,category,defaultWidthM,defaultHeightM,iconName,canHaveChildren,isResizable,status,defaultColor) ON T.id=S.id WHEN MATCHED THEN UPDATE SET T.name=S.name,T.category=S.category,T.defaultWidthM=S.defaultWidthM,T.defaultHeightM=S.defaultHeightM,T.iconName=S.iconName,T.canHaveChildren=S.canHaveChildren,T.isResizable=S.isResizable,T.status=S.status,T.defaultColor=S.defaultColor WHEN NOT MATCHED THEN INSERT (id,name,category,defaultWidthM,defaultHeightM,iconName,canHaveChildren,isResizable,status,isTestData,defaultColor) VALUES(S.id,S.name,S.category,S.defaultWidthM,S.defaultHeightM,S.iconName,S.canHaveChildren,S.isResizable,S.status,0,S.defaultColor);`);
        }
        for (const itype of essentialItemTypes.filter(it => !it.isParent)) {
            await new sql.Request(transaction).input('id', itype.id).input('name', itype.name).input('category', itype.category).input('defaultWidthM', itype.defaultWidthM).input('defaultHeightM', itype.defaultHeightM).input('iconName', itype.iconName).input('status', itype.status).input('defaultColor', itype.defaultColor)
                .query(`MERGE INTO ItemTypesEqp AS T USING(SELECT @id,@name,@category,@defaultWidthM,@defaultHeightM,@iconName,@status,@defaultColor) AS S(id,name,category,defaultWidthM,defaultHeightM,iconName,status,defaultColor) ON T.id=S.id WHEN MATCHED THEN UPDATE SET T.name=S.name,T.category=S.category,T.defaultWidthM=S.defaultWidthM,T.defaultHeightM=S.defaultHeightM,T.iconName=S.iconName,T.status=S.status,T.defaultColor=S.defaultColor WHEN NOT MATCHED THEN INSERT (id,name,category,defaultWidthM,defaultHeightM,iconName,status,isTestData,defaultColor) VALUES(S.id,S.name,S.category,S.defaultWidthM,S.defaultHeightM,S.iconName,S.status,0,S.defaultColor);`);
        }
        
        // 2. Models, que dependem de Manufacturers
        for (const model of essentialModels) {
            await new sql.Request(transaction).input('id', model.id).input('name', model.name).input('manufacturerId', model.manufacturerId).input('portConfig', model.portConfig).input('tamanhoU', model.tamanhoU)
                .query(`MERGE INTO Models AS T USING (SELECT @id, @name, @manufacturerId, @portConfig, @tamanhoU) AS S(id,name,manufacturerId,portConfig,tamanhoU) ON T.id=S.id WHEN MATCHED THEN UPDATE SET T.name=S.name,T.manufacturerId=S.manufacturerId,T.portConfig=S.portConfig,T.tamanhoU=S.tamanhoU WHEN NOT MATCHED THEN INSERT (id,name,manufacturerId,portConfig,tamanhoU,isTestData) VALUES(S.id,S.name,S.manufacturerId,S.portConfig,S.tamanhoU,0);`);
        }

        await transaction.commit();
        console.log("Banco de dados populado com dados essenciais com sucesso.");
    } catch (error) {
        await transaction.rollback();
        console.error("Erro detalhado ao popular banco de dados com dados essenciais:", error);
        throw new Error("Falha ao popular dados essenciais. Verifique os logs do servidor.");
    }
}

/**
 * Cleans ALL data marked as 'isTestData' from the database.
 * The order is reversed from creation to respect foreign key constraints.
 */
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
        console.error("Erro ao limpar dados de teste. A transação foi revertida.", error);
        throw new Error("Falha ao limpar dados de teste.");
    }
}

export async function populateBaseEntities() {
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        for (const user of testUsers) {
             await new sql.Request(transaction)
                .input('id', user.id).input('email', user.email).input('displayName', user.displayName).input('photoURL', user.photoURL).input('role', user.role).input('permissions', JSON.stringify(user.permissions)).input('accessibleBuildingIds', JSON.stringify(user.accessibleBuildingIds)).input('lastLoginAt', new Date(user.lastLoginAt)).input('preferences', JSON.stringify(user.preferences))
                .query(`
                    MERGE INTO Users AS T
                    USING (SELECT @id as id) AS S
                    ON T.id = S.id
                    WHEN MATCHED THEN
                        UPDATE SET email = @email, displayName = @displayName, photoURL = @photoURL, role = @role, permissions = @permissions, accessibleBuildingIds = @accessibleBuildingIds, lastLoginAt = @lastLoginAt, preferences = @preferences
                    WHEN NOT MATCHED THEN
                        INSERT (id, email, displayName, photoURL, role, permissions, accessibleBuildingIds, lastLoginAt, preferences, isTestData)
                        VALUES (@id, @email, @displayName, @photoURL, @role, @permissions, @accessibleBuildingIds, @lastLoginAt, @preferences, 1);
                `);
        }
        for (const building of testBuildings) {
            await new sql.Request(transaction)
                .input('id', building.id).input('name', building.name).input('address', building.address)
                .query(`
                    MERGE INTO Buildings AS T
                    USING (SELECT @id as id) AS S
                    ON T.id = S.id
                    WHEN MATCHED THEN
                        UPDATE SET name = @name, address = @address
                    WHEN NOT MATCHED THEN
                        INSERT (id, name, address, isTestData)
                        VALUES (@id, @name, @address, 1);
                `);
        }
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
        for (const room of testRooms) {
            await new sql.Request(transaction)
                .input('id', room.id).input('name', room.name).input('buildingId', room.buildingId)
                .input('largura', room.largura).input('widthM', room.widthM).input('tileWidthCm', room.tileWidthCm)
                .input('tileHeightCm', room.tileHeightCm).input('xAxisNaming', room.xAxisNaming).input('yAxisNaming', room.yAxisNaming)
                .query(`
                    MERGE INTO Rooms AS T
                    USING (SELECT @id as id) AS S
                    ON T.id = S.id
                    WHEN MATCHED THEN
                        UPDATE SET name = @name, buildingId = @buildingId, largura = @largura, widthM = @widthM, tileWidthCm = @tileWidthCm, tileHeightCm = @tileHeightCm, xAxisNaming = @xAxisNaming, yAxisNaming = @yAxisNaming
                    WHEN NOT MATCHED THEN
                        INSERT (id, name, buildingId, largura, widthM, tileWidthCm, tileHeightCm, xAxisNaming, yAxisNaming, isTestData)
                        VALUES (@id, @name, @buildingId, @largura, @widthM, @tileWidthCm, @tileHeightCm, @xAxisNaming, @yAxisNaming, 1);
                `);
        }
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
        for (const item of testParentItems) {
            await new sql.Request(transaction)
                .input('id', item.id).input('label', item.label).input('x', item.x).input('y', item.y)
                .input('width', item.width).input('height', item.height).input('type', item.type)
                .input('status', item.status).input('roomId', item.roomId).input('tamanhoU', item.tamanhoU)
                .query(`
                    MERGE INTO ParentItems AS T
                    USING (SELECT @id as id) AS S
                    ON T.id = S.id
                    WHEN MATCHED THEN
                        UPDATE SET label = @label, x = @x, y = @y, width = @width, height = @height, type = @type, status = @status, roomId = @roomId, tamanhoU = @tamanhoU
                    WHEN NOT MATCHED THEN
                        INSERT (id, label, x, y, width, height, type, status, roomId, tamanhoU, isTestData)
                        VALUES (@id, @label, @x, @y, @width, @height, @type, @status, @roomId, @tamanhoU, 1);
                `);
        }
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
        for (const item of testChildItems) {
            await new sql.Request(transaction)
                .input('id', item.id).input('label', item.label).input('parentId', item.parentId).input('type', item.type)
                .input('status', item.status).input('modelo', item.modelo).input('tamanhoU', item.tamanhoU)
                .input('posicaoU', item.posicaoU).input('brand', item.brand)
                .query(`
                    MERGE INTO ChildItems AS T
                    USING (SELECT @id as id) AS S
                    ON T.id = S.id
                    WHEN MATCHED THEN
                        UPDATE SET label = @label, parentId = @parentId, type = @type, status = @status, modelo = @modelo, tamanhoU = @tamanhoU, posicaoU = @posicaoU, brand = @brand
                    WHEN NOT MATCHED THEN
                        INSERT (id, label, parentId, type, status, modelo, tamanhoU, posicaoU, brand, isTestData)
                        VALUES (@id, @label, @parentId, @type, @status, @modelo, @tamanhoU, @posicaoU, @brand, 1);
                `);
        }
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
        // Limpamos apenas as portas dos itens de teste para evitar duplicatas ao re-executar
        await new sql.Request(transaction).query(`DELETE FROM EquipmentPorts WHERE childItemId IN (SELECT id FROM ChildItems WHERE isTestData = 1)`);

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
                        await new sql.Request(transaction)
                            .input('id', portId).input('childItemId', child.id).input('portTypeId', portTypeId).input('label', portLabel)
                            .query(`
                                MERGE INTO EquipmentPorts AS T
                                USING (SELECT @id as id) as S
                                ON T.id = S.id
                                WHEN NOT MATCHED THEN
                                    INSERT (id, childItemId, portTypeId, label, status)
                                    VALUES (@id, @childItemId, @portTypeId, @label, 'down');
                            `);
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
