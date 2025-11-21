// OrderReturnRequest API Service
import apiClient from '../lib/apiClient';

// Types
export interface OrderReturnRequestDto {
  orderId: string;
  reason: string;
  images?: File[];
}

export interface OrderReturnResponseDto {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  reason: string;
  status: string;
  requestDate: string;
  processedDate?: string;
  imageUrls: string[];
}

export interface OrderReturnImageResponseDto {
  id: string;
  url: string;
  publicId: string;
}

export enum ReturnStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

// API Service
export const orderReturnRequestApiService = {
  /**
   * Tạo yêu cầu hoàn trả sản phẩm
   * @param orderId - ID của đơn hàng
   * @param userId - ID của người dùng
   * @param reason - Lý do hoàn trả
   * @param images - Danh sách ảnh (tùy chọn)
   */
  async createReturnRequest(
    orderId: string,
    userId: string,
    reason: string,
    images?: File[]
  ): Promise<OrderReturnResponseDto> {
    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('userId', userId);
    formData.append('reason', reason);

    // Thêm ảnh nếu có
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.post<OrderReturnResponseDto>(
      '/orders/return-request',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Lấy danh sách yêu cầu hoàn trả của user
   * @param userId - ID của người dùng
   */
  async getReturnRequestsByUser(userId: string): Promise<OrderReturnResponseDto[]> {
    const response = await apiClient.get<OrderReturnResponseDto[]>(
      `/orders/return-request/user/${userId}`
    );
    return response.data;
  },

  /**
   * Lấy danh sách yêu cầu hoàn trả của một đơn hàng
   * @param orderId - ID của đơn hàng
   */
  async getReturnRequestsByOrder(orderId: string): Promise<OrderReturnResponseDto[]> {
    const response = await apiClient.get<OrderReturnResponseDto[]>(
      `/orders/return-request/order/${orderId}`
    );
    return response.data;
  },

  /**
   * Cập nhật trạng thái yêu cầu hoàn trả (Admin only)
   * @param requestId - ID của yêu cầu hoàn trả
   * @param status - Trạng thái mới
   */
  async updateReturnStatus(
    requestId: string,
    status: ReturnStatus
  ): Promise<OrderReturnResponseDto> {
    const response = await apiClient.put<OrderReturnResponseDto>(
      `/orders/return-request/${requestId}/status`,
      null,
      {
        params: { status }
      }
    );
    return response.data;
  },

  /**
   * Lấy chi tiết một yêu cầu hoàn trả
   * @param requestId - ID của yêu cầu hoàn trả
   */
  async getReturnRequestById(requestId: string): Promise<OrderReturnResponseDto> {
    const response = await apiClient.get<OrderReturnResponseDto>(
      `/orders/return-request/${requestId}`
    );
    return response.data;
  },

  /**
   * Lấy tất cả yêu cầu hoàn trả (Admin only)
   */
  async getAllReturnRequests(): Promise<OrderReturnResponseDto[]> {
    const response = await apiClient.get<OrderReturnResponseDto[]>(
      '/orders/return-request'
    );
    return response.data;
  },
  async getReturnRequestsByShop(shopId: string): Promise<OrderReturnResponseDto[]> {
  const response = await apiClient.get<OrderReturnResponseDto[]>(
    `/orders/return-request/shop/${shopId}`
  );
  return response.data;
 },
  async updateReturnStatusByShop(
  requestId: string,
  status: ReturnStatus
): Promise<OrderReturnResponseDto> {
  const response = await apiClient.put<OrderReturnResponseDto>(
    `/orders/return-request/${requestId}/shop-status`,
    null,
    { params: { status: status.toString() } }
  );
  return response.data;
},
};

// Default export
export default orderReturnRequestApiService;