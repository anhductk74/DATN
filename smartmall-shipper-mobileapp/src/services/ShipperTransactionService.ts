import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// =========================================
//        DTO MATCH EXACT BACKEND
// =========================================

export type ShipperTransactionType =
  | 'DELIVERY_FEE'
  | 'COLLECT_COD'
  | 'RETURN_COD'
  | 'PAY_FEE'
  | 'WITHDRAWAL'
  | 'REFUND'
  | 'BONUS'
  | 'PENALTY'
  | 'DEPOSIT_COD'
  | 'ADJUSTMENT';

export interface ShipperTransactionResponseDto {
  id: string;
  shipperId: string;
  shipperName: string;

  shipmentOrderId: string;
  shipmentOrderCode: string;

  amount: number;
  transactionType: ShipperTransactionType;

  createdAt: string;
  subShipmentOrderId: string | null;
}

export interface ShipperTransactionRequestDto {
  shipperId: string;
  shipmentOrderId: string;
  amount: number;
  transactionType: ShipperTransactionType;
  subShipmentOrderId?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

// =========================================
//                SERVICE
// =========================================

class ShipperTransactionService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      // Try with @ prefix key
      const tokenWithPrefix = await AsyncStorage.getItem('@smartmall_access_token');
      console.log('ShipperTransaction: Token check', {
        hasAccessToken: !!token,
        hasTokenWithPrefix: !!tokenWithPrefix,
      });
      return tokenWithPrefix ? { Authorization: `Bearer ${tokenWithPrefix}` } : {};
    }
    console.log('ShipperTransaction: Using accessToken');
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
    console.error('ShipperTransactionService Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred',
      data: null,
    };
  }

  // =========================================
  //            SHIPPER API CALLS
  // =========================================

  /** POST / - Create new shipper transaction */
  async create(
    dto: ShipperTransactionRequestDto
  ): Promise<ApiResponse<ShipperTransactionResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/api/logistics/shipper-transactions`,
        dto,
        { headers }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** GET /{id} - Get transaction by ID */
  async getById(id: string): Promise<ApiResponse<ShipperTransactionResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/logistics/shipper-transactions/${id}`,
        { headers }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** GET /shipper/{shipperId} */
  async getByShipper(
    shipperId: string
  ): Promise<ApiResponse<ShipperTransactionResponseDto[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${API_BASE_URL}/api/logistics/shipper-transactions/shipper/${shipperId}`;
      console.log('ShipperTransaction getByShipper:', {
        url,
        shipperId,
        hasToken: !!headers.Authorization,
      });
      
      const response = await axios.get(url, { headers });
     
      
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** GET /shipper/{shipperId}/total-collected */
  async getTotalCollected(shipperId: string): Promise<ApiResponse<number>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/logistics/shipper-transactions/shipper/${shipperId}/total-collected`,
        { headers }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** GET /shipper/{shipperId}/total-paid */
  async getTotalPaid(shipperId: string): Promise<ApiResponse<number>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/logistics/shipper-transactions/shipper/${shipperId}/total-paid`,
        { headers }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** GET /shipper/{shipperId}/revenue-summary */
  async getRevenueSummary(
    shipperId: string
  ): Promise<ApiResponse<{ collected: number; paid: number; remaining: number }>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/logistics/shipper-transactions/shipper/${shipperId}/revenue-summary`,
        { headers }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const shipperTransactionService = new ShipperTransactionService();
