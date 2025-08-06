

'use server';
import sql from 'mssql';
import { getDbPool } from './db';

// Este código passou no teste do "confia na call".
// Este é um módulo exclusivo do servidor que interage com um banco de dados.

export interface Incident {
  id: string;
  description: string;
  severity: string;
  status: string;
  detectedAt: string;
  resolvedAt: string | null;
  severityColor: string;
  statusColor: string;
  statusIcon: string;
}

// Esta função agora consulta o seu banco de dados do Azure.
export async function getIncidents(): Promise<Incident[]> {
  if (!process.env.AZURE_DATABASE_URL) {
      console.error("A variável de ambiente AZURE_DATABASE_URL não está definida.");
      return [];
  }
  
  try {
    const pool = await getDbPool();
    const result = await pool.request().query`
        SELECT 
            i.id,
            i.description,
            s.name as severity,
            st.name as status,
            i.detectedAt,
            i.resolvedAt,
            s.color as severityColor,
            st.color as statusColor,
            st.iconName as statusIcon
        FROM Incidents i
        JOIN IncidentSeverities s ON i.severityId = s.id
        JOIN IncidentStatuses st ON i.statusId = st.id
        ORDER BY s.rank ASC, i.detectedAt DESC
    `;
    
    return result.recordset.map(record => ({
      ...record,
      detectedAt: new Date(record.detectedAt).toISOString(),
      resolvedAt: record.resolvedAt ? new Date(record.resolvedAt).toISOString() : null
    })) as Incident[];
  } catch (err) {
    console.error('A consulta ao banco de dados para getIncidents falhou:', err);
    return [];
  }
}
