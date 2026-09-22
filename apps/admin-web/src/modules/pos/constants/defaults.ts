import { OrderType, PaymentMethod } from "../types";

export const ORDER_TYPES: { type: OrderType; label: string; icon: string }[] = [
  { type: "DINE_IN", label: "Dine In", icon: "🍽️" },
  { type: "TAKEAWAY", label: "Takeaway", icon: "🥡" },
  { type: "DELIVERY", label: "Delivery", icon: "🛵" },
  { type: "EXPRESS", label: "Express", icon: "⚡" }
];

export const PAYMENT_METHODS: { method: PaymentMethod; label: string; icon: string }[] = [
  { method: "CASH", label: "Cash", icon: "💵" },
  { method: "UPI", label: "UPI / QR", icon: "📱" },
  { method: "CARD", label: "Credit/Debit Card", icon: "💳" },
  { method: "DUE", label: "Pay Later / Due", icon: "📋" },
  { method: "SPLIT", label: "Split Payment", icon: "🔀" }
];

export const POS_NAVIGATION_TABS = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "master", label: "Master Config", icon: "Database" },
  { id: "transaction", label: "POS Terminal", icon: "Receipt" },
  { id: "report", label: "Analytics & Reports", icon: "BarChart3" },
  { id: "settings", label: "Settings", icon: "Settings" }
] as const;
