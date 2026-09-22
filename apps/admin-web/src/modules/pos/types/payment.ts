export type PaymentMethod = "CASH" | "UPI" | "CARD" | "DUE" | "SPLIT" | "CREDIT_ACCOUNT";

export interface POSPaymentMode {
  id: number;
  name: string;
  code: PaymentMethod;
  icon: string;
  is_active: boolean;
}
