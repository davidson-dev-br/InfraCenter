"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, TestTube2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { runAiFlow } from "@/ai/flows/developer-tools-flow";

type FlowName = 'extractEquipmentDetails' | 'extractConnectionDetails' | 'importFromSpreadsheet';

const FLOW_PLACEHOLDERS: Record<FlowName, string> = {
    extractEquipmentDetails: JSON.stringify({ photoDataUri: "data:image/jpeg;base64,..." }, null, 2),
    extractConnectionDetails: JSON.stringify({ photoDataUri: "data:image/jpeg;base64,..." }, null, 2),
    importFromSpreadsheet: JSON.stringify({ jsonData: "[{\"Hostname\": \"SRV-01\", \"Modelo\": \"DL380\"}]" }, null, 2),
};

export function AIFlowTesterCard() {
    const [selectedFlow, setSelectedFlow] = useState<FlowName | "">("");
    const [inputJson, setInputJson] = useState("");
    const [outputJson, setOutputJson] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        if (selectedFlow) {
            setInputJson(FLOW_PLACEHOLDERS[selectedFlow]);
            setOutputJson("");
            setError("");
        }
    }, [selectedFlow]);

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
            const result = await runAiFlow({ flowName: selectedFlow, inputJson });
            setOutputJson(result);
            toast({ title: "Fluxo executado com sucesso!" });
        } catch (err: any) {
            setError(`Erro na execução do fluxo: ${err.message}`);
            setOutputJson(JSON.stringify({ error: err.message }, null, 2));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-lg lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-headline">
                    <TestTube2 className="w-6 h-6 text-primary" />
                    Testador de Fluxos de IA
                </CardTitle>
                <CardDescription>
                    Selecione um fluxo, forneça um JSON de entrada e veja a saída da IA. Ótimo para depurar prompts.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="flow-select">Selecionar Fluxo</Label>
                    <Select value={selectedFlow} onValueChange={(value) => setSelectedFlow(value as FlowName)}>
                        <SelectTrigger id="flow-select">
                            <SelectValue placeholder="Escolha um fluxo..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="extractEquipmentDetails">extractEquipmentDetails</SelectItem>
                            <SelectItem value="extractConnectionDetails">extractConnectionDetails</SelectItem>
                            <SelectItem value="importFromSpreadsheet">importFromSpreadsheet</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="input-json">Entrada (JSON)</Label>
                    <Textarea
                        id="input-json"
                        value={inputJson}
                        onChange={(e) => setInputJson(e.target.value)}
                        placeholder="Cole o JSON de entrada aqui..."
                        rows={8}
                        className="font-mono text-xs"
                        disabled={!selectedFlow || isLoading}
                    />
                </div>
                
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label htmlFor="output-json">Saída (JSON)</Label>
                    <div className="p-4 border rounded-md bg-muted/50 min-h-[10rem]">
                        <pre className="text-xs font-mono overflow-auto">
                            <code>{outputJson}</code>
                        </pre>
                    </div>
                </div>

            </CardContent>
            <CardFooter className="justify-end">
                <Button onClick={handleRunFlow} disabled={!selectedFlow || isLoading}>
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <TestTube2 className="mr-2" />}
                    {isLoading ? 'Executando...' : 'Executar Fluxo'}
                </Button>
            </CardFooter>
        </Card>
    );
}
