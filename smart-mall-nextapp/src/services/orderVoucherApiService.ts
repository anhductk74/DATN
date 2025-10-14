import apiClient from '../lib/apiClient';

export interface ApplyVoucherRequestDto {
  orderId: string;
  voucherId: string;
}

export interface OrderVoucherResponseDto {
  id: string;
  orderId: string;
  voucherId: string;
  voucherCode: string;
  discountAmount: number;
  description: string;
}

export const orderVoucherApiService = {
  // Apply voucher to order
  async applyVoucher(data: ApplyVoucherRequestDto): Promise<OrderVoucherResponseDto> {
    const response = await apiClient.post<OrderVoucherResponseDto>('/api/order-vouchers/apply', data);
    return response.data;
  },

  // Get vouchers by order ID
  async getVouchersByOrder(orderId: string): Promise<OrderVoucherResponseDto[]> {
    const response = await apiClient.get<OrderVoucherResponseDto[]>(`/api/order-vouchers/${orderId}`);
    return response.data;
  },

  // Remove voucher from order
  async removeVoucher(orderVoucherId: string): Promise<void> {
    await apiClient.delete(`/api/order-vouchers/${orderVoucherId}`);
  }
};