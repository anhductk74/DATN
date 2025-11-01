import apiClient from '../lib/apiClient';

// ===== DTOs =====
export interface ReviewMediaResponseDto {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  uploadedAt: string;
}

export interface ReviewReplyResponseDto {
  id: string;
  content: string;
  repliedAt: string;
  shopName: string;
}

export interface ReviewResponseDto {
  id: string;
  rating: number;
  comment: string;
  isEdited: boolean;
  reviewedAt: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  productName: string;
  mediaList: ReviewMediaResponseDto[];
  shopReply?: ReviewReplyResponseDto;
}

export interface ReviewRequestDto {
  userId: string;
  productId: string;
  orderId?: string;
  rating: number;
  comment: string;
  imageUrls?: string[];
  videoUrls?: string[];
}

export interface ReviewStatisticsDto {
  averageRating: number;
  totalReviews: number;
  ratingCounts: { [rating: number]: number };
}

export interface MonthlyReviewStats {
  yearMonth: string;
  totalReviews: number;
  averageRating: number;
}

export interface ShopReviewStatisticsDto {
  totalReviews: number;
  averageRating: number;
  ratingCounts: { [rating: number]: number };
  repliedCount: number;
  pendingReplyCount: number;
  monthlyTrend: MonthlyReviewStats[];
}

export interface ProductReviewSummaryDto {
  productId: string;
  productName: string;
  productThumbnail: string;
  totalReviews: number;
  averageRating: number;
  ratingCounts: { [rating: number]: number };
  latestReview?: ReviewResponseDto;
}

export interface PaginatedReviewResponse {
  content: ReviewResponseDto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// ===== SERVICE =====
class ReviewApiService {
  private readonly baseUrl = '/reviews';

  /**
   * Check if user has already reviewed this product
   */
  async checkExistingReview(productId: string, userId: string): Promise<ReviewResponseDto | null> {
    return this.getUserReviewForProduct(productId, userId);
  }

  /**
   * Check multiple products review status for a user (batch check)
   */
  async checkMultipleProductsReview(productIds: string[], userId: string): Promise<Set<string>> {
    const reviewedProducts = new Set<string>();
    
    // Use Promise.allSettled to prevent one failure from breaking others
    const results = await Promise.allSettled(
      productIds.map(productId => this.checkExistingReview(productId, userId))
    );
    
    results.forEach((result, index) => {
      const productId = productIds[index];
      if (result.status === 'fulfilled' && result.value !== null) {
        reviewedProducts.add(productId);
      }
      // Ignore rejected promises and null results (404 errors are normal)
    });
    
    return reviewedProducts;
  }

  /**
   * Submit review with media files (multipart/form-data)
   */
  async createReviewWithMedia(
    reviewData: ReviewRequestDto,
    imageFiles?: File[],
    videoFiles?: File[]
  ): Promise<ReviewResponseDto> {
    // Check if already reviewed
    const existingReview = await this.checkExistingReview(reviewData.productId, reviewData.userId);
    if (existingReview) {
      throw new Error('You have already reviewed this product.');
    }

    const formData = new FormData();

    // Add basic data
    formData.append('userId', reviewData.userId);
    formData.append('productId', reviewData.productId);
    if (reviewData.orderId) formData.append('orderId', reviewData.orderId);
    formData.append('rating', reviewData.rating.toString());
    formData.append('comment', reviewData.comment || '');

    // Add image files
    imageFiles?.forEach((file) => formData.append('imageFiles', file));

    // Add video files
    videoFiles?.forEach((file) => formData.append('videoFiles', file));

    try {
      const response = await apiClient.post<ReviewResponseDto>(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.data?.messages?.includes('You have already reviewed this product.') ||
          error?.response?.data?.messages?.includes('Bạn đã đánh giá sản phẩm này rồi.')) {
        throw new Error('You have already reviewed this product.');
      }
      throw error;
    }
  }

  /**
   * Submit review without files (JSON)
   */
  async createReview(reviewData: ReviewRequestDto): Promise<ReviewResponseDto> {
    // Check if already reviewed
    const existingReview = await this.checkExistingReview(reviewData.productId, reviewData.userId);
    if (existingReview) {
      throw new Error('You have already reviewed this product.');
    }

    try {
      const response = await apiClient.post<ReviewResponseDto>(this.baseUrl, reviewData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.data?.messages?.includes('You have already reviewed this product.') ||
          error?.response?.data?.messages?.includes('Bạn đã đánh giá sản phẩm này rồi.')) {
        throw new Error('You have already reviewed this product.');
      }
      throw error;
    }
  }

  /**
   * Get reviews for a product (paginated)
   */
  async getReviewsByProduct(
    productId: string,
    page: number = 0,
    size: number = 10,
    sort: string[] = ['reviewedAt,desc']
  ): Promise<PaginatedReviewResponse> {
    const params = { page, size, sort };
    const response = await apiClient.get<PaginatedReviewResponse>(
      `${this.baseUrl}/product/${productId}`,
      { params }
    );
    return response.data;
  }

