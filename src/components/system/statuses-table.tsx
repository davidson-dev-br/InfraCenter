
"use client"
import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getItemStatuses, ItemStatus } from '@/lib/status-actions';
import { statusColors } from '@/lib/status-config';
import { ManageStatusMenu } from '@/components/manage-status-menu';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { ShieldAlert } from 'lucide-react';

const colorStyles: Record<typeof statusColors[number], string> = {
    gray: "bg-gray-500 border-gray-500/30 text-white", 
    red: "bg-red-500 border-red-500/30 text-white", 
    orange: "bg-orange-500 border-orange-500/30 text-white",
    amber: "bg-amber-500 border-amber-500/30 text-white", 
    yellow: "bg-yellow-500 border-yellow-500/30 text-yellow-900", 
    lime: "bg-lime-500 border-lime-500/30 text-lime-900",
    green: "bg-green-500 border-green-500/30 text-white", 
    emerald: "bg-emerald-500 border-emerald-500/30 text-white", 
    teal: "bg-teal-500 border-teal-500/30 text-white",
    cyan: "bg-cyan-500 border-cyan-500/30 text-white", 
    sky: "bg-sky-500 border-sky-500/30 text-white", 
    blue: "bg-blue-500 border-blue-500/30 text-white",
    indigo: "bg-indigo-500 border-indigo-500/30 text-white", 
    violet: "bg-violet-500 border-violet-500/30 text-white", 
    purple: "bg-purple-500 border-purple-500/30 text-white",
    fuchsia: "bg-fuchsia-500 border-fuchsia-500/30 text-white", 
    pink: "bg-pink-500 border-pink-500/30 text-white", 
    rose: "bg-rose-500 border-rose-500/30 text-white",
};

export function StatusesTable() {
    const [statuses, setStatuses] = React.useState<ItemStatus[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        getItemStatuses().then(data => {
            // Garante que o valor `isDefault` seja sempre booleano
            const formattedData = data.map(status => ({...status, isDefault: !!status.isDefault}));
            setStatuses(formattedData);
            setIsLoading(false);
        })
    }, []);

    if (isLoading) {
        return (
             <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                Carregando status...
                            </TableCell>
                        </TableRow>
                    ) : statuses.length > 0 ? (
                        statuses.map(status => (
                            <TableRow key={status.id}>
                                <TableCell>
                                    <Badge className={cn("capitalize text-nowrap", colorStyles[status.color])}>{status.name}</Badge>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-muted-foreground">{status.description}</p>
                                    {status.isDefault && (
                                        <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                                            <ShieldAlert className="h-3 w-3"/>
                                            <span>Status padrão. Não pode ser editado ou excluído.</span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <ManageStatusMenu status={status}/>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                Nenhum status customizado encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
