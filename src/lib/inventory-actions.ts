

'use server';

import sql from 'mssql';
import { getDbPool } from './db';
import type { GridItem } from '@/types/datacenter';
import { _getUserByEmail, User } from './user-service';
import { headers } from 'next/headers';
import { auth } from '@/lib/firebase-admin';
import { getItemStatuses, ItemStatus } from './status-actions';

// Tipagem para os itens retornados pela consulta
interface InventoryItem extends GridItem {
    parentName: string | null;
    roomName: string | null;
    buildingName: string | null;
}

// Uma função para obter o usuário atual no servidor.
async function getCurrentUser(): Promise<User | null> {
    if (!auth) {
        console.warn("Firebase Admin não inicializado. Não é possível autenticar o usuário.");
        return null;
    }

    const authorization = headers().get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            if (decodedToken.email) {
                return await _getUserByEmail(decodedToken.email);
            }
        } catch (error) {
            console.error("Erro ao verificar o token de autenticação:", error);
        }
    }
    // Se não houver token ou se a verificação falhar, retorne null.
    return null;
}


export async function getInventoryData() {
    try {
        const pool = await getDbPool();
        
        const [user, statuses, parentResult, childResult] = await Promise.all([
            getCurrentUser(),
            getItemStatuses(),
            pool.request().query<InventoryItem>`
                SELECT
                    pi.*,
                    r.name AS roomName,
                    b.name AS buildingName
                FROM ParentItems pi
                LEFT JOIN Rooms r ON pi.roomId = r.id
                LEFT JOIN Buildings b ON r.buildingId = b.id
                WHERE pi.status != 'decommissioned' AND pi.status != 'deleted';
            `,
             pool.request().query<InventoryItem>`
                SELECT
                    ci.*,
                    p.label AS parentName
                FROM ChildItems ci
                LEFT JOIN ParentItems p ON ci.parentId = p.id
                WHERE ci.status != 'decommissioned' AND ci.status != 'deleted';
            `
        ]);

        const parentItems = parentResult.recordset;
        const childItems = childResult.recordset;
        const allItems = [...parentItems, ...childItems];

        return {
            parentItems,
            childItems,
            allItems,
            statuses,
            preferences: user?.preferences?.inventoryColumns || {}
        };

    } catch (error) {
        console.error("Erro ao buscar dados do inventário:", error);
        return {
            parentItems: [],
            childItems: [],
            allItems: [],
            statuses: [],
            preferences: {}
        };
    }
}
