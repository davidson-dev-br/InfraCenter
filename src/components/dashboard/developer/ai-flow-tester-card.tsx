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
        prompt: `You are an expert IT asset management assistant. Your task is to analyze the provided image of a piece of network or server hardware.

Carefully examine the image for any text, labels, or logos. Identify the equipment type, manufacturer (brand), model name/number, serial number, hostname, and any asset tags.

Extract this information accurately. If a specific piece of information is not visible or cannot be identified, omit that field from the output.

Photo: {{media url=photoDataUri}}`,
        input: JSON.stringify({ photoDataUri: "data:image/jpeg;base64,..." }, null, 2),
        hasImage: true,
    },
    extractConnectionDetails: {
        prompt: `You are an expert IT infrastructure assistant specializing in reading cable labels. Your task is to analyze the provided image of a cable label.

The label typically follows a DE/PARA (FROM/TO) format.
- "DE" refers to the source device and port.
- "PARA" refers to the destination device and port.

Carefully examine the image for any text. Identify the main label identifier (the most prominent text, often a patch panel ID), the source device hostname and port, and the destination device hostname and port.

Example label text:
"P-01-A-01
DE: SW-CORE-01 | Gi1/0/1
PARA: FW-EDGE-02 | PortA"

For the example above, you would extract:
- cableLabel: "P-01-A-01"
- sourceHostname: "SW-CORE-01"
- sourcePort: "Gi1/0/1"
- destinationHostname: "FW-EDGE-02"
- destinationPort: "PortA"

Extract this information accurately. If a specific piece of information is not visible or cannot be identified, omit that field from the output.

Photo: {{media url=photoDataUri}}`,
        input: JSON.stringify({ photoDataUri: "data:image/jpeg;base64,..." }, null, 2),
        hasImage: true,
    },
    importFromSpreadsheet: {
        prompt: `You are an expert data migration assistant for an IT infrastructure management system.
You will be provided with a JSON representation of a spreadsheet containing inventory data.
Your task is to analyze this JSON data, intelligently map the columns to the equipment schema, and return a clean list of equipment objects.

Spreadsheet JSON data:
\`\`\`json
{{{jsonData}}}
\`\`\`

Mapping Heuristics:
- 'hostname': Look for columns named 'Hostname', 'Device Name', 'Asset', 'Name', or similar. This is the primary identifier.
- 'brand': Look for 'Manufacturer', 'Brand', 'Make', 'Fabricante'.
- 'model': Look for 'Model', 'Product Name', 'Modelo'.
- 'serialNumber': Look for 'Serial Number', 'S/N', 'Serial', 'Número de Série'.
- 'type': Look for 'Type', 'Category', 'Tipo', 'Categoria' (e.g., Switch, Server, Router).
- 'status': Look for 'Status', 'Condition'.
- 'positionU': Look for 'U Position', 'Position', 'Posição'.
- 'sizeU': Look for 'Size (U)', 'Height', 'Tamanho (U)'.
- 'tag': Look for 'Asset Tag', 'TAG'.
- 'description': Look for 'Description', 'Notes', 'Descrição'.

For each row in the input JSON, create a corresponding equipment object in the output. If you cannot find a clear mapping for a field, omit it from the object. Do not invent data.
Focus only on extracting the equipment list.
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
                    Esta ferramenta é um "atalho" para testar e refinar a IA. Edite o prompt, forneça os dados de entrada (seja colando JSON ou enviando uma imagem) e execute para ver a resposta exata do modelo. Se o resultado for bom, copie o prompt e cole-o no arquivo de fluxo correspondente no seu código.
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
                            <Button variant="outline" size="sm" onClick={handleCopyPrompt} disabled={!customPrompt}><Copy className="mr-2" /> Copiar Prompt</Button>
                             <Button size="sm" onClick={handleSavePrompt} disabled={!selectedFlow || isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2" />}
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
                                                <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={() => setImageDataUri(null)}><Trash2 /></Button>
                                            </div>
                                        </div>
                                    ) : ( <p className="text-xs text-muted-foreground">Nenhuma imagem</p>)}
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><FileImage className="mr-2" />{imageDataUri ? "Alterar Imagem" : "Carregar Imagem"}</Button>
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
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <TestTube2 className="mr-2" />}
                    {isLoading ? 'Executando...' : 'Executar Fluxo com Prompt Editado'}
                </Button>
            </CardFooter>
        </Card>
    );
}
