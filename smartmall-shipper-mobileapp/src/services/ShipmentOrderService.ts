import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export enum ShipmentStatus {
  PENDING = "PENDING",
  PICKING_UP = "PICKING_UP",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  RETURNING = "RETURNING",
  RETURNED = "RETURNED",
  CANCELLED = "CANCELLED"
}

export interface SubShipment {
  id: string;
  trackingCode: string;
  sequence: number;
  status: ShipmentStatus;
}

export interface ShipmentOrder {
  id: string;
  orderCode?: string;
  shipperName: string;
  warehouseName: string;
  pickupAddress: string;
  deliveryAddress: string;
  recipientName: string;
  recipientPhone: string;
  codAmount: number;
  shippingFee: number;
  status: ShipmentStatus;
  estimatedDelivery: string;
  deliveredAt?: string;
  returnedAt?: string;
  weight: number;
  trackingCode: string;
  subShipments?: SubShipment[];
}


export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

class ShipmentOrderService {
  private async getAuthHeaders() {
    let token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      token = await AsyncStorage.getItem("@smartmall_access_token");
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    const resData = response.data.data ?? response.data;

    const isPagination =
      resData?.shipments || resData?.content || Array.isArray(resData);

    if (resData?.shipments) {
      return {
        success: true,
        message: response.data.message || "Success",
        data: {
          content: resData.shipments,
          totalPages: resData.totalPages,
          totalElements: resData.totalItems,
          number: resData.currentPage,
          size: resData.pageSize
        } as any
      };
    }

    return {
      success: response.data.success ?? true,
      message: response.data.message || "Success",
      data: resData
    };
  }

  private async handleError(error: any): Promise<ApiResponse> {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "An error occurred",
      data: null
    };
  }

  async getShipmentById(id: string): Promise<ApiResponse<ShipmentOrder>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/logistics/shipment-orders/${id}`,
        { headers }
      );
      return this.handleResponse<ShipmentOrder>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

}

export const shipmentOrderService = new ShipmentOrderService();
