/**
 * PG Management Module Types
 */

export interface Resident {
  id: string;
  name: string;
  room: string;
  bed: string;
  rent: number;
  paid_status: "paid" | "partial" | "overdue";
  phone: string;
  email: string;
  joining_date: string;
  agreement_code: string;
  due_amount: number;
  is_active: boolean;
  avatar_color: string;
}

export interface Room {
  id: string;
  room_number: string;
  category: string;
  floor: string;
  capacity: number;
  rent: number;
  has_ac: boolean;
}

export interface Bed {
  id: string;
  room_id: string;
  bed_code: string;
  status: "available" | "occupied" | "maintenance";
  is_active: boolean;
}

export interface PGActivity {
  id: string;
  description: string;
  time: string;
  amount?: number;
  type: "add" | "receipt" | "agreement" | "system" | "clean";
}
