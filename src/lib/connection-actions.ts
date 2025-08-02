
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
