/**
 * PG Management Business Domain Service
 * Pure calculations & logic helpers.
 */
import { Resident, Room } from "../types";
import { AVATAR_COLORS } from "../constants";

export const pgService = {
  calculateOccupancy: (rooms: Room[], residents: Resident[]) => {
    const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 1), 0) || 1;
    const occupiedBeds = residents.filter((r) => r.is_active).length;
    return Math.round((occupiedBeds / totalCapacity) * 100);
  },

  calculateTotalMonthlyRevenue: (residents: Resident[]) => {
    return residents
      .filter((r) => r.is_active)
      .reduce((sum, r) => sum + (r.rent || 0), 0);
  },

  calculateTotalOverdue: (residents: Resident[]) => {
    return residents.reduce((sum, r) => sum + (r.due_amount || 0), 0);
  },

  mapResidentData: (rawList: any[]): Resident[] => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map((r: any, idx: number) => ({
      id: String(r.id),
      name: `${r.first_name || ""} ${r.last_name || ""}`.trim() || r.name || "",
      room: r.room_number || r.room || "",
      bed: r.bed_code || r.bed || "",
      rent: Number(r.monthly_rent || r.rent || 0),
      paid_status: r.paid_status || (r.due_amount > 0 ? "overdue" : "paid"),
      phone: r.phone || "",
      email: r.email || "",
      joining_date: r.check_in_date || r.joining_date || new Date().toISOString().slice(0, 10),
      agreement_code: r.agreement_code || `AG-${r.id}`,
      due_amount: Number(r.due_amount || 0),
      is_active: r.is_active ?? true,
      avatar_color: AVATAR_COLORS[idx % AVATAR_COLORS.length],
    }));
  },
};
