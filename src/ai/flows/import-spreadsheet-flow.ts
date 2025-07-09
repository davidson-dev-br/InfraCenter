'use server';
/**
 * @fileOverview An AI flow to import equipment data from a spreadsheet.
 *
 * - importFromSpreadsheet - A function that handles the data import process.
 */

import {ai} from '@/ai/genkit';
import {
    ImportFromSpreadsheetInput,
    ImportFromSpreadsheetInputSchema,
    ImportFromSpreadsheetOutput,
    ImportFromSpreadsheetOutputSchema,
} from '@/ai/schemas';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { SystemSettings } from '@/lib/types';

const importFromSpreadsheetFlow = ai.defineFlow(
  {
    name: 'importFromSpreadsheetFlow',
    inputSchema: ImportFromSpreadsheetInputSchema,
    outputSchema: ImportFromSpreadsheetOutputSchema,
  },
  async (input) => {
    if (!db) {
      throw new Error("Firebase not configured.");
    }
    const settingsDoc = await getDoc(doc(db, 'system', 'settings'));
    const settings = settingsDoc.data() as SystemSettings;
    const promptText = settings.prompts?.importFromSpreadsheet;

    if (!promptText) {
        throw new Error("Prompt 'importFromSpreadsheet' not found in system settings.");
    }

    const prompt = ai.definePrompt({
      name: 'importSpreadsheetPrompt_dynamic',
      input: {schema: ImportFromSpreadsheetInputSchema},
      output: {schema: ImportFromSpreadsheetOutputSchema},
      prompt: promptText,
    });

    const {output} = await prompt(input);
    return output!;
  }
);

export async function importFromSpreadsheet(input: ImportFromSpreadsheetInput): Promise<ImportFromSpreadsheetOutput> {
  return importFromSpreadsheetFlow(input);
}
