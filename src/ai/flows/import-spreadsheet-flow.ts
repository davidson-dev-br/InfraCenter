'use server';
/**
 * @fileOverview An AI flow to import equipment data from a spreadsheet.
 *
 * - importFromSpreadsheet - A function that handles the data import process.
 */

import {ai} from '@/ai/genkit';
import {
    ImportFromSpreadsheetInput,
    ImportFromSpreadsheetInputSchema,
    ImportFromSpreadsheetOutput,
    ImportFromSpreadsheetOutputSchema,
} from '@/ai/schemas';

const importSpreadsheetPrompt = ai.definePrompt({
    name: 'importSpreadsheetPrompt',
    input: {schema: ImportFromSpreadsheetInputSchema},
    output: {schema: ImportFromSpreadsheetOutputSchema},
    prompt: `Você é um assistente especialista em migração de dados para um sistema de gerenciamento de infraestrutura de TI.
Você receberá uma representação JSON de uma planilha contendo dados de inventário.
Sua tarefa é analisar esses dados JSON, mapear inteligentemente as colunas para o esquema de equipamento e retornar uma lista limpa de objetos de equipamento.

Dados JSON da planilha:
\`\`\`json
{{{jsonData}}}
\`\`\`

Heurísticas de Mapeamento:
- 'hostname': Procure por colunas nomeadas 'Hostname', 'Device Name', 'Asset', 'Name', 'Nome do Dispositivo', 'Ativo' ou similar. Este é o identificador primário.
- 'brand': Procure por 'Manufacturer', 'Brand', 'Make', 'Fabricante', 'Marca'.
- 'model': Procure por 'Model', 'Product Name', 'Modelo'.
- 'serialNumber': Procure por 'Serial Number', 'S/N', 'Serial', 'Número de Série'.
- 'type': Procure por 'Type', 'Category', 'Tipo', 'Categoria' (ex: Switch, Server, Roteador).
- 'status': Procure por 'Status', 'Condition', 'Condição'.
- 'positionU': Procure por 'U Position', 'Position', 'Posição U', 'Posição'.
- 'sizeU': Procure por 'Size (U)', 'Height', 'Tamanho (U)', 'Altura'.
- 'tag': Procure por 'Asset Tag', 'TAG', 'Etiqueta de Patrimônio'.
- 'description': Procure por 'Description', 'Notes', 'Descrição', 'Observações'.

Para cada linha no JSON de entrada, crie um objeto de equipamento correspondente na saída. Se você não conseguir encontrar um mapeamento claro para um campo, omita-o do objeto. Não invente dados.
Foque apenas em extrair a lista de equipamentos.
`,
});


const importFromSpreadsheetFlow = ai.defineFlow(
  {
    name: 'importFromSpreadsheetFlow',
    inputSchema: ImportFromSpreadsheetInputSchema,
    outputSchema: ImportFromSpreadsheetOutputSchema,
  },
  async (input) => {
    const {output} = await importSpreadsheetPrompt(input);
    return output!;
  }
);

export async function importFromSpreadsheet(input: ImportFromSpreadsheetInput): Promise<ImportFromSpreadsheetOutput> {
  return importFromSpreadsheetFlow(input);
}
