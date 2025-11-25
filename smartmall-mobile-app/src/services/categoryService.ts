import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  status?: string;
  parent?: Category | null;
  subCategories?: Category[];
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

class CategoryService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    // Nếu response.data.data có categories array
    if (response.data.data && response.data.data.categories) {
      return {
        success: true,
        message: response.data.message || 'Success',
        data: response.data.data.categories,
      };
    }
    
    // Nếu response.data đã là array
    if (Array.isArray(response.data)) {
      return {
        success: true,
        message: 'Success',
        data: response.data,
      };
    }
    
    // Nếu có wrapper success/data
    const isSuccess = response.data.success === true || 
                      (response.status >= 200 && response.status < 300);
    
    return {
      success: isSuccess,
      message: response.data.message || 'Success',
      data: response.data.data || response.data,
    };
  }

  private async handleError(error: any): Promise<ApiResponse> {
    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || 'An error occurred',
        data: null,
      };
    }
    
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      data: null,
    };
  }

  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/categories`, { headers });
      return this.handleResponse<Category[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/categories/${id}`, { headers });
      return this.handleResponse<Category>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTopLevelCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/categories/top-level`, { headers });
      return this.handleResponse<Category[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCategoryTree(): Promise<ApiResponse<Category[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/categories/tree`, { headers });
      return this.handleResponse<Category[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const categoryService = new CategoryService();
export type { Category };
