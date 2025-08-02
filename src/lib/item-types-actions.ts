
'use server';

import sql from 'mssql';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getDbPool } from '@/lib/db';
import { logAuditEvent } from '@/lib/audit-actions';

// Interface para ambos os tipos de item, com propriedades opcionais
export interface ItemType {
  id: string;
  name: string;
  category: string;
  defaultWidthM: number;
  defaultHeightM: number;
  iconName?: string;
  canHaveChildren?: boolean; // Apenas para ItemTypes
  isResizable?: boolean;     // Apenas para ItemTypes
  status: 'active' | 'deleted';
  defaultColor?: string;
}

const parentItemTypeSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  category: z.string().min(3, 'A categoria deve ter pelo menos 3 caracteres.'),
  defaultWidthM: z.coerce.number().positive('A largura deve ser um número positivo.'),
  defaultHeightM: z.coerce.number().positive('A altura deve ser um número positivo.'),
  iconName: z.string().optional().nullable(),
  canHaveChildren: z.boolean(),
  isResizable: z.boolean(),
  defaultColor: z.string().optional().nullable(),
});

const childItemTypeSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    iconName: z.string().optional().nullable(),
    // Campos que não serão mostrados na UI, mas precisam de valores padrão para a action.
    category: z.string().default('Equipamento'), 
    defaultWidthM: z.coerce.number().default(0),
    defaultHeightM: z.coerce.number().default(0),
    defaultColor: z.string().optional().nullable(),
});

type ItemTypeData = z.infer<typeof parentItemTypeSchema> | z.infer<typeof childItemTypeSchema>;

const getTableName = (isParentType: boolean) => (isParentType ? 'ItemTypes' : 'ItemTypesEqp');

export async function getItemTypes(isParentType: boolean): Promise<ItemType[]> {
  const tableName = getTableName(isParentType);
  try {
    const pool = await getDbPool();
    const query = `SELECT * FROM ${tableName} WHERE status = 'active' ORDER BY category, name`;
    const result = await pool.request().query(query);
    return result.recordset as ItemType[];
  } catch (error) {
    console.error(`Erro de banco de dados ao buscar tipos de item de ${tableName}:`, error);
    return [];
  }
}

export async function addItemType(data: ItemTypeData, isParentType: boolean) {
    const tableName = getTableName(isParentType);
    const schema = isParentType ? parentItemTypeSchema : childItemTypeSchema;
    
    const validation = schema.safeParse(data);
    if (!validation.success) {
      throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }
  
    const validatedData = validation.data;
    const newId = `type_${Date.now()}`;

    try {
      const pool = await getDbPool();
      const request = pool.request()
        .input('id', sql.NVarChar, newId)
        .input('name', sql.NVarChar, validatedData.name)
        .input('iconName', sql.NVarChar, validatedData.iconName || null)
        .input('status', sql.NVarChar, 'active');
      
      let query = '';
      if (isParentType && 'canHaveChildren' in validatedData && 'isResizable' in validatedData) {
          request
            .input('category', sql.NVarChar, validatedData.category)
            .input('defaultWidthM', sql.Float, validatedData.defaultWidthM)
            .input('defaultHeightM', sql.Float, validatedData.defaultHeightM)
            .input('canHaveChildren', sql.Bit, validatedData.canHaveChildren)
            .input('isResizable', sql.Bit, validatedData.isResizable)
            .input('defaultColor', sql.NVarChar, validatedData.defaultColor || null);
          query = `INSERT INTO ${tableName} (id, name, category, defaultWidthM, defaultHeightM, iconName, canHaveChildren, isResizable, status, defaultColor)
                   VALUES (@id, @name, @category, @defaultWidthM, @defaultHeightM, @iconName, @canHaveChildren, @isResizable, @status, @defaultColor)`;
      } else if (!isParentType && 'category' in validatedData) {
          request
            .input('category', sql.NVarChar, validatedData.category)
            .input('defaultWidthM', sql.Float, validatedData.defaultWidthM)
            .input('defaultHeightM', sql.Float, validatedData.defaultHeightM)
            .input('defaultColor', sql.NVarChar, validatedData.defaultColor || null);
          query = `INSERT INTO ${tableName} (id, name, category, defaultWidthM, defaultHeightM, iconName, status, defaultColor)
                   VALUES (@id, @name, @category, @defaultWidthM, @defaultHeightM, @iconName, @status, @defaultColor)`;
      } else {
        throw new Error("Dados inválidos para o tipo de item.");
      }
        
      await request.query(query);
      
      await logAuditEvent({
        action: 'ITEM_TYPE_CREATED',
        entityType: tableName,
        entityId: newId,
        details: { name: validatedData.name }
      });

      revalidatePath('/system');
    } catch (error: any) {
      console.error(`Erro de banco de dados ao adicionar tipo de item em ${tableName}:`, error);
      if (error.number === 2627 || error.number === 2601) { // Unique constraint violation
        throw new Error('Um tipo de item com este nome já existe.');
      }
      throw new Error('Falha ao adicionar o tipo de item no banco de dados.');
    }
}

