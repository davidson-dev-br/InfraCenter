

'use server';

import sql from 'mssql';
import { revalidatePath } from 'next/cache';
import { getDbPool } from './db';
import type { GridItem, Room } from '@/types/datacenter';
import type { ItemType } from './item-types-actions';

type UpdateItemData = Partial<Omit<GridItem, 'id'>> & { id: string };

function getTableName(itemData: Partial<GridItem>): 'ParentItems' | 'ChildItems' {
  // Se o item tem roomId, é um ParentItem. Se tem parentId, é um ChildItem.
  if (itemData.roomId) {
    return 'ParentItems';
  }
  if (itemData.parentId) {
    return 'ChildItems';
  }
  // Fallback para novos itens onde o parentId é a chave
  if ('parentId' in itemData && itemData.parentId !== undefined) {
      return 'ChildItems';
  }
  return 'ParentItems';
}


/**
 * Server Action para atualizar um item existente ou criar um novo no banco de dados.
 * @param itemData Um objeto contendo o ID do item e os campos a serem atualizados/criados.
 */
export async function updateItem(itemData: UpdateItemData): Promise<void> {
  const { id, ...fieldsToUpdate } = itemData;

  if (!id) {
    throw new Error('O ID do item é obrigatório para a operação.');
  }
  
  const pool = await getDbPool();
  
  const tableName = getTableName(itemData);
  
  const existingItemResult = await pool.request().input('id', sql.NVarChar, id).query(`SELECT id FROM ${tableName} WHERE id = @id`);

  // Função auxiliar para definir o tipo SQL correto para cada campo.
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


  if (existingItemResult.recordset.length > 0) {
    // UPDATE
    const validFields = Object.entries(fieldsToUpdate)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => key);

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
    // INSERT
     try {
        const allDataForInsert = { id, ...fieldsToUpdate };
        const columns = Object.keys(allDataForInsert)
            .filter(key => (allDataForInsert as any)[key] !== undefined);

        const request = pool.request();
        
        for (const col of columns) {
            addInput(request, col, (allDataForInsert as any)[col]);
        }
        
        const finalValues = columns.map(col => `@${col}`);
        const query = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${finalValues.join(',')})`;
        await request.query(query);

    } catch (error: any) {
        console.error(`Erro de banco de dados ao CRIAR item ${id} na tabela ${tableName}:`, error);
        throw new Error(`Falha ao criar o item ${itemData.label || id} no banco de dados. Detalhe: ${error.message}`);
    }
  }

  revalidatePath('/datacenter');
  revalidatePath('/mapa-teste');
  revalidatePath('/inventory');
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
    
    // Define uma posição inicial para o novo item (canto superior esquerdo)
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
        status: 'draft', // Começa como rascunho
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
      // Exclusão permanente - geralmente para rascunhos.
      await request.query(`DELETE FROM ${tableName} WHERE id = @id`);
    } else {
      // Exclusão lógica (soft delete) - para itens ativos.
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
