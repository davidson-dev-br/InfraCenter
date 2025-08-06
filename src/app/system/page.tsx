

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddItemTypeDialog } from '@/components/add-item-type-dialog';
import { AddStatusButton } from '@/components/system/add-status-button';
import { ItemTypesTable } from '@/components/system/item-types-table';
import { StatusesTable } from '@/components/system/statuses-table';
import { Puzzle, RefreshCcwDot, HardDrive, LayoutGrid, Tag, Plus, Library, Network, Plug, Link2, AlertTriangle, BadgeAlert, ShieldCheck } from 'lucide-react';
import { ParentColumnConfig } from '@/components/system/parent-column-config';
import { ChildColumnConfig } from '@/components/system/child-column-config';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ManufacturersTable } from '@/components/system/manufacturers-table';
import { ManageManufacturerDialog } from '@/components/system/manage-manufacturer-dialog';
import { ModelsTable } from '@/components/system/models-table';
import { ManageModelDialog } from '@/components/system/manage-model-dialog';
import { PortTypesTable } from '@/components/system/port-types-table';
import { ManagePortTypeDialog } from '@/components/system/manage-port-type-dialog';
import { ConnectionTypesTable } from '@/components/system/connection-types-table';
import { ManageConnectionTypeDialog } from '@/components/system/manage-connection-type-dialog';

async function SystemPage() {
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Configuração do Sistema</h1>
      </div>
      
      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <Puzzle className="h-6 w-6" />
                <CardTitle>Gerenciamento de Equipamentos</CardTitle>
            </div>
            <CardDescription className="mt-1.5">
                Defina os tipos de equipamento, fabricantes e modelos que podem ser adicionados ao inventário.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="parent_types">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="parent_types"><LayoutGrid className="mr-2 h-4 w-4"/>Tipos (Planta Baixa)</TabsTrigger>
                    <TabsTrigger value="child_types"><HardDrive className="mr-2 h-4 w-4"/>Tipos (Equipamentos)</TabsTrigger>
                    <TabsTrigger value="attributes"><Tag className="mr-2 h-4 w-4"/>Fabricantes</TabsTrigger>
                    <TabsTrigger value="models"><Library className="mr-2 h-4 w-4" />Modelos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="parent_types" className="mt-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-sm max-w-xl">
                            Gerencie os tipos de equipamento que aparecem na planta baixa (ex: Racks, QDFs).
                        </p>
                        <AddItemTypeDialog isParentType={true}>
                          <Button><Plus className="mr-2" />Adicionar Tipo</Button>
                        </AddItemTypeDialog>
                    </div>
                    <ItemTypesTable isParentTypeTable={true} />
                    <Separator />
                    <div>
                        <h3 className="text-base font-medium">Configuração de Visualização</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Selecione quais colunas exibir na tabela de "Itens de Planta Baixa" na página de Equipamentos.
                        </p>
                       <ParentColumnConfig />
                    </div>
                </TabsContent>
                
                <TabsContent value="child_types" className="mt-6 space-y-6">
                     <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-sm max-w-xl">
                            Gerencie os tipos de equipamento que são aninhados dentro de outros (ex: Servidores, Switches).
                        </p>
                         <AddItemTypeDialog isParentType={false}>
                          <Button><Plus className="mr-2" />Adicionar Tipo</Button>
                        </AddItemTypeDialog>
                    </div>
                    <ItemTypesTable isParentTypeTable={false} />
                     <Separator />
                    <div>
                        <h3 className="text-base font-medium">Configuração de Visualização</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Selecione quais colunas exibir na tabela de "Equipamentos Aninhados" na página de Equipamentos.
                        </p>
                       <ChildColumnConfig />
                    </div>
                </TabsContent>

                <TabsContent value="attributes" className="mt-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-sm max-w-xl">
                           Gerencie a lista de fabricantes de equipamentos.
                        </p>
                        <ManageManufacturerDialog mode="add">
                            <Button><Plus className="mr-2"/> Adicionar Fabricante</Button>
                        </ManageManufacturerDialog>
                    </div>
                    <ManufacturersTable />
                </TabsContent>

                <TabsContent value="models" className="mt-6 space-y-6">
                     <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-sm max-w-xl">
                           Gerencie modelos de equipamentos, vinculando-os a um fabricante.
                        </p>
                         <ManageModelDialog mode="add">
                          <Button><Plus className="mr-2" />Adicionar Modelo</Button>
                        </ManageModelDialog>
                    </div>
                    <ModelsTable />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <Network className="h-6 w-6" />
                <CardTitle>Gerenciamento de Conexões</CardTitle>
            </div>
            <CardDescription className="mt-1.5">
                Defina os tipos de portas e conexões (ex: RJ45, Fibra) que formam a base do mapa de conectividade.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Tabs defaultValue="port_types">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="port_types"><Plug className="mr-2 h-4 w-4"/>Tipos de Porta</TabsTrigger>
                    <TabsTrigger value="connection_types"><Link2 className="mr-2 h-4 w-4"/>Tipos de Conexão</TabsTrigger>
                </TabsList>
                 <TabsContent value="port_types" className="mt-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-sm max-w-xl">
                            Gerencie a lista de tipos de porta (conectores) disponíveis no sistema.
                        </p>
                        <ManagePortTypeDialog mode="add">
                          <Button><Plus className="mr-2" />Adicionar Tipo de Porta</Button>
                        </ManagePortTypeDialog>
                    </div>
                    <PortTypesTable />
                 </TabsContent>
                 <TabsContent value="connection_types" className="mt-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-sm max-w-xl">
                            Gerencie a natureza de uma conexão (ex: Dados UTP, Energia AC).
                        </p>
                         <ManageConnectionTypeDialog mode="add">
                            <Button><Plus className="mr-2" />Adicionar Tipo de Conexão</Button>
                        </ManageConnectionTypeDialog>
                    </div>
                    <ConnectionTypesTable />
                 </TabsContent>
             </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6" />
                <CardTitle>Gerenciamento de Incidentes</CardTitle>
            </div>
            <CardDescription className="mt-1.5">
                Configure os status e severidades que podem ser atribuídos a um incidente de integridade.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Tabs defaultValue="incident_statuses">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="incident_statuses"><BadgeAlert className="mr-2 h-4 w-4"/>Status de Incidente</TabsTrigger>
                    <TabsTrigger value="incident_severities"><ShieldCheck className="mr-2 h-4 w-4"/>Severidades</TabsTrigger>
                </TabsList>
                 <TabsContent value="incident_statuses" className="mt-6 space-y-6">
                    <p className="text-muted-foreground text-sm">Gerencie os status do ciclo de vida de um incidente (Aberto, Investigando, Fechado).</p>
                    {/* Placeholder para tabela de status de incidente */}
                 </TabsContent>
                 <TabsContent value="incident_severities" className="mt-6 space-y-6">
                    <p className="text-muted-foreground text-sm">Gerencie os níveis de criticidade de um incidente.</p>
                    {/* Placeholder para tabela de severidades */}
                 </TabsContent>
             </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <RefreshCcwDot className="h-6 w-6" />
                        <CardTitle>Gerenciamento de Ciclo de Vida</CardTitle>
                    </div>
                    <CardDescription className="mt-1.5">
                        Crie, edite e gerencie os status do ciclo de vida de um item no inventário.
                    </CardDescription>
                </div>
                 <AddStatusButton />
            </div>
        </CardHeader>
        <CardContent>
            <StatusesTable />
        </CardContent>
      </Card>

    </div>
  );
}

export default SystemPage;
