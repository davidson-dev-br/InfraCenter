'use server';
/**
 * @fileOverview An AI flow to extract connection details from a cable label photo.
 *
 * - extractConnectionDetails - A function that handles the connection detail extraction process.
 */

import {ai} from '@/ai/genkit';
import {
    ExtractConnectionInput,
    ExtractConnectionInputSchema,
    ExtractConnectionOutput,
    ExtractConnectionOutputSchema,
} from '@/ai/schemas';


const prompt = ai.definePrompt({
  name: 'extractConnectionPrompt',
  input: {schema: ExtractConnectionInputSchema},
  output: {schema: ExtractConnectionOutputSchema},
  prompt: `You are an expert IT infrastructure assistant specializing in reading cable labels. Your task is to analyze the provided image of a cable label.

The label typically follows a DE/PARA (FROM/TO) format.
- "DE" refers to the source device and port.
- "PARA" refers to the destination device and port.

Carefully examine the image for any text. Identify the main label identifier (the most prominent text, often a patch panel ID), the source device hostname and port, and the destination device hostname and port.

Example label text:
"P-01-A-01
DE: SW-CORE-01 | Gi1/0/1
PARA: FW-EDGE-02 | PortA"

For the example above, you would extract:
- cableLabel: "P-01-A-01"
- sourceHostname: "SW-CORE-01"
- sourcePort: "Gi1/0/1"
- destinationHostname: "FW-EDGE-02"
- destinationPort: "PortA"

Extract this information accurately. If a specific piece of information is not visible or cannot be identified, omit that field from the output.

Photo: {{media url=photoDataUri}}`,
});


const extractConnectionDetailsFlow = ai.defineFlow(
  {
    name: 'extractConnectionDetailsFlow',
    inputSchema: ExtractConnectionInputSchema,
    outputSchema: ExtractConnectionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function extractConnectionDetails(input: ExtractConnectionInput): Promise<ExtractConnectionOutput> {
  return extractConnectionDetailsFlow(input);
}
