import apiClient from '../lib/apiClient';
import { Cart, ApiResponse } from '../types';

export interface AddToCartRequest {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  cartItemId: string;
  quantity: number;
}

class CartService {
  /**
   * Get current user's cart
   */
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<ApiResponse<Cart>>('/cart');
    return response.data.data;
  }

  /**
   * Add item to cart
   */
  async addItem(data: AddToCartRequest): Promise<Cart> {
    const response = await apiClient.post<ApiResponse<Cart>>('/cart/add', data);
    return response.data.data;
  }

  /**
   * Update cart item quantity
   */
  async updateItem(data: UpdateCartItemRequest): Promise<Cart> {
    const response = await apiClient.put<ApiResponse<Cart>>('/cart/update', data);
    return response.data.data;
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartItemId: string): Promise<void> {
    await apiClient.delete(`/cart/remove/${cartItemId}`);
  }

  /**
   * Clear all items in cart
   */
  async clearCart(): Promise<void> {
    await apiClient.delete('/cart/clear');
  }

  /**
   * Get cart item count
   */
  async getCartCount(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.totalItems;
    } catch {
      return 0;
    }
  }
}

const cartService = new CartService();
export default cartService;
