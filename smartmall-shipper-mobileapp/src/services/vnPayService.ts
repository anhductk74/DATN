import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const TOKEN_KEY = '@smartmall_access_token';

// ENUMS
export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// DTOs
export interface CreatePaymentRequest {
  amount: number;
  orderInfo: string;  // Format: "OrderId:{uuid}|Thanh toan don hang #{uuid}"
  userId: string;
}

export interface VnPayPaymentResponseDto {
  transactionCode: string;  // vnp_TxnRef
  responseCode: string;     // vnp_ResponseCode
  status: number;           // 0=pending, 1=success, 2=failed
  message: string;
}

export interface RefundPaymentRequest {
  transactionCode: string;
  amount: number;
  userId: string;
}

// Common API Response Format
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

class VnPayService {

  //  Lấy Headers Authorization
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // 🧠 Xử lý Response
  private async handleResponse<T>(response: any): Promise<ApiResponse<T>> {
    const isSuccess = response.status >= 200 && response.status < 300;
    return {
      success: isSuccess,
      message: response.data.message || 'Success',
      data: response.data.data || response.data
    };
  }

  //  Xử lý Error
  private async handleError(error: any): Promise<ApiResponse> {
    console.error('❌ VNPay Service Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params
      }
    });

    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Payment Error',
      data: null
    };
  }

  /**
   *  Tạo URL thanh toán VNPay
   */
  async createPaymentUrl(params: CreatePaymentRequest): Promise<ApiResponse<string>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/vnpay/create`,
        null,
        { 
          params: {
            ...params,
            platform: 'mobile' // Chỉ định platform là mobile
          },
          headers
        }
      );
      return this.handleResponse<string>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   *  Xử lý callback từ VNPay sau thanh toán
   */
  async handlePaymentReturn(params: Record<string, string>): Promise<ApiResponse<VnPayPaymentResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const queryParams = new URLSearchParams(params);
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/vnpay/payment-return?${queryParams.toString()}`,
        { headers }
      );
      return this.handleResponse<VnPayPaymentResponseDto>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   *  Refund (Hoàn tiền)
   */
  async refundPayment(params: RefundPaymentRequest): Promise<ApiResponse<VnPayPaymentResponseDto>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/vnpay/refund`,
        null,
        { 
          params,
          headers
        }
      );
      return this.handleResponse<VnPayPaymentResponseDto>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**  Helper function — kiểm tra thanh toán thành công */
  isPaymentSuccessful(response: VnPayPaymentResponseDto): boolean {
    return response.status === 1 && response.responseCode === '00';
  }

  /**  Helper function — kiểm tra thanh toán thất bại */
  isPaymentFailed(response: VnPayPaymentResponseDto): boolean {
    return response.status === 2 || response.responseCode !== '00';
  }

  /** 🔍 Helper — lấy thông báo lỗi từ VNPay Response Code */
  getErrorMessage(responseCode: string): string {
    const errors: Record<string, string> = {
      '00': 'Giao dịch thành công',
      '07': 'Giao dịch nghi ngờ',
      '09': 'Chưa đăng ký InternetBanking',
      '10': 'Xác thực sai thông tin nhiều lần',
      '11': 'Hết thời gian chờ thanh toán',
      '12': 'Tài khoản bị khóa',
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Không đủ số dư',
      '65': 'Vượt hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng đang bảo trì',
      '79': 'Sai mật khẩu OTP quá lần',
      '99': 'Lỗi không xác định'
    };
    return errors[responseCode] || 'Lỗi không xác định từ VNPay';
  }
}

export const vnPayService = new VnPayService();
export type { ApiResponse };
