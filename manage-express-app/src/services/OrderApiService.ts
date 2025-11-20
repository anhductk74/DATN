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
  shopAvatar?: string;
  addressId?: string;
  shopAddressId?: string;
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
  addressUser?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    createdAt: string | null;
    updatedAt: string | null;
  };
  addressShop?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    createdAt: string | null;
    updatedAt: string | null;
  };
  // Backward compatibility
  address?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    createdAt: string | null;
    updatedAt: string | null;
  };
}

export interface OrderItemResponseDto {
  id: string;
  orderId: string;
  productId: string;
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
  sku: string;
  price: number;
  stock: number;
  weight: number;
  dimensions: string;
  attributes: Array<{
    id: string;
    name: string;
    value: string;
  }>;
  productName: string;
  productBrand: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderVoucherResponseDto {
  id: string;
  orderId: string;
  voucherId: string;
  voucherCode: string;
  discountAmount: number;
  description: string;
}

export interface OrderStatusHistoryDto {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note?: string;
  changedAt: string;
}

export interface ShippingFeeResponseDto {
  id: string;
  orderId: string;
  shippingMethod: string;
  feeAmount: number;
  estimatedDeliveryDate: string;
}

export interface PaymentResponseDto {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId: string;
  paidAt: string;
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
    const response = await apiClient.post<OrderResponseDto>('/api/orders', orderData);
    return response.data;
  },

  // Get order by ID
  async getOrderById(id: string): Promise<OrderResponseDto> {
    const response = await apiClient.get<OrderResponseDto>(`/api/orders/${id}`);
    return response.data;
  },

  // Get orders by user ID
  async getOrdersByUser(userId: string): Promise<OrderSummaryDto[]> {
    const response = await apiClient.get<OrderSummaryDto[]>(`/api/orders/user/${userId}`);
    return response.data;
  },

  // Update order status
  async updateOrderStatus(data: UpdateOrderStatusDto): Promise<string> {
    const response = await apiClient.put<string>('/api/orders/status', data);
    return response.data;
  },

  // Get orders by shop with filters and pagination
  async getOrdersByShopWithFilters(
    shopId: string,
    status?: OrderStatus,
    page: number = 0,
    size: number = 10
  ): Promise<{
    content: OrderResponseDto[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (status) {
      params.append('status', status);
    }
    const response = await apiClient.get(`/api/orders/shop/${shopId}?${params}`);
    return response.data;
  },

  async getOrdersReadyForShipment(): Promise<OrderResponseDto[]> {
    const response = await apiClient.get<OrderResponseDto[]>('/api/orders/shipping');
    return response.data;
  },
};