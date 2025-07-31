
"use client"
import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '../ui/skeleton';
import { getManufacturers, Manufacturer } from '@/lib/manufacturer-actions';
import { getModelsByManufacturerId, Model } from '@/lib/models-actions';
import { ManageModelMenu } from './manage-model-menu';

export function ModelsTable() {
    const [manufacturers, setManufacturers] = React.useState<Manufacturer[]>([]);
    const [selectedManufacturer, setSelectedManufacturer] = React.useState<string | null>(null);
    const [models, setModels] = React.useState<Model[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isLoadingModels, setIsLoadingModels] = React.useState(false);

    React.useEffect(() => {
        getManufacturers().then(data => {
            setManufacturers(data);
            if (data.length > 0) {
                setSelectedManufacturer(data[0].id);
            }
            setIsLoading(false);
        })
    }, []);

    React.useEffect(() => {
        if (selectedManufacturer) {
            setIsLoadingModels(true);
            getModelsByManufacturerId(selectedManufacturer).then(data => {
                setModels(data);
                setIsLoadingModels(false);
            });
        } else {
            setModels([]);
        }
    }, [selectedManufacturer]);
    
    if (isLoading) {
        return <Skeleton className="h-20 w-full" />;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <label htmlFor="manufacturer-select" className="text-sm font-medium">Filtrar por Fabricante:</label>
                <Select
                    value={selectedManufacturer || ""}
                    onValueChange={setSelectedManufacturer}
                >
                    <SelectTrigger id="manufacturer-select" className="w-[250px]">
                        <SelectValue placeholder="Selecione um fabricante..." />
                    </SelectTrigger>
                    <SelectContent>
                        {manufacturers.map(man => (
                            <SelectItem key={man.id} value={man.id}>{man.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome do Modelo</TableHead>
                            <TableHead>Tamanho (U)</TableHead>
                            <TableHead>Configuração de Portas</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingModels ? (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Carregando modelos...
                                </TableCell>
                            </TableRow>
                        ) : models.length > 0 ? (
                            models.map(model => (
                                <TableRow key={model.id}>
                                    <TableCell className="font-medium">{model.name}</TableCell>
                                    <TableCell>{model.tamanhoU || 'N/A'}</TableCell>
                                    <TableCell className="font-mono text-xs">{model.portConfig || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <ManageModelMenu model={model} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Nenhum modelo encontrado para este fabricante.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
