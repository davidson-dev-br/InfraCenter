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
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { SystemSettings } from '@/lib/types';


const extractConnectionDetailsFlow = ai.defineFlow(
  {
    name: 'extractConnectionDetailsFlow',
    inputSchema: ExtractConnectionInputSchema,
    outputSchema: ExtractConnectionOutputSchema,
  },
  async (input) => {
    if (!db) {
      throw new Error("Firebase not configured.");
    }
    const settingsDoc = await getDoc(doc(db, 'system', 'settings'));
    const settings = settingsDoc.data() as SystemSettings;
    const promptText = settings.prompts?.extractConnectionDetails;

    if (!promptText) {
        throw new Error("Prompt 'extractConnectionDetails' not found in system settings.");
    }

    const prompt = ai.definePrompt({
      name: 'extractConnectionPrompt_dynamic',
      input: {schema: ExtractConnectionInputSchema},
      output: {schema: ExtractConnectionOutputSchema},
      prompt: promptText,
    });
    
    const {output} = await prompt(input);
    return output!;
  }
);

export async function extractConnectionDetails(input: ExtractConnectionInput): Promise<ExtractConnectionOutput> {
  return extractConnectionDetailsFlow(input);
}
