import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";
import type { Order, PaginatedResponse } from "@/shared/types";

interface OrderItemInput {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
}

interface CreateOrderInput {
  branch_id: string;
  order_type: string;
  items: OrderItemInput[];
  notes?: string;
}

export function useOrders(params?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      return await api.get<PaginatedResponse<Order>>("/orders", params);
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      return api.post<Order>("/orders", data);
    },
    onSuccess: () => {
      toast.success("Order placed successfully");
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["kds-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["pos-live-menu-items"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: () => toast.error("Failed to create order"),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      return api.patch(`/orders/${orderId}/cancel`);
    },
    onSuccess: () => {
      toast.success("Order cancelled");
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCategories(branchId?: string) {
  return useQuery({
    queryKey: ["categories", branchId],
    queryFn: async () => {
      try {
        return await api.get<any[]>("/restaurant/categories", { branch_id: branchId });
      } catch (err) {
        console.error("Failed to fetch categories from API", err);
        return [];
      }
    }
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; sort_order: number; branch_id?: number }) => {
      return api.post<any>("/restaurant/categories", data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    }
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string | number; name: string; sort_order: number; branch_id?: number }) => {
      return api.put<any>(`/restaurant/categories/${id}`, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    }
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      return api.delete(`/restaurant/categories/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    }
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      category_id: number;
      name: string;
      description?: string;
      base_price: number;
      image_url?: string;
      is_veg: boolean;
      is_popular: boolean;
      is_available: boolean;
      gst_percent?: number;
      tags?: string[];
      variant_groups?: any[];
      addon_groups?: any[];
      branch_id?: number;
    }) => {
      return api.post<any>("/restaurant/menu-items", data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    }
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string | number;
      category_id: number;
      name: string;
      description?: string;
      base_price: number;
      image_url?: string;
      is_veg: boolean;
      is_popular: boolean;
      is_available: boolean;
      gst_percent?: number;
      tags?: string[];
      variant_groups?: any[];
      addon_groups?: any[];
      branch_id?: number;
    }) => {
      return api.put<any>(`/restaurant/menu-items/${id}`, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    }
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      return api.delete(`/restaurant/menu-items/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    }
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, paymentStatus, amountPaid }: { id: string | number; status: string; paymentStatus?: string; amountPaid?: number }) => {
      let url = `/orders/${id}/status?status=${status}`;
      if (paymentStatus) url += `&payment_status=${paymentStatus}`;
      if (amountPaid !== undefined) url += `&amount_paid=${amountPaid}`;
      return api.patch(url, null);
    },
    onSuccess: () => {
      toast.success("Order status updated");
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  });
}

export function useFireKOT() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string | number) => {
      const res = await api.post(`/orders/${orderId}/kots`, {});
      return res;
    },
    onSuccess: () => {
      toast.success("KOT generated & dispatched to kitchen stations!");
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  });
}

export function useHoldOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string | number; reason?: string }) => {
      const res = await api.post(`/orders/${orderId}/hold`, { reason });
      return res;
    },
    onSuccess: () => {
      toast.success("Order put on hold");
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  });
}

export function useResumeOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string | number) => {
      const res = await api.post(`/orders/${orderId}/resume`, {});
      return res;
    },
    onSuccess: () => {
      toast.success("Order resumed!");
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  });
}

export function useVoidOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, itemId, reason }: { orderId: string | number; itemId?: number; reason: string }) => {
      const res = await api.post(`/orders/${orderId}/void`, { item_id: itemId, reason });
      return res;
    },
    onSuccess: () => {
      toast.success("Void operation executed");
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  });
}

export function useSplitOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, items, reason }: { orderId: string | number; items: Array<{ order_item_id: number; quantity: number }>; reason?: string }) => {
      const res = await api.post(`/orders/${orderId}/split`, { items, reason });
      return res;
    },
    onSuccess: () => {
      toast.success("Order split successfully!");
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  });
}

export function useOrderTables(branchId?: number) {
  return useQuery({
    queryKey: ["tables", branchId],
    queryFn: async () => {
      const res = await api.get(`/orders/tables${branchId ? `?branch_id=${branchId}` : ""}`);
      return res;
    }
  });
}

export function useKitchenStations(branchId?: number) {
  return useQuery({
    queryKey: ["kitchen-stations", branchId],
    queryFn: async () => {
      const res = await api.get(`/orders/stations${branchId ? `?branch_id=${branchId}` : ""}`);
      return res;
    }
  });
}
