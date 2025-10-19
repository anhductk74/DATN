import apiClient from '../lib/apiClient';

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
}

export interface CartItem {
  id: string;
  variant: ProductVariant;
  productName: string;
  productImage: string;
  productShopId?: string; // Add shopId from product
  productShopName?: string; // Add shop name from product
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

export interface AddToCartRequest {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  cartItemId: string;
  quantity: number;
}

const cartService = {
  /**
   * Get current user's cart
   */
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<{ data: Cart }>('/cart');
    return response.data.data;
  },

  /**
   * Add item to cart
   */
  async addItem(data: AddToCartRequest): Promise<Cart> {
    const response = await apiClient.post<{ data: Cart }>('/cart/add', data);
    return response.data.data;
  },

  /**
   * Update cart item quantity
   */
  async updateItem(data: UpdateCartItemRequest): Promise<Cart> {
    const response = await apiClient.put<{ data: Cart }>('/cart/update', data);
    return response.data.data;
  },

  /**
   * Remove item from cart
   */
  async removeItem(cartItemId: string): Promise<void> {
    await apiClient.delete(`/cart/remove/${cartItemId}`);
  },

  /**
   * Clear all items in cart
   */
  async clearCart(): Promise<void> {
    await apiClient.delete('/cart/clear');
  },

  /**
   * Get cart item count
   */
  async getCartCount(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.totalItems;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Check if cart has items
   */
  async hasItems(): Promise<boolean> {
    try {
      const cart = await this.getCart();
      return cart.items.length > 0;
    } catch (error) {
      return false;
    }
  },
};

export default cartService;
