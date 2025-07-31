
import { getInventoryData } from "@/lib/inventory-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ParentItemsTable } from "@/components/inventory/parent-items-table";
import { ChildItemsTable } from "@/components/inventory/child-items-table";
import { HardDrive, Puzzle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  // Buscar os dados E as preferências usando a server action
  const { parentItems, childItems, allItems, statuses, preferences } = await getInventoryData();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Equipamentos</h1>
      
      {/* Bloco para Itens de Planta Baixa (Pais) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Puzzle className="h-6 w-6" />
            <CardTitle>Itens de Planta Baixa</CardTitle>
          </div>
          <CardDescription>
            Equipamentos estruturais que aparecem diretamente no mapa do datacenter, como racks, QDFs e equipamentos de climatização.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParentItemsTable items={parentItems} allItems={allItems} statuses={statuses} preferences={preferences?.parent} />
        </CardContent>
      </Card>

      {/* Bloco para Equipamentos Aninhados (Filhos) */}
      <Card>
        <CardHeader>
           <div className="flex items-center gap-3">
            <HardDrive className="h-6 w-6" />
            <CardTitle>Equipamentos Aninhados</CardTitle>
          </div>
          <CardDescription>
            Servidores, switches, patch panels e outros dispositivos que residem dentro de um item pai (como um rack).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChildItemsTable items={childItems} allItems={allItems} statuses={statuses} preferences={preferences?.child} />
        </CardContent>
      </Card>
    </div>
  );
}
