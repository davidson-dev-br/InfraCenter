
'use server';

import sql from 'mssql';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getDbPool } from './db';

export interface Manufacturer {
  id: string;
  name: string;
}

const manufacturerSchema = z.object({
  name: z.string().min(2, 'O nome do fabricante deve ter pelo menos 2 caracteres.'),
});

export async function getManufacturers(): Promise<Manufacturer[]> {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query`
      SELECT id, name FROM Manufacturers ORDER BY name ASC
    `;
    return result.recordset;
  } catch (error) {
    console.error('Erro ao buscar fabricantes:', error);
    return [];
  }
}

export async function addManufacturer(data: { name: string }) {
  const validation = manufacturerSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors.map(e => e.message).join(', '));
  }

  const { name } = validation.data;

  try {
    const pool = await getDbPool();
    const newId = `man_${Date.now()}`;

    await pool.request()
      .input('id', sql.NVarChar, newId)
      .input('name', sql.NVarChar, name)
      .query`
        INSERT INTO Manufacturers (id, name) VALUES (@id, @name)
      `;

    revalidatePath('/system');
  } catch (error: any) {
    if (error.number === 2627 || error.number === 2601) {
      throw new Error('Um fabricante com este nome já existe.');
    }
    throw new Error('Falha ao adicionar o fabricante no banco de dados.');
  }
}

export async function updateManufacturer(id: string, data: { name: string }) {
    const validation = manufacturerSchema.safeParse(data);
    if (!validation.success) {
      throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }
    
    const { name } = validation.data;

    try {
        const pool = await getDbPool();
        await pool.request()
            .input('id', sql.NVarChar, id)
            .input('name', sql.NVarChar, name)
            .query`UPDATE Manufacturers SET name = @name WHERE id = @id`;
        revalidatePath('/system');
    } catch (error: any) {
        if (error.number === 2627 || error.number === 2601) {
            throw new Error('Um fabricante com este nome já existe.');
        }
        throw new Error('Falha ao atualizar o fabricante no banco de dados.');
    }
}

export async function deleteManufacturer(id: string) {
    try {
        const pool = await getDbPool();
        // Adicionar verificação de uso aqui no futuro, se necessário.
        // Ex: SELECT TOP 1 FROM ParentItems WHERE brand = (SELECT name FROM Manufacturers WHERE id=@id)
        await pool.request()
            .input('id', sql.NVarChar, id)
            .query`DELETE FROM Manufacturers WHERE id = @id`;
        revalidatePath('/system');
    } catch (error: any) {
        // Tratar erros de chave estrangeira aqui, se aplicável
        throw new Error('Falha ao excluir o fabricante no banco de dados.');
    }
}
