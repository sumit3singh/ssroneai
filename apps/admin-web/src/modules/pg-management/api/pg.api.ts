import { api } from "@ssrone/api-client";

export interface PGDashboardKPIs {
  total_residents: number;
  rent_collected: number;
  pending_dues: number;
  active_rooms: number;
  total_rooms: number;
  total_beds: number;
  occupied_beds: number;
  occupancy_pct: number;
}

export interface PGResidentDTO {
  id: number;
  branch_id: number;
  bed_id?: number;
  first_name: string;
  last_name?: string;
  phone: string;
  email?: string;
  id_type?: string;
  id_number?: string;
  occupation?: string;
  check_in_date: string;
  monthly_rent: number;
  security_deposit_paid: number;
  is_active: boolean;
}

export interface PGRoomDTO {
  id: number;
  branch_id: number;
  floor_id?: number;
  room_number: string;
  room_type: string;
  capacity: number;
  monthly_rent: number;
  security_deposit: number;
  is_ac: boolean;
  is_attached_bath: boolean;
  is_active: boolean;
}

export interface PGBedDTO {
  id: number;
  room_id: number;
  bed_number: string;
  status: string;
  monthly_rent?: number;
}

export const pgApi = {
  getDashboard: async (branchId?: number): Promise<PGDashboardKPIs> => {
    const param = branchId ? `?branch_id=${branchId}` : "";
    return api.get<PGDashboardKPIs>(`/pg/dashboard${param}`);
  },

  getResidents: async (branchId?: number): Promise<PGResidentDTO[]> => {
    const param = branchId ? `?branch_id=${branchId}` : "";
    return api.get<PGResidentDTO[]>(`/pg/residents${param}`);
  },

  createResident: async (data: Partial<PGResidentDTO>): Promise<PGResidentDTO> => {
    return api.post<PGResidentDTO>("/pg/residents", data);
  },

  deleteResident: async (id: number | string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/pg/residents/${id}`);
  },

  getRooms: async (branchId?: number): Promise<PGRoomDTO[]> => {
    const param = branchId ? `?branch_id=${branchId}` : "";
    return api.get<PGRoomDTO[]>(`/pg/rooms${param}`);
  },

  createRoom: async (data: Partial<PGRoomDTO>): Promise<PGRoomDTO> => {
    return api.post<PGRoomDTO>("/pg/rooms", data);
  },

  getBeds: async (roomId?: number): Promise<PGBedDTO[]> => {
    const param = roomId ? `?room_id=${roomId}` : "";
    return api.get<PGBedDTO[]>(`/pg/beds${param}`);
  },

  collectRent: async (data: { rent_record_id: number; amount: number; payment_method?: string }): Promise<any> => {
    return api.post("/pg/rent/collect", data);
  },
};
