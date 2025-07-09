"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, FileUp, Database, Server, Spline, Sparkles, Info } from 'lucide-react';
import { useInfra } from '@/components/dashboard/datacenter-switcher';

export default function ReportsPage() {
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [exportSelections, setExportSelections] = useState({
    items: true,
    equipment: true,
    connections: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { buildings } = useInfra();

  const allRooms = buildings.flatMap(b => 
    (b.rooms || []).map(r => ({ ...r, buildingName: b.name, buildingId: b.id }))
  );


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const toggleExportSelection = (key: keyof typeof exportSelections) => {
    setExportSelections(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="container p-4 mx-auto my-8 sm:p-8 space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Relatório Completo Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Relatório Completo</CardTitle>
            <CardDescription>
              Gere um documento HTML com todos os dados, fotos e assinaturas, ideal para salvar como PDF ou imprimir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox id="include-signatures" checked={includeSignatures} onCheckedChange={(checked) => setIncludeSignatures(Boolean(checked))} />
              <Label htmlFor="include-signatures" className="text-sm font-medium leading-none cursor-pointer">
                Incluir Assinaturas
              </Label>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
              <FileText className="w-5 h-5 mr-2" />
              Gerar Relatório HTML
            </Button>
          </CardContent>
        </Card>

        {/* Exportar para Excel Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Exportar para Excel</CardTitle>
            <CardDescription>
              Exporte os dados brutos para usar em outros sistemas ou planilhas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-2">
              <Button variant={exportSelections.items ? 'secondary' : 'outline'} onClick={() => toggleExportSelection('items')}>
                <Database className="w-5 h-5 mr-2" />
                Itens
              </Button>
              <Button variant={exportSelections.equipment ? 'secondary' : 'outline'} onClick={() => toggleExportSelection('equipment')}>
                <Server className="w-5 h-5 mr-2" />
                Equipamentos
              </Button>
              <Button variant={exportSelections.connections ? 'secondary' : 'outline'} onClick={() => toggleExportSelection('connections')}>
                <Spline className="w-5 h-5 mr-2" />
                Conexões
              </Button>
            </div>
            <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white" size="lg">
              <FileUp className="w-5 h-5 mr-2" />
              Exportar Tudo (.xlsx)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Importar Dados com IA Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-headline">
            <Sparkles className="w-6 h-6 text-primary" />
            Importar Dados com IA
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-6 h-6">
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>A IA analisará sua planilha para mapear e importar os dados corretamente.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            Faça o upload de uma planilha Excel (.xlsx) com seu inventário e deixe a IA fazer a migração dos dados para o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="import-destination">Sala de Destino da Importação</Label>
            <Select>
              <SelectTrigger id="import-destination">
                <SelectValue placeholder="Selecione uma sala..." />
              </SelectTrigger>
              <SelectContent>
                {allRooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.buildingName} - {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
              <Label htmlFor="file-upload-trigger">Arquivo (.xlsx)</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                  Escolher arquivo
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedFile ? selectedFile.name : 'Nenhum arquivo escolhido'}
                </span>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
