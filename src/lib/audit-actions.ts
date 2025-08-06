

'use server';

import sql from 'mssql';
import { getDbPool } from './db';
import type { User } from './user-service';

// Este arquivo é o "olho que tudo vê" do sistema.
// Trate com o devido respeito. - davidson.dev.br

export interface AuditEvent {
    user: User;
    action: string;
    entityType?: string;
    entityId?: string;
    details?: Record<string, any>;
}

export async function logAuditEvent(event: AuditEvent): Promise<void> {
    try {
        const pool = await getDbPool();
        await pool.request()
            .input('userId', sql.NVarChar, event.user.id)
            .input('userDisplayName', sql.NVarChar, event.user.displayName || event.user.email)
            .input('action', sql.NVarChar, event.action)
            .input('entityType', sql.NVarChar, event.entityType || null)
            .input('entityId', sql.NVarChar, event.entityId || null)
            .input('details', sql.NVarChar, event.details ? JSON.stringify(event.details) : null)
            .query`
                INSERT INTO AuditLog (userId, userDisplayName, action, entityType, entityId, details)
                VALUES (@userId, @userDisplayName, @action, @entityType, @entityId, @details)
            `;
    } catch (err) {
        // Não lançar erro para não quebrar a aplicação principal se o log falhar.
        console.error('Falha ao gravar evento de auditoria:', err);
    }
}

export async function getAuditLogs(): Promise<any[]> {
    try {
        const pool = await getDbPool();
        const result = await pool.request().query`
            SELECT * FROM AuditLog ORDER BY timestamp DESC
        `;
        return result.recordset.map(log => ({
            ...log,
            details: log.details ? JSON.parse(log.details) : null,
            timestamp: new Date(log.timestamp).toISOString(),
        }));
    } catch (err) {
        console.error('Falha ao buscar logs de auditoria:', err);
        return [];
    }
}
