/**
 * ssrone ERP - Hotel PMS DTO Layer
 */

export interface RoomDTO {
  id: string | number;
  room_number: string;
  category_name: string;
  price_per_night: number;
  tax_percent?: number;
  status: "VACANT_CLEAN" | "VACANT_DIRTY" | "OCCUPIED" | "RESERVED" | "OUT_OF_SERVICE";
  current_guest_name?: string;
  check_in_date?: string;
  check_out_date?: string;
  branch_id: string | number;
}
