

import type { GridItem, Room } from '@/types/datacenter';

// Bem-vindo à selva. Você está por sua conta.

interface TileDimensions {
  widthCm: number;
  heightCm: number;
}

/**
 * Verifica se um item colide com qualquer outro item em uma lista ou com os limites da sala.
 * @param itemToCheck O item que está sendo verificado.
 * @param allItems A lista de todos os outros itens na sala.
 * @param room A sala onde os itens estão localizados.
 * @returns `true` se houver colisão, `false` caso contrário.
 */
export function checkCollision(
  itemToCheck: GridItem,
  allItems: GridItem[],
  room: Room
): boolean {
  if (!room.tileWidthCm || !room.tileHeightCm) return false;

  const tileDimensions: TileDimensions = {
    widthCm: room.tileWidthCm,
    heightCm: room.tileHeightCm,
  };

  const GRID_COLS = Math.floor((room.widthM * 100) / tileDimensions.widthCm);
  const GRID_ROWS = Math.floor((room.heightM * 100) / tileDimensions.heightCm);

  // Calcula as dimensões do item em células do grid
  const itemWidthInCells = itemToCheck.width / (tileDimensions.widthCm / 100);
  const itemHeightInCells = itemToCheck.height / (tileDimensions.heightCm / 100);

  const itemToCheckEndX = itemToCheck.x + itemWidthInCells;
  const itemToCheckEndY = itemToCheck.y + itemHeightInCells;

  // 1. Verifica colisão com os limites da sala
  if (itemToCheck.x < 0 || itemToCheck.y < 0 || itemToCheckEndX > GRID_COLS || itemToCheckEndY > GRID_ROWS) {
    return true; // Colisão com as paredes
  }

  // 2. Verifica colisão com outros itens
  for (const otherItem of allItems) {
    // Ignora a verificação do item com ele mesmo
    if (otherItem.id === itemToCheck.id) continue;

    const otherItemWidthInCells = otherItem.width / (tileDimensions.widthCm / 100);
    const otherItemHeightInCells = otherItem.height / (tileDimensions.heightCm / 100);
    const otherItemEndX = otherItem.x + otherItemWidthInCells;
    const otherItemEndY = otherItem.y + otherItemHeightInCells;

    // Lógica de intersecção de retângulos (AABB - Axis-Aligned Bounding Box)
    if (
      itemToCheck.x < otherItemEndX &&
      itemToCheckEndX > otherItem.x &&
      itemToCheck.y < otherItemEndY &&
      itemToCheckEndY > otherItem.y
    ) {
      return true; // Colisão detectada
    }
  }

  // Se não encontrou nenhuma colisão
  return false;
}
