"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, TestTube2, AlertTriangle, FileImage, Camera, Trash2, Copy, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { runDynamicFlow } from "@/ai/flows/developer-tools-flow";
import { Input } from "@/components/ui/input";
import { useInfra } from "../datacenter-switcher";

type FlowName = 'extractEquipmentDetails' | 'extractConnectionDetails' | 'importFromSpreadsheet';

const FLOW_DETAILS: Record<FlowName, { prompt: string; input: string; hasImage: boolean }> = {
    extractEquipmentDetails: {
        prompt: `Você é um assistente especialista em gerenciamento de ativos de TI. Sua tarefa é analisar a imagem fornecida de um equipamento de rede ou servidor.

Examine cuidadosamente a imagem em busca de textos, etiquetas ou logotipos. Identifique o tipo de equipamento, fabricante (marca), nome/número do modelo, número de série, hostname e quaisquer etiquetas de patrimônio.

Extraia essas informações com precisão. Se uma informação específica não estiver visível ou não puder ser identificada, omita esse campo na saída.

Foto: {{media url=photoDataUri}}`,
        input: JSON.stringify({ photoDataUri: "data:image/jpeg;base64,..." }, null, 2),
        hasImage: true,
    },
    extractConnectionDetails: {
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
        input: JSON.stringify({ photoDataUri: "data:image/jpeg;base64,..." }, null, 2),
        hasImage: true,
    },
    importFromSpreadsheet: {
        prompt: `Você é um assistente especialista em migração de dados para um sistema de gerenciamento de infraestrutura de TI.
Você receberá uma representação JSON de uma planilha contendo dados de inventário.
Sua tarefa é analisar esses dados JSON, mapear inteligentemente as colunas para o esquema de equipamento e retornar uma lista limpa de objetos de equipamento.

Dados JSON da planilha:
\`\`\`json
{{{jsonData}}}
\`\`\`

Heurísticas de Mapeamento:
- 'hostname': Procure por colunas nomeadas 'Hostname', 'Device Name', 'Asset', 'Name', 'Nome do Dispositivo', 'Ativo' ou similar. Este é o identificador primário.
- 'brand': Procure por 'Manufacturer', 'Brand', 'Make', 'Fabricante', 'Marca'.
- 'model': Procure por 'Model', 'Product Name', 'Modelo'.
- 'serialNumber': Procure por 'Serial Number', 'S/N', 'Serial', 'Número de Série'.
- 'type': Procure por 'Type', 'Category', 'Tipo', 'Categoria' (ex: Switch, Server, Roteador).
- 'status': Procure por 'Status', 'Condition', 'Condição'.
- 'positionU': Procure por 'U Position', 'Position', 'Posição U', 'Posição'.
- 'sizeU': Procure por 'Size (U)', 'Height', 'Tamanho (U)', 'Altura'.
- 'tag': Procure por 'Asset Tag', 'TAG', 'Etiqueta de Patrimônio'.
- 'description': Procure por 'Description', 'Notes', 'Descrição', 'Observações'.

Para cada linha no JSON de entrada, crie um objeto de equipamento correspondente na saída. Se você não conseguir encontrar um mapeamento claro para um campo, omita-o do objeto. Não invente dados.
Foque apenas em extrair a lista de equipamentos.
`,
        input: JSON.stringify({ jsonData: "[{\"Hostname\": \"SRV-01\", \"Modelo\": \"DL380\"}]" }, null, 2),
        hasImage: false,
    },
};

const MAX_IMAGE_DIMENSION = 1024;
const resizeImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            if (width > height) { if (width > MAX_IMAGE_DIMENSION) { height *= MAX_IMAGE_DIMENSION / width; width = MAX_IMAGE_DIMENSION; } } 
            else { if (height > MAX_IMAGE_DIMENSION) { width *= MAX_IMAGE_DIMENSION / height; height = MAX_IMAGE_DIMENSION; } }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Could not get canvas context'));
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = reject;
        img.src = imageSrc;
    });
};

