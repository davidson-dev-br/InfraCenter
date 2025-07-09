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

const prompt = ai.definePrompt({
  name: 'importSpreadsheetPrompt',
  input: {schema: ImportFromSpreadsheetInputSchema},
  output: {schema: ImportFromSpreadsheetOutputSchema},
  prompt: `You are an expert data migration assistant for an IT infrastructure management system.
You will be provided with a JSON representation of a spreadsheet containing inventory data.
Your task is to analyze this JSON data, intelligently map the columns to the equipment schema, and return a clean list of equipment objects.

Spreadsheet JSON data:
\`\`\`json
{{{jsonData}}}
\`\`\`

Mapping Heuristics:
- 'hostname': Look for columns named 'Hostname', 'Device Name', 'Asset', 'Name', or similar. This is the primary identifier.
- 'brand': Look for 'Manufacturer', 'Brand', 'Make', 'Fabricante'.
- 'model': Look for 'Model', 'Product Name', 'Modelo'.
- 'serialNumber': Look for 'Serial Number', 'S/N', 'Serial', 'Número de Série'.
- 'type': Look for 'Type', 'Category', 'Tipo', 'Categoria' (e.g., Switch, Server, Router).
- 'status': Look for 'Status', 'Condition'.
- 'positionU': Look for 'U Position', 'Position', 'Posição'.
- 'sizeU': Look for 'Size (U)', 'Height', 'Tamanho (U)'.
- 'tag': Look for 'Asset Tag', 'TAG'.
- 'description': Look for 'Description', 'Notes', 'Descrição'.

For each row in the input JSON, create a corresponding equipment object in the output. If you cannot find a clear mapping for a field, omit it from the object. Do not invent data.
Focus only on extracting the equipment list.
`,
});

const importFromSpreadsheetFlow = ai.defineFlow(
  {
    name: 'importFromSpreadsheetFlow',
    inputSchema: ImportFromSpreadsheetInputSchema,
    outputSchema: ImportFromSpreadsheetOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function importFromSpreadsheet(input: ImportFromSpreadsheetInput): Promise<ImportFromSpreadsheetOutput> {
  return importFromSpreadsheetFlow(input);
}
