/**
 * ssrone ERP - Stock Item Mapper
 */

import { StockItemEntity } from "../domain/StockItem";
import { StockItemDTO } from "../dto/InventoryDTO";

export class InventoryMapper {
  static toDomain(dto: StockItemDTO): StockItemEntity {
    return new StockItemEntity({
      id: dto.id,
      itemName: dto.item_name,
      sku: dto.sku,
      unit: dto.unit,
      currentStock: dto.current_stock,
      minReorderLevel: dto.min_reorder_level,
      unitPurchaseCost: dto.unit_purchase_cost,
      categoryName: dto.category_name,
    });
  }

  static toDTO(domain: StockItemEntity, branchId: string | number = 1): StockItemDTO {
    return {
      id: domain.id,
      item_name: domain.itemName,
      sku: domain.sku,
      unit: domain.unit,
      current_stock: domain.currentStock,
      min_reorder_level: domain.minReorderLevel,
      unit_purchase_cost: domain.unitPurchaseCost,
      category_name: domain.categoryName,
      branch_id: branchId,
    };
  }
}
