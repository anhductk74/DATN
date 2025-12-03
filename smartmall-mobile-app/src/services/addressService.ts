import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export type AddressType = 'HOME' | 'WORK' | 'OTHER';

export interface Address {
  id: string;
  recipient: string;
  phoneNumber: string;
  addressType: AddressType;
  street: string;
  commune: string;
  district: string;
  city: string;
  fullAddress: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  recipient: string;
  phoneNumber: string;
  addressType: AddressType;
  street: string;
  commune: string;
  district: string;
  city: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  recipient?: string;
  phoneNumber?: string;
  addressType?: AddressType;
  street?: string;
  commune?: string;
  district?: string;
  city?: string;
  isDefault?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

class AddressService {
  // Lấy token
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Chuẩn hóa response
  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    const isSuccess =
      response.data.success === true ||
      (response.status >= 200 && response.status < 300);

    return {
      success: isSuccess,
      message: response.data.message || 'Success',
      data: response.data.data || response.data || null,
    };
  }

  // Bắt lỗi chung
  private async handleError(error: any): Promise<ApiResponse> {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred',
      data: null,
    };
  }

  // ==========================
  //       API METHODS
  // ==========================

  async getAddresses(): Promise<ApiResponse<Address[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/addresses`, { headers });
      return this.handleResponse<Address[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAddress(addressId: string): Promise<ApiResponse<Address>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/addresses/${addressId}`, { headers });
      return this.handleResponse<Address>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createAddress(data: CreateAddressRequest): Promise<ApiResponse<Address>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/api/addresses`, data, { headers });
      return this.handleResponse<Address>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateAddress(addressId: string, data: UpdateAddressRequest): Promise<ApiResponse<Address>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put(`${API_BASE_URL}/api/addresses/${addressId}`, data, { headers });
      return this.handleResponse<Address>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteAddress(addressId: string): Promise<ApiResponse<void>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.delete(`${API_BASE_URL}/api/addresses/${addressId}`, { headers });
      return this.handleResponse<void>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getDefaultAddress(): Promise<ApiResponse<Address | null>> {
    try {
      const result = await this.getAddresses();
      if (result.success && result.data) {
        const defaultAddr = result.data.find(addr => addr.isDefault) || result.data[0] || null;
        return { success: true, message: 'Success', data: defaultAddr };
      }
      return { success: false, message: 'No address found', data: null };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export default new AddressService();
