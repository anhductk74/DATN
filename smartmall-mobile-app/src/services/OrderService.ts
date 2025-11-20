import apiClient from '../lib/apiClient';
import { Order, ApiResponse } from '../types';

export interface CreateOrderRequest {
  shippingAddressId: string;
  paymentMethod: string;
  items: {
    variantId: string;
    quantity: number;
    price: number;
  }[];
}

export interface PaginatedOrders {
  content: Order[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

class OrderService {
  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return response.data.data;
  }

  /**
   * Get current user's orders
   */
  async getUserOrders(userId: string): Promise<PaginatedOrders> {
    const response = await apiClient.get<Order[]>(`/orders/user/${userId}`);

    return {
      content: response.data,
      totalPages: 1,
      totalElements: response.data.length,
      size: response.data.length,
      number: 0,
    };
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.get<Order | ApiResponse<Order>>(`/orders/${orderId}`);

      if ('data' in response.data) {
        return response.data.data;
      } else {
        return response.data as Order;
      }
    } catch (error: any) {
      console.error('Failed to get order by ID:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<Order> {
    const response = await apiClient.put<ApiResponse<Order>>(`/orders/${orderId}/cancel`);
    return response.data.data;
  }
}

const orderService = new OrderService();
export default orderService;
