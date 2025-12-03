import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface OrderItemResponseDto {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  productVariant?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

class OrderItemService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    return {
      success: true,
      message: 'Success',
      data: response.data.data || response.data
    };
  }

  private async handleError(error: any): Promise<ApiResponse> {
    if (error.response?.data) {
      return { success: false, message: error.response.data.message || 'Error', data: null };
    }
    return { success: false, message: error.message || 'Network error', data: null };
  }

  async getOrderItemsByOrder(orderId: string): Promise<ApiResponse<OrderItemResponseDto[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/order-items/${orderId}`, { headers });
      return this.handleResponse<OrderItemResponseDto[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const orderItemService = new OrderItemService();
