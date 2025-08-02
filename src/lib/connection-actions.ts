

'use server';

import { getDbPool } from './db';
import type { GridItem } from '@/types/datacenter';
import { logAuditEvent } from './audit-actions';
import sql from 'mssql';

export interface ConnectableItem {
    id: string;
    label: string;
    type: string;
    parentName: string | null;
}

export interface EquipmentPort {
    id: string;
    label: string;
    portTypeName: string;
    status: string;
    connectedToPortId: string | null;
}

export interface ConnectionDetail {
    id: string;
    portA_id: string;
    portB_id: string;
    itemA_label: string;
    portA_label: string;
    itemA_parentLabel: string;
    itemB_label: string;
    portB_label: string;
    itemB_parentLabel: string;
    connectionType: string;
    status: string;
    imageUrl: string | null;
    labelText: string | null;
}

export interface EquipmentPortDetail {
    id: string; // port id
    label: string; // port label e.g., 'Ethernet-1'
    portTypeName: string;
    status: 'up' | 'down' | 'disabled';
    equipmentName: string; // ChildItem label
    equipmentId: string; // ChildItem id
    locationName: string; // ParentItem label
    connectedToPortLabel: string | null;
    connectedToEquipmentName: string | null;
}


/**
 * Busca todos os ChildItems que possuem pelo menos uma porta registrada.
 */
export async function getConnectableChildItems(): Promise<ConnectableItem[]> {
    try {
        const pool = await getDbPool();
        const result = await pool.request().query(`
            SELECT DISTINCT
                ci.id,
                ci.label,
                ci.type,
                p.label as parentName
            FROM ChildItems ci
            INNER JOIN EquipmentPorts ep ON ci.id = ep.childItemId
            LEFT JOIN ParentItems p ON ci.parentId = p.id
            ORDER BY ci.label;
        `);
        return result.recordset;
    } catch (error) {
        console.error("Erro ao buscar itens conectáveis:", error);
        return [];
    }
}

/**
 * Busca todas as portas de um equipamento específico.
 * @param childItemId O ID do ChildItem cujas portas serão buscadas.
 */
export async function getPortsByChildItemId(childItemId: string | null): Promise<EquipmentPort[]> {
    if (!childItemId) return [];
    try {
        const pool = await getDbPool();
        const result = await pool.request()
            .input('childItemId', sql.NVarChar, childItemId)
            .query(`
                SELECT 
                    ep.id,
                    ep.label,
                    pt.name as portTypeName,
                    ep.status,
                    ep.connectedToPortId
                FROM EquipmentPorts ep
                JOIN PortTypes pt ON ep.portTypeId = pt.id
                WHERE ep.childItemId = @childItemId
                ORDER BY 
                    CAST(SUBSTRING(ep.label, PATINDEX('%[0-9]%', ep.label), LEN(ep.label)) AS INT),
                    ep.label;
            `);
        return result.recordset as EquipmentPort[];
    } catch (error) {
        console.error(`Erro ao buscar portas para o item ${childItemId}:`, error);
        return [];
    }
}


/**
 * Busca todos os detalhes de todas as conexões estabelecidas.
 */
export async function getAllConnections(): Promise<ConnectionDetail[]> {
    try {
        const pool = await getDbPool();
        const result = await pool.request().query(`
            SELECT 
                c.id,
                c.portA_id,
                c.portB_id,
                itemA.label AS itemA_label,
                portA.label AS portA_label,
                parentA.label AS itemA_parentLabel,
                itemB.label AS itemB_label,
                portB.label AS portB_label,
                parentB.label AS itemB_parentLabel,
                ct.name AS connectionType,
                c.status,
                c.imageUrl,
                c.labelText
            FROM Connections c
            JOIN EquipmentPorts portA ON c.portA_id = portA.id
            JOIN ChildItems itemA ON portA.childItemId = itemA.id
            LEFT JOIN ParentItems parentA ON itemA.parentId = parentA.id
            LEFT JOIN EquipmentPorts portB ON c.portB_id = portB.id
            LEFT JOIN ChildItems itemB ON portB.childItemId = itemB.id
            LEFT JOIN ParentItems parentB ON itemB.parentId = parentB.id
            JOIN ConnectionTypes ct ON c.connectionTypeId = ct.id
            ORDER BY itemA_label, portA_label;
        `);
        return result.recordset as ConnectionDetail[];
    } catch (error) {
        console.error("Erro ao buscar detalhes das conexões:", error);
        return [];
    }
}

/**
 * Busca todas as portas de todos os equipamentos, com detalhes.
 */
