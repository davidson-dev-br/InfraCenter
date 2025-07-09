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
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { SystemSettings } from '@/lib/types';


const extractEquipmentDetailsFlow = ai.defineFlow(
  {
    name: 'extractEquipmentDetailsFlow',
    inputSchema: ExtractEquipmentInputSchema,
    outputSchema: ExtractEquipmentOutputSchema,
  },
  async (input) => {
    if (!db) {
      throw new Error("Firebase not configured.");
    }
    const settingsDoc = await getDoc(doc(db, 'system', 'settings'));
    const settings = settingsDoc.data() as SystemSettings;
    const promptText = settings.prompts?.extractEquipmentDetails;

    if (!promptText) {
        throw new Error("Prompt 'extractEquipmentDetails' not found in system settings.");
    }
    
    const prompt = ai.definePrompt({
      name: 'extractEquipmentPrompt_dynamic',
      input: {schema: ExtractEquipmentInputSchema},
      output: {schema: ExtractEquipmentOutputSchema},
      prompt: promptText,
    });
    
    const {output} = await prompt(input);
    return output!;
  }
);

export async function extractEquipmentDetails(input: ExtractEquipmentInput): Promise<ExtractEquipmentOutput> {
  return extractEquipmentDetailsFlow(input);
}
