
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Edit } from "lucide-react";
import { useInfra } from "@/components/dashboard/datacenter-switcher";
import { AddFloorPlanItemTypeDialog } from "@/components/dashboard/add-floor-plan-item-type-dialog";
import { getIconByName } from "@/lib/icon-map";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SystemSettingsPage() {
    const { systemSettings, setSystemSettings } = useInfra();
    const { companyName, companyLogo, floorPlanItemTypes } = systemSettings;
    const { toast } = useToast();

    const [localCompanyName, setLocalCompanyName] = useState(companyName);
    const [localCompanyLogo, setLocalCompanyLogo] = useState<string | null>(companyLogo);

    useEffect(() => {
        setLocalCompanyName(companyName);
        setLocalCompanyLogo(companyLogo);
    }, [companyName, companyLogo]);

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
        // The toast is now handled within setSystemSettings
    };
    
    return (
        <div className="container p-4 mx-auto my-8 sm:p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

                <Card className="shadow-lg md:col-span-2">
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

                <Card className="shadow-lg md:col-span-2">
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
            </div>
        </div>
    );
}
