import { api } from "@/shared/utils/api-client";
import { POSOrder } from "../types/billing";

export const ordersApi = {
  getOrders: async (): Promise<POSOrder[]> => {
    const res = await api.get<POSOrder[]>("/orders");
    return res || [];
  },

  createOrder: async (orderData: Partial<POSOrder>): Promise<POSOrder> => {
    const res = await api.post<POSOrder>("/orders", orderData);
    return res;
  }
};
