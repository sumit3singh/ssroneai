import { POSOrder } from "../types/billing";

export const printerService = {
  printReceipt: async (order: POSOrder, printerIp?: string): Promise<boolean> => {
    console.log(`[PRINT_SERVICE] Sending invoice #${order.order_number} to thermal printer ${printerIp || ""}`);
    return true;
  },

  printKOT: async (order: POSOrder, station: string = ""): Promise<boolean> => {
    console.log(`[PRINT_SERVICE] Sending KOT #${order.order_number} to kitchen station ${station}`);
    return true;
  }
};
