'use server';

import sql from 'mssql';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getDbPool } from './db';
import { logAuditEvent } from './audit-actions';

// Interface para um Tipo de Porta
export interface PortType {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
}

// Schema de validação para os dados do formulário
const portTypeSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  description: z.string().optional().nullable(),
});

type PortTypeData = z.infer<typeof portTypeSchema>;

/**
 * Busca todos os tipos de porta ativos no banco de dados.
 */
export async function getPortTypes(): Promise<PortType[]> {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query`
      SELECT id, name, description, isDefault 
      FROM PortTypes 
      ORDER BY isDefault DESC, name ASC
    `;
    // Garante que o valor de isDefault seja sempre um booleano
    return result.recordset.map(r => ({ ...r, isDefault: !!r.isDefault }));
  } catch (error) {
    console.error('Erro ao buscar tipos de porta:', error);
    return [];
  }
}

/**
 * Adiciona um novo tipo de porta.
 */
export async function addPortType(data: PortTypeData) {
  const validation = portTypeSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors.map(e => e.message).join(', '));
  }

  const { name, description } = validation.data;
  const newId = `ptype_${Date.now()}`;

  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', sql.NVarChar, newId)
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description || null)
      .input('isDefault', sql.Bit, false)
      .query`
        INSERT INTO PortTypes (id, name, description, isDefault)
        VALUES (@id, @name, @description, @isDefault)
      `;

    await logAuditEvent({ action: 'PORT_TYPE_CREATED', entityType: 'PortTypes', entityId: newId, details: { name } });
    revalidatePath('/system');

  } catch (error: any) {
    if (error.number === 2627 || error.number === 2601) { // Unique constraint
      throw new Error('Um tipo de porta com este nome já existe.');
    }
    throw new Error('Falha ao adicionar o tipo de porta no banco de dados.');
  }
}

/**
 * Atualiza um tipo de porta existente.
 */
export async function updatePortType(id: string, data: PortTypeData) {
  const validation = portTypeSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors.map(e => e.message).join(', '));
  }

  const { name, description } = validation.data;

  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', sql.NVarChar, id)
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description || null)
      .query`
        UPDATE PortTypes
        SET name = @name, description = @description
        WHERE id = @id AND isDefault = 0
      `;

    await logAuditEvent({ action: 'PORT_TYPE_UPDATED', entityType: 'PortTypes', entityId: id, details: { changes: data } });
    revalidatePath('/system');

  } catch (error: any) {
    if (error.number === 2627 || error.number === 2601) {
      throw new Error('Um tipo de porta com este nome já existe.');
    }
    throw new Error('Falha ao atualizar o tipo de porta.');
  }
}

/**
 * Exclui um tipo de porta.
 */
export async function deletePortType(id: string) {
  try {
    const pool = await getDbPool();
    // Adicionar verificação de uso futuro (ex: verificar se está em uso por algum Modelo)
    await pool.request()
      .input('id', sql.NVarChar, id)
      .query`DELETE FROM PortTypes WHERE id = @id AND isDefault = 0`;

    await logAuditEvent({ action: 'PORT_TYPE_DELETED', entityType: 'PortTypes', entityId: id });
    revalidatePath('/system');

  } catch (error: any) {
    throw new Error('Falha ao excluir o tipo de porta.');
  }
}
