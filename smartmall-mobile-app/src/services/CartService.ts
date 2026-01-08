import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface VariantAttribute {
  id: string;
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  productName: string;
  productBrand: string;
  attributes: VariantAttribute[];
  createdAt: string;
  updatedAt: string;
  isFlashSaleActive?: boolean;
  flashSalePrice?: number;
  flashSaleEnd?: string;
  discountPercent?: number;
  effectivePrice?: number;
}

export interface CartItem {
  id: string;
  variant: ProductVariant;
  productName: string;
  productImage: string;
  productShopId: string;
  productShopName?: string;
  quantity: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface AddToCartRequest {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  cartItemId: string;
  quantity: number;
}

class CartService {
  // Lấy token
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Chuẩn hóa response
  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    const isSuccess =
      response.data.success === true ||
      (response.status >= 200 && response.status < 300);

    return {
      success: isSuccess,
      message: response.data.message || 'Success',
      data: response.data.data || response.data || null,
    };
  }

  // Bắt lỗi chung
  private async handleError(error: any): Promise<ApiResponse> {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred',
      data: null,
    };
  }

  // ==========================
  //       API METHODS
  // ==========================

  async getCart(): Promise<ApiResponse<Cart>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/cart`, { headers });
      return this.handleResponse<Cart>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addItem(data: AddToCartRequest): Promise<ApiResponse<Cart>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/api/cart/add`,
        data,
        { headers }
      );
      return this.handleResponse<Cart>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateItem(data: UpdateCartItemRequest): Promise<ApiResponse<Cart>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put(
        `${API_BASE_URL}/api/cart/update`,
        data,
        { headers }
      );
      return this.handleResponse<Cart>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async removeItem(cartItemId: string): Promise<ApiResponse<void>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.delete(
        `${API_BASE_URL}/api/cart/remove/${cartItemId}`,
        { headers }
      );
      return this.handleResponse<void>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async clearCart(): Promise<ApiResponse<void>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.delete(`${API_BASE_URL}/api/cart/clear`, {
        headers,
      });
      return this.handleResponse<void>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCartCount(): Promise<ApiResponse<number>> {
    try {
      const result = await this.getCart();
      if (result.success && result.data) {
        return {
          success: true,
          message: 'Success',
          data: result.data.totalItems,
        };
      }
      return { success: false, message: 'Cannot load count', data: 0 };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async hasItems(): Promise<ApiResponse<boolean>> {
    try {
      const result = await this.getCart();
      if (result.success && result.data) {
        return {
          success: true,
          message: 'Success',
          data: result.data.items.length > 0,
        };
      }
      return { success: false, message: 'Error', data: false };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export default new CartService();
