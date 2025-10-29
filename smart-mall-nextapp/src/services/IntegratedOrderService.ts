/**
 * Integrated Order Service - Simplified Version
 * Basic integration of order-related APIs
 */

import { orderApiService } from './OrderApiService';
import { orderItemApiService } from './OrderItemApiService';
import { orderTrackingApiService } from './OrderTrackingApiService';
import { orderVoucherApiService } from './OrderVoucherApiService';
import { paymentApiService } from './PaymentApiService';
import { shippingFeeApiService } from './ShippingFeeApiService';
import { voucherApiService } from './VoucherApiService';

import type {
  OrderRequestDto,
  OrderResponseDto,
  OrderStatus,
  PaymentMethod
} from './OrderApiService';

export interface SimpleOrderRequest {
  userId: string;
  shopId: string;
  shippingAddressId: string;
  paymentMethod: string; // Changed to string to match backend format
  shippingFee: number;
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
  voucherIds?: string[];
}

export class IntegratedOrderService {
  
  /**
   * Create complete order with basic validation
   */
  async createCompleteOrder(request: SimpleOrderRequest): Promise<{
    order: OrderResponseDto;
    success: boolean;
    errors?: string[];
  }> {
    try {
      // 1. Validate request
      if (!request.userId || !request.shopId || !request.shippingAddressId) {
        return {
          order: {} as OrderResponseDto,
          success: false,
          errors: ['Missing required fields: userId, shopId, or shippingAddressId']
        };
      }

      if (!request.items || request.items.length === 0) {
        return {
          order: {} as OrderResponseDto,
          success: false,
          errors: ['Order must contain at least one item']
        };
      }

      // 2. Create the order
      const orderRequest: OrderRequestDto = {
        userId: request.userId,
        shopId: request.shopId,
        shippingAddressId: request.shippingAddressId,
        paymentMethod: request.paymentMethod as PaymentMethod,
        shippingFee: request.shippingFee,
        items: request.items,
        voucherIds: request.voucherIds
      };

      const order = await orderApiService.createOrder(orderRequest);

      // Note: Vouchers are already applied by the backend when creating the order
      // No need to apply them again here to avoid duplicates

      // 4. Create shipping fee record
      try {
        await shippingFeeApiService.createShippingFee({
          orderId: order.id,
          shippingMethod: 'STANDARD',
          feeAmount: 25000,
          estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        });
      } catch (error) {
        console.warn('Failed to create shipping fee:', error);
      }

      // 5. Create payment record if not COD
      if (request.paymentMethod !== 'COD') {
        try {
          await paymentApiService.createPayment({
            orderId: order.id,
            method: request.paymentMethod as PaymentMethod
          });
        } catch (error) {
          console.warn('Failed to create payment:', error);
        }
      }

      return {
        order,
        success: true
      };
    } catch (error) {
      console.error('Error creating complete order:', error);
      return {
        order: {} as OrderResponseDto,
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to create order']
      };
    }
  }

  /**
   * Get complete order details with all related information
   */
  async getCompleteOrderDetails(orderId: string) {
    try {
      // Fetch all order-related data in parallel
      const [
        orderResult,
        orderItemsResult,
        trackingLogsResult,
        vouchersResult,
        paymentResult,
        shippingFeeResult
      ] = await Promise.allSettled([
        orderApiService.getOrderById(orderId),
        orderItemApiService.getOrderItemsByOrder(orderId),
        orderTrackingApiService.getTrackingLogs(orderId),
        orderVoucherApiService.getVouchersByOrder(orderId),
        paymentApiService.getPaymentByOrder(orderId),
        shippingFeeApiService.getShippingFeeByOrder(orderId)
      ]);

      return {
        order: orderResult.status === 'fulfilled' ? orderResult.value : null,
        orderItems: orderItemsResult.status === 'fulfilled' ? orderItemsResult.value : [],
        trackingLogs: trackingLogsResult.status === 'fulfilled' ? trackingLogsResult.value : [],
        vouchers: vouchersResult.status === 'fulfilled' ? vouchersResult.value : [],
        payment: paymentResult.status === 'fulfilled' ? paymentResult.value : null,
        shippingFee: shippingFeeResult.status === 'fulfilled' ? shippingFeeResult.value : null,
        errors: {
          order: orderResult.status === 'rejected' ? orderResult.reason : null,
          orderItems: orderItemsResult.status === 'rejected' ? orderItemsResult.reason : null,
          trackingLogs: trackingLogsResult.status === 'rejected' ? trackingLogsResult.reason : null,
          vouchers: vouchersResult.status === 'rejected' ? vouchersResult.reason : null,
          payment: paymentResult.status === 'rejected' ? paymentResult.reason : null,
          shippingFee: shippingFeeResult.status === 'rejected' ? shippingFeeResult.reason : null,
        }
      };
    } catch (error) {
      console.error('Error fetching complete order details:', error);
      throw new Error('Failed to fetch order details');
    }
  }

  /**
   * Update order status with tracking
   */
  async updateOrderWithTracking(
    orderId: string, 
    status: OrderStatus, 
    trackingInfo?: {
      carrier: string;
      trackingNumber: string;
      currentLocation: string;
      statusDescription: string;
    }
  ) {
    try {
      // Update order status
      await orderApiService.updateOrderStatus({
        orderId,
        status
      });

      // Add tracking log if provided
      if (trackingInfo) {
        await orderTrackingApiService.addTrackingLog(orderId, trackingInfo);
      }

      return true;
    } catch (error) {
      console.error('Error updating order with tracking:', error);
      return false;
    }
  }

  /**
   * Get orders by user with summary information
   */
  async getUserOrders(userId: string) {
    try {
      const orders = await orderApiService.getOrdersByUser(userId);
      return orders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const integratedOrderService = new IntegratedOrderService();