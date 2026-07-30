/**
 * CRM Module Types
 */

export interface CRMCustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  loyalty_tier: string;
  loyalty_points: number;
  wallet_balance: number;
  lifetime_spent: number;
  total_visits: number;
  last_visit_at: string | null;
  is_active: boolean;
}
