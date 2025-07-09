import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { PlacedItem, Equipment, Connection, Building } from './types';

interface ExportToExcelParams {
  includeItems: boolean;
  includeEquipment: boolean;
  includeConnections: boolean;
  itemsByRoom: Record<string, PlacedItem[]>;
  equipmentData: Equipment[];
  connectionsData: Connection[];
  buildingsData: Building[];
}

export const exportToExcel = ({
  includeItems,
  includeEquipment,
  includeConnections,
  itemsByRoom,
  equipmentData,
  connectionsData,
  buildingsData
}: ExportToExcelParams) => {
  const wb = XLSX.utils.book_new();

  const allPlacedItems = Object.values(itemsByRoom).flat();
  const allRooms = buildingsData.flatMap(b => (b.rooms || []).map(r => ({ ...r, buildingName: b.name })));

  if (includeItems) {
    const itemsSheetData = allPlacedItems.map(item => {
        const roomInfo = allRooms.find(r => r.id === item.roomId);
        return {
            'ID': item.id,
            'Nome': item.name,
            'Tipo': item.type,
            'Datacenter': roomInfo?.buildingName || 'N/A',
            'Sala': roomInfo?.name || 'N/A',
            'Status': item.status,
            'Largura (m)': item.width,
            'Comprimento (m)': item.length,
            'Tamanho (U)': item.sizeU,
            'Fileira': item.row,
            'Posição X': item.x,
            'Posição Y': item.y,
            'Observações': item.observations,
            'Criado por': item.createdBy,
            'Data Criação': item.createdAt,
        };
    });
    const itemsWs = XLSX.utils.json_to_sheet(itemsSheetData);
    XLSX.utils.book_append_sheet(wb, itemsWs, 'Itens da Planta');
  }

  if (includeEquipment) {
    const equipmentSheetData = equipmentData.map(eq => {
        const parentItem = allPlacedItems.find(p => p.id === eq.parentItemId);
        const roomInfo = parentItem ? allRooms.find(r => r.id === parentItem.roomId) : null;
        return {
            'ID': eq.id,
            'Hostname': eq.hostname,
            'Tipo': eq.type,
            'Fabricante': eq.brand,
            'Modelo': eq.model,
            'Serial': eq.serialNumber,
            'TAG': eq.tag,
            'Datacenter': roomInfo?.buildingName || 'N/A',
            'Sala': roomInfo?.name || 'N/A',
            'Gabinete (Item Pai)': parentItem?.name || 'N/A',
            'Posição (U)': eq.positionU,
            'Tamanho (U)': eq.sizeU,
            'Status': eq.status,
            'Data de Entrada': eq.entryDate,
            'Descrição': eq.description,
        };
    });
    const equipmentWs = XLSX.utils.json_to_sheet(equipmentSheetData);
    XLSX.utils.book_append_sheet(wb, equipmentWs, 'Equipamentos');
  }

  if (includeConnections) {
    const connectionsSheetData = connectionsData.map(conn => {
        const sourceEq = equipmentData.find(e => e.id === conn.sourceEquipmentId);
        const destEq = equipmentData.find(e => e.id === conn.destinationEquipmentId);
        return {
            'ID': conn.id,
            'Etiqueta do Cabo': conn.cableLabel,
            'Equipamento Origem': sourceEq?.hostname || 'N/A',
            'Porta Origem': conn.sourcePort,
            'Equipamento Destino': destEq?.hostname || 'N/A',
            'Porta Destino': conn.destinationPort,
            'Tipo de Cabo': conn.cableType,
            'Status': conn.status,
            'Ativa': conn.isActive ? 'Sim' : 'Não',
            'Observações': conn.notes,
        };
    });
    const connectionsWs = XLSX.utils.json_to_sheet(connectionsSheetData);
    XLSX.utils.book_append_sheet(wb, connectionsWs, 'Conexões');
  }

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `InfraCenter_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};
