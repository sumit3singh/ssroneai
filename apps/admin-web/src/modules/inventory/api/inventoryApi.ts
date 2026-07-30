/**
 * Inventory API Client
 */
import { api } from "@/shared/utils/api-client";
import { StockItem } from "../types";

export const inventoryApi = {
  getItems: () => api.get<StockItem[]>("/inventory/items"),
  createItem: (data: Partial<StockItem>) => api.post<StockItem>("/inventory/items", data),
  adjustQuantity: (id: string, delta: number) => api.patch(`/inventory/items/${id}/adjust`, { delta }),
};
