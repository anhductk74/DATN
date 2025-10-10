'use client';

import { useState, useEffect } from "react";
import { Card, Typography, message } from "antd";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import useAutoLogout from "@/hooks/useAutoLogout";
import OrderTabs from "./components/OrderTabs";
import OrderList from "./components/OrderList";
import orderService, { type Order as ApiOrder } from "@/services/orderService";
import type { Order } from "@/types/order";

const { Title } = Typography;

// Transform API order to local format
function transformApiOrderToLocal(apiOrder: ApiOrder): Order {
  return {
    id: apiOrder.id,
    shopName: "Smart Mall", // Default shop name
    shopAvatar: "",
    items: apiOrder.items.map(item => ({
      id: item.id,
      name: item.productName,
      image: item.productImage,
      variant: item.variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', '),
      quantity: item.quantity,
      price: item.price
    })),
    status: apiOrder.status.toLowerCase() as Order['status'],
    totalAmount: apiOrder.totalAmount,
    shippingFee: 0, // Not in API response
    createdAt: apiOrder.createdAt,
    estimatedDelivery: apiOrder.updatedAt,
    trackingNumber: apiOrder.orderNumber
  };
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();
  const { session, status } = useAuth();

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
      
      setLoading(true);
      try {
        const response = await orderService.getUserOrders(currentPage, 10);
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
  }, [status, currentPage]);

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    
    // Map UI tabs to API status values
    const statusMap: Record<string, string[]> = {
      pending: ["pending"],
      confirmed: ["confirmed", "paid"],
      shipping: ["shipping", "shipped"],
      delivered: ["delivered", "completed"],
      cancelled: ["cancelled"]
    };
    
    const matchingStatuses = statusMap[activeTab] || [];
    return matchingStatuses.includes(order.status.toLowerCase());
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
      const status = order.status.toLowerCase();
      
      if (status === "pending") counts.pending++;
      else if (status === "confirmed" || status === "paid") counts.confirmed++;
      else if (status === "shipping" || status === "shipped") counts.shipping++;
      else if (status === "delivered" || status === "completed") counts.delivered++;
      else if (status === "cancelled") counts.cancelled++;
    });

    return counts;
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orderService.cancelOrder(orderId);
      
      // Reload orders after cancellation
      const response = await orderService.getUserOrders(currentPage, 10);
      const transformedOrders = response.content.map(transformApiOrderToLocal);
      setOrders(transformedOrders);
      
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
      
      <main className="py-6">
        <div className="max-w-6xl mx-auto px-4">
          <OrderTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            orderCounts={getOrderCounts()}
            title="My Orders"
            orderCount={orders.length}
          />

          <div className="pt-2">
            <OrderList
              orders={filteredOrders}
              loading={loading}
              onCancelOrder={handleCancelOrder}
              onViewOrder={handleViewOrder}
              onReorder={handleReorder}
              onReview={handleReview}
            />
          </div>

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
