
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
 * Server Action para listar todas as tabelas de usuário do banco de dados principal (Azure SQL).
 * Retorna um objeto com os dados ou um erro.
 */
export async function listAllTables() {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(`
      SELECT TABLE_SCHEMA, TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'
      ORDER BY TABLE_NAME;
    `);
    return { success: true, data: result.recordset, error: null };
  } catch (error: any) {
    console.error('Erro ao listar tabelas:', error);
    return { success: false, data: null, error: error.message };
  }
}
