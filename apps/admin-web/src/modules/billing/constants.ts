/**
 * Billing Constants
 */

export const INVOICE_STATUS_VARIANTS = {
  paid: "success" as const,
  partial: "warning" as const,
  overdue: "danger" as const,
  draft: "secondary" as const,
};
