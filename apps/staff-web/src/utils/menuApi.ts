import { api } from "@ssrone/api-client";

export const fetchMenuItems = async (branchId: number | string = 1) => {
  try {
    const res = await api.get<any>(`/products?branch_id=${branchId}`);
    if (Array.isArray(res)) return res;
    if (res?.items && Array.isArray(res.items)) return res.items;
    return [];
  } catch (err) {
    console.warn("Failed to fetch menu items from API:", err);
    return [];
  }
};

export const fetchCategories = async (branchId: number | string = 1) => {
  try {
    const res = await api.get<any>(`/categories?branch_id=${branchId}`);
    if (Array.isArray(res)) return res;
    if (res?.items && Array.isArray(res.items)) return res.items;
    return [];
  } catch (err) {
    console.warn("Failed to fetch categories from API:", err);
    return [];
  }
};
