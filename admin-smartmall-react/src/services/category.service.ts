import { api } from './api';
import type { CategoryApiResponse, CategoryDetailApiResponse } from '../types/category.types';

export const categoryService = {
  // Get all categories with pagination
  getCategories: async (page: number = 0, size: number = 20): Promise<CategoryApiResponse> => {
    const response = await api.get<CategoryApiResponse>('/api/categories', {
      params: { page, size },
    });
    return response.data;
  },

  // Get all categories without pagination (flat list)
  getAllCategories: async (): Promise<CategoryApiResponse> => {
    const response = await api.get<CategoryApiResponse>('/api/categories/all');
    return response.data;
  },

  // Get all root categories (with subcategories)
  getRootCategories: async (): Promise<CategoryApiResponse> => {
    const response = await api.get<CategoryApiResponse>('/api/categories/root');
    return response.data;
  },

  // Get root categories with pagination
  getRootCategoriesPaged: async (page: number = 0, size: number = 20): Promise<CategoryApiResponse> => {
    const response = await api.get<CategoryApiResponse>('/api/categories/root/paged', {
      params: { page, size },
    });
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<CategoryDetailApiResponse> => {
    const response = await api.get<CategoryDetailApiResponse>(`/api/categories/${id}`);
    return response.data;
  },

  // Get subcategories by parent ID
  getSubCategories: async (parentId: string): Promise<CategoryApiResponse> => {
    const response = await api.get<CategoryApiResponse>(`/api/categories/${parentId}/subcategories`);
    return response.data;
  },

  // Get subcategories with pagination
  getSubCategoriesPaged: async (
    parentId: string,
    page: number = 0,
    size: number = 20
  ): Promise<CategoryApiResponse> => {
    const response = await api.get<CategoryApiResponse>(`/api/categories/${parentId}/subcategories/paged`, {
      params: { page, size },
    });
    return response.data;
  },

  // Search categories
  searchCategories: async (name: string): Promise<CategoryApiResponse> => {
    const response = await api.get<CategoryApiResponse>('/api/categories/search', {
      params: { name },
    });
    return response.data;
  },

  // Search categories with pagination
  searchCategoriesPaged: async (
    name: string,
    page: number = 0,
    size: number = 20
  ): Promise<CategoryApiResponse> => {
    const response = await api.get<CategoryApiResponse>('/api/categories/search/paged', {
      params: { name, page, size },
    });
    return response.data;
  },

  // Create category with image upload
  createCategory: async (formData: FormData): Promise<CategoryDetailApiResponse> => {
    const response = await api.post<CategoryDetailApiResponse>('/api/categories/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update category with image upload
  updateCategory: async (id: string, formData: FormData): Promise<CategoryDetailApiResponse> => {
    const response = await api.put<CategoryDetailApiResponse>(`/api/categories/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: string): Promise<{ success: boolean; message: string; data: null }> => {
    const response = await api.delete<{ success: boolean; message: string; data: null }>(`/api/categories/${id}`);
    return response.data;
  },
};
