
'use server';

import sql from 'mssql';
import { revalidatePath } from 'next/cache';
import { getDbPool } from './db';

interface AddRoomParams {
  buildingId: string;
  name: string;
  largura?: number;
  comprimento?: number;
  tileWidthCm?: number;
  tileHeightCm?: number;
  xAxisNaming?: string;
  yAxisNaming?: string;
}

/**
 * Server Action para adicionar uma nova sala a um prédio.
 */
export async function addRoom({ buildingId, name, largura, comprimento, tileWidthCm, tileHeightCm, xAxisNaming, yAxisNaming }: AddRoomParams): Promise<void> {
  if (!buildingId) {
    throw new Error('O ID do prédio é obrigatório.');
  }
  if (!name || name.trim().length < 3) {
    throw new Error('O nome da sala é inválido.');
  }

  try {
    const pool = await getDbPool();
    const newId = `R${Date.now()}`;

    const request = pool.request()
      .input('id', sql.NVarChar, newId)
      .input('name', sql.NVarChar, name.trim())
      .input('buildingId', sql.NVarChar, buildingId)
      .input('largura', sql.Float, largura || null)
      .input('comprimento', sql.Float, comprimento || null)
      .input('tileWidthCm', sql.Float, tileWidthCm || 60)
      .input('tileHeightCm', sql.Float, tileHeightCm || 60)
      .input('xAxisNaming', sql.NVarChar, xAxisNaming || 'alpha')
      .input('yAxisNaming', sql.NVarChar, yAxisNaming || 'numeric');
      
    await request.query`
        INSERT INTO Rooms (id, name, buildingId, largura, widthM, tileWidthCm, tileHeightCm, xAxisNaming, yAxisNaming) 
        VALUES (@id, @name, @buildingId, @largura, @comprimento, @tileWidthCm, @tileHeightCm, @xAxisNaming, @yAxisNaming)
    `;

    revalidatePath('/buildings');
  } catch (error: any) {
    console.error('Erro de banco de dados ao adicionar sala:', error);
    if (error.number === 2627 || error.number === 2601) {
        throw new Error('Uma sala com este nome já existe neste prédio.');
    }
    throw new Error('Falha ao adicionar a sala no banco de dados.');
  }
}

interface UpdateRoomParams {
  id: string;
  name: string;
  largura?: number;
  comprimento?: number;
  tileWidthCm?: number;
  tileHeightCm?: number;
  xAxisNaming?: string;
  yAxisNaming?: string;
}

/**
 * Server Action para atualizar uma sala existente.
 */
export async function updateRoom({ id, name, largura, comprimento, tileWidthCm, tileHeightCm, xAxisNaming, yAxisNaming }: UpdateRoomParams): Promise<void> {
  if (!id) {
    throw new Error('O ID da sala é obrigatório.');
  }
   if (!name || name.trim().length < 3) {
    throw new Error('O nome da sala é inválido.');
  }

  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', sql.NVarChar, id)
      .input('name', sql.NVarChar, name.trim())
      .input('largura', sql.Float, largura || null)
      .input('comprimento', sql.Float, comprimento || null)
      .input('tileWidthCm', sql.Float, tileWidthCm || 60)
      .input('tileHeightCm', sql.Float, tileHeightCm || 60)
      .input('xAxisNaming', sql.NVarChar, xAxisNaming || 'alpha')
      .input('yAxisNaming', sql.NVarChar, yAxisNaming || 'numeric')
      .query`
        UPDATE Rooms 
        SET 
          name = @name, 
          largura = @largura, 
          widthM = @comprimento,
          tileWidthCm = @tileWidthCm,
          tileHeightCm = @tileHeightCm,
          xAxisNaming = @xAxisNaming,
          yAxisNaming = @yAxisNaming
        WHERE id = @id
      `;
    
    revalidatePath('/buildings');
    revalidatePath('/datacenter');
  } catch (error: any) {
     console.error('Erro de banco de dados ao atualizar sala:', error);
    if (error.number === 2627 || error.number === 2601) {
        throw new Error('Uma sala com este nome já existe neste prédio.');
    }
    throw new Error('Falha ao atualizar a sala no banco de dados.');
  }
}

/**
 * Server Action para excluir uma sala, se ela estiver vazia.
 * @param roomId O ID da sala a ser excluída.
 */
export async function deleteRoom(roomId: string): Promise<void> {
  if (!roomId) {
    throw new Error('O ID da sala é obrigatório.');
  }

  try {
    const pool = await getDbPool();
    
    // 1. Verificar se a sala contém itens
    const itemsCheck = await pool.request()
      .input('roomId', sql.NVarChar, roomId)
      .query('SELECT COUNT(*) as itemCount FROM ParentItems WHERE roomId = @roomId');

    if (itemsCheck.recordset[0].itemCount > 0) {
      throw new Error('Não é possível excluir a sala pois ela contém equipamentos. Mova ou exclua os equipamentos primeiro.');
    }

    // 2. Se a sala estiver vazia, prosseguir com a exclusão
    await pool.request()
      .input('id', sql.NVarChar, roomId)
      .query('DELETE FROM Rooms WHERE id = @id');

    revalidatePath('/buildings');
  } catch (error: any) {
    if (error.message.includes('contém equipamentos')) {
        throw error;
    }
    console.error('Erro de banco de dados ao excluir sala:', error);
    throw new Error('Falha ao excluir a sala no banco de dados.');
  }
}

    