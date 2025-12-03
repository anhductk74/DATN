import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface ApplyVoucherRequestDto {
  orderId: string;
  voucherId: string;
}

export interface OrderVoucherResponseDto {
  id: string;
  orderId: string;
  voucherId: string;
  voucherCode: string;
  discountAmount: number;
  description: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

class OrderVoucherService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    return { success: true, message: 'Success', data: response.data.data || response.data };
  }

  private async handleError(error: any): Promise<ApiResponse> {
    if (error.response?.data) return { success: false, message: error.response.data.message, data: null };
    return { success: false, message: error.message || 'Network error', data: null };
  }

  async applyVoucher(data: ApplyVoucherRequestDto) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/api/order-vouchers/apply`, data, { headers });
      return this.handleResponse<OrderVoucherResponseDto>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getVouchersByOrder(orderId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/order-vouchers/${orderId}`, { headers });
      return this.handleResponse<OrderVoucherResponseDto[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async removeVoucher(orderVoucherId: string) {
    try {
      const headers = await this.getAuthHeaders();
      await axios.delete(`${API_BASE_URL}/api/order-vouchers/${orderVoucherId}`, { headers });
      return { success: true, message: 'Removed', data: null };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const orderVoucherService = new OrderVoucherService();
