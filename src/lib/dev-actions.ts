

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
    { id: 'item_1722382897042', label: 'RACK-A01', x: 2, y: 2, width: 0.6, height: 1, type: 'Rack 42U', status: 'active', roomId: 'R1722382686121', tamanhoU: 42 },
];

const testChildItems = [
    { id: 'citem_001', label: 'SW-CORE-01', parentId: 'item_1722382897042', type: 'Switch', status: 'active', modelo: 'Catalyst 9300', tamanhoU: 1, posicaoU: 40, brand: 'Cisco' },
    { id: 'citem_002', label: 'SRV-WEB-01', parentId: 'item_1722382897042', type: 'Servidor', status: 'active', modelo: 'PowerEdge R740', tamanhoU: 2, posicaoU: 20, brand: 'Dell EMC' },
];

// --- DADOS ESSENCIAIS (JOIA RARA DO PROJETO) ---

const essentialManufacturers = [
    { id: 'man_cisco', name: 'Cisco' },
    { id: 'man_dell', name: 'Dell EMC' },
    { id: 'man_hpe', name: 'HPE' },
    { id: 'man_huawei', name: 'Huawei' },
    { id: 'man_vertiv', name: 'Vertiv' },
    { id: 'man_schneider', name: 'Schneider Electric (APC)' },
    { id: 'man_juniper', name: 'Juniper Networks' },
    { id: 'man_arista', name: 'Arista Networks' },
    { id: 'man_legrand', name: 'Legrand' },
    { id: 'man_furukawa', name: 'Furukawa' },
    { id: 'man_nokia', name: 'Nokia' },
    { id: 'man_ericsson', name: 'Ericsson' },
    { id: 'man_panduit', name: 'Panduit' },
    { id: 'man_padtec', name: 'Padtec' },
    { id: 'man_tellabs', name: 'Tellabs' },
];

const essentialModels = [
    // --- Switches & Routers (Rede) ---
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
    
    // --- Servidores ---
    { id: 'model_r740', name: 'PowerEdge R740', manufacturerId: 'man_dell', tamanhoU: 2, portConfig: '4xRJ45;2xSFP+;1xVGA;2xUSB;1xiDRAC' },
    { id: 'model_r640', name: 'PowerEdge R640', manufacturerId: 'man_dell', tamanhoU: 1, portConfig: '4xRJ45;2xSFP+;1xVGA;2xUSB;1xiDRAC' },
    { id: 'model_mx7000', name: 'PowerEdge MX7000', manufacturerId: 'man_dell', tamanhoU: 7, portConfig: '8xPSU_Slot;4xFAN_Slot;8xBlade_Slot' },
    { id: 'model_dl380g10', name: 'ProLiant DL380 Gen10', manufacturerId: 'man_hpe', tamanhoU: 2, portConfig: '4xRJ45;1xiLO' },
    { id: 'model_c7000', name: 'BladeSystem c7000', manufacturerId: 'man_hpe', tamanhoU: 10, portConfig: '10xFAN_Slot;6xPSU_Slot;16xBlade_Slot' },
    
    // --- Infraestrutura Física (Patch Panels, Racks) ---
    { id: 'model_l_pp24', name: 'Patch Panel 24 Portas Cat6', manufacturerId: 'man_legrand', tamanhoU: 1, portConfig: '24xRJ45_Keystone' },
    { id: 'model_l_pp48', name: 'Patch Panel 48 Portas Cat6', manufacturerId: 'man_legrand', tamanhoU: 2, portConfig: '48xRJ45_Keystone' },
    { id: 'model_f_dio24', name: 'DIO 24 Fibras LC Duplex', manufacturerId: 'man_furukawa', tamanhoU: 1, portConfig: '24xLC_Duplex' },
    { id: 'model_f_dio48', name: 'DIO 48 Fibras LC Duplex', manufacturerId: 'man_furukawa', tamanhoU: 2, portConfig: '48xLC_Duplex' },
    { id: 'model_panduit_netaccess', name: 'Net-Access Cabinet', manufacturerId: 'man_panduit', tamanhoU: 42, portConfig: 'Rack_Space' },

    // --- Equipamentos Ópticos e de Telecom ---
    { id: 'model_padtec_i6400g', name: 'LightPad i6400G', manufacturerId: 'man_padtec', tamanhoU: 14, portConfig: '16xService_Slot;2xController_Slot' },
    { id: 'model_tellabs_olt1150', name: 'OLT1150', manufacturerId: 'man_tellabs', tamanhoU: 8, portConfig: '14xPON_Card_Slot;2xUplink_Slot' },
    
    // --- Energia (PDUs, UPS) ---
    { id: 'model_v_pdu_v', name: 'Liebert MPH2 Vertical PDU', manufacturerId: 'man_vertiv', tamanhoU: 0, portConfig: '24xC13;6xC19' },
    { id: 'model_apc_srt5000', name: 'APC Smart-UPS SRT 5000VA', manufacturerId: 'man_schneider', tamanhoU: 3, portConfig: '8xTomada_20A' }
];

