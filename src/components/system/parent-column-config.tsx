
"use client";

import * as React from 'react';
import { usePermissions } from '@/components/permissions-provider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { updateUser } from '@/lib/user-actions';

const AVAILABLE_COLUMNS = {
    type: 'Tipo',
    serialNumber: 'Nº de Série',
    brand: 'Fabricante',
    tag: 'TAG',
    ownerEmail: 'Proprietário (Email)',
    tamanhoU: 'Tamanho (U)',
    potenciaW: 'Potência (W)',
};

type ColumnKey = keyof typeof AVAILABLE_COLUMNS;

export function ParentColumnConfig() {
    const { user } = usePermissions();
    const { toast } = useToast();
    
    const [selectedColumns, setSelectedColumns] = React.useState(
        user?.preferences?.inventoryColumns?.parent || {}
    );
    const [isSaving, setIsSaving] = React.useState(false);
    
    React.useEffect(() => {
        setSelectedColumns(user?.preferences?.inventoryColumns?.parent || {});
    }, [user]);

    const handleColumnToggle = (column: ColumnKey, checked: boolean) => {
        setSelectedColumns(prev => ({
            ...prev,
            [column]: checked,
        }));
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const newPreferences = {
                ...user.preferences,
                inventoryColumns: {
                    ...user.preferences?.inventoryColumns,
                    parent: selectedColumns,
                }
            };

            await updateUser({
                id: user.id,
                preferences: newPreferences,
            });
            toast({
                title: 'Sucesso!',
                description: 'Suas preferências de visualização foram salvas.',
            });
            window.location.reload();
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar suas preferências.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-md">
                {Object.entries(AVAILABLE_COLUMNS).map(([columnKey, columnLabel]) => (
                    <div key={columnKey} className="flex items-center space-x-2">
                        <Checkbox
                            id={`parent-${columnKey}`}
                            checked={selectedColumns[columnKey as ColumnKey] !== false}
                            onCheckedChange={(checked) => 
                                handleColumnToggle(columnKey as ColumnKey, !!checked)
                            }
                        />
                        <Label htmlFor={`parent-${columnKey}`}>{columnLabel}</Label>
                    </div>
                ))}
            </div>
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar
                </Button>
            </div>
        </div>
    );
}
