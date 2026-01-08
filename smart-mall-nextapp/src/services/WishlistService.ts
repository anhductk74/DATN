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
  // Cache for wishlist check results - expires after 30 seconds
  private checkCache: Map<string, { inWishlist: boolean; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  
  // Pending check requests to avoid duplicate calls
  private pendingChecks: Map<string, Promise<boolean>> = new Map();

  /**
   * Clear cache (call when wishlist is modified)
   */
  private clearCache() {
    this.checkCache.clear();
  }

  /**
   * Get cached check result if valid
   */
  private getCachedCheck(productId: string): boolean | null {
    const cached = this.checkCache.get(productId);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.checkCache.delete(productId);
      return null;
    }
    
    return cached.inWishlist;
  }

  /**
   * Set cache for check result
   */
  private setCachedCheck(productId: string, inWishlist: boolean) {
    this.checkCache.set(productId, {
      inWishlist,
      timestamp: Date.now()
    });
  }

  /**
   * Thêm sản phẩm vào wishlist
   */
  async addToWishlist(productId: string, note?: string): Promise<WishlistItemDto> {
    const response = await apiClient.post('/wishlist', {
      productId,
      note
    });
    this.clearCache(); // Clear cache when wishlist changes
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
    this.clearCache(); // Clear cache when wishlist changes
    return response.data.data;
  }

  /**
   * Xóa tất cả wishlist
   */
  async clearWishlist(): Promise<string> {
    const response = await apiClient.delete('/wishlist');
    this.clearCache(); // Clear cache when wishlist changes
    return response.data.data;
  }

  /**
   * Kiểm tra sản phẩm có trong wishlist không (with caching and deduplication)
   */
  async checkInWishlist(productId: string): Promise<boolean> {
    // Check cache first
    const cached = this.getCachedCheck(productId);
    if (cached !== null) {
      return cached;
    }

    // Check if there's already a pending request for this product
    const pending = this.pendingChecks.get(productId);
    if (pending) {
      return pending;
    }

    // Create new request
    const request = apiClient.get(`/wishlist/check/${productId}`)
      .then(response => {
        const inWishlist = response.data.data.inWishlist;
        this.setCachedCheck(productId, inWishlist);
        return inWishlist;
      })
      .finally(() => {
        this.pendingChecks.delete(productId);
      });

    this.pendingChecks.set(productId, request);
    return request;
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