export async function getAllEquipmentPorts(): Promise<EquipmentPortDetail[]> {
    try {
        const pool = await getDbPool();
        // A query foi atualizada para usar LEFT JOIN para a parte da conexão,
        // garantindo que todas as portas sejam listadas, mesmo as não conectadas.
        const result = await pool.request().query(`
            SELECT 
                ep.id,
                ep.label,
                pt.name AS portTypeName,
                ep.status,
                ci.label AS equipmentName,
                ci.id AS equipmentId,
                pi.label AS locationName,
                connectedPort.label AS connectedToPortLabel,
                connectedItem.label AS connectedToEquipmentName
            FROM EquipmentPorts ep
            JOIN ChildItems ci ON ep.childItemId = ci.id
            JOIN PortTypes pt ON ep.portTypeId = pt.id
            LEFT JOIN ParentItems pi ON ci.parentId = pi.id
            LEFT JOIN Connections conn ON ep.id = conn.portA_id OR ep.id = conn.portB_id
            LEFT JOIN EquipmentPorts connectedPort ON (CASE WHEN ep.id = conn.portA_id THEN conn.portB_id ELSE conn.portA_id END) = connectedPort.id
            LEFT JOIN ChildItems connectedItem ON connectedPort.childItemId = connectedItem.id
            ORDER BY pi.label, ci.label, ep.label;
        `);
        return result.recordset as EquipmentPortDetail[];
    } catch (error) {
        console.error("Erro ao buscar todas as portas de equipamentos:", error);
        return [];
    }
}


export async function createConnection(data: { 
    portA_id: string; 
    portB_id?: string | null; // portB é opcional agora
    connectionTypeId: string; 
    labelText?: string | null;
    imageUrl?: string | null;
}) {
    const { portA_id, portB_id, connectionTypeId, labelText, imageUrl } = data;

    if (portA_id === portB_id) {
        throw new Error("Não é possível conectar uma porta a ela mesma.");
    }
    
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        
        const isFullConnection = !!portB_id;
        const status = isFullConnection ? 'active' : 'unresolved';

        // 1. Verificar se as portas já estão conectadas
        const portsToCheck = [portA_id];
        if (isFullConnection) portsToCheck.push(portB_id!);

        const portCheckResult = await new sql.Request(transaction)
            .query(`SELECT id, connectedToPortId FROM EquipmentPorts WHERE id IN ('${portsToCheck.join("','")}')`);

        for(const record of portCheckResult.recordset) {
            if (record.connectedToPortId) {
                throw new Error(`A porta com ID ${record.id} já está em uso.`);
            }
        }
        
        // 2. Criar a conexão
        const connectionId = `conn_${Date.now()}`;
        await new sql.Request(transaction)
            .input('id', sql.NVarChar, connectionId)
            .input('portA_id', sql.NVarChar, portA_id)
            .input('portB_id', sql.NVarChar, portB_id || null) // Permite NULL
            .input('connectionTypeId', sql.NVarChar, connectionTypeId)
            .input('labelText', sql.NVarChar, labelText || null)
            .input('imageUrl', sql.NVarChar, imageUrl || null)
            .input('status', sql.NVarChar, status)
            .query`
                INSERT INTO Connections (id, portA_id, portB_id, connectionTypeId, labelText, imageUrl, status)
                VALUES (@id, @portA_id, @portB_id, @connectionTypeId, @labelText, @imageUrl, @status)
            `;

        // 3. Atualizar as portas
        await new sql.Request(transaction)
            .input('id', sql.NVarChar, portA_id)
            .input('connectedTo', sql.NVarChar, portB_id || null)
            .query`UPDATE EquipmentPorts SET status = 'up', connectedToPortId = @connectedTo WHERE id = @id`;

        if (isFullConnection) {
            await new sql.Request(transaction)
                .input('id', sql.NVarChar, portB_id)
                .input('connectedTo', sql.NVarChar, portA_id)
                .query`UPDATE EquipmentPorts SET status = 'up', connectedToPortId = @connectedTo WHERE id = @id`;
        }

        // 4. (NOVO) Se a conexão não for resolvida, criar um incidente
        if (!isFullConnection) {
            const incidentId = `inc_${Date.now()}`;
            const portAResult = await new sql.Request(transaction).input('portId', sql.NVarChar, portA_id).query(`
                SELECT e.label as equipmentLabel, p.label as portLabel FROM EquipmentPorts p
                JOIN ChildItems e ON p.childItemId = e.id WHERE p.id = @portId
            `);
            const { equipmentLabel, portLabel } = portAResult.recordset[0];
            
            await new sql.Request(transaction)
                .input('id', sql.NVarChar, incidentId)
                .input('description', sql.NVarChar, `Conexão da porta '${portLabel}' no equipamento '${equipmentLabel}' precisa ser resolvida.`)
                .input('severity', sql.NVarChar, 'medium')
                .input('status', sql.NVarChar, 'open')
                .input('detectedAt', sql.DateTime2, new Date())
                .input('entityType', sql.NVarChar, 'Connection')
                .input('entityId', sql.NVarChar, connectionId)
                .query`
                    INSERT INTO Incidents (id, description, severity, status, detectedAt, entityType, entityId)
                    VALUES (@id, @description, @severity, @status, @detectedAt, @entityType, @entityId)
                `;
        }

        await transaction.commit();
        
        // Log de auditoria
        await logAuditEvent({
            action: 'CONNECTION_CREATED',
            entityType: 'Connections',
            entityId: connectionId,
            details: { from: portA_id, to: portB_id, type: connectionTypeId, status }
        });

    } catch (error: any) {
        await transaction.rollback();
        console.error("Erro ao criar conexão:", error);
        throw new Error(error.message || "Falha ao estabelecer a conexão no banco de dados.");
    }
}
