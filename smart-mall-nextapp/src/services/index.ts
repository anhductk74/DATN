// Export all services
export { default as apiClient } from '../lib/apiClient';
export { default as authService } from './authService';
export { default as userService } from './userService';
export { default as shopService } from './shopService';
export { default as productService } from './productService';
export { default as categoryService } from './categoryService';
export { default as cartService } from './cartService';
export { default as orderService } from './orderService';
export { default as reviewService } from './reviewService';
export { default as addressService } from './addressService';

// New API services based on backend controllers
export { orderApiService } from './orderApiService';
export { orderItemApiService } from './orderItemApiService';
export { orderTrackingApiService } from './orderTrackingApiService';
export { orderVoucherApiService } from './orderVoucherApiService';
export { paymentApiService } from './paymentApiService';
export { shippingFeeApiService } from './shippingFeeApiService';
export { voucherApiService } from './voucherApiService';
// export { notificationApiService } from './notificationApiService';
export { addressApiService } from './addressApiService';


// Export service wrappers and integrated services
export { orderServiceWrapper, paymentServiceWrapper } from './serviceWrappers';
export { integratedOrderService, IntegratedOrderService } from './integratedOrderService';

// Export types from common types
export type * from '@/types/common';
export type { Shop, ShopAddress, CreateShopData, UpdateShopData } from './shopService';
export type { Product, ProductVariant, ProductAttribute, CreateProductData, UpdateProductData } from './productService';
export type { Category, CreateCategoryData, UpdateCategoryData } from './categoryService';

// Export types from new API services
export type { 
  OrderRequestDto, 
  OrderResponseDto, 
  OrderSummaryDto, 
  UpdateOrderStatusDto, 
  OrderStatus,
  PaymentMethod as OrderPaymentMethod
} from './orderApiService';
export type { OrderItemResponseDto } from './orderItemApiService';
export type { OrderTrackingLogResponse, OrderTrackingLogRequest } from './orderTrackingApiService';
export type { 
  ApplyVoucherRequestDto, 
  OrderVoucherResponseDto 
} from './orderVoucherApiService';
export type { 
  CreatePaymentRequestDto, 
  PaymentResponseDto, 
  PaymentMethod, 
  PaymentStatus 
} from './paymentApiService';
export type { 
  ShippingFeeRequestDto, 
  ShippingFeeResponseDto
} from './shippingFeeApiService';
export type { 
  VoucherRequestDto, 
  VoucherResponseDto, 
  VoucherType,
  DiscountType 
} from './voucherApiService';

// Import services for the services object
import authService from './authService';
import userService from './userService';
import shopService from './shopService';
import productService from './productService';
import categoryService from './categoryService';
import cartService from './cartService';
import orderService from './orderService';
import reviewService from './reviewService';
import addressService from './addressService';

// Import new API services for the services object
import { orderApiService } from './orderApiService';
import { orderItemApiService } from './orderItemApiService';
import { orderTrackingApiService } from './orderTrackingApiService';
import { orderVoucherApiService } from './orderVoucherApiService';
import { paymentApiService } from './paymentApiService';
import { shippingFeeApiService } from './shippingFeeApiService';
import { voucherApiService } from './voucherApiService';
import { orderServiceWrapper, paymentServiceWrapper } from './serviceWrappers';

// Create a services object for easier importing
export const services = {
  auth: authService,
  user: userService,
  shop: shopService,
  product: productService,
  category: categoryService,
  cart: cartService,
  order: orderService,
  review: reviewService,
  address: addressService,
  
  // New API services
  orderApi: orderApiService,
  orderItem: orderItemApiService,
  orderTracking: orderTrackingApiService,
  orderVoucher: orderVoucherApiService,
  payment: paymentApiService,
  shippingFee: shippingFeeApiService,
  voucher: voucherApiService,
  
  // Wrapper services for backward compatibility
  orderWrapper: orderServiceWrapper,
  paymentWrapper: paymentServiceWrapper,
};

export default services;