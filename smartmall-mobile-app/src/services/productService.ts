import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const AI_API_BASE_URL = process.env.EXPO_PUBLIC_AI_API_URL || 'http://localhost:5001';

interface Product {
  id: string;
  name: string;
  description: string;
  brand?: string;
  price?: number; // Direct price field (may come from AI search API)
  minPrice?: number; // Minimum price from variants
  images: string[];
  status: string;
  isDeleted: boolean;
  category: {
    id: string;
    name: string;
    description?: string;
  };
  shop: {
    id: string;
    name: string;
    avatar?: string;
    description?: string;
  };
  variants?: {
    id: string;
    sku: string;
    price: number;
    stock: number;
    weight?: number;
    dimensions?: string;
    attributes?: Array<{
      id: string;
      attributeName: string;
      attributeValue: string;
    }>;
  }[];
  averageRating?: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductDetail extends Product {
  specifications?: { [key: string]: string };
  reviews?: Review[];
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  likes: number;
}

interface Variant {
  id: string;
  name: string;
  options: string[];
  price?: number;
  stock?: number;
}

interface ProductListResponse {
  content: Product[];
  pageable: any;
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  empty: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

class ProductService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    // Nếu response.data.data có products array (pagination structure)
    if (response.data.data && response.data.data.products) {
      return {
        success: true,
        message: response.data.message || 'Success',
        data: {
          content: response.data.data.products,
          totalPages: response.data.data.totalPages,
          totalElements: response.data.data.totalItems,
          last: !response.data.data.hasNext,
          first: !response.data.data.hasPrevious,
          number: response.data.data.currentPage,
          size: response.data.data.pageSize,
        } as any,
      };
    }
    
    // Nếu response.data đã là array hoặc object có content (Spring Boot pagination)
    if (Array.isArray(response.data) || response.data.content) {
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

  async getProducts(params: {
    page?: number;
    size?: number;
    sort?: string;
    categoryId?: string;
    shopId?: string;
    keyword?: string;
    minPrice?: number;
    maxPrice?: number;
  } = {}): Promise<ApiResponse<ProductListResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params.shopId) queryParams.append('shopId', params.shopId);
      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());

      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/products?${queryParams.toString()}`, { headers });
      return this.handleResponse<ProductListResponse>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProductById(productId: string): Promise<ApiResponse<ProductDetail>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/products/${productId}`, { headers });
      return this.handleResponse<ProductDetail>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async searchProducts(keyword: string, page = 0, size = 20): Promise<ApiResponse<ProductListResponse>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/products/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`,
        { headers }
      );
      return this.handleResponse<ProductListResponse>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async smartSearch(query: string, page = 0, size = 20, filters?: {
    categoryId?: string;
    shopId?: string;
    status?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams({
        query,
        page: page.toString(),
        size: size.toString()
      });
      
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.shopId) params.append('shopId', filters.shopId);
      if (filters?.status) params.append('status', filters.status);

      const headers = await this.getAuthHeaders();
      const url = `${AI_API_BASE_URL}/ai_smart_search?${params.toString()}`;
      
      const response = await axios.get(url, { headers });
      
      // Flask returns: {success, message, data: {products, currentPage, totalPages, ...}}
      if (response.data.success && response.data.data) {
        const products = response.data.data.products || [];
        
        return {
          success: true,
          message: response.data.message,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Search failed',
          data: null
        };
      }
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getProductsByCategory(categoryId: string, page = 0, size = 20): Promise<ApiResponse<ProductListResponse>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/products/category/${categoryId}/paged?page=${page}&size=${size}`,
        { headers }
      );
      return this.handleResponse<ProductListResponse>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getBestSellers(limit = 10, categoryId?: string): Promise<ApiResponse<Product[]>> {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (categoryId) params.append('categoryId', categoryId);
      
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/products/best-sellers?${params.toString()}`, { headers });
      return this.handleResponse<Product[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getNewArrivals(limit = 10): Promise<ApiResponse<Product[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/products/new-arrivals?limit=${limit}`, { headers });
      return this.handleResponse<Product[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProductsOnSale(page = 0, size = 20, minDiscount?: number): Promise<ApiResponse<ProductListResponse>> {
    try {
      const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
      if (minDiscount) params.append('minDiscount', minDiscount.toString());
      
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/products/on-sale?${params.toString()}`, { headers });
      return this.handleResponse<ProductListResponse>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getRelatedProducts(productId: string, limit = 10): Promise<ApiResponse<Product[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/products/${productId}/related?limit=${limit}`,
        { headers }
      );
      return this.handleResponse<Product[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addReview(
    productId: string,
    token: string,
    data: {
      rating: number;
      comment?: string;
      orderId: string;
      images?: string[];
    }
  ): Promise<ApiResponse<Review>> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/products/${productId}/reviews`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return this.handleResponse<Review>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const productService = new ProductService();
export type { Product, ProductDetail, Review, Variant, ProductListResponse };
