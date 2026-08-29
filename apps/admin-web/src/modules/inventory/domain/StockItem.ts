/**
 * ssrone ERP - Inventory Stock Item Domain Model
 * Core rules for stock valuation, reorder point calculations, and unit conversions.
 */

export interface StockItemProps {
  id: string | number;
  itemName: string;
  sku: string;
  unit: string;
  currentStock: number;
  minReorderLevel: number;
  unitPurchaseCost: number;
  categoryName?: string;
}

export class StockItemEntity {
  readonly id: string | number;
  readonly itemName: string;
  readonly sku: string;
  readonly unit: string;
  readonly currentStock: number;
  readonly minReorderLevel: number;
  readonly unitPurchaseCost: number;
  readonly categoryName: string;

  constructor(props: StockItemProps) {
    this.id = props.id;
    this.itemName = props.itemName;
    this.sku = props.sku;
    this.unit = props.unit || "PCS";
    this.currentStock = Math.max(0, props.currentStock);
    this.minReorderLevel = Math.max(0, props.minReorderLevel);
    this.unitPurchaseCost = Math.max(0, props.unitPurchaseCost);
    this.categoryName = props.categoryName ?? "General Stock";
  }

  get isLowStock(): boolean {
    return this.currentStock <= this.minReorderLevel;
  }

  get stockValuation(): number {
    return Math.round(this.currentStock * this.unitPurchaseCost * 100) / 100;
  }
}
