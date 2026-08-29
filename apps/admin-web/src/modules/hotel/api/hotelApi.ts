/**
 * Hotel PMS API Client
 */
import { api } from "@ssrone/api-client";
import { HotelRoom } from "../types";

export const hotelApi = {
  getRooms: () => api.get<HotelRoom[]>("/hotel/rooms"),
  createRoom: (data: Partial<HotelRoom>) => api.post<HotelRoom>("/hotel/rooms", data),
  updateRoomStatus: (roomId: string, status: string) => api.patch(`/hotel/rooms/${roomId}/status`, { status }),
};
