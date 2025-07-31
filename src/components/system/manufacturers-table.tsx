
"use client"
import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '../ui/skeleton';
import { getManufacturers, Manufacturer } from '@/lib/manufacturer-actions';
import { ManageManufacturerMenu } from './manage-manufacturer-menu';

export function ManufacturersTable() {
    const [manufacturers, setManufacturers] = React.useState<Manufacturer[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        getManufacturers().then(data => {
            setManufacturers(data);
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
                        <TableHead>Nome do Fabricante</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {manufacturers.length > 0 ? (
                        manufacturers.map(manufacturer => (
                            <TableRow key={manufacturer.id}>
                                <TableCell className="font-medium">{manufacturer.name}</TableCell>
                                <TableCell className="text-right">
                                    <ManageManufacturerMenu manufacturer={manufacturer} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={2} className="h-24 text-center">
                                Nenhum fabricante encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
