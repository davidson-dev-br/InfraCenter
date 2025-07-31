

"use client"
import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getItemTypes, ItemType } from "@/lib/item-types-actions";
import { ManageItemTypeMenu } from '@/components/manage-item-type-menu';
import { Skeleton } from '../ui/skeleton';

interface ItemTypesTableProps {
    isParentTypeTable: boolean;
}

export function ItemTypesTable({ isParentTypeTable }: ItemTypesTableProps) {
    const [itemTypes, setItemTypes] = React.useState<ItemType[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setIsLoading(true);
        getItemTypes(isParentTypeTable).then(data => {
            setItemTypes(data);
            setIsLoading(false);
        })
    }, [isParentTypeTable]);

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
                    <TableHead>Categoria</TableHead>
                    <TableHead>Dimensões Padrão (L x A)</TableHead>
                    {isParentTypeTable && <TableHead>Capacidades</TableHead>}
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {itemTypes.length > 0 ? (
                    itemTypes.map((type) => (
                    <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell>{type.category}</TableCell>
                        <TableCell>{type.defaultWidthM}m x {type.defaultHeightM}m</TableCell>
                        {isParentTypeTable && (
                            <TableCell className="space-x-2">
                                {type.isResizable && <Badge variant="outline">Redimensionável</Badge>}
                                {type.canHaveChildren && <Badge variant="outline">Aninha Itens</Badge>}
                            </TableCell>
                        )}
                        <TableCell className="text-right">
                        <ManageItemTypeMenu itemType={type} isParentType={isParentTypeTable} />
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={isParentTypeTable ? 5 : 4} className="h-24 text-center">
                        Nenhum tipo de item encontrado.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    )
}
