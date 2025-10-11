import apiClient from '../lib/apiClient';
import type { ProductVariant } from './cartService';

export interface OrderItem {
  id: string;
  variant: ProductVariant;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    id: string;
    fullName: string;
    phoneNumber: string;
    addressLine: string;
    ward: string;
    district: string;
    city: string;
  };
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  shippingAddressId: string;
  paymentMethod: string;
  items: {
    variantId: string;
    quantity: number;
    price: number;
  }[];
}

export interface UpdateOrderStatusRequest {
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
}

export interface PaginatedOrders {
  content: Order[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const orderService = {
  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<{ data: Order }>('/orders', data);
    return response.data.data;
  },

  /**
   * Get current user's orders with pagination
   */
  async getUserOrders(page = 0, size = 10): Promise<PaginatedOrders> {
    const response = await apiClient.get<{ data: PaginatedOrders }>('/orders', {
      params: { page, size },
    });
    return response.data.data;
  },

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    const response = await apiClient.get<{ data: Order }>(`/orders/${orderId}`);
    return response.data.data;
  },

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<Order> {
    const response = await apiClient.put<{ data: Order }>(`/orders/${orderId}/cancel`);
    return response.data.data;
  },

  /**
   * Admin: Get all orders
   */
  async getAllOrders(page = 0, size = 10): Promise<PaginatedOrders> {
    const response = await apiClient.get<{ data: PaginatedOrders }>('/orders/admin/all', {
      params: { page, size },
    });
    return response.data.data;
  },

  /**
   * Admin: Update order status
   */
  async updateOrderStatus(orderId: string, data: UpdateOrderStatusRequest): Promise<Order> {
    const response = await apiClient.put<{ data: Order }>(`/orders/admin/${orderId}/status`, data);
    return response.data.data;
  },
};

export default orderService;
