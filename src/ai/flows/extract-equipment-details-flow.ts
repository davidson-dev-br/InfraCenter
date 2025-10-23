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

const extractEquipmentPrompt = ai.definePrompt({
    name: 'extractEquipmentPrompt',
    input: {schema: ExtractEquipmentInputSchema},
    output: {schema: ExtractEquipmentOutputSchema},
    prompt: `Você é um assistente especialista em gerenciamento de ativos de TI. Sua tarefa é analisar a imagem fornecida de um equipamento de rede ou servidor.

Examine cuidadosamente a imagem em busca de textos, etiquetas ou logotipos. Identifique o tipo de equipamento, fabricante (marca), nome/número do modelo, número de série, hostname e quaisquer etiquetas de patrimônio.

Extraia essas informações com precisão. Se uma informação específica não estiver visível ou não puder ser identificada, omita esse campo na saída.

Foto: {{media url=photoDataUri}}`,
});

const extractEquipmentDetailsFlow = ai.defineFlow(
  {
    name: 'extractEquipmentDetailsFlow',
    inputSchema: ExtractEquipmentInputSchema,
    outputSchema: ExtractEquipmentOutputSchema,
  },
  async (input) => {
    const {output} = await extractEquipmentPrompt(input);
    return output!;
  }
);

export async function extractEquipmentDetails(input: ExtractEquipmentInput): Promise<ExtractEquipmentOutput> {
  return extractEquipmentDetailsFlow(input);
}
