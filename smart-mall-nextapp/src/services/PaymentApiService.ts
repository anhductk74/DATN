import apiClient from '../lib/apiClient';

export interface CreatePaymentRequestDto {
  orderId: string;
  method: PaymentMethod;
}

export interface PaymentResponseDto {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
  paidAt?: string;
}

export enum PaymentMethod {
  COD = 'COD',
  CREDIT_CARD = 'CREDIT_CARD',
  E_WALLET = 'E_WALLET'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export const paymentApiService = {
  // Create payment
  async createPayment(data: CreatePaymentRequestDto): Promise<PaymentResponseDto> {
    const response = await apiClient.post<PaymentResponseDto>('/payments', data);
    return response.data;
  },

  // Update payment status (callback from payment gateway)
  async updatePaymentStatus(transactionId: string, status: PaymentStatus): Promise<PaymentResponseDto> {
    const response = await apiClient.put<PaymentResponseDto>(
      `/payments/${transactionId}/status?status=${status}`
    );
    return response.data;
  },

  // Get payment by order ID
  async getPaymentByOrder(orderId: string): Promise<PaymentResponseDto> {
    const response = await apiClient.get<PaymentResponseDto>(`/payments/order/${orderId}`);
    return response.data;
  }
};