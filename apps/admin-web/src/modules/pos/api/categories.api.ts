import { api } from "@/shared/utils/api-client";
import { POSCategory } from "../types/menu";

export const categoriesApi = {
  getCategories: async (): Promise<POSCategory[]> => {
    const res = await api.get<POSCategory[]>("/restaurant/categories");
    return res || [];
  },

  createCategory: async (name: string, icon: string): Promise<POSCategory> => {
    const res = await api.post<POSCategory>("/restaurant/categories", {
      name,
      icon,
      slug: name.toLowerCase().replace(/\s+/g, "-")
    });
    return res;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/restaurant/categories/${id}`);
  }
};
