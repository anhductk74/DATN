import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  discount?: number;
  averageRating?: number;
  stock?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class WishlistService {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async getWishlist(): Promise<ApiResponse<WishlistItem[]>> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      const response = await fetch(`${API_URL}/api/wishlist`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data || [] };
      } else {
        return { success: false, message: data.message || 'Failed to fetch wishlist' };
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async addToWishlist(productId: string): Promise<ApiResponse<any>> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      const response = await fetch(`${API_URL}/api/wishlist/add/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data, message: 'Added to wishlist' };
      } else {
        return { success: false, message: data.message || 'Failed to add to wishlist' };
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse<any>> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      const response = await fetch(`${API_URL}/api/wishlist/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: 'Removed from wishlist' };
      } else {
        return { success: false, message: data.message || 'Failed to remove from wishlist' };
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async checkIsInWishlist(productId: string): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return false;
      }

      const response = await fetch(`${API_URL}/api/wishlist/check/${productId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return data.data === true;
      }
      return false;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  }
}

export default new WishlistService();
