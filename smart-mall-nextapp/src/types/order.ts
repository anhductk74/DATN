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
  status: "pending" | "confirmed" | "shipping" | "delivered" | "reviewed" | "cancelled";
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