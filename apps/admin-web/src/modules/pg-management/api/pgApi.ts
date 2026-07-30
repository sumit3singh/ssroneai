/**
 * PG Management API Service
 * Endpoint wrappers for PostgreSQL backend endpoints.
 */
import { api } from "@/shared/utils/api-client";

export const pgApi = {
  getResidents: (branchId?: string | number) =>
    api.get<any[]>("/pg/residents", branchId ? { branch_id: branchId } : {}),

  createResident: (data: {
    branch_id: number;
    bed_id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    check_in_date: string;
    monthly_rent: number;
  }) => api.post<any>("/pg/residents", data),

  getRooms: (branchId?: string | number) =>
    api.get<any[]>("/pg/rooms", branchId ? { branch_id: branchId } : {}),

  createRoom: (data: {
    branch_id: number;
    floor_id: number;
    room_number: string;
    room_type: string;
    capacity: number;
    monthly_rent: number;
  }) => api.post<any>("/pg/rooms", data),

  collectRent: (data: {
    rent_record_id: number;
    amount: number;
    payment_method: string;
  }) => api.post<any>("/pg/rent/collect", data),
};
