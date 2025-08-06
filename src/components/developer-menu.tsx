

"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Settings, X, Loader2, Database, Trash2, Download, CheckCircle, FileCode, Package, Sparkles } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
    populateEssentialData,
    cleanTestData,
    populateBaseEntities,
    populateRooms,
    populateParentItems,
    populateChildItems,
    populatePortsAndConnections
} from '@/lib/dev-actions';
import { ensureDatabaseSchema } from '@/lib/user-actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

type TaskName = 'schema' | 'seed' | 'clean' | 'base' | 'rooms' | 'parentItems' | 'childItems' | 'connections';


export const DeveloperMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    
    const [auditLogEnabled, setAuditLogEnabled] = useLocalStorage('dev_auditLogEnabled', false);
    const [activeTask, setActiveTask] = useState<TaskName | null>(null);
    
    const handleTask = async (taskName: TaskName, taskFn: () => Promise<any>, successMessage: string) => {
        setActiveTask(taskName);
        try {
            await taskFn();
            toast({ title: 'Sucesso', description: successMessage });
        } catch (error: any) {
            toast({ title: `Erro ao executar: ${taskName}`, description: error.message, variant: 'destructive' });
        } finally {
            setActiveTask(null);
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

    const isAnyTaskRunning = activeTask !== null;

    return (
        <Card className="fixed bottom-4 right-4 z-50 w-96 shadow-2xl">
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
                 <div className="space-y-2 border-t pt-4">
                    <Label className="text-sm font-medium">Controles Gerais</Label>
                    <div className="flex items-center justify-between space-x-2">
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
                    <Button onClick={() => handleTask('schema', ensureDatabaseSchema, 'Schema do DB verificado/criado.')} disabled={isAnyTaskRunning} className="w-full">
                        {activeTask === 'schema' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        Verificar/Criar Schema DB
                    </Button>
                     <Button onClick={() => handleTask('seed', populateEssentialData, 'Dados essenciais (fabricantes, modelos, etc.) foram carregados.')} disabled={isAnyTaskRunning} className="w-full">
                        {activeTask === 'seed' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Popular Dados Essenciais
                    </Button>
                </div>

                <Separator className="my-2"/>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">Popular Dados de Teste (Fracionado)</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={() => handleTask('base', populateBaseEntities, 'Usuários e Prédios de teste criados.')} disabled={isAnyTaskRunning}>
                            {activeTask === 'base' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "1."} Pop. Base
                        </Button>
                         <Button onClick={() => handleTask('rooms', populateRooms, 'Salas de teste criadas.')} disabled={isAnyTaskRunning}>
                            {activeTask === 'rooms' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "2."} Pop. Salas
                        </Button>
                         <Button onClick={() => handleTask('parentItems', populateParentItems, 'Itens pais (racks) de teste criados.')} disabled={isAnyTaskRunning}>
                            {activeTask === 'parentItems' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "3."} Pop. Pais
                        </Button>
                        <Button onClick={() => handleTask('childItems', populateChildItems, 'Itens filhos (equipamentos) de teste criados.')} disabled={isAnyTaskRunning}>
                            {activeTask === 'childItems' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "4."} Pop. Filhos
                        </Button>
                        <Button onClick={() => handleTask('connections', populatePortsAndConnections, 'Portas e conexões de teste criadas.')} disabled={isAnyTaskRunning} className="col-span-2">
                            {activeTask === 'connections' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "5."} Pop. Conexões
                        </Button>
                    </div>
                </div>

            </CardContent>
            
            <Separator className="my-2"/>
            <CardFooter className="flex flex-col gap-2 !p-4">
                <Button variant="destructive" onClick={() => handleTask('clean', cleanTestData, 'Dados de teste removidos do banco de dados.')} disabled={isAnyTaskRunning} className="w-full">
                    {activeTask === 'clean' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Limpar Todos os Dados de Teste
                </Button>
                <Button variant="outline" asChild className="w-full">
                    <a href="/infra_setup.sql" download="infra_setup.sql">
                        <FileCode className="mr-2 h-4 w-4" />
                        Baixar Script de Infra (.sql)
                    </a>
                </Button>
            </CardFooter>
        </Card>
    )
}
