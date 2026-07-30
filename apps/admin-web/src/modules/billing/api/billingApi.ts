/**
 * Billing Module API Client
 */
import { api } from "@/shared/utils/api-client";
import { Invoice } from "../types";

export const billingApi = {
  getInvoices: () => api.get<{ items: Invoice[] }>("/billing/invoices"),
  createInvoice: (data: Partial<Invoice>) => api.post<Invoice>("/billing/invoices", data),
};
