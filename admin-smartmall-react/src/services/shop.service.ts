import { api } from './api';
import type { Shop, ShopsPageResponse, CreateShopDto, UpdateShopDto } from '../types/shop.types';

const API_BASE_URL = '/api/shop';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const shopService = {
  // Get all shops (paginated)
  getAllShops: async (
    page: number = 0,
    size: number = 20,
    sort?: string
  ): Promise<ShopsPageResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (sort) {
      params.append('sort', sort);
    }
    const response = await api.get<ApiResponse<ShopsPageResponse>>(
      `${API_BASE_URL}/all?${params}`
    );
    return response.data.data;
  },

  // Get shop by ID
  getShopById: async (id: string): Promise<Shop> => {
    const response = await api.get<ApiResponse<Shop>>(`${API_BASE_URL}/${id}`);
    return response.data.data;
  },

  // Create shop
  createShop: async (shopData: CreateShopDto, image: File): Promise<Shop> => {
    const formData = new FormData();
    formData.append('shopData', JSON.stringify(shopData));
    formData.append('image', image);

    const response = await api.post<ApiResponse<Shop>>(
      `${API_BASE_URL}/create`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  // Update shop
  updateShop: async (
    id: string,
    shopData: UpdateShopDto,
    image?: File
  ): Promise<Shop> => {
    const formData = new FormData();
    formData.append('shopData', JSON.stringify(shopData));
    if (image) {
      formData.append('image', image);
    }

    const response = await api.put<ApiResponse<Shop>>(
      `${API_BASE_URL}/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  // Delete shop
  deleteShop: async (id: string): Promise<string> => {
    const response = await api.delete<ApiResponse<string>>(
      `${API_BASE_URL}/${id}`
    );
    return response.data.data;
  },

  // Search shops by name
  searchShops: async (name: string): Promise<Shop[]> => {
    const response = await api.get<ApiResponse<Shop[]>>(
      `${API_BASE_URL}/search`,
      {
        params: { name },
      }
    );
    return response.data.data;
  },

  // Get shops by owner ID
  getShopsByOwner: async (ownerId: string): Promise<Shop[]> => {
    const response = await api.get<ApiResponse<Shop[]>>(
      `${API_BASE_URL}/owner/${ownerId}`
    );
    return response.data.data;
  },

  // Get shop count by owner
  getShopCountByOwner: async (ownerId: string): Promise<number> => {
    const response = await api.get<ApiResponse<number>>(
      `${API_BASE_URL}/owner/${ownerId}/count`
    );
    return response.data.data;
  },

  // Increment view count
  incrementViewCount: async (id: string): Promise<string> => {
    const response = await api.post<ApiResponse<string>>(
      `${API_BASE_URL}/${id}/view`
    );
    return response.data.data;
  },

  // Get view count
  getViewCount: async (id: string): Promise<number> => {
    const response = await api.get<ApiResponse<number>>(
      `${API_BASE_URL}/${id}/view-count`
    );
    return response.data.data;
  },

  // Search shops by owner and name
  searchShopsByOwnerAndName: async (
    ownerId: string,
    name: string
  ): Promise<Shop[]> => {
    const response = await api.get<ApiResponse<Shop[]>>(
      `${API_BASE_URL}/owner/${ownerId}/search`,
      {
        params: { name },
      }
    );
    return response.data.data;
  },
};
