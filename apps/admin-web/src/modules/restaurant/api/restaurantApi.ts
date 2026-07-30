/**
 * Restaurant API Client
 */
import { api } from "@/shared/utils/api-client";
import { RestaurantCategory, RestaurantMenuItem, RestaurantTable } from "../types";

export const restaurantApi = {
  getCategories: () => api.get<RestaurantCategory[]>("/restaurant/categories"),
  createCategory: (data: Partial<RestaurantCategory>) => api.post<RestaurantCategory>("/restaurant/categories", data),
  updateCategory: (id: number, data: Partial<RestaurantCategory>) => api.put<RestaurantCategory>(`/restaurant/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/restaurant/categories/${id}`),

  getMenuItems: () => api.get<RestaurantMenuItem[]>("/restaurant/menu-items"),
  saveMenuItem: (data: Partial<RestaurantMenuItem>) =>
    data.id
      ? api.put<RestaurantMenuItem>(`/restaurant/menu-items/${data.id}`, data)
      : api.post<RestaurantMenuItem>("/restaurant/menu-items", data),
  deleteMenuItem: (id: number) => api.delete(`/restaurant/menu-items/${id}`),

  getTables: () => api.get<RestaurantTable[]>("/restaurant/tables"),
  createTable: (data: Partial<RestaurantTable>) => api.post<RestaurantTable>("/restaurant/tables", data),
};
