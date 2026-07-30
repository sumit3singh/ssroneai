/**
 * Billing Module Types
 */

export interface Invoice {
  id: string;
  number: string;
  customer: string;
  date: string;
  amount: number;
  status: "paid" | "partial" | "overdue" | "draft";
}
