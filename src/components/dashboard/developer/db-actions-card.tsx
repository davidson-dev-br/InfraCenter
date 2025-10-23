"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldAlert, Database, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { seedDatabase, clearDatabase } from "@/lib/db-actions";

function ClearDbDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { toast } = useToast();

    const handleClear = async () => {
        if (password !== "davidson") {
            setError("Senha incorreta. A exclusão foi cancelada.");
            return;
        }
        setError("");
        setIsLoading(true);

        const result = await clearDatabase();

        if (result.success) {
            toast({
                title: "Sucesso!",
                description: result.message,
            });
            setIsOpen(false);
        } else {
            toast({
                variant: "destructive",
                title: "Erro ao Limpar Banco de Dados",
                description: result.error,
            });
        }
        setIsLoading(false);
        setPassword("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
                setError("");
                setPassword("");
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    <Trash2 className="mr-2" />
                    Limpar Banco de Dados
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-destructive" />
                        Ação Destrutiva
                    </DialogTitle>
                    <DialogDescription>
                        Esta ação removerá permanentemente todos os datacenters, salas, itens, equipamentos e conexões.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                     <Alert variant="destructive">
                        <AlertTitle>Você tem certeza?</AlertTitle>
                        <AlertDescription>
                            Para confirmar, digite a senha de segurança.
                        </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha de segurança ("davidson")</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                         {error && <p className="text-sm text-destructive mt-1">{error}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isLoading}>
                            Cancelar
                        </Button>
                    </DialogClose>
                     <Button type="button" variant="destructive" onClick={handleClear} disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar e Limpar Tudo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function DbActionsCard() {
    const [isSeeding, setIsSeeding] = useState(false);
    const { toast } = useToast();

    const handleSeed = async () => {
        setIsSeeding(true);
        const result = await seedDatabase();
        if (result.success) {
            toast({
                title: "Sucesso!",
                description: result.message,
            });
        } else {
             toast({
                variant: "destructive",
                title: "Erro ao Popular Banco de Dados",
                description: result.error,
            });
        }
        setIsSeeding(false);
    };
    
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-headline">Ações do Banco de Dados</CardTitle>
                 <CardDescription>
                    Use estas ações para popular o banco de dados com dados de teste ou para limpá-lo completamente.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
                 <Button onClick={handleSeed} disabled={isSeeding}>
                    {isSeeding ? (
                        <Loader2 className="mr-2 animate-spin" />
                    ) : (
                        <Database className="mr-2" />
                    )}
                    {isSeeding ? 'Populando...' : 'Popular com Dados de Teste'}
                </Button>
                <ClearDbDialog />
            </CardContent>
        </Card>
    )
}
