import { api } from "@ssrone/api-client";
import { POSTable } from "../types/table";

export const tablesApi = {
  getTables: async (branch_id?: number | string): Promise<POSTable[]> => {
    const param = branch_id ? `?branch_id=${branch_id}` : "";
    const res = await api.get<POSTable[]>(`/restaurant/tables${param}`);
    return res || [];
  },

  createTable: async (table_number: string, capacity: number, section: string, branch_id?: number | string): Promise<POSTable> => {
    const activeBranchId = branch_id || localStorage.getItem("active_branch_id");
    const res = await api.post<POSTable>("/restaurant/tables", {
      table_number,
      capacity,
      section,
      branch_id: activeBranchId ? Number(activeBranchId) : undefined
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
  },

  updateTable: async (
    tableId: string | number,
    data: { table_number: string; capacity: number; section: string; qr_code_url?: string; branch_id?: number | string }
  ): Promise<POSTable> => {
    return await api.put<POSTable>(`/restaurant/tables/${tableId}`, data);
  },

  deleteTable: async (tableId: string | number): Promise<void> => {
    await api.delete(`/restaurant/tables/${tableId}`);
  },

  saveBatchTableQRs: async (
    tables: { table_id: number | string; qr_code_url: string }[]
  ): Promise<{ success: boolean; updated_count: number }> => {
    return await api.post<{ success: boolean; updated_count: number }>("/restaurant/tables/batch-qr-codes", {
      tables: tables.map((t) => ({ table_id: Number(t.table_id), qr_code_url: t.qr_code_url })),
    });
  }
};
