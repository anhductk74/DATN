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
import type { Order } from "@/types/order";

const { Title } = Typography;

// Mock data - replace with actual API calls
const mockOrders: Order[] = [
  {
    id: "ORD001",
    shopName: "Tech Store Premium",
    shopAvatar: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=40&h=40&fit=crop&crop=center",
    items: [
      {
        id: "ITEM001",
        name: "iPhone 15 Pro Max",
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=80&h=80&fit=crop&crop=center",
        variant: "256GB, Deep Purple",
        quantity: 1,
        price: 1299.99
      },
      {
        id: "ITEM002", 
        name: "AirPods Pro (2nd gen)",
        image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=80&h=80&fit=crop&crop=center",
        variant: "White",
        quantity: 1,
        price: 249.99
      }
    ],
    status: "pending",
    totalAmount: 1549.98,
    shippingFee: 0,
    createdAt: "2024-01-15T10:30:00Z",
    estimatedDelivery: "2024-01-20T15:00:00Z"
  },
  {
    id: "ORD002",
    shopName: "Fashion Hub",
    shopAvatar: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=40&h=40&fit=crop&crop=center",
    items: [
      {
        id: "ITEM003",
        name: "Nike Air Max 270",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop&crop=center",
        variant: "Size 42, Black/White",
        quantity: 1,
        price: 150.00
      }
    ],
    status: "shipping",
    totalAmount: 150.00,
    shippingFee: 5.99,
    createdAt: "2024-01-10T14:20:00Z",
    estimatedDelivery: "2024-01-18T16:00:00Z",
    trackingNumber: "TN123456789"
  },
  {
    id: "ORD003",
    shopName: "Home & Garden",
    shopAvatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=center", 
    items: [
      {
        id: "ITEM004",
        name: "Smart LED Bulb Set",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop&crop=center",
        variant: "4-Pack, RGB",
        quantity: 2,
        price: 39.99
      }
    ],
    status: "delivered",
    totalAmount: 79.98,
    shippingFee: 7.50,
    createdAt: "2024-01-05T09:15:00Z",
    deliveredAt: "2024-01-08T11:30:00Z"
  }
];

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
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
    // Simulate API call
    const loadOrders = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(mockOrders);
      } catch (error) {
        message.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      loadOrders();
    }
  }, [status]);

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
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
      counts[order.status as keyof typeof counts]++;
    });

    return counts;
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: "cancelled" as const,
                cancelledDate: new Date().toISOString(),
                cancelReason: "Cancelled by customer"
              }
            : order
        )
      );
      
      message.success("Order cancelled successfully");
    } catch (error) {
      message.error("Failed to cancel order");
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleReorder = async (orderId: string) => {
    try {
      // Replace with actual API call to add items to cart
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success("Items added to cart");
      router.push("/cart");
    } catch (error) {
      message.error("Failed to reorder items");
    }
  };

  const handleReview = (orderId: string, itemId: string) => {
    // Navigate to review page or open review modal
    message.info("Review feature coming soon");
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
