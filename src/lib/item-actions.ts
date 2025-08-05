

'use server';

import sql from 'mssql';
import { revalidatePath } from 'next/cache';
import { getDbPool } from './db';
import type { GridItem, Room } from '@/types/datacenter';
import type { ItemType } from './item-types-actions';
import { getModelsByManufacturerId } from './models-actions';
import { getPortTypes, PortType } from './port-types-actions';
import { _getUserByEmail, User } from './user-service';
import { headers } from 'next/headers';
import { getFirebaseAuth } from '@/lib/firebase-admin';

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

interface AddItemParams {
  label: string;
  itemType: ItemType;
  room: Room;
}

/**
 * Server Action para adicionar um novo item à planta baixa.
 */
export async function addItem({ label, itemType, room }: AddItemParams): Promise<GridItem> {
  if (!label || !itemType || !room) {
    throw new Error('Dados insuficientes para criar o item.');
  }

  try {
    const pool = await getDbPool();
    const newId = `pitem_${Date.now()}`;
    const initialX = 0;
    const initialY = 0;

    const newItem: Omit<GridItem, 'width' | 'height'> & { width: number; height: number } = {
        id: newId,
        label: label,
        x: initialX,
        y: initialY,
        width: itemType.defaultWidthM,
        height: itemType.defaultHeightM,
        type: itemType.name,
        status: 'draft',
        roomId: room.id,
        color: itemType.defaultColor,
    };

    await pool.request()
        .input('id', sql.NVarChar, newItem.id)
        .input('label', sql.NVarChar, newItem.label)
        .input('x', sql.Int, newItem.x)
        .input('y', sql.Int, newItem.y)
        .input('width', sql.Float, newItem.width)
        .input('height', sql.Float, newItem.height)
        .input('type', sql.NVarChar, newItem.type)
        .input('status', sql.NVarChar, newItem.status)
        .input('roomId', sql.NVarChar, newItem.roomId)
        .input('color', sql.NVarChar, newItem.color || null)
        .query`
            INSERT INTO ParentItems (id, label, x, y, width, height, type, status, roomId, color)
            VALUES (@id, @label, @x, @y, @width, @height, @type, @status, @roomId, @color)
        `;

    revalidatePath('/datacenter');

    return newItem as GridItem;

  } catch (error: any) {
    console.error('Erro de banco de dados ao adicionar item:', error);
    if (error.number === 2627 || error.number === 2601) {
        throw new Error('Um item com identificador similar já existe.');
    }
    throw new Error('Falha ao adicionar o item no banco de dados.');
  }
}

/**
 * Server Action para excluir um item da planta baixa.
 * @param item O item a ser excluído.
 * @param hardDelete Se true, exclui o item permanentemente do DB. Se false, marca como 'decommissioned'.
 */
export async function deleteItem({ item, hardDelete }: { item: GridItem; hardDelete: boolean }): Promise<void> {
  if (!item || !item.id) {
    throw new Error('O ID do item é obrigatório para a exclusão.');
  }
  
  const tableName = item.parentId ? 'ChildItems' : 'ParentItems';

  try {
    const pool = await getDbPool();
    const request = pool.request().input('id', sql.NVarChar, item.id);
    
    if (hardDelete) {
      await request.query(`DELETE FROM ${tableName} WHERE id = @id`);
    } else {
      await request.query`
        UPDATE ${tableName} 
        SET status = 'decommissioned' 
        WHERE id = @id
      `;
    }

    revalidatePath('/datacenter');
    revalidatePath('/trash');
    revalidatePath('/inventory');

  } catch (error: any) {
    console.error('Erro de banco de dados ao excluir/descomissionar item:', error);
    throw new Error('Falha ao processar a exclusão do item no banco de dados.');
  }
}

/**
 * Busca todos os itens que foram 'descomissionados'.
 */
export async function getDecommissionedItems(): Promise<GridItem[]> {
  try {
    const pool = await getDbPool();
    const parentResult = await pool.request().query`
        SELECT i.*, r.name as roomName, b.name as buildingName 
        FROM ParentItems i
        LEFT JOIN Rooms r ON i.roomId = r.id
        LEFT JOIN Buildings b ON r.buildingId = b.id
        WHERE i.status = 'decommissioned'
    `;
    const childResult = await pool.request().query`
        SELECT ci.*, p.label as parentName, r.name as roomName, b.name as buildingName
        FROM ChildItems ci
        JOIN ParentItems p ON ci.parentId = p.id
        JOIN Rooms r ON p.roomId = r.id
        JOIN Buildings b ON r.buildingId = b.id
        WHERE ci.status = 'decommissioned'
    `;

    return [...parentResult.recordset, ...childResult.recordset].sort((a,b) => a.label.localeCompare(b.label));

  } catch (error) {
    console.error('Erro ao buscar itens descomissionados:', error);
    return [];
  }
}

/**
 * Restaura um item descomissionado, mudando seu status para 'ativo'.
 * @param item O item a ser restaurado.
 */
export async function restoreItem(item: GridItem): Promise<void> {
  if (!item || !item.id) {
    throw new Error('O ID do item é obrigatório para a restauração.');
  }

  const tableName = item.parentId ? 'ChildItems' : 'ParentItems';

  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', sql.NVarChar, item.id)
      .query`
        UPDATE ${tableName} 
        SET status = 'active' 
        WHERE id = @id
      `;

    revalidatePath('/trash');
    revalidatePath('/datacenter');
    revalidatePath('/inventory');
  } catch (error) {
    console.error('Erro ao restaurar item:', error);
    throw new Error('Falha ao restaurar o item no banco de dados.');
  }
}
