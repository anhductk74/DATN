// Common API response types
export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// Product Types
export interface ProductAttribute {
  id?: string;
  attributeName: string;
  attributeValue: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  weight?: number;
  dimensions?: string;
  attributes: ProductAttribute[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  images?: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  isDeleted?: boolean;
  variants: ProductVariant[];
  categoryId: string;
  shopId: string;
  createdAt?: string;
  updatedAt?: string;
  averageRating?: number;
  reviewCount?: number;
  category?: {
    id: string;
    name: string;
    description: string;
  };
  shop?: {
    id: string;
    name: string;
    description: string;
    numberPhone: string;
    avatar?: string;
    ownerId?: string;
    ownerName?: string;
    address?: string;
  };
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface VariantAttribute {
  id: string;
  name: string;
  value: string;
}

export interface CartProductVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  productName: string;
  productBrand: string;
  attributes: VariantAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  variant: CartProductVariant;
  productName: string;
  productImage: string;
  productShopId?: string;
  productShopName?: string;
  quantity: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface OrderItem {
  id: string;
  variant: CartProductVariant;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  shopName?: string;
  shopAvatar?: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  items: OrderItem[];
  totalAmount: number;
  shippingFee?: number;
  discountAmount?: number;
  finalAmount?: number;
  estimatedDelivery?: string;
  trackingNumber?: string;
  shippingAddress: {
    id: string;
    fullName: string;
    phoneNumber: string;
    addressLine: string;
    ward: string;
    district: string;
    city: string;
  };
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

// Wallet Types
export interface WalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND';
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  numberPhone: string;
  avatar?: string;
  address?: string;
  ownerId: string;
  ownerName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
