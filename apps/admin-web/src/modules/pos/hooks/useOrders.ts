import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/shared/utils/api-client";
import { isMockSession } from "@/shared/utils/dev-mode";
import { mockDB } from "@/shared/utils/mock-db";
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
      if (isMockSession()) {
        const orders = mockDB.get<Order>("orders");
        // Sort by created_at descending
        const sorted = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { items: sorted, total: sorted.length, page: 1, page_size: 100 } as PaginatedResponse<Order>;
      }
      try {
        return await api.get<PaginatedResponse<Order>>("/orders", params);
      } catch (err) {
        if (isMockSession()) {
          console.warn("Backend orders call failed in mock session, loading from mockDB", err);
          const orders = mockDB.get<Order>("orders");
          const sorted = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          return { items: sorted, total: sorted.length, page: 1, page_size: 100 } as PaginatedResponse<Order>;
        }
        throw err;
      }
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      if (isMockSession()) {
        const subtotal = data.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
        const tax = subtotal * 0.18;
        const total = subtotal + tax;

        // Generate invoice and save to mockDB using SAP serialization format
        const unitCode = data.branch_id || "CUH02";
        const orderNumber = mockDB.generateDocNumber(unitCode, "ORD");
        const newOrder = mockDB.insert<Order>("orders", {
          order_number: orderNumber,
          branch_id: unitCode,
          order_type: data.order_type as any,
          status: "completed" as any,
          payment_status: "paid",
          subtotal,
          discount_amount: 0,
          total_tax: tax,
          grand_total: total,
          amount_paid: total,
          balance_due: 0,
          notes: data.notes || null,
          items: data.items.map((it, i) => ({
            id: `item-${i}-${Date.now()}`,
            product_id: it.product_id,
            product_name: it.product_name,
            quantity: it.quantity,
            unit_price: it.unit_price,
            discount_amount: 0,
            tax_amount: it.unit_price * it.quantity * 0.18,
            line_total: it.unit_price * it.quantity * 1.18,
            kds_status: "pending",
            modifiers: [],
          })),
          confirmed_at: new Date().toISOString(),
          tenant_id: "baithak-demo-tenant",
          is_deleted: false,
        } as any);

        // Also insert an invoice for this order using the same unit-scoped prefix
        const invoiceNumber = mockDB.generateDocNumber(unitCode, "INV");
        mockDB.insert("invoices", {
          number: invoiceNumber,
          customer: data.notes || "Walk-in Customer",
          date: new Date().toISOString().slice(0, 10),
          amount: total,
          status: "paid",
        });

        // Add visual stats update to dashboard kpis if needed (handled dynamically by reading mockDB orders)
        return newOrder;
      }

      return api.post<Order>("/orders", data);
    },
    onSuccess: (newOrderData: any) => {
      toast.success("Order placed successfully");
      if (isMockSession() && newOrderData) {
        try {
          mockDB.insert("orders", newOrderData);
          if (newOrderData.grand_total) {
            mockDB.insert("invoices", {
              number: newOrderData.order_number || `INV-${Date.now()}`,
              customer: newOrderData.notes || "Walk-in Customer",
              date: new Date().toISOString().slice(0, 10),
              amount: newOrderData.grand_total,
              status: "paid",
            });
          }
        } catch (e) {
          console.warn("Local cache insert error", e);
        }
      }
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
      if (isMockSession()) {
        mockDB.update<Order>("orders", orderId, { status: "cancelled" as any });
        return;
      }
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
      if (isMockSession()) {
        return mockDB.get<any>("categories") || [];
      }
      try {
        return await api.get<any[]>("/restaurant/categories", { branch_id: branchId });
      } catch (err) {
        if (isMockSession()) {
          console.warn("Backend categories call failed, loading from mockDB", err);
          return mockDB.get<any>("categories") || [];
        }
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
      if (isMockSession()) {
        const list = mockDB.get<any>("categories") || [];
        const newCat = {
          id: `cat-${Date.now()}`,
          name: data.name,
          sort_order: data.sort_order,
          is_active: true
        };
        mockDB.set("categories", [...list, newCat]);
        return newCat;
      }
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
      if (isMockSession()) {
        const list = mockDB.get<any>("categories") || [];
        const updated = list.map((c: any) => c.id === id ? { ...c, ...data } : c);
        mockDB.set("categories", updated);
        return { id, ...data };
      }
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
      if (isMockSession()) {
        const list = mockDB.get<any>("categories") || [];
        mockDB.set("categories", list.filter((c: any) => c.id !== id));
        return;
      }
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
      if (isMockSession()) {
        const list = mockDB.get<any>("products") || [];
        const newProd = {
          id: `prod-${Date.now()}`,
          name: data.name,
          code: `P${list.length + 1}`,
          category: mockDB.get<any>("categories")?.find((c: any) => c.id === data.category_id)?.name || "Food",
          base_price: data.base_price,
          selling_price: data.base_price,
          is_veg: data.is_veg,
          is_popular: data.is_popular,
          is_active: data.is_available,
          unit_code: data.branch_id === 2 ? "GGN01" : "CUH02",
          tags: data.tags || [],
          variant_groups: data.variant_groups || [],
          addon_groups: data.addon_groups || [],
          image_url: data.image_url
        };
        mockDB.set("products", [...list, newProd]);
        return newProd;
      }
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
      if (isMockSession()) {
        const list = mockDB.get<any>("products") || [];
        const updated = list.map((p: any) => p.id === id ? {
          ...p,
          name: data.name,
          category: mockDB.get<any>("categories")?.find((c: any) => c.id === data.category_id)?.name || p.category,
          base_price: data.base_price,
          selling_price: data.base_price,
          is_veg: data.is_veg,
          is_popular: data.is_popular,
          is_active: data.is_available,
          tags: data.tags || p.tags || [],
          variant_groups: data.variant_groups || p.variant_groups || [],
          addon_groups: data.addon_groups || p.addon_groups || [],
          image_url: data.image_url
        } : p);
        mockDB.set("products", updated);
        return { id, ...data };
      }
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
      if (isMockSession()) {
        const list = mockDB.get<any>("products") || [];
        mockDB.set("products", list.filter((p: any) => p.id !== id));
        return;
      }
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
      if (isMockSession()) {
        mockDB.update<any>("orders", id as string, {
          status: status as any,
          payment_status: paymentStatus || undefined,
          amount_paid: amountPaid !== undefined ? amountPaid : undefined
        });
        return;
      }
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

export function useTables(branchId?: number) {
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