export function AIFlowTesterCard() {
    const [selectedFlow, setSelectedFlow] = useState<FlowName | "">("");
    const [customPrompt, setCustomPrompt] = useState("");
    const [inputJson, setInputJson] = useState("");
    const [outputJson, setOutputJson] = useState("");
    const [imageDataUri, setImageDataUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { toast } = useToast();
    const { systemSettings, setSystemSettings } = useInfra();
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedFlow) {
            const promptFromDb = systemSettings.prompts?.[selectedFlow];
            setCustomPrompt(promptFromDb || FLOW_DETAILS[selectedFlow].prompt);
            setInputJson(FLOW_DETAILS[selectedFlow].input);
            setOutputJson("");
            setError("");
            setImageDataUri(null);
        }
    }, [selectedFlow, systemSettings.prompts]);

    useEffect(() => {
        if (imageDataUri && selectedFlow && FLOW_DETAILS[selectedFlow].hasImage) {
            try {
                const parsedInput = JSON.parse(inputJson);
                parsedInput.photoDataUri = imageDataUri;
                setInputJson(JSON.stringify(parsedInput, null, 2));
            } catch (e) {
                setError("Não foi possível atualizar o JSON de entrada com a nova imagem.");
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageDataUri, selectedFlow]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async (event) => {
                if (event.target && typeof event.target.result === 'string') {
                    try {
                        const resizedUri = await resizeImage(event.target.result);
                        setImageDataUri(resizedUri);
                    } catch (error) {
                        toast({ variant: 'destructive', title: 'Erro ao processar imagem.' });
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRunFlow = async () => {
        if (!selectedFlow) {
            setError("Por favor, selecione um fluxo para testar.");
            return;
        }
        try {
            JSON.parse(inputJson);
        } catch (e) {
            setError("O JSON de entrada é inválido. Verifique a sintaxe.");
            return;
        }
        setError("");
        setIsLoading(true);
        setOutputJson("");

        try {
            const result = await runDynamicFlow({ flowName: selectedFlow, customPrompt, inputJson });
            setOutputJson(result);
            toast({ title: "Fluxo executado com sucesso!" });
        } catch (err: any) {
            setError(`Erro na execução do fluxo: ${err.message}`);
            setOutputJson(JSON.stringify({ error: err.message }, null, 2));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(customPrompt);
        toast({ title: "Prompt copiado para a área de transferência!" });
    };

    const handleSavePrompt = async () => {
        if (!selectedFlow) return;
        setIsLoading(true);
        try {
            const newPrompts = { ...systemSettings.prompts, [selectedFlow]: customPrompt };
            await setSystemSettings({ prompts: newPrompts });
            toast({ title: "Prompt Salvo!", description: "O novo prompt foi salvo no banco de dados." });
        } catch (err: any) {
            setError(`Erro ao salvar o prompt: ${err.message}`);
            toast({ variant: "destructive", title: "Erro ao Salvar" });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-headline">
                    <TestTube2 className="w-6 h-6 text-primary" />
                    Laboratório de Prompts de IA
                </CardTitle>
                <CardDescription>
                    Esta ferramenta é um "atalho" para testar e refinar a IA. Edite o prompt, forneça os dados de entrada (seja colando JSON ou enviando uma imagem) e execute para ver a resposta exata do modelo. Se o resultado for bom, salve o prompt no banco de dados para que toda a aplicação passe a usá-lo.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="flow-select">1. Selecionar Fluxo para Testar</Label>
                    <Select value={selectedFlow} onValueChange={(value) => setSelectedFlow(value as FlowName)}>
                        <SelectTrigger id="flow-select">
                            <SelectValue placeholder="Escolha um fluxo..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="extractEquipmentDetails">Extrair Detalhes de Equipamento (com imagem)</SelectItem>
                            <SelectItem value="extractConnectionDetails">Extrair Detalhes de Conexão (com imagem)</SelectItem>
                            <SelectItem value="importFromSpreadsheet">Importar de Planilha (com JSON)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="custom-prompt">2. Editar o Prompt</Label>
                        <Textarea id="custom-prompt" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Seu prompt personalizado aqui..." rows={12} className="font-mono text-xs" disabled={!selectedFlow || isLoading} />
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleCopyPrompt} disabled={!customPrompt}><Copy className="w-4 h-4 mr-2" /> Copiar Prompt</Button>
                             <Button size="sm" onClick={handleSavePrompt} disabled={!selectedFlow || isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Salvar Prompt no DB
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>3. Fornecer Dados de Entrada</Label>
                        {selectedFlow && FLOW_DETAILS[selectedFlow].hasImage && (
                            <div className="space-y-2">
                                <div className="p-2 border rounded-md bg-muted/30 min-h-[64px] flex justify-center items-center">
                                    {imageDataUri ? (
                                        <div className="relative group">
                                            <img src={imageDataUri} alt="Preview" className="max-h-20 object-contain rounded-md" />
                                            <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black/50 opacity-0 group-hover:opacity-100">
                                                <Button type="button" variant="destructive" size="icon" className="w-8 h-8" onClick={() => setImageDataUri(null)}><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </div>
                                    ) : ( <p className="text-xs text-muted-foreground">Nenhuma imagem</p>)}
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><FileImage className="w-4 h-4 mr-2" />{imageDataUri ? "Alterar Imagem" : "Carregar Imagem"}</Button>
                                <Input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                <p className="text-xs text-muted-foreground">A imagem será convertida para Data URI e inserida no JSON abaixo.</p>
                            </div>
                        )}
                        <Textarea value={inputJson} onChange={(e) => setInputJson(e.target.value)} placeholder="Cole o JSON de entrada aqui..." rows={selectedFlow && FLOW_DETAILS[selectedFlow].hasImage ? 4 : 12} className="font-mono text-xs" disabled={!selectedFlow || isLoading} />
                    </div>
                </div>
                
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label htmlFor="output-json">4. Resultado (Saída JSON)</Label>
                    <div className="p-4 border rounded-md bg-muted/50 min-h-[10rem]">
                        <pre className="text-xs font-mono overflow-auto whitespace-pre-wrap">
                            <code>{outputJson}</code>
                        </pre>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-end">
                <Button onClick={handleRunFlow} disabled={!selectedFlow || isLoading} size="lg">
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube2 className="w-4 h-4 mr-2" />}
                    {isLoading ? 'Executando...' : 'Executar Fluxo com Prompt Editado'}
                </Button>
            </CardFooter>
        </Card>
    );
}
