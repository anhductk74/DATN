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
import ReturnRequestList from "./components/ReturnRequestList";
import orderService, { type Order as ApiOrder } from "@/services/OrderService";
import orderReturnRequestApiService, { OrderReturnResponseDto } from "@/services/orderReturnRequestApiService";
import { orderApiService, type OrderResponseDto } from "@/services/OrderApiService";
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

// Extended type for return requests with order details
interface ReturnRequestWithOrderDetails extends OrderReturnResponseDto {
  orderDetails?: OrderResponseDto;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequestWithOrderDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
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

  // Function to refresh orders when needed
  const refreshOrders = async () => {
    const currentUserId = userProfile?.id || user?.id;
    if (!currentUserId || status !== "authenticated") return;
    
    setLoading(true);
    try {
      const response = await orderService.getUserOrders(currentUserId);
      const transformedOrders = response.content.map(transformApiOrderToLocal);
      setOrders(transformedOrders);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error("Failed to refresh orders:", error);
      message.error(error?.response?.data?.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Function to load return requests with order details
  const loadReturnRequests = async () => {
    const currentUserId = userProfile?.id || user?.id;
    if (!currentUserId || status !== "authenticated") return;
    
    try {
      // Get return requests for this user
      const returnRequestsResponse = await orderReturnRequestApiService.getReturnRequestsByUser(currentUserId);
      
      // For each return request, fetch the corresponding order details
      const returnRequestsWithOrderDetails = await Promise.all(
        returnRequestsResponse.map(async (returnRequest) => {
          try {
            // Get order details using the orderId
            const orderDetails = await orderApiService.getOrderById(returnRequest.orderId);
            
            // Add order details to the return request
            return {
              ...returnRequest,
              orderDetails: orderDetails
            };
          } catch (orderError) {
            console.error(`Failed to load order details for order ${returnRequest.orderId}:`, orderError);
            // Return the return request without order details if order fetch fails
            return returnRequest;
          }
        })
      );
      
      setReturnRequests(returnRequestsWithOrderDetails);
      console.log('Return requests with order details loaded:', returnRequestsWithOrderDetails);
    } catch (error: any) {
      console.error("Failed to load return requests:", error);
      // Don't show error message as return requests might not exist for all users
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const loadData = async () => {
      if (status !== "authenticated") return;
      
      const currentUserId = userProfile?.id || user?.id;
      if (!currentUserId) {
        setLoading(false);
        return;
      }
      
      // Prevent loading if already loaded and user hasn't changed
      if (hasLoaded && currentUserId) return;
      
      setLoading(true);
      try {
        // Load orders
        const response = await orderService.getUserOrders(currentUserId);
        const transformedOrders = response.content.map(transformApiOrderToLocal);
        setOrders(transformedOrders);
        setTotalPages(response.totalPages);
        
        // Load return requests
        await loadReturnRequests();
        
        setHasLoaded(true);
      } catch (error: any) {
        console.error("Failed to load orders:", error);
        message.error(error?.response?.data?.message || "Không thể tải danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    // Only load when we have authentication status and user info
    if (status === "authenticated" && (userProfile?.id || user?.id)) {
      loadData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, userProfile?.id, user?.id, hasLoaded]);

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
      "return-request": ["RETURN_REQUESTED", "RETURNED"]
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
      cancelled: 0,
      returnRequest: 0
    };

    orders.forEach(order => {
      const status = order.status;
      
      if (status === "PENDING") counts.pending++;
      else if (status === "CONFIRMED" || status === "PAID") counts.confirmed++;
      else if (status === "SHIPPING") counts.shipping++;
      else if (status === "DELIVERED") counts.delivered++;
      else if (status === "CANCELLED") counts.cancelled++;
      else if (status === "RETURN_REQUESTED" || status === "RETURNED") counts.returnRequest++;
    });

    return counts;
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orderService.cancelOrder(orderId);
      
      // Update local state instead of reloading from API
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'CANCELLED' as Order['status'] }
            : order
        )
      );
      
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
          orderCounts={{
            ...getOrderCounts(),
            returnRequest: returnRequests.length
          }}
          title="My Orders"
          orderCount={activeTab === "return-request" ? returnRequests.length : orders.length}
        />

        <div className="max-w-6xl mx-auto px-4 pt-6">
          {activeTab === "return-request" ? (
            <ReturnRequestList
              returnRequests={returnRequests}
              loading={loading}
              onViewOrder={handleViewOrder}
            />
          ) : (
            <OrderList
              orders={filteredOrders}
              loading={loading}
              onCancelOrder={handleCancelOrder}
              onViewOrder={handleViewOrder}
              onReorder={handleReorder}
              onReview={handleReview}
            />
          )}

          {/* Pagination Controls - Hidden for now since backend doesn't support pagination */}
          {false && totalPages > 1 && (
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
