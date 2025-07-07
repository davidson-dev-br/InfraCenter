"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, Router, HardDrive, Plus, X } from "lucide-react";
import type { Equipment } from "./floor-plan-context";
import { useFloorPlan } from "./floor-plan-context";
import { cn } from "@/lib/utils";

const items: Equipment[] = [
    { name: "Server Rack", icon: Server },
    { name: "Network Switch", icon: Router },
    { name: "Storage Array", icon: HardDrive }
];

export function ItemPalette() {
    const { selectedEquipment, setSelectedEquipment } = useFloorPlan();

    const handleSelect = (item: Equipment) => {
        if (selectedEquipment?.name === item.name) {
            setSelectedEquipment(null);
        } else {
            setSelectedEquipment(item);
        }
    }

    return (
        <Card className="sticky top-24 shadow-md">
            <CardHeader>
                <CardTitle>Equipment</CardTitle>
                <CardDescription>
                    Select an item to place on the floor.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {items.map(item => (
                        <Button 
                            key={item.name}
                            variant={selectedEquipment?.name === item.name ? "secondary" : "outline"}
                            className={cn("w-full justify-start", selectedEquipment?.name === item.name && "ring-2 ring-primary")}
                            onClick={() => handleSelect(item)}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                            {selectedEquipment?.name === item.name && <X className="w-4 h-4 ml-auto" />}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
