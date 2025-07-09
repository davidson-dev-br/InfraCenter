'use server';
/**
 * @fileOverview Server actions to dynamically run AI flows for developer testing.
 */

import { z } from 'zod';
import { ExtractConnectionInputSchema, ExtractConnectionOutputSchema } from './extract-connection-details-flow';
import { ExtractEquipmentInputSchema, ExtractEquipmentOutputSchema } from './extract-equipment-details-flow';
import { ImportFromSpreadsheetInputSchema, ImportFromSpreadsheetOutputSchema } from './import-spreadsheet-flow';
import { ai } from '@/ai/genkit';

const RunDynamicFlowInputSchema = z.object({
  flowName: z.enum(['extractEquipmentDetails', 'extractConnectionDetails', 'importFromSpreadsheet']),
  customPrompt: z.string().describe("The user-provided prompt to execute."),
  inputJson: z.string().describe("A JSON string representing the input for the selected flow."),
});
type RunDynamicFlowInput = z.infer<typeof RunDynamicFlowInputSchema>;

export async function runDynamicFlow(input: RunDynamicFlowInput): Promise<string> {
    const { flowName, customPrompt, inputJson } = input;
    
    try {
        const parsedInput = JSON.parse(inputJson);
        let outputSchema;

        // The 'prompt' for ai.generate can be a simple string or an array of Parts.
        // We build an array of parts to handle prompts that include media, like images.
        const promptParts: ({ text: string } | { media: { url: string } })[] = [];

        // This is a simplified template replacer. It looks for {{media url=...}} tags.
        const mediaRegex = /\{\{media url=([a-zA-Z0-9_]+)\}\}/g;
        let lastIndex = 0;
        let match;

        // Find all media tags and create media parts for them.
        while ((match = mediaRegex.exec(customPrompt)) !== null) {
            // Add the text part that comes before the media tag.
            if (match.index > lastIndex) {
                promptParts.push({ text: customPrompt.substring(lastIndex, match.index) });
            }
            // Add the media part itself.
            const mediaKey = match[1];
            if (parsedInput[mediaKey]) {
                promptParts.push({ media: { url: parsedInput[mediaKey] } });
            }
            lastIndex = match.index + match[0].length;
        }

        // Add any remaining text after the last media tag.
        if (lastIndex < customPrompt.length) {
            promptParts.push({ text: customPrompt.substring(lastIndex) });
        }
        
        // Now, for any text parts, replace other placeholders like {{{jsonData}}}.
        const finalPromptParts = promptParts.map(part => {
            if ('text' in part) {
                part.text = part.text.replace(/\{\{\{?(\w+)\}\}?\}\}/g, (m, key) => {
                    return parsedInput[key] || "";
                });
            }
            return part;
        });

        // Determine the correct output schema based on the selected flow.
        switch (flowName) {
            case 'extractEquipmentDetails':
                outputSchema = ExtractEquipmentOutputSchema;
                ExtractEquipmentInputSchema.parse(parsedInput); // Validate input
                break;
            case 'extractConnectionDetails':
                outputSchema = ExtractConnectionOutputSchema;
                ExtractConnectionInputSchema.parse(parsedInput); // Validate input
                break;
            case 'importFromSpreadsheet':
                outputSchema = ImportFromSpreadsheetOutputSchema;
                ImportFromSpreadsheetInputSchema.parse(parsedInput); // Validate input
                break;
            default:
                throw new Error(`Invalid flow name: ${flowName}`);
        }

        // Generate the AI response with the dynamic prompt and the expected output schema.
        const { output } = await ai.generate({
            prompt: finalPromptParts,
            output: {
                schema: outputSchema,
            },
            model: 'googleai/gemini-2.0-flash'
        });

        return JSON.stringify(output, null, 2);

    } catch (error: any) {
        console.error(`Error running dynamic flow '${flowName}':`, error);
        if (error instanceof z.ZodError) {
             return JSON.stringify({ error: `Input JSON validation failed: ${error.message}` }, null, 2);
        }
        return JSON.stringify({ error: `Failed to run dynamic flow: ${error.message}` }, null, 2);
    }
}
