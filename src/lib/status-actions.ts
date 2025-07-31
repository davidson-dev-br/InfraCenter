
'use server';

import sql from 'mssql';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getDbPool } from './db';
import { statusColors } from './status-config';

export interface ItemStatus {
  id: string;
  name: string;
  description: string | null;
  color: typeof statusColors[number];
  isArchived: boolean;
  isDefault: boolean;
}

const statusSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  description: z.string().optional(),
  color: z.enum(statusColors),
  isArchived: z.boolean(),
});

type StatusData = z.infer<typeof statusSchema>;

export async function getItemStatuses(): Promise<ItemStatus[]> {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query`
      SELECT id, name, description, color, isArchived, isDefault 
      FROM ItemStatuses 
      ORDER BY isDefault DESC, name ASC
    `;
    return result.recordset.map(r => ({ ...r, color: r.color as typeof statusColors[number] }));
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    return [];
  }
}

export async function addStatus(data: StatusData) {
  const validation = statusSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors.map(e => e.message).join(', '));
  }

  const { name, description, color, isArchived } = validation.data;

  try {
    const pool = await getDbPool();
    const newId = `status_${Date.now()}`;

    await pool.request()
      .input('id', sql.NVarChar, newId)
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description || null)
      .input('color', sql.NVarChar, color)
      .input('isArchived', sql.Bit, isArchived)
      .input('isDefault', sql.Bit, false)
      .query`
        INSERT INTO ItemStatuses (id, name, description, color, isArchived, isDefault)
        VALUES (@id, @name, @description, @color, @isArchived, @isDefault)
      `;

    revalidatePath('/system');
  } catch (error: any) {
    if (error.number === 2627 || error.number === 2601) {
      throw new Error('Um status com este nome já existe.');
    }
    throw new Error('Falha ao adicionar o status no banco de dados.');
  }
}


export async function updateStatus(id: string, data: StatusData) {
    const validation = statusSchema.safeParse(data);
    if (!validation.success) {
      throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }
  
    const { name, description, color, isArchived } = validation.data;
  
    try {
      const pool = await getDbPool();
      await pool.request()
        .input('id', sql.NVarChar, id)
        .input('name', sql.NVarChar, name)
        .input('description', sql.NVarChar, description || null)
        .input('color', sql.NVarChar, color)
        .input('isArchived', sql.Bit, isArchived)
        .query`
          UPDATE ItemStatuses
          SET name = @name, description = @description, color = @color, isArchived = @isArchived
          WHERE id = @id AND isDefault = 0
        `;
  
      revalidatePath('/system');
    } catch (error: any) {
      if (error.number === 2627 || error.number === 2601) {
        throw new Error('Um status com este nome já existe.');
      }
      throw new Error('Falha ao atualizar o status no banco de dados.');
    }
}

export async function deleteStatus(id: string) {
    try {
        const pool = await getDbPool();
        
        const usageCheck = await pool.request()
            .input('statusId', sql.NVarChar, id)
            .query`SELECT TOP 1 id FROM Items WHERE status = @statusId`;
    
        if (usageCheck.recordset.length > 0) {
            throw new Error('Este status está em uso por um ou mais itens e não pode ser excluído.');
        }

        await pool.request()
            .input('id', sql.NVarChar, id)
            .query`DELETE FROM ItemStatuses WHERE id = @id AND isDefault = 0`;
        
        revalidatePath('/system');
    } catch (error: any) {
        if (error.message.includes('em uso')) {
            throw error;
        }
        console.error("Erro ao excluir status:", error)
        throw new Error('Falha ao excluir o status no banco de dados.');
    }
}
