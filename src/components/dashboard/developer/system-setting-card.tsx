"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import type { SystemSettings, SelectOption } from "@/lib/types";

type SystemSettingCardProps = {
    title: string;
    field: keyof SystemSettings;
    items: SelectOption[];
    onAdd: (field: keyof SystemSettings, value: string, setValue: (s: string) => void) => void;
    onDelete: (field: keyof SystemSettings, id: string) => void;
};

export function SystemSettingCard({ title, field, items, onAdd, onDelete }: SystemSettingCardProps) {
    const [newValue, setNewValue] = useState("");

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-headline">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Input
                        placeholder="Adicionar novo..."
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onAdd(field, newValue, setNewValue)}
                    />
                    <Button onClick={() => onAdd(field, newValue, setNewValue)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                    </Button>
                </div>
                <ScrollArea className="h-72">
                    <div className="pr-4 space-y-2">
                        {items.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-2.5 border rounded-md bg-background hover:bg-muted/50">
                                <span className="font-medium">{item.name}</span>
                                <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(field, item.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
