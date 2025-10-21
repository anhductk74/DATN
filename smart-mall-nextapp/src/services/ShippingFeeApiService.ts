import apiClient from '../lib/apiClient';

export interface ShippingFeeRequestDto {
  orderId: string;
  shippingMethod: string;
  feeAmount: number;
  estimatedDeliveryDate: string;
}

export interface ShippingFeeResponseDto {
  id: string;
  orderId: string;
  shippingMethod: string;
  feeAmount: number;
  estimatedDeliveryDate: string;
}

export const shippingFeeApiService = {
  // Create shipping fee for order
  async createShippingFee(data: ShippingFeeRequestDto): Promise<ShippingFeeResponseDto> {
    const response = await apiClient.post<ShippingFeeResponseDto>('/shipping-fees', data);
    return response.data;
  },

  // Get shipping fee by order ID
  async getShippingFeeByOrder(orderId: string): Promise<ShippingFeeResponseDto> {
    const response = await apiClient.get<ShippingFeeResponseDto>(`/shipping-fees/order/${orderId}`);
    return response.data;
  },

  // Update shipping fee
  async updateShippingFee(orderId: string, data: ShippingFeeRequestDto): Promise<ShippingFeeResponseDto> {
    const response = await apiClient.put<ShippingFeeResponseDto>(`/shipping-fees/order/${orderId}`, data);
    return response.data;
  }
};