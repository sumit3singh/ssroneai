/**
 * Hotel PMS Module Types
 */
import type { RoomStatus } from "@/shared/types";

export interface HotelRoom {
  id: string;
  room_number: string;
  floor: string | null;
  status: RoomStatus;
  type: string;
  rate: number;
  guest?: string;
  check_in?: string;
  check_out?: string;
}
