import { api } from "@/shared/utils/api-client";
import { POSMenuItem } from "../types/menu";

export const menuItemsApi = {
  getMenuItems: async (): Promise<POSMenuItem[]> => {
    const res = await api.get<POSMenuItem[]>("/restaurant/menu-items");
    return res || [];
  },

  createMenuItem: async (itemData: Partial<POSMenuItem>): Promise<POSMenuItem> => {
    const res = await api.post<POSMenuItem>("/restaurant/menu-items", itemData);
    return res;
  },

  updateMenuItem: async (id: number, itemData: Partial<POSMenuItem>): Promise<POSMenuItem> => {
    const res = await api.put<POSMenuItem>(`/restaurant/menu-items/${id}`, itemData);
    return res;
  },

  deleteMenuItem: async (id: number): Promise<void> => {
    await api.delete(`/restaurant/menu-items/${id}`);
  }
};
