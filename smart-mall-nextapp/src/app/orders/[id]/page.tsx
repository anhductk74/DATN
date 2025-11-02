'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Card, 
  Typography, 
  Button, 
  Steps, 
  Timeline, 
  Divider, 
  Space,
  Avatar,
  Tag,
  Spin,
  Result,
  Modal,
  Rate,
  Input,
  Upload,
  Form
} from "antd";
import Image from "next/image";
import {
  ArrowLeftOutlined,
  ShopOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  HomeOutlined,
  PlusOutlined,
  StarFilled,
  CameraOutlined,
  VideoCameraOutlined
} from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import useAutoLogout from "@/hooks/useAutoLogout";
import { useAntdApp } from "@/hooks/useAntdApp";
import OrderStatusBadge from "../../my-orders/components/OrderStatusBadge";
import { orderService, addressApiService, orderTrackingApiService, productService } from "@/services";
import reviewApiService from "@/services/ReviewApiService";
import orderReturnRequestApiService, { OrderReturnRequestDto, OrderReturnResponseDto } from "@/services/orderReturnRequestApiService";
import { useUserProfile } from "@/contexts/UserProfileContext";

// Define Order interface for this page
interface OrderItem {
  id: string; // Product ID
  orderItemId: string; // Order Item ID
  name: string;
  image: string;
  variant: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber?: string;
  shopName: string;
  shopAvatar: string;
  items: OrderItem[];
  status: "PENDING" | "PAID" | "SHIPPING" | "DELIVERED" | "CONFIRMED" | "CANCELLED" | "RETURN_REQUESTED" | "RETURNED";
  totalAmount: number;
  shippingFee?: number;
  discountAmount?: number;
  finalAmount?: number;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  shippingAddress?: any;
  paymentMethod?: string;
  deliveredAt?: string;
  cancelledDate?: string;
  cancelReason?: string;
  addressId?: string;
  vouchers?: any[];
  statusHistories?: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    note: string;
    changedAt: string;
  }>;
}
import { getCloudinaryUrl } from "@/config/config";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

// Helper function to enrich shop data from product API (same as in CartContext)
const enrichShopDataFromProducts = async (apiOrder: any): Promise<any> => {
  if (!apiOrder.items || !Array.isArray(apiOrder.items) || apiOrder.items.length === 0) {
    console.log('No items to enrich shop data from');
    return apiOrder;
  }

  try {
    // Get the first item to fetch shop info
    const firstItem = apiOrder.items[0];
    
    // Try different ways to get product ID
    let productId = null;
    if (firstItem.variant?.product?.id) {
      productId = firstItem.variant.product.id;
    } else if (firstItem.productId) {
      productId = firstItem.productId;
    }
    
    if (productId) {
      console.log('Fetching shop data from product:', productId);
      
      const product = await productService.getProductById(productId);
      
      if (product?.shop) {
        console.log('Found shop data from product API:', {
          shopId: product.shop.id,
          shopName: product.shop.name,
          shopAvatar: product.shop.avatar
        });
        
        // Enrich the order with real shop data
        return {
          ...apiOrder,
          shopName: product.shop.name,
          shopAvatar: product.shop.avatar
        };
      }
    }
  } catch (error) {
    console.warn('Failed to fetch shop data from product API:', error);
  }
  
  console.log('Using original shop data:', {
    shopName: apiOrder.shopName,
    shopAvatar: apiOrder.shopAvatar
  });
  return apiOrder;
};

// Helper function to format VND currency
const formatVND = (amount: number): string => {
  return amount.toLocaleString('vi-VN');
};

