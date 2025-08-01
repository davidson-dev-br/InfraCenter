
'use server';

import { getDbPool } from './db';
import mysql from 'mysql2/promise';

/**
 * Tenta estabelecer uma conexão de teste com o banco de dados MySQL local.
 * Lê as credenciais das variáveis de ambiente.
 * Retorna um objeto com os detalhes da conexão ou do erro.
 */
export async function getMysqlTestConnection() {
  const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

  if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_DATABASE) {
    return { success: false, message: 'As variáveis de ambiente para o MySQL (HOST, USER, DATABASE) não estão completamente definidas.', data: null };
  }

  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
        host: MYSQL_HOST,
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        database: MYSQL_DATABASE,
    });
    const [rows] = await connection.execute('SELECT "Conexão com o MySQL bem-sucedida!" as message;');
    return { success: true, message: "Consulta executada com sucesso!", data: rows };
  } catch (error: any) {
    return { success: false, message: `Erro de conexão/consulta: ${error.message}`, data: null };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * Server Action para listar todas as tabelas e suas colunas do banco de dados principal (Azure SQL).
 * Retorna um objeto com os dados ou um erro.
 */
export async function listAllTables() {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(`
      SELECT
          c.TABLE_SCHEMA,
          c.TABLE_NAME,
          c.COLUMN_NAME,
          c.DATA_TYPE,
          c.CHARACTER_MAXIMUM_LENGTH,
          c.IS_NULLABLE
      FROM INFORMATION_SCHEMA.TABLES AS t
      JOIN INFORMATION_SCHEMA.COLUMNS AS c ON t.TABLE_NAME = c.TABLE_NAME AND t.TABLE_SCHEMA = c.TABLE_SCHEMA
      WHERE t.TABLE_TYPE = 'BASE TABLE' AND t.TABLE_SCHEMA = 'dbo'
      ORDER BY
          t.TABLE_NAME,
          c.ORDINAL_POSITION;
    `);
    return { success: true, data: result.recordset, error: null };
  } catch (error: any) {
    console.error('Erro ao listar tabelas e colunas:', error);
    return { success: false, data: null, error: error.message };
  }
}
