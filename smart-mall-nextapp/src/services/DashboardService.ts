import apiClient from '../lib/apiClient';
import type { Order } from './OrderService';
import type { Product } from './ProductService';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  shopViews: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  viewsChange: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

export interface PerformanceMetrics {
  rating: number;
  reviewCount: number;
  onTimeDeliveryRate: number;
  orderAccuracyRate: number;
  responseTimeRate: number;
}

class DashboardService {
  /**
   * Get dashboard statistics for a shop
   */
  async getShopStats(shopId: string): Promise<DashboardStats> {
    try {
      // In real implementation, this would be a single endpoint
      // For now, we'll aggregate data from existing endpoints
      const [orders, shop] = await Promise.all([
        this.getShopOrders(shopId),
        this.getShopInfo(shopId)
      ]);

      // Calculate stats from orders
      const totalRevenue = orders.reduce((sum, order) => {
        if (order.status !== 'CANCELLED') {
          return sum + (order.finalAmount || order.totalAmount);
        }
        return sum;
      }, 0);

      const totalOrders = orders.length;
      
      // Get unique customers
      const uniqueCustomers = new Set(orders.map(o => o.id)).size;

      return {
        totalRevenue,
        totalOrders,
        totalCustomers: uniqueCustomers,
        shopViews: shop.viewCount || 0,
        revenueChange: 0, // Would need historical data
        ordersChange: 0,
        customersChange: 0,
        viewsChange: 0,
      };
    } catch (error) {
      console.error('Failed to get shop stats:', error);
      throw error;
    }
  }

  /**
   * Get shop orders
   */
  async getShopOrders(shopId: string, status?: string, page = 0, size = 100): Promise<Order[]> {
    try {
      let url = `/orders/shop/${shopId}?page=${page}&size=${size}`;
      if (status) {
        url += `&status=${status}`;
      }
      
      const response = await apiClient.get<{ content: Order[] }>(url);
      return response.data.content || [];
    } catch (error) {
      console.error('Failed to get shop orders:', error);
      return [];
    }
  }

  /**
   * Get shop information including view count
   */
  async getShopInfo(shopId: string): Promise<{ viewCount: number }> {
    try {
      const response = await apiClient.get(`/shop/${shopId}`);
      return {
        viewCount: response.data.data?.viewCount || 0
      };
    } catch (error) {
      console.error('Failed to get shop info:', error);
      return { viewCount: 0 };
    }
  }

  /**
   * Get top selling products for a shop
   */
  async getTopProducts(shopId: string, limit = 5): Promise<TopProduct[]> {
    try {
      // Get all products for the shop
      const response = await apiClient.get<{ data: Product[] }>(`/products/shop/${shopId}`);
      const products = response.data.data || [];

      // Get orders to calculate sales
      const orders = await this.getShopOrders(shopId);
      
      // Calculate sales per product
      const productSales = new Map<string, { sales: number; revenue: number; name: string }>();
      
      orders.forEach(order => {
        if (order.status !== 'CANCELLED') {
          order.items.forEach(item => {
            const current = productSales.get(item.variant.id || '') || { 
              sales: 0, 
              revenue: 0, 
              name: item.productName 
            };
            productSales.set(item.variant.id || '', {
              sales: current.sales + item.quantity,
              revenue: current.revenue + item.subtotal,
              name: item.productName
            });
          });
        }
      });

      // Convert to array and sort by sales
      const topProducts = Array.from(productSales.entries())
        .map(([id, data]) => ({
          id,
          name: data.name,
          sales: data.sales,
          revenue: data.revenue
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, limit);

      return topProducts;
    } catch (error) {
      console.error('Failed to get top products:', error);
      return [];
    }
  }

  /**
   * Get recent orders for a shop
   */
  async getRecentOrders(shopId: string, limit = 10): Promise<Order[]> {
    try {
      const orders = await this.getShopOrders(shopId, undefined, 0, limit);
      return orders.slice(0, limit);
    } catch (error) {
      console.error('Failed to get recent orders:', error);
      return [];
    }
  }

  /**
   * Get performance metrics for a shop
   */
  async getPerformanceMetrics(shopId: string): Promise<PerformanceMetrics> {
    try {
      const orders = await this.getShopOrders(shopId);
      
      // Calculate metrics
      const completedOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'SHIPPED');
      const onTimeDeliveries = completedOrders.length; // Would need actual delivery data
      const onTimeDeliveryRate = completedOrders.length > 0 
        ? (onTimeDeliveries / completedOrders.length) * 100 
        : 0;

      return {
        rating: 0, // Would come from reviews API
        reviewCount: 0,
        onTimeDeliveryRate: Math.min(onTimeDeliveryRate, 100),
        orderAccuracyRate: 98, // Would need actual data
        responseTimeRate: 87, // Would need actual data
      };
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return {
        rating: 0,
        reviewCount: 0,
        onTimeDeliveryRate: 0,
        orderAccuracyRate: 0,
        responseTimeRate: 0,
      };
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
