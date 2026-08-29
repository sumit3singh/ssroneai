/**
 * ssrone ERP - Inventory Repository
 */

import { api } from "@ssrone/api-client";
import { StockItemEntity } from "../domain/StockItem";
import { InventoryMapper } from "../mappers/InventoryMapper";
import { StockItemDTO } from "../dto/InventoryDTO";

export interface IInventoryRepository {
  getStockItems(): Promise<StockItemEntity[]>;
  updateStockQuantity(id: string | number, qtyDelta: number): Promise<StockItemEntity>;
}

export class InventoryRepository implements IInventoryRepository {
  async getStockItems(): Promise<StockItemEntity[]> {
    const dtos = (await api.get<StockItemDTO[]>("/inventory/items")) || [];
    return dtos.map(InventoryMapper.toDomain);
  }

  async updateStockQuantity(id: string | number, qtyDelta: number): Promise<StockItemEntity> {
    const res = await api.patch<StockItemDTO>(`/inventory/items/${id}/stock`, { qty_delta: qtyDelta });
    return InventoryMapper.toDomain(res);
  }
}

export const inventoryRepository = new InventoryRepository();
