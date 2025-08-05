

'use server';

import sql from 'mssql';
import { revalidatePath } from 'next/cache';
import { getDbPool } from './db';
import type { GridItem } from '@/types/datacenter';
import { _getUserByEmail, User } from './user-service';
import { headers } from 'next/headers';
import { getFirebaseAuth } from '@/lib/firebase-admin';

type UpdateItemData = Partial<Omit<GridItem, 'id'>> & { id: string };

async function getCurrentUser(): Promise<User | null> {
    const authorization = headers().get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
            const auth = await getFirebaseAuth();
            const decodedToken = await auth.verifyIdToken(idToken);
            if (decodedToken.email) {
                return await _getUserByEmail(decodedToken.email);
            }
        } catch (error) {
            console.error("Erro ao verificar o token de autenticação:", error);
        }
    }
    return null;
}

async function createApprovalRequest(pool: sql.ConnectionPool, entityId: string, entityType: string, oldStatus: string, newStatus: string, user: User) {
    const approvalId = `appr_${Date.now()}`;
    await pool.request()
        .input('id', sql.NVarChar, approvalId)
        .input('entityType', sql.NVarChar, entityType)
        .input('entityId', sql.NVarChar, entityId)
        .input('requestedByUserId', sql.NVarChar, user.id)
        .input('requestedByUserDisplayName', sql.NVarChar, user.displayName)
        .input('details', sql.NVarChar, JSON.stringify({ from: oldStatus, to: newStatus }))
        .query`
            INSERT INTO Approvals (id, entityType, entityId, requestedByUserId, requestedByUserDisplayName, details, status, requestedAt)
            VALUES (@id, @entityType, @entityId, @requestedByUserId, @requestedByUserDisplayName, @details, 'pending', GETUTCDATE())
        `;
}

function getTableName(itemData: Partial<GridItem>): 'ParentItems' | 'ChildItems' {
  if (itemData.roomId) return 'ParentItems';
  if (itemData.parentId) return 'ChildItems';
  if ('parentId' in itemData && itemData.parentId !== undefined) return 'ChildItems';
  return 'ParentItems';
}

async function createPortsForModel(transaction: sql.Transaction, childItemId: string, modelName: string) {
    console.log(`Iniciando criação de portas para ${childItemId} baseado no modelo ${modelName}`);
    const modelResult = await new sql.Request(transaction).input('modelName', sql.NVarChar, modelName).query`SELECT portConfig FROM Models WHERE name = @modelName`;

    if (modelResult.recordset.length === 0 || !modelResult.recordset[0].portConfig) {
        console.log(`Nenhuma configuração de porta encontrada para o modelo ${modelName}. Pulando criação de portas.`);
        return;
    }

    const portConfig = modelResult.recordset[0].portConfig;
    console.log(`Configuração de portas encontrada: ${portConfig}`);

    const portTypesResult = await new sql.Request(transaction).query`SELECT id, name FROM PortTypes`;
    const portTypesMap = new Map<string, string>(portTypesResult.recordset.map(pt => [pt.name.toUpperCase(), pt.id]));
    
    const portGroups = portConfig.split(';').filter(Boolean);
    let portCounter = 1;

    for (const group of portGroups) {
        const parts = group.toLowerCase().split('x');
        if (parts.length !== 2) continue;

        const quantity = parseInt(parts[0], 10);
        const typeName = parts[1].toUpperCase();

        if (isNaN(quantity) || !portTypesMap.has(typeName)) {
            console.warn(`Configuração de porta inválida ou tipo de porta não encontrado: ${group}`);
            continue;
        }

        const portTypeId = portTypesMap.get(typeName);

        for (let i = 0; i < quantity; i++) {
            const portId = `eport_${childItemId}_${portCounter}`;
            const portLabel = `${typeName.replace(/[^A-Z0-9]/g, '')}-${i + 1}`;
            
            const portRequest = new sql.Request(transaction);
            await portRequest
                .input('id', sql.NVarChar, portId)
                .input('childItemId', sql.NVarChar, childItemId)
                .input('portTypeId', sql.NVarChar, portTypeId)
                .input('label', sql.NVarChar, portLabel)
                .query`
                    INSERT INTO EquipmentPorts (id, childItemId, portTypeId, label, status)
                    VALUES (@id, @childItemId, @portTypeId, @label, 'down')
                `;
            portCounter++;
        }
    }
    console.log(`${portCounter - 1} portas criadas com sucesso para ${childItemId}.`);
}


