/**
 * ssrone ERP - Guest CRM Domain Model
 * Core rules for guest loyalty points, visit history, and tier calculations.
 */

export interface GuestProps {
  id: string | number;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints?: number;
  totalVisits?: number;
  totalSpent?: number;
}

export class Guest {
  readonly id: string | number;
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly loyaltyPoints: number;
  readonly totalVisits: number;
  readonly totalSpent: number;

  constructor(props: GuestProps) {
    this.id = props.id;
    this.name = props.name;
    this.phone = props.phone;
    this.email = props.email ?? "";
    this.loyaltyPoints = Math.max(0, props.loyaltyPoints ?? 0);
    this.totalVisits = Math.max(0, props.totalVisits ?? 0);
    this.totalSpent = Math.max(0, props.totalSpent ?? 0);
  }

  get tier(): "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" {
    if (this.loyaltyPoints >= 5000 || this.totalSpent >= 50000) return "PLATINUM";
    if (this.loyaltyPoints >= 2000 || this.totalSpent >= 20000) return "GOLD";
    if (this.loyaltyPoints >= 500 || this.totalSpent >= 5000) return "SILVER";
    return "BRONZE";
  }
}
