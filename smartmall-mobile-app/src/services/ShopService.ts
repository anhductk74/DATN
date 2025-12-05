import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface ShopAddress {
  street: string;
  commune: string;
  district: string;
  city: string;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  numberPhone: string;
  cccd?: string;
  avatar?: string;
  ownerId: string;
  ownerName: string;
  address: ShopAddress;
}

export interface CreateShopData {
  name: string;
  description: string;
  phoneNumber: string;
  cccd?: string;
  ownerId: string;
  address: ShopAddress;
}

export interface UpdateShopData {
  name: string;
  description: string;
  phoneNumber: string;
  cccd?: string;
  address: ShopAddress;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

class ShopService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    const isSuccess = response.data.success === true ||
      (response.status >= 200 && response.status < 300);

    return {
      success: isSuccess,
      message: response.data.message || 'Success',
      data: response.data.data ?? response.data,
    };
  }

  private async handleError(error: any): Promise<ApiResponse> {
    return {
      success: false,
      message: error.response?.data?.message || 'Network error occurred',
      data: null,
    };
  }

  async createShop(shopData: CreateShopData, imageUri?: string): Promise<ApiResponse<Shop>> {
    try {
      const formData = new FormData();
      formData.append('shopData', JSON.stringify(shopData));

      if (imageUri) {
        const fileName = imageUri.split('/').pop() ?? 'image.jpg';
        formData.append('image', {
          uri: imageUri,
          name: fileName,
          type: 'image/jpeg',
        } as any);
      }

      const headers = {
        ...(await this.getAuthHeaders()),
        'Content-Type': 'multipart/form-data',
      };

      const response = await axios.post(`${API_BASE_URL}/api/shop/create`, formData, { headers });
      return this.handleResponse<Shop>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getShopById(id: string): Promise<ApiResponse<Shop>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/shop/${id}`, { headers });
      return this.handleResponse<Shop>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllShops(): Promise<ApiResponse<Shop[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/shop/all`, { headers });
      return this.handleResponse<Shop[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getShopsByOwner(ownerId: string): Promise<ApiResponse<Shop[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/shop/owner/${ownerId}`, { headers });
      return this.handleResponse<Shop[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async searchShops(name: string): Promise<ApiResponse<Shop[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/shop/search?name=${encodeURIComponent(name)}`,
        { headers }
      );
      return this.handleResponse<Shop[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async searchShopsByOwner(ownerId: string, name: string): Promise<ApiResponse<Shop[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/shop/owner/${ownerId}/search?name=${encodeURIComponent(name)}`,
        { headers }
      );
      return this.handleResponse<Shop[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getShopCountByOwner(ownerId: string): Promise<ApiResponse<number>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/shop/owner/${ownerId}/count`, { headers });
      return this.handleResponse<number>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateShop(id: string, shopData: UpdateShopData, imageUri?: string): Promise<ApiResponse<Shop>> {
    try {
      const formData = new FormData();
      formData.append('shopData', JSON.stringify(shopData));

      if (imageUri) {
        formData.append('image', {
          uri: imageUri,
          name: 'image.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const headers = {
        ...(await this.getAuthHeaders()),
        'Content-Type': 'multipart/form-data',
      };

      const response = await axios.put(`${API_BASE_URL}/api/shop/${id}`, formData, { headers });
      return this.handleResponse<Shop>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteShop(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.delete(`${API_BASE_URL}/api/shop/${id}`, { headers });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const shopService = new ShopService();
export default shopService;
