
'use server';

import sql from 'mssql';
import { getDbPool } from './db';
import { logAuditEvent } from './audit-actions';
import { revalidatePath } from 'next/cache';
import { _getUserById, User } from './user-service';
import { getFirebaseAuth } from '@/lib/firebase-admin';

export interface ApprovalRequest {
    id: string;
    entityId: string;
    entityType: 'ParentItems' | 'ChildItems';
    entityLabel: string;
    entityTypeName: string;
    requestedAt: string;
    requestedByUserDisplayName: string;
    details: { from: string; to: string };
}

async function getCurrentUser(): Promise<User | null> {
    // Esta função precisa ser implementada de forma robusta,
    // talvez lendo um cookie de sessão ou um token de autorização.
    // Por enquanto, vamos assumir que o usuário é passado para as funções que precisam dele.
    return null;
}

export async function getPendingApprovals(): Promise<ApprovalRequest[]> {
    try {
        const pool = await getDbPool();
        const result = await pool.request().query(`
            -- Seleciona aprovações para ParentItems
            SELECT 
                a.id,
                a.entityId,
                a.entityType,
                pi.label AS entityLabel,
                pi.type AS entityTypeName,
                a.requestedAt,
                a.requestedByUserDisplayName,
                a.details
            FROM Approvals a
            JOIN ParentItems pi ON a.entityId = pi.id
            WHERE a.status = 'pending' AND a.entityType = 'ParentItems'
            
            UNION ALL

            -- Seleciona aprovações para ChildItems
            SELECT 
                a.id,
                a.entityId,
                a.entityType,
                ci.label AS entityLabel,
                ci.type AS entityTypeName,
                a.requestedAt,
                a.requestedByUserDisplayName,
                a.details
            FROM Approvals a
            JOIN ChildItems ci ON a.entityId = ci.id
            WHERE a.status = 'pending' AND a.entityType = 'ChildItems'

            ORDER BY a.requestedAt DESC;
        `);

        return result.recordset.map(record => ({
            ...record,
            details: JSON.parse(record.details)
        }));

    } catch (error) {
        console.error("Erro ao buscar aprovações pendentes:", error);
        return [];
    }
}


export async function resolveApproval(
    approvalId: string,
    decision: 'approved' | 'rejected',
    notes: string | null,
    adminUserId: string,
): Promise<void> {

    const user = await _getUserById(adminUserId);
    if (!user) {
        throw new Error("Usuário não autenticado.");
    }

    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const approvalResult = await new sql.Request(transaction).input('id', sql.NVarChar, approvalId).query('SELECT * FROM Approvals WHERE id = @id');
        const approval = approvalResult.recordset[0];

        if (!approval || approval.status !== 'pending') {
            throw new Error("Solicitação de aprovação não encontrada ou já resolvida.");
        }

        const { entityId, entityType, details } = approval;
        const parsedDetails = JSON.parse(details);

        const newStatus = decision === 'approved' ? parsedDetails.to : parsedDetails.from;

        // Atualiza o item
        await new sql.Request(transaction)
            .input('id', sql.NVarChar, entityId)
            .input('status', sql.NVarChar, newStatus)
            .query(`UPDATE ${entityType} SET status = @status WHERE id = @id`);

        // Atualiza a aprovação
        await new sql.Request(transaction)
            .input('id', sql.NVarChar, approvalId)
            .input('status', sql.NVarChar, decision)
            .input('resolvedByUserId', sql.NVarChar, user.id)
            .input('resolvedByUserDisplayName', sql.NVarChar, user.displayName)
            .input('resolverNotes', sql.NVarChar, notes)
            .query`UPDATE Approvals SET 
                        status = @status, 
                        resolvedByUserId = @resolvedByUserId,
                        resolvedByUserDisplayName = @resolvedByUserDisplayName,
                        resolverNotes = @resolverNotes,
                        resolvedAt = GETUTCDATE()
                    WHERE id = @id`;
        
        await transaction.commit();

        await logAuditEvent({
            user,
            action: `APPROVAL_${decision.toUpperCase()}`,
            entityType: 'Approvals',
            entityId: approvalId,
            details: { item: entityId, itemType: entityType, decision, notes }
        });

        revalidatePath('/approvals');
        revalidatePath('/inventory');

    } catch (error: any) {
        await transaction.rollback();
        console.error("Erro ao resolver aprovação:", error);
        throw new Error("Falha ao processar a solicitação no banco de dados.");
    }
}
