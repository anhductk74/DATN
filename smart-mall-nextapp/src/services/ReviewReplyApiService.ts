import apiClient from '../lib/apiClient';

// ===== DTOs =====
export interface ReviewReplyResponseDto {
  id: string;
  reviewId: string;
  shopId: string;
  shopName: string;
  replyContent: string;
  repliedAt: string;
}

export interface ReviewReplyRequestDto {
  reviewId: string;
  shopId: string;
  replyContent: string;
}

// ===== SERVICE =====
class ReviewReplyApiService {
  private readonly baseUrl = '/review-replies';

  /**
   * Create a new reply to a review
   */
  async createReply(dto: ReviewReplyRequestDto): Promise<ReviewReplyResponseDto> {
    const response = await apiClient.post<ReviewReplyResponseDto>(this.baseUrl, dto);
    return response.data;
  }

  /**
   * Update an existing reply
   */
  async updateReply(dto: ReviewReplyRequestDto): Promise<ReviewReplyResponseDto> {
    const response = await apiClient.put<ReviewReplyResponseDto>(this.baseUrl, dto);
    return response.data;
  }

  /**
   * Get reply by review ID
   */
  async getReplyByReview(reviewId: string): Promise<ReviewReplyResponseDto> {
    const response = await apiClient.get<ReviewReplyResponseDto>(
      `${this.baseUrl}/review/${reviewId}`
    );
    return response.data;
  }

  /**
   * Get all replies by shop with pagination
   */
  async getRepliesByShop(
    shopId: string,
    page: number = 0,
    size: number = 10
  ): Promise<ReviewReplyResponseDto[]> {
    const params = { page, size };
    const response = await apiClient.get<ReviewReplyResponseDto[]>(
      `${this.baseUrl}/shop/${shopId}`,
      { params }
    );
    return response.data;
  }

  /**
   * Delete a reply by review ID
   */
  async deleteReply(reviewId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/review/${reviewId}`);
  }

  /**
   * Check if a review has a reply
   */
  async hasReply(reviewId: string): Promise<boolean> {
    try {
      await this.getReplyByReview(reviewId);
      return true;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Create or update reply (convenience method)
   */
  async createOrUpdateReply(dto: ReviewReplyRequestDto): Promise<ReviewReplyResponseDto> {
    const hasExistingReply = await this.hasReply(dto.reviewId);
    
    if (hasExistingReply) {
      return this.updateReply(dto);
    } else {
      return this.createReply(dto);
    }
  }
}

// ===== Export instance =====
const reviewReplyApiService = new ReviewReplyApiService();
export default reviewReplyApiService;