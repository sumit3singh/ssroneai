/**
 * ssrone ERP - Hotel PMS Repository
 */

import { api } from "@ssrone/api-client";
import { Room } from "../domain/Room";
import { HotelMapper } from "../mappers/HotelMapper";
import { RoomDTO } from "../dto/HotelDTO";

export interface IHotelRepository {
  getRooms(): Promise<Room[]>;
  updateRoomStatus(id: string | number, status: string, guestName?: string): Promise<Room>;
}

export class HotelRepository implements IHotelRepository {
  async getRooms(): Promise<Room[]> {
    const dtos = (await api.get<RoomDTO[]>("/hotel/rooms")) || [];
    return dtos.map(HotelMapper.toDomain);
  }

  async updateRoomStatus(id: string | number, status: string, guestName?: string): Promise<Room> {
    const res = await api.patch<RoomDTO>(`/hotel/rooms/${id}/status`, { status, guest_name: guestName });
    return HotelMapper.toDomain(res);
  }
}

export const hotelRepository = new HotelRepository();
