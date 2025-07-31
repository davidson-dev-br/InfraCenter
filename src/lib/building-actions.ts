
'use server';

import sql from 'mssql';
import { revalidatePath } from 'next/cache';
import { getDbPool } from './db';

/**
 * Server Action para buscar uma lista simples de todos os prédios.
 */
export async function getBuildingsList(): Promise<{ id: string; name: string }[]> {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query('SELECT id, name FROM Buildings ORDER BY name');
    return result.recordset;
  } catch (error: any) {
    console.error('Erro de banco de dados ao buscar lista de prédios:', error);
    return []; // Retorna um array vazio em caso de erro para não quebrar a UI
  }
}

/**
 * Server Action para adicionar um novo prédio ao banco de dados.
 * @param name O nome do novo prédio.
 * @param address O endereço opcional do prédio.
 */
export async function addBuilding(name: string, address?: string): Promise<void> {
  if (!name || name.trim().length < 3) {
    throw new Error('O nome do prédio é inválido.');
  }

  try {
    const pool = await getDbPool();
    const newId = `B${Date.now()}`; // Cria um ID único simples.

    const request = pool.request()
      .input('id', sql.NVarChar, newId)
      .input('name', sql.NVarChar, name.trim());
      
    if (address) {
        request.input('address', sql.NVarChar, address.trim());
        await request.query('INSERT INTO Buildings (id, name, address) VALUES (@id, @name, @address)');
    } else {
        await request.query('INSERT INTO Buildings (id, name) VALUES (@id, @name)');
    }

    // Invalida o cache da página de prédios para que ela seja recarregada com os novos dados.
    revalidatePath('/buildings');
  } catch (error: any) {
    console.error('Erro de banco de dados ao adicionar prédio:', error);
    // Verifica se é um erro de chave única (nome duplicado, por exemplo)
    if (error.number === 2627 || error.number === 2601) {
        throw new Error('Um prédio com este nome já existe.');
    }
    throw new Error('Falha ao adicionar o prédio no banco de dados.');
  }
}

/**
 * Server Action para excluir um prédio do banco de dados.
 * A exclusão das salas associadas é feita em cascata pelo banco de dados.
 * @param id O ID do prédio a ser excluído.
 */
export async function deleteBuilding(id: string): Promise<void> {
  if (!id) {
    throw new Error('O ID do prédio é obrigatório para a exclusão.');
  }

  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', sql.NVarChar, id)
      .query('DELETE FROM Buildings WHERE id = @id');

    revalidatePath('/buildings');
  } catch (error: any) {
    console.error('Erro de banco de dados ao excluir prédio:', error);
    throw new Error('Falha ao excluir o prédio no banco de dados.');
  }
}

interface UpdateBuildingParams {
  id: string;
  name: string;
  address?: string;
}
/**
 * Server Action para atualizar um prédio existente.
 */
export async function updateBuilding({ id, name, address }: UpdateBuildingParams): Promise<void> {
  if (!id) {
    throw new Error('O ID do prédio é obrigatório.');
  }
  if (!name || name.trim().length < 3) {
    throw new Error('O nome do prédio é inválido.');
  }

  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', sql.NVarChar, id)
      .input('name', sql.NVarChar, name.trim())
      .input('address', sql.NVarChar, address || null)
      .query`
        UPDATE Buildings 
        SET name = @name, address = @address
        WHERE id = @id
      `;
    
    revalidatePath('/buildings');
  } catch (error: any) {
    console.error('Erro de banco de dados ao atualizar prédio:', error);
    if (error.number === 2627 || error.number === 2601) {
      throw new Error('Um prédio com este nome já existe.');
    }
    throw new Error('Falha ao atualizar o prédio no banco de dados.');
  }
}
