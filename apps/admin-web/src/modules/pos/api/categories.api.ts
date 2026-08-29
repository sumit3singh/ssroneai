import { api } from "@ssrone/api-client";
import { POSCategory } from "../types/menu";

const buildCategoryPayload = ({
  name,
  icon,
  slug,
  sort_order,
  branch_id,
  company_id,
}: {
  name: string;
  icon?: string;
  slug?: string;
  sort_order?: number;
  branch_id?: number | null;
  company_id?: number | null;
}) => ({
  name,
  icon: icon || "🍛",
  slug:
    slug ||
    name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ||
    "category",
  sort_order: sort_order ?? 1,
  branch_id: branch_id ?? (localStorage.getItem("active_branch_id") ? Number(localStorage.getItem("active_branch_id")) : undefined),
  company_id: company_id ?? (localStorage.getItem("active_company_id") ? Number(localStorage.getItem("active_company_id")) : undefined),
});

export const categoriesApi = {
  getCategories: async (branchId?: number | string): Promise<POSCategory[]> => {
    const params = branchId ? { branch_id: branchId } : {};
    const res = await api.get<POSCategory[]>("/restaurant/categories", params);
    return res || [];
  },

  createCategory: async (
    name: string,
    icon: string,
    options?: { slug?: string; sort_order?: number; branch_id?: number | null; company_id?: number | null }
  ): Promise<POSCategory> => {
    const res = await api.post<POSCategory>("/restaurant/categories", buildCategoryPayload({
      name,
      icon,
      ...options,
    }));
    return res;
  },

  updateCategory: async (
    id: number,
    name: string,
    icon: string,
    options?: { slug?: string; sort_order?: number; branch_id?: number | null; company_id?: number | null }
  ): Promise<POSCategory> => {
    const res = await api.put<POSCategory>(`/restaurant/categories/${id}`, buildCategoryPayload({
      name,
      icon,
      ...options,
    }));
    return res;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/restaurant/categories/${id}`);
  }
};

