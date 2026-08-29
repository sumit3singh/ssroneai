/**
 * ssrone ERP - Hotel Room Mapper
 */

import { Room } from "../domain/Room";
import { RoomDTO } from "../dto/HotelDTO";

export class HotelMapper {
  static toDomain(dto: RoomDTO): Room {
    return new Room({
      id: dto.id,
      roomNumber: dto.room_number,
      categoryName: dto.category_name,
      basePricePerNight: dto.price_per_night,
      taxPercent: dto.tax_percent,
      status: dto.status,
      currentGuestName: dto.current_guest_name,
      checkInDate: dto.check_in_date,
      checkOutDate: dto.check_out_date,
    });
  }

  static toDTO(domain: Room, branchId: string | number = 1): RoomDTO {
    return {
      id: domain.id,
      room_number: domain.roomNumber,
      category_name: domain.categoryName,
      price_per_night: domain.basePricePerNight,
      tax_percent: domain.taxPercent,
      status: domain.status,
      current_guest_name: domain.currentGuestName,
      check_in_date: domain.checkInDate,
      check_out_date: domain.checkOutDate,
      branch_id: branchId,
    };
  }
}
