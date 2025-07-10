
'use server';
/**
 * @fileOverview An AI flow to read cable labels and learn from user corrections.
 * 
 * - analyzeCableLabelImage - Analyzes an image and suggests connection details.
 * - saveLabelCorrection - Saves a user's correction to the database for future learning.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ExtractConnectionOutput, ExtractConnectionOutputSchema } from '@/ai/schemas';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import type { LabelCorrection } from '@/lib/types';
import {getFirestore} from 'firebase-admin/firestore';

// Define the input for saving a correction
const SaveCorrectionInputSchema = z.object({
  imageDataUri: z.string().describe("The image data URI that was analyzed."),
  correctedData: ExtractConnectionOutputSchema.describe("The user-verified, correct data for the label."),
});
export type SaveCorrectionInput = z.infer<typeof SaveCorrectionInputSchema>;

// Define the input for the analysis flow
const AnalyzeImageInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a cable label as a data URI."),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;


/**
 * Saves a user's correction to the Firestore database.
 * These corrections will be used as examples for future AI prompts.
 * @param input The image and the corrected data.
 */
export async function saveLabelCorrection(input: SaveCorrectionInput): Promise<{ success: boolean }> {
    const db = getFirestore();
    const correctionsRef = collection(db, 'label_corrections');
    await addDoc(correctionsRef, {
        ...input,
        createdAt: new Date().toISOString(),
    });
    return { success: true };
}


const analyzeCableLabelFlow = ai.defineFlow(
  {
    name: 'analyzeCableLabelFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: ExtractConnectionOutputSchema,
  },
  async (input) => {
    const db = getFirestore();

    // 1. Fetch the last few corrections to use as few-shot examples
    const correctionsRef = collection(db, 'label_corrections');
    const q = query(correctionsRef, orderBy('createdAt', 'desc'), limit(5));
    const querySnapshot = await getDocs(q);
    const examples = querySnapshot.docs.map(doc => doc.data() as LabelCorrection);

    // 2. Build the dynamic prompt with examples
    const fewShotPrompt = `
You are an expert IT infrastructure assistant specializing in reading cable labels. Your task is to analyze the provided image of a cable label and extract the connection details.

Here are some examples of previous labels that have been manually corrected and verified by a user. Use them to understand the expected format and improve your accuracy.

${examples.map((ex, index) => `
---
Example ${index + 1}:
Based on this image: {{media url="${ex.imageDataUri}"}}
The correct, verified output is:
\`\`\`json
${JSON.stringify(ex.correctedData, null, 2)}
\`\`\`
---
`).join('\n')}

Now, analyze the following new image. The label typically follows a DE/PARA (FROM/TO) format.
- "DE" refers to the source device and port.
- "PARA" refers to the destination device and port.

Carefully examine the image for any text. Identify the main label identifier (the most prominent text), the source device hostname and port, and the destination device hostname and port.

Extract this information accurately. If a specific piece of information is not visible or cannot be identified, omit that field from the output.

New image to analyze: {{media url=photoDataUri}}
`;

    const prompt = ai.definePrompt({
      name: 'learningCableLabelPrompt',
      input: { schema: AnalyzeImageInputSchema },
      output: { schema: ExtractConnectionOutputSchema },
      prompt: fewShotPrompt,
    });
    
    const { output } = await prompt(input);
    return output!;
  }
);


/**
 * Analyzes a cable label image, using past corrections to improve accuracy.
 * @param input The image to analyze.
 * @returns The extracted connection details.
 */
export async function analyzeCableLabelImage(input: AnalyzeImageInput): Promise<ExtractConnectionOutput> {
  return analyzeCableLabelFlow(input);
}
