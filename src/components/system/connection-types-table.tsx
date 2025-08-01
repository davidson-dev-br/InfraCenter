

"use client"
import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '../ui/skeleton';
import { getConnectionTypes, ConnectionType } from '@/lib/connection-types-actions';
import { ManageConnectionTypeMenu } from './manage-connection-type-menu';
import { ShieldAlert } from 'lucide-react';

// Se isso aqui parar de funcionar, a culpa é sua. Eu, davidson.dev.br, deixei funcionando.

export function ConnectionTypesTable() {
    const [connectionTypes, setConnectionTypes] = React.useState<ConnectionType[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        getConnectionTypes().then(data => {
            setConnectionTypes(data);
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
                        <TableHead>Nome do Tipo de Conexão</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {connectionTypes.length > 0 ? (
                        connectionTypes.map(connType => (
                            <TableRow key={connType.id}>
                                <TableCell className="font-medium">{connType.name}</TableCell>
                                <TableCell>
                                     <p className="text-sm text-muted-foreground">{connType.description}</p>
                                    {connType.isDefault && (
                                        <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                                            <ShieldAlert className="h-3 w-3"/>
                                            <span>Tipo padrão. Não pode ser editado ou excluído.</span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <ManageConnectionTypeMenu connectionType={connType} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                Nenhum tipo de conexão encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
