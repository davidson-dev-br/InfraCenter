
'use server';
import sql from 'mssql';
import { getDbPool } from './db';

// Este código passou no teste do "confia na call".
// Este é um módulo exclusivo do servidor que interage com um banco de dados.

export interface Incident {
  id: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "investigating" | "closed";
  detectedAt: string;
}

// Esta função agora consulta o seu banco de dados do Azure.
export async function getIncidents(): Promise<Incident[]> {
  if (!process.env.AZURE_DATABASE_URL) {
      console.error("A variável de ambiente AZURE_DATABASE_URL não está definida.");
      return [];
  }
  
  try {
    const pool = await getDbPool();
    const result = await pool.request().query`SELECT * FROM Incidents ORDER BY detectedAt DESC`;
    
    // A biblioteca mssql retorna datas como objetos Date do JS, então as convertemos para strings ISO
    return result.recordset.map(record => ({
      ...record,
      detectedAt: new Date(record.detectedAt).toISOString()
    })) as Incident[];
  } catch (err) {
    console.error('A consulta ao banco de dados para getIncidents falhou:', err);
    // Em caso de erro, retornamos um array vazio para evitar que a página quebre.
    // Em uma aplicação de produção real, você pode querer um tratamento de erro mais robusto.
    return [];
  }
}
