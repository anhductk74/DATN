import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export enum WarehouseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  FULL = 'FULL',
  TEMPORARILY_CLOSED = 'TEMPORARILY_CLOSED'
}

export interface WarehouseRequestDto {
  shippingCompanyId: string;
  name: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  region: string;
  managerName: string;
  phone: string;
  status: WarehouseStatus;
  capacity?: number;
}

export interface WarehouseResponseDto {
  id: string;
  name: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  region: string;
  managerName: string;
  phone: string;
  status: WarehouseStatus;
  shippingCompanyId: string;
  shippingCompanyName: string;
  capacity?: number;
  currentStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WarehouseInventoryItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  lastUpdated: string;
}

export interface WarehouseStatisticsResponse {
  total: number;
  active: number;
  inactive: number;
  maintenance: number;
  full: number;
  temporarilyClosed: number;
  totalCapacity: number;
  totalCurrentStock: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

class WarehouseService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    return {
      success: true,
      message: response.data.message || 'Success',
      data: response.data.data || response.data,
    };
  }

  private async handleError(error: any): Promise<ApiResponse> {
    return {
      success: false,
      message: error.response?.data?.message || 'Request failed',
      data: null,
    };
  }

  // Lấy tất cả kho
  async getAll(): Promise<ApiResponse<WarehouseResponseDto[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/logistics/warehouses`, { headers });
      return this.handleResponse(response);
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Lấy kho theo ID
  async getById(id: string): Promise<ApiResponse<WarehouseResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/logistics/warehouses/${id}`, { headers });
      return this.handleResponse(response);
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Lấy kho theo công ty
  async getByCompany(companyId: string): Promise<ApiResponse<WarehouseResponseDto[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/logistics/warehouses/company/${companyId}`, { headers });
      return this.handleResponse(response);
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Tạo kho
  async create(data: WarehouseRequestDto): Promise<ApiResponse<WarehouseResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/api/logistics/warehouses`, data, { headers });
      return this.handleResponse(response);
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Cập nhật kho
  async update(id: string, data: WarehouseRequestDto): Promise<ApiResponse<WarehouseResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put(`${API_BASE_URL}/api/logistics/warehouses/${id}`, data, { headers });
      return this.handleResponse(response);
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Xóa kho
  async delete(id: string): Promise<ApiResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.delete(`${API_BASE_URL}/api/logistics/warehouses/${id}`, { headers });
      return this.handleResponse(response);
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Lấy tồn kho theo warehouseId
  async getInventory(warehouseId: string): Promise<ApiResponse<WarehouseInventoryItem[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/warehouses/inventory/${warehouseId}`, { headers });
      return this.handleResponse(response);
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Update trạng thái hoạt động của kho
  async updateStatus(id: string, status: WarehouseStatus): Promise<ApiResponse<WarehouseResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put(
        `${API_BASE_URL}/api/logistics/warehouses/${id}/status?status=${status}`,
        {},
        { headers }
      );
      return this.handleResponse(response);
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Thống kê kho
  async getStatistics(): Promise<ApiResponse<WarehouseStatisticsResponse>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/logistics/warehouses/statistics`, { headers });
      return this.handleResponse(response);
    } catch (err) {
      return this.handleError(err);
    }
  }
}

export const warehouseService = new WarehouseService();

