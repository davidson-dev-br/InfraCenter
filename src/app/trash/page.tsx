
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HardDrive, Puzzle, DoorOpen, Building } from "lucide-react";
import { getDecommissionedItems } from "@/lib/item-actions";
import { DecommissionedItemsTable } from "@/components/trash/decommissioned-items-table";
import { getDeletedItemTypes } from '@/lib/item-types-actions';
import { DeletedItemTypesTable } from '@/components/trash/deleted-item-types-table';

export const dynamic = 'force-dynamic';

const PlaceholderContent = ({ entity }: { entity: string }) => (
    <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg text-center p-4">
        <p className="text-muted-foreground">Nenhum(a) {entity} excluído(a) encontrado(a).</p>
        <p className="text-sm text-muted-foreground/80">Quando um(a) {entity} for excluído(a), aparecerá aqui para recuperação ou exclusão permanente.</p>
    </div>
);

export default async function TrashPage() {
  const [decommissionedItems, deletedItemTypes] = await Promise.all([
      getDecommissionedItems(),
      getDeletedItemTypes()
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Lixeira</h1>
      <Card>
        <CardHeader>
          <CardTitle>Itens Excluídos</CardTitle>
          <CardDescription>
            Gerencie itens que foram removidos do sistema. Você pode restaurá-los ou excluí-los permanentemente.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="equipments">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="equipments"><HardDrive className="mr-2 h-4 w-4"/>Equipamentos</TabsTrigger>
                    <TabsTrigger value="item_types"><Puzzle className="mr-2 h-4 w-4"/>Tipos de Item</TabsTrigger>
                    <TabsTrigger value="rooms"><DoorOpen className="mr-2 h-4 w-4"/>Salas</TabsTrigger>
                    <TabsTrigger value="buildings"><Building className="mr-2 h-4 w-4"/>Prédios</TabsTrigger>
                </TabsList>
                <TabsContent value="equipments" className="mt-4">
                    {decommissionedItems.length > 0 ? (
                        <DecommissionedItemsTable items={decommissionedItems} />
                    ) : (
                        <PlaceholderContent entity="equipamento" />
                    )}
                </TabsContent>
                <TabsContent value="item_types" className="mt-4">
                     {deletedItemTypes.length > 0 ? (
                        <DeletedItemTypesTable itemTypes={deletedItemTypes} />
                     ) : (
                        <PlaceholderContent entity="tipo de item" />
                     )}
                </TabsContent>
                <TabsContent value="rooms" className="mt-4">
                     <PlaceholderContent entity="sala" />
                </TabsContent>
                 <TabsContent value="buildings" className="mt-4">
                     <PlaceholderContent entity="prédio" />
                 </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