  /**
   * Get review details by ID
   */
  async getReviewById(reviewId: string): Promise<ReviewResponseDto> {
    const response = await apiClient.get<ReviewResponseDto>(`${this.baseUrl}/${reviewId}`);
    return response.data;
  }

  /**
   * Xoá review
   */
  async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${reviewId}`);
  }

  /**
   * Lấy thống kê rating của sản phẩm
   */
  async getReviewStatistics(productId: string): Promise<ReviewStatisticsDto> {
    const response = await apiClient.get<ReviewStatisticsDto>(
      `${this.baseUrl}/product/${productId}/statistics`
    );
    return response.data;
  }

  /**
   * Lọc review theo rating / có media / sort
   */
  async getReviewsByProductWithFilters(
    productId: string,
    filters: {
      rating?: number;
      hasMedia?: boolean;
      page?: number;
      size?: number;
      sortBy?: 'rating' | 'reviewedAt';
      sortDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<PaginatedReviewResponse> {
    const {
      rating,
      hasMedia,
      page = 0,
      size = 10,
      sortBy = 'reviewedAt',
      sortDirection = 'desc',
    } = filters;

    const params: any = { page, size, sort: `${sortBy},${sortDirection}` };
    if (rating) params.rating = rating;
    if (hasMedia !== undefined) params.hasMedia = hasMedia;

    const response = await apiClient.get<PaginatedReviewResponse>(
      `${this.baseUrl}/product/${productId}`,
      { params }
    );
    return response.data;
  }

  /**
   * Kiểm tra user có thể review sản phẩm không (đã mua hàng chưa)
   */
  async canUserReviewProduct(productId: string, userId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ canReview: boolean }>(
        `${this.baseUrl}/can-review/${productId}/${userId}`
      );
      return response.data.canReview;
    } catch {
      return false;
    }
  }

  /**
   * Get user's review for a specific product
   */
  async getUserReviewForProduct(
    productId: string,
    userId: string
  ): Promise<ReviewResponseDto | null> {
    try {
      const response = await apiClient.get<ReviewResponseDto>(
        `${this.baseUrl}/user/${userId}/product/${productId}`
      );
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null; // No review found - this is normal
      }
      throw error;
    }
  }

  // ===== SHOP MANAGEMENT METHODS =====

  /**
   * Get all reviews for shop's products (paginated with filters)
   */
  async getReviewsForShop(
    shopId: string,
    page: number = 0,
    size: number = 10,
    filters: {
      rating?: number;
      hasReply?: boolean;
      productId?: string;
      sortBy?: 'reviewedAt' | 'rating';
      sortDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<PaginatedReviewResponse> {
    const {
      rating,
      hasReply,
      productId,
      sortBy = 'reviewedAt',
      sortDirection = 'desc'
    } = filters;

    const params: any = { page, size, sortBy, sortDirection };
    if (rating) params.rating = rating;
    if (hasReply !== undefined) params.hasReply = hasReply;
    if (productId) params.productId = productId;

    const response = await apiClient.get<PaginatedReviewResponse>(
      `${this.baseUrl}/shop/${shopId}`,
      { params }
    );
    return response.data;
  }

  /**
   * Get shop review statistics
   */
  async getShopReviewStatistics(shopId: string): Promise<ShopReviewStatisticsDto> {
    const response = await apiClient.get<ShopReviewStatisticsDto>(
      `${this.baseUrl}/shop/${shopId}/statistics`
    );
    return response.data;
  }

  /**
   * Get shop products with review summary
   */
  async getShopProductsWithReviewSummary(
    shopId: string,
    page: number = 0,
    size: number = 50
  ): Promise<PaginatedReviewResponse & { content: ProductReviewSummaryDto[] }> {
    const params = { page, size };
    const response = await apiClient.get<PaginatedReviewResponse & { content: ProductReviewSummaryDto[] }>(
      `${this.baseUrl}/shop/${shopId}/products-summary`,
      { params }
    );
    return response.data;
  }

  /**
   * Reply to a review
   */
  async replyToReview(reviewId: string, content: string): Promise<ReviewResponseDto> {
    const response = await apiClient.post<ReviewResponseDto>(
      `${this.baseUrl}/${reviewId}/reply`,
      { content }
    );
    return response.data;
  }

  /**
   * Update reply to a review
   */
  async updateReply(reviewId: string, content: string): Promise<ReviewResponseDto> {
    const response = await apiClient.put<ReviewResponseDto>(
      `${this.baseUrl}/${reviewId}/reply`,
      { content }
    );
    return response.data;
  }

  /**
   * Delete reply to a review
   */
  async deleteReply(reviewId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${reviewId}/reply`);
  }
}

// ===== Export instance =====
const reviewApiService = new ReviewApiService();
export default reviewApiService;