/**
 * Server Action para atualizar um item existente ou criar um novo no banco de dados.
 * @param itemData Um objeto contendo o ID do item e os campos a serem atualizados/criados.
 */
export async function updateItem(itemData: UpdateItemData): Promise<void> {
  const { id, ...fieldsToUpdate } = itemData;

  if (!id) throw new Error('O ID do item é obrigatório para a operação.');
  
  const pool = await getDbPool();
  const tableName = getTableName(itemData);
  
  const existingItemResult = await pool.request().input('id', sql.NVarChar, id).query(`SELECT id, status FROM ${tableName} WHERE id = @id`);
  const existingItem = existingItemResult.recordset[0];
  const user = await getCurrentUser();

  if (!user) throw new Error("Usuário não autenticado.");

  const addInput = (request: sql.Request, key: string, value: any) => {
    if (value === null || value === undefined) {
        if (['x', 'y', 'tamanhoU', 'potenciaW', 'posicaoU'].includes(key)) request.input(key, sql.Int, null);
        else if (['width', 'height', 'preco'].includes(key)) request.input(key, sql.Float, null);
        else if (['isTagEligible'].includes(key)) request.input(key, sql.Bit, null);
        else request.input(key, sql.NVarChar, null);
    } else if (typeof value === 'boolean') {
        request.input(key, sql.Bit, value);
    } else if (typeof value === 'number') {
        if (['x', 'y', 'tamanhoU', 'potenciaW', 'posicaoU'].includes(key)) request.input(key, sql.Int, value);
        else request.input(key, sql.Float, value);
    } else {
        request.input(key, sql.NVarChar, String(value));
    }
  };


  if (existingItem) {
    // --- Lógica de Aprovação ---
    if (fieldsToUpdate.status && fieldsToUpdate.status === 'active' && existingItem.status === 'draft') {
        await createApprovalRequest(pool, id, tableName, 'draft', 'active', user);
        fieldsToUpdate.status = 'pending_approval'; // Muda o status para pendente
    }

    const validFields = Object.keys(fieldsToUpdate).filter(key => (fieldsToUpdate as any)[key] !== undefined);
    if (validFields.length === 0) return;

    try {
      const request = pool.request().input('id', sql.NVarChar, id);
      const setClauses = validFields.map(key => `${key} = @${key}`);
      
      for (const key of validFields) {
          addInput(request, key, (fieldsToUpdate as any)[key]);
      }

      const query = `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE id = @id`;
      await request.query(query);
    } catch (error: any) {
        console.error(`Erro de banco de dados ao ATUALIZAR item ${id}:`, error);
        throw new Error(`Falha ao atualizar o item ${itemData.label || id} no banco de dados. Detalhe: ${error.message}`);
    }
  } else {
    // INSERT - Lógica de criação de item
     try {
        const allDataForInsert = { id, ...fieldsToUpdate };
        const columns = Object.keys(allDataForInsert).filter(key => (allDataForInsert as any)[key] !== undefined);
        const request = pool.request();
        for (const col of columns) addInput(request, col, (allDataForInsert as any)[col]);
        
        const finalValues = columns.map(col => `@${col}`);
        const query = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${finalValues.join(',')})`;
        
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const transactionRequest = new sql.Request(transaction);
            for (const col of columns) addInput(transactionRequest, col, (allDataForInsert as any)[col]);
            await transactionRequest.query(query);

            if (tableName === 'ChildItems' && allDataForInsert.modelo) {
                await createPortsForModel(transaction, id, allDataForInsert.modelo);
            }
            
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error: any) {
        console.error(`Erro de banco de dados ao CRIAR item ${id} na tabela ${tableName}:`, error);
        throw new Error(`Falha ao criar o item ${itemData.label || id} no banco de dados. Detalhe: ${error.message}`);
    }
  }

  revalidatePath('/datacenter');
  revalidatePath('/mapa-teste');
  revalidatePath('/inventory');
  revalidatePath('/approvals');
}
