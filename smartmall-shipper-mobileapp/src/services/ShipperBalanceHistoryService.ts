import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// =============================
//      DTO dùng cho frontend
// =============================

export interface ShipperBalanceHistoryRequestDto {
  shipperId: string;
}

export interface ShipperBalanceHistoryResponseDto {
  id: string;
  shipperId: string;
  shipperName: string;

  openingBalance: number;
  collected: number;
  deposited: number;
  bonus: number;
  finalBalance: number;

  date: string; // ISO format
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

// =============================
//      SERVICE CLASS
// =============================

class ShipperBalanceHistoryService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    const success = response.data?.success ?? response.status < 300;

    return {
      success,
      message: response.data?.message || 'Success',
      data: response.data?.data ?? response.data,
    };
  }

  private async handleError(error: any): Promise<ApiResponse> {
    return {
      success: false,
      message: error.response?.data?.message || 'An error occurred',
      data: null,
    };
  }

  // ==================================
  //            API CALLS
  // ==================================

  /** GET /api/logistics/shipper-balance/shipper/{shipperId} */
  async getByShipper(
    shipperId: string
  ): Promise<ApiResponse<ShipperBalanceHistoryResponseDto[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/logistics/shipper-balance/shipper/${shipperId}`,
        { headers }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** GET /api/logistics/shipper-balance/{id} */
  async getDetail(id: string): Promise<ApiResponse<ShipperBalanceHistoryResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/logistics/shipper-balance/${id}`,
        { headers }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** GET /api/logistics/shipper-balance/shipper/{shipperId}/paged?page=&size= */
  async getPagedHistory(
    shipperId: string,
    page = 0,
    size = 10
  ): Promise<ApiResponse<any>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/logistics/shipper-balance/shipper/${shipperId}/paged`,
        {
          headers,
          params: { page, size },
        }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const shipperBalanceHistoryService = new ShipperBalanceHistoryService();
