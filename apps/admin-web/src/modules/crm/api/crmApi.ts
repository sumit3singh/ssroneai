/**
 * CRM API Client
 */
import { api } from "@ssrone/api-client";
import { CRMCustomer } from "../types";

export const crmApi = {
  getCustomers: () => api.get<CRMCustomer[]>("/crm/customers"),
  createCustomer: (data: Partial<CRMCustomer>) => api.post<CRMCustomer>("/crm/customers", data),
};
