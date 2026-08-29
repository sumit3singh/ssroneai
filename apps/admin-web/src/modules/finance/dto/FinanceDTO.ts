/**
 * ssrone ERP - Finance & Accounting DTO Layer
 */

export interface VoucherEntryDTO {
  account_id: string;
  account_name: string;
  debit_amount: number;
  credit_amount: number;
  narration?: string;
}

export interface VoucherDTO {
  id: string | number;
  voucher_number: string;
  voucher_date: string;
  voucher_type: "RECEIPT" | "PAYMENT" | "JOURNAL" | "CONTRA";
  entries: VoucherEntryDTO[];
  branch_id: string | number;
}
