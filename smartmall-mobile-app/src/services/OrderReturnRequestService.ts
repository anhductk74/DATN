import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Types
export interface OrderReturnRequestDto {
  orderId: string;
  reason: string;
  images?: any[];
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

export enum ReturnStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

class OrderReturnRequestService {
  // Lấy token
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Xử lý response
  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    const isSuccess =
      response.data.success === true ||
      (response.status >= 200 && response.status < 300);

    return {
      success: isSuccess,
      message: response.data.message || "Success",
      data: response.data.data || response.data,
    };
  }

  // Xử lý lỗi
  private async handleError(error: any): Promise<ApiResponse> {
    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || "An error occurred",
        data: null,
      };
    }

    return {
      success: false,
      message: error.message || "Network error",
      data: null,
    };
  }

  // -----------------------------------------------------
  //  1. Tạo yêu cầu hoàn trả
  // -----------------------------------------------------
  async createReturnRequest(
    orderId: string,
    userId: string,
    reason: string,
    images?: any[]
  ): Promise<ApiResponse<OrderReturnResponseDto>> {
    try {
      console.log('[Service] Creating return request...');
      console.log('[Service] Order ID:', orderId);
      console.log('[Service] User ID:', userId);
      console.log('[Service] Reason:', reason);
      console.log('[Service] Images:', images?.length || 0);
      
      const form = new FormData();
      form.append("orderId", orderId);
      form.append("userId", userId);
      form.append("reason", reason);

      if (images && images.length > 0) {
        console.log('[Service] Processing images...');
        images.forEach((img: any, index: number) => {
          console.log(`[Service] Image ${index}:`, {
            uri: img.uri,
            mimeType: img.mimeType,
            fileName: img.fileName,
            type: img.type,
            name: img.name
          });
          
          // Sử dụng đúng field từ Expo ImagePicker: mimeType và fileName
          const imageFile = {
            uri: img.uri,
            type: img.mimeType || img.type || "image/jpeg",
            name: img.fileName || img.name || `image_${index}.jpg`,
          };
          
          console.log(`[Service] Formatted image ${index}:`, imageFile);
          form.append("images", imageFile as any);
        });
      }

      const headers = await this.getAuthHeaders();
      console.log('[Service] Auth headers prepared');
      console.log('[Service] API URL:', `${API_BASE_URL}/api/orders/return-request`);

      const response = await axios.post(
        `${API_BASE_URL}/api/orders/return-request`,
        form,
        {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log('[Service] Response status:', response.status);
      console.log('[Service] Response data:', JSON.stringify(response.data, null, 2));

      return this.handleResponse<OrderReturnResponseDto>(response);
    } catch (error) {
      console.error('[Service] Error in createReturnRequest:', error);
      if (axios.isAxiosError(error)) {
        console.error('[Service] Axios error response:', error.response?.data);
        console.error('[Service] Axios error status:', error.response?.status);
        console.error('[Service] Axios error headers:', error.response?.headers);
      }
      return this.handleError(error);
    }
  }

  // -----------------------------------------------------
  //  2. Lấy yêu cầu hoàn trả theo user
  // -----------------------------------------------------
  async getReturnRequestsByUser(
    userId: string
  ): Promise<ApiResponse<OrderReturnResponseDto[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/return-request/user/${userId}`,
        { headers }
      );
      return this.handleResponse<OrderReturnResponseDto[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // -----------------------------------------------------
  //  3. Lấy yêu cầu hoàn trả theo order
  // -----------------------------------------------------
  async getReturnRequestsByOrder(
    orderId: string
  ): Promise<ApiResponse<OrderReturnResponseDto[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/return-request/order/${orderId}`,
        { headers }
      );
      return this.handleResponse<OrderReturnResponseDto[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // -----------------------------------------------------
  //  4. Cập nhật trạng thái (Admin)
  // -----------------------------------------------------
  async updateReturnStatus(
    requestId: string,
    status: ReturnStatus
  ): Promise<ApiResponse<OrderReturnResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put(
        `${API_BASE_URL}/api/orders/return-request/${requestId}/status`,
        null,
        {
          params: { status },
          headers,
        }
      );
      return this.handleResponse<OrderReturnResponseDto>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // -----------------------------------------------------
  //  5. Lấy chi tiết request
  // -----------------------------------------------------
  async getReturnRequestById(
    requestId: string
  ): Promise<ApiResponse<OrderReturnResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/return-request/${requestId}`,
        { headers }
      );
      return this.handleResponse<OrderReturnResponseDto>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // -----------------------------------------------------
  //  6. Lấy tất cả request (Admin)
  // -----------------------------------------------------
  async getAllReturnRequests(): Promise<
    ApiResponse<OrderReturnResponseDto[]>
  > {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/return-request`,
        { headers }
      );
      return this.handleResponse<OrderReturnResponseDto[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // -----------------------------------------------------
  //  7. Shop: lấy request theo shop
  // -----------------------------------------------------
  async getReturnRequestsByShop(
    shopId: string
  ): Promise<ApiResponse<OrderReturnResponseDto[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/return-request/shop/${shopId}`,
        { headers }
      );
      return this.handleResponse<OrderReturnResponseDto[]>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // -----------------------------------------------------
  //  8. Shop: cập nhật trạng thái
  // -----------------------------------------------------
  async updateReturnStatusByShop(
    requestId: string,
    status: ReturnStatus
  ): Promise<ApiResponse<OrderReturnResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put(
        `${API_BASE_URL}/api/orders/return-request/${requestId}/shop-status`,
        null,
        {
          params: { status },
          headers,
        }
      );
      return this.handleResponse<OrderReturnResponseDto>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const orderReturnRequestService = new OrderReturnRequestService();
export default orderReturnRequestService;
