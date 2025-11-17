// Export all services
export { default as apiClient } from '../lib/apiClient';
export { default as authService } from './AuthService';
export { default as userService } from './UserService';
export { default as shopService } from './ShopService';
export { default as productService } from './ProductService';
export { default as categoryService } from './CategoryService';
export { default as cartService } from './CartService';
export { default as orderService } from './OrderService';
export { default as reviewService } from './ReviewService';
export { default as reviewApiService } from './ReviewApiService';
export { default as reviewReplyApiService } from './ReviewReplyApiService';
export { default as addressService } from './AddressService';
export { locationService } from './LocationService';
export { default as dashboardService } from './DashboardService';
export { default as walletService } from './WalletService';

// New API services based on backend controllers
export { orderApiService } from './OrderApiService';
export { orderItemApiService } from './OrderItemApiService';
export { orderTrackingApiService } from './OrderTrackingApiService';
export { orderVoucherApiService } from './OrderVoucherApiService';
export { orderReturnRequestApiService } from './orderReturnRequestApiService';
export { paymentApiService } from './PaymentApiService';
export { shippingFeeApiService } from './ShippingFeeApiService';
export { voucherApiService } from './VoucherApiService';
// export { notificationApiService } from './notificationApiService';
export { addressApiService } from './AddressApiService';
export { vnPayService } from './vnPayService';


// Export service wrappers and integrated services
export * from './ServiceWrappers';
export * from './paymentStatusService';
export { integratedOrderService, IntegratedOrderService } from './IntegratedOrderService';

// Export types from common types
export type * from '@/types/common';
export type { Shop, ShopAddress, CreateShopData, UpdateShopData } from './ShopService';
export type { Product, ProductVariant, ProductAttribute, CreateProductData, UpdateProductData } from './ProductService';
export type { Category, CreateCategoryData, UpdateCategoryData } from './CategoryService';
export type { Province, District, Ward } from './LocationService';
export type { DashboardStats, TopProduct, PerformanceMetrics } from './DashboardService';
export type {
  WalletResponse,
  CreateWalletRequest,
  UpdateBankInfoRequest,
  CreateWithdrawalRequest,
  WithdrawalResponse,
  ProcessWithdrawalRequest,
  WalletTransactionResponse,
  WalletStatisticsResponse,
} from './WalletService';

// Export types from new API services
export type { 
  OrderRequestDto, 
  OrderResponseDto, 
  OrderSummaryDto, 
  UpdateOrderStatusDto, 
  OrderStatus,
  PaymentMethod as OrderPaymentMethod
} from './OrderApiService';
export type { OrderItemResponseDto } from './OrderItemApiService';
export type { OrderTrackingLogResponse, OrderTrackingLogRequest } from './OrderTrackingApiService';
export type { 
  ApplyVoucherRequestDto, 
  OrderVoucherResponseDto 
} from './OrderVoucherApiService';
export type { 
  OrderReturnRequestDto,
  OrderReturnResponseDto,
  OrderReturnImageResponseDto
} from './orderReturnRequestApiService';
export { ReturnStatus } from './orderReturnRequestApiService';
export type { 
  CreatePaymentRequestDto, 
  PaymentResponseDto, 
  PaymentMethod, 
  PaymentStatus 
} from './PaymentApiService';
export type { 
  ShippingFeeRequestDto, 
  ShippingFeeResponseDto
} from './ShippingFeeApiService';
export type { 
  VoucherRequestDto, 
  VoucherResponseDto, 
  VoucherType,
  DiscountType 
} from './VoucherApiService';
export type {
  ReviewReplyResponseDto,
  ReviewReplyRequestDto
} from './ReviewReplyApiService';

// Import services for the services object
import authService from './AuthService';
import userService from './UserService';
import shopService from './ShopService';
import productService from './ProductService';
import categoryService from './CategoryService';
import cartService from './CartService';
import orderService from './OrderService';
import reviewService from './ReviewService';
import reviewApiService from './ReviewApiService';
import reviewReplyApiService from './ReviewReplyApiService';
import addressService from './AddressService';
import { locationService } from './LocationService';
import dashboardService from './DashboardService';
import walletService from './WalletService';

// Import new API services for the services object
import { orderApiService } from './OrderApiService';
import { orderItemApiService } from './OrderItemApiService';
import { orderTrackingApiService } from './OrderTrackingApiService';
import { orderVoucherApiService } from './OrderVoucherApiService';
import { paymentApiService } from './PaymentApiService';
import { shippingFeeApiService } from './ShippingFeeApiService';
import { voucherApiService } from './VoucherApiService';
import { orderServiceWrapper, paymentServiceWrapper } from './ServiceWrappers';

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
  reviewApi: reviewApiService,
  reviewReply: reviewReplyApiService,
  address: addressService,
  location: locationService,
  dashboard: dashboardService,
  wallet: walletService,
  
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