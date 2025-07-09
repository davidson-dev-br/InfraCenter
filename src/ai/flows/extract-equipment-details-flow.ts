'use server';
/**
 * @fileOverview An AI flow to extract equipment details from a photo.
 *
 * - extractEquipmentDetails - A function that handles the equipment detail extraction process.
 */

import {ai} from '@/ai/genkit';
import {
    ExtractEquipmentInput,
    ExtractEquipmentInputSchema,
    ExtractEquipmentOutput,
    ExtractEquipmentOutputSchema,
} from '@/ai/schemas';


const prompt = ai.definePrompt({
  name: 'extractEquipmentPrompt',
  input: {schema: ExtractEquipmentInputSchema},
  output: {schema: ExtractEquipmentOutputSchema},
  prompt: `You are an expert IT asset management assistant. Your task is to analyze the provided image of a piece of network or server hardware.

Carefully examine the image for any text, labels, or logos. Identify the equipment type, manufacturer (brand), model name/number, serial number, hostname, and any asset tags.

Extract this information accurately. If a specific piece of information is not visible or cannot be identified, omit that field from the output.

Photo: {{media url=photoDataUri}}`,
});


const extractEquipmentDetailsFlow = ai.defineFlow(
  {
    name: 'extractEquipmentDetailsFlow',
    inputSchema: ExtractEquipmentInputSchema,
    outputSchema: ExtractEquipmentOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function extractEquipmentDetails(input: ExtractEquipmentInput): Promise<ExtractEquipmentOutput> {
  return extractEquipmentDetailsFlow(input);
}
