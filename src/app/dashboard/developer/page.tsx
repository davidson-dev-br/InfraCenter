"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DbActionsCard } from "@/components/dashboard/developer/db-actions-card";
import { AIFlowTesterCard } from "@/components/dashboard/developer/ai-flow-tester-card";

export default function DeveloperSettingsPage() {

    return (
        <div className="container p-4 mx-auto my-8 sm:p-8">
            <Card className="mb-8 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Configurações de Desenvolvedor</CardTitle>
                    <CardDescription>Ações de baixo nível, ferramentas de depuração e manutenção do banco de dados.</CardDescription>
                </CardHeader>
            </Card>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <AIFlowTesterCard />
                <DbActionsCard />
            </div>
        </div>
    );
}