export async function updateItemType(id: string, data: ItemTypeData, isParentType: boolean): Promise<void> {
  const tableName = getTableName(isParentType);
  const schema = isParentType ? parentItemTypeSchema : childItemTypeSchema;

  const validation = schema.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors.map((e) => e.message).join(', '));
  }
  
  const validatedData = validation.data;

  try {
    const pool = await getDbPool();
    const request = pool.request()
        .input('id', sql.NVarChar, id)
        .input('name', sql.NVarChar, validatedData.name)
        .input('iconName', sql.NVarChar, validatedData.iconName || null);
    
    let query = '';
    if (isParentType && 'canHaveChildren' in validatedData && 'isResizable' in validatedData) {
        request
          .input('category', sql.NVarChar, validatedData.category)
          .input('defaultWidthM', sql.Float, validatedData.defaultWidthM)
          .input('defaultHeightM', sql.Float, validatedData.defaultHeightM)
          .input('canHaveChildren', sql.Bit, validatedData.canHaveChildren)
          .input('isResizable', sql.Bit, validatedData.isResizable)
          .input('defaultColor', sql.NVarChar, validatedData.defaultColor || null);
        query = `UPDATE ${tableName} SET name = @name, category = @category, defaultWidthM = @defaultWidthM, defaultHeightM = @defaultHeightM, iconName = @iconName, canHaveChildren = @canHaveChildren, isResizable = @isResizable, defaultColor = @defaultColor WHERE id = @id`;
    } else if (!isParentType && 'category' in validatedData) {
        request
          .input('category', sql.NVarChar, validatedData.category)
          .input('defaultWidthM', sql.Float, validatedData.defaultWidthM)
          .input('defaultHeightM', sql.Float, validatedData.defaultHeightM)
          .input('defaultColor', sql.NVarChar, validatedData.defaultColor || null);
        query = `UPDATE ${tableName} SET name = @name, category = @category, defaultWidthM = @defaultWidthM, defaultHeightM = @defaultHeightM, iconName = @iconName, defaultColor = @defaultColor WHERE id = @id`;
    } else {
        throw new Error("Dados inválidos para o tipo de item.");
    }

    await request.query(query);

    await logAuditEvent({
        action: 'ITEM_TYPE_UPDATED',
        entityType: tableName,
        entityId: id,
        details: { changes: data }
    });

    revalidatePath('/system');
  } catch (error: any) {
    console.error(`Erro de banco de dados ao atualizar o tipo de item em ${tableName}:`, error);
    if (error.number === 2627 || error.number === 2601) {
      throw new Error('Um tipo de item com este nome já existe.');
    }
    throw new Error('Falha ao atualizar o tipo de item no banco de dados.');
  }
}

