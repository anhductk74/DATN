'use client';

import { useState, useEffect } from "react";
import { Card, Typography, message } from "antd";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import useAutoLogout from "@/hooks/useAutoLogout";
import OrderTabs from "./components/OrderTabs";
import OrderList from "./components/OrderList";
import orderService, { type Order as ApiOrder } from "@/services/orderService";
import type { Order } from "@/types/order";
import { getCloudinaryUrl } from "@/config/config";

const { Title } = Typography;

// Helper function to format VND currency
const formatVND = (amount: number): string => {
  return amount.toLocaleString('vi-VN');
};

// Transform API order to local format
function transformApiOrderToLocal(apiOrder: ApiOrder): Order {
  // Default images to prevent empty string src errors
  const defaultShopAvatar = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=40&h=40&fit=crop&crop=center";
  const defaultProductImage = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop&crop=center";
  
  // Helper function to get proper image URL
  const getImageUrl = (imagePath: string | null | undefined, fallback: string): string => {
    if (!imagePath || imagePath.trim() === '') return fallback;
    
    // If it's already a full URL (starts with http), return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // If it's a Cloudinary path, convert to full URL
    if (imagePath.startsWith('/')) {
      return getCloudinaryUrl(imagePath);
    }
    
    // Otherwise use fallback
    return fallback;
  };
  
  return {
    id: apiOrder.id,
    shopName: apiOrder.shopName || "Smart Mall",
    shopAvatar: getImageUrl(apiOrder.shopAvatar, defaultShopAvatar),
    items: Array.isArray(apiOrder.items) ? apiOrder.items.map(item => {
      // Safe variant processing
      let variantText = "Default Variant";
      if (item.variant?.attributes && Array.isArray(item.variant.attributes)) {
        variantText = item.variant.attributes
          .map((attr: any) => `${attr.name || 'Unknown'}: ${attr.value || 'N/A'}`)
          .join(', ');
      } else if (item.variant?.sku) {
        variantText = `SKU: ${item.variant.sku}`;
      }
      
      return {
        id: item.id || 'unknown',
        name: item.productName || "Unknown Product",
        image: getImageUrl(item.productImage, defaultProductImage),
        variant: variantText,
        quantity: item.quantity || 1,
        price: item.price || 0
      };
    }) : [],
    status: (apiOrder.status || 'PENDING') as Order['status'],
    totalAmount: apiOrder.totalAmount || 0,
    shippingFee: apiOrder.shippingFee || 0,
    createdAt: apiOrder.createdAt || new Date().toISOString(),
    estimatedDelivery: apiOrder.estimatedDelivery || apiOrder.createdAt || new Date().toISOString(),
    trackingNumber: apiOrder.trackingNumber || apiOrder.id
  };
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();
  const { session, status, user } = useAuth();
  const { userProfile } = useUserProfile();

  // Auto logout after 30 minutes of inactivity
  useAutoLogout({
    timeout: 30 * 60 * 1000, // 30 minutes
    onLogout: () => {
      router.push("/login");
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const loadOrders = async () => {
      if (status !== "authenticated") return;
      
      const currentUserId = userProfile?.id || user?.id;
      if (!currentUserId) {
        message.error("Unable to get user information");
        return;
      }
      
      setLoading(true);
      try {
        const response = await orderService.getUserOrders(currentUserId);
        const transformedOrders = response.content.map(transformApiOrderToLocal);
        setOrders(transformedOrders);
        setTotalPages(response.totalPages);
      } catch (error: any) {
        console.error("Failed to load orders:", error);
        message.error(error?.response?.data?.message || "Không thể tải danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [status, currentPage, userProfile, user]);

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    
    // Map UI tabs to database ENUM values
    const statusMap: Record<string, string[]> = {
      pending: ["PENDING"],
      confirmed: ["CONFIRMED", "PAID"], 
      shipping: ["SHIPPING"],
      delivered: ["DELIVERED"],
      cancelled: ["CANCELLED"],
      returned: ["RETURN_REQUESTED", "RETURNED"]
    };
    
    const matchingStatuses = statusMap[activeTab] || [];
    return matchingStatuses.includes(order.status);
  });

  // Get order counts for each status
  const getOrderCounts = () => {
    const counts = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      const status = order.status;
      
      if (status === "PENDING") counts.pending++;
      else if (status === "CONFIRMED" || status === "PAID") counts.confirmed++;
      else if (status === "SHIPPING") counts.shipping++;
      else if (status === "DELIVERED") counts.delivered++;
      else if (status === "CANCELLED") counts.cancelled++;
      // Note: RETURN_REQUESTED and RETURNED can be added to a separate tab if needed
    });

    return counts;
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orderService.cancelOrder(orderId);
      
      // Reload orders after cancellation
      const currentUserId = userProfile?.id || user?.id;
      if (currentUserId) {
        const response = await orderService.getUserOrders(currentUserId);
        const transformedOrders = response.content.map(transformApiOrderToLocal);
        setOrders(transformedOrders);
      }
      
      message.success("Đã hủy đơn hàng thành công");
    } catch (error: any) {
      console.error("Failed to cancel order:", error);
      message.error(error?.response?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleReorder = async (orderId: string) => {
    try {
      // Get order details
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        message.error("Không tìm thấy đơn hàng");
        return;
      }
      
      message.info("Tính năng đặt lại đơn hàng đang được phát triển");
      // TODO: Add items to cart from order
      // router.push("/cart");
    } catch (error) {
      message.error("Không thể đặt lại đơn hàng");
    }
  };

  const handleReview = (orderId: string, itemId: string) => {
    // Navigate to review page or open review modal
    message.info("Tính năng đánh giá đang được phát triển");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pb-6">
        <OrderTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          orderCounts={getOrderCounts()}
          title="My Orders"
          orderCount={orders.length}
        />

        <div className="max-w-6xl mx-auto px-4 pt-6">
          <OrderList
            orders={filteredOrders}
            loading={loading}
            onCancelOrder={handleCancelOrder}
            onViewOrder={handleViewOrder}
            onReorder={handleReorder}
            onReview={handleReview}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang trước
                </button>
                <span className="px-4 py-2 bg-white border border-gray-300 rounded-md">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang sau
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
