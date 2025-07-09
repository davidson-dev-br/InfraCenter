"use client";

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, FileUp, Database, Server, Spline, Sparkles, Info, Loader2, UploadCloud } from 'lucide-react';
import { useInfra } from '@/components/dashboard/datacenter-switcher';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel } from '@/lib/export';
import { PrintableReport } from '@/components/dashboard/reports/printable-report';
import { importFromSpreadsheet } from '@/ai/flows/import-spreadsheet-flow';

export default function ReportsPage() {
  const [isGeneratingHtml, setIsGeneratingHtml] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [exportSelections, setExportSelections] = useState({
    items: true,
    equipment: true,
    connections: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importRoomId, setImportRoomId] = useState<string>('');
  const { buildings, itemsByRoom, equipment, connections, users, systemSettings, addEquipment } = useInfra();
  const { toast } = useToast();

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
  
  const handleExportExcel = () => {
    if (!exportSelections.items && !exportSelections.equipment && !exportSelections.connections) {
      toast({
        variant: 'destructive',
        title: "Nenhuma seleção",
        description: "Por favor, selecione pelo menos um tipo de dado para exportar.",
      });
      return;
    }
    setIsExportingExcel(true);
    try {
      exportToExcel({
        includeItems: exportSelections.items,
        includeEquipment: exportSelections.equipment,
        includeConnections: exportSelections.connections,
        itemsByRoom,
        equipmentData: equipment,
        connectionsData: connections,
        buildingsData: buildings
      });
    } catch (error) {
      console.error("Excel export failed:", error);
      toast({
        variant: 'destructive',
        title: "Erro na exportação",
        description: "Não foi possível gerar o arquivo Excel.",
      });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleGenerateHtmlReport = () => {
    setIsGeneratingHtml(true);
    setTimeout(() => {
        const printPromise = new Promise((resolve) => {
            const handleAfterPrint = () => {
                window.removeEventListener('afterprint', handleAfterPrint);
                resolve(true);
            };
            window.addEventListener('afterprint', handleAfterPrint);
            window.print();
        });
        const timeout = setTimeout(() => setIsGeneratingHtml(false), 1000);
        printPromise.finally(() => {
            clearTimeout(timeout);
            setIsGeneratingHtml(false);
        });
    }, 100);
  };

  const handleImport = async () => {
    if (!selectedFile) {
        toast({ variant: 'destructive', title: 'Nenhum arquivo selecionado.' });
        return;
    }
    if (!importRoomId) {
        toast({ variant: 'destructive', title: 'Nenhuma sala de destino selecionada.' });
        return;
    }

    setIsImporting(true);

    try {
        const fileData = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(fileData);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
            toast({ variant: 'destructive', title: 'Planilha vazia.' });
            setIsImporting(false);
            return;
        }

        const result = await importFromSpreadsheet({ jsonData: JSON.stringify(json) });
        if (!result.equipment || result.equipment.length === 0) {
            toast({ title: 'Importação Concluída', description: 'A IA não encontrou equipamentos para importar na planilha.' });
            setIsImporting(false);
            return;
        }
        
        const racksInRoom = (itemsByRoom[importRoomId] || []).filter(item => item.type.toLowerCase().includes('rack'));
        const defaultParentId = racksInRoom.length > 0 ? racksInRoom[0].id : null;

        let successCount = 0;
        for (const equip of result.equipment) {
            await addEquipment({ ...equip, parentItemId: defaultParentId });
            successCount++;
        }
        
        toast({ title: 'Importação bem-sucedida!', description: `${successCount} equipamentos foram importados para a sala selecionada.` });

    } catch (error) {
        console.error("AI Import failed:", error);
        toast({ variant: 'destructive', title: 'Importação Falhou', description: 'Não foi possível processar a planilha. Verifique o formato do arquivo e tente novamente.' });
    } finally {
        setIsImporting(false);
        setSelectedFile(null);
    }
};

  return (
    <>
      <div className="print-hidden container p-4 mx-auto my-8 sm:p-8 space-y-8">
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
              <Button className="w-full bg-primary hover:bg-primary/90" size="lg" onClick={handleGenerateHtmlReport} disabled={isGeneratingHtml}>
                {isGeneratingHtml ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <FileText className="w-5 h-5 mr-2" />}
                {isGeneratingHtml ? 'Gerando...' : 'Gerar Relatório HTML'}
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
              <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white" size="lg" onClick={handleExportExcel} disabled={isExportingExcel}>
                {isExportingExcel ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <FileUp className="w-5 h-5 mr-2" />}
                {isExportingExcel ? 'Exportando...' : 'Exportar Selecionados (.xlsx)'}
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
              <Select value={importRoomId} onValueChange={setImportRoomId}>
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
          <CardFooter className="justify-end">
            <Button onClick={handleImport} disabled={!selectedFile || !importRoomId || isImporting}>
                {isImporting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <UploadCloud className="w-5 h-5 mr-2" />}
                {isImporting ? 'Importando...' : 'Iniciar Importação com IA'}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="print-visible">
          <PrintableReport 
              buildings={buildings}
              itemsByRoom={itemsByRoom}
              equipment={equipment}
              connections={connections}
              users={users}
              systemSettings={systemSettings}
              includeSignatures={includeSignatures}
          />
      </div>
    </>
  );
}
