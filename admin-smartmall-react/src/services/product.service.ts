import { api } from './api';
import type { ProductApiResponse, ProductDetailApiResponse } from '../types/product.types';

export const productService = {
  // Get all products with pagination
  getProducts: async (page: number = 0, size: number = 20): Promise<ProductApiResponse> => {
    const response = await api.get<ProductApiResponse>('/api/products', {
      params: { page, size },
    });
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: string): Promise<ProductDetailApiResponse> => {
    const response = await api.get<ProductDetailApiResponse>(`/api/products/${id}`);
    return response.data;
  },

  // Search products
  searchProducts: async (
    name: string,
    page: number = 0,
    size: number = 20
  ): Promise<ProductApiResponse> => {
    const response = await api.get<ProductApiResponse>('/api/products/search/paged', {
      params: { name, page, size },
    });
    return response.data;
  },

  // Get products by status
  getProductsByStatus: async (
    status: string,
    page: number = 0,
    size: number = 20
  ): Promise<ProductApiResponse> => {
    const response = await api.get<ProductApiResponse>(`/api/products/status/${status}/paged`, {
      params: { page, size },
    });
    return response.data;
  },

  // Soft delete product
  softDeleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/api/products/${id}/soft`);
  },

  // Restore product
  restoreProduct: async (id: string): Promise<void> => {
    await api.put(`/api/products/${id}/restore`);
  },

  // Hard delete product
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/api/products/${id}`);
  },
};
