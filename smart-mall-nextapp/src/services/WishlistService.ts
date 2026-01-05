import apiClient from '@/lib/apiClient';

export interface WishlistItemDto {
  wishlistId: string;
  product: {
    id: string;
    name: string;
    description: string;
    brand: string;
    images: string[];
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    isDeleted: boolean;
    categoryId: string | null;
    categoryName: string | null;
    shopId: string | null;
    shopName: string | null;
    createdAt: string;
    updatedAt: string;
  };
  note: string | null;
  addedAt: string;
}

export interface PagedWishlistResponseDto {
  items: WishlistItemDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AddToWishlistDto {
  productId: string;
  note?: string;
}

class WishlistService {
  /**
   * Thêm sản phẩm vào wishlist
   */
  async addToWishlist(productId: string, note?: string): Promise<WishlistItemDto> {
    const response = await apiClient.post('/wishlist', {
      productId,
      note
    });
    return response.data.data;
  }

  /**
   * Lấy tất cả wishlist (không phân trang)
   */
  async getWishlist(): Promise<WishlistItemDto[]> {
    const response = await apiClient.get('/wishlist');
    return response.data.data || [];
  }

  /**
   * Lấy wishlist với phân trang
   */
  async getWishlistPaged(page: number = 0, size: number = 20): Promise<PagedWishlistResponseDto> {
    const response = await apiClient.get('/wishlist/paged', {
      params: { page, size }
    });
    return response.data.data;
  }

  /**
   * Xóa sản phẩm khỏi wishlist
   */
  async removeFromWishlist(productId: string): Promise<string> {
    const response = await apiClient.delete(`/wishlist/${productId}`);
    return response.data.data;
  }

  /**
   * Xóa tất cả wishlist
   */
  async clearWishlist(): Promise<string> {
    const response = await apiClient.delete('/wishlist');
    return response.data.data;
  }

  /**
   * Kiểm tra sản phẩm có trong wishlist không
   */
  async checkInWishlist(productId: string): Promise<boolean> {
    const response = await apiClient.get(`/wishlist/check/${productId}`);
    return response.data.data.inWishlist;
  }

  /**
   * Đếm số lượng wishlist items
   */
  async getWishlistCount(): Promise<number> {
    try {
      // Lấy danh sách wishlist và đếm số lượng
      const response = await apiClient.get('/wishlist');
      const items = response.data.data || [];
      console.log('📊 Wishlist count from API:', items.length, 'items:', items);
      return items.length;
    } catch (error) {
      console.error('❌ Error getting wishlist count:', error);
      return 0;
    }
  }

  /**
   * Cập nhật ghi chú
   */
  async updateNote(productId: string, note: string): Promise<WishlistItemDto> {
    const response = await apiClient.put(`/wishlist/${productId}/note`, {
      note
    });
    return response.data.data;
  }
}

const wishlistService = new WishlistService();
export default wishlistService;
