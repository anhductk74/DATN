import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProductVariant } from './CartService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

/* --------------------------------------------
 * Interfaces giữ nguyên
 * -------------------------------------------*/
export interface OrderItem {
  id: string;
  variant: ProductVariant;
  productId?: string;
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
  shopId: string;
  shopName?: string;
  shopAvatar?: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED';
  items: OrderItem[];
  totalAmount: number;
  shippingFee?: number;
  discountAmount?: number;
  finalAmount?: number;
  estimatedDelivery?: string;
  trackingNumber?: string;
  addressId?: string;
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
  userId: string;
  shopId: string;
  shippingAddressId: string;
  paymentMethod: string;
  shippingFee: number;
  items: {
    variantId: string;
    quantity: number;
  }[];
  voucherIds: string[];
}

export interface UpdateOrderStatusRequest {
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED';
}

export interface PaginatedOrders {
  content: Order[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

/* --------------------------------------------
 * OrderService viết theo style ProductService
 * -------------------------------------------*/
class OrderService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    const isSuccess =
      response.data?.success === true ||
      (response.status >= 200 && response.status < 300);

    return {
      success: isSuccess,
      message: response.data?.message || 'Success',
      data: response.data?.data || response.data,
    };
  }

  private async handleError(error: any): Promise<ApiResponse> {
    console.error('❌ OrderService Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });

    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || error.response.data.error || 'Error occurred',
        data: null,
      };
    }

    return {
      success: false,
      message: error.message || 'Network error',
      data: null,
    };
  }

  /* --------------------------------------------
   * Create order
   * -------------------------------------------*/
  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/api/orders`,
        data,
        { headers }
      );
      return this.handleResponse<Order>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /* --------------------------------------------
   * Get user orders
   * -------------------------------------------*/
  async getUserOrders(userId: string): Promise<ApiResponse<PaginatedOrders>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/user/${userId}`,
        { headers }
      );

      const orders: Order[] = response.data;

      return {
        success: true,
        message: 'Success',
        data: {
          content: orders,
          totalPages: 1,
          totalElements: orders.length,
          size: orders.length,
          number: 0,
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /* --------------------------------------------
   * Get order by ID
   * -------------------------------------------*/
  async getOrder(orderId: string): Promise<ApiResponse<Order>> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await axios.get(
        `${API_BASE_URL}/api/orders/${orderId}`,
        { headers }
      );

      return this.handleResponse<Order>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /* --------------------------------------------
   * Cancel order
   * -------------------------------------------*/
async cancelOrder(orderId: string, userId: string, reason?: string) {
  try {
    const headers = await this.getAuthHeaders();

    const response = await axios.post(
      `${API_BASE_URL}/api/orders/cancel?orderId=${orderId}&userId=${userId}&reason=${reason || ''}`,
      {},
      { headers }
    );

    return this.handleResponse(response);
  } catch (error) {
    return this.handleError(error);
  }
}

  /* --------------------------------------------
   * Admin: Get all orders
   * -------------------------------------------*/
  async getAllOrders(page = 0, size = 10): Promise<ApiResponse<PaginatedOrders>> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await axios.get(
        `${API_BASE_URL}/api/orders/admin/all?page=${page}&size=${size}`,
        { headers }
      );

      return this.handleResponse<PaginatedOrders>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /* --------------------------------------------
   * Admin: Update status
   * -------------------------------------------*/
  async updateOrderStatus(
    orderId: string,
    data: UpdateOrderStatusRequest
  ): Promise<ApiResponse<Order>> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await axios.put(
        `${API_BASE_URL}/api/orders/admin/${orderId}/status`,
        data,
        { headers }
      );

      return this.handleResponse<Order>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const orderService = new OrderService();
