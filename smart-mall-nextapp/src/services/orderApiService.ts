import apiClient from '../lib/apiClient';

// Order DTOs based on actual backend DTOs
export interface OrderRequestDto {
  userId: string;
  shopId: string;
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  shippingFee?: number;
  items: OrderItemRequestDto[];
  voucherIds?: string[];
}

export interface OrderItemRequestDto {
  variantId: string;
  quantity: number;
}

export interface OrderResponseDto {
  id: string;
  userId: string;
  userName: string;
  shopId: string;
  shopName: string;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  items: OrderItemResponseDto[];
  vouchers?: OrderVoucherResponseDto[];
  statusHistories?: OrderStatusHistoryDto[];
  shippingFees?: ShippingFeeResponseDto[];
  payment?: PaymentResponseDto;
}

export interface OrderItemResponseDto {
  id: string;
  orderId: string;
  variant: ProductVariantDto;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantDto {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  image?: string;
  attributes: Record<string, any>;
}

export interface OrderVoucherResponseDto {
  id: string;
  voucherCode: string;
  discountAmount: number;
}

export interface OrderStatusHistoryDto {
  id: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

export interface ShippingFeeResponseDto {
  id: string;
  fee: number;
  carrier: string;
  estimatedDays: number;
}

export interface PaymentResponseDto {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
}

export interface OrderSummaryDto {
  id: string;
  shopName: string;
  status: OrderStatus;
  finalAmount: number;
  createdAt: string;
}

export interface UpdateOrderStatusDto {
  orderId: string;
  status: OrderStatus;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PACKED = 'PACKED',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURNED = 'RETURNED'
}

export enum PaymentMethod {
  COD = 'COD',
  CREDIT_CARD = 'CREDIT_CARD',
  E_WALLET = 'E_WALLET'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export const orderApiService = {
  // Create new order
  async createOrder(orderData: OrderRequestDto): Promise<OrderResponseDto> {
    const response = await apiClient.post<OrderResponseDto>('/orders', orderData);
    return response.data;
  },

  // Get order by ID
  async getOrderById(id: string): Promise<OrderResponseDto> {
    const response = await apiClient.get<OrderResponseDto>(`/orders/${id}`);
    return response.data;
  },

  // Get orders by user ID
  async getOrdersByUser(userId: string): Promise<OrderSummaryDto[]> {
    const response = await apiClient.get<OrderSummaryDto[]>(`/orders/user/${userId}`);
    return response.data;
  },

  // Update order status
  async updateOrderStatus(data: UpdateOrderStatusDto): Promise<string> {
    const response = await apiClient.put<string>('/orders/status', data);
    return response.data;
  }
};