const essentialItemTypes = [
    // Tipos de Itens da Planta Baixa (Pais)
    { id: 'type_rack_default', name: 'Rack 42U', category: 'Gabinetes', defaultWidthM: 0.6, defaultHeightM: 1.2, iconName: 'Server', canHaveChildren: true, isResizable: false, status: 'active', isParent: true, defaultColor: '#3b82f6' },
    { id: 'type_rack_open', name: 'Rack Aberto', category: 'Gabinetes', defaultWidthM: 0.6, defaultHeightM: 0.6, iconName: 'Server', canHaveChildren: true, isResizable: false, status: 'active', isParent: true, defaultColor: '#60a5fa' },
    { id: 'type_ac_row', name: 'Ar Condicionado In-Row', category: 'Climatização', defaultWidthM: 0.3, defaultHeightM: 1.2, iconName: 'Snowflake', canHaveChildren: false, isResizable: true, status: 'active', isParent: true, defaultColor: '#34d399' },
    { id: 'type_qdf', name: 'QDF', category: 'Distribuição', defaultWidthM: 0.8, defaultHeightM: 2.2, iconName: 'Network', canHaveChildren: true, isResizable: false, status: 'active', isParent: true, defaultColor: '#f59e0b' },
    { id: 'type_ups', name: 'UPS/Nobreak', category: 'Energia', defaultWidthM: 0.6, defaultHeightM: 1.2, iconName: 'Power', canHaveChildren: false, isResizable: true, status: 'active', isParent: true, defaultColor: '#ef4444' },
    { id: 'type_roteador_borda', name: 'Roteador de Borda', category: 'Rede Core', defaultWidthM: 0.6, defaultHeightM: 1.2, iconName: 'Router', canHaveChildren: true, isResizable: false, status: 'active', isParent: true, defaultColor: '#8b5cf6' },

    // Tipos de Equipamentos Aninhados (Filhos)
    { id: 'type_eqp_server', name: 'Servidor', category: 'Equipamentos', iconName: 'HardDrive', status: 'active', isParent: false, defaultWidthM: 0, defaultHeightM: 0, defaultColor: null },
    { id: 'type_eqp_switch', name: 'Switch', category: 'Equipamentos', iconName: 'Network', status: 'active', isParent: false, defaultWidthM: 0, defaultHeightM: 0, defaultColor: null },
    { id: 'type_eqp_patch', name: 'Patch Panel', category: 'Equipamentos', iconName: 'PanelTop', status: 'active', isParent: false, defaultWidthM: 0, defaultHeightM: 0, defaultColor: null },
    { id: 'type_eqp_storage', name: 'Storage Array', category: 'Equipamentos', iconName: 'Database', status: 'active', isParent: false, defaultWidthM: 0, defaultHeightM: 0, defaultColor: null },
    { id: 'type_eqp_blade', name: 'Servidor Blade', category: 'Equipamentos', iconName: 'Server', status: 'active', isParent: false, defaultWidthM: 0, defaultHeightM: 0, defaultColor: null },
    { id: 'type_eqp_roteador', name: 'Roteador', category: 'Equipamentos', iconName: 'Router', status: 'active', isParent: false, defaultWidthM: 0, defaultHeightM: 0, defaultColor: null },
];

