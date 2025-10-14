import apiClient from '../lib/apiClient';

export interface OrderItemResponseDto {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  productVariant?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export const orderItemApiService = {
  // Get order items by order ID
  async getOrderItemsByOrder(orderId: string): Promise<OrderItemResponseDto[]> {
    const response = await apiClient.get<OrderItemResponseDto[]>(`/api/order-items/${orderId}`);
    return response.data;
  }
};