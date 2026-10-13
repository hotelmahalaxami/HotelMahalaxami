import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type { CreateOrderRequest, Order, OrderStatus, UpdateOrderRequest } from '../types/pos';

export const orderService = {
  async createOrder(request: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>('/api/v1/orders', request);
    return response.data.data;
  },

  async getOrders(status?: OrderStatus): Promise<Order[]> {
    const response = await apiClient.get<ApiResponse<Order[]>>('/api/v1/orders', {
      params: status ? { status } : undefined,
    });
    return response.data.data;
  },

  async getOrderById(id: number): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(`/api/v1/orders/${id}`);
    return response.data.data;
  },

  async updateOrder(id: number, request: UpdateOrderRequest): Promise<Order> {
    const response = await apiClient.put<ApiResponse<Order>>(`/api/v1/orders/${id}`, request);
    return response.data.data;
  },

  async removeOrderItem(orderId: number, itemId: number): Promise<Order> {
    const response = await apiClient.delete<ApiResponse<Order>>(
      `/api/v1/orders/${orderId}/items/${itemId}`
    );
    return response.data.data;
  },

  async cancelOrder(orderId: number): Promise<Order> {
    const response = await apiClient.delete<ApiResponse<Order>>(`/api/v1/orders/${orderId}`);
    return response.data.data;
  },
};
