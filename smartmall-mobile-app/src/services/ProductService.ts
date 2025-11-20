import apiClient from '../lib/apiClient';
import { Product, ApiResponse } from '../types';

class ProductService {
  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  }

  async getAllProducts(): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products/all');
    return response.data.data;
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/products/category/${categoryId}`
    );
    return response.data.data;
  }

  async getProductsByShop(shopId: string): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(`/products/shop/${shopId}`);
    return response.data.data;
  }

  async searchProductsByName(name: string): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/products/search?name=${encodeURIComponent(name)}`
    );
    return response.data.data;
  }

  async advancedSearch(params: {
    name?: string;
    brand?: string;
    categoryId?: string;
    shopId?: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }): Promise<Product[]> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/products/advanced-search?${queryParams.toString()}`
    );
    return response.data.data;
  }
}

const productService = new ProductService();
export default productService;
