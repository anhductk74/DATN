import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com';

// ==============================
//       DTO DEFINITIONS
// ==============================

export interface Address {
  street: string;
  ward: string;
  district: string;
  city: string;
  country: string;
}

export interface SubShipmentOrderResponseDto {
  id: string;
  shipmentOrderId: string;
  shipmentOrderCode: string;
  trackingCode?: string; // Add trackingCode field

  fromWarehouseId: string;
  fromWarehouseName: string;

  toWarehouseId: string;
  toWarehouseName: string;

  shipperId: string;
  shipperName: string;

  status: string;
  sequence: number;
  startTime?: string;
  endTime?: string;
  updateTime?: string;

  // Shop information (sender)
  shopName?: string;
  shopAddress?: Address;
  shopPhone?: string;

  // Customer information (recipient)
  customerName?: string;
  customerAddress?: Address;
  customerPhone?: string;

  // Financial and package info
  codAmount?: number;
  shippingFee?: number;
  weight?: number;
}

export interface ProofImageResponse {
  id: string;
  url: string;  // URL path from Cloudinary
  publicId: string;
  createdAt: string;
}

export interface DashboardTodaySummary {
  totalAssigned: number;
  delivered: number;
  inTransit: number;
  pending: number;
}

export interface DashboardCodSummary {
  totalCollected: number;
  totalPaid: number;
  codBalance: number;
  totalBonus: number;
  netIncome: number;
}

export interface DashboardRecentDelivery {
  trackingCode: string;
  deliveredAt: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  warehouseName: string;
  sequence: number;
  shipperName: string;
  vehicleInfo: string;
}

export interface ShipperDashboardResponseDto {
  today: DashboardTodaySummary;
  cod: DashboardCodSummary;
  recentDeliveries: DashboardRecentDelivery[];
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

// ==============================
//       SERVICE CLASS
// ==============================

class ShipperSubOrderService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      // Try with @ prefix key
      const tokenWithPrefix = await AsyncStorage.getItem('@smartmall_access_token');
      return tokenWithPrefix ? { Authorization: `Bearer ${tokenWithPrefix}` } : {};
    }
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
      message: error.response?.data?.message || error.message || 'An error occurred',
      data: null,
    };
  }

  // ======================================
  //             API FUNCTIONS
  // ======================================

  /** GET: /sub-orders?shipperId=... */
  async getSubOrders(shipperId: string): Promise<ApiResponse<SubShipmentOrderResponseDto[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/logistics/shipper/sub-orders`,
        { headers, params: { shipperId } }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** GET: /sub-orders/history?shipperId=... */
  async getHistory(shipperId: string): Promise<ApiResponse<SubShipmentOrderResponseDto[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/logistics/shipper/sub-orders/history`,
        { headers, params: { shipperId } }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** GET: /sub-orders/{trackingCode} */
  async getByTrackingCode(trackingCode: string): Promise<ApiResponse<SubShipmentOrderResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/logistics/shipper/sub-orders/${trackingCode}`,
        { headers }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** POST: pickup */
  async confirmPickup(trackingCode: string): Promise<ApiResponse<SubShipmentOrderResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/api/logistics/shipper/sub-orders/${trackingCode}/pickup`,
        {},
        { headers }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** POST: transit */
  async confirmTransit(trackingCode: string): Promise<ApiResponse<SubShipmentOrderResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/api/logistics/shipper/sub-orders/${trackingCode}/transit`,
        {},
        { headers }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** POST: deliver */
  async confirmDelivery(trackingCode: string): Promise<ApiResponse<SubShipmentOrderResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/api/logistics/shipper/sub-orders/${trackingCode}/deliver`,
        {},
        { headers }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** POST: upload proof (with image) */
  async uploadProof(trackingCode: string, formData: FormData): Promise<ApiResponse> {
    try {
      const headers = {
        ...(await this.getAuthHeaders()),
        'Content-Type': 'multipart/form-data',
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/logistics/shipper/sub-orders/${trackingCode}/proof`,
        formData,
        { headers }
      );

      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** GET: proof images */
  async getProofImages(trackingCode: string): Promise<ApiResponse<ProofImageResponse[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/logistics/shipper/sub-orders/${trackingCode}/proof`,
        { headers }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** GET: dashboard */
  async getDashboard(shipperId: string): Promise<ApiResponse<ShipperDashboardResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${API_BASE_URL}/api/logistics/shipper/sub-orders/dashboard`;
      const params = { shipperId };
      
      const response = await axios.get(url, { headers, params });
      
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Dashboard API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return this.handleError(error);
    }
  }
}

export const shipperSubOrderService = new ShipperSubOrderService();
