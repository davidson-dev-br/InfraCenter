"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, DatabaseZap, CheckCircle, Search, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { previewDefaultMigration, executeDefaultMigration } from "@/lib/migration-actions";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type PreviewResult = {
    count: number;
    message: string;
}

export function MigrationsCard() {
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
    const { toast } = useToast();

    const handlePreviewMigration = async () => {
        setIsPreviewing(true);
        setPreviewResult(null);
        const result = await previewDefaultMigration();
        if (result.success) {
            setPreviewResult({ count: result.count, message: result.message });
        } else {
             toast({
                variant: "destructive",
                title: "Erro na Análise",
                description: result.error,
            });
        }
        setIsPreviewing(false);
    };

    const handleExecuteMigration = async () => {
        setIsExecuting(true);
        const result = await executeDefaultMigration();
        if (result.success) {
            toast({
                title: "Migração Concluída!",
                description: result.message,
            });
        } else {
             toast({
                variant: "destructive",
                title: "Erro na Migração",
                description: result.error,
            });
        }
        setIsExecuting(false);
        setPreviewResult(null); // Reset after execution
    };
    
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-headline">Executor de Migrações</CardTitle>
                 <CardDescription>
                    Execute scripts para atualizar a estrutura de dados. O script atual garante que todos os equipamentos tenham o campo 'isFrontFacing'. Use com cuidado.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
                 <Button onClick={handlePreviewMigration} disabled={isPreviewing || isExecuting}>
                    {isPreviewing ? (
                        <Loader2 className="mr-2 animate-spin" />
                    ) : (
                        <Search className="mr-2" />
                    )}
                    {isPreviewing ? 'Analisando...' : "1. Analisar Migração"}
                </Button>

                {previewResult && (
                     <Alert>
                        {previewResult.count > 0 ? <ShieldAlert className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        <AlertTitle>{previewResult.count > 0 ? "Mudanças Propostas" : "Nenhuma Mudança Necessária"}</AlertTitle>
                        <AlertDescription>
                          {previewResult.message}
                        </AlertDescription>
                    </Alert>
                )}

                {previewResult && previewResult.count > 0 && (
                    <Button onClick={handleExecuteMigration} disabled={isExecuting || isPreviewing}>
                        {isExecuting ? (
                            <Loader2 className="mr-2 animate-spin" />
                        ) : (
                            <DatabaseZap className="mr-2" />
                        )}
                        {isExecuting ? 'Executando...' : `2. Confirmar e Executar`}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
