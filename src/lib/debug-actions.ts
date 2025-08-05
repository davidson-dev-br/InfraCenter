

'use server';

import { getDbPool } from "./db";
import { getMysqlTestConnection as getMysqlConn } from "./db";

interface TestResult {
    success: boolean;
    message: string;
    details?: string;
}

/**
 * Server Action para testar a inicialização do Firebase Admin SDK.
 * A inicialização agora é tratada pelo fluxo Genkit, que é mais robusto.
 * Esta função foi desativada para evitar confusão e erros.
 */
export async function testFirebaseAdminInit(): Promise<TestResult> {
    console.warn("A função testFirebaseAdminInit está desativada.");
    return {
        success: false,
        message: "Teste Desativado",
        details: "A inicialização do Firebase Admin agora é gerenciada por um fluxo Genkit isolado para maior estabilidade. Esta ação de debug não é mais necessária."
    };
}


export async function getMysqlTestConnection() {
    const { connection, error } = await getMysqlConn();
    if (error || !connection) {
        return { success: false, message: error || 'Falha ao obter conexão.', data: null };
    }
    try {
        const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
        await connection.end();
        return { success: true, message: 'Conexão bem-sucedida!', data: rows };
    } catch (e: any) {
        return { success: false, message: e.message, data: null };
    }
}

export async function listAllTables() {
    try {
        const pool = await getDbPool();
        const result = await pool.request().query(`
            SELECT 
                TABLE_SCHEMA,
                TABLE_NAME,
                COLUMN_NAME,
                DATA_TYPE,
                CHARACTER_MAXIMUM_LENGTH,
                IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            ORDER BY TABLE_NAME, ORDINAL_POSITION;
        `);
        return { success: true, data: result.recordset, error: null };
    } catch (error: any) {
        return { success: false, data: null, error: error.message };
    }
}
