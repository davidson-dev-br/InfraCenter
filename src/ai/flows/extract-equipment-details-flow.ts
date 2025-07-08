'use server';
/**
 * @fileOverview An AI flow to extract equipment details from a photo.
 *
 * - extractEquipmentDetails - A function that handles the equipment detail extraction process.
 * - ExtractEquipmentInput - The input type for the extractEquipmentDetails function.
 * - ExtractEquipmentOutput - The return type for the extractEquipmentDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractEquipmentInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a piece of hardware, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractEquipmentInput = z.infer<typeof ExtractEquipmentInputSchema>;

const ExtractEquipmentOutputSchema = z.object({
    hostname: z.string().optional().describe("The hostname of the device, if visible."),
    model: z.string().optional().describe("The model number or name of the device."),
    brand: z.string().optional().describe("The manufacturer or brand of the device (e.g., Cisco, Dell, HPE)."),
    serialNumber: z.string().optional().describe("The serial number of the device."),
    type: z.string().optional().describe("The general type of equipment (e.g., Switch, Server, Router, Patch Panel, Firewall)."),
    tag: z.string().optional().describe("Any asset tag or identification sticker number visible on the device."),
});
export type ExtractEquipmentOutput = z.infer<typeof ExtractEquipmentOutputSchema>;


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
