import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface OrderStatusHistory {
  id: string;
  fromStatus: string;
  toStatus: string;
  note?: string;
  changedAt: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

class OrderStatusHistoryService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    const isSuccess = response.data?.success === true ||
                      (response.status >= 200 && response.status < 300);

    return {
      success: isSuccess,
      message: response.data?.message || 'Success',
      data: response.data?.data || response.data,
    };
  }

  private async handleError(error: any): Promise<ApiResponse> {
    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || 'An error occurred',
        data: null,
      };
    }
    
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      data: null,
    };
  }

  // ⭐ Gọi API GET lịch sử trạng thái đơn hàng
  async getOrderHistory(orderId: string): Promise<ApiResponse<OrderStatusHistory[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/${orderId}/history`,
        { headers }
      );

      return this.handleResponse<OrderStatusHistory[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const orderStatusHistoryService = new OrderStatusHistoryService();
