import apiClient from '../lib/apiClient';
import type { ProductVariant } from './CartService';

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
  shopName?: string; // Added to match backend response
  shopAvatar?: string; // Added to match backend response
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  items: OrderItem[];
  totalAmount: number;
  shippingFee?: number; // Added to match backend response
  discountAmount?: number; // Added for voucher discount
  finalAmount?: number; // Added for final amount after discounts
  estimatedDelivery?: string; // Added to match backend response
  trackingNumber?: string; // Added to match backend response
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
   * Get current user's orders
   */
  async getUserOrders(userId: string): Promise<PaginatedOrders> {
    const response = await apiClient.get<Order[]>(`/orders/user/${userId}`);
    
    // Backend now returns full Order objects, not just summaries
    return {
      content: response.data,
      totalPages: 1, // Backend doesn't return pagination info yet
      totalElements: response.data.length,
      size: response.data.length,
      number: 0
    };
  },

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    try {
      // Try direct order endpoint first
      const response = await apiClient.get<Order | { data: Order }>(`/orders/${orderId}`);
      
      console.log('Direct order endpoint response:', response.data);
      
      // Handle both response formats
      if ('data' in response.data) {
        console.log('Returning wrapped response data:', response.data.data);
        return response.data.data;
      } else {
        console.log('Returning direct response data:', response.data);
        return response.data as Order;
      }
    } catch (error: any) {
      console.error('Failed to get order by ID:', error);
      throw error;
    }
  },

  /**
   * Get order by ID with user context (fallback method)
   */
  async getOrderWithUserContext(orderId: string, userId: string): Promise<Order> {
    try {
      // Get all user orders and find the specific one
      const userOrders = await this.getUserOrders(userId);
      const order = userOrders.content.find(o => o.id === orderId);
      
      if (!order) {
        throw new Error('Order not found in user orders');
      }
      
      return order;
    } catch (error: any) {
      console.error('Failed to get order with user context:', error);
      throw error;
    }
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
