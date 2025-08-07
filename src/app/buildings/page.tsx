
import { getDbPool } from "@/lib/db";
import { AddBuildingDialog } from "@/components/add-building-dialog";
import { ManageBuildingMenu } from "@/components/manage-building-menu";
import { ManageRoomMenu } from "@/components/manage-room-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building, DoorOpen, MapPin, Square, Grid } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export interface Room {
  id: string;
  name: string;
  buildingId: string;
  largura?: number;
  comprimento?: number;
  tileWidthCm?: number;
  tileHeightCm?: number;
}

export interface BuildingWithRooms {
  id: string;
  name:string;
  address?: string;
  rooms: Room[];
}

async function getBuildings(): Promise<BuildingWithRooms[]> {
    try {
        const pool = await getDbPool();
        
        // 1. Buscar prédios e salas em duas queries separadas para melhor performance.
        const buildingsResult = await pool.request().query('SELECT id, name, address FROM Buildings ORDER BY name');
        const roomsResult = await pool.request().query('SELECT id, name, buildingId, largura, widthM AS comprimento, ISNULL(tileWidthCm, 60) as tileWidthCm, ISNULL(tileHeightCm, 60) as tileHeightCm FROM Rooms');

        // 2. Mapear os prédios e criar um mapa para acesso rápido.
        const buildingsMap = new Map<string, BuildingWithRooms>();
        const buildings: BuildingWithRooms[] = buildingsResult.recordset.map(b => {
            const building = { ...b, rooms: [] };
            buildingsMap.set(building.id, building);
            return building;
        });

        // 3. Associar as salas aos seus respectivos prédios.
        for (const room of roomsResult.recordset) {
            if (buildingsMap.has(room.buildingId)) {
                buildingsMap.get(room.buildingId)?.rooms.push(room);
            }
        }

        return buildings;

    } catch (err) {
        console.error('Falha ao buscar prédios e salas:', err);
        return []; 
    }
}

export default async function BuildingsPage() {
  const buildings = await getBuildings();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Gerenciar Estruturas</h1>
        <AddBuildingDialog />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Prédios e Salas</CardTitle>
          <CardDescription>
            Gerencie os prédios e as salas. Clique em um prédio para ver e gerenciar as salas contidas nele.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {buildings.length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {buildings.map((building) => (
                <AccordionItem value={building.id} key={building.id}>
                  <div className="flex items-center justify-between pr-4 hover:bg-muted/50 rounded-lg">
                    <AccordionTrigger className="flex-1 px-4 py-3 text-lg font-medium">
                       <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-3">
                            <Building className="h-5 w-5 text-primary" />
                            {building.name} 
                            <Badge variant="outline">{building.rooms.length} sala(s)</Badge>
                          </div>
                          {building.address && (
                            <div className="flex items-center gap-2 pl-8 text-sm text-muted-foreground font-normal">
                              <MapPin className="h-3 w-3" />
                              {building.address}
                            </div>
                          )}
                       </div>
                    </AccordionTrigger>
                    <ManageBuildingMenu building={building} />
                  </div>
                  <AccordionContent className="pt-2 pb-4 pl-8 pr-4">
                    {building.rooms.length > 0 ? (
                       <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome da Sala</TableHead>
                              <TableHead>Dimensões (L x C)</TableHead>
                              <TableHead>Piso (L x C)</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {building.rooms.map((room) => (
                              <TableRow key={room.id}>
                                <TableCell className="flex items-center gap-3">
                                  <DoorOpen className="h-4 w-4 text-muted-foreground" />
                                  {room.name}
                                </TableCell>
                                <TableCell>
                                  {room.largura && room.comprimento ? (
                                    <span>{room.largura}m x {room.comprimento}m</span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground/60 italic">Não definido</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {room.tileWidthCm && room.tileHeightCm ? (
                                    <span className="flex items-center gap-2">
                                      <Grid className="h-4 w-4 text-muted-foreground" />
                                      {room.tileWidthCm}cm x {room.tileHeightCm}cm
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground/60 italic">Padrão (60x60cm)</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <ManageRoomMenu room={room} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        Nenhuma sala cadastrada neste prédio.
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
             <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
                Nenhum prédio cadastrado. Adicione um para começar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