export async function deleteItemType(id: string, isParentType: boolean): Promise<void> {
    const tableName = getTableName(isParentType);
    const itemInstanceTable = isParentType ? 'ParentItems' : 'ChildItems';

    if (!id) {
        throw new Error('O ID do tipo de item é obrigatório para a exclusão.');
    }

    try {
        const pool = await getDbPool();
        
        const typeToDeleteResult = await pool.request().input('id', sql.NVarChar, id).query(`SELECT name FROM ${tableName} WHERE id = @id`);
        if(typeToDeleteResult.recordset.length === 0) {
            throw new Error('Tipo de item não encontrado.');
        }
        const typeName = typeToDeleteResult.recordset[0].name;

        const usageCheck = await pool.request()
            .input('typeName', sql.NVarChar, typeName)
            .query(`SELECT TOP 1 id FROM ${itemInstanceTable} WHERE type = @typeName AND status != 'decommissioned'`);

        if (usageCheck.recordset.length > 0) {
            throw new Error('Este tipo de item está em uso por equipamentos ativos e não pode ser excluído.');
        }

        await pool.request()
            .input('id', sql.NVarChar, id)
            .query(`UPDATE ${tableName} SET status = 'deleted' WHERE id = @id`);
        
        await logAuditEvent({
            action: 'ITEM_TYPE_SOFT_DELETED',
            entityType: tableName,
            entityId: id,
            details: { name: typeName }
        });

        revalidatePath('/system');
        revalidatePath('/trash');

    } catch (error: any) {
        if (error.message.includes('em uso')) {
            throw error;
        }
        
        console.error(`Erro de banco de dados ao excluir o tipo de item de ${tableName}:`, error);
        throw new Error('Falha ao excluir o tipo de item no banco de dados.');
    }
}

export async function getDeletedItemTypes(): Promise<ItemType[]> {
    try {
        const pool = await getDbPool();
        const parentTypes = await pool.request().query("SELECT * FROM ItemTypes WHERE status = 'deleted' ORDER BY name");
        const childTypes = await pool.request().query("SELECT * FROM ItemTypesEqp WHERE status = 'deleted' ORDER BY name");
        
        return [...parentTypes.recordset, ...childTypes.recordset] as ItemType[];
    } catch (error) {
        console.error('Erro ao buscar tipos de item deletados:', error);
        return [];
    }
}

export async function restoreItemType(typeId: string): Promise<void> {
    if (!typeId) {
        throw new Error('O ID do tipo de item é obrigatório para a restauração.');
    }
    
    const pool = await getDbPool();
    // Tenta restaurar em ambas as tabelas. A que não tiver o ID, simplesmente não fará nada.
    try {
        await pool.request().input('id', sql.NVarChar, typeId).query("UPDATE ItemTypes SET status = 'active' WHERE id = @id");
        await pool.request().input('id', sql.NVarChar, typeId).query("UPDATE ItemTypesEqp SET status = 'active' WHERE id = @id");

        revalidatePath('/trash');
        revalidatePath('/system');
    } catch (error) {
        console.error('Erro ao restaurar tipo de item:', error);
        throw new Error('Falha ao restaurar o tipo de item no banco de dados.');
    }
}

export async function permanentlyDeleteItemType(typeId: string): Promise<void> {
    if (!typeId) {
        throw new Error('O ID do tipo de item é obrigatório para a exclusão permanente.');
    }
    
    const pool = await getDbPool();
    try {
        await pool.request().input('id', sql.NVarChar, typeId).query("DELETE FROM ItemTypes WHERE id = @id AND status = 'deleted'");
        await pool.request().input('id', sql.NVarChar, typeId).query("DELETE FROM ItemTypesEqp WHERE id = @id AND status = 'deleted'");

        revalidatePath('/trash');
    } catch (error) {
        console.error('Erro ao excluir permanentemente o tipo de item:', error);
        throw new Error('Falha ao excluir permanentemente o tipo de item no banco de dados.');
    }
}
