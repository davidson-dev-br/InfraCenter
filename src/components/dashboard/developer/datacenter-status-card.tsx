"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Edit } from "lucide-react";
import type { SystemSettings, StatusOption } from "@/lib/types";
import { DatacenterStatusDialog } from "@/components/dashboard/developer/datacenter-status-dialog";

type DatacenterStatusCardProps = {
    statuses: StatusOption[];
    onDelete: (field: keyof SystemSettings, id: string) => void;
};

export function DatacenterStatusCard({ statuses, onDelete }: DatacenterStatusCardProps) {
    return (
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-headline">Status do Datacenter</CardTitle>
                 <DatacenterStatusDialog>
                     <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                    </Button>
                </DatacenterStatusDialog>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-72">
                    <div className="pr-4 space-y-2">
                        {statuses.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-2.5 border rounded-md bg-background hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <span style={{ backgroundColor: item.color }} className="block w-4 h-4 border rounded-full" />
                                    <span className="font-medium">{item.name}</span>
                                </div>
                                <div className="flex items-center">
                                    <DatacenterStatusDialog status={item}>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-muted/80">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </DatacenterStatusDialog>
                                    <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete('datacenterStatuses', item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
