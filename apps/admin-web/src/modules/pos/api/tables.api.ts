import { api } from "@/shared/utils/api-client";
import { POSTable } from "../types/table";

export const tablesApi = {
  getTables: async (): Promise<POSTable[]> => {
    const res = await api.get<POSTable[]>("/restaurant/tables");
    return res || [];
  },

  createTable: async (table_number: string, capacity: number, section: string): Promise<POSTable> => {
    const res = await api.post<POSTable>("/restaurant/tables", {
      table_number,
      capacity,
      section,
      branch_id: 1
    });
    return res;
  },

  updateTableStatus: async (
    tableId: string | number,
    status: POSTable["status"],
    guests: number,
    waiter: string
  ): Promise<void> => {
    await api.patch(`/restaurant/tables/${tableId}/status`, { status, guests, waiter });
  }
};
