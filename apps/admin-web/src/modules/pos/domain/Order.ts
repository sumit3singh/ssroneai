/**
 * ssrone ERP - POS Domain Model: Order
 * Encapsulates core business rules for order calculation, taxes, discounts, and status transitions.
 * Pure business logic domain layer - decoupled from React and HTTP.
 */

import { OrderStatus } from "../types";

export interface OrderItemProps {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  taxRatePercent?: number;
  discountPercent?: number;
  notes?: string;
}

export class OrderItem {
  readonly id: string | number;
  readonly name: string;
  readonly price: number;
  readonly quantity: number;
  readonly taxRatePercent: number;
  readonly discountPercent: number;
  readonly notes: string;

  constructor(props: OrderItemProps) {
    this.id = props.id;
    this.name = props.name;
    this.price = Math.max(0, props.price);
    this.quantity = Math.max(1, props.quantity);
    this.taxRatePercent = props.taxRatePercent ?? 5; // Default GST 5%
    this.discountPercent = Math.min(100, Math.max(0, props.discountPercent ?? 0));
    this.notes = props.notes ?? "";
  }

  get rawSubtotal(): number {
    return this.price * this.quantity;
  }

  get discountAmount(): number {
    return (this.rawSubtotal * this.discountPercent) / 100;
  }

  get netSubtotal(): number {
    return this.rawSubtotal - this.discountAmount;
  }

  get taxAmount(): number {
    return (this.netSubtotal * this.taxRatePercent) / 100;
  }

  get total(): number {
    return this.netSubtotal + this.taxAmount;
  }
}

export interface OrderProps {
  id: string | number;
  tableNumber: string;
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  items: OrderItemProps[];
  status?: OrderStatus;
  orderDiscountPercent?: number;
  serviceChargePercent?: number;
  cashierId?: string;
  createdAt?: string;
}

export class Order {
  readonly id: string | number;
  readonly tableNumber: string;
  readonly orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  readonly items: OrderItem[];
  private _status: OrderStatus;
  readonly orderDiscountPercent: number;
  readonly serviceChargePercent: number;
  readonly cashierId: string;
  readonly createdAt: string;

  constructor(props: OrderProps) {
    this.id = props.id;
    this.tableNumber = props.tableNumber;
    this.orderType = props.orderType;
    this.items = props.items.map((item) => new OrderItem(item));
    this._status = props.status ?? "PENDING";
    this.orderDiscountPercent = Math.min(100, Math.max(0, props.orderDiscountPercent ?? 0));
    this.serviceChargePercent = Math.max(0, props.serviceChargePercent ?? 0);
    this.cashierId = props.cashierId ?? "SYSTEM";
    this.createdAt = props.createdAt ?? new Date().toISOString();
  }

  get status(): OrderStatus {
    return this._status;
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.netSubtotal, 0);
  }

  get totalTax(): number {
    return this.items.reduce((sum, item) => sum + item.taxAmount, 0);
  }

  get overallDiscountAmount(): number {
    return (this.subtotal * this.orderDiscountPercent) / 100;
  }

  get serviceChargeAmount(): number {
    const discountedSubtotal = this.subtotal - this.overallDiscountAmount;
    return (discountedSubtotal * this.serviceChargePercent) / 100;
  }

  get grandTotal(): number {
    const net = this.subtotal - this.overallDiscountAmount + this.serviceChargeAmount + this.totalTax;
    return Math.round(net * 100) / 100;
  }

  canTransitionTo(nextStatus: OrderStatus): boolean {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ["CONFIRMED", "PREPARING", "CANCELLED"],
      CONFIRMED: ["PREPARING", "CANCELLED"],
      PREPARING: ["READY", "CANCELLED"],
      READY: ["SERVED", "COMPLETED"],
      SERVED: ["COMPLETED"],
      COMPLETED: [],
      CANCELLED: [],
    };
    return allowedTransitions[this._status]?.includes(nextStatus) ?? false;
  }
}