const essentialPortTypes = [
    { id: 'port_rj45', name: 'RJ45', description: 'Conector de rede padrão para cabos UTP.', isDefault: true },
    { id: 'port_sfp+', name: 'SFP+', description: 'Porta 10Gbps SFP.', isDefault: false },
    { id: 'port_lc_duplex', name: 'LC_Duplex', description: 'Conector duplo de fibra óptica LC.', isDefault: false },
    { id: 'port_sc', name: 'SC', description: 'Conector de fibra óptica (Subscriber Connector).', isDefault: false },
    { id: 'port_qsfp+', name: 'QSFP+', description: 'Porta 40Gbps QSFP.', isDefault: false },
    { id: 'port_sfp28', name: 'SFP28', description: 'Porta 25Gbps SFP.', isDefault: false },
    { id: 'port_qsfp28', name: 'QSFP28', description: 'Porta 100Gbps QSFP.', isDefault: false },
    { id: 'port_idrac', name: 'iDRAC', description: 'Porta de gerenciamento Dell.', isDefault: false },
    { id: 'port_ilo', name: 'iLO', description: 'Porta de gerenciamento HPE.', isDefault: false },
    { id: 'port_rj45_keystone', name: 'RJ45_Keystone', description: 'Conector fêmea para patch panels.', isDefault: false },
    { id: 'port_tomada_20a', name: 'Tomada_20A', description: 'Tomada de energia padrão NBR 14136 de 20A.', isDefault: false },
    { id: 'port_c13', name: 'C13', description: 'Conector de energia padrão para PDUs.', isDefault: false },
    { id: 'port_c19', name: 'C19', description: 'Conector de energia de alta corrente para PDUs.', isDefault: false },
    { id: 'port_service_slot', name: 'Service_Slot', description: 'Slot genérico para placa de serviço.', isDefault: false },
    { id: 'port_rsp_slot', name: 'RSP_Slot', description: 'Slot para processador de roteamento.', isDefault: false },
    { id: 'port_controller_slot', name: 'Controller_Slot', description: 'Slot para placa controladora.', isDefault: false },
    { id: 'port_switchfabric_slot', name: 'SwitchFabric_Slot', description: 'Slot para malha de comutação.', isDefault: false },
    { id: 'port_psu_slot', name: 'PSU_Slot', description: 'Slot para fonte de alimentação.', isDefault: false },
    { id: 'port_fan_slot', name: 'FAN_Slot', description: 'Slot para módulo de ventilação.', isDefault: false },
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
 * Popula o banco de dados com dados essenciais de configuração.
 * Utiliza a query MERGE para inserir ou atualizar registros, garantindo a idempotência.
 */
export async function populateEssentialData() {
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        console.log("Iniciando a população de dados essenciais...");

        // Fabricantes
        for (const man of essentialManufacturers) {
            const request = new sql.Request(transaction);
            await request
                .input('id', sql.NVarChar, man.id)
                .input('name', sql.NVarChar, man.name)
                .query(`
                    MERGE INTO Manufacturers AS Target
                    USING (SELECT @id AS id, @name AS name) AS Source
                    ON (Target.id = Source.id)
                    WHEN MATCHED THEN
                        UPDATE SET Target.name = Source.name
                    WHEN NOT MATCHED THEN
                        INSERT (id, name, isTestData) VALUES (Source.id, Source.name, 0);
                `);
        }

        // Modelos
        for (const model of essentialModels) {
            const request = new sql.Request(transaction);
            await request
                .input('id', sql.NVarChar, model.id)
                .input('name', sql.NVarChar, model.name)
                .input('manufacturerId', sql.NVarChar, model.manufacturerId)
                .input('portConfig', sql.NVarChar, model.portConfig)
                .input('tamanhoU', sql.Int, model.tamanhoU)
                .query(`
                    MERGE INTO Models AS Target
                    USING (SELECT @id, @name, @manufacturerId, @portConfig, @tamanhoU) AS Source (id, name, manufacturerId, portConfig, tamanhoU)
                    ON (Target.id = Source.id)
                    WHEN MATCHED THEN
                        UPDATE SET Target.name = Source.name, Target.manufacturerId = Source.manufacturerId, Target.portConfig = Source.portConfig, Target.tamanhoU = Source.tamanhoU
                    WHEN NOT MATCHED THEN
                        INSERT (id, name, manufacturerId, portConfig, tamanhoU, isTestData) VALUES (Source.id, Source.name, Source.manufacturerId, Source.portConfig, Source.tamanhoU, 0);
                `);
        }

        // Tipos de Item (Pais)
        const parentItemTypes = essentialItemTypes.filter(it => it.isParent);
        for (const itype of parentItemTypes) {
            const request = new sql.Request(transaction);
            await request
                .input('id', sql.NVarChar, itype.id)
                .input('name', sql.NVarChar, itype.name)
                .input('category', sql.NVarChar, itype.category)
                .input('defaultWidthM', sql.Float, itype.defaultWidthM)
                .input('defaultHeightM', sql.Float, itype.defaultHeightM)
                .input('iconName', sql.NVarChar, itype.iconName)
                .input('canHaveChildren', sql.Bit, itype.canHaveChildren)
                .input('isResizable', sql.Bit, itype.isResizable)
                .input('status', sql.NVarChar, itype.status)
                .input('defaultColor', sql.NVarChar, itype.defaultColor)
                .query(`
                    MERGE INTO ItemTypes AS Target
                    USING (SELECT @id, @name, @category, @defaultWidthM, @defaultHeightM, @iconName, @canHaveChildren, @isResizable, @status, @defaultColor) 
                           AS Source (id, name, category, defaultWidthM, defaultHeightM, iconName, canHaveChildren, isResizable, status, defaultColor)
                    ON (Target.id = Source.id)
                    WHEN MATCHED THEN
                        UPDATE SET Target.name = Source.name, Target.category = Source.category, Target.defaultWidthM = Source.defaultWidthM, Target.defaultHeightM = Source.defaultHeightM, Target.iconName = Source.iconName, Target.canHaveChildren = Source.canHaveChildren, Target.isResizable = Source.isResizable, Target.status = Source.status, Target.defaultColor = Source.defaultColor
                    WHEN NOT MATCHED THEN
                        INSERT (id, name, category, defaultWidthM, defaultHeightM, iconName, canHaveChildren, isResizable, status, isTestData, defaultColor) 
                        VALUES (Source.id, Source.name, Source.category, Source.defaultWidthM, Source.defaultHeightM, Source.iconName, Source.canHaveChildren, Source.isResizable, Source.status, 0, Source.defaultColor);
                `);
        }

        // Tipos de Item (Filhos)
        const childItemTypes = essentialItemTypes.filter(it => !it.isParent);
         for (const itype of childItemTypes) {
            const request = new sql.Request(transaction);
            await request
                .input('id', sql.NVarChar, itype.id)
                .input('name', sql.NVarChar, itype.name)
                .input('category', sql.NVarChar, itype.category)
                .input('defaultWidthM', sql.Float, itype.defaultWidthM)
                .input('defaultHeightM', sql.Float, itype.defaultHeightM)
                .input('iconName', sql.NVarChar, itype.iconName)
                .input('status', sql.NVarChar, itype.status)
                .input('defaultColor', sql.NVarChar, itype.defaultColor)
                .query(`
                    MERGE INTO ItemTypesEqp AS Target
                    USING (SELECT @id, @name, @category, @defaultWidthM, @defaultHeightM, @iconName, @status, @defaultColor) 
                           AS Source (id, name, category, defaultWidthM, defaultHeightM, iconName, status, defaultColor)
                    ON (Target.id = Source.id)
                    WHEN MATCHED THEN
                        UPDATE SET Target.name = Source.name, Target.category = Source.category, Target.defaultWidthM = Source.defaultWidthM, Target.defaultHeightM = Source.defaultHeightM, Target.iconName = Source.iconName, Target.status = Source.status, Target.defaultColor = Source.defaultColor
                    WHEN NOT MATCHED THEN
                        INSERT (id, name, category, defaultWidthM, defaultHeightM, iconName, status, isTestData, defaultColor) 
                        VALUES (Source.id, Source.name, Source.category, Source.defaultWidthM, Source.defaultHeightM, Source.iconName, Source.status, 0, Source.defaultColor);
                `);
        }

        // Tipos de Porta
        for (const ptype of essentialPortTypes) {
            const request = new sql.Request(transaction);
            await request
                .input('id', sql.NVarChar, ptype.id)
                .input('name', sql.NVarChar, ptype.name)
                .input('description', sql.NVarChar, ptype.description)
                .input('isDefault', sql.Bit, ptype.isDefault)
                .query(`
                    MERGE INTO PortTypes AS Target
                    USING (SELECT @id, @name, @description, @isDefault) AS Source(id, name, description, isDefault)
                    ON (Target.id = Source.id)
                    WHEN MATCHED THEN
                        UPDATE SET Target.name = Source.name, Target.description = Source.description, Target.isDefault = Source.isDefault
                    WHEN NOT MATCHED THEN
                        INSERT (id, name, description, isDefault) VALUES (Source.id, Source.name, Source.description, Source.isDefault);
                `);
        }
        
        // Tipos de Conexão
        for (const ctype of essentialConnectionTypes) {
            const request = new sql.Request(transaction);
            await request
                .input('id', sql.NVarChar, ctype.id)
                .input('name', sql.NVarChar, ctype.name)
                .input('description', sql.NVarChar, ctype.description)
                .input('isDefault', sql.Bit, ctype.isDefault)
                .query(`
                    MERGE INTO ConnectionTypes AS Target
                    USING (SELECT @id, @name, @description, @isDefault) AS Source(id, name, description, isDefault)
                    ON (Target.id = Source.id)
                    WHEN MATCHED THEN
                        UPDATE SET Target.name = Source.name, Target.description = Source.description, Target.isDefault = Source.isDefault
                    WHEN NOT MATCHED THEN
                        INSERT (id, name, description, isDefault) VALUES (Source.id, Source.name, Source.description, Source.isDefault);
                `);
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
 * Popula o banco de dados com dados de teste. Limpa os dados de teste antigos primeiro.
 */
export async function populateTestData() {
    
    await cleanTestData(); // Limpa dados de teste anteriores
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    
    try {
        await transaction.begin();
        console.log("Iniciando a inserção de dados de teste...");

        // Inserção explícita para cada tabela
        for(const user of testUsers) {
            await new sql.Request(transaction)
                .input('id', sql.NVarChar, user.id)
                .input('email', sql.NVarChar, user.email)
                .input('displayName', sql.NVarChar, user.displayName)
                .input('photoURL', sql.NVarChar, user.photoURL)
                .input('role', sql.NVarChar, user.role)
                .input('permissions', sql.NVarChar, JSON.stringify(user.permissions))
                .input('accessibleBuildingIds', sql.NVarChar, JSON.stringify(user.accessibleBuildingIds))
                .input('lastLoginAt', sql.DateTime2, new Date(user.lastLoginAt))
                .input('preferences', sql.NVarChar, JSON.stringify(user.preferences))
                .query(`
                    INSERT INTO Users (id, email, displayName, photoURL, role, permissions, accessibleBuildingIds, lastLoginAt, preferences, isTestData)
                    VALUES (@id, @email, @displayName, @photoURL, @role, @permissions, @accessibleBuildingIds, @lastLoginAt, @preferences, 1)
                `);
        }

        for(const building of testBuildings) {
             await new sql.Request(transaction)
                .input('id', sql.NVarChar, building.id)
                .input('name', sql.NVarChar, building.name)
                .input('address', sql.NVarChar, building.address)
                .query(`
                    INSERT INTO Buildings (id, name, address, isTestData)
                    VALUES (@id, @name, @address, 1)
                `);
        }
        for(const room of testRooms) {
            await new sql.Request(transaction)
                .input('id', sql.NVarChar, room.id)
                .input('name', sql.NVarChar, room.name)
                .input('buildingId', sql.NVarChar, room.buildingId)
                .input('largura', sql.Float, room.largura)
                .input('widthM', sql.Float, room.widthM)
                .input('tileWidthCm', sql.Float, room.tileWidthCm)
                .input('tileHeightCm', sql.Float, room.tileHeightCm)
                .input('xAxisNaming', sql.NVarChar, room.xAxisNaming)
                .input('yAxisNaming', sql.NVarChar, room.yAxisNaming)
                .query(`
                    INSERT INTO Rooms (id, name, buildingId, largura, widthM, tileWidthCm, tileHeightCm, xAxisNaming, yAxisNaming, isTestData)
                    VALUES (@id, @name, @buildingId, @largura, @widthM, @tileWidthCm, @tileHeightCm, @xAxisNaming, @yAxisNaming, 1)
                `);
        }

        for(const item of testParentItems) {
            await new sql.Request(transaction)
                .input('id', sql.NVarChar, item.id)
                .input('label', sql.NVarChar, item.label)
                .input('x', sql.Int, item.x)
                .input('y', sql.Int, item.y)
                .input('width', sql.Float, item.width)
                .input('height', sql.Float, item.height)
                .input('type', sql.NVarChar, item.type)
                .input('status', sql.NVarChar, item.status)
                .input('roomId', sql.NVarChar, item.roomId)
                .input('tamanhoU', sql.Int, item.tamanhoU)
                .query(`
                    INSERT INTO ParentItems (id, label, x, y, width, height, type, status, roomId, tamanhoU, isTestData)
                    VALUES (@id, @label, @x, @y, @width, @height, @type, @status, @roomId, @tamanhoU, 1)
                `);
        }

        for(const item of testChildItems) {
            await new sql.Request(transaction)
                .input('id', sql.NVarChar, item.id)
                .input('label', sql.NVarChar, item.label)
                .input('parentId', sql.NVarChar, item.parentId)
                .input('type', sql.NVarChar, item.type)
                .input('status', sql.NVarChar, item.status)
                .input('modelo', sql.NVarChar, item.modelo)
                .input('tamanhoU', sql.Int, item.tamanhoU)
                .input('posicaoU', sql.Int, item.posicaoU)
                .input('brand', sql.NVarChar, item.brand)
                 .query(`
                    INSERT INTO ChildItems (id, label, parentId, type, status, modelo, tamanhoU, posicaoU, brand, isTestData)
                    VALUES (@id, @label, @parentId, @type, @status, @modelo, @tamanhoU, @posicaoU, @brand, 1)
                `);
        }

        await transaction.commit();
        console.log("Banco de dados populado com dados de teste com sucesso.");

    } catch (error) {
        await transaction.rollback();
        console.error("Erro detalhado ao popular banco de dados com dados de teste:", error);
        throw new Error("Falha ao popular o banco de dados. Verifique os logs do servidor para detalhes.");
    }
}


/**
 * Limpa TODOS os dados marcados como 'isTestData' do banco de dados.
 */
export async function cleanTestData() {
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);

    const tablesToDeleteFrom = [
        'Connections', 'EquipmentPorts', 'ChildItems', 'ParentItems', 'Users', 'Rooms', 'Buildings'
    ];

    try {
        await transaction.begin();
        console.log("Iniciando limpeza dos dados de teste...");

        // A ordem aqui é invertida para respeitar as chaves estrangeiras
        for (const table of tablesToDeleteFrom) {
            const request = new sql.Request(transaction);
            // O usuário 'dev' não deve ser removido na limpeza
            if (table === 'Users') {
                await request.query(`DELETE FROM ${table} WHERE isTestData = 1 AND email != 'dev@dev.com'`);
            } else {
                await request.query(`DELETE FROM ${table} WHERE isTestData = 1`);
            }
            console.log(`Dados de teste limpos da tabela: ${table}`);
        }

        await transaction.commit();
        console.log("Limpeza dos dados de teste concluída com sucesso.");
    } catch (error) {
        await transaction.rollback();
        console.error("Erro ao limpar dados de teste. A transação foi revertida.", error);
        throw new Error("Falha ao limpar dados de teste.");
    }
}

export async function ensureDatabaseSchema(): Promise<string> {
    return _ensureDatabaseSchema();
}
