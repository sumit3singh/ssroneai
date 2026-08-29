/**
 * ssrone ERP - Finance Voucher Domain Model
 * Double-entry accounting validation rules (debit total MUST equal credit total).
 */

export interface VoucherEntryProps {
  accountId: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  narration?: string;
}

export class VoucherEntry {
  readonly accountId: string;
  readonly accountName: string;
  readonly debitAmount: number;
  readonly creditAmount: number;
  readonly narration: string;

  constructor(props: VoucherEntryProps) {
    this.accountId = props.accountId;
    this.accountName = props.accountName;
    this.debitAmount = Math.max(0, props.debitAmount);
    this.creditAmount = Math.max(0, props.creditAmount);
    this.narration = props.narration ?? "";
  }
}

export interface VoucherProps {
  id: string | number;
  voucherNumber: string;
  voucherDate: string;
  voucherType: "RECEIPT" | "PAYMENT" | "JOURNAL" | "CONTRA";
  entries: VoucherEntryProps[];
}

export class Voucher {
  readonly id: string | number;
  readonly voucherNumber: string;
  readonly voucherDate: string;
  readonly voucherType: "RECEIPT" | "PAYMENT" | "JOURNAL" | "CONTRA";
  readonly entries: VoucherEntry[];

  constructor(props: VoucherProps) {
    this.id = props.id;
    this.voucherNumber = props.voucherNumber;
    this.voucherDate = props.voucherDate;
    this.voucherType = props.voucherType;
    this.entries = props.entries.map((e) => new VoucherEntry(e));
  }

  get totalDebit(): number {
    return this.entries.reduce((sum, e) => sum + e.debitAmount, 0);
  }

  get totalCredit(): number {
    return this.entries.reduce((sum, e) => sum + e.creditAmount, 0);
  }

  get isBalanced(): boolean {
    return Math.abs(this.totalDebit - this.totalCredit) < 0.01;
  }
}
