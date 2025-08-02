

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
            JOIN EquipmentPorts portB ON c.portB_id = portB.id
            JOIN ChildItems itemB ON portB.childItemId = itemB.id
            LEFT JOIN ParentItems parentB ON itemB.parentId = parentB.id
            JOIN ConnectionTypes ct ON c.connectionTypeId = ct.id
            WHERE c.status = 'active'
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
    portB_id: string; 
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

        // Verificar se as portas já estão conectadas
        const checkRequest = new sql.Request(transaction);
        const portCheckResult = await checkRequest
            .input('portA', sql.NVarChar, portA_id)
            .input('portB', sql.NVarChar, portB_id)
            .query`SELECT connectedToPortId FROM EquipmentPorts WHERE id IN (@portA, @portB)`;
        
        for(const record of portCheckResult.recordset) {
            if (record.connectedToPortId) {
                throw new Error("Uma ou ambas as portas selecionadas já estão em uso.");
            }
        }
        
        // 1. Criar a conexão
        const connectionId = `conn_${Date.now()}`;
        const connectionRequest = new sql.Request(transaction);
        await connectionRequest
            .input('id', sql.NVarChar, connectionId)
            .input('portA_id', sql.NVarChar, portA_id)
            .input('portB_id', sql.NVarChar, portB_id)
            .input('connectionTypeId', sql.NVarChar, connectionTypeId)
            .input('labelText', sql.NVarChar, labelText || null)
            .input('imageUrl', sql.NVarChar, imageUrl || null)
            .query`
                INSERT INTO Connections (id, portA_id, portB_id, connectionTypeId, labelText, imageUrl, status)
                VALUES (@id, @portA_id, @portB_id, @connectionTypeId, @labelText, @imageUrl, 'active')
            `;

        // 2. Atualizar a porta A
        const updatePortARequest = new sql.Request(transaction);
        await updatePortARequest
            .input('id', sql.NVarChar, portA_id)
            .input('connectedTo', sql.NVarChar, portB_id)
            .query`UPDATE EquipmentPorts SET status = 'up', connectedToPortId = @connectedTo WHERE id = @id`;

        // 3. Atualizar a porta B
        const updatePortBRequest = new sql.Request(transaction);
        await updatePortBRequest
            .input('id', sql.NVarChar, portB_id)
            .input('connectedTo', sql.NVarChar, portA_id)
            .query`UPDATE EquipmentPorts SET status = 'up', connectedToPortId = @connectedTo WHERE id = @id`;

        await transaction.commit();
        
        // Log de auditoria
        await logAuditEvent({
            action: 'CONNECTION_CREATED',
            entityType: 'Connections',
            entityId: connectionId,
            details: { from: portA_id, to: portB_id, type: connectionTypeId, hasEvidence: !!imageUrl }
        });

    } catch (error: any) {
        await transaction.rollback();
        console.error("Erro ao criar conexão:", error);
        throw new Error(error.message || "Falha ao estabelecer a conexão no banco de dados.");
    }
}
