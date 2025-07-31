
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Settings, X, Loader2, Database, Trash2, Download } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { populateTestData, cleanTestData } from '@/lib/dev-actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

export const DeveloperMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    
    // Armazena as configurações de desenvolvedor no localStorage
    const [auditLogEnabled, setAuditLogEnabled] = useLocalStorage('dev_auditLogEnabled', false);
    const [isPopulating, setIsPopulating] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    
    const handlePopulate = async () => {
        setIsPopulating(true);
        try {
            await populateTestData();
            toast({ title: 'Sucesso', description: 'Banco de dados populado com dados de teste.' });
            window.location.reload();
        } catch (error) {
            toast({ title: 'Erro', description: 'Falha ao popular o banco de dados.', variant: 'destructive' });
        } finally {
            setIsPopulating(false);
        }
    }

    const handleClean = async () => {
        setIsCleaning(true);
        try {
            await cleanTestData();
            toast({ title: 'Sucesso', description: 'Dados de teste removidos do banco de dados.' });
            window.location.reload();
        } catch (error) {
            toast({ title: 'Erro', description: 'Falha ao limpar os dados de teste.', variant: 'destructive' });
        } finally {
            setIsCleaning(false);
        }
    }
    
    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Button size="icon" onClick={() => setIsOpen(true)} title="Menu do Desenvolvedor">
                    <Settings className="h-5 w-5 animate-spin" style={{ animationDuration: '5s' }}/>
                </Button>
            </div>
        )
    }

    return (
        <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg">Dev Menu</CardTitle>
                    <CardDescription className="text-xs">Controles de desenvolvimento</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2 border-t pt-4">
                    <Label htmlFor="audit-log-switch" className="flex flex-col space-y-1">
                        <span>Log de Auditoria</span>
                         <span className="font-normal leading-snug text-muted-foreground text-xs">
                           Ative para gravar e exibir ações no log.
                        </span>
                    </Label>
                    <Switch
                        id="audit-log-switch"
                        checked={auditLogEnabled}
                        onCheckedChange={setAuditLogEnabled}
                    />
                </div>
            </CardContent>
            <Separator className="my-2"/>
            <CardFooter className="flex flex-col gap-2 !p-4">
                 <Button onClick={handlePopulate} disabled={isPopulating || isCleaning} className="w-full">
                    {isPopulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                    Popular Banco de Dados
                </Button>
                <Button variant="destructive" onClick={handleClean} disabled={isPopulating || isCleaning} className="w-full">
                    {isCleaning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Limpar Dados de Teste
                </Button>
                <Separator className="my-2"/>
                <Button variant="outline" asChild className="w-full">
                    <a href="/project_archive.zip" download="infravision_project.zip">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Projeto (.zip)
                    </a>
                </Button>
            </CardFooter>
        </Card>
    )
}
