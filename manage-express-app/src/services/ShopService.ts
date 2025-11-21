import apiClient from '../lib/apiClient';
import type { ApiResponse } from '@/types/common';

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

class ShopService {
  /**
   * Create new shop
   */
  async createShop(shopData: CreateShopData, imageFile?: File): Promise<ApiResponse<Shop>> {
    const formData = new FormData();
    formData.append('shopData', JSON.stringify(shopData));
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await apiClient.post('/api/shop/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Get shop by ID
   */
  async getShopById(id: string): Promise<ApiResponse<Shop>> {
    const response = await apiClient.get(`/api/shop/${id}`);
    return response.data;
  }

  /**
   * Get all shops
   */
  async getAllShops(): Promise<ApiResponse<Shop[]>> {
    const response = await apiClient.get('/api/shop/all');
    return response.data;
  }

  /**
   * Get shops by owner ID
   */
  async getShopsByOwner(ownerId: string): Promise<ApiResponse<Shop[]>> {
    const response = await apiClient.get(`/api/shop/owner/${ownerId}`);
    return response.data;
  }

  /**
   * Search shops by name
   */
  async searchShops(name: string): Promise<ApiResponse<Shop[]>> {
    const response = await apiClient.get(`/api/shop/search?name=${encodeURIComponent(name)}`);
    return response.data;
  }

  /**
   * Search shops by owner and name
   */
  async searchShopsByOwner(ownerId: string, name: string): Promise<ApiResponse<Shop[]>> {
    const response = await apiClient.get(`/api/shop/owner/${ownerId}/search?name=${encodeURIComponent(name)}`);
    return response.data;
  }

  /**
   * Get shop count by owner
   */
  async getShopCountByOwner(ownerId: string): Promise<ApiResponse<number>> {
    const response = await apiClient.get(`/api/shop/owner/${ownerId}/count`);
    return response.data;
  }

  /**
   * Update shop
   */
  async updateShop(id: string, shopData: UpdateShopData, imageFile?: File): Promise<ApiResponse<Shop>> {
    const formData = new FormData();
    formData.append('shopData', JSON.stringify(shopData));
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await apiClient.put(`/api/shop/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Delete shop
   */
  async deleteShop(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/api/shop/${id}`);
    return response.data;
  }
}

// Export singleton instance
export const shopService = new ShopService();
export default shopService;