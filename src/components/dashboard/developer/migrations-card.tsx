"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, DatabaseZap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { runDefaultMigration } from "@/lib/migration-actions";

export function MigrationsCard() {
    const [isMigrating, setIsMigrating] = useState(false);
    const { toast } = useToast();

    const handleRunMigration = async () => {
        setIsMigrating(true);
        const result = await runDefaultMigration();
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
        setIsMigrating(false);
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
                 <Button onClick={handleRunMigration} disabled={isMigrating}>
                    {isMigrating ? (
                        <Loader2 className="mr-2 animate-spin" />
                    ) : (
                        <DatabaseZap className="mr-2" />
                    )}
                    {isMigrating ? 'Executando...' : "Executar Migração"}
                </Button>
            </CardContent>
        </Card>
    )
}
