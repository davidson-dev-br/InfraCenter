'use server';
/**
 * @fileOverview An AI flow to import equipment data from a spreadsheet.
 *
 * - importFromSpreadsheet - A function that handles the data import process.
 * - ImportFromSpreadsheetInput - The input type for the function.
 * - ImportFromSpreadsheetOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ImportFromSpreadsheetInputSchema = z.object({
  jsonData: z.string().describe("A JSON string representation of the spreadsheet data."),
});
export type ImportFromSpreadsheetInput = z.infer<typeof ImportFromSpreadsheetInputSchema>;


const ImportedEquipmentSchema = z.object({
  hostname: z.string().optional().describe("The hostname of the device."),
  model: z.string().optional().describe("The model number or name of the device."),
  serialNumber: z.string().optional().describe("The serial number of the device."),
  entryDate: z.string().optional().describe("Date in YYYY-MM-DD format if possible."),
  type: z.string().optional().describe("The general type of equipment (e.g., Switch, Server, Router)."),
  brand: z.string().optional().describe("The manufacturer or brand of the device (e.g., Cisco, Dell, HPE)."),
  tag: z.string().optional().describe("Any asset tag or identification sticker number visible on the device."),
  description: z.string().optional().describe("A brief description of the equipment."),
  sizeU: z.string().optional().describe("The size of the equipment in rack units (U)."),
  positionU: z.string().optional().describe("The position in the rack, in U."),
  status: z.string().optional().describe("The current operational status of the equipment."),
});


export const ImportFromSpreadsheetOutputSchema = z.object({
  equipment: z.array(ImportedEquipmentSchema).describe("The list of equipment extracted and mapped from the spreadsheet data."),
});
export type ImportFromSpreadsheetOutput = z.infer<typeof ImportFromSpreadsheetOutputSchema>;


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
