
'use server';

import sql from 'mssql';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getDbPool } from './db';

export interface Model {
  id: string;
  name: string;
  manufacturerId: string;
  portConfig: string | null;
  tamanhoU: number | null;
  isTestData?: boolean;
}

const modelSchema = z.object({
  name: z.string().min(1, 'O nome do modelo é obrigatório.'),
  manufacturerId: z.string({ required_error: "É obrigatório selecionar um fabricante." }),
  portConfig: z.string().optional().nullable(),
  tamanhoU: z.coerce.number().optional().nullable(),
});

export async function getModelsByManufacturerId(manufacturerId: string): Promise<Model[]> {
  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('manufacturerId', sql.NVarChar, manufacturerId)
      .query`
        SELECT id, name, manufacturerId, portConfig, tamanhoU FROM Models WHERE manufacturerId = @manufacturerId ORDER BY name ASC
      `;
    return result.recordset;
  } catch (error) {
    console.error('Erro ao buscar modelos:', error);
    return [];
  }
}

export async function addModel(data: z.infer<typeof modelSchema>) {
  const validation = modelSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors.map(e => e.message).join(', '));
  }

  const { name, manufacturerId, portConfig, tamanhoU } = validation.data;

  try {
    const pool = await getDbPool();
    const newId = `model_${Date.now()}`;

    await pool.request()
      .input('id', sql.NVarChar, newId)
      .input('name', sql.NVarChar, name)
      .input('manufacturerId', sql.NVarChar, manufacturerId)
      .input('portConfig', sql.NVarChar, portConfig || null)
      .input('tamanhoU', sql.Int, tamanhoU || null)
      .input('isTestData', sql.Bit, false)
      .query`
        INSERT INTO Models (id, name, manufacturerId, portConfig, tamanhoU, isTestData)
        VALUES (@id, @name, @manufacturerId, @portConfig, @tamanhoU, @isTestData)
      `;

    revalidatePath('/system');
  } catch (error: any) {
    if (error.number === 2627 || error.number === 2601) {
      throw new Error('Um modelo com este nome já existe para este fabricante.');
    }
    throw new Error('Falha ao adicionar o modelo no banco de dados.');
  }
}

export async function updateModel(id: string, data: z.infer<typeof modelSchema>) {
    const validation = modelSchema.safeParse(data);
    if (!validation.success) {
      throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }
    
    const { name, manufacturerId, portConfig, tamanhoU } = validation.data;

    try {
        const pool = await getDbPool();
        await pool.request()
            .input('id', sql.NVarChar, id)
            .input('name', sql.NVarChar, name)
            .input('manufacturerId', sql.NVarChar, manufacturerId)
            .input('portConfig', sql.NVarChar, portConfig || null)
            .input('tamanhoU', sql.Int, tamanhoU || null)
            .query`
                UPDATE Models
                SET name = @name, manufacturerId = @manufacturerId, portConfig = @portConfig, tamanhoU = @tamanhoU
                WHERE id = @id
            `;
        revalidatePath('/system');
    } catch (error: any) {
        if (error.number === 2627 || error.number === 2601) {
            throw new Error('Um modelo com este nome já existe para este fabricante.');
        }
        throw new Error('Falha ao atualizar o modelo no banco de dados.');
    }
}

export async function deleteModel(id: string) {
    try {
        const pool = await getDbPool();
        // Adicionar verificação de uso aqui no futuro
        await pool.request()
            .input('id', sql.NVarChar, id)
            .query`DELETE FROM Models WHERE id = @id`;
        revalidatePath('/system');
    } catch (error: any) {
        throw new Error('Falha ao excluir o modelo no banco de dados.');
    }
}
