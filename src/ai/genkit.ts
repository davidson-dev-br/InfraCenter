import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
<<<<<<< HEAD
  plugins: [googleAI()],
=======
  plugins: [
    googleAI(),
  ],
>>>>>>> d3ee8b12c20e0454b2def011137783add0a5af09
  model: 'googleai/gemini-2.0-flash',
});
