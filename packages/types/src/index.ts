/**
 * SSR One AI – Monorepo Shared Types
 * Centralized TypeScript definitions for entities, DTOs, and global state.
 */

// ─── Base Types ───────────────────────────────────────────────

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  is_deleted: boolean;
}

export interface TenantEntity extends BaseEntity {
  tenant_id: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiError {
  error: string;
  message: string;
  detail?: string | Record<string, unknown>;
}

// ─── Auth ─────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  is_superadmin: boolean;
  tenant_id: string;
  language: string;
  timezone: string;
  created_at: string;
}

export interface AuthState {
  user: UserProfile | null;
  access_token: string | null;
  tenant_slug: string | null;
  is_authenticated: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenant_slug: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserProfile;
}

export interface Company {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  tenant_id: string;
  company_id: string;
  name: string;
  code: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  permissions: string[];
}

export interface FinancialYear {
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// ─── Orders ──────────────────────────────────────────────────

export type OrderStatus =
  | "draft" | "confirmed" | "in_kitchen"
  | "ready" | "served" | "completed"
  | "cancelled" | "refunded";

export type OrderType =
  | "dine_in" | "takeaway" | "delivery"
  | "room_service" | "banquet" | "online";

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  kds_status: string;
  modifiers: unknown[];
}

export interface Order extends TenantEntity {
  order_number: string;
  branch_id: string;
  order_type: OrderType;
  status: OrderStatus;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  total_tax: number;
  grand_total: number;
  amount_paid: number;
  balance_due: number;
  notes: string | null;
  items: OrderItem[];
  confirmed_at: string | null;
}

// ─── Inventory ────────────────────────────────────────────────

export interface Product extends TenantEntity {
  name: string;
  code: string;
  barcode: string | null;
  category_id: string | null;
  product_type: string;
  mrp: number;
  selling_price: number;
  cost_price: number | null;
  unit_of_measure: string;
  track_inventory: boolean;
  reorder_level: number | null;
  is_active: boolean;
  is_vegetarian: boolean | null;
  images: string[];
}

export interface StockEntry extends TenantEntity {
  product_id: string;
  branch_id: string;
  quantity_on_hand: number;
  quantity_available: number;
  average_cost: number;
}

// ─── CRM ─────────────────────────────────────────────────────

export interface Customer extends TenantEntity {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  loyalty_tier: string;
  loyalty_points: number;
  wallet_balance: number;
  lifetime_spent: number;
  total_visits: number;
  last_visit_at: string | null;
  is_active: boolean;
}

// ─── Hotel ────────────────────────────────────────────────────

export type RoomStatus =
  | "available" | "occupied" | "checked_out"
  | "maintenance" | "cleaning" | "blocked" | "out_of_order";

export interface Room extends TenantEntity {
  branch_id: string;
  room_number: string;
  floor: string | null;
  status: RoomStatus;
  room_type_id: string;
  is_smoking: boolean;
  is_accessible: boolean;
}

export interface Reservation extends TenantEntity {
  reservation_number: string;
  room_id: string;
  primary_guest_id: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  adults: number;
  status: string;
  rate_per_night: number;
  grand_total: number;
  balance_due: number;
}

// ─── Dashboard ───────────────────────────────────────────────

export interface KPICard {
  label: string;
  value: string | number;
  change: number | null;
  change_label: string | null;
  trend: "up" | "down" | "neutral";
  icon: string;
  color: string;
}

export interface InsightCard {
  id: string;
  title: string;
  description: string;
  category: "revenue" | "inventory" | "crm" | "operations";
  priority: "info" | "warning" | "critical";
  action_label: string | null;
  action_url: string | null;
  metric_value: string | null;
  metric_change: string | null;
  icon: string | null;
}

// ─── Utility Types ────────────────────────────────────────────

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface FilterConfig {
  field: string;
  operator: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "contains" | "in";
  value: unknown;
}
