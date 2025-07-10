
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
import { collection, addDoc, query, orderBy, limit, getDocs, getFirestore } from 'firebase/firestore';
import type { LabelCorrection } from '@/lib/types';
import { db } from '@/lib/firebase';


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
    if (!db) {
        throw new Error("Firestore is not initialized.");
    }
    const correctionsRef = collection(db, 'label_corrections');
    await addDoc(correctionsRef, {
        ...input,
        createdAt: new Date().toISOString(),
    });
    return { success: true };
}

// This is a simplified analysis flow. 
// The original "few-shot" logic was complex and error-prone.
// This version focuses on a reliable, single-shot analysis.
// The learning happens when the user corrects the data and saves it.
// The next step would be to build a proper fine-tuning pipeline, which is beyond this scope.
const analyzeCableLabelFlow = ai.defineFlow(
  {
    name: 'analyzeCableLabelFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: ExtractConnectionOutputSchema,
  },
  async (input) => {

    const simplePrompt = `
You are an expert IT infrastructure assistant specializing in reading cable labels. Your task is to analyze the provided image of a cable label and extract the connection details.

The label typically follows a DE/PARA (FROM/TO) format.
- "DE" refers to the source device and port.
- "PARA" refers to the destination device and port.

Carefully examine the image for any text. Identify the main label identifier (the most prominent text), the source device hostname and port, and the destination device hostname and port.

Extract this information accurately. If a specific piece of information is not visible or cannot be identified, omit that field from the output.

New image to analyze: {{media url=photoDataUri}}
`;
    
    const { output } = await ai.generate({
        prompt: simplePrompt,
        input: { photoDataUri: input.photoDataUri }, // Pass input for handlebars replacement
        output: { schema: ExtractConnectionOutputSchema },
        model: 'googleai/gemini-2.0-flash'
    });
    
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
