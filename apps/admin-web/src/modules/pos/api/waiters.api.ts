import { api } from "@/shared/utils/api-client";
import { POSWaiter } from "../types/table";

export const waitersApi = {
  getWaiters: async (): Promise<POSWaiter[]> => {
    const res = await api.get<POSWaiter[]>("/restaurant/waiters");
    return res || [];
  }
};
