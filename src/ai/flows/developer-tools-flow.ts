'use server';
/**
 * @fileOverview A server action to dynamically run AI flows for developer testing.
 */

import { z } from 'zod';
import { extractConnectionDetails, type ExtractConnectionInput, type ExtractConnectionOutput } from './extract-connection-details-flow';
import { extractEquipmentDetails, type ExtractEquipmentInput, type ExtractEquipmentOutput } from './extract-equipment-details-flow';
import { importFromSpreadsheet, type ImportFromSpreadsheetInput, type ImportFromSpreadsheetOutput } from './import-spreadsheet-flow';

const RunAiFlowInputSchema = z.object({
  flowName: z.enum(['extractEquipmentDetails', 'extractConnectionDetails', 'importFromSpreadsheet']),
  inputJson: z.string().describe("A JSON string representing the input for the selected flow."),
});

type RunAiFlowInput = z.infer<typeof RunAiFlowInputSchema>;

export async function runAiFlow(input: RunAiFlowInput): Promise<string> {
    const { flowName, inputJson } = input;

    try {
        const parsedInput = JSON.parse(inputJson);

        let result: ExtractEquipmentOutput | ExtractConnectionOutput | ImportFromSpreadsheetOutput;

        switch (flowName) {
            case 'extractEquipmentDetails':
                result = await extractEquipmentDetails(parsedInput as ExtractEquipmentInput);
                break;
            case 'extractConnectionDetails':
                result = await extractConnectionDetails(parsedInput as ExtractConnectionInput);
                break;
            case 'importFromSpreadsheet':
                result = await importFromSpreadsheet(parsedInput as ImportFromSpreadsheetInput);
                break;
            default:
                throw new Error(`Invalid flow name: ${flowName}`);
        }

        return JSON.stringify(result, null, 2);
    } catch (error: any) {
        console.error(`Error running flow '${flowName}':`, error);
        return JSON.stringify({ error: `Failed to run flow: ${error.message}` }, null, 2);
    }
}
