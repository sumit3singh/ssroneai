export interface POSCustomer {
  id: number | string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyalty_points?: number;
}
