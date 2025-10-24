/**
 * Utility functions to integrate new API services with existing codebase
 */

import { 
  orderApiService, 
  OrderResponseDto, 
  OrderSummaryDto,
  paymentApiService,
} from './index';

import { OrderStatus as NewOrderStatus } from './OrderApiService';
import { PaymentMethod, PaymentStatus } from './PaymentApiService';

// Mapping between old and new order status
export const mapOrderStatus = {
  // Old status -> New status
  'PENDING': NewOrderStatus.PENDING,
  'PAID': NewOrderStatus.CONFIRMED,
  'SHIPPED': NewOrderStatus.SHIPPING,
  'COMPLETED': NewOrderStatus.DELIVERED,
  'CANCELLED': NewOrderStatus.CANCELLED,
} as const;

// Reverse mapping: New status -> Old status
export const mapOrderStatusReverse = {
  [NewOrderStatus.PENDING]: 'PENDING',
  [NewOrderStatus.CONFIRMED]: 'PAID',
  [NewOrderStatus.PACKED]: 'PAID',
  [NewOrderStatus.SHIPPING]: 'SHIPPED',
  [NewOrderStatus.DELIVERED]: 'COMPLETED',
  [NewOrderStatus.CANCELLED]: 'CANCELLED',
  [NewOrderStatus.RETURN_REQUESTED]: 'CANCELLED',
  [NewOrderStatus.RETURNED]: 'CANCELLED',
} as const;

// Convert new order response to old format for compatibility
export const convertOrderResponseToOld = (newOrder: OrderResponseDto) => {
  return {
    id: newOrder.id,
    orderNumber: `ORD-${newOrder.id.slice(-8)}`, // Generate order number from ID
    status: mapOrderStatusReverse[newOrder.status] || 'PENDING',
    items: newOrder.items.map(item => ({
      id: item.id,
      variant: item.variant,
      productName: item.productName,
      productImage: item.productImage,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
    totalAmount: newOrder.finalAmount,
    shippingAddress: {
      id: newOrder.userId,
      fullName: newOrder.userName,
      phoneNumber: '',
      addressLine: `Shop: ${newOrder.shopName}`, // Placeholder
      ward: '',
      district: '',
      city: '',
    },
    paymentMethod: newOrder.paymentMethod,
    createdAt: newOrder.createdAt,
    updatedAt: newOrder.createdAt, // Use createdAt as fallback
  };
};

// Convert order summary to old format
export const convertOrderSummaryToOld = (summary: OrderSummaryDto) => {
  return {
    id: summary.id,
    orderNumber: `ORD-${summary.id.slice(-8)}`, // Generate from ID
    status: mapOrderStatusReverse[summary.status] || 'PENDING',
    totalAmount: summary.finalAmount,
    createdAt: summary.createdAt,
    itemCount: 1, // Default value since not in DTO
    shopName: summary.shopName || 'Unknown Shop',
  };
};

// Wrapper functions for backward compatibility
export const orderServiceWrapper = {
  // Get orders by user (using new API)
  async getOrdersByUser(userId: string) {
    try {
      const orders = await orderApiService.getOrdersByUser(userId);
      return orders.map(convertOrderSummaryToOld);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get order by ID (using new API)
  async getOrderById(id: string) {
    try {
      const order = await orderApiService.getOrderById(id);
      return convertOrderResponseToOld(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Update order status (using new API)
  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    try {
      const newStatus = mapOrderStatus[status as keyof typeof mapOrderStatus] || NewOrderStatus.PENDING;
      await orderApiService.updateOrderStatus({
        orderId,
        status: newStatus
      });
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }
};

// Payment service wrapper
export const paymentServiceWrapper = {
  // Create payment with proper method mapping
  async createPayment(orderId: string, paymentMethod: string) {
    try {
      const methodMapping: Record<string, PaymentMethod> = {
        'COD': PaymentMethod.COD,
        'CREDIT_CARD': PaymentMethod.CREDIT_CARD,
        'E_WALLET': PaymentMethod.E_WALLET,
        'VNPAY': PaymentMethod.E_WALLET, // Map VNPAY to E_WALLET
        'MOMO': PaymentMethod.E_WALLET,  // Map MOMO to E_WALLET
      };

      const payment = await paymentApiService.createPayment({
        orderId,
        method: methodMapping[paymentMethod] || PaymentMethod.COD
      });

      return payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  // Get payment by order
  async getPaymentByOrder(orderId: string) {
    try {
      return await paymentApiService.getPaymentByOrder(orderId);
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }
};