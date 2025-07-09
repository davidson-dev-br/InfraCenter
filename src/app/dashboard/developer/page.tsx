"use client";

import React from "react";
import { useInfra } from "@/components/dashboard/datacenter-switcher";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DbActionsCard } from "@/components/dashboard/developer/db-actions-card";
import { SystemSettingCard } from "@/components/dashboard/developer/system-setting-card";
import { DatacenterStatusCard } from "@/components/dashboard/developer/datacenter-status-card";
import type { SystemSettings } from "@/lib/types";

export default function DeveloperSettingsPage() {
    const { systemSettings, setSystemSettings } = useInfra();
    const { equipmentTypes, deletionReasons, datacenterStatuses, equipmentStatuses, cableTypes } = systemSettings;

    const handleAdd = (field: keyof SystemSettings, value: string, setValue: (s:string)=>void) => {
        if (value.trim()) {
            const currentList = systemSettings[field] as { id: string, name: string }[];
            const updatedList = [...currentList, { id: Date.now().toString(), name: value.trim() }];
            setSystemSettings({ [field]: updatedList });
            setValue("");
        }
    }

    const handleDelete = (field: keyof SystemSettings, id: string) => {
        const currentList = systemSettings[field] as { id: string, name: string }[];
        const updatedList = currentList.filter(item => item.id !== id);
        setSystemSettings({ [field]: updatedList });
    }

    return (
        <div className="container p-4 mx-auto my-8 sm:p-8">
            <Card className="mb-8 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Configurações de Desenvolvedor</CardTitle>
                    <CardDescription>Gerencie opções e seletores utilizados em todo o sistema. As alterações aqui podem afetar a operação da aplicação.</CardDescription>
                </CardHeader>
            </Card>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <DbActionsCard />
                
                <SystemSettingCard 
                    title="Tipos de Equipamento"
                    field="equipmentTypes"
                    items={equipmentTypes}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                />
                
                <SystemSettingCard 
                    title="Motivos de Exclusão"
                    field="deletionReasons"
                    items={deletionReasons}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                />

                <SystemSettingCard 
                    title="Tipos de Cabo"
                    field="cableTypes"
                    items={cableTypes}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                />

                <DatacenterStatusCard 
                    statuses={datacenterStatuses}
                    onDelete={handleDelete}
                />
                
                <SystemSettingCard 
                    title="Status de Equipamento"
                    field="equipmentStatuses"
                    items={equipmentStatuses}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}
