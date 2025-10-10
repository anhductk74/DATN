import apiClient from './apiClient';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment: string;
}

export interface ReviewStatistics {
  averageRating: number;
  reviewCount: number;
}

export interface PaginatedReviews {
  content: Review[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const reviewService = {
  /**
   * Create a new review
   */
  async createReview(data: CreateReviewRequest): Promise<Review> {
    const response = await apiClient.post<{ data: Review }>('/reviews', data);
    return response.data.data;
  },

  /**
   * Update a review
   */
  async updateReview(reviewId: string, data: UpdateReviewRequest): Promise<Review> {
    const response = await apiClient.put<{ data: Review }>(`/reviews/${reviewId}`, data);
    return response.data.data;
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete(`/reviews/${reviewId}`);
  },

  /**
   * Get reviews by product (public endpoint)
   */
  async getReviewsByProduct(productId: string, page = 0, size = 10): Promise<PaginatedReviews> {
    const response = await apiClient.get<{ data: PaginatedReviews }>(`/reviews/product/${productId}`, {
      params: { page, size },
    });
    return response.data.data;
  },

  /**
   * Get current user's reviews
   */
  async getUserReviews(page = 0, size = 10): Promise<PaginatedReviews> {
    const response = await apiClient.get<{ data: PaginatedReviews }>('/reviews/user/my-reviews', {
      params: { page, size },
    });
    return response.data.data;
  },

  /**
   * Get review by ID (public endpoint)
   */
  async getReview(reviewId: string): Promise<Review> {
    const response = await apiClient.get<{ data: Review }>(`/reviews/${reviewId}`);
    return response.data.data;
  },

  /**
   * Get product review statistics (public endpoint)
   */
  async getProductStatistics(productId: string): Promise<ReviewStatistics> {
    const response = await apiClient.get<{ data: ReviewStatistics }>(`/reviews/product/${productId}/statistics`);
    return response.data.data;
  },
};

export default reviewService;
