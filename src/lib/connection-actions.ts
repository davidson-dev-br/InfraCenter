
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
