

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
                c.status
            FROM Connections c
            JOIN EquipmentPorts portA ON c.portA_id = portA.id
            JOIN ChildItems itemA ON portA.childItemId = itemA.id
            JOIN ParentItems parentA ON itemA.parentId = parentA.id
            JOIN EquipmentPorts portB ON c.portB_id = portB.id
            JOIN ChildItems itemB ON portB.childItemId = itemB.id
            JOIN ParentItems parentB ON itemB.parentId = parentB.id
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
