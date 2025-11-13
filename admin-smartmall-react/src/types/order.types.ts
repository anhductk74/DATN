export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PACKED' 
  | 'SHIPPING' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'RETURN_REQUESTED' 
  | 'RETURNED';

export type PaymentMethod = 'COD' | 'CREDIT_CARD' | 'E_WALLET';

export type ReturnStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  variant: {
    id: string;
    sku: string;
    color: string;
    size: string;
    stock: number;
  };
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderVoucher {
  id: string;
  orderId: string;
  voucherId: string;
  voucherCode: string;
  description: string;
  discountAmount: number;
}

export interface ShippingFee {
  id: string;
  orderId: string;
  shippingMethod: string;
  feeAmount: number;
  estimatedDeliveryDate: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: string;
  amount: number;
  transactionId: string;
  paidAt: string;
}

export interface StatusHistory {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string;
  changedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  shopId: string;
  shopName: string;
  shopAvatar: string;
  addressId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  items: OrderItem[];
  vouchers: OrderVoucher[];
  shippingFees: ShippingFee[];
  payment: Payment;
  statusHistories: StatusHistory[];
}

export interface OrdersPageResponse {
  content: Order[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
  note: string;
}

export interface ReturnRequestImage {
  id: string;
  imageUrl: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  reason: string;
  status: ReturnStatus;
  images: ReturnRequestImage[];
  createdAt: string;
  updatedAt: string;
}
