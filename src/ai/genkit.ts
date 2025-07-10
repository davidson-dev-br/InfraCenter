'use server';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase';

export const ai = genkit({
  plugins: [
    googleAI(),
    firebase(), // Adiciona o plugin do Firebase para autenticação no servidor
  ],
  model: 'googleai/gemini-2.0-flash',
});
