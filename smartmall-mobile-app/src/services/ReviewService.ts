import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

/* --------------------------------------------
 * Interfaces
 * -------------------------------------------*/
export interface Review {
    id: string;
    rating: number;
    comment: string;
    isEdited: boolean;
    reviewedAt: string;
    userId: string;
    userName: string;
    userAvatar: string | null;
    productId: string;
    productName: string;
    mediaList?: Array<{
        id: string;
        mediaUrl: string;
        mediaType: 'IMAGE' | 'VIDEO';
    }>;
    shopReply?: {
        id: string;
        shopId: string;
        replyId: string;
        shopName: string;
        replyContent: string;
        repliedAt: string;
    };
    // Keep old fields for backward compatibility
    createdAt?: string;
    updatedAt?: string;
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

interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T | null;
}

/* --------------------------------------------
 * Review Service (Style giống OrderService)
 * -------------------------------------------*/
class ReviewService {
    /* --------------------------------------------
     * Helper: Get Authorization header
     * -------------------------------------------*/
    private async getAuthHeaders() {
        const token = await AsyncStorage.getItem("accessToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    /* --------------------------------------------
     * Helper: Handle Success
     * -------------------------------------------*/
    private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
        const isSuccess =
            response.data?.success === true ||
            (response.status >= 200 && response.status < 300);

        return {
            success: isSuccess,
            message: response.data?.message || "Success",
            data: response.data?.data || response.data,
        };
    }

    /* --------------------------------------------
     * Helper: Handle Error
     * -------------------------------------------*/
    private async handleError(error: any): Promise<ApiResponse> {
        console.error("❌ ReviewService Error:", {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });

        if (error.response?.data) {
            return {
                success: false,
                message:
                    error.response.data.message ||
                    error.response.data.error ||
                    "Error occurred",
                data: null,
            };
        }

        return {
            success: false,
            message: error.message || "Network error",
            data: null,
        };
    }

    /* --------------------------------------------
     * 1️⃣ CREATE review (multipart/form-data)
     * -------------------------------------------*/
    async createReview(form: {
        userId: string;
        productId: string;
        orderId?: string;
        rating: number;
        comment: string;
        images?: any[];
        videos?: any[];
    }): Promise<ApiResponse<Review>> {
        try {
            const headers = await this.getAuthHeaders();
            const formData = new FormData();

            // text fields
            formData.append("userId", form.userId);
            formData.append("productId", form.productId);
            if (form.orderId) formData.append("orderId", form.orderId);
            formData.append("rating", String(form.rating));
            formData.append("comment", form.comment);
            // images
            if (form.images && form.images.length > 0) {
                form.images.forEach((file) => {
                    formData.append(
                        "imageUrls",
                        {
                            uri: file.uri,
                            type: file.type ?? "image/jpeg",
                            name: file.name ?? `img_${Date.now()}.jpg`,
                        } as any
                    );
                });
            }

            // videos
            if (form.videos && form.videos.length > 0) {
                form.videos.forEach((file) => {
                    formData.append(
                        "videoUrls",
                        {
                            uri: file.uri,
                            type: file.type ?? "video/mp4",
                            name: file.name ?? `video_${Date.now()}.mp4`,
                        } as any
                    );
                });
            }
            const response = await axios.post(`${API_BASE_URL}/api/reviews`, formData, {
                headers: {
                    ...headers,
                    "Content-Type": "multipart/form-data",
                },
            });

            return this.handleResponse<Review>(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /* --------------------------------------------
     * 2️⃣ UPDATE review
     * -------------------------------------------*/
    async updateReview(
        reviewId: string,
        data: { rating: number; comment: string }
    ): Promise<ApiResponse<Review>> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.put(
                `${API_BASE_URL}/api/reviews/${reviewId}`,
                data,
                { headers }
            );
            return this.handleResponse<Review>(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /* --------------------------------------------
     * 3️⃣ DELETE review
     * -------------------------------------------*/
    async deleteReview(reviewId: string): Promise<ApiResponse> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.delete(
                `${API_BASE_URL}/api/reviews/${reviewId}`,
                { headers }
            );
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /* --------------------------------------------
     * 4️⃣ Get reviews by product (PUBLIC - no auth needed)
     * -------------------------------------------*/
    async getReviewsByProduct(
        productId: string,
        page = 0,
        size = 10
    ): Promise<ApiResponse<PaginatedReviews>> {
        try {
            const headers = await this.getAuthHeaders();
            
            const response = await axios.get(
                `${API_BASE_URL}/api/reviews/product/${productId}`,
                { 
                    params: { page, size },
                    headers 
                }
            );
            
            return {
                success: true,
                message: 'Success',
                data: response.data
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Reviews not available',
                data: {
                    content: [],
                    totalElements: 0,
                    totalPages: 0,
                    number: 0,
                    size: 0
                }
            };
        }
    }

    /* --------------------------------------------
     * 5️⃣ Get current user reviews
     * -------------------------------------------*/
    async getUserReviews(
        page = 0,
        size = 10
    ): Promise<ApiResponse<PaginatedReviews>> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(
                `${API_BASE_URL}/api/reviews/user/my-reviews`,
                { headers, params: { page, size } }
            );
            return this.handleResponse<PaginatedReviews>(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /* --------------------------------------------
     * 6️⃣ Get review by ID
     * -------------------------------------------*/
    async getReview(reviewId: string): Promise<ApiResponse<Review>> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/reviews/${reviewId}`
            );
            return this.handleResponse<Review>(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /* --------------------------------------------
     * 7️⃣ Product statistics
     * -------------------------------------------*/
    async getProductStatistics(
        productId: string
    ): Promise<ApiResponse<ReviewStatistics>> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/reviews/product/${productId}/statistics`
            );
            return this.handleResponse<ReviewStatistics>(response);
        } catch (error) {
            return this.handleError(error);
        }
    }
}

export const reviewService = new ReviewService();
