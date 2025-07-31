
"use client"
import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '../ui/skeleton';
import { getPortTypes, PortType } from '@/lib/port-types-actions';
import { ManagePortTypeMenu } from './manage-port-type-menu';
import { ShieldAlert } from 'lucide-react';

export function PortTypesTable() {
    const [portTypes, setPortTypes] = React.useState<PortType[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        getPortTypes().then(data => {
            setPortTypes(data);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
             <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome do Tipo de Porta</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {portTypes.length > 0 ? (
                        portTypes.map(portType => (
                            <TableRow key={portType.id}>
                                <TableCell className="font-medium">{portType.name}</TableCell>
                                <TableCell>
                                     <p className="text-sm text-muted-foreground">{portType.description}</p>
                                    {portType.isDefault && (
                                        <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                                            <ShieldAlert className="h-3 w-3"/>
                                            <span>Tipo padrão. Não pode ser editado ou excluído.</span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <ManagePortTypeMenu portType={portType} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                Nenhum tipo de porta encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

    