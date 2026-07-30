/**
 * The Baithak – Application Constants
 */
export const APP_NAME = "The Baithak";
export const APP_VERSION = "1.0.0";

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/",
  POS: "/pos",
  RESTAURANT: "/restaurant",
  HOTEL: "/hotel",
  PG: "/pg",
  RESERVATIONS: "/reservations",
  INVENTORY: "/inventory",
  BILLING: "/billing",
  FINANCE: "/finance",
  CRM: "/crm",
  HR: "/hr",
  AI: "/ai",
  REPORTS: "/reports",
  SETTINGS: "/settings",
} as const;

export const QUERY_KEYS = {
  ORDERS: "orders",
  PRODUCTS: "products",
  CUSTOMERS: "customers",
  ROOMS: "rooms",
  RESERVATIONS: "reservations",
  RESIDENTS: "residents",
  EMPLOYEES: "employees",
  INVOICES: "invoices",
  AI_INSIGHTS: "ai_insights",
  CURRENT_USER: ["auth", "me"],
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  confirmed: "Confirmed",
  in_kitchen: "In Kitchen",
  ready: "Ready",
  served: "Served",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
  { value: "wallet", label: "Wallet" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
] as const;

export const GST_RATES = [0, 5, 12, 18, 28] as const;

export const INDIA_STATES = [
  { code: "MH", name: "Maharashtra" },
  { code: "KA", name: "Karnataka" },
  { code: "DL", name: "Delhi" },
  { code: "GJ", name: "Gujarat" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "RJ", name: "Rajasthan" },
  { code: "WB", name: "West Bengal" },
  { code: "TS", name: "Telangana" },
  { code: "AP", name: "Andhra Pradesh" },
] as const;
