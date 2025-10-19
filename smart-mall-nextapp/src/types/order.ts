// Order management types
export interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant: string;
}

export interface Shop {
  id: string;
  name: string;
  avatar: string;
}

export interface Shipping {
  method: string;
  fee: number;
  estimatedDelivery: string;
}

export interface Order {
  id: string;
  status: "PENDING" | "PAID" | "SHIPPING" | "DELIVERED" | "CONFIRMED" | "CANCELLED" | "RETURN_REQUESTED" | "RETURNED";
  shopName: string;
  shopAvatar: string;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  createdAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  reviewedAt?: string;
  trackingNumber?: string;
  cancelledDate?: string;
  cancelReason?: string;
  canReview?: boolean;
  reviewData?: ReviewData;
  shippingAddress?: string;
  customerName?: string;
  phoneNumber?: string;
  paymentMethod?: string;
  note?: string;
}

export interface ReviewData {
  rating: number;
  comment: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  shipping: number;
  delivered: number;
  cancelled: number;
}