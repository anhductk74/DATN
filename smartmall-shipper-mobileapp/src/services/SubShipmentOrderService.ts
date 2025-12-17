import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShipmentStatus } from './ShipmentOrderService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;


export interface SubShipmentOrderUpdateDto {
  status?: ShipmentStatus;
  startTime?: string;
  endTime?: string;
}

export interface SubShipmentOrderResponseDto {
  id: string;
  shipmentOrderId: string;
  shipmentOrderCode: string;

  fromWarehouseId: string;
  fromWarehouseName: string;

  toWarehouseId: string;
  toWarehouseName: string;

  shipperId: string;
  shipperName: string;

  status: ShipmentStatus;
  sequence: number;
  startTime?: string;
  endTime?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

class SubShipmentOrderService {
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

 
  async getById(id: string): Promise<ApiResponse<SubShipmentOrderResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/logistics/sub-shipment-orders/${id}`, { headers });
      return this.handleResponse<SubShipmentOrderResponseDto>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getByShipmentOrder(shipmentOrderId: string): Promise<ApiResponse<SubShipmentOrderResponseDto[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/logistics/sub-shipment-orders/shipment/${shipmentOrderId}`,
        { headers }
      );
      return this.handleResponse<SubShipmentOrderResponseDto[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async update(id: string, dto: SubShipmentOrderUpdateDto): Promise<ApiResponse<SubShipmentOrderResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put(
        `${API_BASE_URL}/api/logistics/sub-shipment-orders/${id}`,
        dto,
        { headers }
      );
      return this.handleResponse<SubShipmentOrderResponseDto>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

}

export const subShipmentOrderService = new SubShipmentOrderService();

