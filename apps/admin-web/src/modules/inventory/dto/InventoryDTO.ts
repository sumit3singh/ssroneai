/**
 * ssrone ERP - Material & Inventory DTO Layer
 */

export interface StockItemDTO {
  id: string | number;
  item_name: string;
  sku: string;
  unit: string;
  current_stock: number;
  min_reorder_level: number;
  unit_purchase_cost: number;
  category_name?: string;
  branch_id: string | number;
}
