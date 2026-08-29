/**
 * ssrone ERP - POS Order Repository Pattern
 * Abstract repository contract and HTTP API implementation decoupling React UI from Axios.
 */

import { api } from "@ssrone/api-client";
import { Order } from "../domain/Order";
import { OrderMapper } from "../mappers/OrderMapper";
import { OrderResponseDTO } from "../dto/OrderDTO";

export interface IOrderRepository {
  getOrders(): Promise<Order[]>;
  getOrderById(id: string | number): Promise<Order>;
  createOrder(order: Order): Promise<Order>;
  updateOrderStatus(id: string | number, status: string): Promise<Order>;
}

export class OrderRepository implements IOrderRepository {
  async getOrders(): Promise<Order[]> {
    const res = await api.get<OrderResponseDTO[]>("/pos/orders");
    const dtos = res || [];
    return dtos.map(OrderMapper.toDomain);
  }

  async getOrderById(id: string | number): Promise<Order> {
    const res = await api.get<OrderResponseDTO>(`/pos/orders/${id}`);
    return OrderMapper.toDomain(res);
  }

  async createOrder(order: Order): Promise<Order> {
    const dto = OrderMapper.toCreateDTO(order);
    const res = await api.post<OrderResponseDTO>("/pos/orders", dto);
    return OrderMapper.toDomain(res);
  }

  async updateOrderStatus(id: string | number, status: string): Promise<Order> {
    const res = await api.patch<OrderResponseDTO>(`/pos/orders/${id}/status`, { status });
    return OrderMapper.toDomain(res);
  }
}

export const orderRepository = new OrderRepository();
