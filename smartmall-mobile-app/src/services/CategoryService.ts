import apiClient from '../lib/apiClient';
import { Category, ApiResponse } from '../types';

class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  }

  async getActiveCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories/active');
    return response.data.data;
  }
}

const categoryService = new CategoryService();
export default categoryService;
