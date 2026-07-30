import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/utils/api-client";
import { isMockSession } from "@/shared/utils/dev-mode";
import { mockDB } from "@/shared/utils/mock-db";

export interface Reservation {
  id: string | number;
  reservation_number: string;
  guest_name: string;
  room_number: string;
  check_in_date: string;
  check_out_date: string;
  status: "confirmed" | "checked_in" | "checked_out" | "cancelled";
  grand_total: number;
  created_at: string;
}

export function useReservations() {
  return useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      if (isMockSession()) {
        let list = mockDB.get<Reservation>("reservations");
        if (list.length === 0) {
          // Seed some default reservations for demo visual consistency
          const seeds: Reservation[] = [
            { id: 1, reservation_number: "BK-9921", guest_name: "Rohit Verma", room_number: "101", check_in_date: "2026-07-01", check_out_date: "2026-07-03", status: "confirmed", grand_total: 8400, created_at: new Date().toISOString() },
            { id: 2, reservation_number: "BK-8822", guest_name: "Kavya Nair", room_number: "104", check_in_date: "2026-06-30", check_out_date: "2026-07-05", status: "checked_in", grand_total: 22500, created_at: new Date().toISOString() },
            { id: 3, reservation_number: "BK-7723", guest_name: "Manish Tiwari", room_number: "201", check_in_date: "2026-07-02", check_out_date: "2026-07-04", status: "confirmed", grand_total: 5600, created_at: new Date().toISOString() },
          ];
          mockDB.set("reservations", seeds);
          list = seeds;
        }
        return list;
      }
      return await api.get<Reservation[]>("/hotel/reservations");
    },
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Reservation, "id" | "reservation_number" | "created_at">) => {
      if (isMockSession()) {
        const refNum = `BK-${Math.floor(Math.random() * 9000 + 1000)}`;
        return mockDB.insert<Reservation>("reservations", {
          ...data,
          reservation_number: refNum,
        });
      }
      return api.post<Reservation>("/hotel/reservations", data);
    },
    onSuccess: () => {
      toast.success("Reservation logged successfully!");
      void queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: () => toast.error("Failed to create reservation"),
  });
}
