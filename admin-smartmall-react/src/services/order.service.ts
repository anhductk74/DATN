import { api } from './api';
import type { OrdersPageResponse, UpdateOrderStatusRequest, Order } from '../types/order.types';

const BASE_URL = '/api/orders';

export const orderService = {
  // Get all orders with pagination (Admin)
  getAllOrders: async (page: number = 0, size: number = 20, status?: string) => {
    const params: Record<string, string | number> = { page, size };
    if (status) {
      params.status = status;
    }
    const response = await api.get<OrdersPageResponse>(BASE_URL, { params });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id: string) => {
    const response = await api.get<Order>(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Get orders by shop
  getOrdersByShop: async (
    shopId: string, 
    page: number = 0, 
    size: number = 10, 
    status?: string
  ) => {
    const params: Record<string, string | number> = { page, size };
    if (status) {
      params.status = status;
    }
    const response = await api.get<OrdersPageResponse>(`${BASE_URL}/shop/${shopId}`, { params });
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (data: UpdateOrderStatusRequest) => {
    const response = await api.put<string>(`${BASE_URL}/status`, data);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId: string, userId: string, reason?: string) => {
    const params: Record<string, string> = { orderId, userId };
    if (reason) {
      params.reason = reason;
    }
    const response = await api.post<string>(`${BASE_URL}/cancel`, null, { params });
    return response.data;
  },
};
