"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Edit, Users } from "lucide-react";
import { useInfra } from "@/components/dashboard/datacenter-switcher";
import { useAuth } from "@/components/dashboard/auth-provider";
import { AddFloorPlanItemTypeDialog } from "@/components/dashboard/add-floor-plan-item-type-dialog";
import { getIconByName } from "@/lib/icon-map";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { SystemSettings } from "@/lib/types";
import { SystemSettingCard } from "@/components/dashboard/developer/system-setting-card";
import { DatacenterStatusCard } from "@/components/dashboard/developer/datacenter-status-card";


export default function SystemSettingsPage() {
    const { userData, realUserData } = useAuth();
    const { systemSettings, setSystemSettings } = useInfra();
    const { 
        companyName, 
        companyLogo, 
        floorPlanItemTypes,
        equipmentTypes, 
        deletionReasons, 
        datacenterStatuses, 
        equipmentStatuses, 
        cableTypes, 
        userRoles 
    } = systemSettings;
    const { toast } = useToast();
    
    const permissions = userData?.role ? systemSettings.rolePermissions[userData.role] : null;
    const isDeveloper = realUserData?.role === 'developer';

    const [localCompanyName, setLocalCompanyName] = useState(companyName);
    const [localCompanyLogo, setLocalCompanyLogo] = useState<string | null>(companyLogo);

    useEffect(() => {
        setLocalCompanyName(companyName);
        setLocalCompanyLogo(companyLogo);
    }, [companyName, companyLogo]);

    const handleAdd = (field: keyof SystemSettings, value: string, setValue: (s:string)=>void) => {
        if (value.trim()) {
            if (field === 'userRoles') {
                const existingRoles = systemSettings.userRoles.map(r => r.name.toLowerCase());
                if (existingRoles.includes(value.trim().toLowerCase())) {
                    toast({
                        variant: 'destructive',
                        title: "Cargo já existe",
                        description: "Um cargo com este nome já está cadastrado.",
                    });
                    return;
                }
            }

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

    const handleDeleteFloorPlanItem = (id: string) => {
        const updatedList = floorPlanItemTypes.filter(item => item.id !== id);
        setSystemSettings({ floorPlanItemTypes: updatedList });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalCompanyLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveCompanySettings = () => {
        setSystemSettings({
            companyName: localCompanyName,
            companyLogo: localCompanyLogo
        });
    };
    
    return (
        <div className="container p-4 mx-auto my-8 sm:p-8">
            <Card className="mb-8 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Configurações do Sistema</CardTitle>
                    <CardDescription>Gerencie opções, personalização e itens utilizados em toda a aplicação.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">

                <Card className="shadow-lg md:col-span-2 lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">Configurações da Empresa</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="company-name">Nome da Empresa</Label>
                            <Input id="company-name" value={localCompanyName} onChange={(e) => setLocalCompanyName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company-logo">Logo da Empresa (PNG, JPG, SVG)</Label>
                            <Input id="company-logo" type="file" accept="image/*" onChange={handleLogoChange} className="file:text-primary file:font-medium" />
                             {localCompanyLogo && (
                                <div className="mt-4 p-2 border rounded-md flex justify-center items-center bg-muted/30 h-24">
                                    <img src={localCompanyLogo} alt="Company Logo Preview" className="max-h-full object-contain" />
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <Button onClick={handleSaveCompanySettings}>Salvar Alterações</Button>
                    </CardFooter>
                </Card>

                <Card className="shadow-lg md:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-headline">Items da Planta Baixa</CardTitle>
                        <AddFloorPlanItemTypeDialog>
                             <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar
                            </Button>
                        </AddFloorPlanItemTypeDialog>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[320px]">
                            <div className="pr-4 space-y-2">
                                {floorPlanItemTypes.length > 0 ? floorPlanItemTypes.map(item => {
                                    const Icon = getIconByName(item.icon);
                                    return (
                                        <div key={item.id} className="flex items-center justify-between p-2.5 border rounded-md bg-background hover:bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5 text-muted-foreground"/>
                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <AddFloorPlanItemTypeDialog item={item}>
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-muted/80">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </AddFloorPlanItemTypeDialog>
                                                <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteFloorPlanItem(item.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                        Nenhum item cadastrado.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <SystemSettingCard 
                    title="Tipos de Equipamento"
                    field="equipmentTypes"
                    items={equipmentTypes}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                />

                <SystemSettingCard 
                    title="Cargos de Usuário"
                    field="userRoles"
                    items={(userRoles || []).filter(r => r.name !== 'developer')}
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

                {(isDeveloper || permissions?.canManagePermissions) && (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-headline">Gerenciamento de Permissões</CardTitle>
                            <CardDescription>
                                Defina o que cada cargo de usuário pode ver e fazer no sistema.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/settings/permissions">
                                <Button className="w-full">
                                    <Users className="w-4 h-4 mr-2" />
                                    Gerenciar Permissões
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
