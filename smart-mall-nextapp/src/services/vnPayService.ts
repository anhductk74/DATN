import apiClient from '../lib/apiClient';

// Enums
export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// DTOs
export interface CreateTransactionRequestDto {
  amount: number;
  description: string;
  transactionType: number;
  transactionCode: string;
  transactionDate: string; // ISO string format
  status: number;
  bankTransactionName: string;
}

export interface TransactionResponseDto {
  id: string;
  transactionCode: string;
  amount: number;
  description: string;
  transactionType: number;
  transactionDate: string; // ISO string format
  status: number;
  bankTransactionName: string;
  userId: string;
  userName: string;
  orderId?: string; // Thêm orderId để liên kết với đơn hàng
}

export interface VnPayPaymentResponseDto {
  transactionCode: string; // vnp_TxnRef
  responseCode: string;    // vnp_ResponseCode
  status: number;          // 0 = pending, 1 = success, 2 = failed
  message: string;         // mô tả kết quả thanh toán
}

export interface CreatePaymentRequest {
  amount: number;
  orderInfo: string;
  userId: string;
  orderId?: string; // Thêm orderId để backend có thể liên kết
  platform: string; // 'WEB' hoặc 'MOBILE'
}

export interface RefundPaymentRequest {
  transactionCode: string;
  amount: number;
  userId: string;
}

export const vnPayService = {
  /**
   * Tạo URL thanh toán VNPay
   */
  async createPaymentUrl(params: CreatePaymentRequest): Promise<string> {
    const requestParams: any = {
      amount: params.amount,
      orderInfo: params.orderInfo,
      userId: params.userId,
      platform: params.platform || 'web' // Mặc định là WEB
    };
    
    // Thêm orderId vào params nếu có
    if (params.orderId) {
      requestParams.orderId = params.orderId;
    }
    
    const response = await apiClient.post<string>('/v1/vnpay/create', null, {
      params: requestParams
    });
    return response.data;
  },

  /**
   * Xử lý callback từ VNPay sau khi thanh toán
   */
  async handlePaymentReturn(params: Record<string, string>): Promise<VnPayPaymentResponseDto> {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get<VnPayPaymentResponseDto>(
      `/v1/vnpay/payment-return?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Hoàn tiền (refund) thanh toán VNPay
   */
  async refundPayment(params: RefundPaymentRequest): Promise<VnPayPaymentResponseDto> {
    const response = await apiClient.post<VnPayPaymentResponseDto>('/v1/vnpay/refund', null, {
      params: {
        transactionCode: params.transactionCode,
        amount: params.amount,
        userId: params.userId
      }
    });
    return response.data;
  },

  /**
   * Helper function - Kiểm tra trạng thái thanh toán
   */
  isPaymentSuccessful(response: VnPayPaymentResponseDto): boolean {
    return response.status === 1 && response.responseCode === '00';
  },

  /**
   * Helper function - Kiểm tra thanh toán thất bại
   */
  isPaymentFailed(response: VnPayPaymentResponseDto): boolean {
    return response.status === 2 || response.responseCode !== '00';
  },

  /**
   * Helper function - Lấy thông báo lỗi từ response code
   */
  getErrorMessage(responseCode: string): string {
    const errorMessages: Record<string, string> = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
      '99': 'Các lỗi khác (lỗi kết nối, lỗi khác...)'
    };
    
    return errorMessages[responseCode] || 'Lỗi không xác định';
  }
};