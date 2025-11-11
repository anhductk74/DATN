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

  // Get all categories without pagination
  getAllCategories: async (): Promise<CategoryApiResponse> => {
    const response = await api.get<CategoryApiResponse>('/api/categories/all');
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<CategoryDetailApiResponse> => {
    const response = await api.get<CategoryDetailApiResponse>(`/api/categories/${id}`);
    return response.data;
  },

  // Search categories
  searchCategories: async (
    name: string,
    page: number = 0,
    size: number = 20
  ): Promise<CategoryApiResponse> => {
    const response = await api.get<CategoryApiResponse>('/api/categories/search/paged', {
      params: { name, page, size },
    });
    return response.data;
  },

  // Get active categories
  getActiveCategories: async (
    page: number = 0,
    size: number = 20
  ): Promise<CategoryApiResponse> => {
    const response = await api.get<CategoryApiResponse>('/api/categories/active/paged', {
      params: { page, size },
    });
    return response.data;
  },

  // Create category
  createCategory: async (formData: FormData): Promise<CategoryDetailApiResponse> => {
    const response = await api.post<CategoryDetailApiResponse>('/api/categories/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update category
  updateCategory: async (id: string, formData: FormData): Promise<CategoryDetailApiResponse> => {
    const response = await api.put<CategoryDetailApiResponse>(`/api/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Soft delete category
  softDeleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/api/categories/${id}/soft`);
  },

  // Restore category
  restoreCategory: async (id: string): Promise<void> => {
    await api.put(`/api/categories/${id}/restore`);
  },

  // Hard delete category
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/api/categories/${id}`);
  },
};
