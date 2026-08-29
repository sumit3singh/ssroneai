/**
 * ssrone ERP - POS Data Transfer Objects (DTO Layer)
 * Explicit request and response payloads isolating domain models from backend API structures.
 */

export interface OrderItemDTO {
  item_id: string | number;
  item_name: string;
  unit_price: number;
  qty: number;
  tax_rate?: number;
  discount_rate?: number;
  special_instructions?: string;
}

export interface CreateOrderRequestDTO {
  table_id: string;
  order_type: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  items: OrderItemDTO[];
  discount_percent?: number;
  service_charge_percent?: number;
  cashier_id?: string;
}

export interface OrderResponseDTO {
  id: string | number;
  order_number: string;
  table_number: string;
  order_type: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  status: "PENDING" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";
  items: OrderItemDTO[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  grand_total: number;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  branch_id: string;
}
