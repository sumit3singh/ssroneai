export type TableStatus = "free" | "occupied" | "reserved" | "billing" | "cleaning";

export interface POSTable {
  id: number | string;
  table_number: string;
  capacity: number;
  section?: string;
  status: TableStatus;
  guests?: number;
  waiter?: string;
  branch_id?: number | string;
  is_active?: boolean;
}

export interface POSWaiter {
  id: number;
  name: string;
  code: string;
  branch_id?: number | string;
  is_active: boolean;
}