// Safe date formatting to prevent hydration mismatch
const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = {}) => {
  if (typeof window === 'undefined') {
    // Server-side: return a placeholder or basic format
    return new Date(dateString).toISOString().split('T')[0];
  }
  // Client-side: use full formatting
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const formatDateTime = (dateString: string) => {
  if (typeof window === 'undefined') {
    return new Date(dateString).toISOString().split('T')[0];
  }
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Transform API order to local format
const transformApiOrderToLocal = (apiOrder: any): Order => {
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

  // Format address from shippingAddress object
  const address = apiOrder.shippingAddress 
    ? `${apiOrder.shippingAddress.addressLine}, ${apiOrder.shippingAddress.ward}, ${apiOrder.shippingAddress.district}, ${apiOrder.shippingAddress.city}`
    : "";



  // Calculate subtotal from items
  const itemsSubtotal = apiOrder.items?.reduce((sum: number, item: any) => sum + (item.subtotal || item.price * item.quantity), 0) || 0;
  
  // Calculate discount (difference between items subtotal and total amount)
  const discountAmount = Math.max(0, itemsSubtotal + (apiOrder.shippingFee || 0) - apiOrder.totalAmount);





  return {
    id: apiOrder.id.toString(),
    orderNumber: apiOrder.orderNumber || apiOrder.id.toString(),
    shopName: apiOrder.shopName || "Smart Mall",
    shopAvatar: getImageUrl(apiOrder.shopAvatar, defaultShopAvatar),
    items: apiOrder.items?.map((item: any) => {
      const rawImageUrl = item.productImage || item.variant?.product?.imageUrl || "";
      
      
      return {
        id: item.variant?.product?.id || item.productId || item.id.toString(), // Use actual product ID
        orderItemId: item.id.toString(), // Keep order item ID separately
        name: item.productName || item.variant?.product?.name || "Unknown Product",
        image: getImageUrl(rawImageUrl, defaultProductImage),
        variant: item.variant?.attributes?.map((attr: any) => `${attr.name}: ${attr.value}`).join(', ') || "",
        quantity: item.quantity,
        price: item.price
      };
    }) || [],
    status: apiOrder.status || "PENDING",
    totalAmount: apiOrder.totalAmount || 0,
    shippingFee: apiOrder.shippingFee || 0, // Use actual shipping fee from API
    discountAmount: discountAmount > 0 ? discountAmount : undefined, // Only set if there's a discount
    finalAmount: apiOrder.totalAmount, // Final amount is the totalAmount from API
    createdAt: apiOrder.createdAt || new Date().toISOString(),
    estimatedDelivery: apiOrder.estimatedDelivery,
    trackingNumber: apiOrder.trackingNumber || apiOrder.orderNumber,
    shippingAddress: apiOrder.shippingAddress,
    paymentMethod: apiOrder.paymentMethod || 'COD',
    deliveredAt: apiOrder.deliveredAt || (apiOrder.status === 'DELIVERED' ? new Date().toISOString() : undefined),
    cancelledDate: apiOrder.cancelledAt,
    cancelReason: apiOrder.cancelReason,
    addressId: apiOrder.addressId,
    vouchers: apiOrder.vouchers,
    statusHistories: apiOrder.statusHistories || []
  };
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [trackingLogs, setTrackingLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackForm] = Form.useForm();
  const [selectedProductForReview, setSelectedProductForReview] = useState<OrderItem | null>(null);
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [reviewVideos, setReviewVideos] = useState<File[]>([]);
  const [submitReviewLoading, setSubmitReviewLoading] = useState(false);
  const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(new Set());
  const [returnRequestModalOpen, setReturnRequestModalOpen] = useState(false);
  const [returnRequestForm] = Form.useForm();
  const [returnImages, setReturnImages] = useState<File[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { session, status, user } = useAuth();
  const { userProfile } = useUserProfile();
  const { message } = useAntdApp();

  const orderId = params.id as string;

  // Reset state when orderId changes
  useEffect(() => {
    setOrder(null);
    setShippingAddress(null);
    setTrackingLogs([]);
    setHasLoaded(false);
    setNotFound(false);
  }, [orderId]);

  // Fix hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Check reviewed products status
  const checkReviewedProducts = async (order: Order, userId: string) => {
    if (order.status !== 'DELIVERED') return;
    
    try {
      const productIds = order.items.map(item => item.id);
      const reviewedProducts = await reviewApiService.checkMultipleProductsReview(productIds, userId);
      setReviewedProducts(reviewedProducts);
    } catch (error) {
      console.error('Failed to check reviewed products:', error);
      setReviewedProducts(new Set());
    }
  };

  useEffect(() => {
    const loadOrderDetail = async () => {
      if (status !== "authenticated") return;
      
      const currentUserId = userProfile?.id || user?.id;
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      // Prevent reload if already loaded with same data
      if (hasLoaded && order && order.id === orderId) return;
      
      setLoading(true);
      try {
        
        let apiOrder;
        
        try {
          // Use orderApiService directly to get full data including statusHistories
          const { orderApiService } = await import('@/services');
          apiOrder = await orderApiService.getOrderById(orderId);
          
        } catch (directError: any) {
          // Fallback to orderService
          apiOrder = await orderService.getOrder(orderId);
        }
        
        // Enrich shop data from product API if shopAvatar is missing
        const shopAvatar = (apiOrder as any).shopAvatar;
        if (!shopAvatar || shopAvatar.trim() === '') {
          apiOrder = await enrichShopDataFromProducts(apiOrder);
        }
        
        const transformedOrder = transformApiOrderToLocal(apiOrder);
        
        setOrder(transformedOrder);

        // Fetch shipping address if addressId exists
        if (apiOrder.addressId) {
          try {
            const addressResponse = await addressApiService.getAddressById(apiOrder.addressId);
            
            // Handle different response formats
            let addressData;
            if (addressResponse && typeof addressResponse === 'object') {
              // If response has 'data' property (wrapped response)
              addressData = (addressResponse as any).data || addressResponse;
            } else {
              addressData = addressResponse;
            }
            
            setShippingAddress(addressData);
          } catch (error) {
            console.error('Failed to fetch shipping address:', error);
            // Don't fail the whole order fetch if address fails
          }
        }

        // Fetch tracking logs if order is in shipping status
        if (['SHIPPING', 'DELIVERED'].includes(apiOrder.status)) {
          try {
            const trackingResponse = await orderTrackingApiService.getTrackingLogs(orderId);
            setTrackingLogs(trackingResponse);
          } catch (error) {
            console.error('Failed to fetch tracking logs:', error);
            // Don't fail if tracking logs fetch fails
          }
        }

        // Check reviewed products status for delivered orders
        if (transformedOrder.status === 'DELIVERED') {
          await checkReviewedProducts(transformedOrder, currentUserId);
        }

        setHasLoaded(true);

      } catch (error: any) {
        console.error("Failed to load order:", error);
        console.error("Error details:", {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data
        });
        message.error(error?.response?.data?.message || "Unable to load order details");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    // Only load when we have all required data and haven't loaded yet
    if (orderId && status === "authenticated" && (userProfile?.id || user?.id) && !hasLoaded) {
      loadOrderDetail();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [orderId, status, userProfile?.id, user?.id, hasLoaded]);

  const getOrderSteps = () => {
    // Check if all products are reviewed (only for delivered orders)
    const allProductsReviewed = order?.status === "DELIVERED" && 
      order.items.length > 0 && 
      order.items.every(item => reviewedProducts.has(item.id));

    const steps: Array<{title: string, status: "finish" | "error" | "wait" | "process"}> = [
      { title: "Order Placed", status: "finish" },
      { title: "Confirmed", status: order?.status === "PENDING" ? "wait" : "finish" },
      { title: "Shipping", status: ["SHIPPING", "DELIVERED"].includes(order?.status || "") ? "finish" : "wait" },
      { title: "Delivered", status: order?.status === "DELIVERED" ? "finish" : "wait" }
    ];

    // Add Review step only for delivered orders
    if (order?.status === "DELIVERED") {
      steps.push({
        title: "Review",
        status: allProductsReviewed ? "finish" : "wait"
      });
    }

    if (order?.status === "CANCELLED") {
      return [
        { title: "Order Placed", status: "finish" as const },
        { title: "Cancelled", status: "error" as const }
      ];
    }

    if (["RETURN_REQUESTED", "RETURNED"].includes(order?.status || "")) {
      return [
        { title: "Order Placed", status: "finish" as const },
        { title: "Delivered", status: "finish" as const },
        { title: order?.status === "RETURN_REQUESTED" ? "Return Requested" : "Returned", status: "error" as const }
      ];
    }

    return steps;
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    Modal.confirm({
      title: "Cancel Order",
      content: "Are you sure you want to cancel this order?",
      okText: "Cancel Order",
      cancelText: "No",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await orderService.cancelOrder(order.id);
          
          // Update local state instead of reloading from API
          setOrder(prevOrder => prevOrder ? {
            ...prevOrder,
            status: 'CANCELLED' as Order['status'],
            cancelledDate: new Date().toISOString(),
            cancelReason: 'Cancelled by customer'
          } : null);
          
          message.success("Order cancelled successfully");
        } catch (error: any) {
          console.error("Failed to cancel order:", error);
          message.error(error?.response?.data?.message || "Unable to cancel order");
        }
      }
    });
  };

  // Check if order can be returned (within 3 days of delivery)
  const canReturnOrder = () => {
    if (order?.status !== 'DELIVERED') {
      return false;
    }
    
    // Find the status history entry when order changed to DELIVERED
    const deliveredStatusHistory = order?.statusHistories?.find(
      history => history.toStatus === 'DELIVERED'
    );
    
    if (!deliveredStatusHistory) {
      return false;
    }
    
    const deliveredDate = new Date(deliveredStatusHistory.changedAt);
    const currentDate = new Date();
    const daysDifference = (currentDate.getTime() - deliveredDate.getTime()) / (1000 * 3600 * 24);
    
    return daysDifference <= 3;
  };

  // Get review progress for display
  const getReviewProgress = () => {
    if (!order || order.status !== 'DELIVERED') return null;
    
    const totalProducts = order.items.length;
    const reviewedCount = order.items.filter(item => reviewedProducts.has(item.id)).length;
    
    return {
      total: totalProducts,
      reviewed: reviewedCount,
      percentage: totalProducts > 0 ? Math.round((reviewedCount / totalProducts) * 100) : 0,
      completed: reviewedCount === totalProducts && totalProducts > 0
    };
  };

  // Handle opening review modal for a specific product
  const handleOpenReviewModal = (product: OrderItem) => {
    setSelectedProductForReview(product);
    setFeedbackModalOpen(true);
    feedbackForm.resetFields();
    setCurrentRating(0);
    setReviewImages([]);
    setReviewVideos([]);
  };

  // Handle review submission
  const handleSubmitFeedback = async (values: any) => {
    if (!order || !selectedProductForReview) return;
    
    const currentUserId = userProfile?.id || user?.id;
    if (!currentUserId) {
      message.error("User information not found");
      return;
    }

    // Prevent double submission
    if (submitReviewLoading) return;

    setSubmitReviewLoading(true);
    try {
      // Prepare review data
      const reviewData = {
        userId: currentUserId,
        productId: selectedProductForReview.id,
        orderId: order.id,
        rating: values.rating || currentRating,
        comment: values.comment || ""
      };

      // Check if we have images or videos to upload
      if (reviewImages.length > 0 || reviewVideos.length > 0) {
        await reviewApiService.createReviewWithMedia(
          reviewData,
          reviewImages.length > 0 ? reviewImages : undefined,
          reviewVideos.length > 0 ? reviewVideos : undefined
        );
      } else {
        await reviewApiService.createReview(reviewData);
      }
      
      message.success("Review submitted successfully!");
      
      // Add product to reviewed list
      setReviewedProducts(prev => new Set([...prev, selectedProductForReview.id]));
      
      setFeedbackModalOpen(false);
      feedbackForm.resetFields();
      setCurrentRating(0);
      setSelectedProductForReview(null);
      setReviewImages([]);
      setReviewVideos([]);
    } catch (error: any) {
      const errorMessage = error?.message || 
                          error?.response?.data?.messages?.[0] || 
                          error?.response?.data?.message || 
                          "Unable to submit review. Please try again.";
      
      message.error(errorMessage);
    } finally {
      setSubmitReviewLoading(false);
    }
  };

  // Handle image upload for review
  const handleImageUpload = (file: File) => {
    if (reviewImages.length >= 5) {
      message.error("Maximum 5 images allowed");
      return false;
    }
    
    const isValidType = file.type.startsWith('image/');
    if (!isValidType) {
      message.error("Only image files are allowed!");
      return false;
    }
    
    const isValidSize = file.size / 1024 / 1024 < 5; // Max 5MB
    if (!isValidSize) {
      message.error("Image size must not exceed 5MB!");
      return false;
    }

    setReviewImages(prev => [...prev, file]);
    return false; // Prevent auto upload
  };

  // Handle video upload for review
  const handleVideoUpload = (file: File) => {
    if (reviewVideos.length >= 2) {
      message.error("Maximum 2 videos allowed");
      return false;
    }
    
    const isValidType = file.type.startsWith('video/');
    if (!isValidType) {
      message.error("Only video files are allowed!");
      return false;
    }
    
    const isValidSize = file.size / 1024 / 1024 < 50; // Max 50MB
    if (!isValidSize) {
      message.error("Video size must not exceed 50MB!");
      return false;
    }

    setReviewVideos(prev => [...prev, file]);
    return false; // Prevent auto upload
  };

  const removeReviewImage = (fileToRemove: File) => {
    setReviewImages(prev => prev.filter(file => file !== fileToRemove));
  };

  const removeReviewVideo = (fileToRemove: File) => {
    setReviewVideos(prev => prev.filter(file => file !== fileToRemove));
  };

  const handleSubmitReturnRequest = async (values: any) => {
    if (!order) return;
    
    const currentUserId = userProfile?.id || user?.id;
    if (!currentUserId) return;
    
    try {
      await orderReturnRequestApiService.createReturnRequest(
        order.id,
        currentUserId,
        values.reason,
        returnImages
      );
      
      message.success("Return request submitted successfully!");
      setReturnRequestModalOpen(false);
      returnRequestForm.resetFields();
      setReturnImages([]);
      
      // Update order status locally
      setOrder(prevOrder => prevOrder ? {
        ...prevOrder,
        status: 'RETURN_REQUESTED' as Order['status']
      } : null);
      
    } catch (error: any) {
      console.error("Failed to submit return request:", error);
      message.error(error?.response?.data?.message || "Unable to submit return request");
    }
  };

  // Debug log for shipping address state
 

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-6">
          <div className="max-w-6xl mx-auto px-4">
            <Result
              status="404"
              title="Order Not Found"
              subTitle="The order you're looking for doesn't exist or has been removed."
              extra={
                <Button 
                  type="primary" 
                  onClick={() => router.push('/my-orders')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 font-semibold text-white shadow-lg"
                >
                  Back to My Orders
              </Button>
              }
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-6">
        <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/my-orders')}
            className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 font-semibold shadow-lg px-6 py-2"
          >
            Back to My Orders
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <Title level={2} className="mb-0">Order Details</Title>
              <Text type="secondary">Order ID: {order.id}</Text>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Progress */}
            <Card title="Order Progress" className="shadow-sm">
              <div className="relative px-4 py-6">
                {(() => {
                  // Calculate steps and their positions
                  const hasReviewStep = order?.status === "DELIVERED";
                  const totalSteps = hasReviewStep ? 5 : 4;
                  
                  // Calculate current progress step (0-based index)
                  let currentStep = 0;
                  if (order?.status === "PENDING") currentStep = 0;
                  else if (["CONFIRMED", "PAID"].includes(order?.status || "")) currentStep = 1;
                  else if (order?.status === "SHIPPING") currentStep = 2;
                  else if (order?.status === "DELIVERED") {
                    const progress = getReviewProgress();
                    currentStep = progress?.completed ? 4 : 3;
                  }

                  return (
                    <>
                      {/* Progress Line Background */}
                      <div className="absolute top-12 left-16 right-16 h-1 bg-gray-300 rounded-full"></div>
                      
                      {/* Progress Line Active */}
                      <div 
                        className="absolute top-12 left-16 h-1 bg-green-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(0, (currentStep / Math.max(totalSteps - 1, 1)) * 100)}%`,
                          maxWidth: 'calc(100% - 128px)'
                        }}
                      ></div>
                    </>
                  );
                })()}

                <div className={`flex items-start relative ${
                  order?.status === "DELIVERED" ? 'justify-between' : 'justify-between'
                }`}>
                  {/* Order Placed */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-green-500 bg-white flex items-center justify-center text-green-500 z-10">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-3">Order Placed</div>
                    <div className="text-xs text-gray-500">08:27 01-10-2025</div>
                  </div>

                  {/* Confirmed */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center z-10 ${
                      ["CONFIRMED", "PAID", "SHIPPING", "DELIVERED"].includes(order?.status || "") 
                        ? 'border-green-500 text-green-500' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      <CheckCircleOutlined className="text-lg" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-3">Confirmed</div>
                    <div className="text-xs text-gray-500">
                      {["CONFIRMED", "PAID", "SHIPPING", "DELIVERED"].includes(order?.status || "") 
                        ? '08:32 01-10-2025' : ''}
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center z-10 ${
                      ["SHIPPING", "DELIVERED"].includes(order?.status || "") 
                        ? 'border-green-500 text-green-500' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      <TruckOutlined className="text-lg" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-3">Shipping</div>
                    <div className="text-xs text-gray-500">
                      {["SHIPPING", "DELIVERED"].includes(order?.status || "") 
                        ? '08:58 01-10-2025' : ''}
                    </div>
                  </div>

                  {/* Delivered */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center z-10 ${
                      ["DELIVERED"].includes(order?.status || "") 
                        ? 'border-green-500 text-green-500' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-3">Delivered</div>
                    <div className="text-xs text-gray-500">
                      {["DELIVERED"].includes(order?.status || "") 
                        ? '18:41 06-10-2025' : ''}
                    </div>
                  </div>

                  {/* Review - Always show for delivered orders */}
                  {order?.status === "DELIVERED" && (
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center z-10 ${
                        (() => {
                          const progress = getReviewProgress();
                          return progress?.completed 
                            ? 'border-green-500 text-green-500' 
                            : 'border-gray-300 text-gray-400';
                        })()
                      }`}>
                        <StarFilled className="text-lg" />
                      </div>
                      <div className="text-sm font-medium text-gray-900 mt-3">Review</div>
                      <div className="text-xs text-gray-500">
                        {(() => {
                          const progress = getReviewProgress();
                          if (!progress) return '';
                          return progress.completed 
                            ? 'Completed' 
                            : `${progress.reviewed}/${progress.total} reviewed`;
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {order.status === "SHIPPING" && order.trackingNumber && (
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TruckOutlined className="text-blue-600" />
                    <Text strong>Tracking Number: {order.trackingNumber}</Text>
                  </div>
                  <Text type="secondary">Your package is on the way!</Text>
                </div>
              )}
            </Card>

            {/* Shop Information */}
            <Card title="Shop Information" className="shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar 
                    src={order.shopAvatar && order.shopAvatar.trim() !== '' ? order.shopAvatar : null} 
                    size="large" 
                    icon={<ShopOutlined />} 
                  />
                  <div>
                    <Text strong className="text-lg">{order.shopName}</Text>
                    <div className="text-sm text-gray-500">Official Store</div>
                  </div>
                </div>
                <Space>
                  <Button 
                    icon={<MessageOutlined />}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 font-semibold shadow-lg px-4 py-2"
                  >
                    Chat
                  </Button>
                  <Button 
                    icon={<HomeOutlined />}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 font-semibold shadow-lg px-4 py-2"
                  >
                    View Shop
                  </Button>
                </Space>
              </div>
            </Card>

            {/* Order Items */}
            <Card title="Order Items" className="shadow-sm">
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg">
                    <Image
                      src={item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&crop=center'}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&crop=center';
                      }}
                      priority={false}
                      loading="lazy"
                    />
                    <div className="flex-1">
                      <Text strong className="text-base">{item.name}</Text>
                      <div className="text-sm text-gray-500 mt-1">{item.variant}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <Text strong className="text-lg text-red-600">
                        ₫{formatVND(item.price)}
                      </Text>
                      {/* Review button for delivered orders */}
                      {order.status === 'DELIVERED' && (
                        <div className="mt-2">
                          {reviewedProducts.has(item.id) ? (
                            <Button
                              size="small"
                              icon={<StarFilled />}
                              disabled
                              className="bg-gray-300 text-gray-500 border-0 rounded-lg cursor-not-allowed"
                            >
                              Reviewed
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              icon={<StarFilled />}
                              onClick={() => handleOpenReviewModal(item)}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 rounded-lg hover:shadow-md transition-all duration-300 font-medium"
                            >
                              Review
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Package Tracking Timeline */}
            {order.trackingNumber && (
              <Card title="Package Tracking" className="shadow-sm">
                <div className="space-y-4">
                  {/* Tracking Number */}
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <TruckOutlined className="text-blue-600" />
                    <div>
                      <Text strong>Tracking Number: {order.trackingNumber}</Text>
                      {order.estimatedDelivery && (
                        <div className="text-sm text-gray-600">
                          Expected delivery: {isClient ? new Date(order.estimatedDelivery).toLocaleString('en-US') : 'Loading...'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  {trackingLogs.length > 0 ? (
                    <div className="space-y-3">
                      <div className="font-medium text-gray-700">Tracking History:</div>
                      <Timeline
                        items={trackingLogs.map((log, index) => ({
                          color: index === 0 ? 'green' : 'blue',
                          children: (
                            <div className="space-y-1">
                              <div className="font-medium">{log.statusDescription}</div>
                              <div className="text-sm text-gray-600">{log.currentLocation}</div>
                              <div className="text-xs text-gray-500">
                                {isClient ? new Date(log.updatedAt).toLocaleString('en-US') : 'Loading...'}
                              </div>
                              <div className="text-xs text-gray-400">Carrier: {log.carrier}</div>
                            </div>
                          )
                        }))}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <TruckOutlined className="text-2xl mb-2" />
                      <div>Tracking information will be updated once package is shipped</div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Order Summary & Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card title="Order Summary" className="shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal ({order.items.length} items):</span>
                  <span>₫{formatVND(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span>{(order.shippingFee || 0) === 0 ? 'Free' : `₫${formatVND(order.shippingFee || 0)}`}</span>
                </div>
                {/* Show discount if available */}
                {order.discountAmount && order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Voucher Discount:</span>
                    <span>-₫{formatVND(order.discountAmount)}</span>
                  </div>
                )}
                <Divider className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-red-600">₫{formatVND(order.finalAmount || order.totalAmount)}</span>
                </div>
                
                {/* Payment Method */}
                <Divider className="my-3" />
                <div className="pt-2">
                  <div className="text-sm font-medium text-gray-900 mb-2">Payment Method</div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const paymentMethod = order.paymentMethod || 'COD';
                      
                      // Define payment method configurations
                      const paymentConfigs = {
                        'COD': {
                          icon: (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                          ),
                          bgColor: 'bg-green-600',
                          label: 'Cash on Delivery',
                          subtitle: 'Pay when you receive'
                        },
                        'CREDIT_CARD': {
                          icon: (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                          ),
                          bgColor: 'bg-blue-600',
                          label: 'Credit Card',
                          subtitle: '**** **** **** 1234'
                        },
                        'E_WALLET': {
                          icon: (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                            </svg>
                          ),
                          bgColor: 'bg-purple-600',
                          label: 'E-Wallet',
                          subtitle: 'Digital payment'
                        }
                      };
                      
                      const config = paymentConfigs[paymentMethod as keyof typeof paymentConfigs] || paymentConfigs['COD'];
                      
                      return (
                        <>
                          <div className={`w-8 h-8 ${config.bgColor} rounded flex items-center justify-center`}>
                            {config.icon}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{config.label}</div>
                            <div className="text-xs text-gray-500">{config.subtitle}</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Information */}
            <Card title="Order Information" className="shadow-sm">
              <div className="space-y-3 text-sm">
                <div>
                  <Text type="secondary">Order Date:</Text>
                  <div>{isClient ? formatDateTime(order.createdAt) : 'Loading...'}</div>
                </div>
                
                {/* Shipping Address */}
                {shippingAddress ? (
                  <div>
                    <Text type="secondary">Shipping Address:</Text>
                    <div className="mt-1">
                      <div className="font-medium">{shippingAddress.recipient || 'N/A'}</div>
                      <div>{shippingAddress.phoneNumber || 'N/A'}</div>
                      <div className="text-gray-600">
                        {shippingAddress.fullAddress || 
                         `${shippingAddress.street || ''}${shippingAddress.commune ? `, ${shippingAddress.commune}` : ''}${shippingAddress.district ? `, ${shippingAddress.district}` : ''}${shippingAddress.city ? `, ${shippingAddress.city}` : ''}`
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Text type="secondary">Shipping Address:</Text>
                    <div className="mt-1 text-gray-500">Loading address...</div>
                  </div>
                )}
                
                {order.estimatedDelivery && order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                  <div>
                    <Text type="secondary">Expected Delivery:</Text>
                    <div>{isClient ? formatDate(order.estimatedDelivery) : 'Loading...'}</div>
                  </div>
                )}

                {order.deliveredAt && (
                  <div>
                    <Text type="secondary">Delivered Date:</Text>
                    <div className="text-green-600 font-medium">
                      {isClient ? formatDateTime(order.deliveredAt) : 'Loading...'}
                    </div>
                  </div>
                )}

                {order.cancelledDate && (
                  <div>
                    <Text type="secondary">Cancelled Date:</Text>
                    <div className="text-red-600">
                      {isClient ? formatDate(order.cancelledDate) : 'Loading...'}
                    </div>
                    {order.cancelReason && (
                      <div className="text-xs text-gray-500 mt-1">
                        Reason: {order.cancelReason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            <Card title="Actions" className="shadow-sm">
              <Space direction="vertical" className="w-full">
                {order.status === "PENDING" && (
                  <Button 
                    danger 
                    onClick={handleCancelOrder}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3"
                  >
                    Cancel Order
                  </Button>
                )}
                
                {order.status === "DELIVERED" && (
                  <>

                    
                    {canReturnOrder() && (
                      <Button 
                        className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3"
                        onClick={() => setReturnRequestModalOpen(true)}
                      >
                        🔄 Return Request
                      </Button>
                    )}
                    
                    {/* Show when return is not available */}
                    {!canReturnOrder() && order.status === "DELIVERED" && (
                      <div className="text-xs text-gray-500 mb-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                        {(() => {
                          const deliveredHistory = order.statusHistories?.find(h => h.toStatus === 'DELIVERED');
                          if (deliveredHistory) {
                            const deliveredDate = new Date(deliveredHistory.changedAt);
                            const expireDate = new Date(deliveredDate.getTime() + (3 * 24 * 60 * 60 * 1000));
                            return `Return period expired. Returns were available until ${expireDate.toLocaleDateString('en-US')}`;
                          }
                          return 'Return period expired or no delivery date available';
                        })()}
                      </div>
                    )}
                    {/* <Button 
                      type="primary" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3"
                    >
                      Write Review
                    </Button> */}

                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3">
                      Order Again
                    </Button>
                  </>
                )}

                {false && ( // Removed review status since it's not in API
                  <>
                    <Button 
                      type="primary" 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3" 
                      disabled
                    >
                      ✓ Review Completed
                    </Button>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3"
                      onClick={() => setFeedbackModalOpen(true)}
                    >
                      💬 Send Feedback
                    </Button>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3">
                      Order Again
                    </Button>
                  </>
                )}

                {["CONFIRMED", "PAID", "SHIPPING"].includes(order.status) && (
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold shadow-lg py-3">
                    Contact Seller
                  </Button>
                )}
              </Space>
            </Card>
          </div>
        </div>
        </div>
      </main>
      
      <Footer />

      {/* Review Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-3 pb-4 border-b">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <StarFilled className="text-white text-xl" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">Product Review</div>
              <div className="text-sm text-gray-500">{selectedProductForReview?.name}</div>
            </div>
          </div>
        }
        open={feedbackModalOpen}
        onCancel={() => setFeedbackModalOpen(false)}
        footer={null}
        width={600}
        className="feedback-modal"
      >
        <Form
          form={feedbackForm}
          layout="vertical"
          onFinish={handleSubmitFeedback}
          className="mt-6"
        >
          {/* Product Info */}
          {selectedProductForReview && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center space-x-3">
                <Image
                  src={selectedProductForReview.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop&crop=center'}
                  alt={selectedProductForReview.name}
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1">
                  <Text strong className="text-gray-800">{selectedProductForReview.name}</Text>
                  <div className="text-sm text-gray-500 mt-1">{selectedProductForReview.variant}</div>
                  <div className="text-sm text-gray-500">Quantity: {selectedProductForReview.quantity}</div>
                </div>
              </div>
            </div>
          )}

          {/* Rating */}
          <Form.Item
            label={<span className="text-gray-700 font-medium">Your Rating</span>}
            name="rating"
            rules={[
              {
                validator: () => {
                  if (currentRating > 0) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Please select a rating!'));
                }
              }
            ]}
          >
            <div className="text-center py-4">
              <Rate 
                style={{ fontSize: '32px' }}
                character={<StarFilled />}
                value={currentRating}
                onChange={(value) => {
                  setCurrentRating(value);
                  feedbackForm.setFieldsValue({ rating: value });
                  
                  const ratingTexts = {
                    0: '',
                    1: 'Very Bad',
                    2: 'Unsatisfied', 
                    3: 'Average',
                    4: 'Satisfied',
                    5: 'Excellent'
                  };
                  const ratingText = ratingTexts[(value || 0) as keyof typeof ratingTexts] || '';
                  
                  // Update rating text display
                  const ratingTextElement = document.querySelector('.rating-text');
                  if (ratingTextElement) {
                    ratingTextElement.textContent = ratingText;
                    ratingTextElement.className = `rating-text mt-2 text-sm font-medium ${
                      (value || 0) <= 2 ? 'text-red-500' :
                      (value || 0) === 3 ? 'text-yellow-500' :
                      'text-green-500'
                    }`;
                  }
                }}
              />
              <div className="rating-text mt-2 text-gray-500 text-sm">Click to rate</div>
            </div>
          </Form.Item>

          {/* Review Comment */}
          <Form.Item
            label={<span className="text-gray-700 font-medium">Your Comment</span>}
            name="comment"
          >
            <Input.TextArea
              rows={4}
              placeholder="Share your experience about this product..."
              className="resize-none"
            />
          </Form.Item>

          {/* Image Upload */}
          <Form.Item
            label={<span className="text-gray-700 font-medium">Add Images (Optional)</span>}
          >
            <div className="space-y-2">
              <Upload
                listType="picture-card"
                fileList={reviewImages.map((file, index) => ({
                  uid: index.toString(),
                  name: file.name,
                  status: 'done' as const,
                  url: URL.createObjectURL(file)
                }))}
                beforeUpload={handleImageUpload}
                onRemove={(file) => {
                  const index = parseInt(file.uid);
                  if (!isNaN(index) && reviewImages[index]) {
                    removeReviewImage(reviewImages[index]);
                  }
                }}
              >
                {reviewImages.length < 5 && (
                  <div className="text-center">
                    <CameraOutlined className="text-2xl text-gray-400 mb-2" />
                    <div className="text-sm text-gray-500">Add Image</div>
                  </div>
                )}
              </Upload>
              <div className="text-xs text-gray-400">
                📸 Maximum 5 images, max 5MB each
              </div>
            </div>
          </Form.Item>

          {/* Video Upload */}
          <Form.Item
            label={<span className="text-gray-700 font-medium">Add Videos (Optional)</span>}
          >
            <div className="space-y-2">
              <Upload
                listType="picture-card"
                fileList={reviewVideos.map((file, index) => ({
                  uid: index.toString(),
                  name: file.name,
                  status: 'done' as const,
                  url: URL.createObjectURL(file)
                }))}
                beforeUpload={handleVideoUpload}
                onRemove={(file) => {
                  const index = parseInt(file.uid);
                  if (!isNaN(index) && reviewVideos[index]) {
                    removeReviewVideo(reviewVideos[index]);
                  }
                }}
                accept="video/*"
              >
                {reviewVideos.length < 2 && (
                  <div className="text-center">
                    <VideoCameraOutlined className="text-2xl text-gray-400 mb-2" />
                    <div className="text-sm text-gray-500">Add Video</div>
                  </div>
                )}
              </Upload>
              <div className="text-xs text-gray-400">
                🎥 Maximum 2 videos, max 50MB each
              </div>
            </div>
          </Form.Item>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={() => setFeedbackModalOpen(false)}
              className="flex-1 h-12 text-gray-600 border-gray-300 hover:border-gray-400"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 border-0 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              ⭐ Submit Review
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Return Request Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-3 pb-4 border-b">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">Request Return</div>
              <div className="text-sm text-gray-500">Submit a return request for this order</div>
            </div>
          </div>
        }
        open={returnRequestModalOpen}
        onCancel={() => {
          setReturnRequestModalOpen(false);
          returnRequestForm.resetFields();
          setReturnImages([]);
        }}
        footer={null}
        width={700}
        className="return-request-modal"
      >
        <Form
          form={returnRequestForm}
          layout="vertical"
          onFinish={handleSubmitReturnRequest}
          className="mt-6"
        >
          {/* Order Summary */}
          <div className="bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <Text strong className="text-red-800">Return Request Information</Text>
                <div className="text-sm text-red-600">
                  Return window: {(() => {
                    const deliveredHistory = order?.statusHistories?.find(h => h.toStatus === 'DELIVERED');
                    if (deliveredHistory && canReturnOrder()) {
                      const deliveredDate = new Date(deliveredHistory.changedAt);
                      const currentDate = new Date();
                      const daysRemaining = Math.ceil(3 - (currentDate.getTime() - deliveredDate.getTime()) / (1000 * 3600 * 24));
                      return `${daysRemaining} days remaining`;
                    }
                    return 'Return period expired';
                  })()}
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border">
              <div className="flex items-center space-x-3 mb-2">
                <Avatar 
                  src={order?.shopAvatar && order?.shopAvatar.trim() !== '' ? order?.shopAvatar : null} 
                  size="small" 
                  icon={<ShopOutlined />} 
                />
                <Text strong className="text-gray-800">{order?.shopName}</Text>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {order?.items.map(item => (
                  <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg">
                    <Image
                      src={item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=center'}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=center';
                      }}
                    />
                    <div className="flex-1">
                      <Text className="text-sm font-medium text-gray-800">{item.name}</Text>
                      <div className="text-xs text-gray-500">{item.variant}</div>
                      <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Return Reason */}
          <Form.Item
            label={<span className="text-gray-700 font-medium">Reason for Return</span>}
            name="reason"
            rules={[
              { required: true, message: 'Please provide a reason for return!' },
              { min: 10, message: 'Reason must be at least 10 characters long!' }
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Please describe why you want to return this order (e.g., damaged items, wrong product, not as described, etc.)"
              className="resize-none"
              showCount
              maxLength={500}
            />
          </Form.Item>

          {/* Common Return Reasons */}
          <Form.Item label={<span className="text-gray-700 font-medium">Common Reasons (Optional)</span>}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { key: 'damaged', label: '📦 Damaged Product', reason: 'Product arrived damaged or broken' },
                { key: 'wrong', label: '❌ Wrong Item', reason: 'Received wrong product or variant' },
                { key: 'quality', label: '⭐ Poor Quality', reason: 'Product quality is not as expected' },
                { key: 'description', label: '📝 Not as Described', reason: 'Product does not match description or photos' },
                { key: 'size', label: '📏 Size Issue', reason: 'Product size or fit is incorrect' },
                { key: 'defective', label: '🔧 Defective', reason: 'Product has manufacturing defects or does not work properly' }
              ].map(reason => (
                <Button
                  key={reason.key}
                  type="default"
                  size="small"
                  className="h-auto py-2 px-2 text-xs border-gray-300 hover:border-red-400 hover:text-red-600 hover:bg-red-50 rounded text-left"
                  onClick={() => returnRequestForm.setFieldsValue({ reason: reason.reason })}
                >
                  {reason.label}
                </Button>
              ))}
            </div>
          </Form.Item>

          {/* Evidence Photos */}
          <Form.Item
            label={<span className="text-gray-700 font-medium">Evidence Photos (Required)</span>}
            name="photos"
            valuePropName="fileList"
            rules={[
              { 
                required: true, 
                message: 'Please upload at least one photo as evidence!',
                validator: (_, value) => {
                  if (returnImages.length === 0) {
                    return Promise.reject(new Error('Please upload at least one photo as evidence!'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Upload
              listType="picture-card"
              maxCount={5}
              multiple
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('You can only upload image files!');
                  return false;
                }
                
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error('Image must be smaller than 5MB!');
                  return false;
                }

                const newImages = [...returnImages, file];
                setReturnImages(newImages);
                
                // Update form field to trigger validation
                returnRequestForm.setFieldsValue({ 
                  photos: newImages.map((f, index) => ({
                    uid: `${f.name}-${index}`,
                    name: f.name,
                    status: 'done',
                    url: URL.createObjectURL(f)
                  }))
                });
                
                return false; // Prevent auto upload
              }}
              onRemove={(file) => {
                const fileName = file.name || '';
                const newImages = returnImages.filter(item => item.name !== fileName);
                setReturnImages(newImages);
                
                // Update form field to trigger validation
                returnRequestForm.setFieldsValue({ 
                  photos: newImages.map((f, index) => ({
                    uid: `${f.name}-${index}`,
                    name: f.name,
                    status: 'done',
                    url: URL.createObjectURL(f)
                  }))
                });
              }}
              fileList={returnImages.map((file, index) => ({
                uid: `${file.name}-${index}`,
                name: file.name,
                status: 'done' as const,
                url: URL.createObjectURL(file)
              }))}
            >
              {returnImages.length >= 5 ? null : (
                <div className="text-center">
                  <CameraOutlined className="text-2xl text-gray-400 mb-2" />
                  <div className="text-sm text-gray-500">Upload Photo</div>
                </div>
              )}
            </Upload>
            <div className="text-xs text-gray-400 mt-2">
              📸 Upload clear photos showing the issue (max 5 photos, 5MB each)
              <br />• Product damage or defects
              <br />• Wrong items received  
              <br />• Packaging condition
            </div>
          </Form.Item>

          {/* Return Policy Notice */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="text-sm font-medium text-yellow-800">Return Policy</div>
                <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                  <li>• Returns must be requested within 3 days of delivery</li>
                  <li>• Items must be in original condition with tags attached</li>
                  <li>• Clear photos showing the issue are required</li>
                  <li>• Processing time: 3-5 business days after approval</li>
                  <li>• Refund will be processed to original payment method</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={() => {
                setReturnRequestModalOpen(false);
                returnRequestForm.resetFields();
                setReturnImages([]);
              }}
              className="flex-1 h-12 text-gray-600 border-gray-300 hover:border-gray-400"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              className="flex-1 h-12 bg-gradient-to-r from-red-500 to-pink-600 border-0 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🔄 Submit Return Request
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
