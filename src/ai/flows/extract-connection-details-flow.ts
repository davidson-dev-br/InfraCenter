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

const extractConnectionPrompt = ai.definePrompt({
    name: 'extractConnectionPrompt',
    input: {schema: ExtractConnectionInputSchema},
    output: {schema: ExtractConnectionOutputSchema},
    prompt: `Você é um assistente especialista em infraestrutura de TI, especializado em ler etiquetas de cabos. Sua tarefa é analisar a imagem fornecida de uma etiqueta de cabo.

A etiqueta geralmente segue o formato DE/PARA (FROM/TO).
- "DE" refere-se ao dispositivo e porta de origem.
- "PARA" refere-se ao dispositivo e porta de destino.

Examine cuidadosamente a imagem em busca de qualquer texto. Identifique o identificador principal da etiqueta (o texto mais proeminente, muitas vezes um ID de patch panel), o hostname e a porta do dispositivo de origem, e o hostname e a porta do dispositivo de destino.

Exemplo de texto da etiqueta:
"P-01-A-01
DE: SW-CORE-01 | Gi1/0/1
PARA: FW-EDGE-02 | PortA"

Para o exemplo acima, você extrairia:
- cableLabel: "P-01-A-01"
- sourceHostname: "SW-CORE-01"
- sourcePort: "Gi1/0/1"
- destinationHostname: "FW-EDGE-02"
- destinationPort: "PortA"

Extraia essas informações com precisão. Se uma informação específica não estiver visível ou não puder ser identificada, omita esse campo na saída.

Foto: {{media url=photoDataUri}}`,
});


const extractConnectionDetailsFlow = ai.defineFlow(
  {
    name: 'extractConnectionDetailsFlow',
    inputSchema: ExtractConnectionInputSchema,
    outputSchema: ExtractConnectionOutputSchema,
  },
  async (input) => {
    const {output} = await extractConnectionPrompt(input);
    return output!;
  }
);

export async function extractConnectionDetails(input: ExtractConnectionInput): Promise<ExtractConnectionOutput> {
  return extractConnectionDetailsFlow(input);
}
