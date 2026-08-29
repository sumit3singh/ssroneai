/**
 * ssrone ERP - POS Order Mapper
 * Transforms raw API DTOs into Domain Entities and vice-versa.
 */

import { Order } from "../domain/Order";
import { OrderResponseDTO, CreateOrderRequestDTO } from "../dto/OrderDTO";

export class OrderMapper {
  static toDomain(dto: OrderResponseDTO): Order {
    return new Order({
      id: dto.id,
      tableNumber: dto.table_number,
      orderType: dto.order_type,
      status: dto.status,
      cashierId: dto.created_at,
      createdAt: dto.created_at,
      items: dto.items.map((item) => ({
        id: item.item_id,
        name: item.item_name,
        price: item.unit_price,
        quantity: item.qty,
        taxRatePercent: item.tax_rate,
        discountPercent: item.discount_rate,
        notes: item.special_instructions,
      })),
    });
  }

  static toCreateDTO(domain: Order): CreateOrderRequestDTO {
    return {
      table_id: String(domain.tableNumber),
      order_type: domain.orderType,
      discount_percent: domain.orderDiscountPercent,
      service_charge_percent: domain.serviceChargePercent,
      cashier_id: domain.cashierId,
      items: domain.items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        unit_price: item.price,
        qty: item.quantity,
        tax_rate: item.taxRatePercent,
        discount_rate: item.discountPercent,
        special_instructions: item.notes,
      })),
    };
  }
}
