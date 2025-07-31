
'use server';

import sql from 'mssql';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getDbPool } from './db';
import { logAuditEvent } from './audit-actions';

// Interface for a Connection Type
export interface ConnectionType {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
}

// Validation schema for the form data
const connectionTypeSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  description: z.string().optional().nullable(),
});

type ConnectionTypeData = z.infer<typeof connectionTypeSchema>;

/**
 * Fetches all active connection types from the database.
 */
export async function getConnectionTypes(): Promise<ConnectionType[]> {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query`
      SELECT id, name, description, isDefault
      FROM ConnectionTypes
      ORDER BY isDefault DESC, name ASC
    `;
    // Ensure isDefault is always a boolean
    return result.recordset.map(r => ({ ...r, isDefault: !!r.isDefault }));
  } catch (error) {
    console.error('Erro ao buscar tipos de conexão:', error);
    return [];
  }
}

/**
 * Adds a new connection type.
 */
export async function addConnectionType(data: ConnectionTypeData) {
  const validation = connectionTypeSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors.map(e => e.message).join(', '));
  }

  const { name, description } = validation.data;
  const newId = `ctype_${Date.now()}`;

  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', sql.NVarChar, newId)
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description || null)
      .input('isDefault', sql.Bit, false)
      .query`
        INSERT INTO ConnectionTypes (id, name, description, isDefault)
        VALUES (@id, @name, @description, @isDefault)
      `;

    await logAuditEvent({ action: 'CONNECTION_TYPE_CREATED', entityType: 'ConnectionTypes', entityId: newId, details: { name } });
    revalidatePath('/system');

  } catch (error: any) {
    if (error.number === 2627 || error.number === 2601) { // Unique constraint
      throw new Error('Um tipo de conexão com este nome já existe.');
    }
    throw new Error('Falha ao adicionar o tipo de conexão no banco de dados.');
  }
}

/**
 * Updates an existing connection type.
 */
export async function updateConnectionType(id: string, data: ConnectionTypeData) {
  const validation = connectionTypeSchema.safeParse(data);
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
        UPDATE ConnectionTypes
        SET name = @name, description = @description
        WHERE id = @id AND isDefault = 0
      `;

    await logAuditEvent({ action: 'CONNECTION_TYPE_UPDATED', entityType: 'ConnectionTypes', entityId: id, details: { changes: data } });
    revalidatePath('/system');

  } catch (error: any) {
    if (error.number === 2627 || error.number === 2601) {
      throw new Error('Um tipo de conexão com este nome já existe.');
    }
    throw new Error('Falha ao atualizar o tipo de conexão.');
  }
}

/**
 * Deletes a connection type.
 */
export async function deleteConnectionType(id: string) {
  try {
    const pool = await getDbPool();
    // In the future, add a check for usage (e.g., if any connection instances use this type)
    await pool.request()
      .input('id', sql.NVarChar, id)
      .query`DELETE FROM ConnectionTypes WHERE id = @id AND isDefault = 0`;

    await logAuditEvent({ action: 'CONNECTION_TYPE_DELETED', entityType: 'ConnectionTypes', entityId: id });
    revalidatePath('/system');

  } catch (error: any) {
    throw new Error('Falha ao excluir o tipo de conexão.');
  }
}
