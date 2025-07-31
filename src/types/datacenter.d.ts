



// Tipos e Interfaces
export interface GridItem {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  status: any;
  roomId?: string;
  parentId?: string | null;
  serialNumber?: string;
  brand?: string;
  tag?: string;
  isTagEligible?: boolean;
  ownerEmail?: string;
  dataSheetUrl?: string;
  description?: string;
  imageUrl?: string;
  modelo?: string;
  preco?: number;
  trellisId?: string;
  tamanhoU?: number;
  posicaoU?: number;
  potenciaW?: number;
  color?: string;
  // Propriedades que podem vir do JOIN
  roomName?: string;
  buildingName?: string;
  itemTypeColor?: string;
  parentName?: string | null;
}

export type AxisNaming = 'alpha' | 'numeric';

export interface Room {
  id: string;
  name: string;
  buildingId: string;
  widthM: number;
  heightM: number;
  tileWidthCm: number;
  tileHeightCm: number;
  xAxisNaming: AxisNaming;
  yAxisNaming: AxisNaming;
  items: GridItem[];
  // Adicionando as propriedades que o RenameRoomDialog espera para compatibilidade
  largura?: number;
  comprimento?: number;
}

export interface Building {
  id: string;
  name: string;
  rooms: Room[];
}
