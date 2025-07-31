
'use server';
import sql from 'mssql';
import mysql from 'mysql2/promise';

// Este é um módulo exclusivo do servidor para interagir com o banco de dados.

let pool: sql.ConnectionPool | undefined;

async function createPool(): Promise<sql.ConnectionPool> {
    const connectionString = process.env.AZURE_DATABASE_URL;
    if (!connectionString) {
        throw new Error('A variável de ambiente AZURE_DATABASE_URL não está definida. A aplicação não pode se conectar ao banco de dados.');
    }
    
    // Análise da string de conexão para adicionar ou modificar timeouts
    const config: sql.config = {
        server: '',
        database: '',
        user: '',
        password: '',
        options: {
            encrypt: true,
        },
        // Aumenta o tempo limite da conexão de 15s (padrão) para 30s
        connectionTimeout: 30000, 
        // Aumenta o tempo limite da requisição de 15s (padrão) para 30s
        requestTimeout: 30000,
    };
    
    connectionString.split(';').forEach(part => {
        const [key, ...valueParts] = part.split('=');
        const value = valueParts.join('=');
        const lowerKey = key.toLowerCase().trim();
        if (!value) return;

        if (lowerKey === 'server') config.server = value.replace('tcp:', '').split(',')[0];
        if (lowerKey === 'initial catalog' || lowerKey === 'database') config.database = value;
        if (lowerKey === 'user id') config.user = value;
        if (lowerKey === 'password') config.password = value;
    });

    try {
        console.log("Conectando ao Azure SQL com timeouts aumentados...");
        const newPool = new sql.ConnectionPool(config);
        
        newPool.on('error', (err) => {
          console.error('Erro inesperado no pool do banco de dados:', err);
        });

        await newPool.connect();
        console.log("Conexão com Azure SQL estabelecida com sucesso.");
        return newPool;
    } catch (err: any) {
        throw new Error(`Falha ao conectar ao banco de dados: ${err.message}`);
    }
}


export async function getDbPool(): Promise<sql.ConnectionPool> {
    if (pool && pool.connected) {
        return pool;
    }

    if (pool) {
        // Tenta fechar o pool antigo se ele existir, mas não estiver conectado
        await pool.close();
    }
    
    pool = await createPool();
    return pool;
}

/**
 * Tenta estabelecer uma conexão de teste com o banco de dados MySQL local.
 * Lê as credenciais das variáveis de ambiente.
 * Retorna a conexão ou um erro.
 */
export async function getMysqlTestConnection() {
    const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

    if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_DATABASE) {
        return { connection: null, error: 'As variáveis de ambiente para o MySQL (HOST, USER, DATABASE) não estão completamente definidas.' };
    }

    try {
        const connection = await mysql.createConnection({
            host: MYSQL_HOST,
            user: MYSQL_USER,
            password: MYSQL_PASSWORD,
            database: MYSQL_DATABASE,
        });
        return { connection, error: null };
    } catch (error: any) {
        return { connection: null, error: error.message };
    }
}
