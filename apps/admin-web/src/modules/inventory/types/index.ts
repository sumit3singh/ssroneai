/**
 * Inventory Module Types
 */

export interface StockItem {
  id: string;
  product_id?: string;
  name: string;
  category?: string;
  quantity: number;
  reorder_level: number;
  unit: string;
  cost: number;
}
