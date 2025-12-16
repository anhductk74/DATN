import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface WishlistItem {
  wishlistId: string;
  product: {
    id: string;
    name: string;
    description: string;
    brand: string;
    images: string[];
    status: string;
    categoryId: string | null;
    categoryName: string | null;
    shopId: string | null;
    shopName: string | null;
  };
  note: string | null;
  addedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class WishlistService {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken');
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

  async addToWishlist(productId: string, note?: string): Promise<ApiResponse<WishlistItem>> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      const response = await fetch(`${API_URL}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, note }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data, message: data.message || 'Added to wishlist' };
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

      const response = await fetch(`${API_URL}/api/wishlist/${productId}`, {
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
        // Backend trả về status thay vì success
        const isInWishlist = data.data?.inWishlist === true;
        return isInWishlist;
      }
      return false;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  }

  async getWishlistCount(): Promise<number> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return 0;
      }

      const response = await fetch(`${API_URL}/api/wishlist/count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data?.count || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }
  }
}

export default new WishlistService();
