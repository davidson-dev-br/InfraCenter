
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search, Plus } from 'lucide-react';
import type { GridItem } from '@/types/datacenter';
import type { ItemStatus } from '@/lib/status-actions';
import { ItemDetailDialog } from '../item-detail-dialog';
import { AddChildItemDialog } from './add-child-item-dialog';

interface ChildItemsTableProps {
  items: GridItem[];
  allItems: GridItem[];
  statuses: ItemStatus[];
  preferences?: Record<string, boolean>;
}

const statusColorClasses: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    offline: "bg-red-500/20 text-red-400 border-red-500/30",
    draft: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    pending_approval: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export function ChildItemsTable({ items, allItems, statuses, preferences = {} }: ChildItemsTableProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState<GridItem | null>(null);
    const [isAddChildOpen, setIsAddChildOpen] = useState(false);

    const isColumnVisible = (column: string) => preferences[column] !== false;

    const statusesById = useMemo(() => new Map(statuses.map(s => [s.id, s])), [statuses]);

    const filteredItems = useMemo(() => {
        return items.filter(item =>
          (item.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (item.parentName || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
          (statusFilter === 'all' || item.status === statusFilter)
        );
    }, [items, searchTerm, statusFilter]);

    const handleItemUpdate = (updatedItem: GridItem) => {
        setSelectedItem(updatedItem);
        router.refresh();
    };

    const handleItemDelete = () => {
        setSelectedItem(null);
        router.refresh();
    };

  return (
    <>
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou item pai..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        {statuses.map(status => (
                          <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={() => setIsAddChildOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Aninhado
                </Button>
            </div>
            <div className="border rounded-md">
                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Item Pai</TableHead>
                        <TableHead>Status</TableHead>
                        {isColumnVisible('type') && <TableHead>Tipo</TableHead>}
                        {isColumnVisible('serialNumber') && <TableHead>Nº de Série</TableHead>}
                        {isColumnVisible('brand') && <TableHead>Fabricante</TableHead>}
                        {isColumnVisible('tag') && <TableHead>TAG</TableHead>}
                        {isColumnVisible('ownerEmail') && <TableHead>Proprietário</TableHead>}
                        {isColumnVisible('modelo') && <TableHead>Modelo</TableHead>}
                        {isColumnVisible('preco') && <TableHead>Preço</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <TableRow key={item.id} className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                            <TableCell className="font-medium">{item.label}</TableCell>
                            <TableCell>{item.parentName}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className={cn("capitalize", statusColorClasses[item.status] || 'text-foreground')}>
                                {statusesById.get(item.status)?.name || item.status}
                                </Badge>
                            </TableCell>
                            {isColumnVisible('type') && <TableCell>{item.type}</TableCell>}
                            {isColumnVisible('serialNumber') && <TableCell>{item.serialNumber || '-'}</TableCell>}
                            {isColumnVisible('brand') && <TableCell>{item.brand || '-'}</TableCell>}
                            {isColumnVisible('tag') && <TableCell>{item.tag || '-'}</TableCell>}
                            {isColumnVisible('ownerEmail') && <TableCell>{item.ownerEmail || '-'}</TableCell>}
                            {isColumnVisible('modelo') && <TableCell>{item.modelo || '-'}</TableCell>}
                            {isColumnVisible('preco') && <TableCell>{item.preco ? `R$ ${item.preco.toFixed(2)}` : '-'}</TableCell>}
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={10} className="h-24 text-center">
                        Nenhum equipamento encontrado.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </div>

        {selectedItem && (
             <ItemDetailDialog
                item={selectedItem}
                open={!!selectedItem}
                onOpenChange={(open) => !open && setSelectedItem(null)}
                onItemUpdate={handleItemUpdate}
                onItemDelete={handleItemDelete}
                fullItemContext={{ allItems }}
            />
        )}
        <AddChildItemDialog
            allItems={allItems}
            open={isAddChildOpen}
            onOpenChange={setIsAddChildOpen}
        />
    </>
  );
}
