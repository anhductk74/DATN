import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface OrderTrackingLogResponse {
  id: string;
  carrier: string;
  trackingNumber: string;
  currentLocation: string;
  statusDescription: string;
  updatedAt: string;
}

export interface OrderTrackingLogRequest {
  carrier: string;
  trackingNumber: string;
  currentLocation: string;
  statusDescription: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

class OrderTrackingService {
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

  async getTrackingLogs(orderId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/order-tracking/${orderId}`, { headers });
      return this.handleResponse<OrderTrackingLogResponse[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addTrackingLog(orderId: string, data: OrderTrackingLogRequest) {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams({
        carrier: data.carrier,
        trackingNumber: data.trackingNumber,
        currentLocation: data.currentLocation,
        statusDescription: data.statusDescription,
      });
      const response = await axios.post(`${API_BASE_URL}/api/order-tracking/${orderId}/add-log?${params.toString()}`, null, { headers });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const orderTrackingService = new OrderTrackingService();
