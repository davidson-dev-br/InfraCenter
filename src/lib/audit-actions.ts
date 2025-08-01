
'use server';

import sql from 'mssql';
import { getDbPool } from './db';
import type { User } from './user-service';

// Este arquivo é o "olho que tudo vê" do sistema.
// Trate com o devido respeito. - davidson.dev.br

export interface AuditEvent {
    // Para simplificar, não passaremos o usuário em cada chamada.
    // O sistema usará um usuário "admin" fixo por enquanto.
    // Em um sistema de produção, isso viria de uma sessão de usuário.
    // userId: string;
    // userDisplayName: string | null;
    action: string;
    entityType?: string;
    entityId?: string;
    details?: Record<string, any>;
}

export async function logAuditEvent(event: AuditEvent): Promise<void> {
    try {
        const pool = await getDbPool();
        await pool.request()
            // Provisoriamente usando um ID e nome fixos para o ator da ação.
            .input('userId', sql.NVarChar, 'admin_system')
            .input('userDisplayName', sql.NVarChar, 'Sistema (Admin)')
            .input('action', sql.NVarChar, event.action)
            .input('entityType', sql.NVarChar, event.entityType || null)
            .input('entityId', sql.NVarChar, event.entityId || null)
            .input('details', sql.NVarChar, event.details ? JSON.stringify(event.details) : null)
            .query`
                INSERT INTO AuditLog (userId, userDisplayName, action, entityType, entityId, details)
                VALUES (@userId, @userDisplayName, @action, @entityType, @entityId, @details)
            `;
    } catch (err) {
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

