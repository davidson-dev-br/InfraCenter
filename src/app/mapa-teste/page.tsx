

import { getDbPool } from "@/lib/db";
import { DatacenterClient } from "@/components/datacenter-client";
import type { Building, Room, GridItem } from "@/types/datacenter";

export const dynamic = 'force-dynamic';

async function getDatacenterData(): Promise<Building[]> {
    try {
        const pool = await getDbPool();

        // 1. Buscar todas as entidades em paralelo
        const [buildingsResult, roomsResult, itemsResult] = await Promise.all([
            pool.request().query('SELECT id, name FROM Buildings ORDER BY name'),
            pool.request().query('SELECT id, name, buildingId, largura, widthM, tileWidthCm, tileHeightCm, xAxisNaming, yAxisNaming FROM Rooms ORDER BY name'),
            pool.request().query(`
                SELECT 
                    i.id, i.label, i.x, i.y, i.width, i.height, i.type, i.status, i.roomId,
                    i.serialNumber, i.brand, i.tag, i.isTagEligible, i.ownerEmail,
                    i.dataSheetUrl, i.description, i.imageUrl, i.modelo, i.preco,
                    i.trellisId, i.tamanhoU, i.potenciaW, i.color,
                    it.defaultColor AS itemTypeColor
                FROM ParentItems i
                LEFT JOIN ItemTypes it ON i.type = it.name
                WHERE i.status IN ('active', 'draft', 'pending_approval', 'maintenance')
            `)
        ]);

        // 2. Mapear os resultados em estruturas de dados fáceis de usar
        const allRooms = roomsResult.recordset.map(r => ({
            id: r.id,
            name: r.name,
            buildingId: r.buildingId,
            widthM: r.largura || 20, 
            heightM: r.widthM || 20, 
            tileWidthCm: r.tileWidthCm || 60,
            tileHeightCm: r.tileHeightCm || 60,
            xAxisNaming: r.xAxisNaming || 'alpha',
            yAxisNaming: r.yAxisNaming || 'numeric',
            // Para compatibilidade com o dialog de edição
            largura: r.largura,
            comprimento: r.widthM,
            items: [] as GridItem[]
        })) as Room[];

        const allItems = itemsResult.recordset as GridItem[];

        // 3. Associar itens às suas respectivas salas
        const roomsById = new Map<string, Room>(allRooms.map(r => [r.id, r]));
        for (const item of allItems) {
            if (item.roomId && roomsById.has(item.roomId)) {
                roomsById.get(item.roomId)!.items.push(item);
            }
        }

        // 4. Associar salas aos seus respectivos prédios
        const buildings = buildingsResult.recordset.map(b => ({
            id: b.id,
            name: b.name,
            rooms: [] as Room[]
        })) as Building[];

        const buildingsById = new Map<string, Building>(buildings.map(b => [b.id, b]));
        for (const room of allRooms) {
            if (room.buildingId && buildingsById.has(room.buildingId)) {
                buildingsById.get(room.buildingId)!.rooms.push(room);
            }
        }

        return Array.from(buildingsById.values());

    } catch (err) {
        console.error('Falha ao buscar dados para o mapa de teste:', err);
        return []; 
    }
}


export default async function TesteMapaPage() {
  const initialData = await getDatacenterData();

  return <DatacenterClient initialData={initialData} />;
}
