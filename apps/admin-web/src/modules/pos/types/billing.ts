import { POSVariantOption, POSAddonOption } from "./menu";

export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "EXPRESS";
export type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";

export interface POSCartItem {
  cart_id: string;
  fingerprint_key?: string;
  item_id: number;
  name: string;
  variant_name?: string;
  unit_price: number;
  packaging_charge?: number;
  quantity: number;
  selected_variant?: POSVariantOption;
  selected_addons?: POSAddonOption[];
  addons?: POSAddonOption[];
  notes?: string;
  is_veg: boolean;
  kds_station?: string;
}

export interface POSOrder {
  id: number | string;
  order_number: string;
  table_id?: number | string;
  table_name?: string;
  waiter_id?: number;
  waiter_name?: string;
  customer_id?: number | string;
  customer_name?: string;
  customer_phone?: string;
  order_type: OrderType;
  order_mode?: string;
  status: OrderStatus;
  items: POSCartItem[];
  subtotal: number;
  packaging_charge?: number;
  tax_amount: number;
  discount_amount: number;
  net_amount: number;
  payment_method?: string;
  created_at: string;
}

export interface POSShiftSummary {
  shift_id: string;
  opened_at: string;
  opening_balance: number;
  total_sales: number;
  cash_sales: number;
  upi_sales: number;
  card_sales: number;
  order_count: number;
}
